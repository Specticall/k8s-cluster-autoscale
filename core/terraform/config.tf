terraform {
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "=3.0.0"
    }
  }

  backend "azurerm" {
    resource_group_name  = "terraform-rg"
    storage_account_name = "josephyusmita"
    container_name       = "terraformstate"
    key                  = "tfscale.tfstate"
  }
}


provider "azurerm" {
  features {}
}
