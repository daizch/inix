const chalk = require('chalk')
const fs = require('fs')
const Metalsmith = require('metalsmith')
const download = require('download-git-repo')
const inquirer = require('inquirer')
const ora = require('ora')
const { render } = require('consolidate').handlebars
const path = require('path')
const logger = require('../logger')
const cosmiconfig = require('cosmiconfig')
const { getTemplateRecords, downloadRepo } = require('../utils');
const tmp = require('tmp')
const isGitUrl = require('is-git-url')

function getOptions(tplPath) {
  const moduleName = 'meta'
  const explorer = cosmiconfig('meta-config', {
    searchPlaces: [
      // 'package.json',
      `.${moduleName}rc`,
      `.${moduleName}.json`,
      `.${moduleName}.yaml`,
      `.${moduleName}.yml`,
      `.${moduleName}.js`,
      `${moduleName}.js`
    ]
  })
  return explorer.searchSync(tplPath) || {}
}

function copyTo(src, dest, done) {
  var metalsmith = Metalsmith(src)
  metalsmith.clean(false)
    .source('.')
    .destination(dest)
    .build((err) => {
      if (err) throw err;
      done()
    })
}

function initProject(config) {
  const metaOpts = getOptions(config.tplPath)
  runMetalsmith(config, metaOpts.config || {})
}

function runMetalsmith(config,  metaOpts) {
  const metalsmith = Metalsmith(path.join(config.tplPath, 'template'))
  const metaData = metalsmith.metadata()

  const questions = metaOpts && metaOpts.questions
  //resolve the output destination path
  Object.assign(metaData, {
    destPath: config.destPath ? config.destPath : path.join(process.cwd(), config.answers.projectName || '')
  })

  metalsmith.use(askQuestions(questions))
    .use(resolveMetaData(config))
    .use(renderTemplateFiles(config))

  metalsmith.clean(false)
    .source('.')
    .destination(metaData.destPath)
    .build((err, files) => {
      if (err) throw err

      if (typeof metaOpts.endCallback === 'function') {
        const helpers = { chalk, logger, files }
        metaOpts.endCallback(metaData, helpers)
      } else {
        logger.success('init success')
      }
    })
}

function resolveMetaData(config) {
  return (files, metalsmith, done) => {
    var metaData = metalsmith.metadata()
    
     Object.assign(metaData.answers, config.answers)
    
    done()
  }
}

//Metalsmith plugin
function askQuestions(questions) {
  return (files, metalsmith, done) => {
    
    var metadata = metalsmith.metadata()

    if (!questions || !questions.length) {
      metadata.answers = {}
      return done()
    }

    inquirer.prompt(questions).then((answers) => {
      metadata.answers = answers
      done()
    })
  }
}

//Metalsmith plugin
function renderTemplateFiles() {
  return async (files, metalsmith, done) => {
    const keys = Object.keys(files)
    const metaData = metalsmith.metadata()

    for(const key of keys) {
      const str = files[key].contents.toString()
      //not find any template varible, just skip it
      if (!/{{([^{}]+)}}/g.test(str)) {
        continue;
      }

      try {
        const renderedContent = await render(str, metaData.answers);
        files[key].contents = Buffer.from(renderedContent)

      } catch (error) {
        error.message = `[${key}] ${error.message}`;
        throw error;
      }
    }

    done();
  }
}

function loadRepository(tpl) {
  return new Promise((resolve, reject) => {
    const dest = tmp.dirSync().name
    if (isGitUrl(tpl)) {
      const spinner = ora('downloading template')
      spinner.start()
      downloadRepo(tpl, dest)
      spinner.stop() 
      resolve(dest)
    } else if (fs.existsSync(tpl)) {
      copyTo(tpl, dest, () => {
        resolve(dest)
      })
    } else {
      reject(new Error('unknown template path'))
    }
  })
}


async function resolveOption(opts) {
  opts = opts || {}
  const questions = [
    {
      type: 'input',
      name: 'projectName',
      validate: function (val) {
        const reg = /[a-zA-Z0-9\-_]+/
        if (!val) {
          return 'please input your project name'
        } else if (reg.test(val)) {
          return true
        } else {
          return `input should be ${reg.toString}`
        }
      }
    }
  ]
  const tplsMap = getTemplateRecords()

  if (!opts.templatePath) {
    const tplNames = Object.keys(tplsMap)

    if (!tplNames.length) {
       logger.warn(`
       can not found any template
       try to add template by run
       $ inix add`)
       return
    }

    questions.unshift({
      type: 'list',
      name: 'template',
      message: 'select template which you want',
      'default': tplNames[0],
      choices: tplNames
    })
  }

  const answers = await inquirer.prompt(questions)
  opts.answers = answers
  let tplInfo = tplsMap[answers.template]
  let templatePath

  if (opts.templatePath) {
    templatePath = opts.templatePath
  } else if (tplInfo) {
    templatePath = tplInfo.templatePath
    if (isGitUrl(templatePath) && tplInfo.branch) {
      templatePath += `#${tplInfo.branch}`
    }
  }
  opts.templatePath = templatePath
  
  return opts
}

module.exports = async function (opts) {
  opts = await resolveOption(opts)

  if (!opts) return

  const tplPath = await loadRepository(opts.templatePath)
  Object.assign(opts, { tplPath })

  initProject(opts)
}