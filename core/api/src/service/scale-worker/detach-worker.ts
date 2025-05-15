import fs from "fs/promises";
import {
  ANSIBLE_DIR_PATH,
  MASTER_VM_ADMIN_USERNAME,
  MASTER_VM_AZURE_NAME,
  MASTER_VM_IP,
  MASTER_VM_SSH_PRIVATE_KEY_PATH,
  NODE_VM_SSH_PRIVATE_KEY_PATH,
} from "../../config/config";
import { execa } from "execa";
import chalk from "chalk";
import replaceRootAliasToAbsolutePath from "../../utils/replace-root-alias-to-absolute-path";

export default async function detachWorkers(nodeNames: string[]) {
  // 1. Create inventory-master.ini
  const inventoryMasterTemplate = `[master]\n${MASTER_VM_AZURE_NAME} ansible_host=${MASTER_VM_IP} ansible_user=${MASTER_VM_ADMIN_USERNAME}`;
  await fs.writeFile(
    `${ANSIBLE_DIR_PATH}/inventory-master.ini`,
    inventoryMasterTemplate,
    "utf-8"
  );
  console.log(JSON.stringify(nodeNames.map((name) => `k8s-${name}-vm`)));
  // 2. Run the ansible script
  const ansible = execa(
    "ansible-playbook",
    [
      "-i",
      "inventory-master.ini",
      "detach-worker.yaml",
      `--private-key=${replaceRootAliasToAbsolutePath(
        MASTER_VM_SSH_PRIVATE_KEY_PATH
      )}`,
      `-e`,
      // Turn of strict checking for bastion and target VM
      `ansible_user=${MASTER_VM_ADMIN_USERNAME} ansible_ssh_common_args='-o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null' worker_nodes=${JSON.stringify(
        nodeNames.map((name) => `k8s-${name}-vm`)
      )}`,
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

  await ansible;
}
