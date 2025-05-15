module "networks" {
  source = "./modules/networking"

  resource_group_name = local.resource_group_name
  for_each = local.workers_config

  master = {
    location = local.master.location
    vn_id    = local.master.vn_id
    vn_name  = local.master.vn_name
  }

  worker = {
    location      = each.key
    network_range = each.value.network_range
    subnet_range  = each.value.subnet_range
  }
}

module "vms" {
  source = "./modules/vms"

  resource_group_name = local.resource_group_name
  for_each = local.workers_config
  image_id = local.vm_image_id

  access = {
    admin_username = local.worker_vm_admin_username
    public_ssh_key_path = local.public_ssh_key_path
  }

  id_list = each.value.vm_ids
  vnet = {
    location = module.networks[each.key].worker_virtual_network.location
  }
  subnet = {
    id = module.networks[each.key].worker_subnet.id
  }

  # Worker vms should be accessed through bastion instead of directly with public ip
  create_public_ip = false
}

module "bastion_vm" {
  source = "./modules/bastion"
  resource_group_name = local.resource_group_name

  virtual_network_name = local.master.vn_name
  location = local.master.location
  subnet_range = local.bastion_subnet_range

  admin_username = local.bastion_vm_admin_username
  public_ssh_key_path = local.public_ssh_key_path
}
