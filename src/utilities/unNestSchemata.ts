import { pluralToSingular } from './pluralToSingular'

interface Schema {
  properties: Record<string, Property>
  [key: string]: unknown
}

interface Property {
  type?: string
  $ref?: string
  items?: {
    type?: string
    $ref?: string
    [key: string]: unknown
  }
  [key: string]: unknown
}

export const unNestSchemata = (schemata: Record<string, Schema>): Record<string, Schema> => {
  Object.keys(schemata).forEach(schemaKey => {
    const schema = schemata[schemaKey]
    if (!schema || !schema.properties) return

    Object.keys(schema.properties).forEach(propertyKey => {
      const property = schema.properties[propertyKey]
      if (!property) return

      if (property.type === 'object') {
        if (!schemata[propertyKey]) {
          schemata[propertyKey] = { properties: {}, ...Object.assign({}, property) }
        }
        property.$ref = propertyKey
      }
      if (property.type === 'array') {
        const singularPropertyName = pluralToSingular(propertyKey)

        if (property.items && property.items.type === 'object') {
          schemata[singularPropertyName] = { properties: {}, ...Object.assign({}, property.items) }
          property.items.$ref = singularPropertyName
        }
      }
    })
  })
  return schemata
}
