import { DocumentationFeatureSection, DocumentationLineItem } from '@/components/Documentation'
import { BadgeRequired, BadgeInPath } from '@/components/Badge'
import styles from './Parameters.module.css'

interface ParameterSchema {
  type?: string
}

interface ParameterData {
  $ref?: string
  in?: string
  required?: boolean
  name?: string
  description?: string
  schema?: ParameterSchema
}

interface ParametersProps {
  data: ParameterData[]
  parametersReferences: Record<string, ParameterData>
}

export const Parameters = ({ data, parametersReferences }: ParametersProps) => {
  return (
    <DocumentationFeatureSection title='Parameters'>
      {data.map((p, i: number) => (
        <Parameter parametersReferences={parametersReferences} key={i} data={p} />
      ))}
    </DocumentationFeatureSection>
  )
}

const propertyInPath = (data: ParameterData) => data.in === 'path'
const propertyRequired = (data: ParameterData) => data.required

interface BadgesProps {
  data: ParameterData
}

const Badges = ({ data }: BadgesProps) =>
  (propertyInPath(data) || propertyRequired(data)) && (
    <span
      style={{
        display: 'inline-block'
      }}
      className={styles.Badges}
    >
      {propertyInPath(data) && <BadgeInPath />}
      {propertyRequired(data) && <BadgeRequired />}
    </span>
  )

interface ParameterProps {
  data: ParameterData
  parametersReferences: Record<string, ParameterData>
}

const Parameter = ({ data, parametersReferences }: ParameterProps) => {
  let resolvedData = data

  if (data.$ref) {
    const name = data.$ref.replace('#/components/parameters/', '')
    if (parametersReferences[name]) {
      resolvedData = parametersReferences[name]
    }
  }

  return (
    <DocumentationLineItem title={resolvedData.name ?? ''}>
      <Badges data={resolvedData} />
      {resolvedData.description && (
        <div className={styles.description}>{resolvedData.description}</div>
      )}
      {resolvedData.schema && <Schema data={resolvedData.schema} />}
    </DocumentationLineItem>
  )
}

interface SchemaProps {
  data: ParameterSchema
}

const Schema = ({ data }: SchemaProps) => (
  <div className={styles.schema}>
    <span className={styles.type}>{data.type}</span>
  </div>
)
