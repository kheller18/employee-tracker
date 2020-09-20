const path = require("path");
const cTable = require("console.table");
const inquirer = require("inquirer");
const SQL = require("./Assets/main")

// default menu that user is presented with
const menu = (userChoice) => {
  return [{
      type: "list",
      name: "userOptions",
      message: "Select an option",
      choices: [
        'View Employees', 
        'View Departments', 
        'View Roles',
        'View Managers', 
        'Add Employees', 
        'Update Employee Name',
        'Update Employee Role',
        'Update Administration Information',
        'Exit\n'
      ],
      default: userChoice
  }];
}

// menu to update the roles and departments tables
const administrationMenu = (userChoice) => {
  return [{
    type: "list",
    name: "userOptions",
    message: "Select an option",
    choices: [
      'Add Role',
      'Update Role Title and Salary',
      'Update Role Department',
      'Add Department',
      'Update Department Name',
      'Previous Menu'
    ],
    default: userChoice
  }];
}

// function to add an employee when the user selects from the menu
const addEmployee = async(firstName = "", nickName = "", lastName = "") => {
  const addEmployeeQuestions = [{
    type: "input",
    name: "firstName",
    message: "Enter the first name of the employee:",
    default: firstName,
    validate: (name) => name != ""
  },{
    type: "input",
    name: "nickName",
    message: "Enter the nickname of the employee (can leave blank):",
    default: nickName
  },{
    type: "input",
    name: "lastName",
    message: "Enter the last name of the employee:",
    default: lastName,
    validate: (name) => name != ""
  }];
  try {
    return await inquirer.prompt(addEmployeeQuestions);
  } catch(err) {
    console.log(err);
  }
}

// function present and choose existing employees
const chooseExistingEmployee = async(employees) => {
  const employeesArray = [];
  employees.forEach(employee => employeesArray.push({
    name: `${ employee.first_name } ${ employee.last_name } (${ employee.title })`,
    id: employee.id,
    firstName: employee.first_name,
    nickName: employee.nickname,
    lastName: employee.last_name,
    roleId: employee.role_id,
    managerId: employee.manager_id
  }));
  const selectEmployee = [{
    type: "list",
    name: "employeeName",
    message: "Choose an employee:",
    choices: employeesArray.map(employee => employee.name)
  }];
  try {
    const employeeObj = await inquirer.prompt(selectEmployee);
    return employeesArray.filter(employee => employee.name == employeeObj.employeeName)[0];
  } catch(err) {
    console.log(err);
  }
}

// function to prompt the user with questions and add a role
const addRole = async(title = "", salary = "") => {
  const addRoleQuestions = [{
    type: "input",
    name: "title",
    message: "Enter the title of the new role:",
    validate: (name) => name != ""
  },{
    type: "input",
    name: "salary",
    message: "Enter the salary of the role:",
    validate: (name) => name != ""
  }];
  try {
    return await inquirer.prompt(addRoleQuestions);
  } catch(err) {
    console.log(err);
  }
}

// function to choose an existing role
const chooseExistingRole = async(roles) => {
  const roleArray = [];
  roles.forEach(role => roleArray.push({name: `${role.title} (${role.department_name})`, id: role.id, title: role.title, salary: role.salary, departmentId: role.department_id}));
  const selectRole = [{
    type: "list",
    name: "roleName",
    message: "Select a role:",
    choices: roleArray.map(role => role.name)
  }];
  try {
    const roleObj = await inquirer.prompt(selectRole);
    return roleArray.filter(role => role.name == roleObj.roleName)[0];
  } catch(err) {
    console.log(err);
  }
}

// function to add a new department
const addDepartment = async(departmentName = "") => {
  const addDepartmentQuestions = [{
    type: "input",
    name: "departmentName",
    message: "Enter the name of the new department:",
    validate: (name) => name != ""
  }];
  try {
    return await inquirer.prompt(addDepartmentQuestions);
  } catch(err) {
    console.log(err);
  }
}

// function to choose an existing department
const chooseExistingDepartment = async(departments) => {
  const departmentArray = [];
  departments.forEach(department => departmentArray.push({name: department.department_name, id: department.id}));
  const selectDepartment = [{
    type: "list",
    name: "department",
    message: "Select a department:",
    choices: departmentArray.map(department => department.name)
  }];
  try {
    const departmentObj = await inquirer.prompt(selectDepartment);
    return departmentArray.filter(department => department.name == departmentObj.department)[0];
  } catch(err) {
    console.log(err);
  }
}

// function to choose an existing manager
const chooseExistingManager = async(managers) => {
  const managerArray = [];
  managers.forEach(manager => managerArray.push({name: `${ manager["First Name"] } ${manager["Last Name"]} (${ manager.Department})`, id: manager["Employee ID"]}));
  const selectManager = [{
    type: "list",
    name: "managerName",
    message: "Select a manager:",
    choices: managerArray.map(manager => manager.name)
  }];
  try {
    const managerObj = await inquirer.prompt(selectManager);
    return managerArray.filter(manager => manager.name == managerObj.managerName)[0];
  } catch(err) {
    console.log(err);
  }
}

