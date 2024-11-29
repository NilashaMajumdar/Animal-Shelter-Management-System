/*
 * These functions below are for various webpage functionalities. 
 * Each function serves to process data on the frontend:
 *      - Before sending requests to the backend.
 *      - After receiving responses from the backend.
 * 
 * To tailor them to your specific needs,
 * adjust or expand these functions to match both your 
 *   backend endpoints 
 * and 
 *   HTML structure.
 * 
 */

async function fetchAndDisplayVolunteers() {
    const tableBody = document.getElementById('volunteerTableBody');
    const response = await fetch('/volunteers');
    const volunteers = await response.json();

    tableBody.innerHTML = '';
    volunteers.forEach(volunteer => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${volunteer[0]}</td>
            <td>${volunteer[1]}</td>
            <td>${volunteer[2]}</td>
            <td>${volunteer[3]}</td>
            <td>${volunteer[4]}</td>
            <td>${volunteer[5]}</td>
            <td>
                <button onclick="prepareUpdateForm(${volunteer[0]})">Update</button>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

async function setupDeleteSuppliesForm() {
    const citySelect = document.getElementById('deleteBranchCity');
    const provinceSelect = document.getElementById('deleteBranchProvince');

    const branchResponse = await fetch('/branches');
    const branches = await branchResponse.json();

    const branchMap = new Map();
    branches.forEach(([city, province]) => {
        if (!branchMap.has(city)) {
            branchMap.set(city, new Set());
        }
        branchMap.get(city).add(province);
    });

    [...branchMap.keys()].forEach(city => {
        const option = document.createElement('option');
        option.value = city;
        option.textContent = city;
        citySelect.appendChild(option);
    });

    // Update provinces when city changes
    citySelect.addEventListener('change', () => {
        const selectedCity = citySelect.value;
        provinceSelect.innerHTML = '<option value="">Select Province</option>';
        if (selectedCity && branchMap.has(selectedCity)) {
            [...branchMap.get(selectedCity)].forEach(province => {
                const option = document.createElement('option');
                option.value = province;
                option.textContent = province;
                provinceSelect.appendChild(option);
            });
        }
    });
}

async function deleteSupplies(event) {
    event.preventDefault();

    const supplyName = document.getElementById('supplyName').value;
    const branchCity = document.getElementById('deleteBranchCity').value;
    const branchProvince = document.getElementById('deleteBranchProvince').value;

    try {
        const response = await fetch('/delete-supplies', {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                supplyName,
                branchCity,
                branchProvince
            })
        });

        const responseData = await response.json();
        const messageElement = document.getElementById('deleteResultMsg');

        if (responseData.success) {
            messageElement.textContent = "Supply deleted successfully!";
            // Clear the form
            event.target.reset();
        } else {
            messageElement.textContent = "Error deleting supply: " + (responseData.error || "Unknown error");
        }
    } catch (error) {
        console.error('Error:', error);
        document.getElementById('deleteResultMsg').textContent = "Error deleting supply: " + error.message;
    }
}

async function loadFormDropdowns() {
    // Load roles
    const roleResponse = await fetch('/roles');
    const roles = await roleResponse.json();
    const roleSelect = document.getElementById('updateVolunteerRole');
    roles.forEach(role => {
        const option = document.createElement('option');
        option.value = role[0];
        option.textContent = role[0];
        roleSelect.appendChild(option);
    });

    // loads all the branches so far
    const branchResponse = await fetch('/branches');
    const branches = await branchResponse.json();
    const citySelect = document.getElementById('updateBranchCity');
    const provinceSelect = document.getElementById('updateBranchProvince');

    const branchMap = new Map();
    branches.forEach(([city, province]) => {
        if (!branchMap.has(city)) {
            branchMap.set(city, new Set());
        }
        branchMap.get(city).add(province);
    });

    [...branchMap.keys()].forEach(city => {
        const option = document.createElement('option');
        option.value = city;
        option.textContent = city;
        citySelect.appendChild(option);
    });

    citySelect.addEventListener('change', () => {
        const selectedCity = citySelect.value;
        provinceSelect.innerHTML = '<option value="">Select Province</option>';
        if (selectedCity && branchMap.has(selectedCity)) {
            [...branchMap.get(selectedCity)].forEach(province => {
                const option = document.createElement('option');
                option.value = province;
                option.textContent = province;
                provinceSelect.appendChild(option);
            });
        }
    });
}
async function prepareUpdateForm(volunteerId) {
    const updateForm = document.getElementById('updateVolunteerForm');
    updateForm.style.display = 'block';
    updateForm.dataset.volunteerId = volunteerId;

    // Clear previous values
    document.getElementById('updateVolunteerName').value = '';
    document.getElementById('updateVolunteerRole').value = '';
    document.getElementById('updateStartedDate').value = '';
    document.getElementById('updateBranchCity').value = '';
    document.getElementById('updateBranchProvince').value = '';
}

