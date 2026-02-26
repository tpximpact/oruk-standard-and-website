import styles from './DashboardDetails.module.css'
import { getColourForStatus } from '@/utilities/getColourForStatus'
import { getIconForStatus } from '@/utilities/getIconForStatus'
import Icon from '@/components/Icon'
import { ReactNode } from 'react'

interface ResultPayload {
  label: string
  fields: FieldData[]
}

interface ResultData {
  title?: { value: string }
  serviceUrl?: { url: string; value: string }
  publisher?: { value: string }
  isValid: { value: string }
  lastTested: { value: string }
  payload: ResultPayload[]
}

interface DashboardDetailsProps {
  result: {
    result: ResultData
  }
}

export const DashboardDetails = ({ result }: DashboardDetailsProps) => {
  const data = result.result
  return (
    <div className={styles.details}>
      <h1>{getDetailsTitle(data)}</h1>
      <Field
        data={{
          label: 'Published by',
          value: getDetailsPublisher(data),
          dataType: 'oruk:dataType:string'
        }}
      />

      <Validation result={data} status={getDetailsStatus(data)} />

      {data.payload.map((payload, i) => (
        <Section data={payload} key={i} />
      ))}

      <div>
        <h2>Feed Data</h2>
        <Field
          data={{
            label: 'Feed URL',
            value: getDetailsURIValue(data),
            dataType: 'oruk:dataType:string'
          }}
        />
        <div style={{ background: 'lemonchiffon', padding: '1rem', borderRadius: '0.5rem' }}>
          Note: Open Referral feeds are <em>machine readable</em>, and are not designed for human
          readers or for display in a web browser.{' '}
          <a href={getDetailsURI(data)} target='_blank'>
            I understand: open the raw data in a new window
          </a>
        </div>
      </div>
    </div>
  )
}

const getDetailsStatus = (result: ResultData): string | null =>
  result.isValid.value ? result.isValid.value.toLowerCase() : null

interface ValidationProps {
  status: string | null
  result: ResultData
}

const Validation = ({ status, result }: ValidationProps) => {
  const colour = getColourForStatus(status)
  return (
    <section style={{ marginTop: '4rem' }}>
      <SectionHeading>
        Validation status:{' '}
        <Icon colour={colour} weight={4} icon={getIconForStatus(status)} size={48} />{' '}
        <span style={{ color: colour }}>{status}</span>
      </SectionHeading>

      <Field
        data={{
          label: 'Last checked',
          value: getDetailsLastTest(result),
          dataType: 'oruk:dataType:dateTime'
        }}
      />
    </section>
  )
}

const getDetailsTitle = (result: ResultData): string | undefined => result.title?.value
const getDetailsURI = (result: ResultData): string | undefined => result.serviceUrl?.url
const getDetailsURIValue = (result: ResultData): string | undefined => result.serviceUrl?.value
const getDetailsPublisher = (result: ResultData): string | undefined => result.publisher?.value

interface SectionProps {
  data: ResultPayload
}

const Section = ({ data }: SectionProps) => (
  <>
    {data.fields.length > 1 ? (
      <section style={{ marginTop: '4rem' }} className={styles.section}>
        <SectionHeading>{data.label}</SectionHeading>
        {data.fields.map((field, i) => (
          <Field data={field} key={i} />
        ))}
      </section>
    ) : null}
  </>
)

interface SectionHeadingProps {
  children: ReactNode
}

const SectionHeading = ({ children }: SectionHeadingProps) => <h2>{children}</h2>

interface FieldData {
  label: string
  value?: string
  url?: string
  dataType: string
}

interface FieldProps {
  data: FieldData
}

const Field = ({ data }: FieldProps) => {
  return (
    <div className={styles.field}>
      <span className={styles.label}>{data.label}</span>
      <FieldValue data={data} />
    </div>
  )
}

const FieldValue = ({ data }: FieldProps) => {
  let result
  switch (data.dataType) {
    case 'oruk:dataType:string':
      result = <FVString data={data.value} url={data.url} />
      break
    case 'oruk:dataType:dateTime':
      result = <FVDate data={data.value} />
      break
  }
  return result
}

interface FVStringProps {
  data?: string
  url?: string
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

const stringifyDateString = (s: string): string => {
  const result = Date.parse(s)
  const date = new Date(result)
  return date.toLocaleDateString('en-UK') + ', ' + date.toLocaleTimeString('en-UK')
}

interface FVDateProps {
  data?: string
}

const FVDate = ({ data }: FVDateProps) => (
  <FVString data={data ? stringifyDateString(data) : undefined} />
)

const getDetailsLastTest = (data: ResultData): string => data.lastTested.value
