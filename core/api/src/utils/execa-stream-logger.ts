import chalk from "chalk";
import { ResultPromise } from "execa";

/**
 * ExecaStreamLogger listens to the stdout and stderr streams of an execa process,
 * formats the output with a label and optional color, and writes it to process.stdout.
 *
 * @example
 * import chalk from "chalk";
 * import execa from "execa";
 * import { ExecaStreamLogger } from "./execa-stream-logger";
 *
 * const terraform = execa("terraform", ["plan"]);
 * new ExecaStreamLogger(terraform, chalk.magenta("[TERRAFORM]"));
 *
 * @class ExecaStreamLogger
 * @param {ResultPromise} streamSource - The execa process whose streams will be logged.
 * @param {string} source - A label to prefix each log line (e.g., the process name).
 */
export class ExecaStreamLogger {
  constructor(private streamSource: ResultPromise, private source: string) {
    this.streamSource = streamSource;
    this.source = source;

    // Add stream listener
    this.streamSource.stdout?.on("data", this.handleStreamOutput);
    this.streamSource.stderr?.on("data", this.handleStreamOutput);
  }

  /**
   * Arrow function is used to keep the `this` keyword reference to the object instance
   */
  handleStreamOutput = (data: unknown) => {
    const output = `${this.source} ${data?.toString()}`;
    process.stdout.write(output);
  };
}
