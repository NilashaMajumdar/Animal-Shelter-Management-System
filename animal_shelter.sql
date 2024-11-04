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

CREATE TABLE Cage (
    cage_number INTEGER,
    branch_city VARCHAR(255),
    branch_province VARCHAR(255),
    floor_number INTEGER,
    PRIMARY KEY (cage_number, branch_city, branch_province),
    FOREIGN KEY (floor_number) REFERENCES FloorNumber(floor_number),
    FOREIGN KEY (branch_city, branch_province) REFERENCES Branch(city, province) ON DELETE CASCADE
);

CREATE FloorNumber (
    floor_number INTEGER,
    size VARCHAR(50),
    PRIMARY KEY (floor_number)
)

CREATE TABLE Animal (
    animal_ID INTEGER,
    animal_name VARCHAR(255),
    breed VARCHAR(255),
    age INTEGER,
    admission_date DATE,
    adoption_date DATE,
    adopter_ID INTEGER,
    cage_number INTEGER NOT NULL,
    branch_city VARCHAR(255) NOT NULL,
    branch_province VARCHAR(255) NOT NULL,
    UNIQUE (cage_number, branch_city, branch_province),
    PRIMARY KEY (animal_ID),
    FOREIGN KEY (breed, age) REFERENCES AdoptionFee(breed, age),
    FOREIGN KEY (adopter_ID) REFERENCES Adopter(adopter_ID),
    FOREIGN KEY (cage_number) REFERENCES Cage(cage_number),
    FOREIGN KEY (branch_city, branch_province) REFERENCES Branch(city, province)
);

CREATE TABLE AdoptionFee (
    breed VARCHAR(255),
    age INTEGER,
    adoption_fee INTEGER,
    PRIMARY KEY (breed, age)
);

CREATE TABLE Dog (
    animal_ID INTEGER,
    guarding_behavior VARCHAR(255),
    PRIMARY KEY (animal_ID),
    FOREIGN KEY (animal_ID) REFERENCES Animal(animal_ID)
);

CREATE TABLE Cat (
    animal_ID INTEGER,
    napping_habits VARCHAR(255),
    PRIMARY KEY (animal_ID),
    FOREIGN KEY (animal_ID) REFERENCES Animal(animal_ID)
);

CREATE TABLE Treat (
    vet_ID INTEGER,
    animal_ID INTEGER,
    number_of_surgeries INTEGER,
    vaccination BOOLEAN,
    PRIMARY KEY (vet_ID, animal_ID),
    FOREIGN KEY (vet_ID) REFERENCES Vet(vet_ID),
    FOREIGN KEY (animal_ID) REFERENCES Animal(animal_ID)
);

CREATE TABLE Adopter (
    adopter_ID INTEGER PRIMARY KEY,
    adopter_name VARCHAR(255),
    adopter_age INTEGER,
    adopter_address VARCHAR(255),
    criminal_record VARCHAR(255)
)