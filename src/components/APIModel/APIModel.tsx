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
  htmlContent: unknown
  [key: string]: unknown
}

interface APIModelProps {
  allVersionsContent: unknown
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
        {Object.keys(endpoints).map(key => (
          <Path
            key={key}
            path={key}
            allData={data}
            parametersReferences={parametersReferences}
            data={endpoints[key]}
            twirledOpen={undefined}
            hidePathTitle={undefined}
          />
        ))}
      </div>
    </DocumentationPage>
  )
}
