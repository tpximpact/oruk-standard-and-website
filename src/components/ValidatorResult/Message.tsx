import styles from './ValidatorResult.module.css'
import Icon from '@/components/Icon'
import { STATUS } from '@/utilities/status'
import { getColourForStatus } from '@/utilities/getColourForStatus'
import { getIconForStatus } from '@/utilities/getIconForStatus'
import type { ValidationMessage } from './types'

interface MessageProps {
  data: ValidationMessage
}

export const Message = ({ data }: MessageProps) => (
  <div className={styles.message}>
    <p>
      {data.name}: <strong>{data.description}</strong>
    </p>
    <p>
      {data.message} {data.count && data.count > 1 ? `(x${data.count} occurences)` : null}{' '}
      <Icon
        colour={getColourForStatus(STATUS.FAIL)}
        weight={4}
        icon={getIconForStatus(STATUS.FAIL)}
        size={18}
      />
    </p>

    {data.parameters && (
      <p>
        {' '}
        When called with parameters
        <code>{JSON.stringify(data.parameters)}</code>
      </p>
    )}

    {data.errorIn && (
      <p>
        Error in:
        <code> {data.errorIn}</code>
      </p>
    )}
    {data.errorAt && (
      <p>
        Error at:
        <code> {data.errorAt}</code>
      </p>
    )}
  </div>
)
