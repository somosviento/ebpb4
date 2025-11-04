/*
  Script simple para generar tipos TS desde openapi.json sin dependencias externas pesadas.
  Uso: npx ts-node scripts/generate-types.ts (o agregar script en package.json)
*/
import { readFileSync, writeFileSync } from 'fs'
import { resolve } from 'path'

type SchemaObject = any

const openapiPath = resolve(__dirname, '..', '..', 'openapi.json')
let specRaw: string
try { specRaw = readFileSync(openapiPath, 'utf-8') } catch (e) {
  console.error('No se pudo leer openapi.json en', openapiPath)
  process.exit(1)
}
const spec = JSON.parse(specRaw)
const schemas: Record<string, SchemaObject> = spec.components?.schemas || {}

function tsTypeFromSchema(s: any): string {
  if (!s) return 'any'
  if (s.$ref) {
    const name = s.$ref.split('/').pop()
    return name || 'any'
  }
  if (s.anyOf) {
    return s.anyOf.map((x: any) => tsTypeFromSchema(x)).join(' | ')
  }
  if (s.type === 'array') {
    return (s.items ? tsTypeFromSchema(s.items) : 'any') + '[]'
  }
  if (s.type === 'integer' || s.type === 'number') return 'number'
  if (s.type === 'boolean') return 'boolean'
  if (s.type === 'string') {
    if (s.enum) return s.enum.map((v: string) => JSON.stringify(v)).join(' | ')
    return 'string'
  }
  if (s.type === 'object') {
    const props = s.properties || {}
    const req: string[] = s.required || []
    const entries = Object.entries(props).map(([k, v]: [string, any]) => {
      const optional = req.includes(k) ? '' : '?'
      return `  ${k}${optional}: ${tsTypeFromSchema(v)};`
    })
    return `{
${entries.join('\n')}
}`
  }
  return 'any'
}

function generateInterface(name: string, schema: any): string {
  if (schema.type === 'object' || schema.properties || schema.anyOf || schema.$ref) {
    if (schema.enum) {
      return `export type ${name} = ${schema.enum.map((v: string) => JSON.stringify(v)).join(' | ')};`
    }
    if (schema.type === 'object' || schema.properties) {
      const props = schema.properties || {}
      const req: string[] = schema.required || []
      const lines = Object.entries(props).map(([prop, propSchema]: [string, any]) => {
        const optional = req.includes(prop) ? '' : '?'
        return `  ${prop}${optional}: ${tsTypeFromSchema(propSchema)};`
      })
      return `export interface ${name} {
${lines.join('\n')}
}`
    }
    if (schema.anyOf) {
      return `export type ${name} = ${schema.anyOf.map((x: any) => tsTypeFromSchema(x)).join(' | ')};`
    }
    if (schema.$ref) {
      return `export type ${name} = ${tsTypeFromSchema(schema)};`
    }
  }
  return `// Omitido ${name}`
}

const allowList = [
  'SolicitudInvestigacionCreate',
  'SolicitudCatedrasCreate',
  'SolicitudOut',
  'ParticipanteCreate',
  'ParticipanteOut',
  'ParticipanteReservaOut',
  'ReservaDetalleCreate',
  'ReservaDiariaOut',
  'ValidationError',
  'HTTPValidationError',
  'SolicitudParticipanteOut'
]

const out: string[] = []
out.push('// Archivo generado automáticamente. NO editar a mano.')
out.push('// Fuente: openapi.json')
out.push('')

for (const name of allowList) {
  const schema = schemas[name]
  if (!schema) {
    out.push(`// Aviso: schema ${name} no encontrado en openapi.json`)
    continue
  }
  out.push(generateInterface(name, schema))
  out.push('')
}

const target = resolve(__dirname, '..', 'src', 'generated-types.ts')
writeFileSync(target, out.join('\n'))
console.log('Tipos generados en', target)
