
const oracledb = require('oracledb');
const loadEnvFile = require('./utils/envUtil');

const envVariables = loadEnvFile('./.env');

// Database configuration setup. Ensure your .env file has the required database credentials.
const dbConfig = {
    user: envVariables.ORACLE_USER,
    password: envVariables.ORACLE_PASS,
    connectString: `${envVariables.ORACLE_HOST}:${envVariables.ORACLE_PORT}/${envVariables.ORACLE_DBNAME}`,
    poolMin: 1,
    poolMax: 3,
    poolIncrement: 1,
    poolTimeout: 60
};

// initialize connection pool
async function initializeConnectionPool() {
    try {
        await oracledb.createPool(dbConfig);
        console.log('Connection pool started');
    } catch (err) {
        console.error('Initialization error: ' + err.message);
    }
}

async function fetchProjectionResultFromDb() {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute('SELECT * FROM SELECTEDCOLUMNS');
        console.log("fetched data from selectedColumns view");

        const columns = result.metaData.map(meta => meta.name); // Column names
        const rows = result.rows; // Row data

        await connection.execute(`DROP VIEW SELECTEDCOLUMNS`);
        console.log("Dropped selectedColumns view");
        await connection.commit();

        return { columns, rows};
    }).catch(() => {
        return { columns: [], rows: []};
    });
}

async function fetchVolunteers() {
    console.log("appService.js: in fetch volunteers right now")
    return await withOracleDB(async (connection) => {
        const result = await connection.execute(
            `SELECT v.volunteer_ID, v.volunteer_name, v.volunteer_role, 
                    TO_CHAR(v.started_date, 'YYYY-MM-DD') as started_date, 
                    v.branch_city, v.branch_province 
             FROM Volunteer v`
        );
        console.log("fetched volunteer info!!")
        return result.rows;
    }).catch((error) => {
        console.error('Error fetching volunteers:', error);
        return [];
    });
}

async function fetchAvailableRoles() {
    console.log("appService.js: in fetch available rorws right now")
    return await withOracleDB(async (connection) => {
        const result = await connection.execute('SELECT role FROM Role');
        console.log("appService.js: fetched available rorws!!!")
        return result.rows;
    }).catch((error) => {
        console.error('Error fetching roles:', error);
        return [];
    });
}

async function fetchBranches() {
    console.log("appService.js: in fetch branches right now")
    return await withOracleDB(async (connection) => {
        const result = await connection.execute('SELECT city, province FROM Branch');
        console.log("appService.js: fetched branches!!!")

        return result.rows;
    }).catch((error) => {
        console.error('Error fetching branches:', error);
        return [];
    });
}

async function closePoolAndExit() {
    console.log('\nTerminating');
    try {
        await oracledb.getPool().close(10); // 10 seconds grace period for connections to finish
        console.log('Pool closed');
        process.exit(0);
    } catch (err) {
        console.error(err.message);
        process.exit(1);
    }
}

initializeConnectionPool();

process
    .once('SIGTERM', closePoolAndExit)
    .once('SIGINT', closePoolAndExit);


// ----------------------------------------------------------
// Wrapper to manage OracleDB actions, simplifying connection handling.
async function withOracleDB(action) {
    let connection;
    try {
        connection = await oracledb.getConnection(); // Gets a connection from the default pool 
        return await action(connection);
    } catch (err) {
        console.error(err);
        throw err;
    } finally {
        if (connection) {
            try {
                await connection.close();
            } catch (err) {
                console.error(err);
            }
        }
    }
}


// ----------------------------------------------------------
// Core functions for database operations
// Modify these functions, especially the SQL queries, based on your project's requirements and design.
async function testOracleConnection() {
    return await withOracleDB(async (connection) => {
        return true;
    }).catch(() => {
        return false;
    });
}

async function fetchDemotableFromDb() {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute('SELECT * FROM DEMOTABLE');
        return result.rows;
    }).catch(() => {
        return [];
    });
}


async function deleteSupplies(supplyName, branchCity, branchProvince) {
    console.log("appService.js: in deleteSupplies function right now")
    return await withOracleDB(async (connection) => {
        try {
            console.log("appService.js: in try block will run query after")

            const result = await connection.execute(
                `DELETE FROM Supplies 
                 WHERE supply_name = :1 
                 AND branch_city = :2 
                 AND branch_province = :3`,
                [supplyName, branchCity, branchProvince],
                { autoCommit: true }
            );

            console.log("appService.js: ran query and deleted!!")
            console.log(`appService.js: ran delete query. Rows affected: ${result.rowsAffected}`);

            const allRecords = await connection.execute(
                `SELECT * FROM Supplies`
            );

            console.log("All remaining records in Supplies table:", allRecords.rows);

            return result.rowsAffected > 0;
        } catch (error) {
            console.error('Error deleting supplies:', error);
            throw error;
        }
    });
}

