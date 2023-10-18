interface Env {
  testDomain: string
  workerPath: string
  resultPath: string
  agentPath: string
  testResultDomain: string
  testResultPath: string
  apiKey: string
  ignoreHTTPSErrors: boolean
}

export const env: Env = {
  testDomain: process.env.TEST_DOMAIN as string,
  workerPath: process.env.WORKER_PATH as string,
  agentPath: process.env.AGENT_PATH as string,
  resultPath: process.env.RESULT_PATH as string,
  testResultDomain: process.env.TEST_RESULT_DOMAIN as string,
  testResultPath: process.env.TEST_RESULT_PATH as string,
  apiKey: process.env.FPJS_API_KEY as string,
  ignoreHTTPSErrors: true,
}
