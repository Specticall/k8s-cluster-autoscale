import { execa } from "execa";
import {
  MASTER_VM_SSH_PRIVATE_KEY_PATH,
  MASTER_VM_ADMIN_USERNAME,
  MASTER_VM_IP,
} from "../../config/config";
import replaceRootAliasToAbsolutePath from "../../utils/replace-root-alias-to-absolute-path";
import logger from "../../utils/logger";
import sshToWorkerAndRun from "./ssh-to-worker-and-run";

export default async function joinNodes(vmIps: string[], bastionIp: string) {
  // 1. Retrieve the join command from the master node
  const printJoinCommandOutput = execa("ssh", [
    "-i",
    replaceRootAliasToAbsolutePath(MASTER_VM_SSH_PRIVATE_KEY_PATH),
    "-o",
    "StrictHostKeyChecking=no",
    "-o",
    "UserKnownHostsFile=/dev/null",
    `${MASTER_VM_ADMIN_USERNAME}@${MASTER_VM_IP}`,
    "kubeadm",
    "token",
    "create",
    "--print-join-command",
  ]);
  const printJoinCommand = (await printJoinCommandOutput).stdout;

  // 2. Run the join command on worker nodes (ignore if the node has the /etc/kubernetes/kubelet.conf)
  const joins = vmIps.map(async (workerIp) => {
    const clusterJoinStatusOutput = await sshToWorkerAndRun(
      bastionIp,
      workerIp,
      ["sudo", "cat", "/etc/kubernetes/kubelet.conf"]
    );

    const hasNotJoinedCluster = clusterJoinStatusOutput.stderr.includes(
      "/etc/kubernetes/kubelet.conf: No such file or directory"
    );

    if (hasNotJoinedCluster) {
      logger.info(`Joining ${workerIp} to the cluster`);
      const joinResult = await sshToWorkerAndRun(bastionIp, workerIp, [
        "sudo",
        ...printJoinCommand.split(" "),
      ]);
      if (joinResult.stderr.toLowerCase().includes("error")) {
        logger.error(
          `Unable to join ${workerIp} to the cluster ${joinResult.stderr}`
        );
      }
    }
  });
  await Promise.all(joins);
}