async function insertDemotable(donorId, branchCity, branchProvince, amount) {
    console.log("appService.js: Starting insertDemotable with params:", { donorId, branchCity, branchProvince, amount });
    return await withOracleDB(async (connection) => {
        try {
            // DEBUG: First check Branch table structure
            console.log("DEBUG: Checking Branch table structure...");
            const tableInfo = await connection.execute(
                `SELECT column_name, data_type 
                 FROM user_tab_columns 
                 WHERE table_name = 'BRANCH'`
            );
            console.log("Branch table columns:", tableInfo.rows);

            // DEBUG: Check Branch table data
            console.log("DEBUG: Checking Branch table data...");
            const branchData = await connection.execute(
                `SELECT * FROM Branch`
            );
            console.log("Branch table data:", branchData.rows);
            // console.log("hope git saves")

            // Continue with regular checks...
            console.log("Checking donor ID...");
            const donorIdCheck = await connection.execute(
                `SELECT 1 FROM Donor WHERE donor_ID = :1`,
                [donorId]
            );

            if (donorIdCheck.rows.length === 0) {
                throw new Error("A donor with this ID does not exist");
            }

            console.log("Checking branch existence...");
            const cityAndProvinceCheck = await connection.execute(
                `SELECT 1 FROM Branch WHERE city = :1 AND province = :2`,
                [branchCity, branchProvince]
            );

            if (cityAndProvinceCheck.rows.length === 0) {
                throw new Error(`There is no branch in ${branchCity}, ${branchProvince}!`);
            }

            console.log("Inserting into Donate table...");
            const result = await connection.execute(
                `INSERT INTO Donate (donor_ID, branch_city, branch_province, amount) 
                 VALUES (:1, :2, :3, :4)`,
                [donorId, branchCity, branchProvince, amount],
                { autoCommit: true }
            );

            return result.rowsAffected > 0;

        } catch (error) {
            console.error("Error details:", error);
            throw error;
        }
    }).catch((error) => {
        console.error("Database operation failed:", error);
        return false;
    });
}

async function updateVolunteer(volunteerId, updates) {
    console.log("appService.js: Inside updateVolunteer function now");
    return await withOracleDB(async (connection) => {
        // Build dynamic UPDATE query based on provided fields
        let updateFields = [];
        let bindParams = [];
        let bindValues = [];

        if (updates.volunteer_name) {
            updateFields.push('volunteer_name = :volunteer_name');
            bindParams.push(':volunteer_name');
            bindValues.push(updates.volunteer_name);
        }
        if (updates.volunteer_role) {
            updateFields.push('volunteer_role = :volunteer_role');
            bindParams.push(':volunteer_role');
            bindValues.push(updates.volunteer_role);
        }
        if (updates.started_date) {
            updateFields.push('started_date = TO_DATE(:started_date, \'YYYY-MM-DD\')');
            bindParams.push(':started_date');
            bindValues.push(updates.started_date);
        }
        if (updates.branch_city && updates.branch_province) {
            updateFields.push('branch_city = :branch_city');
            updateFields.push('branch_province = :branch_province');
            bindParams.push(':branch_city', ':branch_province');
            bindValues.push(updates.branch_city, updates.branch_province);
        }

        bindValues.push(volunteerId);
        console.log("appService.js: Inside await now");
        console.log("appService.js: will execute query soon");
        console.log("update_fields:", updateFields);
        console.log("bindValues:", bindValues);


        const query = `
            UPDATE Volunteer 
            SET ${updateFields.join(', ')} 
            WHERE volunteer_ID = :volunteer_id
        `;
        console.log("query:", query)

        const result = await connection.execute(
            query,
            [...bindValues],
            { autoCommit: true }
        );

        console.log("updated!! yayy")
        return result.rowsAffected > 0;
    }).catch((error) => {
        console.error('Error updating volunteer:', error);
        throw error;
    });
}

async function fetchDonateFromDb() {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute('SELECT * FROM Donate');
        return result.rows;
    }).catch(() => {
        return [];
    });
}

// Function get the city and province to know the branch and return the total donates in that branch
async function countDonateByLocation(branch_city, branch_province) {
    console.log(`AppService - Received Query: ${branch_city}, ${branch_province}`);
    return await withOracleDB(async (connection) => {
        try {
            const result = await connection.execute(
                `SELECT COUNT(*) AS donation_count
                 FROM Donate
                 WHERE branch_city = :branch_city
                   AND branch_province = :branch_province
                 GROUP BY branch_city, branch_province`,
                {
                    branch_city: branch_city,
                    branch_province: branch_province,
                }
            );

            console.log('AppService - Query Result:', result.rows);

            if (result.rows.length > 0) {
                // Extract the donation_count value from the query result.
                const donationCount = result.rows[0][0];
                return donationCount;
            } else {
                return 0; // No donations found
            }
        } catch (err) {
            console.error('AppService - Query Error:', err.message);
            throw err;
        }
    });
}

