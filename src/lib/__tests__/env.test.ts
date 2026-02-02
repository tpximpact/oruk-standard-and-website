import { isFeatureEnabled } from '../env'

describe('env', () => {
  const OLD_ENV = process.env

  afterEach(() => {
    process.env = OLD_ENV
  })

  describe('isFeatureEnabled', () => {
    it('should return true for "true" string', () => {
      expect(isFeatureEnabled('true')).toBe(true)
    })

    it('should return true for "1" string', () => {
      expect(isFeatureEnabled('1')).toBe(true)
    })

    it('should return true for "yes" string', () => {
      expect(isFeatureEnabled('yes')).toBe(true)
    })

    it('should return false for "false" string', () => {
      expect(isFeatureEnabled('false')).toBe(false)
    })

    it('should return false for "0" string', () => {
      expect(isFeatureEnabled('0')).toBe(false)
    })

    it('should return false for "no" string', () => {
      expect(isFeatureEnabled('no')).toBe(false)
    })

    it('should return false for empty string', () => {
      expect(isFeatureEnabled('')).toBe(false)
    })

    it('should return false for any other string', () => {
      expect(isFeatureEnabled('maybe')).toBe(false)
      expect(isFeatureEnabled('enabled')).toBe(false)
      expect(isFeatureEnabled('True')).toBe(false) // case sensitive
    })
  })
})
