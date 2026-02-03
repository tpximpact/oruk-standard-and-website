import { describe, it, expect, vi, beforeEach } from 'vitest'
import * as nextNavigation from 'next/navigation'

// Mock next/navigation for testing server actions
vi.mock('next/navigation', () => ({
  redirect: vi.fn()
}))

import { navigate } from '../validate'

describe('navigate', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should redirect to validator page with id and uri params', async () => {
    const redirect = vi.mocked(nextNavigation.redirect)

    const formData = new FormData()
    formData.set('id', 'test-id-123')
    formData.set('uri', 'https://example.com/api')

    await navigate(formData)

    expect(redirect).toHaveBeenCalledWith(
      '/developers/validator/test-id-123?uri=https://example.com/api'
    )
  })

  it('should handle empty uri', async () => {
    const redirect = vi.mocked(nextNavigation.redirect)

    const formData = new FormData()
    formData.set('id', 'test-id-456')
    formData.set('uri', '')

    await navigate(formData)

    expect(redirect).toHaveBeenCalledWith('/developers/validator/test-id-456?uri=')
  })

  it('should encode special characters in uri', async () => {
    const redirect = vi.mocked(nextNavigation.redirect)

    const formData = new FormData()
    formData.set('id', 'abc')
    formData.set('uri', 'https://example.com/api?param=value&other=test')

    await navigate(formData)

    expect(redirect).toHaveBeenCalledWith(
      '/developers/validator/abc?uri=https://example.com/api?param=value&other=test'
    )
  })
})
