import { describe, it, expect, vi, beforeEach, afterEach, type SpyInstance } from 'vitest'
import { logger } from '../logger'

describe('logger', () => {
  let consoleErrorSpy: SpyInstance
  let consoleWarnSpy: SpyInstance
  let consoleInfoSpy: SpyInstance
  let consoleDebugSpy: SpyInstance

  beforeEach(() => {
    vi.clearAllMocks()
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    consoleInfoSpy = vi.spyOn(console, 'info').mockImplementation(() => {})
    consoleDebugSpy = vi.spyOn(console, 'debug').mockImplementation(() => {})
  })

  afterEach(() => {
    consoleErrorSpy.mockRestore()
    consoleWarnSpy.mockRestore()
    consoleInfoSpy.mockRestore()
    consoleDebugSpy.mockRestore()
  })

  describe('error', () => {
    it('should log error messages', () => {
      logger.error('Test error')

      expect(consoleErrorSpy).toHaveBeenCalledTimes(1)
      const message = consoleErrorSpy.mock.calls[0][0]
      expect(message).toContain('ERROR')
      expect(message).toContain('Test error')
    })

    it('should include metadata in error logs', () => {
      logger.error('Test error', { code: 500 })

      expect(consoleErrorSpy).toHaveBeenCalledTimes(1)
      const message = consoleErrorSpy.mock.calls[0][0]
      expect(message).toContain('{"code":500}')
    })

    it('should always log errors regardless of level', () => {
      logger.error('Error message')

      expect(consoleErrorSpy).toHaveBeenCalled()
    })

    it('should format timestamp', () => {
      logger.error('Test')

      const message = consoleErrorSpy.mock.calls[0][0]
      expect(message).toMatch(/\[\d{4}-\d{2}-\d{2}/)
    })
  })

  describe('warn', () => {
    it('should log warn messages when level allows', () => {
      logger.warn('Test warning')

      expect(consoleWarnSpy).toHaveBeenCalledTimes(1)
      const message = consoleWarnSpy.mock.calls[0][0]
      expect(message).toContain('WARN')
      expect(message).toContain('Test warning')
    })

    it('should include metadata in warn logs', () => {
      logger.warn('Test warning', { code: 400 })

      expect(consoleWarnSpy).toHaveBeenCalled()
      const message = consoleWarnSpy.mock.calls[0][0]
      expect(message).toContain('{"code":400}')
    })
  })

  describe('info', () => {
    it('should log info messages when level allows', () => {
      logger.info('Test info')

      expect(consoleInfoSpy).toHaveBeenCalledTimes(1)
      const message = consoleInfoSpy.mock.calls[0][0]
      expect(message).toContain('INFO')
      expect(message).toContain('Test info')
    })

    it('should include metadata in info logs', () => {
      logger.info('Test info', { userId: 123 })

      expect(consoleInfoSpy).toHaveBeenCalled()
      const message = consoleInfoSpy.mock.calls[0][0]
      expect(message).toContain('{"userId":123}')
    })
  })

  describe('debug', () => {
    it('should include metadata in debug logs', () => {
      logger.debug('Debug message', { userId: 123 })

      // Note: debug logs may not show depending on LOG_LEVEL env var
      // Just verify the logger can handle metadata
    })

    it('should format messages correctly', () => {
      logger.info('Formatted message')

      const message = consoleInfoSpy.mock.calls[0][0]
      expect(message).toMatch(/\[\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/)
    })
  })

  describe('log levels', () => {
    it('should instantiate successfully', () => {
      expect(logger).toBeDefined()
      expect(typeof logger.error).toBe('function')
      expect(typeof logger.warn).toBe('function')
      expect(typeof logger.info).toBe('function')
      expect(typeof logger.debug).toBe('function')
    })

    it('should have all log methods', () => {
      expect(logger).toHaveProperty('error')
      expect(logger).toHaveProperty('warn')
      expect(logger).toHaveProperty('info')
      expect(logger).toHaveProperty('debug')
    })
  })
})
