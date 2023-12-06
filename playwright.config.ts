import dotenv from 'dotenv'
import { PlaywrightTestConfig } from '@playwright/test'
import {env} from "./test/e2e/utils/env";

dotenv.config()

const config: PlaywrightTestConfig = {
  testDir: './test/e2e',
  retries: 5,
  use: {
    ignoreHTTPSErrors: env.ignoreHTTPSErrors
  }
}

export default config