// Function to get the branches with total donate amount larger than 50. Return branches city and province with total amount
async function getBranchesWithHighDonations() {
    console.log('AppService - Fetching branches with high donations.');
    return await withOracleDB(async (connection) => {
        try {
            const result = await connection.execute(
                `SELECT branch_city, branch_province, SUM(amount) AS total_donations
                 FROM Donate
                 GROUP BY branch_city, branch_province
                 HAVING SUM(amount) > 50`
            );

            console.log('AppService - Query Result:', result.rows);

            if (result.rows.length > 0) {
                return result.rows;
            } else {
                return [];
            }
        } catch (err) {
            console.error('AppService - Query Error', err.message);
            throw err;
        }
    });
}

// Function to get the branches with average donation in branch larger than the overall average donation across all branches
// Return: branch city and province with average donation amount
async function getBranchesAboveAverageDonation() {
    console.log('AppService - Querying branches with above-average donation amounts');
    return await withOracleDB(async (connection) => {
        try {
            const result = await connection.execute(
                `SELECT branch_city, branch_province, AVG(amount) AS avg_donation
                 FROM Donate
                 GROUP BY branch_city, branch_province
                 HAVING AVG(amount) > (SELECT AVG(amount) FROM Donate)`
            );

            console.log('AppService - Query Result:', result.rows);

            if (result.rows.length > 0) {
                return result.rows;
            } else {
                return [];
            }
        } catch (err) {
            console.error('AppService - Query Error', err.message);
            throw err;
        }
    });
}

// Function get the name of branches which have donation from all donor in the database
// Return the branch city and province
async function getBRanchesDonatedByAllDonors() {
    console.log('AppService - Querying branches donated by all donors');
    return await withOracleDB(async (connection) => {
        try {
            const result = await connection.execute(
                `SELECT DISTINCT D1.branch_city, D1.branch_province
                 FROM Donate D1
                 WHERE NOT EXISTS (SELECT donor_ID
                                   FROM Donate D2
                                   WHERE NOT EXISTS(SELECT 1
                                                    FROM Donate D3
                                                    WHERE D3.donor_ID = D2.donor_ID
                                                      AND D3.branch_city = D1.branch_city
                                                      AND D3.branch_province = D1.branch_province))`
            );

            console.log('AppService - Query Result:', result.rows);

            if (result.rows.length > 0) {
                return result.rows;
            } else {
                return [];
            }
        } catch (err) {
            console.error('AppService - Query Error', err.message);
            throw err;
        }
    });
}

//Vicky code
async function initiateDemotable() {
    return await withOracleDB(async (connection) => {
        try {
            await connection.execute(`DROP TABLE DEMOTABLE`);
        } catch(err) {
            console.log('Table might not exist, proceeding to create...');
        }

        const result = await connection.execute(`
            CREATE TABLE DEMOTABLE (
                id NUMBER PRIMARY KEY,
                name VARCHAR2(20)
            )
        `);
        return true;
    }).catch(() => {
        return false;
    });
}
async function projectionFromAdopter(columns) {
    console.log("appService.js: Inside projection function now");
    console.log(columns);

    // const sanitizedColumns = columns.filter(column => /^[a-zA-Z0-9_]+$/.test(column));
    //
    // if (sanitizedColumns.length !== columns.length) {
    //     console.error('Invalid column name detected');
    //     return false;
    // }

    return await withOracleDB(async (connection) => {
        const query = `
                 CREATE VIEW selectedColumns AS
                 SELECT ${columns.join(', ')} 
                 FROM Adopter
                 `;

        console.log(query);
        const result = await connection.execute(
            query,
            {},
            { autoCommit: true }
        );

        console.log(result.rows);

        return true;
    }).catch(() => {
        console.error('Error executing projection from adopter');
        return false;
    });
}

async function joinDonorNamesAndItems (branch_city, branch_province) {
    console.log("inside the appService.js joinDonorNamesAndItems function");
    console.log(branch_city, branch_province);

    return await withOracleDB(async (connection) => {
        const query = `
                 SELECT donor_name, donated_item
                 FROM Donor, Donate
                 WHERE Donor.donor_ID = Donate.donor_ID AND branch_city = :branch_city 
                 AND branch_province = :branch_province
                 `;

        const result = await connection.execute(
            query,
            { branch_city, branch_province },
            { autoCommit: true }
        );

        console.log(result.rows);

        return result.rows;
    }).catch(() => {
        console.error('Error executing join between donor and donate');
        return false;
    });
}


