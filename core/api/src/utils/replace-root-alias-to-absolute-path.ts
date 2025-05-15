import os from "os";
import path from "path";

export default function replaceRootAliasToAbsolutePath(input: string) {
  return input.startsWith("~")
    ? path.join(os.homedir(), input.slice(1))
    : input;
}
