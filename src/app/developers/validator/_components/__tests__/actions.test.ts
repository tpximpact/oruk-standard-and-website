import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { fetchValidationResults } from '../actions'

describe('validator actions', () => {
  const originalValidatorEndpoint = process.env.VALIDATOR_ENDPOINT

  beforeEach(() => {
    process.env.VALIDATOR_ENDPOINT = 'https://validator.example.com'
  })

  afterEach(() => {
    process.env.VALIDATOR_ENDPOINT = originalValidatorEndpoint
    vi.restoreAllMocks()
  })

  it('includes the schema bearer token in the validation payload when provided', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        service: { url: 'https://service.example.com', isValid: true, profile: 'OpenReferralUK' },
        metadata: [],
        testSuites: []
      })
    })

    vi.stubGlobal('fetch', fetchMock)

    await fetchValidationResults('https://service.example.com', 'secret-token')

    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect(fetchMock).toHaveBeenCalledWith(
      'https://validator.example.com',
      expect.objectContaining({
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          baseUrl: 'https://service.example.com',
          openApiSchema: {
            authentication: {
              bearerToken: 'secret-token'
            }
          }
        })
      })
    )
  })

  it('omits the schema authentication block when no bearer token is provided', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        service: { url: 'https://service.example.com', isValid: true, profile: 'OpenReferralUK' },
        metadata: [],
        testSuites: []
      })
    })

    vi.stubGlobal('fetch', fetchMock)

    await fetchValidationResults('https://service.example.com')

    const requestInit = fetchMock.mock.calls[0]?.[1]

    expect(requestInit).toMatchObject({
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        baseUrl: 'https://service.example.com'
      })
    })
  })
})
