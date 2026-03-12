import styles from './samples.module.css'
import Link from 'next/link'
import { getMockApiEndpoint } from '@/utilities/mockApiEndpoint'

const Samples = () => {
  const mockApiEndpoint = getMockApiEndpoint()

  return (
    <>
      <p>For a quick preview of the results this tool reports, choose an example:</p>
      <ol className={styles.samplesList}>
        <li>
          <Link href={`/developers/validator?url=${encodeURIComponent(mockApiEndpoint)}`}>
            Pass
          </Link>
        </li>
        <li>
          <Link href={`/developers/validator?url=${encodeURIComponent(`${mockApiEndpoint}/warn`)}`}>
            Pass (with warnings)
          </Link>
        </li>
        <li>
          <Link href={`/developers/validator?url=${encodeURIComponent(`${mockApiEndpoint}/fail`)}`}>
            Fail
          </Link>
        </li>
      </ol>
    </>
  )
}

export default Samples
