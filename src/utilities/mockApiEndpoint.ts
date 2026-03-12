const DEFAULT_API_ENDPOINT_URL = 'https://loicalhost:6969'

const trimTrailingSlash = (value: string) => value.replace(/\/+$/, '')

export const getMockApiEndpoint = (): string => {
  const configuredEndpoint = process.env.API_ENDPOINT_URL?.trim()
  if (!configuredEndpoint) return DEFAULT_API_ENDPOINT_URL
  return `${trimTrailingSlash(configuredEndpoint)}/api/mock`
}

export const replaceMarkdownEnvPlaceholders = (content: string): string =>
  content.replaceAll('{{API_ENDPOINT_URL}}', getMockApiEndpoint())
