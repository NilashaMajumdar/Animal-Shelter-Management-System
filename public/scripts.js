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

    // Populate city dropdown
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

// This function resets or initializes the demotable.
async function resetDemotable() {
    const response = await fetch("/initiate-demotable", {
        method: 'POST'
    });
    const responseData = await response.json();

    if (responseData.success) {
        const messageElement = document.getElementById('resetResultMsg');
        messageElement.textContent = "demotable initiated successfully!";
        fetchTableData();
    } else {
        alert("Error initiating table!");
    }
}

// Inserts new records into the demotable.
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
    const responseText = await response.text();
    console.log("scripts.js: Response body:", responseText);

    const responseData = await response.json();
    const messageElement = document.getElementById('insertResultMsg');

    if (responseData.success) {
        messageElement.textContent = "Data inserted successfully! yay";
        fetchTableData();
    } else {
        messageElement.textContent = "Error inserting data!";
    }
}
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
    
    
    // Remove empty fields
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

// // Updates names in the demotable.
// async function updateNameDemotable(event) {
//     event.preventDefault();
//
//     const oldNameValue = document.getElementById('updateOldName').value;
//     const newNameValue = document.getElementById('updateNewName').value;
//
//     const response = await fetch('/update-name-demotable', {
//         method: 'POST',
//         headers: {
//             'Content-Type': 'application/json'
//         },
//         body: JSON.stringify({
//             oldName: oldNameValue,
//             newName: newNameValue
//         })
//     });
//
//     const responseData = await response.json();
//     const messageElement = document.getElementById('updateNameResultMsg');
//
//     if (responseData.success) {
//         messageElement.textContent = "Name updated successfully!";
//         fetchTableData();
//     } else {
//         messageElement.textContent = "Error updating name!";
//     }
// }

// Counts rows in the demotable.
// Modify the function accordingly if using different aggregate functions or procedures.
async function countDemotable() {
    const response = await fetch("/count-demotable", {
        method: 'GET'
    });

    const responseData = await response.json();
    const messageElement = document.getElementById('countResultMsg');

    if (responseData.success) {
        const tupleCount = responseData.count;
        messageElement.textContent = `The number of tuples in demotable: ${tupleCount}`;
    } else {
        alert("Error in count demotable!");
    }
}

async function searchAnimal() {
    const response = await fetch("/selection-animal", {
        method: 'GET'
    });

    const responseData = await response.json();
    const messageElement = document.getElementById('countResultMsg');

    if (responseData.success) {
        const tupleCount = responseData.count;
        messageElement.textContent = `The number of tuples in demotable: ${tupleCount}`;
    } else {
        alert("Error in count demotable!");
    }
}

function openAnimalSearchPage() {
    window.location.href = "animalSearch.html";
}


// ---------------------------------------------------------------
// Initializes the webpage functionalities.
// Add or remove event listeners based on the desired functionalities.
window.onload = function() {
    checkDbConnection();
    fetchTableData();
    // document.getElementById("resetDemotable").addEventListener("click", resetDemotable);
    document.getElementById("insertDemotable").addEventListener("submit", insertDemotable);
    // document.getElementById("updataNameDemotable").addEventListener("submit", updateNameDemotable);
    // document.getElementById("countDemotable").addEventListener("click", countDemotable);
    // document.getElementById("openAnimalSearchPage").addEventListener("click", openAnimalSearchPage);
    fetchAndDisplayVolunteers();
    console.log("fetched and displayed volunteers!")
    loadFormDropdowns();
    console.log("loaded form dropdowns!")
    document.getElementById('updateVolunteerForm').addEventListener('submit', updateVolunteer);
};

// General function to refresh the displayed table data. 
// You can invoke this after any table-modifying operation to keep consistency.
function fetchTableData() {
    fetchAndDisplayUsers();
}
