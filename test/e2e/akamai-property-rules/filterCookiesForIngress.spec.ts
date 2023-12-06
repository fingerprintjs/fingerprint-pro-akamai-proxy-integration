import { test } from 'playwright/test'
import { generateTestId } from '../utils/generateTestId'
import { env } from '../utils/env'
import { waitFor } from '../utils/waitFor'
import { getTestResult } from '../utils/getTestResult'
import { getCookieDomainFromEnv } from '../utils/getCookieDomainFromEnv'

test.describe('Request Cookies filtered when POST request made to Result endpoint', () => {
  test('Cookies headers must be empty if iidt Cookie not present', async ({ page, request }) => {
    await page.context().addCookies([{ name: 'hello', value: 'world', path: '/', domain: getCookieDomainFromEnv() }])
    const testId = generateTestId()
    await page.goto(`${env.testDomain}?testId=${testId}`)
    await waitFor(10000)
    const result = await getTestResult(
      {
        testId,
        endpoint: `/${env.integrationPath}/${env.resultPath}`,
        method: 'POST',
      },
      request,
    )
    test.expect(result.request.headers['cookie']).toBe(undefined)
  })
  test('iidt cookie must be the only cookie if present with others', async ({ page, request }) => {
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
    await waitFor(10000)
    const result = await getTestResult(
      {
        testId,
        endpoint: `/${env.integrationPath}/${env.resultPath}`,
        method: 'POST',
      },
      request,
    )
    const requestCookie = result.request.headers['cookie'].join('')
    test.expect(requestCookie.includes('hello=')).toBe(false)
    test.expect(requestCookie.includes('_iidt=')).toBe(true)
  })
})
