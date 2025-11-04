/* Script simple de generación de tipos desde openapi.json */
const { readFileSync, writeFileSync } = require('fs')
const { resolve } = require('path')

const openapiPath = resolve(__dirname, '..', '..', 'openapi.json')
let specRaw
try { specRaw = readFileSync(openapiPath, 'utf-8') } catch (e) {
  console.error('No se pudo leer openapi.json en', openapiPath)
  process.exit(1)
}
const spec = JSON.parse(specRaw)
const schemas = (spec.components && spec.components.schemas) || {}

function tsTypeFromSchema(s) {
  if (!s) return 'any'
  if (s.$ref) {
    const name = s.$ref.split('/').pop()
    return name || 'any'
  }
  if (s.anyOf) return s.anyOf.map(tsTypeFromSchema).join(' | ')
  if (s.type === 'array') {
    const inner = s.items ? tsTypeFromSchema(s.items) : 'any'
    const wrapped = inner.includes('|') && !inner.endsWith('[]') ? `(${inner})` : inner
    return wrapped + '[]'
  }
  if (s.type === 'integer' || s.type === 'number') return 'number'
  if (s.type === 'boolean') return 'boolean'
  if (s.type === 'null') return 'null'
  if (s.type === 'string') {
    if (s.enum) return s.enum.map(v => JSON.stringify(v)).join(' | ')
    return 'string'
  }
  if (s.type === 'object') {
    const props = s.properties || {}
    const req = s.required || []
    const lines = Object.entries(props).map(([k, v]) => {
      const optional = req.includes(k) ? '' : '?'
      return `  ${k}${optional}: ${tsTypeFromSchema(v)};`
    })
    return `{\n${lines.join('\n')}\n}`
  }
  return 'any'
}

function generateInterface(name, schema) {
  if (schema.enum) {
    return `export type ${name} = ${schema.enum.map(v => JSON.stringify(v)).join(' | ')};`
  }
  if (schema.type === 'object' || schema.properties) {
    const props = schema.properties || {}
    const req = schema.required || []
    const lines = Object.entries(props).map(([k, v]) => {
      const optional = req.includes(k) ? '' : '?'
      let t = tsTypeFromSchema(v)
      // Normalizar patrones string | any cuando hay nullables
      if (v && v.anyOf) {
        const hasNull = v.anyOf.some(x => x.type === 'null')
        if (hasNull) {
          const nonNulls = v.anyOf.filter(x => x.type !== 'null')
          const mapped = nonNulls.map(tsTypeFromSchema).join(' | ') || 'unknown'
          t = mapped + ' | null'
        }
      }
      t = t.replace(/\bstring \| any\b/g, 'string | null').replace(/\bboolean \| any\b/g, 'boolean | null')
      return `  ${k}${optional}: ${t};`
    })
    return `export interface ${name} {\n${lines.join('\n')}\n}`
  }
  if (schema.anyOf) {
    return `export type ${name} = ${schema.anyOf.map(tsTypeFromSchema).join(' | ')};`
  }
  if (schema.$ref) {
    return `export type ${name} = ${tsTypeFromSchema(schema)};`
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

const out = []
out.push('// Archivo generado automáticamente. NO editar a mano.')
out.push('// Fuente: openapi.json')
out.push('')

for (const name of allowList) {
  const schema = schemas[name]
  if (!schema) { out.push(`// Aviso: schema ${name} no encontrado`) ; continue }
  out.push(generateInterface(name, schema))
  out.push('')
}

const target = resolve(__dirname, '..', 'src', 'generated-types.ts')
writeFileSync(target, out.join('\n'))
console.log('Tipos generados en', target)
