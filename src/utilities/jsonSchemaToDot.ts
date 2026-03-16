// dot is based on https://github.com/softwaretechnik-berlin/dbml-renderer/tree/master/examples

import { wrapString } from './wrapString'

const TEXT_COLOUR = '#000000'
const HEADER_BG_COLOUR = '#000000'
const HEADER_FG_COLOUR = '#ffffff'
const ROW_BG_COLOUR = '#fafafa'
const DESCRIPTION_FG_COLOUR = '#777777'

const CONFIG = `
      rankdir=LR;
      graph [fontname="helvetica", fontsize=32, fontcolor="#000", bgcolor="transparent"];
      node [penwidth=0, margin=0, fontname="helvetica", fontsize=32, fontcolor="#000"];
      edge [fontname="helvetica", fontsize=32, fontcolor="#000000", color="#000000"];
`

interface Connection {
  fromTable: string
  fromPort: number
  toTable: string
  toPort: number
}

const connection = ({ fromTable, fromPort, toTable, toPort }: Connection): string =>
  `"${fromTable}":f${fromPort}:e -> "${toTable}":f${toPort}:w [dir=forward, penwidth=3, color="#000"]`

const description = (text: string): string => {
  const allLines = wrapString(text, 30)
  return allLines
    .map(
      line =>
        `<TR><TD COLSPAN="2" ALIGN="LEFT"><FONT COLOR="${DESCRIPTION_FG_COLOUR}">${line}</FONT></TD>}</TR>`
    )
    .join(' ')
}

interface Schema {
  properties: Record<string, Property>
}

interface Property {
  type: string
  description?: string
  [key: string]: unknown
}

const table = (schema: Schema, name: string): string => `
    "${name}" [
        id="${name}";
        label=<<TABLE BORDER="2" COLOR="${TEXT_COLOUR}" CELLBORDER="1" CELLSPACING="0" CELLPADDING="10">
        <TR><TD PORT="f0" BGCOLOR="${HEADER_BG_COLOUR}"><FONT COLOR="${HEADER_FG_COLOUR}"><B>                    ${name}                  </B></FONT></TD></TR>
        ${Object.keys(schema.properties)
          .map((key, n) => {
            const property = schema.properties[key]
            if (!property) return ''
            return row(key, property, n + 1)
          })
          .join(' ')}
    </TABLE>>];
    `

const row = (name: string, property: Property, n: number): string => `<TR>
    <TD ALIGN="LEFT" PORT="f${n}" BGCOLOR="${ROW_BG_COLOUR}">
        <TABLE CELLPADDING="0" CELLSPACING="0" BORDER="0">
            <TR>
                <TD ALIGN="LEFT"><B>${name}</B></TD>
                <TD ALIGN="RIGHT"><I>${property.type}</I></TD>
            </TR>
            ${property.description && description(property.description)}
        </TABLE>
    </TD>
    </TR>`

interface Data {
  components: {
    schemas: Record<string, Schema>
  }
}

const makeTables = (data: Data): string => {
  const components = data.components
  const schemas = components.schemas
  return Object.keys(schemas)
    .map(key => {
      const schema = schemas[key]
      if (!schema) return ''
      const str = table(schema, key)
      return str
    })
    .join(' ')
}

export const jsonSchemaToDot = (data: Data): string => `
        digraph dbml {
            ${CONFIG}
            ${makeTables(data)}
            ${connection({
              fromTable: 'location_details',
              fromPort: 3,
              toTable: 'organization_details',
              toPort: 1
            })}
        }
    `
