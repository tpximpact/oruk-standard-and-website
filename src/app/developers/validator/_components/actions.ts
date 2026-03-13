'use server'

interface ValidatorResult {
  service: {
    url: string
    isValid: boolean
    profile: string
    profileReason?: string
  }
  metadata: unknown[]
  testSuites: unknown[]
}

export interface ValidationState {
  result?: ValidatorResult
  error?: string
  baseUrl?: string
}

function buildValidationRequestBody(baseUrl: string, schemaBearerToken?: string | null) {
  const trimmedSchemaBearerToken = schemaBearerToken?.trim()

  if (!trimmedSchemaBearerToken) {
    return { baseUrl }
  }

  return {
    baseUrl,
    openApiSchema: {
      authentication: {
        bearerToken: trimmedSchemaBearerToken
      }
    }
  }
}

export async function validateFeed(
  _prevState: ValidationState | null,
  formData: FormData
): Promise<ValidationState> {
  const baseUrl = formData.get('baseUrl') as string
  const schemaBearerToken = formData.get('schemaBearerToken') as string | null

  if (!baseUrl || !baseUrl.trim()) {
    return {
      error: 'Please provide a URL',
      baseUrl: baseUrl || ''
    }
  }

  try {
    const response = await fetch(`${process.env.VALIDATOR_ENDPOINT}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(buildValidationRequestBody(baseUrl, schemaBearerToken))
    })

    if (!response.ok) {
      return {
        error: `Validation failed: ${response.statusText}`,
        baseUrl
      }
    }

    const data = (await response.json()) as ValidatorResult

    return {
      result: data,
      baseUrl
    }
  } catch (err) {
    return {
      error: err instanceof Error ? err.message : 'An error occurred during validation',
      baseUrl
    }
  }
}

export async function fetchValidationResults(
  url: string,
  schemaBearerToken?: string
): Promise<ValidationState> {
  if (!url || !url.trim()) {
    return {
      error: 'Please provide a URL',
      baseUrl: url || ''
    }
  }

  try {
    const response = await fetch(`${process.env.VALIDATOR_ENDPOINT}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(buildValidationRequestBody(url, schemaBearerToken))
    })

    if (!response.ok) {
      return {
        error: `Validation failed: ${response.statusText}`,
        baseUrl: url
      }
    }

    const data = (await response.json()) as ValidatorResult

    return {
      result: data,
      baseUrl: url
    }
  } catch (err) {
    return {
      error: err instanceof Error ? err.message : 'An error occurred during validation',
      baseUrl: url
    }
  }
}
