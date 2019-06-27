const fs = require('fs-extra');
const path = require('path')
const execSync = require('child_process').execSync
const { updateTemplateData } = require('../utils');
const isGitUrl = require('is-git-url')
const isValidPath = require('is-valid-path')
const downloadGitRepo = require('download-git-repo')
const isLocalPath = require('is-local-path')
const wget = require('node-wget')
const tmp = require('tmp')
const inquirer = require('inquirer')
const logger = require('../logger')

function save(file) {
  try {
    let config = fs.readJsonSync(file)
    inquirer.prompt([{
      type: 'confirm',
      name: 'yes',
      message: 'Are you sure to overwrite your template config'
    }]).then(({ yes }) => {
      if (yes) {
        updateTemplateData(config)
      }
    })
  } catch (err) {
    throw new Error(err)
  }
}

module.exports = async function (tplConfigPath) {
  if (!isValidPath(tplConfigPath)) {
    throw new Error('invalid config path')
  } else if (isLocalPath(tplConfigPath)) {
    tplConfigPath = path.resolve(tplConfigPath)
    if (!fs.existsSync(tplConfigPath)) {
      throw new Error('un-found config file')
    }

    save(tplConfigPath)
  } else if (isGitUrl(tplConfigPath)) {
    let tmpDir = tmp.dirSync().name

    execSync(`git clone --quiet ${tplConfigPath} ${tmpDir}`)
    let configFilePath = path.join(tmpDir, 'template.json')
    if (fs.existsSync(configFilePath)) {
      save(configFilePath)
    } else {
      logger.error(`failed to find ${configFilePath}, please make sure it exists`)
    }

    //todo encountered Error: 'git clone' failed with status 128
    // downloadGitRepo(tplConfigPath, tmpDir, { clone: true }, function(err){
    //   if (err) {
    //     logger.fatal(`Failed to download repo ${tplConfigPath}: ` + err.message.trim())
    //     return 
    //   }
    //   let configFilePath = path.join(tmpDir, 'template.json')
    //   if (fs.existsSync(configFilePath)) {
    //     save(configFilePath)
    //   } else {
    //     logger.error(`failed to find ${configFilePath}, please make sure it exists`)
    //   }
    // })

  } else {
    let tmpFile = tmp.fileSync().name
    wget({ url: tplConfigPath, dest: tmpFile }, function (error) {
      if (error) {
        throw new Error(error)
      }

      save(tmpFile)
    })
  }
};