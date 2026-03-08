import { STATUS, StatusType } from '@/utilities/status'
import { groupBy } from '@/utilities/groupBy'
import { isDeepEqual } from '@/utilities/isDeepEqual'
import type {
  FormattedEndpoints,
  ValidationMessage,
  ValidationResultData,
  ValidationTest,
  ValidationSuite
} from './types'

type Test = ValidationTest & { parent?: string; status?: StatusType }
type TestSuite = ValidationSuite

const normaliseEndpointName = (endpointName: string): string =>
  endpointName !== '/' && endpointName.slice(-1) === '/' ? `${endpointName}{id}` : endpointName

const processTest = (suite: TestSuite, test: Test): Test => {
  test.parent = suite.name
  test.status = test.success ? STATUS.PASS : suite.required ? STATUS.FAIL : STATUS.OTHER
  return test
}

const stripSharedPath = (str: string, sharedPath: string): string => str.replace(sharedPath, '')

const addTestToResult = (result: FormattedEndpoints, test: Test, sharedPath: string) => {
  const endpointRaw = stripSharedPath(test.endpoint, sharedPath)
  const endpointName = normaliseEndpointName(endpointRaw)
  if (!result[endpointName]) {
    result[endpointName] = { tests: [], groups: {} }
  }
  result[endpointName].groups = result[endpointName].groups || {}
  const tests = (result[endpointName] as { tests?: Test[] }).tests || []
  tests.push(test)
  ;(result[endpointName] as { tests: Test[] }).tests = tests
}

const groupTestsByParent = (result: FormattedEndpoints) => {
  Object.keys(result).forEach(key => {
    const endpoint = result[key] as { tests?: Test[]; groups?: Record<string, Test[]> } | undefined
    if (!endpoint) {
      return
    }
    const groupedTests = groupBy(endpoint.tests || [], 'parent')
    endpoint.groups = groupedTests
    delete endpoint.tests
  })
}

export const formatResults = (input: ValidationResultData): FormattedEndpoints => {
  let result: FormattedEndpoints = {}

  const sharedPath = input.service.url
  input.testSuites.forEach((suite: TestSuite) => {
    suite.tests.forEach((test: Test) => {
      const processedTest = processTest(suite, test)
      addTestToResult(result, processedTest, sharedPath)
    })
  })

  groupTestsByParent(result)
  result = deDuplicateMessages(result)

  return result
}

const deDuplicateMessages = (input: FormattedEndpoints): FormattedEndpoints => {
  const result = JSON.parse(JSON.stringify(input)) as FormattedEndpoints
  Object.keys(result).forEach(endpointKey => {
    const endpoint = result[endpointKey]
    if (!endpoint) {
      return
    }

    Object.keys(endpoint.groups).forEach(groupKey => {
      const group = endpoint.groups[groupKey]
      if (!group) {
        return
      }
      group.forEach(test => {
        test.messages = deduplicate(test.messages)
      })
    })
  })
  return result
}

const deduplicate = (arr: ValidationMessage[]): ValidationMessage[] => {
  const uniques: ValidationMessage[] = []
  arr.forEach(item => {
    if (!isIn(item, uniques)) {
      uniques.push(item)
    }
  })
  uniques.forEach(u => {
    const number = arr.filter(member => isDeepEqual(member, u)).length
    u.count = number
  })
  return uniques
}

const isIn = (needle: ValidationMessage, haystack: ValidationMessage[]): boolean =>
  haystack.some(item => isDeepEqual(item, needle))
