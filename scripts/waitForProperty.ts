import { waitFor } from '../test/e2e/utils/waitFor'

async function waitForProperty(url: string, waitMsBetweenRequests = 20_000) {
  console.info(`Waiting for property ${url} to be available`)

  while (true) {
    try {
      const response = await fetch(url)

      if (response.status === 200) {
        console.info(`Property ${url} is available`)
        return
      }

      console.info(
        `Property ${url} is not available yet, request status: ${response.status}. Waiting ${waitMsBetweenRequests}ms`,
      )
    } catch (error) {
      console.error(error)
    }

    console.info(`Property ${url} is not available yet. Waiting ${waitMsBetweenRequests}ms`)

    await waitFor(waitMsBetweenRequests)
  }
}

async function main() {
  const url = process.env.URL

  if (!url) {
    throw new Error('URL environment variable is not set')
  }

  await waitForProperty(new URL(url).toString())
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
