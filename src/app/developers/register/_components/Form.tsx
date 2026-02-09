'use client'

import styles from './Register.module.css'
import { useActionState } from 'react'
import { createMessage } from '@/actions/service-actions'
import { SubmitButton } from './SubmitButton'
import { EMPTY_FORM_STATE } from '@/utilities/to-form-state'
import { useToastMessage } from '@/hooks/use-toast-message'
import { FieldError } from './FieldError'
import { useFormReset } from '@/hooks/use-form-reset'

interface FormState {
  status?: string
  updateLink?: string
  formData?: Record<string, any>
  fieldErrors?: Record<string, string[] | undefined>
  [key: string]: any
}

interface TextFieldProps {
  id: string
  label: string
  note?: string
  formState: FormState
}

const TextField = ({ id, label, note, formState }: TextFieldProps) => {
  const v = formState?.formData?.[id] ?? ''

  return (
    <div className={styles.Field}>
      <label htmlFor={id}>{label}</label>
      <input id={id} name={id} defaultValue={v} />
      <FieldError formState={formState} name={id} />
      {note ? <span className={styles.Note}>{note}</span> : null}
    </div>
  )
}

const TextArea = ({ id, label, note, formState }: TextFieldProps) => {
  const v = formState?.formData?.[id] ?? ''

  return (
    <div className={styles.Field}>
      <label htmlFor={id}>{label}</label>
      <textarea rows={4} cols={50} id={id} name={id} defaultValue={v} />
      <FieldError formState={formState} name={id} />
      {note ? <span className={styles.Note}>{note}</span> : null}
    </div>
  )
}

const Success = ({ link }: { link: string }) => {
  return (
    <div>
      <h3 id='success'>Registration request submitted</h3>
      <p style={{ margin: '2rem 0' }}>
        <strong>What happens next</strong>: Our team will review your feed. This is a
        human-moderated process and may take up to 28 days. When the review process is complete, we
        will send an email to the contact email address supplied.
      </p>
      <p>
        Our review process is open and transparent. If you would like to track the progress of your
        reqest, you can do so at{' '}
        <a href={link} target='_blank'>
          {link}
        </a>
        .
      </p>
    </div>
  )
}

export const Form = () => {
  const [formState, action] = useActionState(createMessage, EMPTY_FORM_STATE)

  const noScriptFallback = useToastMessage(formState)
  const formRef = useFormReset(formState)
  if (formState.status === 'SUCCESS') {
    return <Success link={formState.updateLink ?? ''} />
  }

  return (
    <form action={action} ref={formRef} className={styles.Form}>
      <fieldset>
        <h2>Your Service</h2>
        <TextField
          id='name'
          label='Name'
          note='The name of your service. e.g. Countyshire Activity'
          formState={formState}
        />
        <TextArea
          id='description'
          label='Description'
          note='A brief description of your service'
          formState={formState}
        />
        <TextField
          id='serviceUrl'
          label='URL'
          note='e.g. https:/example.com/my/oruk/api'
          formState={formState}
        />
      </fieldset>

      <fieldset>
        <h2>Service Publisher</h2>
        <TextField id='publisher' label='Publisher organisation name' formState={formState} />
        <TextField id='publisherUrl' label='Publisher organisation URL' formState={formState} />
        <TextField
          id='contactEmail'
          label='Publisher organisation  email address'
          formState={formState}
        />
      </fieldset>

      <fieldset>
        <h2>Service Developer</h2>
        <TextField id='developer' label='Developer organisation name' formState={formState} />
        <TextField id='developerUrl' label='Developer organisation URL' formState={formState} />
      </fieldset>

      <SubmitButton label='Register' loading='Registering ...' />

      {noScriptFallback}
    </form>
  )
}
