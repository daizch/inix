const path = require('path')
const fs = require('fs-extra')
const execSync = require('child_process').execSync
const home = require('user-home')
const tmp = require('tmp')
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


module.exports.downloadRepo = function(gitUrl, tmpDir) {
   // download(tpl, dest, { clone: true }, err => {
      //   if (err) {
      //     logger.fatal(`Failed to download repo ${tpl}: ` + err.message.trim())
      //     return reject(err)
      //   }
      //   resolve(dest)
      // })
  tmpDir = tmpDir || tmp.dirSync().name
  execSync(`git clone --quiet ${gitUrl} ${tmpDir}`, {env: process.env, cwd: process.cwd()})
  return tmpDir
}