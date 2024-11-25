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

module.exports = router;