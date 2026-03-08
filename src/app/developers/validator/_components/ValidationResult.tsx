interface ValidationResultData {
  isValid: boolean
  message?: string
  errors?: string[]
  warnings?: string[]
}

export default function ValidationResult({ result }: { result: ValidationResultData }) {
  return (
    <div
      className={`p-4 border rounded-lg ${
        result.isValid
          ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
          : 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800'
      }`}
    >
      <h3
        className={`text-sm font-semibold mb-2 ${
          result.isValid
            ? 'text-green-800 dark:text-green-400'
            : 'text-yellow-800 dark:text-yellow-400'
        }`}
      >
        {result.isValid ? '✓ Validation Successful' : '⚠ Validation Issues Found'}
      </h3>

      {result.message && (
        <p className='text-sm mb-3 text-gray-700 dark:text-gray-300'>{result.message}</p>
      )}

      {result.errors && result.errors.length > 0 && (
        <div className='mb-3'>
          <h4 className='text-sm font-medium text-red-800 dark:text-red-400 mb-1'>Errors:</h4>
          <ul className='list-disc list-inside space-y-1'>
            {result.errors.map((err: string, index: number) => (
              <li key={index} className='text-sm text-red-700 dark:text-red-300'>
                {err}
              </li>
            ))}
          </ul>
        </div>
      )}

      {result.warnings && result.warnings.length > 0 && (
        <div>
          <h4 className='text-sm font-medium text-yellow-800 dark:text-yellow-400 mb-1'>
            Warnings:
          </h4>
          <ul className='list-disc list-inside space-y-1'>
            {result.warnings.map((warning: string, index: number) => (
              <li key={index} className='text-sm text-yellow-700 dark:text-yellow-300'>
                {warning}
              </li>
            ))}
          </ul>
        </div>
      )}

      {result && (
        <div className='mt-4'>
          <h4 className='text-sm font-medium text-gray-800 dark:text-gray-400 mb-1'>
            Full Result:
          </h4>
          <pre className='bg-gray-100 dark:bg-gray-800 p-2 rounded-lg overflow-x-auto text-sm text-gray-700 dark:text-gray-300'>
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
    </div>
  )
}
