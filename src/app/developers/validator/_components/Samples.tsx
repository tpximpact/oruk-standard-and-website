import styles from './samples.module.css'
import Link from 'next/link'
import { getMockApiEndpoint } from '@/utilities/mockApiEndpoint'

const Samples = () => {
  const mockApiEndpoint = getMockApiEndpoint()
  const schemaBearerToken = process.env.MOCK_SCHEMA_BEARER_TOKEN

  const buildValidatorHref = (url: string) => {
    const params = new URLSearchParams({ url })

    if (schemaBearerToken) {
      params.set('schemaBearerToken', schemaBearerToken)
    }

    return `/developers/validator?${params.toString()}`
  }

  return (
    <>
      <p>For a quick preview of the results this tool reports, choose an example:</p>
      <ol className={styles.samplesList}>
        <li>
          <Link href={buildValidatorHref(mockApiEndpoint)}>Pass</Link>
        </li>
        <li>
          <Link href={buildValidatorHref(`${mockApiEndpoint}/warn`)}>Pass (with warnings)</Link>
        </li>
        <li>
          <Link href={buildValidatorHref(`${mockApiEndpoint}/fail`)}>Fail</Link>
        </li>
      </ol>
    </>
  )
}

export default Samples
