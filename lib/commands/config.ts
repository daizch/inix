import * as fs from "fs-extra";
import path from "path";
import { execSync } from "child_process";
import { updateTemplateData } from "../utils";
import isGitUrl from "is-git-url";
import isValidPath from "is-valid-path";
// @ts-ignore: no types
import isLocalPath from "is-local-path";
// @ts-ignore: no types
import wget from "node-wget";
import tmp from "tmp";
import inquirer from "inquirer";
import logger from "../logger";

function save(file: string) {
  try {
    let config = fs.readJsonSync(file);
    inquirer
      .prompt([
        {
          type: "confirm",
          name: "yes",
          message: "Are you sure to overwrite your template config",
        },
      ])
      .then(({ yes }) => {
        if (yes) {
          updateTemplateData(config);
        }
      });
  } catch (err) {
    throw new Error(err);
  }
}

export default async function (tplConfigPath: string) {
  if (!isValidPath(tplConfigPath)) {
    throw new Error("invalid config path");
  } else if (isLocalPath(tplConfigPath)) {
    tplConfigPath = path.resolve(tplConfigPath);
    if (!fs.existsSync(tplConfigPath)) {
      throw new Error("un-found config file");
    }

    save(tplConfigPath);
  } else if (isGitUrl(tplConfigPath)) {
    let tmpDir = tmp.dirSync().name;

    execSync(`git clone --quiet ${tplConfigPath} ${tmpDir}`);
    let configFilePath = path.join(tmpDir, "template.json");
    if (fs.existsSync(configFilePath)) {
      save(configFilePath);
    } else {
      logger.error(
        `failed to find ${configFilePath}, please make sure it exists`
      );
    }
  } else {
    let tmpFile = tmp.fileSync().name;
    wget({ url: tplConfigPath, dest: tmpFile }, function (error: string) {
      if (error) {
        throw new Error(error);
      }

      save(tmpFile);
    });
  }
};
