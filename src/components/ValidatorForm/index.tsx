'use client'

import Link from 'next/link'
import Columns from '@/components/Columns'
import { v4 as uuidv4 } from 'uuid'
import styles from './ValidatorForm.module.css'
import { Button } from '@/components/Button'
import { useState, useRef, MouseEvent } from 'react'

const Heading = ({ title }: { title: string }) => <h2 className={styles.formHeading}>{title}</h2>

const Samples = () => (
  <div className={styles.samples}>
    <Heading title='Sample reports' />
    <p>For a quick preview of the results this tool reports, choose an example:</p>
    <ol className={styles.samplesList}>
      <li>
        <Link href='/developers/validator/edcf9d03-47dd-4c46-833b-e9831d505c72?uri=https://oruk-api-2a920f51d6bb.herokuapp.com/api/mock'>
          Pass
        </Link>
      </li>
      <li>
        <Link href='/developers/validator/edcf9d03-47dd-4c46-833b-e9831d505c72?uri=https://oruk-api-2a920f51d6bb.herokuapp.com/api/mock/warn'>
          Pass (with warnings)
        </Link>
      </li>
      <li>
        <Link href='/developers/validator/edcf9d03-47dd-4c46-833b-e9831d505c72?uri=https://oruk-api-2a920f51d6bb.herokuapp.com/api/mock/fail'>
          Fail
        </Link>
      </li>
    </ol>
  </div>
)

interface ValidatorFormProps {
  title?: string
  action?: string
  defaultValue?: string
}

export const ValidatorForm = (props: ValidatorFormProps) => (
  <div className={styles.formWrapper}>
    <Columns layout={'42'}>
      <Form {...props} />
      <Samples />
    </Columns>
  </div>
)

const Form = ({ title, action, defaultValue }: ValidatorFormProps) => {
  const UUID = uuidv4()
  const formRef = useRef<HTMLFormElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const [disabled, setDisabled] = useState(false)

  const submit = (e: MouseEvent<HTMLButtonElement>): void => {
    if (!inputRef.current?.value || inputRef.current.value.length === 0) {
      e.preventDefault()
      alert('please enter the URL of the data feed')
      return
    }
    if (!inputRef.current.reportValidity()) {
      e.preventDefault()
      return
    }

    setDisabled(true)
    formRef.current?.requestSubmit()
  }

  return (
    <div className={styles.form}>
      {title && <Heading title={title} />}
      <form ref={formRef} action={action}>
        <label className={styles.label}>
          URL
          <input
            ref={inputRef}
            type='URL'
            defaultValue={defaultValue}
            name='uri'
            placeholder='Enter URL to check'
          />
        </label>
        <span className={styles.example}>
          The <strong>base URL</strong> the ORUK data service e.g. <br />
          https://example.com/my-oruk-feed
        </span>
        <input type='hidden' name='id' value={UUID} />
        <Button onClick={submit} disabled={disabled}>
          Check
        </Button>
      </form>
    </div>
  )
}
