import styles from './APIModel.module.css'
import { Path } from './Path'
import { DocumentationPage } from '@/components/Documentation'

interface ParsedSpec {
  paths: Record<string, Record<string, unknown>>
  components: {
    parameters: Record<string, unknown>
  }
}

interface APIModelData {
  rootSpec: {
    parsed: ParsedSpec
  }
  htmlContent: string
  [key: string]: unknown
}

interface APIModelProps {
  allVersionsContent: string
  data: APIModelData
}

export const APIModel = ({ allVersionsContent, data }: APIModelProps) => {
  const endpoints = data.rootSpec.parsed.paths
  const menuItems = Object.keys(endpoints).map(key => {
    // const ep = endpoints[key]
    const item = {
      title: key,
      target: key
    }
    return item
  })
  const parametersReferences = data.rootSpec.parsed.components.parameters
  return (
    <DocumentationPage
      contentForAllVersions={allVersionsContent}
      contentForThisVersion={data.htmlContent}
      menuItems={menuItems}
      menuTitle='Paths'
    >
      <div className={styles.APIModel}>
        {Object.keys(endpoints).map(key => {
          const endpointData = endpoints[key] as Record<string, unknown>
          return (
            <Path
              key={key}
              path={key}
              allData={data}
              parametersReferences={parametersReferences}
              data={endpointData}
              twirledOpen={undefined}
              hidePathTitle={undefined}
            />
          )
        })}
      </div>
    </DocumentationPage>
  )
}
