create table reimbursements(
	requestID INT AUTO_INCREMENT PRIMARY KEY,
    projectID INT NOT NULL,
    studentID INT,
    justification VARCHAR(500),
    additionalInfo VARCHAR(500),
    dateSubmitted DATE NOT NULL,
    status CHAR(20) NOT NULL
);