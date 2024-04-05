import { akamaiRequest } from './akamaiRequest'
import { CI_DOMAIN } from './constants'

export const getProperty = async () => {
  const {
    body: { properties },
  } = await akamaiRequest({
    path: `/papi/v1/properties?contractId=${process.env.AK_CONTRACT_ID}&groupId=${process.env.AK_GROUP_ID}`,
    method: 'GET',
  })
  if (!properties) {
    throw new Error('Property not found')
  }
  return properties.items.find((t) => t.propertyName === CI_DOMAIN)
}
