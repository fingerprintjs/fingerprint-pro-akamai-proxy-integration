import {eg} from "./utils/edgeGrid";

eg.auth({
    path: `/papi/v1/properties?contractId=${process.env.AK_CONTRACT_ID}&groupId=${process.env.AK_GROUP_ID}`,
    method: 'GET',
})

eg.send((err, response, body) => {
    const {properties} = JSON.parse(body ?? '{}');
    if (!properties) {
        process.exit(1);
    }
    const property = properties.items.find(t => t.propertyName === `${process.env.BRANCH_NAME}.cfi-fingerprint.com`);
    if (property) {
        process.exit(1)
    }
    process.exit(0)
});