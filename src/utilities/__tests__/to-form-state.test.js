import { EMPTY_FORM_STATE, fromErrorToFormState, toFormState } from '../to-form-state'
import { z } from 'zod'

describe('to-form-state', () => {
  describe('EMPTY_FORM_STATE', () => {
    it('should have correct structure', () => {
      expect(EMPTY_FORM_STATE).toMatchObject({
        status: 'UNSET',
        message: '',
        formData: null,
        fieldErrors: {}
      })
      expect(EMPTY_FORM_STATE.timestamp).toBeDefined()
      expect(typeof EMPTY_FORM_STATE.timestamp).toBe('number')
    })
  })

  describe('toFormState', () => {
    it('should create a form state with status and message', () => {
      const result = toFormState('SUCCESS', 'Operation completed')

      expect(result.status).toBe('SUCCESS')
      expect(result.message).toBe('Operation completed')
      expect(result.fieldErrors).toEqual({})
      expect(result.timestamp).toBeDefined()
    })

    it('should create an error form state', () => {
      const result = toFormState('ERROR', 'Something went wrong')

      expect(result.status).toBe('ERROR')
      expect(result.message).toBe('Something went wrong')
    })

    it('should include timestamp', () => {
      const before = Date.now()
      const result = toFormState('SUCCESS', 'Test')
      const after = Date.now()

      expect(result.timestamp).toBeGreaterThanOrEqual(before)
      expect(result.timestamp).toBeLessThanOrEqual(after)
    })
  })

  describe('fromErrorToFormState', () => {
    it('should handle ZodError with field errors', () => {
      const schema = z.object({
        email: z.string().email(),
        age: z.number().min(18)
      })

      try {
        schema.parse({ email: 'invalid', age: 10 })
      } catch (error) {
        const formData = { email: 'invalid', age: 10 }
        const result = fromErrorToFormState(error, formData)

        expect(result.status).toBe('ERROR')
        expect(result.message).toBe('')
        expect(result.formData).toEqual(formData)
        expect(result.fieldErrors).toBeDefined()
        expect(Object.keys(result.fieldErrors).length).toBeGreaterThan(0)
      }
    })

    it('should handle regular Error', () => {
      const error = new Error('Custom error message')
      const formData = { field: 'value' }
      const result = fromErrorToFormState(error, formData)

      expect(result.status).toBe('ERROR')
      expect(result.message).toBe('Custom error message')
      expect(result.formData).toEqual(formData)
      expect(result.fieldErrors).toEqual({})
    })

    it('should handle unknown error types', () => {
      const error = 'String error'
      const formData = { field: 'value' }
      const result = fromErrorToFormState(error, formData)

      expect(result.status).toBe('ERROR')
      expect(result.message).toBe('An unknown error occurred')
      expect(result.formData).toEqual(formData)
      expect(result.fieldErrors).toEqual({})
    })

    it('should handle error with no form data', () => {
      const error = new Error('Test error')
      const result = fromErrorToFormState(error, undefined)

      expect(result.status).toBe('ERROR')
      expect(result.formData).toBeUndefined()
    })

    it('should include timestamp', () => {
      const error = new Error('Test')
      const before = Date.now()
      const result = fromErrorToFormState(error, {})
      const after = Date.now()

      expect(result.timestamp).toBeGreaterThanOrEqual(before)
      expect(result.timestamp).toBeLessThanOrEqual(after)
    })
  })
})