// This function checks the database connection and updates its status on the frontend.
async function checkDbConnection() {
    const statusElem = document.getElementById('dbStatus');
    const loadingGifElem = document.getElementById('loadingGif');

    const response = await fetch('/check-db-connection', {
        method: "GET"
    });

    // Hide the loading GIF once the response is received.
    loadingGifElem.style.display = 'none';
    // Display the statusElem's text in the placeholder.
    statusElem.style.display = 'inline';

    response.text()
    .then((text) => {
        statusElem.textContent = text;
    })
    .catch((error) => {
        statusElem.textContent = 'connection timed out';  // Adjust error handling if required.
    });
}

// Fetches data from the demotable and displays it.
async function fetchAndDisplayUsers() {
    const tableElement = document.getElementById('demotable');
    const tableBody = tableElement.querySelector('tbody');

    const response = await fetch('/demotable', {
        method: 'GET'
    });

    const responseData = await response.json();
    const demotableContent = responseData.data;

    // Always clear old, already fetched data before new fetching process.
    if (tableBody) {
        tableBody.innerHTML = '';
    }

    demotableContent.forEach(user => {
        const row = tableBody.insertRow();
        user.forEach((field, index) => {
            const cell = row.insertCell(index);
            cell.textContent = field;
        });
    });
}


async function insertDemotable(event) {
    event.preventDefault();

    console.log("scripts.js: starting insertDemoTable")
    console.log("hope git saves")


    const donorId = document.getElementById('insertId').value;
    const branchCity = document.getElementById('branchCity').value;
    const branchProvince = document.getElementById('branchProvince').value;
    const amount = document.getElementById('donatedAmount').value;

    console.log("scripts.js: fetched all the values")
    console.log("scripts.js: awaiting fetch after this statement")
    const payload = {
        donorId,
        branchCity,
        branchProvince,
        amount
    };
    console.log(payload)

    const response = await fetch('/insert-demotable', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            donorId: donorId,
            branchCity: branchCity,
            branchProvince: branchProvince,
            amount: amount
        })
    });
    console.log("fetched!!")
    const messageElement = document.getElementById('insertResultMsg');
    try {
        const responseData = await response.json();

        if (responseData.success) {
            messageElement.textContent = "Data inserted successfully! yay";
            // fetchTableData();
        } else {
            messageElement.textContent = "Error inserting data!";
        }
    } catch (error) {
        console.error('Error parsing response:', error);
        messageElement.textContent = "Error processing server response";
    }
}

    // const responseText = await response.text();
    // console.log("scripts.js: Response body:", responseText);


