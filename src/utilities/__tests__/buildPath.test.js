import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { buildPath } from '../buildPath'
import { join } from 'path'

// Mock process.cwd() for predictable tests
const originalCwd = process.cwd
const mockCwd = '/mock/working/directory'

describe('buildPath', () => {
  beforeEach(() => {
    process.cwd = vi.fn(() => mockCwd)
  })

  afterEach(() => {
    process.cwd = originalCwd
  })

  it('should build path from content root', () => {
    const contentPath = 'about/index.md'
    const result = buildPath(contentPath)

    expect(result).toBe(join(mockCwd, 'content', contentPath))
  })

  it('should handle nested paths', () => {
    const contentPath = 'developers/api/overview.md'
    const result = buildPath(contentPath)

    expect(result).toBe(join(mockCwd, 'content', contentPath))
  })

  it('should handle root level files', () => {
    const contentPath = 'metadata.json'
    const result = buildPath(contentPath)

    expect(result).toBe(join(mockCwd, 'content', contentPath))
  })

  it('should handle paths with special characters', () => {
    const contentPath = 'case-studies/2024-01-15.md'
    const result = buildPath(contentPath)

    expect(result).toBe(join(mockCwd, 'content', contentPath))
  })
})
