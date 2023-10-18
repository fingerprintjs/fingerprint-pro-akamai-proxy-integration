import { env } from './utils/env'
import { test } from 'playwright/test'
import { waitFor } from './utils/waitFor'
import { areVisitorIdAndRequestIdValid } from './utils/requestIdVisitorIdValidator'

const rootEndpoint = `${env.testDomain}`

test.use({
  ignoreHTTPSErrors: env.ignoreHTTPSErrors,
})

test.describe('VisitorId', () => {
  test('get requestId and visitorId', async ({ page }) => {
    await page.goto(rootEndpoint, {
      waitUntil: 'networkidle',
    })
    const codeElement = await page.waitForSelector('body pre code')
    const text = await codeElement.innerText()
    const json = JSON.parse(text)
    await waitFor(3000)
    test.expect(json.visitorFound).toBe(true)
    test.expect(json.visitorId).toBeTruthy()
    test.expect(json.requestId).toBeTruthy()
    test.expect(areVisitorIdAndRequestIdValid(json.visitorId, json.requestId)).toBe(true)
  })
})
