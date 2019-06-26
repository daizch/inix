#!/usr/bin/env node
const program = require('commander')
const chalk = require('chalk')
const path = require('path')
const updateNotifier = require('update-notifier');
const initTemplate = require('../lib/commands/init')
const addTemplate = require('../lib/commands/add')
const listTemplate = require('../lib/commands/list')
const deleteTemplate = require('../lib/commands/delete')
const setupTemplateList = require('../lib/commands/config')
const pkg = require('../package.json')

program
  .version(pkg.version)


program
.command('config <target>')
.description('config template records path')
.action(async function (target, options) {
  await setupTemplateList(target, options)
})

/**
 * scaffold to init project
 */
program
  .command('create [target]')
  .description('create a new project')
  .option('-t, --templatePath [value]', 'init with local template')
  .option('-d, --destPath [value]', 'destination path for generating')
  .action(async function (target, options) {
    if (options.templatePath) {
      options.templatePath = path.resolve(options.templatePath)
    } else if (target) {
      options.templatePath = target
    }
    await initTemplate(options)
  })

program
  .command('add')
  .description('add new template')
  .action(async function (options) {
    await addTemplate(options)
  })

program
  .command('delete')
  .alias('del')
  .description('delete a template from records')
  .action(function (options) {
    deleteTemplate(options,)
  })

program
  .command('list')
  .alias('ls')
  .description('list all templates')
  .action(function (options) {
    listTemplate(options)
  })

program.on('--help', () => {
  console.log(`  Usages:
    ${chalk.gray('# create a new project by someone template')}
    $ inix 
  `)
})

// error on unknown commands
program.on('command:*', function () {
  console.error('Invalid command: %s\nSee --help for a list of available commands.', program.args.join(' '));
  program.outputHelp();
  checkLatestVersion();
  process.exit(1);
});


process.on('uncaughtException', function (err) {
  console.log(err);
  checkLatestVersion();
});

process.on('unhandledRejection', function (err) {
  console.log(err);
  process.exit(1)
});

function help() {
  checkLatestVersion();
  program.parse(process.argv)
  if (program.args.length < 1) return program.help()
}


function checkLatestVersion() {
  var notifier = updateNotifier({ pkg });
  if (notifier.update) {
    console.log(`Update available: ${notifier.update.latest}`);
  }
}

help()