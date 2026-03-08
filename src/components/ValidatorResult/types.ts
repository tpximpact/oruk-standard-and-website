import type { StatusType } from '@/utilities/status'

export interface ValidationMessage {
  name: string
  description: string
  message: string
  count?: number
  parameters?: unknown
  errorIn?: string
  errorAt?: string
  [key: string]: unknown
}

export interface ValidationTest {
  endpoint: string
  success: boolean
  description?: string
  id?: string | number
  parent?: string
  status?: StatusType
  messages: ValidationMessage[]
  [key: string]: unknown
}

export interface ValidationSuite {
  name: string
  required: boolean
  tests: ValidationTest[]
}

export interface ValidationService {
  url: string
  isValid: boolean
  profile: string
  profileReason?: string
}

export interface ValidationResultData {
  service: ValidationService
  testSuites: ValidationSuite[]
  [key: string]: unknown
}

export interface EndpointData {
  groups: Record<string, ValidationTest[]>
  tests?: ValidationTest[]
}

export type FormattedEndpoints = Record<string, EndpointData>

export interface ApiDocsData {
  rootSpec: {
    parsed: {
      paths: Record<string, Record<string, unknown>>
      components: {
        parameters: Record<string, unknown>
      }
    }
  }
  schemata?: Record<string, unknown>
  [key: string]: unknown
}
