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

module.exports = router;