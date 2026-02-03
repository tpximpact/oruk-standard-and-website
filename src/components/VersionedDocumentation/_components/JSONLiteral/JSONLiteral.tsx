'use client'
// https://github.com/microlinkhq/react-json-view
import ReactJsonView from '@microlink/react-json-view'
import styles from './JSONLiteral.module.css'

interface JSONLiteralProps {
  data: any
}

export const JSONLiteral = ({ data }: JSONLiteralProps) => (
  <ReactJsonView
    name={null}
    collapsed={2}
    collapseStringsAfterLength={48}
    enableClipboard={false}
    displayDataTypes={false}
    className={styles.jsonContainer}
    theme={{
      base00: '#000',
      base01: '#fff',
      base02: '#555', // indent brackets - doesnt need contrast
      base03: '#fff',
      base04: '#999', // counts
      base05: '#fff',
      base06: '#fff',
      base07: '#8bb4f7', // keys
      base08: '#fff',
      base09: '#fff',
      base0A: '#fff',
      base0B: '#fff',
      base0C: '#fff',
      base0D: '#fff', // twirlies
      base0E: '#fff',
      base0F: '#fff'
    }}
    src={data}
  />
)
