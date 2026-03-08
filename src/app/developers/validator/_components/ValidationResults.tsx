'use client'

import { useEffect, useState } from 'react'
import { ValidatorResult } from '@/components/ValidatorResult'
import Heading from './Heading'
import Columns from '@/components/Columns'
import LoadingOverlay from './LoadingOverlay'
import styles from './ValidationResults.module.css'
import { fetchValidationResults } from './actions'

interface ValidationResultsProps {
  url: string
  apiData: unknown
}

interface ValidatorTest {
  endpoint: string
}

interface ValidatorTestSuite {
  required?: boolean
  tests: ValidatorTest[]
}

interface ValidatorApiResult {
  service: {
    url: string
    isValid: boolean
    profile: string
    profileReason?: string
  }
  metadata: unknown[]
  testSuites: ValidatorTestSuite[]
}

export default function ValidationResults({ url, apiData }: ValidationResultsProps) {
  const [result, setResult] = useState<ValidatorApiResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function validateUrl() {
      setLoading(true)
      setError(null)
      setResult(null)

      try {
        const response = await fetchValidationResults(url)

        if (response.error) {
          throw new Error(response.error)
        }

        if (response.result) {
          setResult(response.result)
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred during validation')
      } finally {
        setLoading(false)
      }
    }

    if (url) {
      validateUrl()
    }
  }, [url])

  if (loading) {
    return <LoadingOverlay url={url} />
  }

  if (error) {
    return (
      <div className={styles.errorContainer}>
        <h3 className={styles.errorTitle}>Error</h3>
        <p className={styles.errorText}>{error}</p>
        <p className={styles.errorUrl}>URL attempted: {url}</p>
      </div>
    )
  }

  if (!result) {
    return null
  }

  // Extract required endpoints from the validation results
  const requiredEndpoints = result.testSuites
    .filter(suite => suite.required)
    .flatMap(suite => suite.tests.map(test => test.endpoint))
    .filter((endpoint, index, self) => self.indexOf(endpoint) === index) // Remove duplicates
    .sort()

  // Normalize endpoint paths for display
  const normalizeEndpoint = (endpoint: string) => {
    const path = endpoint.replace(url, '')
    if (!path || path === '/') return 'GET /'
    if (path.endsWith('/')) return `GET ${path}{id}`
    return `GET ${path}`
  }

  const displayEndpoints = requiredEndpoints.map(normalizeEndpoint)

  return (
    <div>
      <div className={styles.infoContainer}>
        <p className={styles.infoText}>
          Validated URL: <strong className={styles.infoTextStrong}>{url}</strong>
        </p>
        <p className={styles.infoSubtext}>You can bookmark this page to return to these results</p>
      </div>
      <ValidatorResult result={{ result }} apiData={apiData} />

      <Columns layout='42'>
        <div>
          <Heading>Understanding The Results</Heading>
          <p className={styles.contentText}>
            To Pass validation, for {result.service.profile} of the schema, no issues can be found
            with the API responses of the basic endpoints. The basic endpoints are those that are
            deemed vital for a feed to be useful.
          </p>
          <div className={styles.spacer} />

          <div className={styles.contentText}>
            <p className={styles.contentTextSemibold}>
              The {result.service.profile} basic endpoints are
            </p>
            <div className={styles.spacer} />
            <ul className={styles.endpointList}>
              {displayEndpoints.map((endpoint, index) => (
                <li key={index}>
                  <strong>{endpoint}</strong>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Columns>

      <Columns layout='42'>
        <div>
          <Heading>Errors, Warnings, & Failing Validation</Heading>
          <div className={`${styles.textSectionContainer} ${styles.textSection}`}>
            <p>
              Any issues found with a response from one of the basic endpoints will be labelled as
              an <strong>ERROR</strong> and the feed will fail validation.
            </p>
            <div className={styles.spacer} />
            <p>
              Any issues found with any of the other endpoints will be marked as a{' '}
              <strong>WARNING</strong>. These may include issues which are the same as those
              labelled as errors but as the issue is not on one of the basic endpoints it is
              labelled with a lower severity.
            </p>
          </div>
        </div>
      </Columns>
    </div>
  )
}
