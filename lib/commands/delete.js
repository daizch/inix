const fs = require('fs');
const { getTemplateRecords, updateTemplateData } = require('../utils');
const { prompt } = require('inquirer');

module.exports = async function () {
  const tplsMap = getTemplateRecords()
  const questions = [
    {
      type: 'list',
      name: 'name',
      message: 'which template do you want to delete',
      choices: Object.keys(tplsMap),
      validate: function (val) {
        if (!val) {
          return "template name can't be empty"
        } else {
          return true;
        }
      }
    }
  ];
  const data = await prompt(questions)
  delete tplsMap[data.name]
  updateTemplateData(tplsMap)
};