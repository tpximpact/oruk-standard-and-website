import { Suspense, ReactNode } from 'react'

interface SuspenseIfProps {
  condition: boolean
  fallback: ReactNode
  children: ReactNode
}

export const SuspenseIf = ({ condition, fallback, children }: SuspenseIfProps) => {
  if (!condition) {
    return children
  }

  return <Suspense fallback={fallback}>{children}</Suspense>
}
