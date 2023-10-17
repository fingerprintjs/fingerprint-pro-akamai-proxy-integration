resource "random_string" "worker_path" {
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

variable "proxy_secret" {
  type = string
  default = "abcd12345"
}

data "akamai_property_rules_template" "rules" {
  template_file = abspath("${path.root}/rules/main.json")
  variables {
    name  = "fpjs_worker_path"
    value = random_string.worker_path.result
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
    value = var.proxy_secret
    type = "string"
  }
}
