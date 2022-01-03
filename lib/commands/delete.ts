import { getTemplateRecords, updateTemplateData } from "../utils";
import { prompt } from "inquirer";

export default async function () {
  const tplsMap = getTemplateRecords();
  const questions = [
    {
      type: "list",
      name: "name",
      message: "which template do you want to delete",
      choices: Object.keys(tplsMap),
      validate: function (val: string | boolean) {
        if (!val) {
          return "template name can't be empty";
        } else {
          return true;
        }
      },
    },
  ];
  const data = await prompt(questions);
  delete tplsMap[data.name];
  updateTemplateData(tplsMap);
}
