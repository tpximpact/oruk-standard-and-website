/*

Before creating a new icon consider using one from `https://github.com/mikolajdobrucki/ikonate`

Icons must:
- have artboard size of 24px x 24px
- use only lines, no fills
- (when output) contain exactly one element, a `<PATH>`

There are several ways to achieve this last one. Your first port of call should be to run `yarn svg`. This will generate optimised svg in `src/svg/optimised`. If this generates just paths, you're in - just copy and paste each one, separated by a space. If it no worky, then you will need to compromise with the artwork. Try adding a (redundant) bezier point to the path in Illustrator - this should force it to be a path. If all else fails, you may just need to redesign it.

*/

import React from 'react'
import css from './Icon.module.css'

export interface IconType {
  names: string[]
  path: string
}

interface IconProps {
  icon: IconType
  size?: number
  colour?: string
  weight?: number
}

interface CircledIconProps extends IconProps {
  bg?: string
  border?: number
}

const Icon = (props: IconProps) => {
  return (
    <svg
      className={`Icon ${css.svgStyles}`}
      width={`${props.size}px`}
      height={`${props.size}px`}
      viewBox='0 0 24 24'
    >
      <path
        vectorEffect='non-scaling-stroke'
        style={{
          stroke: props.colour ? props.colour : 'currentColor',
          strokeWidth: props.weight
        }}
        className={css.pathStyles}
        d={props.icon.path}
      />
    </svg>
  )
}

export default Icon

export const CircledIcon = (props: CircledIconProps) => (
  <div
    style={{ '--local-bg': props.bg, '--local-border': props.border || 0 } as React.CSSProperties}
    className={css.circle}
  >
    <Icon {...props} size={24} />
  </div>
)

export const findIconTypeNamed = (name: string): IconType | null => {
  name = name.toLowerCase()
  const hits = Object.keys(ICON_TYPE_DATA).filter(
    key => key.toLowerCase() === name || ICON_TYPE_DATA[key as ICON_TYPE].names.includes(name)
  )
  if (hits.length > 0) {
    return ICON_TYPE_DATA[hits[0] as ICON_TYPE]
  }
  return null
}

export enum ICON_TYPE {
  ADD = 'ADD',
  ARROWR = 'ARROWR',
  BUSY = 'BUSY',
  CHEVRON = 'CHEVRON',
  CHEVRONUP = 'CHEVRONUP',
  CLIPBOARD = 'CLIPBOARD',
  CONTROLS = 'CONTROLS',
  CROSS = 'CROSS',
  DOWNLOAD = 'DOWNLOAD',
  DRAG = 'DRAG',
  DRILLDOWN = 'DRILLDOWN',
  EDIT = 'EDIT',
  FILTER = 'FILTER',
  GEAR = 'GEAR',
  HOME = 'HOME',
  INFO = 'INFO',
  MAGNIFY = 'MAGNIFY',
  NEWWINDOW = 'NEWWINDOW',
  NEXT = 'NEXT',
  OK = 'OK',
  PIN = 'PIN',
  PLAY = 'PLAY',
  RDF = 'RDF',
  RIGHT = 'RIGHT',
  SORT_DOWN = 'SORT_DOWN',
  SORT_UP = 'SORT_UP',
  STAR = 'STAR',
  TRASH = 'TRASH',
  WARN = 'WARN',
  X = 'X'
}

