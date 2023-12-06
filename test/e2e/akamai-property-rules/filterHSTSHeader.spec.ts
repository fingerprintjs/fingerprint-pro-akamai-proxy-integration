import { test } from 'playwright/test'
import { generateTestId } from '../utils/generateTestId'
import { env } from '../utils/env'
import { waitFor } from '../utils/waitFor'
import { getTestResult } from '../utils/getTestResult'

test.describe('HSTS Headers', () => {
  test('Expect HSTS Header to be undefined', async ({ page, request }) => {
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
    test.expect(result.request.headers['strict-transport-security']).toBe(undefined)
  })
})
