import picocolors from "picocolors";
import fs from "fs";
import Metalsmith from "metalsmith";
import inquirer, { Question, ListQuestion, Answers } from "inquirer";
import { createSpinner } from "nanospinner";
import { ejs } from "consolidate";
import path from "path";
import logger from "../logger";
import JoyCon from "joycon";
import { getTemplateRecords, downloadRepo } from "../utils";
import tmp from "tmp";
import { isGitUrl } from "../utils";

const render = ejs.render;
export interface CreationOption {
  projectName?: string;
  templatePath: string; //the path of the template(gitUrl or local path)
  projectTemplatePath?: string; //the local path of the boilerplate
  destPath?: string;
  data?: Answers;
  shouldAskQuestions?: boolean;
  gitCloneCommand?: string;
}

interface CallbackParams {
  destPath: string;
  answers: Answers;
  data?: Answers;
}

interface MetaConfig {
  questions?: Array<any>;
  endCallback?: (
    data: CallbackParams,
    { chalk: picocolors, logger, files }: any
  ) => void;
}

async function getOptions(projectTemplatePath: string): Promise<MetaConfig> {
  const joycon = new JoyCon({ cwd: projectTemplatePath });
  const moduleName = "meta";
  const config = await joycon.load([
    // 'package.json',
    `.${moduleName}rc`,
    `.${moduleName}.json`,
    `.${moduleName}.yaml`,
    `.${moduleName}.yml`,
    `.${moduleName}.js`,
    `${moduleName}.js`,
  ]);
  return config.data ?? {};
}

function copyTo(src: string, dest: string, done: () => void) {
  var metalsmith = Metalsmith(src);
  metalsmith
    .clean(false)
    .source(".")
    .destination(dest)
    .build((err) => {
      if (err) throw err;
      done();
    });
}

async function initProject(config: CreationOption) {
  const metaOpts = await getOptions(config.projectTemplatePath);

  runMetalsmith(config, metaOpts);
}

function runMetalsmith(config: CreationOption, metaOpts: MetaConfig) {
  const metalsmith = Metalsmith(
    path.join(config.projectTemplatePath, "template")
  );
  const metaData: any = metalsmith.metadata();

  const questions = metaOpts && metaOpts.questions;
  config.data = config.data ?? {};

  //resolve the output destination path
  metaData.destPath = config.destPath
    ? path.resolve(config.destPath)
    : path.join(process.cwd(), config.data.projectName || "");

  metalsmith.use(askQuestions(questions, config)).use(renderTemplateFiles());

  metalsmith
    .clean(false)
    .source(".")
    .destination(metaData.destPath)
    .build((err, files) => {
      if (err) throw err;

      if (typeof metaOpts.endCallback === "function") {
        const helpers = { chalk: picocolors, logger, files };
        //@ts-ignore alias
        metaData.answers = metaData.data;
        metaOpts.endCallback(metaData, helpers);
      } else {
        logger.success("init success");
      }
    });
}

//Metalsmith plugin
function askQuestions(questions: Array<Question>, config: CreationOption) {
  return (
    files: Metalsmith.Files,
    metalsmith: Metalsmith,
    done: Metalsmith.Callback
  ) => {
    var metadata: { data?: Answers } = metalsmith.metadata();

    new Promise((resolve) => {
      if (config.shouldAskQuestions) {
        inquirer.prompt(questions).then(resolve);
      } else if (!questions || !questions.length) {
        resolve({});
      } else {
        resolve(config.data);
      }
    }).then((data: any) => {
      metadata.data = { ...config.data, ...data };
      done(null, files, metalsmith);
    });
  };
}

//Metalsmith plugin
function renderTemplateFiles() {
  return (
    files: Metalsmith.Files,
    metalsmith: Metalsmith,
    done: Metalsmith.Callback
  ) => {
    const keys = Object.keys(files);
    const metaData: { data?: any } = metalsmith.metadata();

    const promises = keys.map((key) => {
      return new Promise((resolve, reject) => {
        const str = files[key].contents.toString();
        render(str, metaData.data, (err, res) => {
          if (err) {
            err.message = `[${key}] ${err.message}`;
            return reject(err);
          }
          files[key].contents = Buffer.from(res);
          resolve(true);
        });
      });
    });

    Promise.all(promises).then(() => done(null, files, metalsmith));
  };
}

function loadRepository(tpl: string, gitCloneCommand: string) {
  return new Promise((resolve, reject) => {
    const dest = tmp.dirSync().name;
    if (isGitUrl(tpl)) {
      const spinner = createSpinner("downloading template").start();
      downloadRepo(tpl, dest, gitCloneCommand);
      spinner.success();
      resolve(dest);
    } else if (fs.existsSync(tpl)) {
      copyTo(tpl, dest, () => {
        resolve(dest);
      });
    } else {
      reject(new Error("unknown template path"));
    }
  });
}

async function resolveOption(opts: CreationOption) {
  const questions: Array<Question | ListQuestion> = [
    {
      type: "input",
      message: "folder name",
      name: "projectName",
      validate: function (val: string) {
        const reg = /[a-zA-Z0-9\-_]+/;
        if (!val) {
          return "please input your project name";
        } else if (reg.test(val)) {
          return true;
        } else {
          return `input should be ${reg.toString}`;
        }
      },
    },
  ];
  const tplsMap = getTemplateRecords();

  if (!opts.templatePath) {
    const tplNames = Object.keys(tplsMap);

    if (!tplNames.length) {
      logger.warn(`
       can not found any template
       try to add template by run
       $ inix add`);
      return;
    }

    questions.unshift({
      type: "list",
      name: "template",
      message: "select template which you want",
      default: tplNames[0],
      choices: tplNames,
    });
  }

  const answers = await inquirer.prompt(questions);
  opts.data = answers;
  let tplInfo = tplsMap[answers.template];
  let templatePath;

  if (opts.templatePath) {
    templatePath = opts.templatePath;
  } else if (tplInfo) {
    templatePath = tplInfo.templatePath;
    if (isGitUrl(templatePath) && tplInfo.branch) {
      templatePath += `#${tplInfo.branch}`;
    }
  }
  opts.templatePath = templatePath;

  return opts;
}

export default async function (opts: CreationOption) {
  opts = await resolveOption(opts);

  if (!opts) return;

  opts.shouldAskQuestions = true;
  await createApp(opts);
}

export async function createApp(opts: CreationOption) {
  const projectTemplatePath = await loadRepository(
    opts.templatePath,
    opts.gitCloneCommand
  );
  Object.assign(opts, { projectTemplatePath });

  await initProject(opts);
}
