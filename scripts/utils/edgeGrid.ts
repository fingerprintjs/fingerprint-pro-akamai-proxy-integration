import EdgeGrid from 'akamai-edgegrid'

const clientToken = process.env.AK_CLIENT_TOKEN ?? '',
  clientSecret = process.env.AK_CLIENT_SECRET ?? '',
  accessToken = process.env.AK_ACCESS_TOKEN ?? '',
  baseUri = `https://${process.env.AK_HOST ?? ''}/`

export const eg = new EdgeGrid(clientToken, clientSecret, accessToken, baseUri)
