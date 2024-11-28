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

// Fetches data from the view of the selected results and displays it.
// async function fetchAndDisplaySearchResults() {
//     const tableElement = document.getElementById('searchResultTable');
//     const tableBody = tableElement.querySelector('tbody');
//
//     const response = await fetch('/searchResultTable', {
//         method: 'GET'
//     });
//
//     const responseData = await response.json();
//     const selectionResult = responseData.data;
//
//     // Always clear old, already fetched data before new fetching process.
//     if (tableBody) {
//         tableBody.innerHTML = '';
//     }
//
//     selectionResult.forEach(user => {
//         const row = tableBody.insertRow();
//         user.forEach((field, index) => {
//             const cell = row.insertCell(index);
//             cell.textContent = field;
//         });
//     });
// }

// handle searching function
async function searchAnimal(event) {
    event.preventDefault();

    const conditions = document.getElementById('searchConditions').value;
    const messageElement = document.getElementById('searchResultMsg');

    const tableElement = document.getElementById('searchResultTable');
    const tableBody = tableElement.querySelector('tbody');

    console.log(conditions);

    try {
        const response = await fetch('/selection-animal', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                conditions: conditions
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
        messageElement.textContent = `Invalid conditions!`;
    }
}

function backToPreviousPage() {
    window.history.back();
}



// ---------------------------------------------------------------
// Initializes the webpage functionalities.
// Add or remove event listeners based on the desired functionalities.
window.onload = function() {
    checkDbConnection();
    document.getElementById("animalSearch").addEventListener("submit", searchAnimal);
    document.getElementById("backButton").addEventListener("click", backToPreviousPage);
};

// General function to refresh the displayed table data. 
// You can invoke this after any table-modifying operation to keep consistency.
// function fetchTableData() {
//     fetchAndDisplaySearchResults();
// }