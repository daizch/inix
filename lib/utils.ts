import path from "path";
import fs from "fs-extra";
import { execSync } from "child_process";
import { homedir } from "os";
import tmp from "tmp";
const tplPath = path.join(homedir(), ".inix", "template.json");
fs.ensureFileSync(tplPath);

export const getTemplateRecords = function () {
  try {
    const tpls = fs.readJsonSync(tplPath);
    return tpls;
  } catch (e) {
    return {};
  }
};

export const updateTemplateData = function (tplData) {
  if (typeof tplData === "object") {
    tplData = JSON.stringify(tplData, null, 2);
  }
  fs.writeFileSync(tplPath, tplData);
};

export const downloadRepo = function (gitUrl: string, tmpDir: string) {
  tmpDir = tmpDir || tmp.dirSync().name;
  execSync(`git clone --quiet ${gitUrl} ${tmpDir}`, {
    env: process.env,
    cwd: process.cwd(),
  });
  return tmpDir;
};
