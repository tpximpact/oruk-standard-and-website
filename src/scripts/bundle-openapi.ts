import fs from 'fs'
import path from 'path'

interface JsonSchema {
  [key: string]: any
}

interface RefCache {
  [url: string]: JsonSchema
}

class OpenAPIBundler {
  private refCache: RefCache = {}
  private visitedRefs = new Set<string>()
  private schemaDir: string

  constructor(schemaDir: string) {
    this.schemaDir = schemaDir
  }

  private loadLocalSchema(fileName: string): JsonSchema {
    const filePath = path.join(this.schemaDir, fileName)
    const content = fs.readFileSync(filePath, 'utf-8')
    return JSON.parse(content)
  }

  private extractSchemaFileName(refUrl: string): string | null {
    // Handle various URL patterns:
    // - https://openreferraluk.org/specifications/3.0/schema/service.json
    // - http://localhost:3000/specifications/3.0/schema/service.json
    // - ./schemata/service.json
    // - service.json

    if (refUrl.includes('/schema/')) {
      const match = refUrl.match(/\/schema\/([^/]+\.json)/)
      return match?.[1] ?? null
    }

    if (refUrl.endsWith('.json') && !refUrl.includes('/')) {
      return refUrl
    }

    return null
  }

  private isExternalSchemaRef(refUrl: string): boolean {
    // Check if this is a reference to an external schema file (not internal #/components references)
    return refUrl.includes('.json') && !refUrl.startsWith('#')
  }

  private resolveRef(refUrl: string): JsonSchema {
    // Check if we've already loaded this schema
    if (this.refCache[refUrl]) {
      return this.refCache[refUrl]
    }

    // Detect circular references
    if (this.visitedRefs.has(refUrl)) {
      // Return a reference for circular dependencies
      console.warn(`  ⚠️  Circular reference detected: ${refUrl}`)
      return { $ref: refUrl }
    }

    this.visitedRefs.add(refUrl)

    // Extract filename from URL
    const fileName = this.extractSchemaFileName(refUrl)

    if (!fileName) {
      console.warn(`  ⚠️  Could not extract filename from: ${refUrl}`)
      this.visitedRefs.delete(refUrl)
      return { $ref: refUrl }
    }

    try {
      const schema = this.loadLocalSchema(fileName)

      // Cache the schema before resolving its refs to handle circular dependencies
      this.refCache[refUrl] = schema

      // Recursively resolve all $ref in this schema
      const resolved = this.resolveAllRefs(schema)
      this.refCache[refUrl] = resolved

      this.visitedRefs.delete(refUrl)
      return resolved
    } catch (error) {
      console.error(`  ❌ Error loading schema ${fileName}:`, error)
      this.visitedRefs.delete(refUrl)
      return { $ref: refUrl }
    }
  }

  private resolveAllRefs(obj: any): any {
    if (obj === null || typeof obj !== 'object') {
      return obj
    }

    if (Array.isArray(obj)) {
      return obj.map(item => this.resolveAllRefs(item))
    }

    // If this object has a $ref, resolve it if it's an external schema
    if (obj.$ref && typeof obj.$ref === 'string' && this.isExternalSchemaRef(obj.$ref)) {
      const resolved = this.resolveRef(obj.$ref)
      // Merge other properties if they exist (besides $ref)
      const { $ref, ...rest } = obj
      return Object.keys(rest).length > 0 ? { ...resolved, ...this.resolveAllRefs(rest) } : resolved
    }

    // Otherwise, recursively resolve all properties
    const result: JsonSchema = {}
    for (const [key, value] of Object.entries(obj)) {
      result[key] = this.resolveAllRefs(value)
    }
    return result
  }

  public bundle(openApiPath: string, outputPath: string): void {
    console.log(
      `  📄 Loading ${path.basename(path.dirname(openApiPath))}/${path.basename(openApiPath)}...`
    )
    const openApiContent = fs.readFileSync(openApiPath, 'utf-8')
    const openApi = JSON.parse(openApiContent)

    console.log('  🔄 Resolving all schema references...')
    const bundled = this.resolveAllRefs(openApi)

    console.log('  💾 Writing bundled OpenAPI specification...')
    fs.writeFileSync(outputPath, JSON.stringify(bundled, null, 2))

    console.log(
      `  ✅ Bundled OpenAPI saved to: ${path.basename(path.dirname(outputPath))}/${path.basename(outputPath)}`
    )
    console.log(`  📊 Resolved ${Object.keys(this.refCache).length} unique schema references`)
  }
}

function findSpecificationVersions(): string[] {
  const specificationsDir = path.join(process.cwd(), 'public/specifications')

  if (!fs.existsSync(specificationsDir)) {
    console.error(`❌ Specifications directory not found: ${specificationsDir}`)
    return []
  }

  const entries = fs.readdirSync(specificationsDir, { withFileTypes: true })
  const versions: string[] = []

  for (const entry of entries) {
    if (entry.isDirectory()) {
      const versionDir = path.join(specificationsDir, entry.name)
      const openApiPath = path.join(versionDir, 'openapi.json')
      const schemaDir = path.join(versionDir, 'schema')

      // Check if this version has both openapi.json and schemata/ folder
      if (fs.existsSync(openApiPath) && fs.existsSync(schemaDir)) {
        versions.push(entry.name)
      }
    }
  }

  return versions.sort()
}

function bundleAllVersions() {
  console.log('🚀 Starting OpenAPI bundling process...\n')

  const versions = findSpecificationVersions()

  if (versions.length === 0) {
    console.error('❌ No valid specification versions found!')
    console.error('   Each version must have both openapi.json and schema/ folder')
    process.exit(1)
  }

  console.log(`📦 Found ${versions.length} specification version(s): ${versions.join(', ')}\n`)

  for (const version of versions) {
    console.log(`\n🔨 Bundling version ${version}:`)
    console.log('━'.repeat(50))

    const versionDir = path.join(process.cwd(), 'public/specifications', version)
    const schemaDir = path.join(versionDir, 'schema')
    const openApiPath = path.join(versionDir, 'openapi.json')
    const outputPath = path.join(versionDir, 'openapi.bundled.json')

    try {
      const bundler = new OpenAPIBundler(schemaDir)
      bundler.bundle(openApiPath, outputPath)
    } catch (error) {
      console.error(`\n❌ Failed to bundle version ${version}:`, error)
      process.exit(1)
    }
  }

  console.log('\n' + '━'.repeat(50))
  console.log(`\n✨ Successfully bundled ${versions.length} version(s)!\n`)
}

// Run the bundler
bundleAllVersions()
