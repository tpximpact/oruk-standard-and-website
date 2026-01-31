import { ValidationError } from '@/lib/mongodb-errors'

// Mock modules before importing the action
jest.mock('next/cache', () => ({
  revalidatePath: jest.fn()
}))

jest.mock('@/repositories/service-repository', () => ({
  ServiceRepository: jest.fn()
}))

jest.mock('@/lib/github-service', () => ({
  createVerificationIssue: jest.fn()
}))

jest.mock('@/utilities/to-form-state', () => ({
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

jest.mock('@/models/service', () => ({
  serviceInputSchema: {
    parse: (data: any) => {
      // Simple validation for test
      if (!data.name || !data.publisher || !data.contactEmail) {
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
    jest.clearAllMocks()
  })

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

      ;(ServiceRepository as jest.Mock).mockImplementation(() => ({
        create: jest.fn().mockResolvedValue(mockService)
      }))
      ;(createVerificationIssue as jest.Mock).mockResolvedValue(mockIssue)
      ;(revalidatePath as jest.Mock).mockResolvedValue(undefined)

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

      ;(ServiceRepository as jest.Mock).mockImplementation(() => ({
        create: jest.fn().mockResolvedValue(mockService)
      }))
      ;(createVerificationIssue as jest.Mock).mockRejectedValue(new Error('GitHub API error'))
      ;(revalidatePath as jest.Mock).mockResolvedValue(undefined)

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
      ;(ServiceRepository as jest.Mock).mockImplementation(() => ({
        create: jest.fn().mockRejectedValue(new Error('Database error'))
      }))

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

      ;(ServiceRepository as jest.Mock).mockImplementation(() => ({
        create: jest.fn().mockRejectedValue(validationError)
      }))

      const result = await createMessage({}, formData)

      expect(result.status).toBe('ERROR')
      expect(result.fieldErrors).toEqual({
        duplicate: ['Service with this email already exists']
      })
    })
  })
})
