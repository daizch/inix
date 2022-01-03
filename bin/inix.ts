#!/usr/bin/env node
import { program } from "commander";
import chalk from "chalk";
import path from "path";
import updateNotifier from "update-notifier";
import initTemplate from "../lib/commands/create";
import addTemplate from "../lib/commands/add";
import listTemplate from "../lib/commands/list";
import deleteTemplate from "../lib/commands/delete";
import setupTemplateList from "../lib/commands/config";

const pkg = require("../../package.json");

program.version(pkg.version);

program
  .command("config <target>")
  .description("config template records path")
  .action(async function (target) {
    await setupTemplateList(target);
  });

/**
 * scaffold to init project
 */
program
  .command("create [target]")
  .description("create a new project")
  .option("-t, --templatePath [value]", "init with local template")
  .option("-d, --destPath [value]", "destination path for generating")
  .action(async function (target, options) {
    if (options.templatePath) {
      options.templatePath = path.resolve(options.templatePath);
    } else if (target) {
      options.templatePath = target;
    }
    await initTemplate(options);
  });

program
  .command("add")
  .description("add new template")
  .action(async function () {
    await addTemplate();
  });

program
  .command("delete")
  .alias("del")
  .description("delete a template from records")
  .action(function (options) {
    deleteTemplate();
  });

program
  .command("list")
  .alias("ls")
  .description("list all templates")
  .action(function () {
    listTemplate();
  });

program.on("--help", () => {
  console.log(`  Usages:
    ${chalk.gray("# create a new project by someone template")}
    $ inix 
  `);
});

// error on unknown commands
program.on("command:*", function () {
  console.error(
    "Invalid command: %s\nSee --help for a list of available commands.",
    program.args.join(" ")
  );
  program.outputHelp();
  checkLatestVersion();
  process.exit(1);
});

process.on("uncaughtException", handleError);

process.on("unhandledRejection", handleError);

function handleError(err: string) {
  console.log(err);
  checkLatestVersion();
  process.exit(1);
}

function help() {
  checkLatestVersion();
  program.parse(process.argv);
  if (program.args.length < 1) return program.help();
}

function checkLatestVersion() {
  var notifier = updateNotifier({ pkg });
  if (notifier.update) {
    console.log(`Update available: ${notifier.update.latest}`);
  }
}

help();
