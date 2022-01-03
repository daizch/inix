const chalk = require("chalk");
const prefix = 'inix';

const loggerFormat = function (level: string, label: string) {
  return function (message: string) {
    var colors: Record<string, string> = {
      info: "white",
      warn: "yellowBright",
      error: "redBright",
      success: "green",
    };
    const color = colors[level];
    console.log(
      `[${chalk.gray(label)}] ${chalk[color](level)}: ${chalk[color](message)}`
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

export default { log, info, warn, error, fatal, success };
