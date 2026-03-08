import styles from './ValidatorResult.module.css'
import Icon from '@/components/Icon'
import { STATUS } from '@/utilities/status'
import { getColourForStatus } from '@/utilities/getColourForStatus'
import { getIconForStatus } from '@/utilities/getIconForStatus'
import Columns from '@/components/Columns'
import { Message } from './Message'
import type { ValidationMessage, ValidationTest } from './types'
// import { Debug } from '@/utilities/Debug'

export const Test = (props: { data: ValidationTest }) => (
  <div
    className={styles.test}
    style={
      {
        '--statuscolor': getColourForStatus(props.data.status ?? STATUS.OTHER)
      } as React.CSSProperties
    }
  >
    <Columns layout='51' supressTrailingSpace>
      <PayloadColumn {...props} />
      <IconColumn {...props} />
    </Columns>
  </div>
)

const IconColumn = ({ data }: { data: ValidationTest }) => {
  const status = data.status ?? STATUS.OTHER

  return (
    <div className={styles.icon}>
      <div className={styles.testIcon}>
        <Icon colour='#fff' weight={4} icon={getIconForStatus(status)} size={48} />
      </div>
      <div className={styles.testText}>
        <span>{status === STATUS.PASS ? 'PASS' : 'FAIL'}</span>
      </div>
    </div>
  )
}

const PayloadColumn = ({ data }: { data: ValidationTest }) => (
  <div className={styles.payload}>
    <h3>{data.description}?</h3>
    {(data.messages as ValidationMessage[]).map((message, i: number) => (
      <Message key={i} data={message} />
    ))}
  </div>
)
