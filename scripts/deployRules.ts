import {patchBody} from "../build";
import {eg} from "./utils/edgeGrid";

patchBody({
    integrationPath: 'worker',
    agentPath: 'agent',
    resultPath: 'result',
    proxySecret: 'abc123',
})

import('../dist/patch-body/body.json').then(module => {
    const content = module.default as object;

    eg.auth({
        path: `/papi/v1/properties?contractId=${process.env.AK_CONTRACT_ID}&groupId=${process.env.AK_GROUP_ID}`,
        method: 'GET',
    })

    eg.send((err, response, body) => {
        const {properties} = JSON.parse(body ?? '{}');
        const property = properties.items.find(t => t.propertyName === `${process.env.BRANCH_NAME}.cfi-fingerprint.com`);

        eg.auth({
            path: `/papi/v1/properties/${property.propertyId}/versions/${property.latestVersion}/rules?contractId=${process.env.AK_CONTRACT_ID}&groupId=${process.env.AK_GROUP_ID}`,
            method: 'PATCH',
            body: JSON.stringify(content),
        });

        eg.send((err, response, body) => {
           // TODO: Deploy Successful
        });
    });
})