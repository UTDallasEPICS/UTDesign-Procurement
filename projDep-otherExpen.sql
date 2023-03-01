-- create database upm;

-- use upm;

create table projects_department(
    projectID INT,
    departmentID INT,
    PRIMARY KEY (projectID, derpartmentID)
    );

create table other_expenses(
expenseID INT,
projectID INT NOT NULL,
requestID INT NOT NULL,
expenseType char(20) NOT NULL,
expenseComments VARCHAR(500),
expsenseAmount decimal(7.2) NOT NULL,
expsenseDate DATE NOT NULL,
PRIMARY KEY (expenseID)
);