const mysql = require('mysql');
const fs = require("fs");

class SQL {
    constructor () {
        this.parameters = {};
        this.parameters.host = 'localhost';
        this.parameters.user = "root";
        this.parameters.port = 3306;
        this.parameters.password = '6198HawkS6198!';
        this.parameters.database = 'employeesDB';
        this.parameters.insecureAuth = true;
        this.parameters.multipleStatements= true;

        this.employees = {};
        this.roles = {};
        this.departments = {};
        this.managers = {};

        // function to get all employees
        this.employees.all = () => {
            return this.sqlConnect(this.getEmployees());
        }

        // function to get all employees to manipulate
        this.employees.data = () => {
            const viewEmployeeData = [
                "SELECT employee.id, first_name, nickname, last_name, role_id, manager_id, title",
                "FROM employeesDB.employee",
                "LEFT JOIN employeesDB.role ON employee.role_id = role.id",
                "ORDER BY employee.id ASC;"].join(" ");
            return this.sqlConnect(viewEmployeeData);
        }

        // function to get employees grouped by a role type
        this.employees.roleSpecific = (role) => {
            const viewRoleSpecific = {"where": "WHERE role.id = ?", "from": "FROM employeesDB.employee"};
            return this.sqlConnect(this.getEmployees(viewRoleSpecific), [role]);
        }

        // function to get employees grouped by a department
        this.employees.departmentSpecific = (department) => {
            const viewDepartmentSpecific = {"where": "WHERE department.id = ?", "from": "FROM employeesDB.employee"};
            return this.sqlConnect(this.getEmployees(viewDepartmentSpecific), [department]);
        }
        
        // function to insert a new employee
        this.employees.insert = (employeeObj) => {
            const employeeArray = [
                employeeObj.firstName,
                employeeObj.nickName,
                employeeObj.lastName,
                employeeObj.roleId,
                employeeObj.managerId
            ];
            const addEmployee = "INSERT INTO employeesDB.employee (first_name, nickname, last_name, role_id, manager_id) VALUES (?, ?, ?, ?, ?);";
            return this.sqlConnect(addEmployee, employeeArray);
        }

        // function to insert a new employee
        this.employees.update = (employeeObj) => {
            const employeeArray = [
                employeeObj.firstName,
                employeeObj.nickName,
                employeeObj.lastName,
                employeeObj.roleId,
                employeeObj.managerId,
                employeeObj.id
            ];
            console.log(employeeObj.id);
            const updateEmployee = [
                "UPDATE employeesDB.employee",
                "SET first_name = ?, nickname = ?, last_name = ?, role_id = ?, manager_id = ?",
                "WHERE id = ?;"].join(" ");
            return this.sqlConnect(updateEmployee, employeeArray); 
        }

        // function to view all managers
        this.managers.all = () => {
            const viewManagers = {"where": "", "from": [
                "FROM (SELECT DISTINCT employee.manager_id",
                "FROM employeesDB.employee",
                "WHERE manager_id IS NOT NULL) AS manager_list",
                "LEFT JOIN employeesDB.employee ON employee.id = manager_list.manager_id"].join(" ")};
            return this.sqlConnect(this.getEmployees(viewManagers));
        }

        // function to view all roles
        this.roles.all = () => {
            const viewRoles = [
                "SELECT title AS 'Job Title', CONCAT('$', FORMAT(salary, 2)) AS 'Salary', department_name AS 'Department Name'",
                "FROM employeesDB.role",
                "LEFT JOIN employeesDB.department ON role.department_id = department.id",
                "ORDER BY department_name;"].join(" ");
            return this.sqlConnect(viewRoles);
        }

        // function to get role data to manipulate
        this.roles.data = () => {
            const viewRoleData = [
                "SELECT title, role.id as id, department_name, department_id, salary",
                "FROM employeesDB.role",
                "LEFT JOIN employeesDB.department ON role.department_id = department.id",
                "ORDER BY department_name;"].join(" ");
            return this.sqlConnect(viewRoleData);
        }

        // function to get department specific roles
        this.roles.departmentSpecific = (departmentId) => {
            const viewRoleSpecific = [
                "SELECT title as Title, department_name as Department",
                "FROM employeesDB.role",
                "LEFT JOIN employeesDB.department ON role.department_id = department.id",
                "WHERE department_id = ?",
                "ORDER BY departmentname;"].join(" ");
            return this.sqlConnect(viewRoleSpecific, [departmentId]);
        }

        // function to insert a new role
        this.roles.insert = (roleObj) => {
            const roleArray = [
                roleObj.title,
                roleObj.salary,
                roleObj.departmentId
            ];

            const insertRole = "INSERT INTO employeesDB.role (title, salary, department_id) VALUES (?, ?, ?);";
            return this.sqlConnect(insertRole, roleArray);
        }

        // function to update an existing role
        this.roles.update = (roleObj) => {
            const roleArray = [
                roleObj.title,
                roleObj.salary,
                roleObj.departmentId,
                roleObj.id
            ];
            
            const updateRole = [
                "UPDATE employeesDB.role",
                "SET title = ?, salary = ?, department_id = ?",
                "WHERE id = ?;"].join(" ");
            return this.sqlConnect(updateRole, roleArray);
        }

        // function to get all the departments for printing to table
        this.departments.all = () => {
            const viewDepartments = [
                "SELECT department_name AS 'Department Name'",
                "FROM employeesDB.department",
                "ORDER BY department_name;"].join(" ");
            return this.sqlConnect(viewDepartments);
        }

        // function to get all department data to manipulate
        this.departments.data = () => {
            const viewDepartments = [
                "SELECT department_name, id",
                "FROM employeesDB.department",
                "ORDER BY department_name;"].join(" ");
            return this.sqlConnect(viewDepartments);
        }

        // function to insert a new department
        this.departments.insert = (departmentObj) => {
            const departmentArray = [
                departmentObj.departmentName
            ];

            const insertDepartment = "INSERT INTO employeesDB.department (department_name) VALUES (?);";
            return this.sqlConnect(insertDepartment, departmentArray);
        }

        // function to update an existing department
        this.departments.update = (departmentObj) => {
            const departmentArray = [
                departmentObj.departmentName,
                departmentObj.id
            ];
 
            const updateDepartment = [
                "UPDATE employeesDB.department",
                "SET department_name = ?",
                "WHERE id = ?;"].join(" ");
            return this.sqlConnect(updateDepartment, departmentArray);
        }
    }

