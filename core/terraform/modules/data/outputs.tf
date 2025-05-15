output "k8s_rg" {
  value = data.azurerm_resource_group.k8s_rg
}

output "k8s_master_vn" {
  value = data.azurerm_virtual_network.k8s_master_vn
}

output "k8s_nsg" {
  value = data.azurerm_network_security_group.k8s_nsg
}

output "k8s_master_subnet" {
  value = data.azurerm_subnet.k8s_master_subnet
}

output "k8s_node_images" {
  value = data.azurerm_shared_image_version.k8s_node_images
}
