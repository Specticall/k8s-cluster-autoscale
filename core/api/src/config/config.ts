export const TERRAFORM_DIR_PATH = `${process.cwd()}/../terraform`;
export const TERRAFORM_JSON_OUTPUT_DIR_PATH = `${process.cwd()}`;
export const TERRAFORM_OUTPUT_NAME = "vms";
export const ANSIBLE_DIR_PATH = `${process.cwd()}/../ansible`;
export const RABBIT_MQ_URL = process.env.RABBIT_MQ_URL || "amqp://localhost";

// USER CONFIGURATION
export const NODE_VM_ADMIN_USERNAME =
  process.env.NODE_VM_ADMIN_USERNAME || "worker";
export const NODE_VM_SSH_PRIVATE_KEY_PATH =
  process.env.NODE_VM_SSH_PRIVATE_KEY_PATH || `~/.ssh/k8s-key`;
export const MASTER_VM_AZURE_NAME =
  process.env.MASTER_VM_AZURE_NAME || "k8s-master-0-vm";
export const MASTER_VM_ADMIN_USERNAME =
  process.env.MASTER_VM_ADMIN_USERNAME || "master";
export const MASTER_VM_IP = process.env.MASTER_VM_IP || "20.255.57.25";
export const MAX_VM_COUNT_PER_REGION = process.env.MAX_VM_COUNT_PER_REGION || 2;
export const API_PORT = process.env.API_PORT || 8000;
export const IS_PRODUCTION = process.env.IS_PRODUCTION || false;

// Don't forget to run `chmod 600 <path>`
export const MASTER_VM_SSH_PRIVATE_KEY_PATH =
  process.env.MASTER_VM_SSH_PRIVATE_KEY_PATH || `~/.ssh/k8s-master-1-key.pem`;
