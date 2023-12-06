import dotenv from 'dotenv'
import { defineConfig } from '@playwright/test'
import { env } from './test/e2e/utils/env'

dotenv.config()

export default defineConfig({
  testDir: './test/e2e',
  use: {
    ignoreHTTPSErrors: env.ignoreHTTPSErrors,
  },
})
