import { execSync } from 'child_process'

function getEnv(name: string) {
  const value = process.env[name]

  if (!value) {
    throw new Error(`${name} is not set`)
  }

  return value
}

async function main() {

  const apiUrl = getEnv('API_URL')
  const agentPath = `${getEnv('INTEGRATION_PATH')}/${getEnv('AGENT_PATH')}`
  const resultPath = `${getEnv('INTEGRATION_PATH')}/${getEnv('RESULT_PATH')}`
  const host = getEnv('TEST_DOMAIN')

  console.info('Agent download path:', agentPath)
  console.info('Get result path:', resultPath)

  console.info(`Running mock e2e tests for`, host)

  execSync(
    `npm exec -y "git+https://github.com/fingerprintjs/dx-team-mock-for-proxy-integrations-e2e-tests.git" -- --api-url="https://${apiUrl}" --host="${host}" --cdn-proxy-path="${agentPath}" --ingress-proxy-path="${resultPath}"`,
    {
      stdio: 'inherit',
    }
  )
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
