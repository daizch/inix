const path = require('path');
const fs = require('fs')
const tplPath = path.resolve(__dirname, './template.json');

module.exports.getTemplateRecords = function () {
  const tpls = require(tplPath);
  return tpls
}

module.exports.updateTemplateData = function (tplData) {
  fs.writeFileSync(tplPath, JSON.stringify(tplData, null, 2))
}