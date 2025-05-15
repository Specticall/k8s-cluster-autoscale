import z from "zod";
import fs from "fs/promises";
import { detachWorkers, joinNodes, logger, startSSHAgent } from "../../utils";
import { TerraformService } from "../terraform-service";

// export default async function scaleWorker(targetVMCount: number) {
//   try {
//     // Create terraform configuration file
//     logger.info("Updating terraform config file, please wait...");
//     const { newWorkersConfig, removedVMs } = await updateTerraformConfig(
//       Number(targetVMCount)
//     );
//     const newTerraformConfig = {
//       workers_config: Object.fromEntries(newWorkersConfig),
//     };
//     await fs.writeFile(
//       `${TERRAFORM_DIR_PATH}/terraform.tfvars.json`,
//       JSON.stringify(newTerraformConfig, null, "\t"),
//       "utf-8"
//     );
//     logger.success("Sucessfully updated terraform config file");

//     // Ensure agent is running
//     logger.info("Starting SSH agent, please wait...");
//     await startSSHAgent();
//     logger.success("Successfuly started SSH agent");

//     // Drain & Remove unused worker vms
//     if (removedVMs.length > 0) {
//       logger.info("Removing vms from the cluster, please wait...");
//       await detachWorkers(removedVMs);
//       logger.success("Successfuly detached workers from the cluster");
//       logger.break();
//     }

//     // Execute terraform
//     logger.info("Updating terraform state, please wait...");
//     await runTerraformApply();
//     logger.success("Successfuly provisined desired state");
//     logger.break();

//     if (removedVMs.length === 0) {
//       // Retrieve terraform output
//       logger.info("Retrieving vm ips from terraform state, please wait...");
//       const [vmIpList, bastionIpList] = await Promise.all([
//         getTerraformOutput("vms", vmIpSchema),
//         getTerraformOutput("bastion_public_ip", vmIpSchema),
//       ]);
//       const bastionIp = Object.values(bastionIpList)[0];
//       if (!bastionIp) {
//         throw new Error("Bastion ip does not exist");
//       }
//       logger.success("Successfuly retrieved vm ips");
//       logger.break();

//       // // Configure VM and setup k8s dependencies
//       // logger.info("Configuring vms using ansible playbook, please wait...");
//       // await setupNodeVMWithAnsible(vmIpList, bastionIp);
//       // logger.success("Successfuly configured vms");

//       logger.info("Joining provisioned nodes into the cluster, please wait...");
//       await joinNodes(vmIpList, bastionIp);
//       logger.success("Successfuly joined nodes to the cluster");
//       logger.break();
//     }

//     logger.success("Successfuly scaled the kubernetes worker nodes");
//   } catch (err) {
//     console.log(err);
//   }
// }

const vmIpSchema = z.record(z.string(), z.string());
export type VMIps = z.infer<typeof vmIpSchema>;

export class ScaleWorkerService {
  private terraform = TerraformService.getInstance();

  public async scale(vmCount: number) {
    logger.info("Starting SSH agent, please wait...");
    await startSSHAgent();
    logger.success("Successfuly started SSH agent");

    logger.info("Updating terraform config file, please wait...");
    const { removedVMs } = await this.terraform.updateConfig(vmCount);
    logger.success("Sucessfully updated terraform config file");

    // Drain & Remove unused worker vms
    if (removedVMs.length > 0) {
      logger.info("Removing vms from the cluster, please wait...");
      await detachWorkers(removedVMs);
      logger.success("Successfuly detached workers from the cluster");
    }

    logger.info("Updating terraform state, please wait...");
    await this.terraform.runApply();
    logger.success("Successfuly provisined desired state");

    if (removedVMs.length === 0) {
      // Retrieve terraform output
      logger.info("Retrieving vm ips from terraform state, please wait...");
      const [vmIpList, bastionIpList] = await Promise.all([
        this.terraform.getOutput("vms", vmIpSchema),
        this.terraform.getOutput("bastion_public_ip", vmIpSchema),
      ]);
      const bastionIp = Object.values(bastionIpList)[0];
      if (!bastionIp) {
        throw new Error("Bastion ip does not exist");
      }
      logger.success("Successfuly retrieved vm ips");

      // // Configure VM and setup k8s dependencies
      // logger.info("Configuring vms using ansible playbook, please wait...");
      // await setupNodeVMWithAnsible(vmIpList, bastionIp);
      // logger.success("Successfuly configured vms");

      logger.info("Joining provisioned nodes into the cluster, please wait...");
      await joinNodes(vmIpList, bastionIp);
      logger.success("Successfuly joined nodes to the cluster");
      logger.break();
    }
  }
}
