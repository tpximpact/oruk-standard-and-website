import { describe, it, expect } from 'vitest'
import { SchemaResolver } from '../SchemaResolver'
import path from 'path'

describe('SchemaResolver', () => {
  it('should resolve external schema references', () => {
    const schemaDir = path.join(process.cwd(), 'public/specifications/3.0/schema')
    const resolver = new SchemaResolver(schemaDir)

    const testSchema = {
      type: 'object',
      properties: {
        service: {
          $ref: 'https://openreferraluk.org/specifications/3.0/schema/service.json'
        }
      }
    }

    const resolved = resolver.resolve(testSchema)

    // The resolved schema should have the service definition inline
    expect(resolved.properties.service).toBeDefined()
    expect(resolved.properties.service.name).toBe('service')
    expect(resolved.properties.service.type).toBe('object')
    // Should not have $ref anymore (it's been resolved)
    expect(resolved.properties.service.$ref).toBeUndefined()
  })

  it('should handle nested schema references', () => {
    const schemaDir = path.join(process.cwd(), 'public/specifications/3.0/schema')
    const resolver = new SchemaResolver(schemaDir)

    const testSchema = {
      $ref: 'https://openreferraluk.org/specifications/3.0/schema/service.json'
    }

    const resolved = resolver.resolve(testSchema)

    // Should have resolved the service schema
    expect(resolved.name).toBe('service')
    expect(resolved.properties).toBeDefined()

    // Should have also resolved nested references like organization
    expect(resolved.properties.organization).toBeDefined()
    // The nested organization should be fully resolved, not a $ref
    if (resolved.properties.organization.$ref) {
      // If it still has a $ref, it means there was an issue
      expect(resolved.properties.organization.$ref).toBeUndefined()
    }
  })

  it('should preserve internal references', () => {
    const schemaDir = path.join(process.cwd(), 'public/specifications/3.0/schema')
    const resolver = new SchemaResolver(schemaDir)

    const testSchema = {
      type: 'object',
      properties: {
        internalRef: {
          $ref: '#/components/schemas/SomeSchema'
        },
        externalRef: {
          $ref: 'https://openreferraluk.org/specifications/3.0/schema/attribute.json'
        }
      }
    }

    const resolved = resolver.resolve(testSchema)

    // Internal references should be preserved
    expect(resolved.properties.internalRef.$ref).toBe('#/components/schemas/SomeSchema')

    // External references should be resolved
    expect(resolved.properties.externalRef.$ref).toBeUndefined()
    expect(resolved.properties.externalRef.name).toBe('attribute')
  })
  it('should resolve internal JSON pointer references', () => {
    const schemaDir = path.join(process.cwd(), 'public/specifications/3.0/schema')
    const resolver = new SchemaResolver(schemaDir)

    const testSchema = {
      components: {
        schemas: {
          Person: {
            type: 'object',
            properties: {
              name: { type: 'string' }
            }
          },
          Employee: {
            type: 'object',
            properties: {
              person: {
                $ref: '#/components/schemas/Person'
              },
              employeeId: { type: 'string' }
            }
          }
        }
      },
      paths: {
        '/employees': {
          get: {
            responses: {
              '200': {
                content: {
                  'application/json': {
                    schema: {
                      $ref: '#/components/schemas/Employee'
                    }
                  }
                }
              }
            }
          }
        }
      }
    }

    const resolved = resolver.resolve(testSchema)

    // Internal references should be resolved
    const employeeSchema =
      resolved.paths['/employees'].get.responses['200'].content['application/json'].schema
    expect(employeeSchema.$ref).toBeUndefined()
    expect(employeeSchema.properties.person.$ref).toBeUndefined()
    expect(employeeSchema.properties.person.type).toBe('object')
    expect(employeeSchema.properties.person.properties.name.type).toBe('string')
  })

  it('should resolve mixed internal and external references', () => {
    const schemaDir = path.join(process.cwd(), 'public/specifications/3.0/schema')
    const resolver = new SchemaResolver(schemaDir)

    const testSchema = {
      components: {
        schemas: {
          ServiceDetails: {
            type: 'object',
            properties: {
              attribute: {
                $ref: 'https://openreferraluk.org/specifications/3.0/schema/attribute.json'
              }
            }
          }
        }
      },
      paths: {
        '/services': {
          get: {
            responses: {
              '200': {
                schema: {
                  $ref: '#/components/schemas/ServiceDetails'
                }
              }
            }
          }
        }
      }
    }

    const resolved = resolver.resolve(testSchema)

    // Both internal and external references should be resolved
    const serviceSchema = resolved.paths['/services'].get.responses['200'].schema
    expect(serviceSchema.$ref).toBeUndefined()
    expect(serviceSchema.type).toBe('object')
    expect(serviceSchema.properties.attribute.name).toBe('attribute')
    expect(serviceSchema.properties.attribute.$ref).toBeUndefined()
  })

  it('should handle circular internal references', () => {
    const schemaDir = path.join(process.cwd(), 'public/specifications/3.0/schema')
    const resolver = new SchemaResolver(schemaDir)

    const testSchema = {
      components: {
        schemas: {
          Node: {
            type: 'object',
            properties: {
              value: { type: 'string' },
              children: {
                type: 'array',
                items: {
                  $ref: '#/components/schemas/Node'
                }
              }
            }
          }
        }
      }
    }

    const resolved = resolver.resolve(testSchema)

    // Circular reference should be preserved to prevent infinite recursion
    expect(resolved.components.schemas.Node.properties.children.items.$ref).toBe(
      '#/components/schemas/Node'
    )
  })
  it('should handle multiple URL patterns', () => {
    const schemaDir = path.join(process.cwd(), 'public/specifications/3.0/schema')
    const resolver = new SchemaResolver(schemaDir)

    const patterns = [
      'https://openreferraluk.org/specifications/3.0/schema/attribute.json',
      'http://localhost:3000/specifications/3.0/schema/attribute.json',
      './schema/attribute.json',
      'attribute.json'
    ]

    patterns.forEach(pattern => {
      const testSchema = { $ref: pattern }
      const resolved = resolver.resolve(testSchema)

      expect(resolved.name).toBe('attribute')
      expect(resolved.$ref).toBeUndefined()
    })
  })
})
