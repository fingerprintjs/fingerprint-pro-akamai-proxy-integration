import arg from 'arg'
import generatePatchBody from './generators/generatePatchBody'
import fs from 'fs'
import path from 'path'
import generateTerraformPropertyRules from './generators/generateTerraformPropertyRules'

console.log('testing ci')

const args = arg({
  '--type': String,
  '--integration-path': String,
  '--agent-path': String,
  '--result-path': String,
  '--proxy-secret': String,
  '--ingress-url': String,
})

args['--type'] = args['--type'] ? args['--type'] : 'all'

export interface PatchBodyArgs {
  integrationPath: string
  agentPath: string
  resultPath: string
  proxySecret: string
  ingressUrl: string
}

const defaults = {
  ingressUrl: 'api.fpjs.io',
}

const distPath = path.relative(process.cwd(), 'dist')

export const patchBody = (_args?: PatchBodyArgs) => {
  const bodyContent = generatePatchBody({
    integrationPath: args['--integration-path'] ?? _args?.integrationPath,
    agentPath: args['--agent-path'] ?? _args?.agentPath,
    resultPath: args['--result-path'] ?? _args?.resultPath,
    proxySecret: args['--proxy-secret'] ?? _args?.proxySecret,
    ingressUrl: args['--ingress-url'] ?? _args?.ingressUrl ?? defaults.ingressUrl,
  })

  const patchBodyPath = path.join(distPath, 'patch-body')
  fs.mkdirSync(patchBodyPath, { recursive: true })

  const bodyPath = path.join(patchBodyPath, 'body.json')
  fs.writeFile(bodyPath, bodyContent, (err) => {
    if (err) {
      console.error(err)
      process.exit(1)
    }
  })
}

const terraform = () => {
  const { variablesBody, rulesBody } = generateTerraformPropertyRules({
    ingressUrl: args['--ingress-url'] ?? defaults.ingressUrl,
  })

  const terraformPath = path.join(distPath, 'terraform')
  fs.mkdirSync(terraformPath, { recursive: true })

  const bodyPath = path.join(terraformPath, 'terraform-fingerprint-property-rules.json')
  const variablesPath = path.join(terraformPath, 'terraform-fingerprint-property-variables.json')

  fs.writeFile(variablesPath, variablesBody, (err) => {
    if (err) {
      console.error(err)
      process.exit(1)
    }
  })

  const terraformFilePath = path.relative(process.cwd(), path.join('assets', 'example.tf'))
  const targetPath = path.join(terraformPath, 'example.tf')
  fs.copyFile(terraformFilePath, targetPath, (err) => {
    if (err) {
      console.error(err)
      process.exit(1)
    }
  })

  fs.writeFile(bodyPath, rulesBody, (err) => {
    if (err) {
      console.error(err)
      process.exit(1)
    }
  })
}

const flows = {
  patchBody,
  terraform,
}

const flowKeys = Object.keys(flows)

if (!args['--type'] || (args['--type'] && !['all', ...flowKeys].includes(args['--type']))) {
  console.error(`You must specify a build type. Please select from these values: all, ${flowKeys.join(', ')}`)
  process.exit(1)
}

fs.rmSync(path.relative(process.cwd(), 'dist'), { recursive: true, force: true })

switch (args['--type']) {
  default:
  case 'all':
    const functions = Object.values(flows)
    for (const func of functions) {
      func()
    }
    break
  case 'patchBody':
    flows.patchBody()
    break
  case 'terraform':
    flows.terraform()
    break
}
