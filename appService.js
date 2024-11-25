


// export async function updateVolunteer() {
//
// }

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

// async function insertDemotable(donorId, branchCity, branchProvince, amount) {
//     console.log("appService.js: Starting insertDemotable with params:", { donorId, branchCity, branchProvince, amount });
//     return await withOracleDB(async (connection) => {
//         console.log("appService.js: In insertDemoTable function")
//         console.log("appService.js: Will check if donorID exists or not in Donor table using SELECT now")
//
//         const donorIdCheck = await connection.execute(
//             `SELECT 1 FROM Donor WHERE donor_ID = :donorId`,
//             [donorId],
//             { autoCommit: true }
//         );
//
//         console.log("appService.js: Fetched donorID ")
//
//         if(!donorIdCheck) {
//             throw error(
//                 "A donor with this ID does not exist"
//             )
//         }
//
//         console.log("appService.js: non existant id error clause not thrown")
//         console.log("appService.js: Will check if branch city and province exists in Branch table using SELECT now")
//
//
//         const cityAndProvinceCheck = await connection.execute(
//             `SELECT 1 FROM Branch WHERE city = :branchCity AND province = :branchProvince`,
//             [branchCity, branchProvince],
//             { autoCommit: true }
//         );
//
//         console.log("appService.js: Fetched branch details")
//
//         if (cityAndProvinceCheck.rows.length === 0) {
//             throw new Error(`There is no branch in ${branchCity}, ${branchProvince}!`);
//         }
//         // if(!cityAndProvinceCheck) {
//         //     throw error(
//         //         "There is no branch in" + branchCity + ", " + branchProvince + "!"
//         //     )
//         // }
//         console.log("appService.js: Branch non existant error not thrown")
//         console.log("appService.js: Now we will try to insert the record into given DONATE table")
//
//
//         const result = await connection.execute(
//             `INSERT INTO Donate (donor_ID, branch_city, branch_province, amount) VALUES (:donorId, :branchCity, :branchProvince, :amount)`,
//             [donorId, branchCity, branchProvince, amount],
//             { autoCommit: true }
//         );
//
//         console.log("appService.js: YAYY INSERTION IS DONE!!")
//
//         return result.rowsAffected && result.rowsAffected > 0;
//     }).catch((error) => {
//         console.error(error.message);
//         return false;
//     });
// }
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
// async function updateNameDemotable(oldName, newName) {
//     console.log("appService.js: Starting update with params:", { donorId, branchCity, branchProvince, amount });
//
//     return await withOracleDB(async (connection) => {
//         const result = await connection.execute(
//             `UPDATE DEMOTABLE SET name=:newName where name=:oldName`,
//             [newName, oldName],
//             { autoCommit: true }
//         );
//
//         return result.rowsAffected && result.rowsAffected > 0;
//     }).catch(() => {
//         return false;
//     });
// }

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


        // Add volunteerId to bind values
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

async function countDemotable() {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute('SELECT Count(*) FROM DEMOTABLE');
        return result.rows[0][0];
    }).catch(() => {
        return -1;
    });
}

module.exports = {
    testOracleConnection,
    fetchDemotableFromDb,
    initiateDemotable, 
    insertDemotable, 
    // updateNameDemotable,
    countDemotable,
    updateVolunteer,
    fetchVolunteers,
    fetchAvailableRoles,
    fetchBranches,
    deleteSupplies
};