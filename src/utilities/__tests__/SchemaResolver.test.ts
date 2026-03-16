import { describe, it, expect } from 'vitest'
import { SchemaResolver } from '../SchemaResolver'
import path from 'path'

const asRecord = (value: unknown): Record<string, unknown> =>
  (value && typeof value === 'object' ? value : {}) as Record<string, unknown>

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
    const resolvedProperties = asRecord(asRecord(resolved).properties)
    const service = asRecord(resolvedProperties.service)
    expect(service).toBeDefined()
    expect(service.name).toBe('service')
    expect(service.type).toBe('object')
    // Should not have $ref anymore (it's been resolved)
    expect(service.$ref).toBeUndefined()
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
    const resolvedProps = asRecord(resolved.properties)
    expect(resolvedProps.organization).toBeDefined()
    // The nested organization should be fully resolved, not a $ref
    const organization = asRecord(resolvedProps.organization)
    if (organization.$ref) {
      // If it still has a $ref, it means there was an issue
      expect(organization.$ref).toBeUndefined()
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
    const resolvedProps = asRecord(resolved.properties)
    const internalRef = asRecord(resolvedProps.internalRef)
    expect(internalRef.$ref).toBe('#/components/schemas/SomeSchema')

    // External references should be resolved
    const externalRef = asRecord(resolvedProps.externalRef)
    expect(externalRef.$ref).toBeUndefined()
    expect(externalRef.name).toBe('attribute')
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
    const resolvedPaths = asRecord(resolved.paths)
    const employeesPath = asRecord(resolvedPaths['/employees'])
    const getOp = asRecord(employeesPath.get)
    const responses = asRecord(getOp.responses)
    const response200 = asRecord(responses['200'])
    const content = asRecord(response200.content)
    const jsonContent = asRecord(content['application/json'])
    const employeeSchema = asRecord(jsonContent.schema)

    expect(employeeSchema.$ref).toBeUndefined()
    const employeeProps = asRecord(employeeSchema.properties)
    const person = asRecord(employeeProps.person)
    expect(person.$ref).toBeUndefined()
    expect(person.type).toBe('object')
    const personProps = asRecord(person.properties)
    const name = asRecord(personProps.name)
    expect(name.type).toBe('string')
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
    const resolvedPaths = asRecord(resolved.paths)
    const servicesPath = asRecord(resolvedPaths['/services'])
    const getOp = asRecord(servicesPath.get)
    const responses = asRecord(getOp.responses)
    const response200 = asRecord(responses['200'])
    const serviceSchema = asRecord(response200.schema)

    expect(serviceSchema.$ref).toBeUndefined()
    expect(serviceSchema.type).toBe('object')
    const serviceProps = asRecord(serviceSchema.properties)
    const attribute = asRecord(serviceProps.attribute)
    expect(attribute.name).toBe('attribute')
    expect(attribute.$ref).toBeUndefined()
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
    const resolvedComponents = asRecord(resolved.components)
    const schemas = asRecord(resolvedComponents.schemas)
    const node = asRecord(schemas.Node)
    const nodeProps = asRecord(node.properties)
    const children = asRecord(nodeProps.children)
    const items = asRecord(children.items)
    expect(items.$ref).toBe('#/components/schemas/Node')
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
