variable "workers_config" {
  type = map(object({
    network_range = string
    subnet_range = string
    vm_ids = list(string)
  }))
}
