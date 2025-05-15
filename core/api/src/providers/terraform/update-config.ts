import fs from "fs/promises";
import {
  MAX_VM_COUNT_PER_REGION,
  TERRAFORM_DIR_PATH,
} from "../../config/config";
import { azureRegions } from "../../config/azure-regions";
import { v4 } from "uuid";
import { TerraformConfig, terraformConfigSchema } from "./terraform-provider";

type WorkerConfigMap = Map<string, TerraformConfig["workers_config"][string]>;

const createVMIdList = (count: number) =>
  Array.from({ length: count }, () => `worker-${v4().slice(0, 6)}`);

export default async function updateConfig(
  targetVMCount: number
): Promise<{ newWorkersConfig: WorkerConfigMap; removedVMs: string[] }> {
  if (MAX_VM_COUNT_PER_REGION <= 0) {
    throw new Error(
      "Invalid MAX_VM_COUNT_PER_REGION: Must be a positive integer"
    );
  }

  let rawTerraformConfig = "";
  try {
    rawTerraformConfig = await fs.readFile(
      `${TERRAFORM_DIR_PATH}/terraform.tfvars.json`,
      "utf-8"
    );
  } catch (err) {
    throw new Error(
      `Failed to read terraform configurationf file: ${(err as Error).message}`
    );
  }

  const terraformConfig = terraformConfigSchema.parse(
    JSON.parse(rawTerraformConfig)
  );
  // We're using a map because we're going to be dynamically inserting / removing some key value pairs
  const vmRegionList = new Map(Object.entries(terraformConfig.workers_config));

  let currentVmCount = 0;
  for (const region of vmRegionList.values()) {
    currentVmCount += region.vm_ids.length;
  }

  if (currentVmCount === targetVMCount) {
    return { newWorkersConfig: vmRegionList, removedVMs: [] };
  }

  const shouldIncreaseVM = currentVmCount < targetVMCount;
  let vmDifference = targetVMCount - currentVmCount;
  const removedVMs: string[] = [];
  vmRegionList.forEach((region, regionName) => {
    if (shouldIncreaseVM) {
      const vmsToAdd = Math.min(
        vmDifference,
        MAX_VM_COUNT_PER_REGION - region.vm_ids.length
      );
      region.vm_ids.push(...createVMIdList(vmsToAdd));
      vmDifference -= vmsToAdd;
      return;
    }
    // TODO : Remove Vms with the highest cpu usage
    // Handle VM Removal
    const vmsToRemoveCount = Math.min(
      Math.abs(vmDifference),
      MAX_VM_COUNT_PER_REGION
    );

    if (vmsToRemoveCount === 0) return;

    if (region.vm_ids.length === vmsToRemoveCount) {
      // Deletes the entire region object if the array becomes empty after id removal
      const vmsToBeRemoved = vmRegionList.get(regionName)?.vm_ids || [];
      removedVMs.push(...vmsToBeRemoved);
      vmRegionList.delete(regionName);
    } else {
      // Remove specific vms from the region
      const vmsToBeRemoved = region.vm_ids.splice(-vmsToRemoveCount);
      removedVMs.push(...vmsToBeRemoved);
    }

    vmDifference += vmsToRemoveCount;
  });

  if (vmDifference === 0) {
    return { newWorkersConfig: vmRegionList, removedVMs };
  }

  // Create an array that stores the name of available regions
  const availableRegions = azureRegions.filter(
    (region) => !vmRegionList.get(region.name)
  );

  while (vmDifference !== 0 && availableRegions.length > 0) {
    const regionToAppend = availableRegions.shift();
    if (!regionToAppend) break;

    const newVmsCount = Math.min(vmDifference, MAX_VM_COUNT_PER_REGION);
    vmRegionList.set(regionToAppend.name, {
      network_range: regionToAppend.networkRange,
      subnet_range: regionToAppend.subnetRange,
      vm_ids: createVMIdList(newVmsCount),
    });

    vmDifference -= newVmsCount;
  }
  return { newWorkersConfig: vmRegionList, removedVMs };
}
