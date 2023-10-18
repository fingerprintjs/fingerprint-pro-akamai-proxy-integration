import { test } from 'playwright/test'
import { env } from './utils/env'

const statusEndpoint = `${env.testDomain}/${env.workerPath}/status`

test.use({
  ignoreHTTPSErrors: env.ignoreHTTPSErrors,
})

test.describe('Status Page', () => {
  test('is deployed', async ({ page }) => {
    await page.goto(statusEndpoint, {
      waitUntil: 'networkidle',
    })

    const statusText = await page.waitForSelector('body > span')
    test.expect(await statusText.innerText()).toBe('Your Akamai Integration is deployed')
  })
})
