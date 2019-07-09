DROP DATABASE IF EXISTS WorkWithTheBest;
CREATE DATABASE WorkWithTheBest;

CREATE TABLE WorkWithTheBest.districts (
	id INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
	name VARCHAR(100) NOT NULL,
	code CHAR(30)
	) ENGINE = InnoDB;

CREATE TABLE WorkWithTheBest.locations (
	id INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
	name VARCHAR(100) NOT NULL,
	code VARCHAR(150),
	districtId INT
	) ENGINE = InnoDB;

ALTER TABLE WorkWithTheBest.locations
ADD CONSTRAINT FOREIGN KEY(districtId) 
REFERENCES WorkWithTheBest.districts(id);

CREATE TABLE WorkWithTheBest.activityTitle (
	id INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
	name VARCHAR(200) NOT NULL
	) ENGINE = InnoDB;


CREATE TABLE WorkWithTheBest.activity (
	id INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
	name VARCHAR(200) NOT NULL,
	activityTitleId INT NOT NULL
	) ENGINE = InnoDB;


ALTER TABLE WorkWithTheBest.activity
ADD CONSTRAINT FOREIGN KEY(activityTitleId) 
REFERENCES WorkWithTheBest.activityTitle(id);

CREATE TABLE WorkWithTheBest.users (
	id INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
	firstName CHAR(39) NOT NULL,
	lastName CHAR(39) NOT NULL,
	email CHAR(39) NOT NULL,
	password VARCHAR(75) NOT NULl,
	cv VARCHAR(255),
	activated BOOLEAN DEFAULT false
	) ENGINE = InnoDB; 

CREATE TABLE WorkWithTheBest.userToLocation(
	id INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
	userId INT NOT NULL,
	locationId INT NOT NULL
	) ENGINE = InnoDB;

CREATE TABLE WorkWithTheBest.userToActivity (
	id INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
	userId INT NOT NULL,
	activityId INT NOT NULL
	) ENGINE = InnoDB;


ALTER TABLE WorkWithTheBest.userToLocation
ADD CONSTRAINT FOREIGN KEY(userId)
REFERENCES WorkWithTheBest.users(id),
ADD CONSTRAINT FOREIGN KEY (locationId)
REFERENCES WorkWithTheBest.locations(id);

ALTER TABLE WorkWithTheBest.userToActivity
ADD CONSTRAINT FOREIGN KEY(userId)
REFERENCES WorkWithTheBest.users(id),
ADD CONSTRAINT FOREIGN KEY (activityId)
REFERENCES WorkWithTheBest.activity(id); 

CREATE TABLE WorkWithTheBest.companies (
	id INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
	name CHAR(50) NOT NULL,
	siret INT NOT NULL,
	activity INT,
	description TEXT,
	email CHAR(39) NOT NULL,
	password VARCHAR(75) NOT NULL,
	activated BOOLEAN DEFAULT false
	) ENGINE = InnoDB;

CREATE TABLE WorkWithTheBest.companyToLocation(
	id INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
	companyId INT NOT NULL,
	locationId INT NOT NULL
	) ENGINE = InnoDB;

CREATE TABLE WorkWithTheBest.companyToActivity (
	id INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
	companyId INT NOT NULL,
	activityId INT NOT NULL
	) ENGINE = InnoDB;


ALTER TABLE WorkWithTheBest.companyToLocation
ADD CONSTRAINT FOREIGN KEY (companyId)
REFERENCES WorkWithTheBest.companies(id),
ADD CONSTRAINT FOREIGN KEY (locationId)
REFERENCES WorkWithTheBest.locations(id);

ALTER TABLE WorkWithTheBest.companyToActivity
ADD CONSTRAINT FOREIGN KEY(companyId)
REFERENCES WorkWithTheBest.companies(id),
ADD CONSTRAINT FOREIGN KEY (activityId)
REFERENCES WorkWithTheBest.activity(id);

CREATE TABLE WorkWithTheBest.usersOffers (
	id INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
	title VARCHAR(100),
	content TEXT NOT NULL,
	startDate DATETIME,
	endDate DATETIME,
	ownerId INT NOT NULL,
	active BOOLEAN DEFAULT true
	) ENGINE = InnoDB;

ALTER TABLE WorkWithTheBest.usersOffers
ADD CONSTRAINT FOREIGN KEY (ownerId)
REFERENCES WorkWithTheBest.users(id);

CREATE TABLE WorkWithTheBest.usersOffersToLocation(
	id INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
	offerId INT NOT NULL,
	locationId INT NOT NULL
	) ENGINE = InnoDB;

