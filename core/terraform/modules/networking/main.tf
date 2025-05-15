locals {
  # Converts "East US" -> "eastus"
  formatted_master_location = replace(lower(var.master.location), " ", "")
  formatted_worker_location = replace(lower(var.worker.location), " ", "")
}

resource "azurerm_virtual_network" "k8s_worker_vn" {
  name                = "k8s-vnet-${local.formatted_worker_location}"
  resource_group_name = var.resource_group_name

  location            = var.worker.location
  address_space       = [var.worker.network_range]
}

resource "azurerm_subnet" "k8s_worker_subnet" {
  name                 = "k8s-subnet-${local.formatted_worker_location}"
  resource_group_name  = var.resource_group_name

  virtual_network_name = azurerm_virtual_network.k8s_worker_vn.name
  address_prefixes     = [var.worker.subnet_range]
}

resource "azurerm_virtual_network_peering" "k8s_worker_to_master_peer" {
  name                         = "${local.formatted_worker_location}-to-${local.formatted_master_location}"
  resource_group_name          = var.resource_group_name

  virtual_network_name         = azurerm_virtual_network.k8s_worker_vn.name
  remote_virtual_network_id    = var.master.vn_id
  allow_forwarded_traffic      = true
  allow_virtual_network_access = true
  allow_gateway_transit        = true
}

resource "azurerm_virtual_network_peering" "k8s_master_to_worker" {
  name                         = "${local.formatted_master_location}-to-${local.formatted_worker_location}"
  resource_group_name          = var.resource_group_name

  virtual_network_name         = var.master.vn_name
  remote_virtual_network_id    = azurerm_virtual_network.k8s_worker_vn.id

  # Allows bastion to connect
  allow_forwarded_traffic      = true
  allow_virtual_network_access = true
  allow_gateway_transit        = true
}
