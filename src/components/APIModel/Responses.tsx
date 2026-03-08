import { getAllSchemas, SchemaProperty } from '@/components/DataModel'
import { DocumentationFeatureSection } from '@/components/Documentation'
import { filenameToName } from '@/utilities/filenameToName'

interface SchemaNode {
  $ref?: string
  properties?: Record<string, unknown>
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
    return <DocumentationFeatureSection title='Response' />
  }

  let schema = response200.content['application/json'].schema
  let description = response200.description
  if (schema.$ref) {
    const modelFile = schema.$ref.split('/').pop()
    const model = filenameToName(modelFile)
    description = (
      <>
        {`${description} An instance of the class `}
        <a href={'/developers/schemata#' + model}>{model}</a>
      </>
    )
    if (allSchemas && model && allSchemas.includes(model)) {
      schema = allData.schemata[model]
    }
  }

  return (
    <DocumentationFeatureSection title='Response' description={description}>
      {schema.properties &&
        Object.keys(schema.properties).map((pk, i) => (
          <SchemaProperty
            key={i}
            parentKeyName={pk}
            data={schema.properties[pk]}
            allSchemas={allSchemas}
            required={false}
            useFullPath={true}
          />
        ))}
    </DocumentationFeatureSection>
  )
}
