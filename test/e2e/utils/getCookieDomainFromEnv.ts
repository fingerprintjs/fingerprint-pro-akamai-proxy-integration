import { env } from './env'

export const getCookieDomainFromEnv = () => {
  const url = new URL(env.testDomain)
  return url.host
}
