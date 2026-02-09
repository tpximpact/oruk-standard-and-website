import styles from './Register.module.css'
import { PageMargin } from '@/components/PageMargin'
import { Form } from './Form'

export const Register = () => (
  <PageMargin>
    <div className={styles.Register}>
      <Form />
    </div>
  </PageMargin>
)
