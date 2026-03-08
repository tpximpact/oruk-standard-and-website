'use client'

import { useState } from 'react'
import styles from './ValidatorResult.module.css'
import { Group } from './Group'
import { Path } from '@/components/APIModel'
import type { ApiDocsData, EndpointData, ValidationTest } from './types'

import { APIRequest } from './APIRequest'

export const TabsMenu = ({
  tabData,
  activeTab,
  setActiveTab
}: {
  tabData: { id: string; title: string; content: React.ReactNode }[]
  activeTab: string
  setActiveTab: (id: string) => void
}) => (
  <div className={styles.tabs}>
    {tabData.map(tab => (
      <button
        key={tab.id}
        className={activeTab === tab.id ? styles.activeTab : ''}
        onClick={() => setActiveTab(tab.id)}
      >
        {tab.title}
      </button>
    ))}
  </div>
)

export const TabsContent = ({
  tabData,
  activeTab
}: {
  tabData: { id: string; title: string; content: React.ReactNode }[]
  activeTab: string
}) => <div className={styles.tabContent}>{tabData.find(tab => tab.id === activeTab)?.content}</div>

const ValidationTab = ({ groups }: { groups: Record<string, ValidationTest[]> }) => (
  <div>
    {Object.keys(groups).map((k, i) => (
      <Group key={i} data={groups[k] || []} />
    ))}
  </div>
)

const DocsTab = ({ apiData, path }: { apiData?: ApiDocsData; path: string }) => {
  if (!apiData) {
    return null
  }

  const endpoints = apiData.rootSpec.parsed.paths
  const parametersReferences = apiData.rootSpec.parsed.components.parameters

  return (
    <Path
      twirledOpen
      hidePathTitle={true}
      path={path}
      allData={apiData}
      parametersReferences={parametersReferences}
      data={endpoints[path]}
    />
  )
}

const profileNameToVersionNumber = (name: string) => {
  const atoms = name.split('-')
  return atoms.reverse().shift()
}

const getExampleId = (data: EndpointData): string | number | undefined => {
  let id: string | number | undefined
  const firstKey = Object.keys(data.groups)[0]
  const defaultGroup = firstKey ? data.groups[firstKey] : undefined

  if (defaultGroup) {
    const defaultItem = defaultGroup[0]
    if (defaultItem) {
      id = defaultItem.id
    }
  }
  return id
}

export const Endpoint = ({
  rootPath,
  path,
  data,
  apiData,
  profile
}: {
  rootPath: string
  path: string
  data: EndpointData
  apiData: Record<string, ApiDocsData>
  profile: string
}) => {
  const profileVersion = profileNameToVersionNumber(profile)
  const exampleId = getExampleId(data)
  const [activeTab, setActiveTab] = useState('Tab 1')

  const tabs = [
    { id: 'Tab 1', title: 'Validation', content: <ValidationTab groups={data.groups} /> },
    {
      id: 'Tab 2',
      title: 'API Request',
      content: <APIRequest apiPath={path} exampleId={exampleId} src={rootPath} />
    },
    {
      id: 'Tab 3',
      title: 'Docs',
      content: (
        <DocsTab path={path} apiData={profileVersion ? apiData[profileVersion] : undefined} />
      )
    }
  ]

  path = path.replace(rootPath, '')

  return (
    <section className={styles.section}>
      <header className={styles.endpointContainer}>
        <div className={styles.endpointContainerLeft}>
          <h2>
            <span className={styles.light}>API path</span>
            <span>{path}</span>
          </h2>
        </div>

        <div className={styles.endpointContainerRight}>
          <TabsMenu tabData={tabs} activeTab={activeTab} setActiveTab={setActiveTab} />
        </div>
      </header>

      <div>
        <TabsContent tabData={tabs} activeTab={activeTab} />
      </div>
    </section>
  )
}
