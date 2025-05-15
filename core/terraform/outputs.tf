output "vms" {
  value = merge([for region, data in module.vms : data.ip_list]...)
}

output "bastion_public_ip" {
  value = module.bastion_vm.bastion.ip_list
}
