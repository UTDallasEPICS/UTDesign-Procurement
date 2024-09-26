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
create table reimbursements(
	requestID INT AUTO_INCREMENT PRIMARY KEY,
    projectID INT NOT NULL,
    studentID INT,
    justification VARCHAR(500),
    additionalInfo VARCHAR(500),
    dateSubmitted DATE NOT NULL,
    status CHAR(20) NOT NULL
);

create table reimbursement_uploads(
	uploadID INT AUTO_INCREMENT PRIMARY KEY,
    attachmentPath VARCHAR(100),
    attachmentName VARCHAR(60)
);

create table reimbursement_items(
	itemID INT AUTO_INCREMENT PRIMARY KEY,
    requestID INT NOT NULL,
    vendorID INT NOT NULL,
    description VARCHAR(500) NOT NULL,
    receiptDate DATE NOT NULL,
    price DECIMAL(7,2) NOT NULL,
    uploadID INT
);

create table department(
	departmentID INT AUTO_INCREMENT PRIMARY KEY,
    department VARCHAR(100) NOT NULL
);

create table vendors(
	vendorID INT AUTO_INCREMENT PRIMARY KEY,
    vendorName VARCHAR(50) NOT NULL
);
create table items(
	itemID INT AUTO_INCREMENT PRIMARY KEY,
    requestID INT NOT NULL,
    description VARCHAR(500) NOT NULL,
    url VARCHAR(500) NOT NULL,
    partNumber VARCHAR(150),
    quantity INT NOT NULL,
    unitPrice DECIMAL(8,4),
    vendorID INT,
    uploadID INT
);
CREATE table requests(
 requestID INT AUTO_INCREMENT PRIMARY KEY,
 projectID INT NOT NULL,
 studentID INT,
 vendorID INT,
 dateNeeded DATE,
 justification VARCHAR(500),
 additionalInfo VARCHAR(500),
 dateSubmitted DATE,
 status CHAR(40),
 dateOrdered DATE,
 dateReceived DATE,
 dateApproved DATE
 
 );
 
 CREATE table requestUploads (
 uploadID INT AUTO_INCREMENT PRIMARY KEY,
 attachmentPath VARCHAR(60),
 attachmentName VARCHAR(100)
 
 );
 
 CREATE table orders(
 admin INT,
 orderID INT AUTO_INCREMENT PRIMARY KEY,
 requestID INT NOT NULL,
 dateOrdered DATE, 
 orderNumber VARCHAR(250),
 orderDetails VARCHAR(500),
 trackingInfo VARCHAR(500),
 shippingCost DECIMAL(7,2)
 
 );
CREATE table users(
userID int primary key,
netID char(20),
firstName Varchar(50) ,
lastName VARCHAR(20) ,
email VARCHAR(50) ,
password VARCHAR(50),
courseID int,
responsibilities VARCHAR(30),
active TINYINT(1),
roleID int,
deactivationDate DATE
);
select *
from users;


CREATE table projects(
projectID INT,
projectType VARCHAR(8),
projectNum INT,
projectTitle VARCHAR(500),
startingBudget DECIMAL(7,2),
sponsorCompany VARCHAR(50),
additionalInfo VARCHAR(500),
activationDate DATE,
deactivationDate DATE,
costCenter INT
);
CREATE table users(
userID int primary key,
netID char(20),
firstName Varchar(50) ,
lastName VARCHAR(20) ,
email VARCHAR(50) ,
password VARCHAR(50),
courseID int,
responsibilities VARCHAR(30),
active TINYINT(1),
roleID int,
deactivationDate DATE
);


CREATE table projects(
projectID INT primary key,
projectType VARCHAR(8),
projectNum INT,
projectTitle VARCHAR(500),
startingBudget DECIMAL(7,2),
sponsorCompany VARCHAR(50),
additionalInfo VARCHAR(500),
activationDate DATE,
deactivationDate DATE,
costCenter INT
);

CREATE table courses(
courseID INT primary key,
courseName CHAR(9),
department CHAR(4),
projectType CHAR(1)
);

CREATE table role(
roleID INT primary key,
role VARCHAR(40)
);
