import fs from 'fs'
import path from 'path'

interface JsonSchema {
  [key: string]: any
}

interface RefCache {
  [url: string]: JsonSchema
}

export class SchemaResolver {
  private refCache: RefCache = {}
  private schemaDir: string
  private rootDocument: JsonSchema | null = null

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

    const [beforeHash = ''] = refUrl.split('#')
    const [cleanedRef = ''] = beforeHash.split('?')

    if (!cleanedRef.endsWith('.json')) {
      return null
    }

    if (!cleanedRef.includes('/')) {
      return cleanedRef
    }

    return path.posix.basename(cleanedRef)
  }

  private isExternalSchemaRef(refUrl: string): boolean {
    // Check if this is a reference to an external schema file (not internal #/ references)
    return refUrl.includes('.json') && !refUrl.startsWith('#')
  }

  private isInternalRef(refUrl: string): boolean {
    // Check if this is an internal JSON pointer reference
    return refUrl.startsWith('#/')
  }

  private resolveJsonPointer(pointer: string): JsonSchema | null {
    if (!this.rootDocument) {
      return null
    }

    // Remove leading '#/' and split path
    const path = pointer.replace(/^#\//, '').split('/')

    let current: any = this.rootDocument
    for (const segment of path) {
      // Decode URI-encoded segments
      const decodedSegment = decodeURIComponent(segment)

      if (current === null || current === undefined) {
        return null
      }

      current = current[decodedSegment]
    }

    return current
  }

  private hasSelfReference(schema: any, refPointer: string): boolean {
    // Check if this specific schema directly references itself
    if (!schema || typeof schema !== 'object') {
      return false
    }

    // Check if this object has a $ref that matches refPointer
    if (schema.$ref === refPointer) {
      return true
    }

    // Recursively check properties, but only for $refs that exactly match
    if (Array.isArray(schema)) {
      return schema.some(item => this.hasSelfReference(item, refPointer))
    }

    // Check all values in the object
    for (const value of Object.values(schema)) {
      if (value && typeof value === 'object') {
        // If this value is an object with a $ref matching our pointer, it's a self-ref
        if ('$ref' in value && value.$ref === refPointer) {
          return true
        }
        // Recursively check nested structures
        if (this.hasSelfReference(value, refPointer)) {
          return true
        }
      }
    }

    return false
  }

  private resolveInternalRef(refPointer: string, visitedRefs: Set<string>): JsonSchema {
    // Detect circular references BEFORE checking cache
    if (visitedRefs.has(refPointer)) {
      console.warn(`Circular internal reference detected: ${refPointer}`)
      return { $ref: refPointer }
    }

    // Check if we've already resolved this internal reference
    if (this.refCache[refPointer]) {
      return this.refCache[refPointer]
    }

    const resolved = this.resolveJsonPointer(refPointer)

    if (!resolved) {
      console.warn(`Could not resolve internal reference: ${refPointer}`)
      return { $ref: refPointer }
    }

    // Check if this schema references itself - if so, preserve the ref to avoid expansion
    if (this.hasSelfReference(resolved, refPointer)) {
      console.warn(`Self-referencing schema detected: ${refPointer}`)
      return { $ref: refPointer }
    }

    visitedRefs.add(refPointer)

    // Recursively resolve any nested references
    const fullyResolved = this.resolveAllRefs(resolved, visitedRefs)

    // Cache the fully resolved schema
    this.refCache[refPointer] = fullyResolved

    // Remove from visited - we're done with this resolution path
    visitedRefs.delete(refPointer)

    return fullyResolved
  }

  private resolveRef(refUrl: string, visitedRefs: Set<string>): JsonSchema {
    // Check if we've already loaded this schema
    if (this.refCache[refUrl]) {
      return this.refCache[refUrl]
    }

    // Detect circular references
    if (visitedRefs.has(refUrl)) {
      console.warn(`Circular reference detected: ${refUrl}`)
      return { $ref: refUrl }
    }

    visitedRefs.add(refUrl)

    // Extract filename from URL
    const fileName = this.extractSchemaFileName(refUrl)

    if (!fileName) {
      console.warn(`Could not extract filename from: ${refUrl}`)
      visitedRefs.delete(refUrl)
      return { $ref: refUrl }
    }

    try {
      const schema = this.loadLocalSchema(fileName)

      // Cache the schema before resolving its refs to handle circular dependencies
      this.refCache[refUrl] = schema

      // Recursively resolve all $ref in this schema
      const resolved = this.resolveAllRefs(schema, visitedRefs)
      this.refCache[refUrl] = resolved

      visitedRefs.delete(refUrl)
      return resolved
    } catch (error) {
      console.error(`Error loading schema ${fileName}:`, error)
      visitedRefs.delete(refUrl)
      return { $ref: refUrl }
    }
  }

  private resolveAllRefs(obj: any, visitedRefs: Set<string>): any {
    if (obj === null || typeof obj !== 'object') {
      return obj
    }

    if (Array.isArray(obj)) {
      return obj.map(item => this.resolveAllRefs(item, visitedRefs))
    }

    // If this object has a $ref, resolve it
    if (obj.$ref && typeof obj.$ref === 'string') {
      let resolved: JsonSchema

      if (this.isExternalSchemaRef(obj.$ref)) {
        // Resolve external file reference
        resolved = this.resolveRef(obj.$ref, visitedRefs)
      } else if (this.isInternalRef(obj.$ref)) {
        // Resolve internal JSON pointer reference
        resolved = this.resolveInternalRef(obj.$ref, visitedRefs)
      } else {
        // Keep the reference as-is if we can't identify it
        return obj
      }

      // Merge other properties if they exist (besides $ref)
      const { $ref, ...rest } = obj
      return Object.keys(rest).length > 0
        ? { ...resolved, ...this.resolveAllRefs(rest, visitedRefs) }
        : resolved
    }

    // Otherwise, recursively resolve all properties
    const result: JsonSchema = {}
    for (const [key, value] of Object.entries(obj)) {
      result[key] = this.resolveAllRefs(value, visitedRefs)
    }
    return result
  }

  public resolve(schema: JsonSchema): JsonSchema {
    // Reset state for each resolution
    this.refCache = {}
    this.rootDocument = schema
    // Pass a new Set to track the current resolution path
    return this.resolveAllRefs(schema, new Set<string>())
  }
}
