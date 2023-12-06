import { test } from 'playwright/test'
import { generateTestId } from '../utils/generateTestId'
import { env } from '../utils/env'
import { waitFor } from '../utils/waitFor'
import { getTestResult } from '../utils/getTestResult'
import { getIP } from '../utils/getIp'

test.describe('Proxy headers', () => {
  test('Proxy secret, client ip and forwarded header to be set', async ({ page, request }) => {
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
    const testUrl = new URL(env.testDomain)
    const testHost = testUrl.host
    const ip = (await getIP()).trim()
    const proxySecret = result.variables.find((t) => t.key === 'PROXY_SECRET')
    const ipResult = result.request.headers['fpjs-proxy-client-ip'].join('').trim()
    test.expect(result.request.headers['fpjs-proxy-secret'].join('')).toBe(proxySecret.value)
    test.expect(ipResult).toBe(ip)
    test.expect(result.request.headers['fpjs-proxy-forwarded-host'].join('')).toBe(testHost)
  })
})
