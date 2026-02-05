import styles from './DashboardDetails.module.css'
import { getColourForStatus } from '@/utilities/getColourForStatus'
import { getIconForStatus } from '@/utilities/getIconForStatus'
import Icon from '@/components/Icon'
import { ReactNode } from 'react'
import LocalisedDate from '@/app/community/directory/_components/ServicesTable/_components/LocalisedDate'

interface ServiceUrl {
  url?: string
  value?: string
}

interface TestResult {
  title?: { value?: string }
  serviceUrl?: ServiceUrl
  publisher: { value: string; url: string }
  developer: { value: string; url: string }
  service: { value: string; url: string }
  isValid: boolean
  lastTested: { value: Date | undefined }
  payload: SectionData[]
}

interface DashboardDetailsProps {
  result: {
    result: TestResult
  }
}

interface FieldData {
  label: string
  value?: string
  url?: string
}

interface SectionData {
  label: string
  fields: FieldData[]
}

interface ValidationProps {
  status: string | null
  result: TestResult
}

interface SectionProps {
  data: SectionData
  key?: React.Key
}

interface SectionHeadingProps {
  children: ReactNode
}

interface FieldProps {
  data: FieldData
  key?: React.Key
}

interface FVStringProps {
  data?: string
  url?: string
}

export const DashboardDetails = ({ result }: DashboardDetailsProps) => {
  const testResult = result.result
  // console.log('Rendering DashboardDetails for:', testResult)
  return (
    <div className={styles.details}>
      <h1>{getDetailsTitle(testResult)}</h1>
      <Field
        data={{
          label: 'Published by',
          value: getDetailsPublisher(testResult)
        }}
      />

      <Validation result={testResult} status={getDetailsStatus(testResult)} />

      {testResult.payload.map((data, i) => (
        <Section data={data} key={i} />
      ))}

      <div>
        <h2>Feed Data</h2>
        <Field
          data={{
            label: 'Feed URL',
            value: testResult.service.url
          }}
        />

        <div className={styles.feedNote}>
          Note: Open Referral feeds are <em>machine readable</em>, and are not designed for human
          readers or for display in a web browser.{' '}
          <a href={testResult.service.url} target='_blank'>
            I understand: open the raw data in a new window
          </a>
        </div>
      </div>
    </div>
  )
}

const getDetailsStatus = (result: TestResult): string | null => (result.isValid ? 'pass' : 'fail')

const Validation = ({ status, result }: ValidationProps) => {
  const statusText = getDetailsStatus(result)
  const colour = getColourForStatus(statusText)
  const fmtOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    timeZoneName: 'short'
  }

  return (
    <section className={styles.validationSection}>
      <SectionHeading>
        <span className={styles.validationStatus}>
          Validation status:{' '}
          <Icon colour={colour} weight={4} icon={getIconForStatus(status)} size={48} />{' '}
          <span style={{ color: colour }}>{status}</span>
        </span>
      </SectionHeading>

      <div className={styles.field}>
        <span className={styles.label}>Last checked</span>
        <span className={styles.fv}>
          {result.lastTested.value ? (
            <LocalisedDate value={result.lastTested.value} options={fmtOptions} />
          ) : (
            <>Not Tested</>
          )}
        </span>
      </div>
    </section>
  )
}

const getDetailsTitle = (result: TestResult): string | undefined => result.title?.value
const getDetailsPublisher = (result: TestResult): string | undefined => result.publisher?.value

const Section = ({ data }: SectionProps) => (
  <>
    {data.fields.length > 1 ? (
      <section style={{ marginTop: '4rem' }} className={styles.section}>
        <SectionHeading>{data.label}</SectionHeading>
        {data.fields.map((field, i) => (
          <div className={styles.field} key={i}>
            <span className={styles.label}>{data.label}</span>
            <FVString data={field.value} url={field.url} />
          </div>
        ))}
      </section>
    ) : null}
  </>
)

const SectionHeading = ({ children }: SectionHeadingProps) => <h2>{children}</h2>

const Field = ({ data }: FieldProps) => {
  return (
    <div className={styles.field}>
      <span className={styles.label}>{data.label}</span>
      <FVString data={data.value} url={data.url} />
    </div>
  )
}

const FVString = ({ data, url }: FVStringProps) => {
  if (url) {
    return (
      <a className={styles.fv} href={url}>
        {data} ({url})
      </a>
    )
  }
  return <span className={styles.fv}>{data}</span>
}
