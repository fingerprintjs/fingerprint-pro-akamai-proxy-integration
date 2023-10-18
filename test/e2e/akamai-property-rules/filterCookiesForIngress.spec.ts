import { test } from 'playwright/test'
import { generateTestId } from '../utils/generateTestId'
import { env } from '../utils/env'
import { waitFor } from '../utils/waitFor'
import { getTestResult } from '../utils/getTestResult'
import { getCookieDomainFromEnv } from '../utils/getCookieDomainFromEnv'

test.use({
  ignoreHTTPSErrors: env.ignoreHTTPSErrors,
})

test.describe('Cookie filtering for ingress', () => {
  test('No cookies for ingress', async ({ page, request }) => {
    await page.context().addCookies([{ name: 'hello', value: 'world', path: '/', domain: getCookieDomainFromEnv() }])
    const testId = generateTestId()
    await page.goto(`${env.testDomain}?testId=${testId}`)
    await waitFor(3000)
    const result = await getTestResult(
      {
        testId,
        endpoint: `/${env.workerPath}/${env.resultPath}`,
        method: 'POST',
      },
      request,
    )
    test.expect(result.request.headers['cookie']).toBe(undefined)
  })
  test('Only iidt for ingress', async ({ page, request }) => {
    await page.context().addCookies([
      {
        name: '_iidt',
        value: '1',
        path: '/',
        domain: getCookieDomainFromEnv(),
      },
      {
        name: 'hello',
        value: 'world',
        path: '/',
        domain: getCookieDomainFromEnv(),
      },
    ])
    const testId = generateTestId()
    await page.goto(`${env.testDomain}?testId=${testId}`)
    await waitFor(3000)
    const result = await getTestResult(
      {
        testId,
        endpoint: `/${env.workerPath}/${env.resultPath}`,
        method: 'POST',
      },
      request,
    )
    const requestCookie = result.request.headers['cookie'].join('')
    test.expect(requestCookie.includes('hello=')).toBe(false)
    test.expect(requestCookie.includes('_iidt=')).toBe(true)
  })
})
