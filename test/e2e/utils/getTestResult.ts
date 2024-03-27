import { APIRequestContext } from 'playwright-core'
import { env } from './env'

interface Arguments {
  endpoint: string
  method: string
  testId: string
}

export const getTestResult = async (args: Arguments, request: APIRequestContext) => {
  const resultEndpoint = `${env.testResultDomain}/${env.testResultPath}`
  const response = await request.get(
    `${resultEndpoint}?testPath=${args.endpoint}&testMethod=${args.method}&testId=${args.testId}`
  )
  return response.json()
}