export const ICON_TYPE_DATA: Record<ICON_TYPE, IconType> = {
  [ICON_TYPE.ADD]: {
    names: ['add', 'plus'],
    path: 'M17 12H7m5 5V7m0-5a10 10 0 1 0 0 20 10 10 0 1 0 0-20z'
  },
  [ICON_TYPE.ARROWR]: {
    names: [],
    path: 'M15 18l6-6-6-6 M3 12h17 M21 12h-1'
  },
  [ICON_TYPE.BUSY]: {
    names: ['busy', 'working'],
    path: 'M5 12h12v5a5 5 0 01-5 5h-2a5 5 0 01-5-5v-5zm12 1h2a2 2 0 012 2v0a2 2 0 01-2 2h-2M9 9s-1-.5-1-2 1-2 1-2m3-2s1 .5 1 2-1 2-1 2'
  },
  [ICON_TYPE.CHEVRON]: {
    names: ['down'],
    path: 'M6 10 12 16 18 10'
  },
  [ICON_TYPE.CHEVRONUP]: {
    names: ['down'],
    path: 'M8 14 14 8 20 14'
  },
  [ICON_TYPE.CLIPBOARD]: {
    names: ['clipboard'],
    path: 'M15 3h4v18H5V3h4 M14 4h-4a1 1 0 1 1 0-2h4a1 1 0 0 1 0 2z'
  },
  [ICON_TYPE.CONTROLS]: {
    names: [],
    path: 'M9 4a2 2 0 1 0 0 4 2 2 0 1 0 0-4zM4 6h3m4 0h9M9 16a2 2 0 1 0 0 4 2 2 0 1 0 0-4zm-5 2h3m4 0h9m-5-8a2 2 0 1 0 0 4 2 2 0 1 0 0-4zM4 12h9m4 0h3'
  },
  [ICON_TYPE.CROSS]: {
    names: [],
    path: 'M12 2a10 10 0 1 0 0 20 10 10 0 1 0 0-20zM8.5 8.9l7 6.9m-7 0l7-6.9'
  },
  [ICON_TYPE.DOWNLOAD]: {
    names: [],
    path: 'M12 3v13m-5-4l5 5 5-5m3 9H4'
  },
  [ICON_TYPE.DRAG]: {
    names: [],
    path: 'M6 7L18 7M6 12L18 12M6 17L18 17'
  },
  [ICON_TYPE.DRILLDOWN]: {
    names: [],
    path: 'M13.5 9l3 3-3 3m-6-3H15 M16.5 12H15 M12 2a10 10 0 100 20 10 10 0 100-20z'
  },
  [ICON_TYPE.EDIT]: {
    names: [],
    path: 'M18.4142136 4.41421356L19.5857864 5.58578644C20.366835 6.36683502 20.366835 7.63316498 19.5857864 8.41421356L8 20 4 20 4 16 15.5857864 4.41421356C16.366835 3.63316498 17.633165 3.63316498 18.4142136 4.41421356zM14 6L18 10'
  },
  [ICON_TYPE.FILTER]: {
    names: [],
    path: 'M10 12.261L4.028 3.972h16L14 12.329V17l-4 3z'
  },
  [ICON_TYPE.GEAR]: {
    names: ['gear'],
    path: 'M5.035 12.705a7.083 7.083 0 0 1 0-1.41l-1.83-2.063 2-3.464 2.702.553a6.99 6.99 0 0 1 1.222-.707L10 3h4l.871 2.614c.433.195.842.432 1.222.707l2.701-.553 2 3.464-1.83 2.063a7.083 7.083 0 0 1 0 1.41l1.83 2.063-2 3.464-2.701-.553a6.99 6.99 0 0 1-1.222.707L14 21h-4l-.871-2.614a6.993 6.993 0 0 1-1.222-.707l-2.701.553-2-3.464 1.83-2.063z M12 11a1 1 0 1 0 0 2 1 1 0 1 0 0-2z'
  },
  [ICON_TYPE.HOME]: {
    names: [],
    path: 'M2 12L5 9.3M22 12L19 9.3M19 9.3L12 3L5 9.3M19 9.3V21H5V9.3'
  },
  [ICON_TYPE.INFO]: {
    names: [],
    path: 'M12 11v5m0-7V8m0-6a10 10 0 1 0 0 20 10 10 0 1 0 0-20z'
  },
  [ICON_TYPE.MAGNIFY]: {
    names: [],
    path: 'M14.412 14.412L20 20M10 4a6 6 0 1 0 0 12 6 6 0 1 0 0-12z'
  },
  [ICON_TYPE.NEWWINDOW]: {
    names: [],
    path: 'M12.3,9.3h-7.4v11.6h11.6v-7.4 M21.2,10.8v-6.1h-6.2 M20.8,5l-4.5,4.5 M20.8,5l-8,8'
  },
  [ICON_TYPE.NEXT]: {
    names: [],
    path: 'M9 1.6l10 9.9-10 10'
  },
  [ICON_TYPE.OK]: {
    names: [],
    path: 'M4 13l5 5L20 7'
  },
  [ICON_TYPE.PIN]: {
    names: [],
    path: 'M12 8a1 1 0 1 0 0 2 1 1 0 1 0 0-2z M12,21 C16,16.8 18,12.8 18,9 C18,5.6862915 15.3137085,3 12,3 C8.6862915,3 6,5.6862915 6,9 C6,12.8 8,16.8 12,21 Z'
  },
  [ICON_TYPE.PLAY]: {
    names: [],
    path: 'M20 12L5 21V3z'
  },
  [ICON_TYPE.RDF]: {
    names: [],
    path: 'M15.6 15.3c.5-.3 1.1-.4 1.7-.4V9c-1.1-.1-2.1-.7-2.7-1.7l-5.9 3.4c.6 1 .6 2.2.1 3.2l5.5 3.2c.2-.7.6-1.4 1.3-1.8z M8.6 10.7c-.9-1.6-2.8-2.1-4.3-1.3-1.5.9-2 2.9-1 4.5.9 1.6 2.9 2.2 4.4 1.3.5-.3.9-.7 1.2-1.3M17.3 9c.6 0 1.2-.1 1.7-.4 1.5-.9 2-2.9 1-4.5S17.1 2 15.6 2.9c-1.5.9-2 2.9-1 4.5m-.4 9.7c-.3.9-.2 1.8.3 2.7.9 1.6 2.9 2.2 4.4 1.3 1.5-.9 2-2.9 1-4.5-.6-1-1.6-1.6-2.7-1.7'
  },
  [ICON_TYPE.RIGHT]: {
    names: [],
    path: 'M10 6l6 6-6 6h0'
  },
  [ICON_TYPE.SORT_DOWN]: {
    names: [],
    path: 'M11 9H17 M11 5H19 M11 13H15 M10 17L7 20L4 17 M7 5V19'
  },
  [ICON_TYPE.SORT_UP]: {
    names: [],
    path: 'M11 16H17 M11 20H19 M11 12H15 M4 8L7 5L10 8 M7 20L7 6'
  },
  [ICON_TYPE.STAR]: {
    names: [],
    path: 'M12 17.844l-5.817 3.058 1.111-6.477-4.706-4.587 6.504-.945L12 3l2.908 5.893 6.504.945-4.706 4.587 1.111 6.477z'
  },
  [ICON_TYPE.TRASH]: {
    names: [],
    path: 'M19 6H5m9-1h-4m-4 5v10c0 .667.333 1 1 1h10c.667 0 1-.333 1-1V10'
  },
  [ICON_TYPE.WARN]: {
    names: [],
    path: 'M12 10v3m0 3v-1m.9-10.5l8.3 14c.3.5.1 1.1-.4 1.4-.2.1-.4.1-.5.1H3.7c-.6 0-1-.4-1-1 0-.2 0-.4.1-.5l8.3-14c.3-.5.9-.7 1.4-.4.2.1.3.2.4.4z'
  },
  [ICON_TYPE.X]: {
    names: [],
    path: 'M6.34314575 6.34314575L17.6568542 17.6568542M6.34314575 17.6568542L17.6568542 6.34314575'
  }
}

// For backward compatibility, create an object that looks like the old ICON_TYPE
export const ICON_TYPE_COMPAT = Object.keys(ICON_TYPE_DATA).reduce(
  (acc, key) => {
    acc[key as keyof typeof ICON_TYPE] = ICON_TYPE_DATA[key as ICON_TYPE]
    return acc
  },
  {} as Record<string, IconType>
)
