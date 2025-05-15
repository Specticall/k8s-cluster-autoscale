#!/bin/bash

# Extract the Terraform output and format it into Ansible inventory
jq -r '.[] | "vm-\(. | split(".")[3]) ansible_host=\(.) ansible_user=worker ansible_ssh_private_key_file=./../k8s-key"' ./inventory.json > inventory.ini

# Add inventory group headers
echo -e "[all_vms]\n$(cat inventory.ini)" > inventory.ini
