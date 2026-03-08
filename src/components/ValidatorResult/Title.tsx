import Icon from '@/components/Icon'
import Columns from '@/components/Columns'
import { Banner } from './Banner'
import { resultToStatus } from '@/utilities/resultToStatus'
import { getColourForStatus } from '@/utilities/getColourForStatus'
import { getIconForStatus } from '@/utilities/getIconForStatus'
import styles from './ValidatorResult.module.css'
import type { ValidationResultData } from './types'

interface TitleProps {
  result: ValidationResultData
}

export const Title = ({ result }: TitleProps) => {
  const status = resultToStatus(result)
  const colour = getColourForStatus(status)
  return (
    <header className={styles.header}>
      <h2 className={styles.title}>
        <span className={styles.titleDesc}>For the services at </span>
        <span id='serviceURL' className={styles.url}>
          {result.service.url}
        </span>
      </h2>
      <Columns layout='11'>
        <div className={styles.field}>
          <span className={styles.fieldLabel}>Overall result:</span>{' '}
          <span id='overallResult'>{result.service.isValid ? 'Pass' : 'Fail'}</span>
          <span className={styles.overallIcon}>
            <Icon colour={colour} weight={6} icon={getIconForStatus(status)} size={48} />
          </span>
        </div>
        <div className={styles.field}>
          <span className={styles.fieldLabel}>Profile:</span> {result.service.profile}
        </div>
      </Columns>
      {result.service.profile === 'HSDS-UK-1.0' && <Banner />}
    </header>
  )
}
