const express = require('express');
const appService = require('./appService');

const router = express.Router();

// ----------------------------------------------------------
// API endpoints
// Modify or extend these routes based on your project's needs.
router.get('/check-db-connection', async (req, res) => {
    const isConnect = await appService.testOracleConnection();
    if (isConnect) {
        res.send('connected');
    } else {
        res.send('unable to connect');
    }
});

router.get('/demotable', async (req, res) => {
    const tableContent = await appService.fetchDemotableFromDb();
    res.json({data: tableContent});
});

// router.post("/initiate-demotable", async (req, res) => {
//     const initiateResult = await appService.initiateDemotable();
//     if (initiateResult) {
//         res.json({ success: true });
//     } else {
//         res.status(500).json({ success: false });
//     }
// });

router.post("/insert-demotable", async (req, res) => {
    const { donorId, branchCity, branchProvince, amount } = req.body;
    console.log("Request Data:", { donorId, branchCity, branchProvince, amount });

    const insertResult = await appService.insertDemotable(donorId, branchCity, branchProvince, amount);
    if (insertResult) {
        res.json({ success: true });
    } else {
        res.status(500).json({ success: false });
    }
});

router.delete('/delete-supplies', async (req, res) => {
    try {
        const { supplyName, branchCity, branchProvince } = req.body;
        const success = await appService.deleteSupplies(supplyName, branchCity, branchProvince);

        if (success) {
            res.json({ success: true });
        } else {
            res.status(404).json({
                success: false,
                error: "Supply not found or could not be deleted"
            });
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});


router.get('/volunteers', async (req, res) => {
    const volunteers = await appService.fetchVolunteers();
    res.json(volunteers);
});

router.get('/roles', async (req, res) => {
    const roles = await appService.fetchAvailableRoles();
    res.json(roles);
});

router.get('/branches', async (req, res) => {
    const branches = await appService.fetchBranches();
    res.json(branches);
});

router.post('/update-volunteer/:id', async (req, res) => {
    try {
        const success = await appService.updateVolunteer(req.params.id, req.body);
        res.json({ success });
    } catch (error) {
        res.json({ success: false, error: error.message });
    }
});

router.get('/donate-table', async (req, res) => {
    const tableContent = await appService.fetchDonateFromDb();
    res.json({data: tableContent});
});

router.get('/donate-count-by-branch', async (req, res) => {
    const {branch_city, branch_province} = req.query;

    if (!branch_city || !branch_province) {
        return res.status(400).json({
            success: false,
            message: 'Both branch_city and branch_province are required.',
        });
    }

    try {
        const donationCount = await appService.countDonateByLocation(branch_city, branch_province);
        res.json({
            success: true,
            data: {branch_city, branch_province, donation_count: donationCount},
        });
    } catch (error) {
        console.error('Error in /donate-count-by-branch:', error.message);
        res.status(500).json({
            success: false,
            message: 'An error occurred while fetching donation counts.',
        });
    }
});

router.get('/high-donation-branches', async (req, res) => {
    try {
        const branches = await appService.getBranchesWithHighDonations();
        if (branches.length > 0) {
            res.json({
                success: true,
                data: branches,
            });
        } else {
            res.status(404).json({
                success: false,
                message: 'No branches found with donations exceeding amount 50.',
            });
        }
    } catch (error) {
        console.error('Error in /high-donation-branches:', error.message);
        res.status(500).json({
            success: false,
            message: 'An error occurred while fetching branch donations.',
        });
    }
});

router.get('/branches-above-average-donation', async (req, res) => {
    try {
        const branches = await appService.getBranchesAboveAverageDonation();

        if (branches.length > 0) {
            res.json({
                success: true,
                data: branches,
            });
        } else {
            res.status(404).json({
                success: false,
                message: 'No branches found with above-average donations.',
            });
        }
    } catch (error) {
        console.error('Error in /branches-above-average-donation:', error.message);
        res.status(500).json({
            success: false,
            message: 'An error occurred while fetching branch donations.',
        });
    }
});

router.get('/branches-donated-by-all-donors', async (req, res) => {
    try {
        const branches = await appService.getBRanchesDonatedByAllDonors();

        if (branches.length > 0) {
            res.json({
                success: true,
                data: branches,
            });
        } else {
            res.status(404).json({
                success: false,
                data: 'No branches found that all donors have donated to.',
            });
        }
    } catch (error) {
        console.error('Error in /branches-donated-by-all-donors:', error.message);
        res.status(500).json({
            success: false,
            message: 'An error occurred while fetching branches.'
        });
    }
});


//vicky code
router.get('/projectionResultTable', async (req, res) => {
    const { columns, rows} = await appService.fetchProjectionResultFromDb();
    res.json({ columns, data: rows });
});

// router.get('/joinResultTable', async (req, res) => {
//     const { columns, rows} = await appService.fetchJoinResultFromDb();
//     res.json({ columns, data: rows });
// });

router.post("/initiate-demotable", async (req, res) => {
    const initiateResult = await appService.initiateDemotable();
    if (initiateResult) {
        res.json({ success: true });
    } else {
        res.status(500).json({ success: false });
    }
});

// router.post("/insert-demotable", async (req, res) => {
//     const { donorId, branchCity, branchProvince, amount } = req.body;
//     console.log("Request Data:", { donorId, branchCity, branchProvince, amount });
//
//     const insertResult = await appService.insertDemotable(donorId, branchCity, branchProvince, amount);
//     if (insertResult) {
//         res.json({ success: true });
//     } else {
//         res.status(500).json({ success: false });
//     }
// });

router.post('/join-donorNamesAndItems', async (req, res) => {
    const { branch_city, branch_province } = req.body;
    console.log("inside controller:", branch_city, branch_province);

    const joinResult = await appService.joinDonorNamesAndItems(branch_city, branch_province);
    if (joinResult) {
        res.json({ success: true, data: joinResult });
    } else {
        res.status(500).json({ success: false });
    }
});

// router.post("/update-name-demotable", async (req, res) => {
//     const { oldName, newName } = req.body;
//     const updateResult = await appService.updateNameDemotable(oldName, newName);
//     if (updateResult) {
//         res.json({ success: true });
//     } else {
//         res.status(500).json({ success: false });
//     }
// });

// router.get('/count-demotable', async (req, res) => {
//     const tableCount = await appService.countDemotable();
//     if (tableCount >= 0) {
//         res.json({
//             success: true,
//             count: tableCount
//         });
//     } else {
//         res.status(500).json({
//             success: false,
//             count: tableCount
//         });
//     }
// });

router.post('/projection', async (req, res) => {
    const { columns } = req.body;
    console.log(columns);

    const projectionResult = await appService.projectionFromAdopter(columns);
    if (projectionResult) {
        res.json({ success: true });
    } else {
        res.status(500).json({ success: false });
    }
});

router.post('/selection-animal', async (req, res) => {
    const { conditions } = req.body;
    console.log(conditions);

    try {
        const searchResult = await appService.searchAnimal(conditions);
        if (searchResult) {
            res.json({ success: true, data: searchResult });
        } else {
            res.status(500).json({ success: false });
        }
    } catch(error) {
        const errorMessage = error instanceof Error ? error.message : "An error has occurred!";
        console.log("Error in /selection-animal route", errorMessage);
        res.status(400).json({ error: errorMessage });
    }
});



module.exports = router;