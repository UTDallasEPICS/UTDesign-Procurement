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
    attachmentName VARCHAR(60),
);

create table reimbursement_items(
	itemID INT AUTO_INCREMENT PRIMARY KEY,
    requestID INT NOT NULL,
    vendorID INT NOT NULL,
    description VARCHAR(500) NOT NULL,
    receiptDate DATE NOT NULL,
    price DECIMAL(7,2) NOT NULL,
    uploadID INT,
);

create table department(
	departmentID INT AUTO_INCREMENT PRIMARY KEY,
    department VARCHAR(100) NOT NULL,
);

create table vendors(
	vendorID INT AUTO_INCREMENT PRIMARY KEY,
    vendorName VARCHAR(50) NOT NULL,
);
