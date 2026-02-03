import styles from './VersionedDocumentation.module.css'
import Columns from '@/components/Columns'

const Picker = ({
  setVersion,
  isCurrent,
  allVersions,
  version
}: {
  setVersion: (v: string) => void
  isCurrent: boolean
  allVersions: string[]
  version: string
}) => (
  <div>
    <select id='picker' onChange={({ target: { value } }) => setVersion(value)} value={version}>
      {allVersions.map((value: string) => (
        <option key={value} value={value}>
          v{value}
        </option>
      ))}
    </select>
    <label htmlFor='picker'>{isCurrent ? 'Current' : 'Legacy'} version</label>
  </div>
)

const Message = ({
  setVersion,
  isCurrent,
  currentVersion
}: {
  setVersion: (v: string) => void
  isCurrent: boolean
  currentVersion: string
}) => (
  <div className={styles.banner}>
    {isCurrent ? (
      <>
        <p>You can choose which version of the standard this page describes.</p>

        <p className={styles.boldText}>
          This is the latest version of the standard and is recommended for all users.
        </p>
      </>
    ) : (
      <>
        <p className={styles.boldText}>This is an archived obsolete version of the standard.</p>
        <p>
          For new projects, we strongly recommend you to use{' '}
          <a
            href='#'
            onClick={() => {
              setVersion(currentVersion)
            }}
            className={styles.boldText}
          >
            the latest version{' '}
          </a>
          instead
        </p>
      </>
    )}
  </div>
)

export const VersionedBanner = ({
  allVersions,
  version,
  setVersion
}: {
  allVersions: string[]
  version: string
  setVersion: (v: string) => void
}) => {
  const currentVersion = allVersions[0] || ''
  const isCurrent = version === currentVersion

  const colourClass = isCurrent ? styles.current : styles.legacy
  return (
    <div className={`${styles.box} ${colourClass}`}>
      <Columns layout='31'>
        <Message currentVersion={currentVersion} setVersion={setVersion} isCurrent={isCurrent} />
        <Picker
          version={version}
          setVersion={setVersion}
          isCurrent={isCurrent}
          allVersions={allVersions}
        />
      </Columns>
    </div>
  )
}
