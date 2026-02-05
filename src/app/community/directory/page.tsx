import { ServicesTable } from './_components/ServicesTable'
import { ServiceRepository } from '@/repositories/service-repository'
import { PageMargin } from '@/components/PageMargin'
import { NamedMarkdownPage } from '@/components/NamedMarkdownPage'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'ORUK directory'
}

interface PageProps {
  searchParams: Promise<{
    page?: string
    sort?: string
    direction?: string
  }>
}

export default async function Page(props: PageProps) {
  const searchParams = await props.searchParams
  // server-side: fetch services directly from the database via repository
  const currentPage = searchParams.page ? parseInt(searchParams.page) : 1

  const repo = new ServiceRepository()
  const activeServices = await repo.find({ active: true })

  // Map services into the shape expected by ServicesTable
  const serviceData = activeServices.map(s => {
    // Safely extract string values, handling potential nested objects
    const getName = () => {
      if (typeof s.name === 'string') return s.name
      if (s.name && typeof s.name === 'object' && 'value' in s.name)
        return String((s.name as any).value)
      return s.name ? String(s.name) : 'N/A'
    }

    const getPublisher = () => {
      if (typeof s.publisher === 'string') return s.publisher
      if (s.publisher && typeof s.publisher === 'object' && 'value' in s.publisher)
        return String((s.publisher as any).value)
      return s.publisher ? String(s.publisher) : 'N/A'
    }

    const getPublisherUrl = () => {
      if (typeof s.publisherUrl === 'string') return s.publisherUrl
      if (s.publisher && typeof s.publisher === 'object' && 'url' in s.publisher)
        return String((s.publisher as any).url)
      return s.publisherUrl ? String(s.publisherUrl) : 'No URL provided'
    }

    const getDescription = () => {
      if (typeof s.description === 'string') return s.description
      if (s.description && typeof s.description === 'object' && 'value' in s.description)
        return String((s.description as any).value)
      return s.description ? String(s.description) : 'N/A'
    }

    const getDeveloper = () => {
      if (typeof s.developer === 'string') return s.developer
      if (s.developer && typeof s.developer === 'object' && 'value' in s.developer)
        return String((s.developer as any).value)
      return s.developer ? String(s.developer) : 'N/A'
    }

    const getDeveloperUrl = () => {
      if (typeof s.developerUrl === 'string') return s.developerUrl
      if (s.developer && typeof s.developer === 'object' && 'url' in s.developer)
        return String((s.developer as any).url)
      return s.developerUrl ? String(s.developerUrl) : 'No URL provided'
    }
    const getServiceUrl = () => {
      if (typeof s.serviceUrl === 'string') return s.serviceUrl
      if (s.service && typeof s.service === 'object' && 'url' in s.service)
        return String((s.service as any).url)
      return s.serviceUrl ? String(s.serviceUrl) : 'No URL provided'
    }

    return {
      name: { value: getName(), url: getServiceUrl() },
      publisher: { value: getPublisher(), url: getPublisherUrl() },
      comment: { value: getDescription() },
      developer: { value: getDeveloper(), url: getDeveloperUrl() },
      lastTested: { value: s.lastTested, url: `/developers/dashboard/${s.id}` }
    }
  })

  return (
    <>
      <NamedMarkdownPage
        autoMenu={false}
        name='directory'
        noMargin={undefined}
        markdownRaw={undefined}
      />
      <PageMargin>
        <div style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
            Service Directory
          </h2>
          <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>
            Browse and search through registered ORUK services. Click on any service name or
            publisher to view more details.
          </p>
        </div>
        <ServicesTable services={serviceData} currentPage={currentPage} itemsPerPage={10} />
      </PageMargin>
    </>
  )
}
