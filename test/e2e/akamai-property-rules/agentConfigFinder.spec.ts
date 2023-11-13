import { test } from 'playwright/test'
import { generateTestId } from '../utils/generateTestId'
import { env } from '../utils/env'
import { waitFor } from '../utils/waitFor'
import { getTestResult } from '../utils/getTestResult'

test.use({
  ignoreHTTPSErrors: env.ignoreHTTPSErrors,
})

test.describe('Agent Config Finder', () => {
  test('Config set valid', async ({ page, request }) => {
    const testId = generateTestId()
    await page.goto(`${env.testDomain}?testId=${testId}`)
    await waitFor(10000)
    const result = await getTestResult(
      {
        testId,
        endpoint: `/${env.integrationPath}/${env.agentPath}`,
        method: 'GET',
      },
      request,
    )
    const apiKey = result.variables.find((t) => t.key === 'PUBLIC_API_KEY')
    const version = result.variables.find((t) => t.key === 'AGENT_VERSION')
    test.expect(apiKey.value).toBeTruthy()
    test.expect(apiKey.value).toBe(env.apiKey)
    test.expect(version.value).toBe('3')
  })
})
