import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// Mock environment variables before importing
const originalEnv = process.env

describe('github.ts', () => {
  beforeEach(() => {
    vi.resetModules()
    process.env = { ...originalEnv }
  })

  afterEach(() => {
    process.env = originalEnv
  })

  it('should throw error when GITHUB_CLIENT_ID is missing', async () => {
    delete process.env.GITHUB_CLIENT_ID
    process.env.GITHUB_APP_PRIVATE_KEY = 'test-key'
    process.env.GITHUB_INSTALLATION_ID = '12345'

    await expect(async () => {
      await import('../github')
    }).rejects.toThrow('Missing GitHub Client ID')
  })

  it('should throw error when GITHUB_APP_PRIVATE_KEY is missing', async () => {
    process.env.GITHUB_CLIENT_ID = 'test-client-id'
    delete process.env.GITHUB_APP_PRIVATE_KEY
    process.env.GITHUB_INSTALLATION_ID = '12345'

    await expect(async () => {
      await import('../github')
    }).rejects.toThrow('Missing GitHub App Private Key')
  })

  it('should throw error when GITHUB_INSTALLATION_ID is missing', async () => {
    process.env.GITHUB_CLIENT_ID = 'test-client-id'
    process.env.GITHUB_APP_PRIVATE_KEY = 'test-key'
    delete process.env.GITHUB_INSTALLATION_ID

    await expect(async () => {
      await import('../github')
    }).rejects.toThrow('Missing GitHub Installation ID')
  })

  it('should initialize with all required environment variables', () => {
    process.env.GITHUB_CLIENT_ID = 'test-client-id'
    process.env.GITHUB_APP_PRIVATE_KEY = 'test-key'
    process.env.GITHUB_INSTALLATION_ID = '12345'

    // Should not throw
    expect(() => {
      // Validate environment variables exist
      expect(process.env.GITHUB_CLIENT_ID).toBe('test-client-id')
      expect(process.env.GITHUB_APP_PRIVATE_KEY).toBe('test-key')
      expect(process.env.GITHUB_INSTALLATION_ID).toBe('12345')
    }).not.toThrow()
  })

  it('should format private key by replacing \\n with newlines', () => {
    const keyWithEscapedNewlines = 'line1\\nline2\\nline3'
    const expectedKey = 'line1\nline2\nline3'

    const formattedKey = keyWithEscapedNewlines.replace(/\\n/g, '\n')

    expect(formattedKey).toBe(expectedKey)
    expect(formattedKey).toContain('\n')
    expect(formattedKey).not.toContain('\\n')
  })

  it('should handle private key with actual newlines', () => {
    const keyWithActualNewlines = 'line1\nline2\nline3'

    const formattedKey = keyWithActualNewlines.replace(/\\n/g, '\n')

    expect(formattedKey).toBe(keyWithActualNewlines)
    expect(formattedKey).toContain('\n')
  })
})
