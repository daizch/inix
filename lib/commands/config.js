const fs = require('fs-extra');
const path = require('path')
const { updateTemplateData } = require('../utils');
const isGitUrl = require('is-git-url')
const isValidPath = require('is-valid-path')
const isLocalPath = require('is-local-path')
const wget = require('node-wget')
const tmp = require('tmp')
const inquirer = require('inquirer')

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