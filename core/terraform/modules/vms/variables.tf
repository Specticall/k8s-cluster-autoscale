variable "id_list" {
  type = list(string)
  description = "Identifier for each vms, must be a string of sequential number starting from 0"
}

variable "vnet" {
  type = object({
    location = string
  })
}

variable "subnet" {
  type = object({
    id = string
  })
}

variable "resource_group_name" {
  type = string
}

variable "access" {
  type = object({
    admin_username = string
    public_ssh_key_path = string
  })
}

variable "create_public_ip" {
  type = bool
  default = true
}

variable "image_id" {
  type = string
  default = ""
}
