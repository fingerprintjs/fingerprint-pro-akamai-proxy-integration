import fs from 'fs'
import path from 'path'

const config = {
  token: process.env.GITHUB_TOKEN,
  owner: 'fingerprintjs',
  repo: 'fingerprint-pro-akamai-proxy-integration',
}

export interface GithubRelease {
  assets_url: string
  url: string
  tag_name: string
  name: string
  assets: GithubReleaseAsset[]
}

export interface GithubReleaseAsset {
  url: string
  name: string
  content_type: string
  state: 'uploaded' | 'open'
}

async function main() {
  const tag = process.env.TAG

  if (!tag) {
    throw new Error('TAG env variable is required')
  }

  const release = await getGitHubReleaseByTag(tag)

  if (!release) {
    console.warn('No release found')

    return
  }

  console.info('Release', release.tag_name)

  const assets = await findReleaseAssets(release.assets)

  const distPath = path.resolve(__dirname, '../test/terraform/rules')

  await Promise.all(
    assets.map(async (asset) => {
      const assetPath = path.join(distPath, asset.name)

      const file = await downloadReleaseAsset(asset.url)

      console.info('Writing file', assetPath)

      fs.writeFileSync(assetPath, file)
    }),
  )
}

function bearer(token: string) {
  return `Bearer ${token}`
}

async function getGitHubReleaseByTag(tag: string) {
  const url = `https://api.github.com/repos/${config.owner}/${config.repo}/releases/tags/${tag}`

  console.debug('getGitHubReleaseByTag url', url)

  return await doGitHubGetRequest<GithubRelease>(url)
}

async function doGitHubGetRequest<T>(url: string) {
  const response = await fetch(url, {
    headers: config.token
      ? {
          Authorization: bearer(config.token),
        }
      : undefined,
  })

  return (await response.json()) as T
}

async function downloadReleaseAsset(url: string) {
  const headers = {
    Accept: 'application/octet-stream',
    'User-Agent': 'fingerprint-pro-azure-integration',
  }
  if (config.token) {
    headers['Authorization'] = bearer(config.token)
  }

  console.info('Downloading release asset...', url)

  const response = await fetch(url, { headers })

  const arrayBuffer = await response.arrayBuffer()

  console.info('Downloaded release asset')

  return Buffer.from(arrayBuffer)
}

async function findReleaseAssets(assets: GithubReleaseAsset[]) {
  const targetAssetsNames = ['fingerprint-property-variables.json', 'fingerprint-property-rules.json']

  const targetAssets = assets.filter((asset) =>
    targetAssetsNames.find((assetName) => asset.name === assetName && asset.state === 'uploaded'),
  )

  if (targetAssets.length !== targetAssetsNames.length) {
    throw new Error('Some assets are not uploaded')
  }

  return targetAssets
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
