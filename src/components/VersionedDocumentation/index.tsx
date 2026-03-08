'use client'

import { VersionedBanner } from './VersionedBanner'
import { MarkdownContent } from './MarkdownContent'
import { useState, useEffect } from 'react'
import { useCookies } from 'react-cookie'
import { DataModel } from '@/components/DataModel'
import { APIModel } from '@/components/APIModel'
import { OpenAPIModel } from './_components/OpenAPIModel'
import type { ComponentType } from 'react'

interface VersionedDocData {
  textContent: string
  [key: string]: unknown
}

interface DisplayComponentProps {
  allVersionsContent: string
  data: VersionedDocData
}

interface VersionedDocumentationProps {
  allVersionsContent: string
  data: Record<string, VersionedDocData>
  displayComponentName: string
}

export const VersionedDocumentation = ({
  allVersionsContent,
  data,
  displayComponentName
}: VersionedDocumentationProps) => {
  const allVersions = Object.keys(data).sort().reverse()

  let DisplayComponent: ComponentType<DisplayComponentProps> | undefined
  // work around - cant pass a componet on server unless it is marked use server and async :(
  if (displayComponentName === 'APIModel') {
    DisplayComponent = APIModel
  }
  if (displayComponentName === 'DataModel') {
    DisplayComponent = DataModel
  }
  if (displayComponentName === 'OpenAPIModel') {
    DisplayComponent = OpenAPIModel
  }

  const cookieName = 'docVersion'
  const [isClient, setIsClient] = useState(false)
  const [cookies, setCookie] = useCookies([cookieName])

  useEffect(() => {
    setIsClient(true)
  }, [])

  const [version, setVersion] = useState(cookies[cookieName] ? cookies[cookieName] : allVersions[0])

  const versionChoiceMade = (v: string) => {
    setCookie(cookieName, JSON.stringify(v), { path: '/' })
    setVersion(v)
  }

  // if the markdwon content contains the placeholder, "$version, replace it with the selected version"
  const insertVersionIntoSharedContent = (shared: string) =>
    shared.replace('$version', '(v' + version + ')')

  return (
    <>
      {isClient && (
        <>
          <VersionedBanner
            allVersions={allVersions}
            setVersion={versionChoiceMade}
            version={version}
          />
          <ContentView
            allVersionsContent={insertVersionIntoSharedContent(allVersionsContent)}
            DisplayComponent={DisplayComponent}
            data={data[version]}
          />
        </>
      )}
    </>
  )
}

const ContentView = ({
  allVersionsContent,
  data,
  DisplayComponent
}: {
  allVersionsContent: string
  data: VersionedDocData
  DisplayComponent?: ComponentType<DisplayComponentProps>
}) => (
  <>
    <MarkdownContent html={data.textContent} />
    {DisplayComponent && <DisplayComponent allVersionsContent={allVersionsContent} data={data} />}
  </>
)
