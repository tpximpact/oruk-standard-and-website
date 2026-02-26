import styles from './SchemaProperty.module.css'
import { DocumentationLineItem } from '@/components/Documentation'
import { BadgeUnique, BadgeRequired } from '@/components/Badge'
import { filenameToName } from '@/utilities/filenameToName'

interface SchemaPropertyProps {
  parentKeyName: string
  data: any
  required?: boolean
  allSchemas: string[]
  useFullPath?: boolean
}

export const SchemaProperty = ({
  parentKeyName,
  data,
  required,
  allSchemas,
  useFullPath
}: SchemaPropertyProps) => (
  <DocumentationLineItem title={data.name || parentKeyName}>
    <div className={styles.title}>
      {data.title} <Badges required={required} data={data} />
    </div>

    <div className={styles.description}>{data.description}</div>

    <Datatype data={data} allSchemas={allSchemas} useFullPath={useFullPath} />
    <Length data={data} />
    <Pattern data={data} />
  </DocumentationLineItem>
)

const Pattern = ({ data }: { data: any }) => {
  if (data.pattern) {
    return (
      <div className={styles.pattern}>
        Pattern: <code>{data.pattern}</code>
      </div>
    )
  }
  return null
}

const Length = ({ data }: { data: any }) => {
  if (data.maxLength || data.minLength) {
    return (
      <div>
        Length {data.minLength && <>minimum: {data.minLength}</>}{' '}
        {data.maxLength && <>maximum: {data.maxLength}</>}
      </div>
    )
  }
  return null
}

const Badges = ({ data, required }: { data: any; required?: boolean }) => (
  <div className={styles.badges}>
    {required ? <BadgeRequired /> : null}

    {isUnique(data) ? <BadgeUnique /> : null}
  </div>
)

const isUnique = (data: any) => data.constraints && data.constraints.unique

const OfCopula = ({ useInstances }: { useInstances?: boolean }) => (
  <span className={styles.of}>{useInstances && ' of instances '}of</span>
)

const getType = (data: any) => {
  if (data.type === 'array' || data.items) return 'array'
  if (data.$ref) return 'object' // FIXME is this behaviour correct? Should it be an array?
  return data.type
}

const getFormat = ({
  type,
  data,
  allSchemas,
  useFullPath
}: {
  type: string
  data: any
  allSchemas: string[]
  useFullPath?: boolean
}) => {
  let format

  switch (type) {
    case 'array':
      format = (
        <>
          <OfCopula useInstances={true} />{' '}
          <LinkedReference data={data.items} useFullPath={useFullPath} />
        </>
      )
      break
    case 'object':
      format = <LinkedReference data={data} useFullPath={useFullPath} />
      break
    case 'string':
      if (data.format === 'uuid') {
        const model = propertyNameToModel(data.name)
        let linked
        if (model && allSchemas.includes(model)) {
          const modelData: any = {}
          modelData['$ref'] = model
          linked = (
            <>
              <OfCopula /> <LinkedReference data={modelData} useFullPath={useFullPath} />
            </>
          )
        }
        format = <>uuid {linked}</>
      } else if (data.enum) {
        format = <code className={styles.enumCode}>{data.enum.join(' | ')}</code>
      } else {
        format = data.format
      }
      break
    default:
      format = data.format
  }
  return format && <>: {format}</>
}

const Datatype = ({
  data,
  allSchemas,
  useFullPath
}: {
  data: any
  allSchemas: string[]
  useFullPath?: boolean
}) => {
  const type = getType(data)
  const format = getFormat({ type, data, allSchemas, useFullPath })

  return (
    <div className={styles.type}>
      {type}
      {format}
      {data.example && (
        <span className={styles.example}>
          e.g.: <code>{data.example}</code>
        </span>
      )}
    </div>
  )
}

const LinkedReference = ({ data, useFullPath }: { data: any; useFullPath?: boolean }) => {
  let target = `#${toAnchorName(data['$ref'])}`
  if (useFullPath) {
    target = '/developers/schemata' + target
  }
  return (
    <a href={target} className={styles.modelLink}>
      {toAnchorName(data['$ref'])}
    </a>
  )
}

const toAnchorName = (reference: string) => {
  // if there's a full path, get rid of it
  if (reference && reference.includes('/')) {
    reference = reference.split('/').pop() ?? reference
  }

  return filenameToName(reference)
}

const propertyNameToModel = (name: string) => {
  const suffix = '_id'
  return name && name.endsWith(suffix) ? name.replace(suffix, '') : null
}
