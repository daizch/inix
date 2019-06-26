const fs = require('fs');
const { getTemplateRecords, updateTemplateData } = require('../utils');
const { prompt } = require('inquirer');
const isGitUrl = require('is-git-url')
const isValidPath = require('is-valid-path')

const questions = [
  {
    type: 'input',
    name: 'name',
    message: 'template name',
    validate: function (val) {
      if (!val) {
        return "template name can't be empty"
      } else {
        return true;
      }
    }
  },
  {
    type: 'input',
    name: 'description',
    message: 'template description'
  },
  {
    type: 'input',
    name: 'templatePath',
    message: 'template address/path',
    validate: function (val) {
      if (!val) {
        return "template path can't be empty"
      } else if (isValidPath(val)){
        return true;
      } else {
        return 'invalid path/git address'
      }
    }
  },
  {
    type: 'input',
    name: 'branch',
    message: 'git branch name',
    when: function (answers) {
      return isGitUrl(answers.templatePath)
    }
  },
];

module.exports = async function () {
  const tpls = getTemplateRecords()
  const data = await prompt(questions)
  const tplInfo = Object.assign({}, data)
  
  if (isGitUrl(tplInfo.templatePath) && !tplInfo.branch) {
    tplInfo.branch = 'master'
  }
  data.templatePath = data.templatePath.trim()
  tpls[data.name] = tplInfo
  updateTemplateData(tpls)
};