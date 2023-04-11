create database procurement;
use procurement;
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

select *
from projects;