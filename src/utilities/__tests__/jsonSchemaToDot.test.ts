import { jsonSchemaToDot } from '../jsonSchemaToDot'

describe('jsonSchemaToDot', () => {
  it('should generate dot notation for simple schema', () => {
    const data = {
      components: {
        schemas: {
          User: {
            properties: {
              name: { type: 'string', description: 'User name' },
              email: { type: 'string', description: 'Email address' }
            }
          }
        }
      }
    }

    const result = jsonSchemaToDot(data)

    expect(result).toContain('digraph dbml')
    expect(result).toContain('User')
    expect(result).toContain('name')
    expect(result).toContain('email')
    expect(result).toContain('string')
  })

  it('should handle multiple schemas', () => {
    const data = {
      components: {
        schemas: {
          User: {
            properties: {
              id: { type: 'number' }
            }
          },
          Post: {
            properties: {
              title: { type: 'string' }
            }
          }
        }
      }
    }

    const result = jsonSchemaToDot(data)

    expect(result).toContain('User')
    expect(result).toContain('Post')
    expect(result).toContain('id')
    expect(result).toContain('title')
  })

  it('should include descriptions in output', () => {
    const data = {
      components: {
        schemas: {
          Product: {
            properties: {
              name: {
                type: 'string',
                description: 'Product name with a long description'
              }
            }
          }
        }
      }
    }

    const result = jsonSchemaToDot(data)

    expect(result).toContain('Product name')
  })

  it('should include connection between location_details and organization_details', () => {
    const data = {
      components: {
        schemas: {
          location_details: {
            properties: {
              id: { type: 'string' },
              name: { type: 'string' },
              organization: { type: 'string' }
            }
          },
          organization_details: {
            properties: {
              id: { type: 'string' },
              name: { type: 'string' }
            }
          }
        }
      }
    }

    const result = jsonSchemaToDot(data)

    expect(result).toContain('location_details')
    expect(result).toContain('organization_details')
    expect(result).toContain('->')
  })

  it('should handle schema with no properties', () => {
    const data = {
      components: {
        schemas: {
          Empty: {
            properties: {}
          }
        }
      }
    }

    const result = jsonSchemaToDot(data)

    expect(result).toContain('digraph dbml')
    expect(result).toContain('Empty')
  })

  it('should include graph configuration', () => {
    const data = {
      components: {
        schemas: {
          Test: {
            properties: {
              field: { type: 'string' }
            }
          }
        }
      }
    }

    const result = jsonSchemaToDot(data)

    expect(result).toContain('rankdir=LR')
    expect(result).toContain('fontname="helvetica"')
    expect(result).toContain('bgcolor="transparent"')
  })

  it('should handle properties with various types', () => {
    const data = {
      components: {
        schemas: {
          Mixed: {
            properties: {
              stringField: { type: 'string' },
              numberField: { type: 'number' },
              booleanField: { type: 'boolean' },
              arrayField: { type: 'array' }
            }
          }
        }
      }
    }

    const result = jsonSchemaToDot(data)

    expect(result).toContain('string')
    expect(result).toContain('number')
    expect(result).toContain('boolean')
    expect(result).toContain('array')
  })
})
