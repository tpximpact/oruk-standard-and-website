'use client'

import { useState, useEffect, Dispatch, SetStateAction } from 'react'
import styles from './Header.module.css'
import { PageMargin } from '@/components/PageMargin'
import { Logo } from '@/components/Logo'
import { Menu } from '@/components/Menu'
import Link from 'next/link'

interface MenuItem {
  label: string
  urlPath?: string
  childNodes?: unknown[]
  dynamicChildNodes?: unknown[]
  dynamicOverflow?: string
}

interface HeaderProps {
  items: MenuItem[]
  enableMenu?: boolean
}

export const Header = ({ items, enableMenu = false }: HeaderProps) => {
  const [showMenu, setShowMenu] = useState(false)

  return (
    <header>
      <Topbar enableMenu={enableMenu} showMenu={showMenu} setShowMenu={setShowMenu} />
      {showMenu ? (
        <Menu open={true} ariaName='mainmenu' items={items} setShowMenu={setShowMenu} />
      ) : (
        <Menu ariaName='mainmenu' items={items} setShowMenu={setShowMenu} />
      )}
    </header>
  )
}

interface TopbarProps {
  enableMenu: boolean
  showMenu: boolean
  setShowMenu: Dispatch<SetStateAction<boolean>>
}

const Topbar = ({ enableMenu, showMenu, setShowMenu }: TopbarProps) => {
  return (
    <div className={styles.Topbar}>
      <PageMargin>
        <div className={styles.content}>
          <div className={styles.left}>
            <Link href='/'>
              <Logo animate={false} />
            </Link>
          </div>
          <div className={styles.centre}></div>
          <div className={styles.right}>
            {enableMenu ? <MenuOpener showMenu={showMenu} setShowMenu={setShowMenu} /> : null}
          </div>
        </div>
      </PageMargin>
    </div>
  )
}

interface MenuOpenerProps {
  showMenu: boolean
  setShowMenu: Dispatch<SetStateAction<boolean>>
}

const MenuOpener = ({ showMenu, setShowMenu }: MenuOpenerProps) => {
  const [initialised, setInitialised] = useState(false)
  useEffect(() => {
    setInitialised(true)
  }, [])
  if (initialised) {
    return (
      <>
        {showMenu ? (
          <button className={styles.open} onClick={() => setShowMenu(false)}>
            <div>
              <span>Menu</span>
            </div>
          </button>
        ) : (
          <button className={styles.closed} onClick={() => setShowMenu(true)}>
            <div>
              <span>Menu</span>
            </div>
          </button>
        )}
      </>
    )
  } else {
    return (
      <Link className={styles.noJsLink} href='/sitemap'>
        MENU
      </Link>
    )
  }
}
