variable "resource_group_name" {
  type = string
}

variable "master" {
  type = object({
    location = string
    vn_id = string
    vn_name = string
  })
}

variable "worker" {
  type = object({
    location = string
    network_range = string
    subnet_range = string
  })
}
