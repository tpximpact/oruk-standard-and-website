import { test, expect, Page } from '@playwright/test'

async function setupValidatorPage(page: Page) {
  await page.goto('/developers/validator')
  await expect(page.getByRole('heading', { name: 'Check your ORUK compliance' })).toBeVisible()

  const inputField = page.getByRole('textbox', { name: 'URL' })
  await expect(inputField).toBeVisible()

  const validateButton = page.getByRole('button', { name: 'Check' })
  await expect(validateButton).toBeVisible()

  return { inputField, validateButton }
}

async function validateApiEndpoint(page: Page, apiUrl: string, expectedResult: 'Pass' | 'Fail') {
  const { inputField, validateButton } = await setupValidatorPage(page)

  await inputField.fill(apiUrl)
  await validateButton.click()
  await page.waitForLoadState('networkidle')

  const result = page.locator('#overallResult')
  await expect(result).toContainText(expectedResult, { timeout: 15000 })
}

test('validates the API endpoint URL for pass', async ({ page }) => {
  const apiUrl = `${process.env.API_ENDPOINT_URL}/api/mock`
  await validateApiEndpoint(page, apiUrl, 'Pass')
})

test('validates the API endpoint URL for fail', async ({ page }) => {
  const apiUrl = `${process.env.API_ENDPOINT_URL}/api/mock/fail`
  await validateApiEndpoint(page, apiUrl, 'Fail')
})
