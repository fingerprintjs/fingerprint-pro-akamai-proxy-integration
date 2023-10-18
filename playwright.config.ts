import dotenv from 'dotenv'
import { PlaywrightTestConfig } from '@playwright/test'

dotenv.config()

const config: PlaywrightTestConfig = {
  testDir: './test/e2e',
}

export default config
