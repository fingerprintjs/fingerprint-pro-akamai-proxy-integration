import rulesTemplate from '../assets/rulesTemplate.json'

export default function generateTerraformPropertyRules() {
    let bodyString = JSON.stringify(rulesTemplate, null, 2)
    bodyString = bodyString.replace(/__integration_path__/g, "${env.fpjs_integration_path}")
    bodyString = bodyString.replace(/__agent_path__/g, "${env.fpjs_agent_path}")
    bodyString = bodyString.replace(/__result_path__/g, "${env.fpjs_result_path}")
    bodyString = bodyString.replace(/__proxy_secret__/g, "${env.fpjs_proxy_secret}")

    return bodyString
}
