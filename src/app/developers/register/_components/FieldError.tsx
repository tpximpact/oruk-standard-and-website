import styles from './Register.module.css'

interface FieldErrorProps {
  formState: {
    fieldErrors?: Record<string, string[] | undefined>
  }
  name: string
}

const FieldError = ({ formState, name }: FieldErrorProps) => {
  return <span className={'error ' + styles.Error}>{formState.fieldErrors?.[name]?.[0]}</span>
}

export { FieldError }
