'use server'

import { revalidatePath } from 'next/cache'
import { fromErrorToFormState, toFormState } from '@/utilities/to-form-state'
import { ServiceRepository } from '@/repositories/service-repository'
import { ValidationError } from '@/lib/mongodb-errors'
import { serviceInputSchema, type ServiceInput } from '@/models/service'
import { createVerificationIssue } from '@/lib/github-service'
import { logger } from '@/lib/logger'

export const createMessage = async (_formState: any, formData: FormData): Promise<any> => {
  let data: ServiceInput
  let values: Record<string, unknown> | undefined
  let updateLink: string | undefined
  let html_url: string | undefined

  try {
    values = {
      name: formData.get('name'),
      publisher: formData.get('publisher'),
      publisherUrl: formData.get('publisherUrl'),
      description: formData.get('description'),
      developer: formData.get('developer'),
      developerUrl: formData.get('developerUrl'),
      serviceUrl: formData.get('serviceUrl'),
      contactEmail: formData.get('contactEmail')
    }
    data = serviceInputSchema.parse(values)
  } catch (error) {
    return fromErrorToFormState(error as Error, values)
  }

  try {
    // Save service using repository
    const serviceRepo = new ServiceRepository()
    const service = await serviceRepo.create({
      ...data
    })

    // Get update link from response
    // The response type includes updateLink
    updateLink = service.updateLink

    // Create GitHub issue for manual verification
    try {
      const issue = await createVerificationIssue(service)

      html_url = issue.html_url

      logger.info(`Created GitHub issue #${issue.number} for service verification: ${issue.url}`)
    } catch (githubError) {
      // Log the error but don't fail the entire operation
      // The service was successfully created, GitHub issue creation is supplementary
      logger.error('Failed to create GitHub issue for service verification:', githubError as Error)
    }
  } catch (error) {
    logger.error('Error creating service:', { error })

    if (error instanceof ValidationError) {
      return fromErrorToFormState(error, values)
    }
    return toFormState('ERROR', 'Failed to save service')
  }

  revalidatePath('/developers/register')

  const result: any = toFormState('SUCCESS', 'Service requested')
  ;(result as any).updateLink = updateLink
  ;(result as any).issueUrl = html_url
  return result
}
