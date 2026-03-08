import styles from './RenderAPI.module.css'

type JsonLeaf = string | number | boolean | null
type JsonObject = Record<string, unknown>

const Item = ({ name, content }: { name: string; content: React.ReactNode }) => (
  <div className={styles.property}>
    <dt>{name}</dt>
    <dd>{content}</dd>
  </div>
)

const Property = ({
  name,
  data,
  references
}: {
  name: string
  data: unknown
  references: JsonObject
}) => {
  if (typeof data === 'string') {
    return <Item name={name} content={data} />
  }

  if (typeof data === 'boolean') {
    return <Item name={name} content={data ? ': true' : ': false'} />
  }

  // Render array or object
  let content: React.ReactNode
  if (Array.isArray(data)) {
    if (typeof data[0] === 'object') {
      content = (
        <>
          {data.map((d, i) => (
            <List key={i} data={d} references={references} />
          ))}
        </>
      )
    } else {
      content = data.join(', ')
    }
  } else if (typeof data === 'object' && data !== null) {
    content = <List data={data} references={references} />
  } else {
    content = String(data as JsonLeaf)
  }

  return <Item name={name} content={content} />
}

// Render a reference
const Reference = ({ data, references }: { data: string; references: JsonObject }) => {
  const referent = data.split('/').slice(-1)[0] || ''
  return <Property name={referent} data={'(instance)'} references={references} />
}

// Render a list
const List = ({ data, references }: { data: unknown; references: JsonObject }) => (
  <dl>
    {typeof data === 'string'
      ? data
      : Object.keys(data as JsonObject)
          .sort()
          .map((k, i) =>
            k === '$ref' ? (
              <Reference key={i} data={String((data as JsonObject)[k])} references={references} />
            ) : (
              <Property key={i} name={k} data={(data as JsonObject)[k]} references={references} />
            )
          )}
  </dl>
)

// Render a method
const Method = ({
  methodName,
  data,
  references
}: {
  methodName: string
  data: JsonObject
  references: JsonObject
}) => (
  <div className={styles.method}>
    <h3>{methodName}</h3>
    <List data={data} references={references} />
  </div>
)

// Render a path
const Path = ({
  pathName,
  data,
  references
}: {
  pathName: string
  data: JsonObject
  references: JsonObject
}) => (
  <div className={styles.path}>
    <h2>{pathName}</h2>
    {Object.keys(data)
      .sort()
      .map(k => (
        <Method key={k} methodName={k} data={data[k] as JsonObject} references={references} />
      ))}
  </div>
)

// Main RenderAPI component
export const RenderAPI = ({
  data
}: {
  data: { paths: JsonObject; components: { schemas: JsonObject } }
}) => {
  const paths = data.paths
  return (
    <div>
      {Object.keys(paths)
        .sort()
        .map(k => (
          <Path
            key={k}
            pathName={k}
            data={paths[k] as JsonObject}
            references={data.components.schemas}
          />
        ))}
    </div>
  )
}
