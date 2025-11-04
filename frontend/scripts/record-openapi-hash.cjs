/* Genera/actualiza un archivo con el hash actual de openapi.json para comparar en runtime */
const { readFileSync, writeFileSync } = require('fs')
const { createHash } = require('crypto')
const { resolve } = require('path')

const openapiPath = resolve(__dirname, '..', '..', 'openapi.json')
const outPath = resolve(__dirname, '..', 'src', 'openapi-hash.json')

const data = readFileSync(openapiPath)
const hash = createHash('sha256').update(data).digest('hex')
writeFileSync(outPath, JSON.stringify({ hash }, null, 2))
console.log('Hash OpenAPI registrado:', hash)