// async function countDemotable() {
//     return await withOracleDB(async (connection) => {
//         const result = await connection.execute('SELECT Count(*) FROM DEMOTABLE');
//         return result.rows[0][0];
//     }).catch(() => {
//         return -1;
//     });
// }



async function searchAnimal(inputConditions) {
    console.log("inside searchAnimal in appService.js");
    console.log(inputConditions);

    let whereClause;
    try {
        whereClause = parseConditions(inputConditions);
        console.log(whereClause);
    } catch(err) {
        throw new Error(err.message);
    }


    return await withOracleDB(async (connection) => {

        const result1  = await connection.execute(
            `SELECT *
             FROM Animal`,
            {},
            { autoCommit: true }
        );

        console.log("Animal contains:", result1);

        const query = `
                 SELECT *
                 FROM Animal
                 WHERE ${whereClause}
                 `;

        console.log("query:", query);

        try {
            const result = await connection.execute(
                query,
                {},
                { autoCommit: true }
            );

            console.log(result.rows);

            return result.rows;
        } catch(err) {
            console.log('Query execution failed!');
            throw new Error("Query execution failed!");
        }
    }).catch(() => {
        return false;
    });
}


function parseConditions(conditionsToBeParsed) {
    const animalSchema = {
        animal_ID: "integer",
        animal_name: "string",
        breed: "string",
        age: "integer",
        admission_date: "date",
        adoption_date: "date",
        adopter_ID: "integer",
        cage_number: "integer",
        branch_city: "string",
        branch_province: "string",
    };

    const validAttributes = Object.keys(animalSchema);

    const validConditions = ["=", "<>", "<=", ">=", "!=", "<", ">"];

    const validAndOr = ["AND", "OR"];

    const parts = conditionsToBeParsed.split(/\s+/);
    let whereClause = "";
    let AndOr = false;

    for (let i =0; i < parts.length; i++) {
        const part = parts[i];

        if (!AndOr) {
            if (!validAttributes.includes(part)) {
                throw new Error("Invalid attribute name!");
            }

            const attribute = part;

            let condition = parts[++i];

            if(!validConditions.includes(condition)) {
                throw new Error("Invalid operator!");
            }

            const value = parts[++i];
            let formattedValue = value;
            if((attribute === "adoption_date" || attribute === "adopter_ID") && condition === "=" && value === "none") {
                condition = "IS";
                formattedValue = "NULL";
            } else {
                const expectedType = animalSchema[part];
                if (!isValidValue(value, expectedType) || value == null) {
                    throw new Error("Invalid value!");
                }

                if (expectedType === "string") {
                    formattedValue = `'${value.replace(/'/g, "''")}'`;
                } else if (expectedType === "date") {
                    formattedValue = `TO_DATE('${value.replace(/'/g, "''")}', 'YYYY-MM-DD')`;
                }
            }

            // if (expectedType === "string" || expectedType === "date") {
            //     if (!/^'.*'$/.test(value)) {
            //         formattedValue = `'${value.replace(/'/g, "''")}'`;
            //     }
            // }

            // if(isNaN(value)) {
            //     formattedValue =  `'${value.replace(/'/g, "''")}'`
            // } else {
            //     formattedValue = value;
            // }

            whereClause += `${attribute} ${condition} ${formattedValue}`;
            AndOr = true;
        } else {
            if(!validAndOr.includes(part)) {
                throw Error("there should be AND or OR");
            }

            whereClause += ` ${part} `;
            AndOr = false;
        }
    }
    return whereClause.trim();
}

function isValidValue(value, type) {
    if (type === "integer") {
        return typeof value === "string" && value.trim() !== "" && Number.isInteger(Number(value));
    } else if (type === "string") {
        return typeof value === "string" && value.length > 0;
    } else if (type === "date") {
        return /^\d{4}-\d{2}-\d{2}$/.test(value) && !isNaN(Date.parse(value));
    } else {
        return false;
    }
}

module.exports = {
    testOracleConnection,
    fetchDemotableFromDb,
    insertDemotable,
    updateVolunteer,
    fetchVolunteers,
    fetchAvailableRoles,
    fetchBranches,
    deleteSupplies,

    fetchDonateFromDb,
    countDonateByLocation,
    getBranchesWithHighDonations,
    getBranchesAboveAverageDonation,
    getBRanchesDonatedByAllDonors,


    initiateDemotable,
    searchAnimal,
    projectionFromAdopter,
    fetchProjectionResultFromDb,
    // joinDonorNamesAndItems


};