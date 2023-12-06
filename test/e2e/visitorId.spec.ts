import { env } from './utils/env'
import { test } from 'playwright/test'
import { waitFor } from './utils/waitFor'
import { areVisitorIdAndRequestIdValid } from './utils/requestIdVisitorIdValidator'

test.describe('VisitorId', () => {
  test('get requestId and visitorId', async ({ page }) => {
    await page.goto(env.testDomain, {
      waitUntil: 'networkidle',
    })
    const codeElement = await page.waitForSelector('body pre code')
    const text = await codeElement.innerText()
    const json = JSON.parse(text)
    await waitFor(10000)
    test.expect(json.visitorId).toBeTruthy()
    test.expect(json.requestId).toBeTruthy()
    test.expect(areVisitorIdAndRequestIdValid(json.visitorId, json.requestId)).toBe(true)
  })
})
