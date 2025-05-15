import { execa } from "execa";
import { NODE_VM_SSH_PRIVATE_KEY_PATH } from "../../config/config";
import replaceRootAliasToAbsolutePath from "../../utils/replace-root-alias-to-absolute-path";

/**
In order to forward ssh requests using the bastion vm, the local machine needs to have `ssh-agent` running or else the key won't be forwarded to bastion and we need to manually inject the key to each vm or the ssh will fail
 */
export default async function startSSHAgent() {
  // Assign envs with the `ssh-agent -s` command
  // Note: In the terminal, we can use eval() to automatically assigned the return value of `ssh-agent -s` to the env but with node's child processes (execa) we need to manually insert them into the runtime process enviroment
  const sshAgentStartOutput = await execa("ssh-agent", ["-s"]);
  const agentStartEnvArgs = sshAgentStartOutput.stdout.split("\n");
  agentStartEnvArgs.forEach((args) => {
    if (args.startsWith("SSH_AUTH_SOCK")) {
      process.env.SSH_AUTH_SOCK = args.split("=")[1].split(";")[0];
    }
    if (args.startsWith("SSH_AGENT_PID")) {
      process.env.SSH_AGENT_PID = args.split("=")[1].split(";")[0];
    }
  });

  const sshAddOutput = await execa(
    "ssh-add",
    // Replace ~ with absolute path (execa does not work with path aliases)
    [replaceRootAliasToAbsolutePath(NODE_VM_SSH_PRIVATE_KEY_PATH)],
    {
      reject: false,
      env: process.env,
    }
  );

  if (!sshAddOutput.stderr.startsWith("Identity added:")) {
    throw new Error(sshAddOutput.stderr);
  }

  return;
}
