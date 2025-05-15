resource "azurerm_subnet" "k8s_bastion_subnet" {
  # This name is required
  name                 = "k8s-bastion-subnet"

  resource_group_name  = var.resource_group_name
  virtual_network_name = var.virtual_network_name
  address_prefixes     = [var.subnet_range]
}

module "bastion_vm" {
  source = "./../vms"

  resource_group_name = var.resource_group_name

  access = {
    admin_username = var.admin_username
    public_ssh_key_path = var.public_ssh_key_path
  }

  id_list = ["bastion"]
  vnet = {
    location = var.location
  }
  subnet = {
    id = azurerm_subnet.k8s_bastion_subnet.id
  }

  create_public_ip = true
}
