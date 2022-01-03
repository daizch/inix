import Table from "cli-table"
import { getTemplateRecords } from "../utils"

export default async function() {
  const records = Object.values(getTemplateRecords());
  if (records && records.length) {
    const table = new Table({
      head: Object.keys(records[0]),
      style: {
        head: ['green']
      },
      colAligns: ['middle', 'middle', 'middle']
    });

    Object.values(getTemplateRecords()).forEach(record => {
      table.push(Object.values(record));
    });
    console.log(table.toString());
  } else {
    console.log(
      "There is no template yet. Please add template by run: inix add"
    );
  }
};
