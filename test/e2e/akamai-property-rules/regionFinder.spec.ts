import { test } from 'playwright/test'
import { env } from '../utils/env'
import { generateTestId } from '../utils/generateTestId'
import { waitFor } from '../utils/waitFor'
import { getTestResult } from '../utils/getTestResult'

test.use({
  ignoreHTTPSErrors: env.ignoreHTTPSErrors,
})

test.describe('Region finder', () => {
  test('for no region expect api.fpjs.io', async ({ page, request }) => {
    const testId = generateTestId()
    await page.goto(`${env.testDomain}?region&testId=${testId}`)
    await waitFor(3000)
    const result = await getTestResult(
      {
        testId,
        endpoint: `/${env.workerPath}/${env.resultPath}`,
        method: 'GET',
      },
      request,
    )
    const ingressEndpoint = result.variables.find((t) => t.key === 'INGRESS_ENDPOINT')
    test.expect(ingressEndpoint.value).toBe('api.fpjs.io')
  })
  test('for us region expect api.fpjs.io', async ({ page, request }) => {
    const testId = generateTestId()
    await page.goto(`${env.testDomain}?region=us&testId=${testId}`)
    await waitFor(3000)
    const result = await getTestResult(
      {
        testId,
        endpoint: `/${env.workerPath}/${env.resultPath}`,
        method: 'GET',
      },
      request,
    )
    const ingressEndpoint = result.variables.find((t) => t.key === 'INGRESS_ENDPOINT')
    test.expect(ingressEndpoint.value).toBe('api.fpjs.io')
  })
  test('for eu region expect eu.api.fpjs.io', async ({ page, request }) => {
    const testId = generateTestId()
    await page.goto(`${env.testDomain}?region=eu&testId=${testId}`)
    await waitFor(3000)
    const result = await getTestResult(
      {
        testId,
        endpoint: `/${env.workerPath}/${env.resultPath}`,
        method: 'GET',
      },
      request,
    )
    const ingressEndpoint = result.variables.find((t) => t.key === 'INGRESS_ENDPOINT')
    test.expect(ingressEndpoint.value).toBe('eu.api.fpjs.io')
  })
  test('for ap region expect ap.api.fpjs.io', async ({ page, request }) => {
    const testId = generateTestId()
    await page.goto(`${env.testDomain}?region=ap&testId=${testId}`)
    await waitFor(3000)
    const result = await getTestResult(
      {
        testId,
        endpoint: `/${env.workerPath}/${env.resultPath}`,
        method: 'GET',
      },
      request,
    )
    const ingressEndpoint = result.variables.find((t) => t.key === 'INGRESS_ENDPOINT')
    test.expect(ingressEndpoint.value).toBe('ap.api.fpjs.io')
  })
})
