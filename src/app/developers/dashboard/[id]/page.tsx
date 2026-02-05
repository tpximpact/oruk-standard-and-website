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
function transformServiceForDashboard(service: any) {
  const extractValue = (field: any): any => {
    if (field === null || field === undefined) return ''
    if (typeof field === 'object' && field.value !== undefined) return field.value
    return field
  }

  const extractUrl = (obj: any, fallback?: string): string => {
    if (!obj) return fallback ?? ''
    if (typeof obj === 'object' && obj.url !== undefined) return obj.url
    return fallback ?? ''
  }

  // Support both the repository's flat ServiceResponse and the nested DB document
  const title = extractValue(service.name ?? service.title)
  const publisherValue = extractValue(service.publisher)
  const publisherUrl = service.publisherUrl ?? extractUrl(service.publisher)
  const developerValue = extractValue(service.developer)
  const developerUrl = service.developerUrl ?? extractUrl(service.developer)
  const serviceValue = extractValue(service.service ?? service.name)
  const serviceUrl = service.serviceUrl ?? extractUrl(service.service)
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
