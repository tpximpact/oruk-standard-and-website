import { NamedMarkdownPage } from '@/components/NamedMarkdownPage'
import ValidatorForm from './_components/ValidatorForm'
import { PageMargin } from '@/components/PageMargin'
import Samples from './_components/Samples'
import Columns from '@/components/Columns'
import Heading from './_components/Heading'
import ValidationResults from './_components/ValidationResults'
import { getAllContentVersions } from '@/utilities/getAllContentVersions'

interface PageProps {
  searchParams: Promise<{ url?: string; t?: string; schemaBearerToken?: string }>
}

export default async function Page({ searchParams }: PageProps) {
  const params = await searchParams
  const urlToValidate = params.url
  const timestamp = params.t
  const schemaBearerToken = params.schemaBearerToken

  const apiData = getAllContentVersions({
    contentFolder: '/developers/api',
    specificationFolder: './/public/specifications'
  })

  return (
    <>
      {!urlToValidate && (
        <NamedMarkdownPage
          name='validator'
          autoMenu={false}
          noMargin={undefined}
          markdownRaw={undefined}
        />
      )}
      <PageMargin>
        <div style={{ marginTop: '6rem' }}>
          {!urlToValidate ? (
            <Columns layout='42'>
              <div>
                <Heading>Check feed</Heading>
                <ValidatorForm initialSchemaBearerToken={schemaBearerToken} />
              </div>
              <div>
                <Heading>Sample reports</Heading>
                <Samples />
              </div>
            </Columns>
          ) : (
            <>
              <div style={{ marginTop: '3rem' }}>
                <Heading>Validation Results</Heading>
                <ValidationResults
                  key={`${urlToValidate}-${timestamp}`}
                  url={urlToValidate}
                  schemaBearerToken={schemaBearerToken}
                  apiData={apiData}
                />
              </div>
              <div style={{ marginBottom: '2rem' }}>
                <Heading>Check feed</Heading>
                <ValidatorForm
                  initialUrl={urlToValidate}
                  initialSchemaBearerToken={schemaBearerToken}
                />
              </div>
            </>
          )}
        </div>
      </PageMargin>
    </>
  )
}

export const metadata = {
  title: 'ORUK service validator',
  description: 'The tool to validate your feed'
}
