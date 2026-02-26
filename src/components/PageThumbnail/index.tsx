import styles from './PageThumbnail.module.css'
import Link from 'next/link'

interface PageThumbnailProps {
  path: string
  title: string
  slug?: string
  date?: string
  suppressDetails?: boolean
  offsite?: boolean
}

export const PageThumbnail = ({ offsite, ...props }: PageThumbnailProps) => (
  <>{offsite ? <OffsiteThumbnail {...props} /> : <LocalThumbnail {...props} />}</>
)

type LocalThumbnailProps = Omit<PageThumbnailProps, 'offsite'>

const LocalThumbnail = ({ path, ...props }: LocalThumbnailProps) => (
  <Link href={'/' + path} className={styles.thumbnail}>
    <Payload {...props} />
  </Link>
)

type OffsiteThumbnailProps = Omit<PageThumbnailProps, 'offsite'>

const OffsiteThumbnail = ({ path, suppressDetails, ...props }: OffsiteThumbnailProps) => (
  <a href={path} className={styles.thumbnail} target='_blank'>
    <Payload offsite={true} suppressDetails={suppressDetails} {...props} />
    {!suppressDetails && (
      <span className={styles.itemBody}>
        <em>{path}</em> opens in a new window
      </span>
    )}
  </a>
)

interface PayloadProps {
  title: string
  slug?: string
  date?: string
  suppressDetails?: boolean
  offsite?: boolean
}

const Payload = ({
  title,
  //date,
  slug,
  suppressDetails,
  offsite
}: PayloadProps) => (
  <span>
    <span className={styles.itemHeading}>
      {title} {offsite && '⤤'}
    </span>
    {!suppressDetails && (
      <>
        {slug && <span className={styles.itemBody}>{slug}</span>}
        {/*date && <span className={styles.itemDate}>{date}</span>*/}
      </>
    )}
  </span>
)