    // function to open the database
    dbOpen = (db) => {
        return new Promise((resolve, reject) => {
            db.connect((err) => {
                if (err) {
                    reject(err);
                }
                resolve(true);
            });
        });
    };

    // function to make a database query
    dbQuery = (db, sqlString, parameters = []) => {
        return new Promise((resolve, reject) => {
            try {
                db.query(sqlString, parameters, (err, results, fields) => {
                if (err) {
                    reject(err);
                }
                resolve(results);
            })}
            catch (err) {
                reject(err);
            }
        });
    }

    // function to close the database
    dbClose = (db) => {
        return new Promise((resolve, reject) => {
            db.end((err) => {
                if (err) {
                    reject(err);
                }
                resolve(true);
            });
        });
    }

    // function to connect and query to server
    sqlConnect = async(sqlString, parameters = []) => {
        const db = mysql.createConnection({
            host: this.parameters.host,
            user: this.parameters.user,
            port: this.parameters.port,
            password: this.parameters.password,
            database: this.parameters.database,
            insecureAuth: this.parameters.insecureAuth,
            multipleStatements: this.parameters.multipleStatements
        });

        try {
            await this.dbOpen(db);
            const response = await this.dbQuery(db, sqlString, parameters)
//            console.log(`running on port ${ this.parameters.port }`);
            await this.dbClose(db);
            return response;
        } catch(err) {
            return console.log(err);
        }
    }

    // function to get the seet file
    getSeedFile = () => {
        return new Promise((resolve, reject) => {
            try {
                resolve(fs.readFileSync("./Assets/seed.sql", "utf8"))
            } catch (error) {
                reject(error);
            }
        });
    };

    // function to reset the databsae from the seed.sql file
    dbReset = () => {
        return new Promise(async (resolve, reject) => {
            const sqlTemplate = await this.getSeedFile();
            try {
                resolve(await this.sqlConnect(sqlTemplate));
            } catch (error) {
                reject(error);
            }
        });
    };

    // function to ensure proper database structure
    dbCheck = () => {
        return new Promise(async (resolve, reject) => {
            const dbQuery = [
                "SELECT SCHEMA_NAME",
                "FROM INFORMATION_SCHEMA.SCHEMATA",
                "WHERE SCHEMA_NAME = 'employeesDB'"].join(" ");
            let response = await this.sqlConnect(dbQuery);

            if (response.length == 0) {
                console.log("Database 'employeesDB' was not found, uploading seed file");
                resolve(this.dbReset());
            } else {
                const dbTablesQuery = [
                    "SELECT *",
                    "FROM INFORMATION_SCHEMA.TABLES",
                    "WHERE TABLE_SCHEMA = 'employeesDB'",
                    "AND (TABLE_NAME = 'employee' OR TABLE_NAME = 'department' OR TABLE_NAME = 'role')"].join(" ");
                response = await this.sqlConnect(dbTablesQuery);

                if (response.length != 3) {
                    console.log("The correct tables were not found in 'employeesDB', uploading seed file");
                    resolve(this.dbReset());
                }
            }
            resolve(true);
        });
    }

    // function to get all employees
    getEmployees = (clauses = {"where": "", "from": "FROM employeesDB.employee"}) => {
        return [
            "SELECT employee.id AS 'Employee ID', COALESCE(CONCAT(employee.first_name, ' (', employee.nickname, ')'), employee.first_name) AS 'First Name', employee.last_name AS 'Last Name', role.title AS 'Title', department.department_name AS Department, CONCAT('$ ', FORMAT(role.salary, 2)) AS Salary, CONCAT(COALESCE(CONCAT(manager.first_name, ' (', manager.nickname, ')'), manager.first_name), ' ', manager.last_name) AS 'Manager'",
            `${ clauses.from }`,
            "LEFT JOIN employeesDB.employee AS manager ON employee.manager_id = manager.id",
            "LEFT JOIN employeesDB.role ON employee.role_id = role.id",
            "LEFT JOIN employeesDB.department ON department.id = role.department_id",
            `${ clauses.where }`,
            "ORDER BY employee.id ASC;"
        ].join(" ");
    }
}

module.exports = SQL;