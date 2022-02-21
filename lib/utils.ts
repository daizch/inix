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

export const updateTemplateData = function (tplData: any) {
  if (typeof tplData === "object") {
    tplData = JSON.stringify(tplData, null, 2);
  }
  fs.writeFileSync(tplPath, tplData);
};

export const downloadRepo = function (
  gitUrl: string,
  tmpDir: string,
  gitCloneCommand: string
) {
  tmpDir = tmpDir || tmp.dirSync().name;
  const command = gitCloneCommand || `git clone --quiet ${gitUrl} ${tmpDir}`;
  execSync(command, {
    env: process.env,
    cwd: process.cwd(),
  });
  return tmpDir;
};

export function isGitUrl(gitUrl: string) {
  var regex =
    /(?:git|ssh|https?|git(lab)?@[-\w.]+):(\/\/)?(.*?)(\.git)(\/?|\#[-\d\w._]+?)$/;
  return regex.test(gitUrl);
}
