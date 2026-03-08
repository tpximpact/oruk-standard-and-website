import styles from './ValidatorResult.module.css'
import { Test } from './Test'
import type { ValidationTest } from './types'

interface GroupProps {
  data: ValidationTest[]
}

export const Group = ({ data }: GroupProps) => (
  <div className={styles.group}>
    {data.map((test, i) => (
      <Test key={i} data={test} />
    ))}
  </div>
)