//     try {
//         const responseData = await response.json();
//     } catch (err) {
//
//     }
//     // const messageElement = document.getElementById('insertResultMsg');
//
//     if (responseData.success) {
//         messageElement.textContent = "Data inserted successfully! yay";
//         fetchTableData();
//     } else {
//         messageElement.textContent = "Error inserting data!";
//     }
// }
async function updateVolunteer(event) {
    console.log("script.js: In updateVolunteer function now")

    event.preventDefault();
    const form = event.target;
    const volunteerId = form.dataset.volunteerId;

    const updates = {
        volunteer_name: document.getElementById('updateVolunteerName').value,
        volunteer_role: document.getElementById('updateVolunteerRole').value,
        started_date: document.getElementById('updateStartedDate').value,
        branch_city: document.getElementById('updateBranchCity').value,
        branch_province: document.getElementById('updateBranchProvince').value
    };
    console.log("script.js: Fetched all updating values")
    console.log(updates)
    
    
    // remove empty fields
    Object.keys(updates).forEach(key => {
        if (!updates[key]) delete updates[key];
    });

    console.log("script.js: Gonna try fetch after this state")


    try {
        console.log("script.js: in try clause Gonna try fetch")

        const response = await fetch(`/update-volunteer/${volunteerId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(updates)
        });

        console.log("script.js: fetched!!")

        const result = await response.json();
        console.log(result)

        if (result.success) {
            alert('Volunteer updated successfully!');
            form.style.display = 'none';
            fetchAndDisplayVolunteers();
        } else {
            alert('Error updating volunteer: ' + result.error);
        }
    } catch (error) {
        alert('Error updating volunteer: ' + error.message);
    }
}

async function fetchDonateTable() {
    const tableElement = document.getElementById('donate-table');
    const tableBody = tableElement.querySelector('tbody');

    const response = await fetch('/donate-table', {
        method: 'GET'
    });

    const responseData = await response.json();
    const donatetableContent = responseData.data;

    // Always clear old, already fetched data before new fetching process.
    if (tableBody) {
        tableBody.innerHTML = '';
    }

    donatetableContent.forEach(user => {
        const row = tableBody.insertRow();
        user.forEach((field, index) => {
            const cell = row.insertCell(index);
            cell.textContent = field;
        });
    });
}

async function getDonationCount() {
    const branchCity = document.getElementById('branch_city').value.trim();
    const branchProvince = document.getElementById('branch_province').value.trim();
    const resultDiv = document.getElementById('donationResult');

    if (!branchCity || !branchProvince) {
        resultDiv.textContent = 'Both branch city and province are required.';
        resultDiv.style.color = 'red';
        return;
    }

    try {
        const response = await fetch(`/donate-count-by-branch?branch_city=${branchCity}&branch_province=${branchProvince}`);
        const data = await response.json();

        if (data.success) {
            const count = data.data.donation_count;
            resultDiv.textContent = `Donation count for ${branchCity}, ${branchProvince}: ${count}`;
        } else {
            resultDiv.textContent = data.message;
            resultDiv.style.color = 'red';
        }
    } catch (error) {
        console.error('Error fetching donation count:', error);
        resultDiv.textContent = 'Failed to fetch donation count. Please try again later.';
        resultDiv.style.color = 'red';
    }
}


async function getHighDonationBranches() {
    const resultDiv = document.getElementById('branchDonationResult');

    try {
        const response = await fetch('/high-donation-branches');
        const data = await response.json();

        if (data.success) {
            const branches = data.data;
            if (branches.length > 0) {
                const resultHtml = branches.map(
                    ([branch_city, branch_province, total_donation]) =>
                        `<li>${branch_city}, ${branch_province} - Total Donations: ${total_donation}</li>`
                ).join('');
                resultDiv.innerHTML = `<ul>${resultHtml}</ul>`;
            } else {
                resultDiv.textContent = 'No branches found with donations exceeding amount 50.';
                resultDiv.style.color = 'red';
            }
        } else {
            resultDiv.textContent = data.message || 'An error occurred.';
            resultDiv.style.color = 'red';
        }
    } catch (error) {
        console.error('Error fetching high donation branches:', error);
        resultDiv.textContent = 'Failed to fetch high donation branches. Please try again later.';
        resultDiv.style.color = 'red';
    }
}

// Fetches branches with above-average donations.
async function getBranchesAboveAverageDonation() {
    const resultDiv = document.getElementById('averageDonationResult');

    try {
        const response = await fetch('/branches-above-average-donation');
        const data = await response.json();

        if (data.success) {
            const branches = data.data;
            if (branches.length > 0) {
                const resultHtml = branches.map(
                    ([branch_city, branch_province, avg_donation]) =>
                        `<li>${branch_city}, ${branch_province} - Average Donation: ${avg_donation.toFixed(2)}</li>`
                ).join('');
                resultDiv.innerHTML = `<ul>${resultHtml}</ul>`;
            } else {
                resultDiv.textContent = 'No branches found with above-average donations.';
                resultDiv.style.color = 'red';
            }
        } else {
            resultDiv.textContent = data.message || 'An error occurred.';
            resultDiv.style.color = 'red';
        }
    } catch (error) {
        console.error('Error fetching branches with above-average donations:', error);
        resultDiv.textContent = 'Failed to fetch data. Please try again later.';
        resultDiv.style.color = 'red';
    }
}

// Fetches branches that have received donations from all donors.
async function getBranchesDonatedByAllDonors() {
    const resultDiv = document.getElementById('allDonorsBranchResult');

    try {
        const response = await fetch('/branches-donated-by-all-donors');
        const data = await response.json();

        if (data.success) {
            const branches = data.data;
            if (branches.length > 0) {
                const resultHtml = branches.map(
                    ([branch_city, branch_province]) =>
                        `<li>${branch_city}, ${branch_province}</li>`
                ).join('');
                resultDiv.innerHTML = `<ul>Branches donated by all donors:<br>${resultHtml}</ul>`;
                resultDiv.style.color = 'black';
            } else {
                resultDiv.textContent = 'No branches found that all donors have donated to.';
                resultDiv.style.color = 'red';
            }
        } else {
            resultDiv.textContent = data.message || 'No branches found.';
            resultDiv.style.color = 'red';
        }
    } catch (error) {
        console.error('Error fetching branches donated by all donors:', error);
        resultDiv.textContent = 'Failed to fetch data. Please try again later.';
        resultDiv.style.color = 'red';
    }
}


//Vicky code
// Fetches data from the Adopter table and displays it.
async function fetchAndDisplayProjectionResults() {
    const tableElement = document.getElementById('projectionResultTable');
    const tableHead = tableElement.querySelector('thead');
    const tableBody = tableElement.querySelector('tbody');

    const response = await fetch('/projectionResultTable', {
        method: 'GET'
    });

    const responseData = await response.json();
    const { columns, data } = responseData;

    console.log("Rendering table dynamically");

    // Always clear old, already fetched data before new fetching process.
    if (tableHead) {
        tableHead.innerHTML = '';
    }

    if (tableBody) {
        tableBody.innerHTML = '';
    }

    const headerRow = tableHead.insertRow();
    columns.forEach(column => {
        const headerCell = document.createElement('th');
        headerCell.textContent = column;
        headerRow.appendChild(headerCell);
    });

    data.forEach(row => {
        const tableRow = tableBody.insertRow();
        row.forEach((cellData, index) => {
            const cell = tableRow.insertCell(index);
            cell.textContent = cellData;
        });
    });
    console.log("table has been made successfully!");
}

async function projectionFromAdopter(event) {
    event.preventDefault();

    const checkboxes = document.querySelectorAll('input[name="adopter"]:checked');

    const selectedValues = Array.from(checkboxes).map(checkbox => checkbox.value);

    console.log(selectedValues);

    const response = await fetch('/projection', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            columns: selectedValues
        })
    });

    const messageElement = document.getElementById('projectionResultMsg');
    const responseData = await response.json();
    fetchTableData();

    if (responseData.success) {
        messageElement.textContent = "success!";
    } else {
        messageElement.textContent = "Error performing projection!";
    }
}

async function joinDonorNamesAndItems(event) {
    event.preventDefault();

    const cityValue = document.getElementById('brCity').value;
    const provinceValue = document.getElementById('brProvince').value;

    const messageElement = document.getElementById('joinResultMsg');

    console.log(cityValue);
    console.log(provinceValue);

    const tableElement = document.getElementById('joinResultTable');
    const tableBody = tableElement.querySelector('tbody');

    try {
        const response = await fetch('/join-donorNamesAndItems', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                branch_city: cityValue,
                branch_province: provinceValue
            })
        });

        const responseData = await response.json();
        const tableContent = responseData.data;


        console.log("tableContent:", tableContent);

        if (tableBody) {
            tableBody.innerHTML = '';
        }

        tableContent.forEach(user => {
            const row = tableBody.insertRow();
            user.forEach((field, index) => {
                const cell = row.insertCell(index);
                cell.textContent = field;
            });
        });

        if (tableContent.length === 0) {
            messageElement.textContent = `No rows found`;
        } else if (responseData.success) {
            messageElement.textContent = `success!`;
        } else {
            alert("error");
        }
    } catch(error) {
        messageElement.textContent = `Invalid names!`;
    }
}


function openAnimalSearchPage() {
    window.location.href = "animalSearch.html";
}
function fetchTableData() {
    fetchAndDisplayProjectionResults();
}



// ---------------------------------------------------------------
// Initializes the webpage functionalities.
// Add or remove event listeners based on the desired functionalities.
window.onload = async function() {
    try {
        console.log("starting window function now")
        await checkDbConnection();

        document.getElementById("openAnimalSearchPage").addEventListener("click", openAnimalSearchPage);
        document.getElementById("projectionButton").addEventListener("click", projectionFromAdopter);
        document.getElementById("inputForJoin").addEventListener("submit", joinDonorNamesAndItems);

        await fetchAndDisplayVolunteers();
        console.log("fetched and displayed volunteers!")

        document.getElementById("insertDemotable").addEventListener("submit", insertDemotable);
        await loadFormDropdowns();
        console.log("loaded form dropdowns!")
        document.getElementById('updateVolunteerForm').addEventListener('submit', updateVolunteer);
        document.getElementById('deleteSuppliesForm').addEventListener('submit', deleteSupplies);
        setupDeleteSuppliesForm();

        // //Wendy code
        fetchDonateTable();
        document.getElementById("updateDonateTable").addEventListener("click", fetchDonateTable);
        document.getElementById("donationCountFrom").addEventListener("submit", getDonationCount);
        document.getElementById("donationHigh").addEventListener("submit", getHighDonationBranches);
        document.getElementById("aboveAverage").addEventListener("submit", getBranchesAboveAverageDonation);
        document.getElementById("donatedByAllDonor").addEventListener("submit", getBranchesDonatedByAllDonors);


        //Vicky code

    } catch (error) {
        console.error("Initialization error:", error);

    }

};

// General function to refresh the displayed table data. 
// You can invoke this after any table-modifying operation to keep consistency.
// function fetchTableData() {
//     // fetchAndDisplayUsers();
// }

