import { ServiceRepository } from '@/repositories/service-repository'
import { DashboardDetails } from './_components/DashboardDetails'
import { PageMargin } from '@/components/PageMargin'
import { notFound } from 'next/navigation'

interface PageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata() {
  return {
    title: `ORUK data feed report`,
    description: 'Detail view'
  }
}

// Transform ServiceResponse (flat) or nested DB doc to the format expected by DashboardDetails
function transformServiceForDashboard(service: Record<string, unknown>) {
  const extractValue = (field: unknown): unknown => {
    if (field === null || field === undefined) return ''
    if (typeof field === 'object' && field !== null && 'value' in field)
      return (field as { value?: unknown }).value
    return field
  }

  const extractUrl = (obj: unknown, fallback?: string): string => {
    if (!obj) return fallback ?? ''
    if (typeof obj === 'object' && obj !== null && 'url' in obj) {
      const url = (obj as { url?: unknown }).url
      return typeof url === 'string' ? url : (fallback ?? '')
    }
    return fallback ?? ''
  }

  // Support both the repository's flat ServiceResponse and the nested DB document
  const title = extractValue(service.name ?? service.title)
  const publisherValue = extractValue(service.publisher)
  const publisherUrl =
    typeof service.publisherUrl === 'string' ? service.publisherUrl : extractUrl(service.publisher)
  const developerValue = extractValue(service.developer)
  const developerUrl =
    typeof service.developerUrl === 'string' ? service.developerUrl : extractUrl(service.developer)
  const serviceValue = extractValue(service.service ?? service.name)
  const serviceUrl =
    typeof service.serviceUrl === 'string' ? service.serviceUrl : extractUrl(service.service)
  const isValid =
    service.statusIsValid && typeof service.statusIsValid === 'boolean'
      ? service.statusIsValid
      : extractValue(service.statusIsValid)

  return {
    result: {
      title: { value: title },
      publisher: { value: publisherValue, url: publisherUrl },
      developer: { value: developerValue, url: developerUrl },
      service: { value: serviceValue, url: serviceUrl },
      isValid: Boolean(isValid),
      lastTested: { value: service.lastTested },
      payload: [
        {
          label: 'Service Details',
          fields: [
            { label: 'Name', value: title, dataType: 'oruk:dataType:string', url: serviceUrl },
            {
              label: 'Developed By',
              value: developerValue,
              dataType: 'oruk:dataType:string',
              url: developerUrl
            },
            {
              label: 'Published By',
              value: publisherValue,
              dataType: 'oruk:dataType:string',
              url: publisherUrl
            },
            {
              label: 'Comment',
              value: extractValue(service.comment),
              dataType: 'oruk:dataType:string'
            },
            {
              label: 'Description',
              value: extractValue(service.description),
              dataType: 'oruk:dataType:string'
            },
            {
              label: 'Schema Version',
              value: extractValue(service.schemaVersion) || service.schemaVersion,
              dataType: 'oruk:dataType:string'
            }
          ]
        }
      ]
    }
  }
}

export default async function Page({ params }: PageProps) {
  const { id } = await params

  const serviceRepository = new ServiceRepository()
  const service = await serviceRepository.findById(id)

  if (!service) {
    notFound()
  }

  const dashboardData = transformServiceForDashboard(service)

  return (
    <PageMargin>
      <DashboardDetails result={dashboardData} />
    </PageMargin>
  )
}
