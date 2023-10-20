resource "random_string" "integration_path" {
  length = 8
  special = false
  lower = true
  upper = false
}

resource "random_string" "agent_path" {
  length = 8
  special = false
  lower = true
  upper = false
}

resource "random_string" "result_path" {
  length = 8
  special = false
  lower = true
  upper = false
}

data "akamai_property_rules_template" "rules" {
  template_file = abspath("${path.root}/rules/main.json") # Add fingerprint.json file to your rules children
  variables {
    name  = "fpjs_integration_path"
    value = random_string.integration_path.result
    type = "string"
  }
  variables {
    name  = "fpjs_agent_path"
    value = random_string.agent_path.result
    type = "string"
  }
  variables {
    name  = "fpjs_result_path"
    value = random_string.result_path.result
    type = "string"
  }
  variables {
    name  = "fpjs_proxy_secret"
    value = "" # Replace value with your own Fingerprint Proxy Secret
    type = "string"
  }
}