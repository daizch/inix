const path = require('path');
const fs = require('fs-extra')
const home = require('user-home')
const tplPath = path.join(home, '.inix' ,'template.json');
fs.ensureFileSync(tplPath)

module.exports.getTemplateRecords = function () {
  try {
    const tpls = fs.readJsonSync(tplPath)
    return tpls
  } catch(e) {
    return {}
  }
}

module.exports.updateTemplateData = function (tplData) {
  if (typeof tplData === 'object') {
    tplData = JSON.stringify(tplData, null, 2)
  }
  fs.writeFileSync(tplPath, tplData)
}