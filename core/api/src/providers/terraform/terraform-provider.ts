import { TERRAFORM_DIR_PATH, TERRAFORM_OUTPUT_NAME } from "../../config/config";
import fs from "fs/promises";
import updateConfig from "./update-config";
import { ExecaStreamLogger } from "../../utils/execa-stream-logger";
import { execa } from "execa";
import chalk from "chalk";
import { z } from "zod";

export const terraformConfigSchema = z.object({
  workers_config: z.record(
    z.string(),
    z.object({
      network_range: z.string(),
      subnet_range: z.string(),
      vm_ids: z.array(z.string()),
    })
  ),
});
export type TerraformConfig = z.infer<typeof terraformConfigSchema>;
const vmIpSchema = z.record(z.string(), z.string());
export type VMIps = z.infer<typeof vmIpSchema>;

export class TerraformProvider implements Provider {
  private directoryPath = TERRAFORM_DIR_PATH;
  private outputName = TERRAFORM_OUTPUT_NAME;

  public async provision(targetVMCount: number) {
    await this.diffState(targetVMCount);
    await this.runApply();

    const [vmIpList, bastionIpList] = await Promise.all([
      this.getOutput("vms", vmIpSchema),
      this.getOutput("bastion_public_ip", vmIpSchema),
    ]);

    return {
      workers: Object.values(vmIpList),
      bastion: Object.values(bastionIpList)[0],
    };
  }

  public async destroy(targetVMCount: number) {
    await this.provision(targetVMCount);
  }

  public async diff(targetVMCount: number) {
    const removedWorkerNames = await this.diffState(targetVMCount);
    return removedWorkerNames;
  }

  public async getCurrentNodeCount() {
    const rawConfig = await fs.readFile(
      this.directoryPath + "/terraform.tfvars.json",
      "utf-8"
    );
    const parsedConfig = terraformConfigSchema.parse(JSON.parse(rawConfig));
    const count = Object.values(parsedConfig.workers_config).reduce(
      (acc, cur) => (acc += cur.vm_ids.length),
      0
    );

    return count;
  }

  private async diffState(targetVMCount: number) {
    const { newWorkersConfig, removedVMs } = await updateConfig(targetVMCount);
    await this.writeTfVarsJson({
      workers_config: Object.fromEntries(newWorkersConfig),
    });
    return removedVMs;
  }

  private async writeTfVarsJson(config: unknown) {
    await fs.writeFile(
      this.directoryPath + "/terraform.tfvars.json",
      JSON.stringify(config, null, "\t"),
      "utf-8"
    );
  }

  private async runApply() {
    const terraform = execa("terraform", ["apply", "-auto-approve"], {
      cwd: TERRAFORM_DIR_PATH,
    });
    new ExecaStreamLogger(terraform, chalk.magenta("[TERRAFORM]"));
    return terraform;
  }

  private async getOutput<T extends z.ZodTypeAny>(name: string, schema: T) {
    try {
      const { stdout, stderr } = await execa(
        "terraform",
        ["output", "-json", name],
        { cwd: this.directoryPath }
      );
      if (stderr) {
        throw new Error(stderr);
      }
      const rawOutput = JSON.parse(stdout);
      return schema.parse(rawOutput) as z.infer<T>;
    } catch (error: unknown) {
      if (!(error instanceof Error)) {
        throw new Error("Oops something went wrong!");
      }

      // Log the error for debugging
      console.error("Error extracting Terraform output:", error.message);

      // Throw a meaningful error
      throw new Error(
        `Failed to extract Terraform output for '${this.outputName}'. Ensure Terraform is installed, the directory is correct, and the output exists.`
      );
    }
  }
}
