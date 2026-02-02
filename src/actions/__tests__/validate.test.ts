import { describe, it, expect, vi, beforeEach } from 'vitest'
import * as nextNavigation from 'next/navigation'
import { navigate } from '../validate'

vi.mock('next/navigation', () => ({
  redirect: vi.fn((url: string) => {
    // Next.js redirect throws to exit the function
    throw new Error(`Redirect: ${url}`)
  })
}))

describe('validate', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('navigate', () => {
    it('should redirect with correct parameters', async () => {
      const redirect = vi.mocked(nextNavigation.redirect)

      const formData = new FormData()
      formData.append('uri', 'https://example.com/api/spec')
      formData.append('id', 'validator-123')

      try {
        await navigate(formData)
        fail('Should have thrown redirect')
      } catch (error: any) {
        expect(redirect).toHaveBeenCalledWith(
          '/developers/validator/validator-123?uri=https://example.com/api/spec'
        )
      }
    })

    it('should handle URI with query parameters', async () => {
      const redirect = vi.mocked(nextNavigation.redirect)

      const formData = new FormData()
      formData.append('uri', 'https://example.com/api/spec?version=1.0')
      formData.append('id', 'val-456')

      try {
        await navigate(formData)
        fail('Should have thrown redirect')
      } catch (error: any) {
        expect(redirect).toHaveBeenCalledWith(
          '/developers/validator/val-456?uri=https://example.com/api/spec?version=1.0'
        )
      }
    })

    it('should build correct redirect URL', async () => {
      const redirect = vi.mocked(nextNavigation.redirect)

      const formData = new FormData()
      formData.append('uri', 'https://test.com')
      formData.append('id', 'test-id')

      try {
        await navigate(formData)
      } catch {
        // Expected to throw
      }

      expect(redirect).toHaveBeenCalledWith('/developers/validator/test-id?uri=https://test.com')
    })

    it('should handle empty URI gracefully', async () => {
      const redirect = vi.mocked(nextNavigation.redirect)

      const formData = new FormData()
      formData.append('uri', '')
      formData.append('id', 'test-id')

      try {
        await navigate(formData)
      } catch {
        // Expected to throw
      }

      expect(redirect).toHaveBeenCalledWith('/developers/validator/test-id?uri=')
    })
  })
})
