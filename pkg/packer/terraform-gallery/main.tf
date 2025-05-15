locals {
  resource_group_name = "k8s-setup"
  resource_group_location = "East Asia"
  publisher_name = "k8s-publisher"
}

data "azurerm_image" "k8s_node_image" {
  name                = "k8s-node-image"
  resource_group_name = "k8s-setup"
}

resource "azurerm_shared_image_gallery" "k8s_shared_gallery" {
  name                = "k8sImageGallery"
  resource_group_name = local.resource_group_name
  location            = local.resource_group_location
}

resource "azurerm_shared_image" "k8s_node_shared_image" {
  name                           = "k8s-node-shared-image"
  gallery_name                   = azurerm_shared_image_gallery.k8s_shared_gallery.name
  resource_group_name            = local.resource_group_name
  location                       = local.resource_group_location

  identifier {
    publisher = local.publisher_name
    offer     = "k8s-node"
    sku       = "v1"
  }

  # These belong inside `identifier` in older versions but are top-level in new
  os_type = "Linux"
  hyper_v_generation = "V2"
}

resource "azurerm_shared_image_version" "k8s_node_image_version" {
  name                           = "1.0.0"
  image_name                      = azurerm_shared_image.k8s_node_shared_image.name
  gallery_name                   = azurerm_shared_image_gallery.k8s_shared_gallery.name
  resource_group_name            = local.resource_group_name
  location                       = local.resource_group_location

  managed_image_id    = data.azurerm_image.k8s_node_image.id

  dynamic "target_region" {
    # TODO -> Use dynamic configuration
    for_each = toset([
    { name = "eastasia",          regional_replica_count = 1 },
    { name = "indonesiacentral", regional_replica_count = 1 },
    { name = "australiacentral", regional_replica_count = 1 },
    { name = "australiaeast",    regional_replica_count = 1 },
    { name = "southeastasia",    regional_replica_count = 1 },
    { name = "japanwest",        regional_replica_count = 1 },
    { name = "japaneast",        regional_replica_count = 1 },
  ])
    content {
      name                   = target_region.value.name
      regional_replica_count = target_region.value.regional_replica_count
    }
  }
}
