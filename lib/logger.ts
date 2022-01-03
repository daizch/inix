import chalk from "chalk";
const prefix = require("../package.json").name;

const loggerFormat = function (level: string, label: string) {
  return function (message: string) {
    var colors = {
      info: "white",
      warn: "yellowBright",
      error: "redBright",
      success: "green",
    };
    console.log(
      `[${chalk.gray(label)}] ${chalk[colors[level]](level)}: ${chalk[
        colors[level]
      ](message)}`
    );
  };
};

const logger = {
  info: loggerFormat("info", prefix),
  warn: loggerFormat("warn", prefix),
  error: loggerFormat("error", prefix),
  success: loggerFormat("success", prefix),
};

const log = logger.info;
const info = log;
const warn = logger.warn;
const error = function (msg: any) {
  logger.error(chalk.red(JSON.stringify(msg)));
};
const fatal = error;
const success = logger.success;

export { log, info, warn, error, fatal, success };
