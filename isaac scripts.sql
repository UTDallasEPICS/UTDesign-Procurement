-- create database upm;

-- use upm;

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

