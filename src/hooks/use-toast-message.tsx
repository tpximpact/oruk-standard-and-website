import { useRef, useEffect } from 'react'
import { toast } from 'react-hot-toast'
import styles from './useToastMessage.module.css'

interface FormState {
  status?: string
  message?: string
  timestamp?: number
}

const useToastMessage = (formState: FormState) => {
  const prevTimestamp = useRef(formState.timestamp)

  const showToast = formState.message && formState.timestamp !== prevTimestamp.current

  useEffect(() => {
    if (showToast) {
      if (formState.status === 'ERROR') {
        toast.error(formState.message!)
      } else {
        toast.success(formState.message!)
      }

      prevTimestamp.current = formState.timestamp
    }
  }, [formState, showToast])

  // stay usable without JS
  return (
    <noscript>
      {formState.status === 'ERROR' && <div className={styles.error}>{formState.message}</div>}

      {formState.status === 'SUCCESS' && <div className={styles.success}>{formState.message}</div>}
    </noscript>
  )
}

export { useToastMessage }
