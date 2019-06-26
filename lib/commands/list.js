const { getTemplateRecords } = require('../utils');

module.exports = async function () {
  console.table(Object.values(getTemplateRecords()))
};