'use client'

import { useFormStatus } from 'react-dom'
import styles from './Register.module.css'

interface SubmitButtonProps {
  label: string
  loading: string
}

export const SubmitButton = ({ label, loading }: SubmitButtonProps) => {
  const { pending } = useFormStatus()

  return (
    <button className={styles.SubmitButton} disabled={pending} type='submit'>
      {pending ? loading : label}
    </button>
  )
}
