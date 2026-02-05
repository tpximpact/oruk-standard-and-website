import { PageMargin } from '@/components/PageMargin'
import { NamedMarkdownPage } from '@/components/NamedMarkdownPage'
import { ServiceRepository } from '@/repositories/service-repository'
import type { Metadata } from 'next'
import { DashboardTable } from './_components/DashboardTable'

export const metadata: Metadata = {
  title: 'ORUK verified feed availabilty'
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

  // Fetch services directly from MongoDB
  const repo = new ServiceRepository()
  const activeServices = await repo.find({ active: true })

  // Map to dashboard view shape expected by DataTable
  const serviceData = activeServices.map(s => {
    return {
      name: { value: s.name, url: s.serviceUrl },
      statusOverall: { value: s.statusOverall },
      statusIsUp: { value: s.statusIsUp },
      statusIsValid: { value: s.statusIsValid },
      schemaVersion: { value: String(s.schemaVersion || 'N/A') },
      lastTested: { value: s.lastTested, url: `/developers/dashboard/${s.id}` }
    }
  })

  return (
    <>
      <NamedMarkdownPage
        autoMenu={false}
        name='dashboard'
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
        <DashboardTable services={serviceData} currentPage={currentPage} itemsPerPage={10} />
      </PageMargin>
    </>
  )
}
