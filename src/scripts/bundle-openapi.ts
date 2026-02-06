import fs from 'fs'
import path from 'path'

interface JsonSchema {
  [key: string]: any
}

interface RefCache {
  [url: string]: JsonSchema
}

const LOCAL_SCHEMA_DIR = path.join(process.cwd(), 'public/specifications/3.0/schemata')

const refCache: RefCache = {}
const visitedRefs = new Set<string>()

function loadLocalSchema(fileName: string): JsonSchema {
  const filePath = path.join(LOCAL_SCHEMA_DIR, fileName)
  const content = fs.readFileSync(filePath, 'utf-8')
  return JSON.parse(content)
}

function extractSchemaFileName(refUrl: string): string | null {
  // Handle various URL patterns:
  // - https://openreferraluk.org/specifications/3.0/schemata/service.json
  // - http://localhost:3000/specifications/3.0/schemata/service.json
  // - ./schemata/service.json
  // - service.json

  if (refUrl.includes('/schemata/')) {
    const match = refUrl.match(/\/schemata\/([^/]+\.json)/)
    return match ? match[1] : null
  }

  if (refUrl.endsWith('.json') && !refUrl.includes('/')) {
    return refUrl
  }

  return null
}

function isExternalSchemaRef(refUrl: string): boolean {
  // Check if this is a reference to an external schema file (not internal #/components references)
  return refUrl.includes('.json') && !refUrl.startsWith('#')
}

function resolveRef(refUrl: string): JsonSchema {
  // Check if we've already loaded this schema
  if (refCache[refUrl]) {
    return refCache[refUrl]
  }

  // Detect circular references
  if (visitedRefs.has(refUrl)) {
    // Return a reference for circular dependencies
    console.warn(`Circular reference detected: ${refUrl}`)
    return { $ref: refUrl }
  }

  visitedRefs.add(refUrl)

  // Extract filename from URL
  const fileName = extractSchemaFileName(refUrl)

  if (!fileName) {
    console.warn(`Could not extract filename from: ${refUrl}`)
    visitedRefs.delete(refUrl)
    return { $ref: refUrl }
  }

  try {
    const schema = loadLocalSchema(fileName)

    // Cache the schema before resolving its refs to handle circular dependencies
    refCache[refUrl] = schema

    // Recursively resolve all $ref in this schema
    const resolved = resolveAllRefs(schema)
    refCache[refUrl] = resolved

    visitedRefs.delete(refUrl)
    return resolved
  } catch (error) {
    console.error(`Error loading schema ${fileName}:`, error)
    visitedRefs.delete(refUrl)
    return { $ref: refUrl }
  }
}

function resolveAllRefs(obj: any): any {
  if (obj === null || typeof obj !== 'object') {
    return obj
  }

  if (Array.isArray(obj)) {
    return obj.map(item => resolveAllRefs(item))
  }

  // If this object has a $ref, resolve it if it's an external schema
  if (obj.$ref && typeof obj.$ref === 'string' && isExternalSchemaRef(obj.$ref)) {
    const resolved = resolveRef(obj.$ref)
    // Merge other properties if they exist (besides $ref)
    const { $ref, ...rest } = obj
    return Object.keys(rest).length > 0 ? { ...resolved, ...resolveAllRefs(rest) } : resolved
  }

  // Otherwise, recursively resolve all properties
  const result: JsonSchema = {}
  for (const [key, value] of Object.entries(obj)) {
    result[key] = resolveAllRefs(value)
  }
  return result
}

function bundleOpenAPI() {
  const openApiPath = path.join(process.cwd(), 'public/specifications/3.0/openapi.json')
  const outputPath = path.join(process.cwd(), 'public/specifications/3.0/openapi.bundled.json')

  console.log('Loading OpenAPI specification...')
  const openApiContent = fs.readFileSync(openApiPath, 'utf-8')
  const openApi = JSON.parse(openApiContent)

  console.log('Resolving all schema references...')
  const bundled = resolveAllRefs(openApi)

  console.log('Writing bundled OpenAPI specification...')
  fs.writeFileSync(outputPath, JSON.stringify(bundled, null, 2))

  console.log(`✅ Bundled OpenAPI saved to: ${outputPath}`)
  console.log(`📊 Resolved ${Object.keys(refCache).length} unique schema references`)
}

// Run the bundler
bundleOpenAPI()
