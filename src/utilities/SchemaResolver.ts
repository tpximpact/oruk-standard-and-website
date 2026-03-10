import fs from 'fs'
import path from 'path'

interface JsonSchema {
  [key: string]: any
}

interface RefCache {
  [url: string]: JsonSchema
}

interface ExternalRefParts {
  fileName: string
  fragment: string | null
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

  private extractExternalRefParts(refUrl: string): ExternalRefParts | null {
    // Handle various URL patterns:
    // - https://openreferraluk.org/specifications/3.0/schema/service.json
    // - http://localhost:3000/specifications/3.0/schema/service.json
    // - ./schemata/service.json
    // - service.json

    const [beforeHash = '', rawFragment = ''] = refUrl.split('#')
    const [cleanedRef = ''] = beforeHash.split('?')

    if (!cleanedRef.endsWith('.json')) {
      return null
    }

    const fileName = cleanedRef.includes('/') ? path.posix.basename(cleanedRef) : cleanedRef

    return {
      fileName,
      fragment: rawFragment || null
    }
  }

  private resolveFragment(document: JsonSchema, fragment: string | null): JsonSchema | null {
    if (!fragment) {
      return document
    }

    if (fragment.startsWith('/')) {
      let current: any = document

      for (const segment of fragment.replace(/^\//, '').split('/')) {
        const decodedSegment = decodeURIComponent(segment.replace(/~1/g, '/').replace(/~0/g, '~'))

        if (current === null || current === undefined) {
          return null
        }

        current = current[decodedSegment]
      }

      return current
    }

    for (const candidate of this.getFragmentCandidates(fragment)) {
      const anchoredSchema = this.findAnchor(document, candidate)
      if (anchoredSchema) {
        return anchoredSchema
      }

      const keyedSchema = this.findObjectByKey(document, candidate)
      if (keyedSchema) {
        return keyedSchema
      }
    }

    return null
  }

  private getFragmentCandidates(fragment: string): string[] {
    const withoutExtension = fragment.replace(/\.json$/i, '')
    const candidates = [
      fragment,
      withoutExtension,
      withoutExtension.replace(/_/g, '-'),
      withoutExtension.replace(/-/g, '_')
    ]

    return Array.from(new Set(candidates.filter(Boolean)))
  }

  private findAnchor(obj: any, anchor: string): JsonSchema | null {
    if (obj === null || typeof obj !== 'object') {
      return null
    }

    if (!Array.isArray(obj) && obj.$anchor === anchor) {
      return obj
    }

    if (Array.isArray(obj)) {
      for (const item of obj) {
        const resolved = this.findAnchor(item, anchor)
        if (resolved) {
          return resolved
        }
      }

      return null
    }

    for (const value of Object.values(obj)) {
      const resolved = this.findAnchor(value, anchor)
      if (resolved) {
        return resolved
      }
    }

    return null
  }

  private findObjectByKey(obj: any, key: string): JsonSchema | null {
    if (obj === null || typeof obj !== 'object') {
      return null
    }

    if (!Array.isArray(obj) && key in obj && this.isPlainObject(obj[key])) {
      return obj[key]
    }

    for (const value of Object.values(obj)) {
      const resolved = this.findObjectByKey(value, key)
      if (resolved) {
        return resolved
      }
    }

    return null
  }

  private isPlainObject(value: unknown): value is JsonSchema {
    return typeof value === 'object' && value !== null && !Array.isArray(value)
  }

  private mergeSchemaValues(baseValue: any, nextValue: any): any {
    if (Array.isArray(baseValue) && Array.isArray(nextValue)) {
      return Array.from(new Set([...baseValue, ...nextValue]))
    }

    if (this.isPlainObject(baseValue) && this.isPlainObject(nextValue)) {
      return this.mergeSchemas(baseValue, nextValue)
    }

    return nextValue
  }

  private mergeSchemas(baseSchema: JsonSchema, nextSchema: JsonSchema): JsonSchema {
    const merged: JsonSchema = { ...baseSchema }

    for (const [key, value] of Object.entries(nextSchema)) {
      if (!(key in merged)) {
        merged[key] = value
        continue
      }

      merged[key] = this.mergeSchemaValues(merged[key], value)
    }

    return merged
  }

  private mergeAllOf(schema: JsonSchema): JsonSchema {
    if (!this.isPlainObject(schema) || !Array.isArray(schema.allOf)) {
      return schema
    }

    const { allOf, ...rest } = schema
    const mergedAllOf = allOf.reduce<JsonSchema>((accumulator, entry) => {
      if (!this.isPlainObject(entry)) {
        return accumulator
      }

      return this.mergeSchemas(accumulator, entry)
    }, {})

    return this.mergeSchemas(mergedAllOf, rest)
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
    const refParts = this.extractExternalRefParts(refUrl)

    if (!refParts) {
      console.warn(`Could not extract filename from: ${refUrl}`)
      visitedRefs.delete(refUrl)
      return { $ref: refUrl }
    }

    try {
      const schema = this.loadLocalSchema(refParts.fileName)
      const referencedSchema = this.resolveFragment(schema, refParts.fragment)

      if (!referencedSchema) {
        console.warn(`Could not resolve fragment from: ${refUrl}`)
        visitedRefs.delete(refUrl)
        return { $ref: refUrl }
      }

      // Cache the schema before resolving its refs to handle circular dependencies
      this.refCache[refUrl] = referencedSchema

      // Recursively resolve all $ref in this schema
      const resolved = this.resolveAllRefs(referencedSchema, visitedRefs)
      this.refCache[refUrl] = resolved

      visitedRefs.delete(refUrl)
      return resolved
    } catch (error) {
      console.error(`Error loading schema ${refParts.fileName}:`, error)
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
      const merged =
        Object.keys(rest).length > 0
          ? { ...resolved, ...this.resolveAllRefs(rest, visitedRefs) }
          : resolved

      return this.mergeAllOf(merged)
    }

    // Otherwise, recursively resolve all properties
    const result: JsonSchema = {}
    for (const [key, value] of Object.entries(obj)) {
      result[key] = this.resolveAllRefs(value, visitedRefs)
    }

    return this.mergeAllOf(result)
  }

  public resolve(schema: JsonSchema): JsonSchema {
    // Reset state for each resolution
    this.refCache = {}
    this.rootDocument = schema
    // Pass a new Set to track the current resolution path
    return this.resolveAllRefs(schema, new Set<string>())
  }
}