// function that runs the application
const init = async () => {
  const sqlObj = new SQL();

  try {
    await sqlObj.dbCheck();
  } catch(err) {
    return console.log(err);
  }

  let engine = true;
  let userChoice = "View Employees"

  while (engine) {
    try {
      const response = await inquirer.prompt(menu(userChoice));
      let employees;
      let roles;
      let managers;
      let employee;
      let role;
      let manager;
      let employeeObj;

      userChoice = response.userOptions;
      console.log("\n");

      switch(userChoice) {
        case "View Employees":
          console.log("\n");
          console.table(await sqlObj.employees.all());
          break;
        
        case "View Departments":
          console.log("\n");
          console.table(await sqlObj.departments.all());
          break;

        case "View Roles":
          console.log("\n");
          console.table(await sqlObj.roles.all());
          break;

        case "View Managers":
          console.log("\n");
          console.table(await sqlObj.managers.all());
          break;
  
        case "Add Employees":
          managers = await sqlObj.managers.all();
          roles = await sqlObj.roles.data();
          employee = await addEmployee();
          role = await chooseExistingRole(roles);
          manager = await chooseExistingManager(managers);
          employee.roleId = role.id;
          employee.managerId = manager.id;
          await sqlObj.employees.insert(employee);
          console.log("\n");
          console.table(await sqlObj.employees.all());
          console.log(`${employee.firstName} ${employee.lastName} has been added to the system.\n`);
          break;
        
        case "Update Employee Name":
          employees = await sqlObj.employees.data();
          employee = await chooseExistingEmployee(employees);
          const updatedName = await addEmployee(employee.firstName, employee.nickName, employee.lastName);
          employeeObj = {
            id: employee.id,
            firstName: updatedName.firstName,
            nickName: updatedName.nickName,
            lastName: updatedName.lastName,
            roleId: employee.roleId,
            managerId: employee.managerId
          };
          await sqlObj.employees.update(employeeObj);
          console.log("\n");
          console.table(await sqlObj.employees.all());
          console.log(`${employee.name} has been updated in the system to ${updatedName.firstName} ${updatedName.lastName}.\n`);
          break;

        case "Update Employee Role":
          employees = await sqlObj.employees.data();
          roles = await sqlObj.roles.data();
          employee = await chooseExistingEmployee(employees);
          const updatedRole = await chooseExistingRole(roles);
          employeeObj = {
              id: employee.id,
              firstName: employee.firstName,
              nickName: employee.nickName,
              lastName: employee.lastName,
              roleId: updatedRole.id,
              managerId: employee.managerId
          };
          await sqlObj.employees.update(employeeObj);
          console.log("\n");
          console.table(await sqlObj.employees.all());
          console.log(`${employee.name} has been updated in the system with role ${updatedRole.name}.\n`);
          break;

        case "Update Administration Information":
          await adminMenu(sqlObj);
          break;

        case "Exit\n":
        default:
          engine = false;
          console.log("\nYou have exited the program.\n");
          break;
      }
     
    } catch(err) {
      console.log(err);
    }
  }
}

const adminMenu = async(sqlObj) => {
  let engine = true;
  let userChoice = "Add Role";

  while (engine) {
    try {
      const response = await inquirer.prompt(administrationMenu(userChoice));
      let roles;
      let departments;
      let role;
      let department;
      let roleObj;
      let departmentObj;
      let newDepartment;

      userChoice = response.userOptions;

      switch(userChoice) {
        case "Add Role":
          departments = await sqlObj.departments.data();
          role = await addRole();
          department = await chooseExistingDepartment(departments)
          role.departmentId = department.id;
          await sqlObj.roles.insert(role);
          console.log("\n");
          console.table(await sqlObj.roles.all());
          break;
        
        case "Update Role Title and Salary":
          roles = await sqlObj.roles.data();
          role = await chooseExistingRole(roles);
          const updateRole = await addRole(role.title, role.salary);
          roleObj = {
            id: role.id,
            title: updateRole.title,
            salary: updateRole.salary,
            departmentId: role.departmentId
          }
          await sqlObj.roles.update(roleObj);
          console.log("\n");
          console.table(await sqlObj.roles.all());
          break;
        
        case "Update Role Department":
          roles = await sqlObj.roles.data();
          departments = await sqlObj.departments.data();
          role = await chooseExistingRole(roles);
          newDepartment = await chooseExistingDepartment(departments);
          roleObj = {
            id: role.id,
            title: role.title,
            salary: role.salary,
            departmentId: newDepartment.id
          }
          await sqlObj.roles.update(roleObj);
          console.log("\n");
          console.table(await sqlObj.roles.all());
          break;

        case "Add Department":
          department = await addDepartment();
          await sqlObj.departments.insert(department);
          console.log("\n");
          console.table(await sqlObj.departments.all());
          break;

        case "Update Department Name": 
          departments = await sqlObj.departments.data();
          department = await chooseExistingDepartment(departments);
          newDepartment = await addDepartment(department.departmentName);
          departmentObj = {
            id: department.id,
            departmentName: newDepartment.departmentName
          }
          await sqlObj.departments.update(departmentObj);
          console.log("\n");
          console.table(await sqlObj.departments.all());
          break;
          
        case "Return to Previous Menu":
        default:
          engine = false;
          break;
      }
    } catch(err) {
      console.log(err)
    }
  }
}

// kicks off the application
init();