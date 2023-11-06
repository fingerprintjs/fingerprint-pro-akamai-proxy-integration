import {akamaiRequest} from "./utils/akamaiRequest";
import {getProperty} from "./utils/getProperty";
import {CI_DOMAIN} from "./utils/constants";

const createProperty = async () => {
    await akamaiRequest({
        path: `/papi/v1/properties?contractId=${process.env.AK_CONTRACT_ID}&groupId=${process.env.AK_GROUP_ID}`,
        method: 'POST',
        body: JSON.stringify({
            productId: "Site_Accel",
            propertyName: CI_DOMAIN,
            ruleFormat: "latest"
        })
    });
    const {propertyId} = await getProperty();
    return propertyId;
}

const createEdgeHostname = async () => {
    await akamaiRequest({
        path: `/papi/v1/edgehostnames?contractId=${process.env.AK_CONTRACT_ID}&groupId=${process.env.AK_GROUP_ID}`,
        method: 'POST',
        body: JSON.stringify({
            ipVersionBehavior: 'IPV4',
            domainPrefix: CI_DOMAIN,
            domainSuffix: `edgesuite.net`,
            productId: `Site_Accel`,
        })
    });

    return findEdgeHostname()
}

const createCPCode = async () => {
    let cpcodeId = await findCpcode();
    if (!cpcodeId) {
        await akamaiRequest({
            path: `/papi/v1/cpcodes?contractId=${process.env.AK_CONTRACT_ID}&groupId=${process.env.AK_GROUP_ID}`,
            method: 'POST',
            body: JSON.stringify({
                cpcodeName: CI_DOMAIN,
                productId: `Site_Accel`,
            }),
        });
    }

    return findCpcode()
}

const findCpcode = async () => {
    const {body: {cpcodes: {items}}} = await akamaiRequest({
        path: `/papi/v1/cpcodes?contractId=${process.env.AK_CONTRACT_ID}&groupId=${process.env.AK_GROUP_ID}`,
        method: 'GET',
    });

    const cpcode = items.find(t => t.cpcodeName === CI_DOMAIN);
    return cpcode?.cpcodeId;
};

const patchCpcode = async (propertyId: string, cpcodeId: string) => akamaiRequest({
    path: `/papi/v1/properties/${propertyId}/versions/1/rules?contractId=${process.env.AK_CONTRACT_ID}&groupId=${process.env.AK_GROUP_ID}`,
    method: 'PATCH',
    headers: {
        "Content-Type": "application/json-patch+json",
    },
    body: [
        {
            op: "replace",
            path: "/rules/children/0/children/0/behaviors/0/options",
            value: {
                value: {
                    id: Number(cpcodeId.replace('cpc_', '')),
                },
            }
        }
    ]
});

const findEdgeHostname = async () => {
    const {body: {edgeHostnames: {items}}} = await akamaiRequest({
        path: `/papi/v1/edgehostnames?contractId=${process.env.AK_CONTRACT_ID}&groupId=${process.env.AK_GROUP_ID}`,
        method: 'GET',
    });
    return items.find(t => t.domainPrefix === CI_DOMAIN);
}

const patchEdgeHostname = async (propertyId: string) => {
    await akamaiRequest({
        path: `/papi/v1/properties/${propertyId}/versions/1/hostnames`,
        method: 'PATCH',
        body: JSON.stringify({
            "add": [
                {
                    "cnameType": "EDGE_HOSTNAME",
                    "cnameFrom": CI_DOMAIN,
                    "cnameTo": `${CI_DOMAIN}.edgesuite.net`
                },
            ]
        })
    })
};

const handler = async () => {
    try {
        let {propertyId} = await getProperty();
        if (!propertyId) {
            propertyId = await createProperty();
        }
        const hostname = await findEdgeHostname();
        if (!hostname) {
            await createEdgeHostname();
        }
        await patchEdgeHostname(propertyId);
        const cpcodeId = await createCPCode();
        await patchCpcode(propertyId, cpcodeId);
    } catch (e: any) {
        console.error(e)
        process.exit(1);
    }
}

handler().finally();
