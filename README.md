> :warning: **Work in progress**: This is a beta version of the library

# Fingerprint Pro Akamai Integration Property Rules

## How to build property rules

### For Terraform

`yarn build --type terraform`

This command generates:
- `dist/terraform/json/fingerprint.json`
- `dist/terraform/json/variables.json`
- `dist/terraform/example.tf`

Which you can use in your current Terraform configuration.

### For API (Patch Body)

`yarn build --type patchBody --integration-path abc --agent-path qwe --result-path klm --proxy-secret FPJSABC123 `

This command generates `dist/patch-body` which contains `body.json`. 
You can use this file to add Fingerprint Proxy Integration to your Akamai Property
