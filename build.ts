import arg from 'arg'
import generatePatchBody from './generators/generatePatchBody'
import fs from 'fs'
import path from 'path'
import generateTerraformPropertyRules from './generators/generateTerraformPropertyRules'

const args = arg({
  '--type': String,
  '--integration-path': String,
  '--agent-path': String,
  '--result-path': String,
  '--proxy-secret': String,
})

args['--type'] = args['--type'] ? args['--type'] : 'all'

export interface PatchBodyArgs {
  integrationPath: string
  agentPath: string
  resultPath: string
  proxySecret: string
}

export const patchBody = (_args?: PatchBodyArgs) => {
  const bodyContent = generatePatchBody({
    integrationPath: args['--integration-path'] ?? _args?.integrationPath,
    agentPath: args['--agent-path'] ?? _args?.agentPath,
    resultPath: args['--result-path'] ?? _args?.resultPath,
    proxySecret: args['--proxy-secret'] ?? _args?.proxySecret,
  })

  fs.mkdirSync(path.relative(process.cwd(), 'dist/patch-body'), { recursive: true })

  const bodyPath = path.relative(process.cwd(), 'dist/patch-body/body.json')
  fs.writeFile(bodyPath, bodyContent, (err) => {
    if (err) {
      console.error(err)
      process.exit(1)
    }
  })
}

const terraform = () => {
  const bodyContent = generateTerraformPropertyRules()

  const bodyPaths = [
    path.relative(process.cwd(), 'dist/terraform/json/fingerprint-property-rules.json'),
    path.relative(process.cwd(), 'test/terraform/rules/fingerprint-property-rules.json'),
  ]
  const variablesPaths = [
    path.relative(process.cwd(), 'dist/terraform/json/fingerprint-property-variables.json'),
    path.relative(process.cwd(), 'test/terraform/rules/fingerprint-property-variables.json'),
  ]

  for (const filePath of bodyPaths) {
    fs.mkdirSync(path.relative(process.cwd(), filePath.replace('/fingerprint-property-rules.json', '')), {
      recursive: true,
    })
  }

  import('./assets/variables.json')
    .then((res) => {
      const variablesContent = JSON.stringify(res.default, null, 2)

      for (const variablePath of variablesPaths) {
        fs.writeFile(variablePath, variablesContent, (err) => {
          if (err) {
            console.error(err)
            process.exit(1)
          }
        })
      }
    })
    .catch((err) => {
      if (err) {
        console.error(err)
        process.exit(1)
      }
    })

  const terraformFilePath = path.relative(process.cwd(), 'assets/example.tf')
  const targetPath = path.relative(process.cwd(), 'dist/terraform/example.tf')
  fs.copyFile(terraformFilePath, targetPath, (err) => {
    if (err) {
      console.error(err)
      process.exit(1)
    }
  })

  for (const bodyPath of bodyPaths) {
    fs.writeFile(bodyPath, bodyContent, (err) => {
      if (err) {
        console.error(err)
        process.exit(1)
      }
    })
  }
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
