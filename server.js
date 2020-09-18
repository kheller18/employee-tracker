const path = require("path");
const cTable = require("console.table");
const inquirer = require("inquirer");
const SQL = require("./Assets/main")

const menu = (userChoice) => {
  return [{
      type: "list",
      name: "userOptions",
      message: "Select an option",
      choices: [
        'View Employees', 
        'View Departments', 
        'View Roles', 
        'Add Employees', 
        'Add Departments', 
        'Add Roles', 
        'Update Employee Roles'
      ]
  }]
}

const init = async () => {
  
  const sqlObj = new SQL();

  try {
    await sqlObj.sqlConnect();
  } catch(err) {
      return console.log(err);
  }

  let engine = true;
  let userChoice = "View Employees"

  while (engine) {
    try {
      const response = await inquirer.prompt(menu(userChoice));
      engine = false;
    } catch(err) {
      console.log(err);
    }
  }
}

init();