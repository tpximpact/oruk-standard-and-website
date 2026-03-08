import { getAllSchemas, SchemaProperty } from '@/components/DataModel'
import { DocumentationFeatureSection } from '@/components/Documentation'
import { filenameToName } from '@/utilities/filenameToName'

interface SchemaNode {
  $ref?: string
  name?: string
  properties?: Record<string, unknown>
  description?: string
  required?: string[]
  tabular_required?: string[]
  [key: string]: unknown
}

interface ApiResponse {
  description?: string
  content?: {
    'application/json'?: {
      schema: SchemaNode
    }
  }
}

interface ResponsesProps {
  data: Record<string, ApiResponse>
  allData: {
    schemata: Record<string, SchemaNode>
  }
}

export const Responses = ({ data, allData }: ResponsesProps) => {
  const allSchemas = getAllSchemas(allData.schemata)
  const response200 = data['200']

  if (!response200?.content?.['application/json']?.schema) {
    return <DocumentationFeatureSection title='Response'>{null}</DocumentationFeatureSection>
  }

  let schema = response200.content['application/json'].schema
  let description = response200.description
  if (schema.$ref) {
    const modelFile = schema.$ref.split('/').pop()
    const model = filenameToName(modelFile)
    description = `${description} An instance of the class ${model}.`
    if (allSchemas && model && allSchemas.includes(model)) {
      const resolvedSchema = allData.schemata[model]
      if (resolvedSchema) {
        schema = resolvedSchema
      }
    }
  }

  const properties = schema.properties

  return (
    <DocumentationFeatureSection title='Response' description={description}>
      {properties &&
        Object.keys(properties).map((pk, i) => (
          <SchemaProperty
            key={i}
            parentKeyName={pk}
            data={properties[pk]}
            allSchemas={allSchemas}
            required={false}
            useFullPath={true}
          />
        ))}
    </DocumentationFeatureSection>
  )
}
