terraform {
  required_providers {
    akamai = {
      source  = "akamai/akamai"
      version = "5.3.0"
    }
    random = {
      source = "hashicorp/random"
      version = "3.5.1"
    }
  }
}

variable "group_name" {
  type = string
}

data "akamai_contract" "contract" {
  group_name = var.group_name
}

data "akamai_group" "group" {
  group_name = var.group_name
  contract_id = data.akamai_contract.contract.id
}

output "contract_id" {
  value = data.akamai_contract.contract.id
}

output "group_id" {
  value = data.akamai_group.group.id
}


