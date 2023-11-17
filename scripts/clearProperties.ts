import {akamaiRequest} from "./utils/akamaiRequest";

const filterProperties = async () => {
    const {body: {properties: {items}}} = await akamaiRequest({
        path: `/papi/v1/properties?contractId=${process.env.AK_CONTRACT_ID}&groupId=${process.env.AK_GROUP_ID}`,
        method: 'GET',
    });

    const testDomain = new URL(process.env.TEST_DOMAIN ?? '');
    const [_, hostname, tld] = testDomain.hostname.split('.');
    const domain = `${hostname}.${tld}`;

    return items.filter(t => t.propertyName.endsWith(domain)).filter(t => t.propertyName !== testDomain.hostname);
}

const checkDNSRecordExists = async (domain: string) => {
    const response = await fetch(`https://api.cloudflare.com/client/v4/zones/${process.env.CF_ZONE_ID}/dns_records?name=${domain}`, {
        headers: {
            Authorization: `Bearer ${process.env.CF_AUTH_TOKEN}`,
        }
    })
    const body = await response.json();

    return body.result_info.total_count > 0;
}

const getActiveVersions = async (propertyId: string) => {
    const {body: {activations: {items}}} = await akamaiRequest({
        path: `/papi/v1/properties/${propertyId}/activations?contractId=${process.env.AK_CONTRACT_ID}&groupId=${process.env.AK_GROUP_ID}`,
        method: 'GET',
    });

    return items.filter(t => t.status === 'ACTIVE' && t.activationType === 'ACTIVATE');
}

const deActivateVersion = async (propertyId: string, {network, version}: {
    network: string,
    version: number
}) => {
    return akamaiRequest({
        path: `/papi/v1/properties/${propertyId}/activations?contractId=${process.env.AK_CONTRACT_ID}&groupId=${process.env.AK_GROUP_ID}`,
        method: 'POST',
        body: JSON.stringify({
            network,
            propertyVersion: version,
            activationType: "DEACTIVATE",
            notifyEmails: ['support+akamai@fingerprint.com'],
            acknowledgeAllWarnings: true,
        })
    });
}

const deleteProperty = async (propertyId: string) => {
    return akamaiRequest({
        path: `/papi/v1/properties/${propertyId}?contractId=${process.env.AK_CONTRACT_ID}&groupId=${process.env.AK_GROUP_ID}`,
        method: 'DELETE',
    });
};
const handler = async () => {
    const properties = await filterProperties();
    for (const property of properties) {
        const dnsRecordExists = await checkDNSRecordExists(property.propertyName);
        if (!dnsRecordExists) {
            const activations = await getActiveVersions(property.propertyId);
            const versionsToDeactivate = activations.map(t => ({
                version: t.propertyVersion,
                network: t.network,
                activationId: t.activationId
            }));
            for (const activation of versionsToDeactivate) {
                try {
                    await deActivateVersion(property.propertyId, {
                        network: activation.network,
                        version: activation.version
                    });
                    console.log('SUCCESS:DEACTIVATE', `property(${property.propertyId}) version(${activation.version}) network(${activation.network})`);
                } catch (_) {
                }
            }
            try {
                await deleteProperty(property.propertyId);
                console.log('SUCCESS:DELETE', `property(${property.propertyId})`);
            } catch (_) {
            }
        }
    }
}

handler().finally();