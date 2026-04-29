import { appendFile } from 'fs/promises'
import { akamaiRequest } from './utils/akamaiRequest'
import { getProperty } from './utils/getProperty'
import { CI_DOMAIN } from './utils/constants'

const createProperty = async () => {
  await akamaiRequest({
    path: `/papi/v1/properties?contractId=${process.env.AK_CONTRACT_ID}&groupId=${process.env.AK_GROUP_ID}`,
    method: 'POST',
    body: JSON.stringify({
      productId: 'Site_Accel',
      propertyName: CI_DOMAIN,
      ruleFormat: 'latest',
    }),
  })
  const { propertyId } = await getProperty()
  return propertyId
}

const createEdgeHostname = async () => {
  await akamaiRequest({
    path: `/papi/v1/edgehostnames?contractId=${process.env.AK_CONTRACT_ID}&groupId=${process.env.AK_GROUP_ID}`,
    method: 'POST',
    body: JSON.stringify({
      ipVersionBehavior: 'IPV6_COMPLIANCE',
      domainPrefix: CI_DOMAIN,
      domainSuffix: `edgesuite.net`,
      productId: `Site_Accel`,
    }),
  })

  return findEdgeHostname()
}

const createCPCode = async () => {
  const cpcodeId = await findCpcode()
  if (!cpcodeId) {
    await akamaiRequest({
      path: `/papi/v1/cpcodes?contractId=${process.env.AK_CONTRACT_ID}&groupId=${process.env.AK_GROUP_ID}`,
      method: 'POST',
      body: JSON.stringify({
        cpcodeName: CI_DOMAIN,
        productId: `Site_Accel`,
      }),
    })
  }

  return findCpcode()
}

const findCpcode = async () => {
  const {
    body: {
      cpcodes: { items },
    },
  } = await akamaiRequest({
    path: `/papi/v1/cpcodes?contractId=${process.env.AK_CONTRACT_ID}&groupId=${process.env.AK_GROUP_ID}`,
    method: 'GET',
  })

  const cpcode = items.find((t) => t.cpcodeName === CI_DOMAIN)
  return cpcode?.cpcodeId
}

const patchCpcode = async (propertyId: string, cpcodeId: string) =>
  akamaiRequest({
    path: `/papi/v1/properties/${propertyId}/versions/1/rules?contractId=${process.env.AK_CONTRACT_ID}&groupId=${process.env.AK_GROUP_ID}`,
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json-patch+json',
    },
    body: [
      {
        op: 'replace',
        path: '/rules/children/0/children/0/behaviors/0/options',
        value: {
          value: {
            id: Number(cpcodeId.replace('cpc_', '')),
          },
        },
      },
    ],
  })

const findEdgeHostname = async () => {
  const {
    body: {
      edgeHostnames: { items },
    },
  } = await akamaiRequest({
    path: `/papi/v1/edgehostnames?contractId=${process.env.AK_CONTRACT_ID}&groupId=${process.env.AK_GROUP_ID}`,
    method: 'GET',
  })
  return items.find((t) => t.domainPrefix === CI_DOMAIN)
}

const patchEdgeHostname = async (propertyId: string) => {
  const {
    body: {
      hostnames: { items: hostnames },
    },
  } = await akamaiRequest({
    path: `/papi/v1/properties/${propertyId}/versions/1/hostnames`,
    method: 'PATCH',
    body: JSON.stringify({
      add: [
        {
          cnameType: 'EDGE_HOSTNAME',
          cnameFrom: CI_DOMAIN,
          cnameTo: `${CI_DOMAIN}.edgesuite.net`,
        },
      ],
    }),
  })

  const hostname = hostnames.find((h) => h.cnameFrom === CI_DOMAIN)
  return hostname?.domainOwnershipVerification?.validationTxt
}

const outputValidationTxt = async (validationTxt: { hostname: string; challengeToken: string }) => {
  const txtRecord = `${validationTxt.hostname}. TXT ${validationTxt.challengeToken}`
  const txtRecordHost = validationTxt.hostname.replace(`.${CI_DOMAIN}`, '')
  if (process.env.GITHUB_OUTPUT) {
    await appendFile(
      process.env.GITHUB_OUTPUT,
      `TXT_RECORD=${txtRecord}\nTXT_RECORD_HOST=${txtRecordHost}\nHOSTNAME_VALIDATION_TOKEN=${validationTxt.challengeToken}\n`
    )
  } else {
    console.log('=== Domain Ownership Verification ===')
    console.log(`Host:  ${validationTxt.hostname}`)
    console.log(`Type:  TXT`)
    console.log(`Value: ${txtRecord}`)
    console.log('=====================================')
  }
}

const patchDefaultRuleOrigin = async (propertyId: string) =>
  akamaiRequest({
    path: `/papi/v1/properties/${propertyId}/versions/1/rules?contractId=${process.env.AK_CONTRACT_ID}&groupId=${process.env.AK_GROUP_ID}`,
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json-patch+json',
    },
    body: JSON.stringify([
      {
        op: 'add',
        path: '/rules/behaviors/0/options/customValidCnValues',
        value: ['{{Forward Host Header}}', '{{Origin Hostname}}'],
      },
      {
        op: 'replace',
        path: '/rules/behaviors/0/options/verificationMode',
        value: 'CUSTOM',
      },
      {
        op: 'add',
        path: '/rules/behaviors/0/options/originCertsToHonor',
        value: 'STANDARD_CERTIFICATE_AUTHORITIES',
      },
      {
        op: 'add',
        path: '/rules/behaviors/0/options/standardCertificateAuthorities',
        value: ['THIRD_PARTY_AMAZON', 'akamai-permissive'],
      },
      {
        op: 'remove',
        path: '/rules/behaviors/1',
      },
    ]),
  })

const handler = async () => {
  try {
    const propertyResponse = await getProperty()
    let propertyId = propertyResponse?.propertyId
    if (!propertyId) {
      propertyId = await createProperty()
    }
    const hostname = await findEdgeHostname()
    if (!hostname) {
      await createEdgeHostname()
    }
    const validationTxt = await patchEdgeHostname(propertyId)
    if (validationTxt) {
      await outputValidationTxt(validationTxt)
    }
    const cpcodeId = await createCPCode()
    await patchCpcode(propertyId, cpcodeId)
    await patchDefaultRuleOrigin(propertyId)
  } catch (e: any) {
    console.error(e.error?.response?.data)
    console.error(e)
    process.exit(1)
  }
}

handler().finally()
