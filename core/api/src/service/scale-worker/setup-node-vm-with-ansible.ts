import chalk from "chalk";
import { execa } from "execa";
import fs from "fs/promises";
import {
  ANSIBLE_DIR_PATH,
  NODE_VM_ADMIN_USERNAME,
  NODE_VM_SSH_PRIVATE_KEY_PATH,
} from "../../config/config";
import { VMIps } from "../../providers/terraform/terraform-provider";

export default async function setupNodeVMWithAnsible(
  vmIps: VMIps,
  bastionIp: string
) {
  // Setup inventory file
  const vmListInvetorySpecification = Object.entries(vmIps)
    .map(([name, ip]) => {
      return `${name} ansible_host=${ip} ansible_user=${NODE_VM_ADMIN_USERNAME}`;
    })
    .join("\n");

  const invetoryFileTemplate = `[workers]\n${vmListInvetorySpecification}`;

  await fs.writeFile(
    `${ANSIBLE_DIR_PATH}/inventory.ini`,
    invetoryFileTemplate,
    "utf-8"
  );

  // Prevents the `are you sure you want to continue connecting (yes/no/[fingerprint])?` prompt
  process.env.ANSIBLE_HOST_KEY_CHECKING = "False";
  process.env.ANSIBLE_SSH_ARGS = "-o StrictHostKeyChecking=no";

  const ansible = execa(
    "ansible-playbook",
    [
      "-i",
      "inventory.ini",
      "setup-node.yaml",
      `--private-key=${NODE_VM_SSH_PRIVATE_KEY_PATH}`,
      `-e`,
      // Turn of strict checking for bastion and target VM
      `ansible_user=worker ansible_ssh_common_args='-o ProxyCommand="ssh -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null -W %h:%p bastion@${bastionIp}" -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null'`,
    ],
    {
      cwd: ANSIBLE_DIR_PATH,
    }
  );

  const handleStreamOutput = (data: unknown) => {
    process.stdout.write(`${chalk.yellow("[ANSIBLE]")} ${data?.toString()}`);
  };

  // Handle terraform data stream
  ansible.stdout.on("data", handleStreamOutput);
  ansible.stderr.on("data", handleStreamOutput);

  return ansible;
}
