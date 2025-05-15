import { detachWorkers, joinNodes, logger, startSSHAgent } from "../../utils";
import { TerraformProvider } from "../../providers/terraform/terraform-provider";

export class ScaleWorkerService {
  private prodivider = new TerraformProvider();

  public async scale(vmsCountNew: number) {
    logger.info("Gathering information on node count");

    const vmsCountCurrent = await this.prodivider.getCurrentNodeCount();
    if (vmsCountCurrent === vmsCountNew) {
      logger.warn("No difference in node count, cancelling operations");
      return;
    }

    const removedWorkerNames = await this.prodivider.diff(vmsCountNew);
    logger.success("Successfuly gathered information");

    logger.info("Starting SSH agent, please wait...");
    await startSSHAgent();
    logger.success("Successfuly started SSH agent");

    if (removedWorkerNames.length > 0) {
      logger.info("Scaling VM Downwards...");

      logger.info("Detaching workers from the cluster");
      await detachWorkers(removedWorkerNames);
      logger.success("Successfuly detached workers from the cluster");

      logger.info("Destroying unused nodes");
      await this.prodivider.destroy(vmsCountNew);
      logger.info("Successfuly destroyed unused nodes");

      logger.success(`Successfully scaled VM downwards to ${vmsCountNew}`);
    } else {
      logger.info("Scaling VM Upwards...");

      logger.info("Provisioning new VMs");
      const ip = await this.prodivider.provision(vmsCountNew);
      logger.info("Successfully provisioned new VMs");

      logger.info("Joining provisioned nodes into the cluster, please wait...");
      await joinNodes(ip.workers, ip.bastion);
      logger.success("Successfully joined nodes to the cluster");

      logger.success(`Successfully scaled VM upwards to ${vmsCountNew}`);
    }
  }

  // public async scale(vmCount: number) {
  //   logger.info("Starting SSH agent, please wait...");
  //   await startSSHAgent();
  //   logger.success("Successfuly started SSH agent");

  //   logger.info("Updating terraform config file, please wait...");
  //   const { removedVMs } = await this.terraform.updateConfig(vmCount);
  //   logger.success("Sucessfully updated terraform config file");

  //   // Drain & Remove unused worker vms
  //   if (removedVMs.length > 0) {
  //     logger.info("Removing vms from the cluster, please wait...");
  //     await detachWorkers(removedVMs);
  //     logger.success("Successfuly detached workers from the cluster");
  //   }

  //   logger.info("Updating terraform state, please wait...");
  //   await this.terraform.runApply();
  //   logger.success("Successfuly provisined desired state");

  //   if (removedVMs.length === 0) {
  //     // Retrieve terraform output
  //     logger.info("Retrieving vm ips from terraform state, please wait...");
  //     const [vmIpList, bastionIpList] = await Promise.all([
  //       this.terraform.getOutput("vms", vmIpSchema),
  //       this.terraform.getOutput("bastion_public_ip", vmIpSchema),
  //     ]);
  //     const bastionIp = Object.values(bastionIpList)[0];
  //     if (!bastionIp) {
  //       throw new Error("Bastion ip does not exist");
  //     }
  //     logger.success("Successfuly retrieved vm ips");

  //     // // Configure VM and setup k8s dependencies
  //     // logger.info("Configuring vms using ansible playbook, please wait...");
  //     // await setupNodeVMWithAnsible(vmIpList, bastionIp);
  //     // logger.success("Successfuly configured vms");

  //     logger.info("Joining provisioned nodes into the cluster, please wait...");
  //     await joinNodes(vmIpList, bastionIp);
  //     logger.success("Successfuly joined nodes to the cluster");
  //     logger.break();
  //   }
  // }
}
