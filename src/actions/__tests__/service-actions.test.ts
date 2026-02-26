import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ValidationError } from '@/lib/mongodb-errors'

// Set required environment variables
process.env.GITHUB_CLIENT_ID = 'test-client-id'
process.env.GITHUB_APP_PRIVATE_KEY = '-----BEGIN RSA PRIVATE KEY-----'
process.env.GITHUB_INSTALLATION_ID = '12345'

// Mock modules before importing the action
vi.mock('next/cache', () => ({
  revalidatePath: vi.fn()
}))

vi.mock('@/repositories/service-repository')

vi.mock('@/lib/github-service', () => ({
  createVerificationIssue: vi.fn()
}))

// Mock logger to suppress console output during tests
vi.mock('@/lib/logger', () => ({
  logger: {
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    debug: vi.fn()
  }
}))

vi.mock('@/utilities/to-form-state', () => ({
  toFormState: (status: string, message: string) => ({
    status,
    message,
    fieldErrors: {},
    timestamp: Date.now()
  }),
  fromErrorToFormState: (error: unknown, values?: any) => {
    if (error instanceof ValidationError) {
      return {
        status: 'ERROR',
        message: '',
        formData: values,
        fieldErrors: error.errors,
        timestamp: Date.now()
      }
    }
    return {
      status: 'ERROR',
      message: error instanceof Error ? error.message : 'An unknown error occurred',
      formData: values,
      fieldErrors: {},
      timestamp: Date.now()
    }
  }
}))

vi.mock('@/models/service', () => ({
  serviceInputSchema: {
    parse: (data: any) => {
      // Simple validation for test
      if (!data.name || !data.publisher || !data.contactEmail) {
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const { z } = require('zod')
        const err = new z.ZodError([
          {
            code: 'invalid_type',
            expected: 'string',
            received: 'undefined',
            path: ['name'],
            message: 'Required'
          }
        ])
        throw err
      }
      return data
    }
  }
}))

import { createMessage } from '../service-actions'
import { ServiceRepository } from '@/repositories/service-repository'
import { createVerificationIssue } from '@/lib/github-service'
import { revalidatePath } from 'next/cache'

describe('service-actions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  const setupMockRepository = (mockCreate: any) => {
    ;(ServiceRepository as any).mockImplementation(function () {
      return {
        create: mockCreate
      }
    })
  }

  describe('createMessage', () => {
    it('should successfully create a service with GitHub issue', async () => {
      const formData = new FormData()
      formData.append('name', 'Test Service')
      formData.append('publisher', 'Test Publisher')
      formData.append('publisherUrl', 'https://publisher.example.com')
      formData.append('description', 'A test service')
      formData.append('developer', 'Test Developer')
      formData.append('developerUrl', 'https://developer.example.com')
      formData.append('serviceUrl', 'https://service.example.com')
      formData.append('contactEmail', 'test@example.com')

      const mockService = {
        id: 'svc-123',
        name: 'Test Service',
        updateLink: '/developers/register/svc-123'
      }

      const mockIssue = {
        number: 42,
        html_url: 'https://github.com/owner/repo/issues/42',
        url: 'https://api.github.com/repos/owner/repo/issues/42'
      }

      const mockCreate = vi.fn().mockResolvedValue(mockService)
      setupMockRepository(mockCreate)
      ;(createVerificationIssue as any).mockResolvedValue(mockIssue)
      ;(revalidatePath as any).mockResolvedValue(undefined)

      const result = await createMessage({}, formData)

      expect(result.status).toBe('SUCCESS')
      expect(result.message).toBe('Service requested')
      expect(result.updateLink).toBe('/developers/register/svc-123')
      expect(result.issueUrl).toBe('https://github.com/owner/repo/issues/42')
      expect(revalidatePath).toHaveBeenCalledWith('/developers/register')
    })

    it('should handle GitHub issue creation failure gracefully', async () => {
      const formData = new FormData()
      formData.append('name', 'Test Service')
      formData.append('publisher', 'Test Publisher')
      formData.append('publisherUrl', 'https://publisher.example.com')
      formData.append('description', 'A test service')
      formData.append('developer', 'Test Developer')
      formData.append('developerUrl', 'https://developer.example.com')
      formData.append('serviceUrl', 'https://service.example.com')
      formData.append('contactEmail', 'test@example.com')

      const mockService = {
        id: 'svc-123',
        name: 'Test Service',
        updateLink: '/developers/register/svc-123'
      }

      const mockCreate = vi.fn().mockResolvedValue(mockService)
      setupMockRepository(mockCreate)
      ;(createVerificationIssue as any).mockRejectedValue(new Error('GitHub API error'))
      ;(revalidatePath as any).mockResolvedValue(undefined)

      const result = await createMessage({}, formData)

      expect(result.status).toBe('SUCCESS')
      expect(result.message).toBe('Service requested')
      expect(result.updateLink).toBe('/developers/register/svc-123')
      expect(result.issueUrl).toBeUndefined()
    })

    it('should return validation errors for invalid form data', async () => {
      const formData = new FormData()
      formData.append('name', '')
      formData.append('publisher', 'Test Publisher')

      const result = await createMessage({}, formData)

      expect(result.status).toBe('ERROR')
      expect(result.fieldErrors).toBeDefined()
    })

    it('should handle repository creation error', async () => {
      const formData = new FormData()
      formData.append('name', 'Test Service')
      formData.append('publisher', 'Test Publisher')
      formData.append('publisherUrl', 'https://publisher.example.com')
      formData.append('description', 'A test service')
      formData.append('developer', 'Test Developer')
      formData.append('developerUrl', 'https://developer.example.com')
      formData.append('serviceUrl', 'https://service.example.com')
      formData.append('contactEmail', 'test@example.com')

      const mockCreate = vi.fn().mockRejectedValue(new Error('Database error'))
      setupMockRepository(mockCreate)

      const result = await createMessage({}, formData)

      expect(result.status).toBe('ERROR')
      expect(result.message).toBe('Failed to save service')
    })

    it('should handle ValidationError from repository', async () => {
      const formData = new FormData()
      formData.append('name', 'Test Service')
      formData.append('publisher', 'Test Publisher')
      formData.append('publisherUrl', 'https://publisher.example.com')
      formData.append('description', 'A test service')
      formData.append('developer', 'Test Developer')
      formData.append('developerUrl', 'https://developer.example.com')
      formData.append('serviceUrl', 'https://service.example.com')
      formData.append('contactEmail', 'test@example.com')

      const validationError = new ValidationError('Validation failed', {
        duplicate: ['Service with this email already exists']
      })

      const mockCreate = vi.fn().mockRejectedValue(validationError)
      setupMockRepository(mockCreate)

      const result = await createMessage({}, formData)

      expect(result.status).toBe('ERROR')
      expect(result.fieldErrors).toEqual({
        duplicate: ['Service with this email already exists']
      })
    })
  })
})
