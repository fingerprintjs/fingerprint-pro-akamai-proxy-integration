import rulesTemplate from '../assets/rulesTemplate.json' assert {type: 'json'}
import rulePatch from '../assets/patch-body/patchBodyAddRule.json' assert {type: 'json'}
import variablePatch from '../assets/patch-body/patchBodyAddVariable.json' assert {type: 'json'}
import variables from '../assets/variables.json' assert {type: 'json'}

interface PatchBodyOptions {
    integrationPath?: string
    agentPath?: string
    resultPath?: string
    proxySecret?: string
}
export default function generatePatchBody({
    integrationPath = 'integration',
    agentPath = 'proxyagent',
    resultPath = 'proxyresult',
    proxySecret = ''
}: PatchBodyOptions) {
    const body: unknown[] = [
        {...rulePatch, value: rulesTemplate}
    ]
    for(const variable of variables) {
        body.push({
            ...variablePatch,
            value: variable,
        })
    }

    let bodyString = JSON.stringify(body, null, 2)
    bodyString = bodyString.replace(/__integration_path__/g, integrationPath)
    bodyString = bodyString.replace(/__agent_path__/g, agentPath)
    bodyString = bodyString.replace(/__result_path__/g, resultPath)
    bodyString = bodyString.replace(/__proxy_secret__/g, proxySecret)

    return bodyString
}