ALTER TABLE WorkWithTheBest.usersOffersToLocation
ADD CONSTRAINT FOREIGN KEY (offerId)
REFERENCES WorkWithTheBest.usersOffers(id),
ADD CONSTRAINT FOREIGN KEY (locationId)
REFERENCES WorkWithTheBest.locations(id);

CREATE TABLE WorkWithTheBest.usersOffersToActivity(
	id INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
	offerId INT NOT NULL,
	activityId INT NOT NULL
	) ENGINE = InnoDB;

ALTER TABLE WorkWithTheBest.usersOffersToActivity
ADD CONSTRAINT FOREIGN KEY (offerId)
REFERENCES WorkWithTheBest.usersOffers(id),
ADD CONSTRAINT FOREIGN KEY (activityId)
REFERENCES WorkWithTheBest.activity(id);

CREATE TABLE WorkWithTheBest.companiesOffers (
	id INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
	title VARCHAR(100),
	content TEXT NOT NULL,
	startDate DATETIME,
	endDate DATETIME,
	ownerId INT NOT NULL,
	active BOOLEAN DEFAULT true
	) ENGINE = InnoDB;

ALTER TABLE WorkWithTheBest.companiesOffers
ADD CONSTRAINT FOREIGN KEY (ownerId)
REFERENCES WorkWithTheBest.companies(id);

CREATE TABLE WorkWithTheBest.companiesOffersToLocation(
	id INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
	offerId INT NOT NULL,
	locationId INT NOT NULL
	) ENGINE = InnoDB;

ALTER TABLE WorkWithTheBest.companiesOffersToLocation
ADD CONSTRAINT FOREIGN KEY (offerId)
REFERENCES WorkWithTheBest.companiesOffers(id),
ADD CONSTRAINT FOREIGN KEY (locationId)
REFERENCES WorkWithTheBest.locations(id);

CREATE TABLE WorkWithTheBest.companiesOffersToActivity(
	id INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
	offerId INT NOT NULL,
	activityId INT NOT NULL
	) ENGINE = InnoDB;

ALTER TABLE WorkWithTheBest.companiesOffersToActivity
ADD CONSTRAINT FOREIGN KEY (offerId)
REFERENCES WorkWithTheBest.companiesOffers(id),
ADD CONSTRAINT FOREIGN KEY (activityId)
REFERENCES WorkWithTheBest.activity(id);


CREATE TABLE WorkWithTheBest.contract (
	id INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
	userId INT NOT NULL,
	companyId INT NOT NULL,
	startDate DATETIME NOT NULL,
	endDate DATETIME NOT NULL
	) ENGINE = InnoDB;

ALTER TABLE WorkWithTheBest.contract
ADD CONSTRAINT FOREIGN KEY (userId)
REFERENCES WorkWithTheBest.users(id),
ADD CONSTRAINT FOREIGN KEY (companyId)
REFERENCES WorkWithTheBest.companies(id);

CREATE TABLE WorkWithTheBest.userNote (
	id INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
	note INT NOT NULL,
	comment TEXT,
	contractId INT NOT NULL UNIQUE,
	userId INT NOT NULL
	) ENGINE = InnoDB;

ALTER TABLE WorkWithTheBest.userNote
ADD CONSTRAINT FOREIGN KEY (contractId)
REFERENCES WorkWithTheBest.contract(id),
ADD CONSTRAINT FOREIGN KEY (userID)
REFERENCES WorkWithTheBest.users(id);

CREATE TABLE WorkWithTheBest.companyNote (
	id INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
	note INT NOT NULL,
	comment TEXT,
	contractId INT NOT NULL UNIQUE,
	companyId INT NOT NULL
	) ENGINE = InnoDB;

ALTER TABLE WorkWithTheBest.companyNote
ADD CONSTRAINT FOREIGN KEY (contractId)
REFERENCES WorkWithTheBest.contract(id),
ADD CONSTRAINT FOREIGN KEY (companyID)
REFERENCES WorkWithTheBest.companies(id);

CREATE TABLE WorkWithTheBest.link (
	id INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
	userId INT NOT NULL,
	companyId INT NOT NULL
	) ENGINE = InnoDB;

ALTER TABLE WorkWithTheBest.link
ADD CONSTRAINT FOREIGN KEY (userId)
REFERENCES WorkWithTheBest.users(id),
ADD CONSTRAINT FOREIGN KEY (companyId)
REFERENCES WorkWithTheBest.companies(id);







