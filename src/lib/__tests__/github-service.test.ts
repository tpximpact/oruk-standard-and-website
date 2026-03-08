import { describe, it, expect, vi, beforeEach, afterAll } from 'vitest'
import type { ServiceResponse } from '@/models/service'

vi.mock('@/lib/github', () => ({
  octokit: {
    rest: {
      issues: {
        create: vi.fn().mockResolvedValue({
          data: { id: 123, html_url: 'https://github.com/owner/repo/issues/1' }
        })
      }
    }
  }
}))

describe('createVerificationIssue', () => {
  const OLD_ENV = process.env

  beforeEach(() => {
    vi.resetModules()
    process.env = { ...OLD_ENV }
    process.env.GITHUB_REPO_OWNER = 'owner'
    process.env.GITHUB_REPO_NAME = 'repo'
    process.env.NEXTAUTH_URL = 'https://example.test'
  })

  afterAll(() => {
    process.env = OLD_ENV
  })

  it('calls octokit issues.create with expected payload and returns response data', async () => {
    // Import the mocked modules so the mock is applied
    const { octokit } = await import('@/lib/github')
    const { createVerificationIssue } = await import('@/lib/github-service')

    const serviceData: ServiceResponse = {
      id: 'svc-1',
      name: 'Test Service',
      publisher: 'Publisher Ltd',
      publisherUrl: 'https://publisher.example',
      description: 'A test service',
      developer: 'Dev Co',
      developerUrl: 'https://developer.example',
      service: 'Test Service',
      serviceUrl: 'https://service.example',
      contactEmail: 'test@example.com',
      status: 'pending',
      active: true,
      statusIsUp: true,
      statusIsValid: true,
      statusOverall: 'pending',
      createdAt: new Date('2020-01-02'),
      updatedAt: new Date('2020-01-02'),
      updateLink: '/services/svc-1'
    }

    const result = await createVerificationIssue(serviceData)

    expect(octokit.rest.issues.create).toHaveBeenCalledTimes(1)
    const callArg = vi.mocked(octokit.rest.issues.create).mock.calls[0]?.[0]
    expect(callArg).toBeDefined()
    if (!callArg) {
      throw new Error('Expected octokit issues.create call argument')
    }
    expect(callArg.owner).toBe('owner')
    expect(callArg.repo).toBe('repo')
    expect(callArg.title).toContain(serviceData.name)
    expect(callArg.body).toContain(serviceData.id)
    expect(callArg.labels).toEqual(expect.arrayContaining(['DASHBOARD', 'submission']))
    expect(callArg.assignees).toEqual(['owner'])

    expect(result).toEqual({ id: 123, html_url: 'https://github.com/owner/repo/issues/1' })
  })
})
