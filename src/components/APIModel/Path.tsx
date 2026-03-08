//import styles from './Path.module.css'
import { Parameters } from './Parameters'
import { Responses, type SchemaNode, type ApiResponse } from './Responses'
import { DocumentationFeature } from '@/components/Documentation'

interface ParameterData {
  $ref?: string
  in?: string
  required?: boolean
  name?: string
  description?: string
  schema?: {
    type?: string
  }
}

interface PathProps {
  twirledOpen?: boolean
  hidePathTitle?: boolean
  data: Record<string, unknown>
  path: string
  parametersReferences: Record<string, unknown>
  allData: Record<string, unknown>
}

export const Path = ({
  twirledOpen,
  hidePathTitle,
  data,
  path,
  parametersReferences,
  allData
}: PathProps) => {
  let displayData = { ...data }

  // for oruk we have only GET calls, so we can make this simplifying assumption
  if (data.get && typeof data.get === 'object') {
    const paramaters = data.parameters
    displayData = Object.assign({}, data.get as Record<string, unknown>)
    if (paramaters) {
      displayData.parameters = paramaters
    }
  }

  const parameters = Array.isArray(displayData.parameters)
    ? (displayData.parameters as ParameterData[])
    : undefined

  return (
    <DocumentationFeature
      twirledOpen={twirledOpen}
      name={hidePathTitle ? '' : path}
      description={displayData.summary as string | undefined}
    >
      {parameters && (
        <Parameters
          parametersReferences={parametersReferences as Record<string, ParameterData>}
          data={parameters}
        />
      )}
      <Responses
        allData={allData as { schemata: Record<string, SchemaNode> }}
        data={displayData.responses as Record<string, ApiResponse>}
      />
    </DocumentationFeature>
  )
}
