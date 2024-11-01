CREATE TABLE Donor (
    donor_ID INTEGER PRIMARY KEY,
    donor_name VARCHAR(255),
    donated_item VARCHAR(255)
);

CREATE TABLE Donate (
    donor_ID INTEGER,
    branch_city VARCHAR(255),
    branch_province VARCHAR(255),
    amount DECIMAL(8,2),
    PRIMARY KEY (donor_ID, branch_city, branch_province),
    FOREIGN KEY (donor_ID) REFERENCES Donor(donor_ID),
    FOREIGN KEY (branch_city, branch_province) REFERENCES Branch(city, province)
);

CREATE TABLE Branch(
    city VARCHAR(255),
    province VARCHAR(255),
    address VARCHAR(255),
    PRIMARY KEY (city, province)
);

CREATE TABLE Volunteer (
    volunteer_ID INTEGER PRIMARY KEY,
    volunteer_name VARCHAR(255),
    volunteer_role VARCHAR(255),
    started_date DATE,
    branch_city VARCHAR(255) NOT NULL,
    branch_province VARCHAR(255) NOT NULL,
    FOREIGN KEY (volunteer_role) REFERENCES Role(role),
    FOREIGN KEY (branch_city, branch_province) REFERENCES Branch(city, province) ON DELETE NO ACTION ON UPDATE CASCADE
);

CREATE TABLE Role (
    role VARCHAR(255) PRIMARY KEY,
    hours_per_week INTEGER
);

CREATE TABLE Vet (
    vet_ID INTEGER PRIMARY KEY,
    vet_name VARCHAR(255),
    clinic VARCHAR(255)
);

CREATE TABLE WorkFor (
    vet_ID INTEGER,
    branch_city VARCHAR(255),
    branch_province VARCHAR(255),
    hourly_rate DECIMAL(4,2),
    PRIMARY KEY (vet_ID, branch_city, branch_province),
    FOREIGN KEY (vet_ID) REFERENCES Vet(vet_ID),
    FOREIGN KEY (branch_city, branch_province) REFERENCES Branch(city, province)
);

CREATE Supplies (
    supply_name VARCHAR(255),
    branch_city VARCHAR(255),
    branch_province VARCHAR(255),
    quantity INTEGER,
    PRIMARY KEY (supply_name, branch_city, branch_province),
    FOREIGN KEY (branch_city, branch_province) REFERENCES Branch(city, province) ON DELETE CASCADE
);

CREATE TABLE EmployeeManages(
    employee_ID INTEGER,
    branch_city VARCHAR(255) NOT NULL,
    branch_province VARCHAR(255) NOT NULL,
    employee_name VARCHAR(255),
    position VARCHAR(255),
    started_date DATE,
    PRIMARY KEY (employee_ID),
    FOREIGN KEY (position) REFERENCES Position(position),
    FOREIGN KEY (branch_city, branch_province) REFERENCES Branch(city, province) ON DELETE NO ACTION ON UPDATE CASCADE
);

CREATE TABLE Position (
    position VARCHAR(255),
    salary INTEGER,
    PRIMARY KEY (position)
);

CREATE TABLE Adopter (
    adopter_ID INTEGER PRIMARY KEY,
    adopter_name VARCHAR(255),
    adopter_age INTEGER,
    adopter_address VARCHAR(255),
    criminal_record VARCHAR(255)
)