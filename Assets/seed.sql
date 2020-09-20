ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY '6198HawkS6198!';
flush privileges;

DROP DATABASE IF EXISTS employeesDB;
CREATE DATABASE employeesDB;
USE employeesDB;

CREATE TABLE department (
    id INT AUTO_INCREMENT,
    department_name VARCHAR(30),
    PRIMARY KEY (id)
);

INSERT INTO department (id, department_name) VALUE
(1, "Sales"),
(2, "Engineering"),
(3, "Finance"),
(4, "Legal"),
(5, "Customer Service"),
(6, "Human Resources"),
(7, "Purchasing"),
(8, "Marketing"),
(9, "Operations"),
(10, "Quality"),
(11, "Executive");

CREATE TABLE role (
    id INT AUTO_INCREMENT,
    title VARCHAR(30),
    salary DECIMAL,
    department_id INT,
    PRIMARY KEY (id),
    FOREIGN KEY (department_id) REFERENCES department(id)
);

INSERT INTO role (id, title, salary, department_id) VALUE
(1, "Sales Lead", 100000, 1),
(2, "Salesperson", 55000, 1),
(3, "Sales Manager", 130000, 1),
(4, "Engineer", 100000, 2),
(5, "Software Engineer", 120000, 2),
(6, "Engineer Manager", 165000, 2),
(7, "Bookeeper", 60000, 3),
(8, "Lawyer", 200000, 4),
(9, "Account Manager", 120000, 5),
(10, "Human Resources Manager", 104000, 6),
(11, "Buyer", 92000, 7),
(12, "Social Media Manager", 130000, 8),
(13, "Marketing Manager", 95000, 8),
(14, "Operations Supervisor", 77000, 9),
(15, "Quality Control Supervisor", 42000, 10),
(16, "Owner", 500000, 11);

CREATE TABLE employee (
    id INT AUTO_INCREMENT,
    first_name VARCHAR(30),
    last_name VARCHAR(30),
    nickname VARCHAR(30),
    role_id INT,
    manager_id INT,
    PRIMARY KEY (id),
    FOREIGN KEY (role_id) REFERENCES role(id),
	CONSTRAINT employee_fk_1 FOREIGN KEY (manager_id) REFERENCES employee(id)
);

INSERT INTO employee (id, first_name, nickname, last_name, role_id, manager_id) VALUES
(1, "Keenan", "Kman", "Heller", 16, NULL),
(2, "Mac", "Rohn", "Wiper", 12, 1),
(3, "Connor", "Hyppa", "Hyppa", 13, 1);
