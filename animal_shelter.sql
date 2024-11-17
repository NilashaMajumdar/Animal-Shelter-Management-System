BEGIN
    BEGIN TRY
        EXEC ('DROP TABLE Donor');
        EXEC ('DROP TABLE Donate');
        EXEC ('DROP TABLE Branch');
        EXEC ('DROP TABLE Volunteer');
        EXEC ('DROP TABLE Role');
        EXEC ('DROP TABLE Vet');
        EXEC ('DROP TABLE WorkFor');
        EXEC ('DROP TABLE Supplies');
        EXEC ('DROP TABLE EmployeeManages');
        EXEC ('DROP TABLE Position');
        EXEC ('DROP TABLE Cage');
        EXEC ('DROP TABLE FloorNumber');
        EXEC ('DROP TABLE Animal');
        EXEC ('DROP TABLE AdoptionFee');
        EXEC ('DROP TABLE Dog');
        EXEC ('DROP TABLE Cat');
        EXEC ('DROP TABLE Treat');
        EXEC ('DROP TABLE Adopter');
    END TRY
    BEGIN CATCH
        -- Optionally log the error here or handle it
        PRINT 'An error occurred while dropping tables.';
    END CATCH
END;

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

CREATE TABLE Supplies (
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

CREATE TABLE FloorNumber (
    floor_number INTEGER,
    size VARCHAR(50),
    PRIMARY KEY (floor_number)
);

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
    -- I think it should be this: FOREIGN KEY (cage_number, branch_city, branch_province) REFERENCES
    -- Cage(cage_number, branch_city, branch_province)  we can double check with the TA
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

-- done adding all of the tables, now add in some tuples


INSERT INTO Donor VALUES (1, 'Macy Raymond', 'money');
INSERT INTO Donor VALUES (2, 'Jack Shepherd', 'dog toys');
INSERT INTO Donor VALUES (3, 'Lilah Knapp', 'cat toys');
INSERT INTO Donor VALUES (4, 'Noah Lucero', 'money');
INSERT INTO Donor VALUES (5, 'Angela Owens', 'cleaning supplies');
INSERT INTO Donor VALUES (6, 'Jaden Marsh', 'money');

INSERT INTO Donate VALUES (1, 'Calgary', 'Alberta', 50);
INSERT INTO Donate VALUES (1, 'Vancouver', 'British Columbia', 45);
INSERT INTO Donate VALUES (2, 'Calgary', 'Alberta', 2);
INSERT INTO Donate VALUES (3, 'Burnaby', 'British Columbia', 4);
INSERT INTO Donate VALUES (4, 'Winnipeg', 'Manitoba', 70);
INSERT INTO Donate VALUES (5, 'Toronto', 'Ontario', 3);
INSERT INTO Donate VALUES (6, 'Ottawa', 'Ontario', 150);

INSERT INTO Branch VALUES ('Calgary', 'Alberta', '4706 Maynard Rd');
INSERT INTO Branch VALUES ('Vancouver', 'British Columbia', '84 Robson St');
INSERT INTO Branch VALUES ('Burnaby', 'British Columbia', '397 James Street');
INSERT INTO Branch VALUES ('Winnipeg', 'Manitoba', '4046 St Marys Rd');
INSERT INTO Branch VALUES ('Toronto', 'Ontario', '644 Danforth Avenue');
INSERT INTO Branch VALUES ('Ottawa', 'Ontario', '819 MacLaren Street');


INSERT INTO Volunteer VALUES (37927, 'Joyce Page', 'Animal Care Assistant', '2024-04-24', 'Burnaby',
     'British Columbia');
INSERT INTO Volunteer VALUES (37940, 'Kian Wu', 'Animal Care Assistant', '2023-09-13', 'Calgary',
     'Alberta');
INSERT INTO Volunteer VALUES (41338, 'Jasmine McCann', 'Dog Walker/Cat Socializer', '2023-04-22',
     'Winnipeg', 'Manitoba');
INSERT INTO Volunteer VALUES (28387, 'Lucy Reid', 'Adoption Event Assistant', '2022-02-07', 'Calgary',
     'Alberta');
INSERT INTO Volunteer VALUES (38429, 'Denise Kim', 'Transport Volunteer', '2024-03-10', 'Calgary',
     'Alberta');

INSERT INTO Role VALUES ('Animal Care Assistant', 5);
INSERT INTO Role VALUES ('Dog Walker/Cat Socializer', 4);
INSERT INTO Role VALUES ('Adoption Event Assistant', 5);
INSERT INTO Role VALUES ('Shelter Administrative Support', 6);
INSERT INTO Role VALUES ('Transport Volunteer', 2);
INSERT INTO Role VALUES ('Photography/Videography Volunteer', 3);

INSERT INTO Vet VALUES (1, 'Katelyn Lyons', 'Pawsitive Care Veterinary Clinic');
INSERT INTO Vet VALUES (2, 'Barbara Bowen', 'Healing Paws Animal Hospital');
INSERT INTO Vet VALUES (3, 'Revor Stevenson', 'Compassionate Creatures Veterinary Clinic');
INSERT INTO Vet VALUES (4, 'Abby Benson', 'Pawsitive Care Veterinary Clinic');
INSERT INTO Vet VALUES (5, 'Vanessa Wu', 'The Pet Palette Veterinary Clinic');





