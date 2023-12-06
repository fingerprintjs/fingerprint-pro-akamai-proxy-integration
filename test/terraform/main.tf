terraform {
  required_providers {
    akamai = {
      source  = "akamai/akamai"
      version = "5.3.0"
    }
  }
}

provider "akamai" {
  edgerc         = "~/.edgerc"
  config_section = "default"
}

module "config" {
  source     = "./config"
  group_name = var.group_name
}

data "akamai_property_rules_template" "rules" {
  template_file = abspath("${path.root}/rules/main.json")
  variables {
    name  = "origin_hostname"
    value = var.origin
  }
  variables {
    name  = "is_secure"
    value = var.is_secure
    type  = "bool"
  }
  variables {
    name  = "cp_code_name"
    value = akamai_cp_code.cp_code.name
  }
  variables {
    name  = "cp_code_id"
    value = akamai_cp_code.cp_code.id
    type  = "number"
  }
  variables {
    name  = "product_id"
    value = var.product_id
  }
  variables {
    name  = "fpjs_integration_path"
    value = var.integration_path
  }
  variables {
    name  = "fpjs_agent_path"
    value = var.agent_path
  }
  variables {
    name  = "fpjs_result_path"
    value = var.result_path
  }
  variables {
    name  = "fpjs_proxy_secret"
    value = var.proxy_secret
  }
}

resource "akamai_property" "property" {
  name        = var.domain
  product_id  = var.product_id
  group_id    = module.config.group_id
  contract_id = module.config.contract_id
  hostnames {
    cert_provisioning_type = "CPS_MANAGED"
    cname_from             = var.domain
    cname_to               = akamai_edge_hostname.hostname.edge_hostname
  }
  rule_format = var.rule_format
  rules       = data.akamai_property_rules_template.rules.json
}

resource "akamai_edge_hostname" "hostname" {
  product_id    = var.product_id
  contract_id   = module.config.contract_id
  group_id      = module.config.group_id
  edge_hostname = format("%s.%s", var.domain, "edgesuite.net")
  ip_behavior   = "IPV4"
}

resource "akamai_cp_code" "cp_code" {
  name        = var.domain
  contract_id = module.config.contract_id
  group_id    = module.config.group_id
  product_id  = var.product_id
}

resource "akamai_property_activation" "activation" {
  property_id                    = akamai_property.property.id
  contact                        = [var.contact_email]
  version                        = akamai_property.property.latest_version
  network                        = "PRODUCTION"
  auto_acknowledge_rule_warnings = true
}
