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
        // this.parameters.insecureAuth = true;
        this.parameters.multipleStatements= true;

        this.employees = {};
        this.roles = {};
        this.departments = {};
        this.managers = {};

       
        this.employees.all = () => {
            return this.sqlConnect(this.getEmployees());
        }
    }

    dbOpen = (db) => {
        return new Promise((resolve, reject) => {
            db.connect((err) => {
                if (err) {
                    reject(err);
                }
                resolve(true);
            });
        });
    }

    dbQuery = (db, sqlString, parameters = []) => {
        return new Promise((resolve, reject) {
            try {db.query(sqlString, parameters, (err, results, fields) {
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

    sqlConnect = async(sqlString, parameters = []) => {
        const db = mysql.createConnection({
            host: this.parameters.host,
            user: this.parameters.user,
            port: this.parameters.port,
            password: this.parameters.password,
            database: this.parameters.database,
            // insecureAuth: this.parameters.insecureAuth,
            multipleStatements: this.parameters.multipleStatements
        });

        try {
            console.log(db);
            await this.dbOpen(db);
            const response = await this.sqlConnect(db, sqlString, parameters)
            console.log(`running on port ${ this.parameters.port }`);
            await this.dbClose(db);
            return response;
        } catch(err) {
            return console.log(err);
        }
    }


}

module.exports = SQL;