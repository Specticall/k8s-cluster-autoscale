import chalk from "chalk";

// export default {
//   error(...args: unknown[]) {
//     console.log(chalk.red("[ERROR]"), ...args);
//   },
//   warn(...args: unknown[]) {
//     console.log(chalk.yellow("[WARN]"), ...args);
//   },
//   info(...args: unknown[]) {
//     console.log(chalk.cyan("[LOG]"), ...args);
//   },
//   success(...args: unknown[]) {
//     console.log(chalk.green("[SUCCESS]"), ...args);
//   },
//   break() {
//     console.log("");
//   },
// };

export default class Logger {
  public static error(...args: unknown[]) {
    console.log(chalk.red("[ERROR]"), ...args);
  }

  public static warn(...args: unknown[]) {
    console.log(chalk.yellow("[WARN]"), ...args);
  }

  public static info(...args: unknown[]) {
    console.log(chalk.cyan("[LOG]"), ...args);
  }

  public static success(...args: unknown[]) {
    console.log(chalk.green("[SUCCESS]"), ...args);
  }

  public static break() {
    console.log("");
  }
}
