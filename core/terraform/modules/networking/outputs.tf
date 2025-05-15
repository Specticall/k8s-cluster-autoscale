output "worker_virtual_network" {
  value = azurerm_virtual_network.k8s_worker_vn
}

output "worker_subnet" {
  value = azurerm_subnet.k8s_worker_subnet
}
