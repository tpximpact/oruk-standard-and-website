'use client'

import { useEffect, useMemo } from 'react'
import { Title } from './Title'
import { Endpoint } from './Endpoint'

import styles from './ValidatorResult.module.css'

import { formatResults } from './formatResults'
import type { ApiDocsData, FormattedEndpoints, ValidationResultData } from './types'

//import exampleData from './example.json'

interface ValidatorResultProps {
  result: { result: ValidationResultData }
  apiData: Record<string, ApiDocsData>
}

export const ValidatorResult = ({ result, apiData }: ValidatorResultProps) => {
  const validationResult = result.result

  const endpoints: FormattedEndpoints = useMemo(
    () => formatResults(validationResult),
    [validationResult]
  )

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  return (
    <>
      <div className={styles.result}>
        <Title result={validationResult} />

        {Object.keys(endpoints).map((k, i) => (
          <Endpoint
            profile={validationResult.service.profile}
            rootPath={validationResult.service.url}
            key={i}
            path={k}
            data={endpoints[k]}
            apiData={apiData}
          />
        ))}
      </div>

      {/*       {result && (
        <div className='mt-4'>
          <h4 className='text-sm font-medium text-gray-800 dark:text-gray-400 mb-1'>
            Full Result:
          </h4>
          <pre className='bg-gray-100 dark:bg-gray-800 p-2 rounded-lg overflow-x-auto text-sm text-gray-700 dark:text-gray-300'>
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )} */}
    </>
  )
}
