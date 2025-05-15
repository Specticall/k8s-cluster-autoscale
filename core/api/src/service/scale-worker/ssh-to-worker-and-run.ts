import { execa } from "execa";
import replaceRootAliasToAbsolutePath from "../../utils/replace-root-alias-to-absolute-path";
import {
  NODE_VM_ADMIN_USERNAME,
  NODE_VM_SSH_PRIVATE_KEY_PATH,
} from "../../config/config";

/**
 * SSH to worker with a jump through the bastion server then run a specified command
 */
export default async function sshToWorkerAndRun(
  bastionIp: string,
  workerIp: string,
  args: string[]
) {
  return execa(
    "ssh",
    [
      "-i",
      replaceRootAliasToAbsolutePath(NODE_VM_SSH_PRIVATE_KEY_PATH),
      // Use SSH Agent Forwarding
      "-A",
      // Disable host key checking for the bastion
      "-o",
      "StrictHostKeyChecking=no",
      "-o",
      "UserKnownHostsFile=/dev/null",
      // Use ProxyCommand to connect through the bastion
      "-o",
      `ProxyCommand=ssh -i ${replaceRootAliasToAbsolutePath(
        NODE_VM_SSH_PRIVATE_KEY_PATH
      )} -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null -W %h:%p bastion@${bastionIp}`,
      // Disable host key checking for the target VM
      "-o",
      "StrictHostKeyChecking=no",
      "-o",
      "UserKnownHostsFile=/dev/null",
      // Target VM
      `${NODE_VM_ADMIN_USERNAME}@${workerIp}`,
      ...args,
    ],
    { reject: false }
  );
}
