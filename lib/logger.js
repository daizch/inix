const chalk = require('chalk')
const prefix = require('../package.json').name

const loggerFormat = function(level, label) {
  return function(message) {
    var colors = {
      info: 'white',
      warn: 'yellowBright',
      error: 'redBright',
      success: 'green'
    }
    console.log(`[${chalk.gray(label)}] ${chalk[colors[level]](level)}: ${chalk[colors[level]](message)}`)
  }
}

const logger = {
  info: loggerFormat('info', prefix),
  warn: loggerFormat('warn', prefix),
  error: loggerFormat('error', prefix),
  success: loggerFormat('success', prefix),
}

exports.log = exports.info = logger.info


exports.warn = logger.warn

exports.error = exports.fatal = function (msg) {
  logger.error(chalk.red(JSON.stringify(msg)))
}

exports.success = logger.success