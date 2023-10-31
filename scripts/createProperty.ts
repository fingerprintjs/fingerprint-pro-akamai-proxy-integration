import {eg} from "./utils/edgeGrid";

eg.auth({
    path: `/papi/v1/properties?contractId=${process.env.AK_CONTRACT_ID}&groupId=${process.env.AK_GROUP_ID}`,
    method: 'POST',
    body: JSON.stringify({
        productId: "Site_Accel",
        propertyName: `${process.env.BRANCH_NAME}.cfi-fingerprint.com`,
        ruleFormat: "latest"
    })
})

eg.send((err, response, body) => {
    if (!response) {
        process.exit(1)
    }
    if (response?.status >= 200 && response?.status < 300) {
        eg.auth({
            path: `/papi/v1/edgehostnames?contractId=${process.env.AK_CONTRACT_ID}&groupId=${process.env.AK_GROUP_ID}`,
            method: 'POST',
            body: JSON.stringify({
                ipVersionBehavior: 'IPV4',
                domainPrefix: `${process.env.BRANCH_NAME}.cfi-fingerprint.com`,
                domainSuffix: `edgesuite.net`,
                productId: `Site_Accel`,
            })
        });

        eg.send((err, response, body) => {
            if (!response) {
                process.exit(1)
            }
            if (response?.status >= 200 && response?.status < 300) {
                process.exit(0)
            }
            process.exit(1);
        });
        process.exit(0)
    }
    process.exit(1)
});