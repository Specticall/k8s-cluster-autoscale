output "ip_list" {
  value = {
    for vm in azurerm_linux_virtual_machine.k8s_worker_vm :
      vm.name => var.create_public_ip ? vm.public_ip_address : vm.private_ip_address
  }
}
