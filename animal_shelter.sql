DROP TABLE Donor cascade constraints;
DROP TABLE Branch cascade constraints;
DROP TABLE Donate cascade constraints;
DROP TABLE Volunteer cascade constraints;
DROP TABLE Role cascade constraints;
DROP TABLE Vet cascade constraints;
DROP TABLE WorkFor cascade constraints;
DROP TABLE Supplies cascade constraints;
DROP TABLE EmployeeManages cascade constraints;
DROP TABLE Position cascade constraints;
DROP TABLE Cage cascade constraints;
DROP TABLE FloorNumber cascade constraints;
DROP TABLE Animal cascade constraints;
DROP TABLE AdoptionFee cascade constraints;
DROP TABLE Dog cascade constraints;
DROP TABLE Cat cascade constraints;
DROP TABLE Treat cascade constraints;
DROP TABLE Adopter cascade constraints;

CREATE TABLE Donor (
    donor_ID INTEGER PRIMARY KEY,
    donor_name VARCHAR(255),
    donated_item VARCHAR(255)
);

CREATE TABLE Branch(
    city VARCHAR(255),
    province VARCHAR(255),
    address VARCHAR(255),
    PRIMARY KEY (city, province)
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

CREATE TABLE Position (
                          position VARCHAR(255),
                          salary INTEGER,
                          PRIMARY KEY (position)
);

CREATE TABLE FloorNumber (
    floor_number INTEGER,
    cage_size VARCHAR(50),
    PRIMARY KEY (floor_number)
);

CREATE TABLE AdoptionFee (
                             breed VARCHAR(255),
                             age INTEGER,
                             adoption_fee INTEGER,
                             PRIMARY KEY (breed, age)
);

CREATE TABLE Adopter (
                         adopter_ID INTEGER PRIMARY KEY,
                         adopter_name VARCHAR(255),
                         adopter_age INTEGER,
                         adopter_address VARCHAR(255),
                         criminal_record VARCHAR(255)
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

CREATE TABLE Volunteer (
    volunteer_ID INTEGER PRIMARY KEY,
    volunteer_name VARCHAR(255),
    volunteer_role VARCHAR(255),
    started_date DATE,
    branch_city VARCHAR(255) NOT NULL,
    branch_province VARCHAR(255) NOT NULL,
    FOREIGN KEY (volunteer_role) REFERENCES Role(role),
    FOREIGN KEY (branch_city, branch_province) REFERENCES Branch(city, province) ON DELETE CASCADE
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
    FOREIGN KEY (branch_city, branch_province) REFERENCES Branch(city, province) ON DELETE CASCADE
); --ON DELETE NO ACTION ON UPDATE CASCADE


CREATE TABLE Cage (
    cage_number INTEGER,
    branch_city VARCHAR(255),
    branch_province VARCHAR(255),
    floor_number INTEGER,
    PRIMARY KEY (cage_number, branch_city, branch_province),
    FOREIGN KEY (floor_number) REFERENCES FloorNumber(floor_number),
    FOREIGN KEY (branch_city, branch_province) REFERENCES Branch(city, province) ON DELETE CASCADE
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
    FOREIGN KEY (cage_number, branch_city, branch_province) REFERENCES Cage(cage_number, branch_city, branch_province)
    -- I think it should be this: FOREIGN KEY (cage_number, branch_city, branch_province) REFERENCES
    -- Cage(cage_number, branch_city, branch_province)  we can double check with the TA
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
    vaccination NUMBER(1),  -- 1 for True, 0 for False
    PRIMARY KEY (vet_ID, animal_ID),
    FOREIGN KEY (vet_ID) REFERENCES Vet(vet_ID),
    FOREIGN KEY (animal_ID) REFERENCES Animal(animal_ID)
);


-- done adding all of the tables, now add in some tuples


INSERT INTO Donor VALUES (1, 'Macy Raymond', 'money');
INSERT INTO Donor VALUES (2, 'Jack Shepherd', 'dog toys');
INSERT INTO Donor VALUES (3, 'Lilah Knapp', 'cat toys');
INSERT INTO Donor VALUES (4, 'Noah Lucero', 'money');
INSERT INTO Donor VALUES (5, 'Angela Owens', 'cleaning supplies');
INSERT INTO Donor VALUES (6, 'Jaden Marsh', 'money');

INSERT INTO Branch VALUES ('Calgary', 'Alberta', '4706 Maynard Rd');
INSERT INTO Branch VALUES ('Vancouver', 'British Columbia', '84 Robson St');
INSERT INTO Branch VALUES ('Burnaby', 'British Columbia', '397 James Street');
INSERT INTO Branch VALUES ('Winnipeg', 'Manitoba', '4046 St Marys Rd');
INSERT INTO Branch VALUES ('Toronto', 'Ontario', '644 Danforth Avenue');
INSERT INTO Branch VALUES ('Ottawa', 'Ontario', '819 MacLaren Street');

INSERT INTO Donate VALUES (1, 'Calgary', 'Alberta', 50);
INSERT INTO Donate VALUES (1, 'Vancouver', 'British Columbia', 45);
INSERT INTO Donate VALUES (2, 'Calgary', 'Alberta', 2);
INSERT INTO Donate VALUES (3, 'Burnaby', 'British Columbia', 4);
INSERT INTO Donate VALUES (4, 'Winnipeg', 'Manitoba', 70);
INSERT INTO Donate VALUES (5, 'Toronto', 'Ontario', 3);
INSERT INTO Donate VALUES (6, 'Ottawa', 'Ontario', 150);



INSERT INTO Volunteer VALUES (37927, 'Joyce Page', 'Animal Care Assistant', TO_DATE('2024-04-24', 'YYYY-MM-DD'), 'Burnaby',
     'British Columbia');
INSERT INTO Volunteer VALUES (37940, 'Kian Wu', 'Animal Care Assistant', TO_DATE('2023-09-13', 'YYYY-MM-DD'), 'Calgary',
     'Alberta');
INSERT INTO Volunteer VALUES (41338, 'Jasmine McCann', 'Dog Walker/Cat Socializer', TO_DATE('2023-04-22', 'YYYY-MM-DD'),
     'Winnipeg', 'Manitoba');
INSERT INTO Volunteer VALUES (28387, 'Lucy Reid', 'Adoption Event Assistant', TO_DATE('2022-02-07', 'YYYY-MM-DD'), 'Calgary',
     'Alberta');
INSERT INTO Volunteer VALUES (38429, 'Denise Kim', 'Transport Volunteer', TO_DATE('2024-03-10', 'YYYY-MM-DD'), 'Calgary',
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


INSERT INTO WorkFor VALUES (1, 'Vancouver', 'British Columbia', 65);
INSERT INTO WorkFor VALUES (1, 'Burnaby', 'British Columbia', 50);
INSERT INTO WorkFor VALUES (2, 'Calgary', 'Alberta', 47);
INSERT INTO WorkFor VALUES (3, 'Winnipeg', 'Manitoba', 43);
INSERT INTO WorkFor VALUES (4, 'Vancouver', 'British Columbia', 70);
INSERT INTO WorkFor VALUES (5, 'Ottawa', 'Ontario', 59);

INSERT INTO Supplies VALUES ('Cleaning supplies', 'Calgary', 'Alberta', 10);
INSERT INTO Supplies VALUES ('Toys/Enrichment items', 'Vancouver', 'British Columbia', 40);
INSERT INTO Supplies VALUES ('Blankets', 'Burnaby', 'British Columbia', 25);
INSERT INTO Supplies VALUES ('Cleaning supplies', 'Burnaby', 'British Columbia', 14);
INSERT INTO Supplies VALUES ('Blankets', 'Winnipeg', 'Manitoba', 33);
INSERT INTO Supplies VALUES ('Toys/Enrichment items', 'Ottawa', 'Ontario', 47);

INSERT INTO EmployeeManages VALUES (1234, 'Calgary', 'Alberta', 'Evan Turner', 'Manager', TO_DATE('2022-01-15', 'YYYY-MM-DD'));
INSERT INTO EmployeeManages VALUES (5678, 'Vancouver', 'British Columbia', 'Olivia Mason', 'Assistant Manager',
                                    TO_DATE('2023-03-12', 'YYYY-MM-DD'));
INSERT INTO EmployeeManages VALUES (9101, 'Burnaby', 'British Columbia', 'Sophia Carter', 'Veterinarian',
                                    TO_DATE('2022-09-25', 'YYYY-MM-DD'));
INSERT INTO EmployeeManages VALUES (1121, 'Winnipeg', 'Manitoba', 'Liam Johnson', 'Assistant Manager', TO_DATE('2023-05-18', 'YYYY-MM-DD'));
INSERT INTO EmployeeManages VALUES (3141, 'Ottawa', 'Ontario', 'Ella Brown', 'Animal Trainer', TO_DATE('2021-07-04', 'YYYY-MM-DD'));


INSERT INTO Position VALUES ('Manager', 70000);
INSERT INTO Position VALUES ('Assistant Manager', 55000);
INSERT INTO Position VALUES ('Veterinarian', 80000);
INSERT INTO Position VALUES ('Shelter Assistant', 40000);
INSERT INTO Position VALUES ('Animal Trainer', 45000);


INSERT INTO Cage VALUES (1, 'Calgary', 'Alberta', 2);
INSERT INTO Cage VALUES (2, 'Vancouver', 'British Columbia', 1);
INSERT INTO Cage VALUES (3, 'Burnaby', 'British Columbia', 3);
INSERT INTO Cage VALUES (4, 'Winnipeg', 'Manitoba', 1);
INSERT INTO Cage VALUES (5, 'Ottawa', 'Ontario', 2);

INSERT INTO FloorNumber VALUES (1, 'Large');
INSERT INTO FloorNumber VALUES (2, 'Medium');
INSERT INTO FloorNumber VALUES (3, 'Small');
INSERT INTO FloorNumber VALUES (4, 'Large');
INSERT INTO FloorNumber VALUES (5, 'Medium');

INSERT INTO Animal VALUES (1001, 'Max', 'Labrador', 4, '2023-07-12', NULL, NULL, 1, 'Calgary',
     'Alberta');
INSERT INTO Animal VALUES (1002, 'Bella', 'German Shepherd', 3, '2022-12-05', '2023-10-10', 3001, 2,
     'Vancouver', 'British Columbia');
INSERT INTO Animal VALUES (1003, 'Milo', 'Beagle', 2, '2023-04-22', NULL, NULL, 3, 'Burnaby', 'British
Columbia');
INSERT INTO Animal VALUES (2001, 'Luna', 'Persian', 1, '2023-08-01', NULL, NULL, 4, 'Winnipeg',
     'Manitoba');
INSERT INTO Animal VALUES (1005, 'Charlie', 'Poodle', 5, '2021-09-15', '2023-01-20', 3002, 5,
     'Ottawa', 'Ontario');

INSERT INTO AdoptionFee VALUES ('Labrador', 4, 400);
INSERT INTO AdoptionFee VALUES ('German Shepherd', 3, 600);
INSERT INTO AdoptionFee VALUES ('Beagle', 2, 650);
INSERT INTO AdoptionFee VALUES ('Persian', 1, 500);
INSERT INTO AdoptionFee VALUES ('Poodle', 5, 560);

INSERT INTO Dog VALUES (1001, 'High');
INSERT INTO Dog VALUES (1002, 'Moderate');
INSERT INTO Dog VALUES (1003, 'Low');
INSERT INTO Dog VALUES (1004, 'Low');
INSERT INTO Dog VALUES (1005, 'Moderate');

INSERT INTO Cat VALUES (2001, 'Frequent napper');
INSERT INTO Cat VALUES (2002, 'Sleeps after meals');
INSERT INTO Cat VALUES (2003, 'No regular naps');
INSERT INTO Cat VALUES (2004, 'Takes long naps');
INSERT INTO Cat VALUES (2005, 'Short naps throughout the day');


INSERT INTO Adopter VALUES (3001, 'John Doe', 35, '123 Elm St, Vancouver, BC', 'None');
INSERT INTO Adopter VALUES (3002, 'Jane Smith', 28, '456 Maple Ave, Ottawa, ON', 'None');
INSERT INTO Adopter VALUES (3003, 'Michael Brown', 40, '789 Oak Rd, Calgary, AB', 'None');
INSERT INTO Adopter VALUES (3004, 'Emily Davis', 32, '321 Pine St, Burnaby, BC', 'None');
INSERT INTO Adopter VALUES (3005, 'Daniel Lee', 45, '654 Cedar Ln, Winnipeg, MB', 'None');
