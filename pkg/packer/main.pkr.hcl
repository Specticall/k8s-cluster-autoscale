packer {
  required_plugins {
    azure = {
      source  = "github.com/hashicorp/azure"
      version = "~> 2"
    }
    ansible = {
      version = "~> 1"
      source = "github.com/hashicorp/ansible"
    }

  }
}

# Start temporary VM
source "azure-arm" "k8s-node" {
  # Use existing Azure CLI auth
  use_azure_cli_auth = true

  # Stand Linux settings
  os_type = "Linux"
  image_publisher = "Canonical"
  image_offer     = "0001-com-ubuntu-server-jammy"
  image_sku       = "22_04-lts-gen2"
  vm_size         = "Standard_DS2_v2"

  # Misc settings
  build_resource_group_name = "k8s-setup"
  managed_image_resource_group_name = "k8s-setup"
  managed_image_name = "k8s-node-image"

}

# Run ansible setup node playbook on the temporary VM
build {
  name = "azure-k8s-node"
  sources = ["azure-arm.k8s-node"]

  provisioner "ansible" {
    playbook_file     = "../ansible/setup-node.yaml"
    extra_arguments = [ "--scp-extra-args", "'-O'" ]
    // Tell Packer to skip its own version check if needed
    skip_version_check = true

    // The remote user for SSH
    user              = "azureuser"
  }

  shared_image_gallery_destination {
    gallery_name      = "myImageGallery"   # Shared Image Gallery name
    image_name        = "k8s-node-image"   # Image name in the gallery
    image_version     = "1.0.0"            # Version of the image
    resource_group    = "k8s-setup"        # Resource group containing the gallery
    replication_regions = ["eastus", "westeurope"]  # Regions where image should be replicated
  }
}
