import { test } from 'playwright/test'
import { generateTestId } from '../utils/generateTestId'
import { env } from '../utils/env'
import { waitFor } from '../utils/waitFor'
import { getTestResult } from '../utils/getTestResult'
import { getCookieDomainFromEnv } from '../utils/getCookieDomainFromEnv'

test.describe('Agent Request Cookies', () => {
  test('Request Cookies must be removed when request made to Agent endpoint', async ({ page, request }) => {
    await page.context().addCookies([{ name: 'hello', value: 'world', path: '/', domain: getCookieDomainFromEnv() }])
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
    test.expect(result.request.headers['cookie']).toBe(undefined)
  })
})
