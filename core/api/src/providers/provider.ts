type ProviderProvisionIpReturnType = {
  workers: string[];
  bastion: string;
};

type ProviderRemovedWorkerNameType = string[];

interface Provider {
  provision(
    targetVMCount: number
  ): Promise<ProviderProvisionIpReturnType> | ProviderProvisionIpReturnType;
  destroy(targetVMCount: number): Promise<void> | void;
  getCurrentNodeCount(): Promise<number> | number;
  diff(
    targetVMCount: number
  ): Promise<ProviderRemovedWorkerNameType> | ProviderRemovedWorkerNameType;
}
