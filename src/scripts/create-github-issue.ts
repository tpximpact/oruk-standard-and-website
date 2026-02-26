#!/usr/bin/env node

/**
 * Utility script to manually create GitHub issues for existing services
 * Usage: node src/scripts/create-github-issue.js [serviceId]
 */

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { GitHubService } = require('../lib/github-service')
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { ServiceRepository } = require('../repositories/service-repository')

async function main() {
  const serviceId = process.argv[2]

  if (!serviceId) {
    console.error('Usage: node src/scripts/create-github-issue.js <serviceId>')
    process.exit(1)
  }

  try {
    // Get service from database
    const serviceRepo = new ServiceRepository()
    const service = await serviceRepo.findById(serviceId)

    if (!service) {
      console.error(`Service with ID ${serviceId} not found`)
      process.exit(1)
    }

    console.log(`Creating GitHub issue for service: ${service.name}`)

    // Create GitHub issue
    const githubService = new GitHubService()
    const issue = await githubService.createVerificationIssue({
      id: service.id,
      name: service.name,
      publisher: service.publisher,
      publisherUrl: service.publisherUrl,
      description: service.description,
      developer: service.developer,
      developerUrl: service.developerUrl,
      serviceUrl: service.serviceUrl,
      contactEmail: service.contactEmail,
      createdAt: service.createdAt,
      updateLink: service.updateLink
    })

    console.log(`Successfully created GitHub issue:`)
    console.log(`- Number: #${issue.number}`)
    console.log(`- URL: ${issue.url}`)
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error)
    console.error('Failed to create GitHub issue:', msg)
    process.exit(1)
  }
}

if (require.main === module) {
  main()
}
