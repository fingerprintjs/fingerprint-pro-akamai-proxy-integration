import {akamaiRequest} from "./utils/akamaiRequest";
import {getProperty} from "./utils/getProperty";
import {ORIGIN_DOMAIN} from "./utils/constants";
import rulePatch from '../assets/patch-body/patchBodyAddRule.json'
import {e2eRules} from "./e2eRules";

const getLatestVersion = async (propertyId: string) => {
    const {body} = await akamaiRequest({
        path: `/papi/v1/properties/${propertyId}/versions?contractId=${process.env.AK_CONTRACT_ID}&groupId=${process.env.AK_GROUP_ID}`,
        method: 'GET',
    });

    return body.versions.items[0];
};

const createNewVersion = async (propertyId: string) => {
    const latestVersion = await getLatestVersion(propertyId);
    await akamaiRequest({
        path: `/papi/v1/properties/${propertyId}/versions?contractId=${process.env.AK_CONTRACT_ID}&groupId=${process.env.AK_GROUP_ID}`,
        method: 'POST',
        body: JSON.stringify({
            createFromVersion: latestVersion.propertyVersion,
            createFromVersionEtag: latestVersion.etag,
        })
    });

    return getLatestVersion(propertyId);
};

const patchOriginHostname = async (propertyId: string, version: string) => akamaiRequest({
    path: `/papi/v1/properties/${propertyId}/versions/${version}/rules?contractId=${process.env.AK_CONTRACT_ID}&groupId=${process.env.AK_GROUP_ID}`,
    method: 'PATCH',
    headers: {
        "Content-Type": "application/json-patch+json",
    },
    body: JSON.stringify([
        {
            op: "add",
            path: "/rules/behaviors/0/options/hostname",
            value: ORIGIN_DOMAIN,
        },
        {
            op: "replace",
            path: "/rules/behaviors/0/options/cacheKeyHostname",
            value: "ORIGIN_HOSTNAME",
        },
        {
            op: "replace",
            path: "/rules/behaviors/0/options/forwardHostHeader",
            value: "ORIGIN_HOSTNAME",
        }
    ])
});

const patchRemoveFingerprintRules = async (propertyId: string, version: string) => akamaiRequest({
    path: `/papi/v1/properties/${propertyId}/versions/${version}/rules?contractId=${process.env.AK_CONTRACT_ID}&groupId=${process.env.AK_GROUP_ID}`,
    method: 'PATCH',
    headers: {
        "Content-Type": "application/json-patch+json",
    },
    body: JSON.stringify([
        {
            op: "remove",
            path: "/rules/children/6",
        },
        {
            op: "remove",
            path: "/rules/children/7",
        }
    ])
});

const patchAddFingerprintRules = async (propertyId: string, version: string, content: string) => {
    await akamaiRequest({
        path: `/papi/v1/properties/${propertyId}/versions/${version}/rules?contractId=${process.env.AK_CONTRACT_ID}&groupId=${process.env.AK_GROUP_ID}`,
        method: 'PATCH',
        headers: {
            "Content-Type": "application/json-patch+json",
        },
        body: content,
    })
}

const clearVariables = async (propertyId: string, version: string) => {
    await akamaiRequest({
        path: `/papi/v1/properties/${propertyId}/versions/${version}/rules?contractId=${process.env.AK_CONTRACT_ID}&groupId=${process.env.AK_GROUP_ID}`,
        method: 'PATCH',
        headers: {
            "Content-Type": "application/json-patch+json",
        },
        body: JSON.stringify([
            {
                "op": "add",
                "path": "/rules/variables",
                "value": []
            }
        ])
    })
};

const activateVersion = async (propertyId: string, version: string) => {
    await akamaiRequest({
        path: `/papi/v1/properties/${propertyId}/activations?contractId=${process.env.AK_CONTRACT_ID}&groupId=${process.env.AK_GROUP_ID}`,
        method: 'POST',
        body: JSON.stringify({
            propertyVersion: version,
            network: "PRODUCTION",
            notifyEmails: [process.env.NOTIFY_EMAIL_ADDRESS],
            acknowledgeAllWarnings: true,
            activationType: "ACTIVATE",

        }),
    })
}

const createE2ERules = () => ({...rulePatch, value: e2eRules})

import('../dist/patch-body/body.json').then((module) => {
    const patchReqBody = module.default as object[];
    patchReqBody.push(createE2ERules())

    const handler = async () => {
        try {
            const {propertyId} = await getProperty()
            const {propertyVersion} = await createNewVersion(propertyId);
            await patchOriginHostname(propertyId, propertyVersion);
            await clearVariables(propertyId, propertyVersion);
            try {
                await patchRemoveFingerprintRules(propertyId, propertyVersion);
            } catch (_) {
                // Ignore error if fingerprint rules not exists
            }
            await patchAddFingerprintRules(propertyId, propertyVersion, JSON.stringify(patchReqBody));
            await activateVersion(propertyId, propertyVersion);
        } catch (e: any) {
            console.error(e.error)
            process.exit(1)
        }
    };
    handler().finally();
})
