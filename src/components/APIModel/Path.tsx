//import styles from './Path.module.css'
import { Parameters } from './Parameters'
import { Responses } from './Responses'
import { DocumentationFeature } from '@/components/Documentation'

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
  return (
    <DocumentationFeature
      twirledOpen={twirledOpen}
      name={hidePathTitle ? null : path}
      description={displayData.summary as string | undefined}
    >
      {displayData.parameters && (
        <Parameters
          parametersReferences={parametersReferences}
          data={displayData.parameters as Array<Record<string, unknown>>}
        />
      )}
      <Responses
        allData={allData as { schemata: Record<string, unknown> }}
        data={displayData.responses as Record<string, unknown>}
      />
    </DocumentationFeature>
  )
}
