import { headers } from 'next/headers'
import { SuspenseIf } from '@/components/SuspenseIf'
import Spinner from '@/components/Spinner'

export const METHOD = {
  POST: 1,
  GET: 2
} as const

type MethodType = (typeof METHOD)[keyof typeof METHOD]

interface FetchArgs {
  endpoint: string
  method: MethodType
  queryParams?: Record<string, string>
}

interface FetchSuccess {
  ok: true
  endpoint: string
  queryParams?: Record<string, string>
  result: any
}

interface FetchError {
  ok: false
  error: string
}

type FetchResult = FetchSuccess | FetchError

interface ResultLoaderProps {
  ResultRenderComponent: React.ComponentType<{ result: FetchSuccess; [key: string]: any }>
  args: FetchArgs
  [key: string]: any
}

const ResultLoader = async ({ ResultRenderComponent, args, ...props }: ResultLoaderProps) => {
  const result = await fetchResult(args)
  return result && result.ok ? (
    <>
      <ResultRenderComponent result={result} {...props} />
    </>
  ) : (
    <Error data={(result as FetchError).error} />
  )
}

interface ErrorProps {
  data: string
}

const Error = ({ data }: ErrorProps) => {
  return (
    <div style={{ fontWeight: 600 }}>
      <strong>Sorry, an unexpected error occurred.</strong> {data}
    </div>
  )
}

interface ResultWithSuspenseProps {
  result?: FetchResult
  RetryComponent?: React.ComponentType
  ResultRenderComponent: React.ComponentType<{ result: FetchSuccess; [key: string]: any }>
  args: FetchArgs
  [key: string]: any
}

const ResultWithSuspense = ({
  result,
  RetryComponent,
  args,
  ResultRenderComponent,
  ...props
}: ResultWithSuspenseProps) => (
  <SuspenseIf condition={!result} fallback={<Spinner />}>
    <ResultLoader ResultRenderComponent={ResultRenderComponent} args={args} {...props} />
    {RetryComponent && <RetryComponent />}
  </SuspenseIf>
)

const fetchResult = async ({ endpoint, method, queryParams }: FetchArgs): Promise<FetchResult> => {
  try {
    const opts = method === METHOD.POST ? { method: 'POST' } : undefined

    let queryString = endpoint + '?'

    if (queryParams) {
      Object.keys(queryParams).forEach(
        key => (queryString = `${queryString}${key}=${queryParams[key]}&`)
      )
    }

    const response = await fetch(queryString, opts)

    if (response.ok) {
      const result = await response.json()
      //console.log(JSON.stringify(result, null, 2))
      return {
        ok: true,
        endpoint: endpoint,
        queryParams: queryParams,
        result: result
      }
    } else {
      if (response.status === 404) throw new globalThis.Error('404, Not found')
      if (response.status === 500) throw new globalThis.Error('500, internal server error')
      throw new globalThis.Error(String(response.status))
    }
  } catch (error) {
    const err = error as Error & { cause?: { message?: string } }
    return {
      ok: false,
      error: `${err.message}: ${err.cause?.message || ''}`
    }
  }
}

const isInitialPageLoad = async (): Promise<boolean> => {
  const h = await headers()
  return h.get('accept')?.includes('text/html') || false
}

interface RemoteJSONProps {
  endpoint: string
  method: MethodType
  queryParams?: Record<string, string>
  ResultRenderComponent: React.ComponentType<{ result: FetchSuccess; [key: string]: any }>
  RetryComponent?: React.ComponentType
  [key: string]: any
}

export const RemoteJSON = async (props: RemoteJSONProps) => {
  let result: FetchResult | undefined

  const args: FetchArgs = {
    endpoint: props.endpoint,
    method: props.method,
    queryParams: props.queryParams
  }

  const ipl = await isInitialPageLoad()

  if (ipl) {
    result = await fetchResult(args)
  }
  return <ResultWithSuspense result={result} args={args} {...props} />
}
