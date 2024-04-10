var assessmentsCsv;

// event listeners to get files and recognize when the file is loaded

	document.getElementById('assessmentsCsvFileInput').addEventListener('change', async function(e) {
	    var csvTableElementName = "assessmentsCsvTable";
	    var file = e.target.files[0];
	    if (!file) {
	        console.log("No file selected");
	        return;
	    }
	    try {
	        var csvData = await filterAndParseCsv(file);
	        displayCSV(csvData, csvTableElementName);
	        assessmentsCsv = csvData;
	    } catch (error) {
	        console.error("Error processing CSV:", error);
	    }
	});

   /* 
    function to parse and display the csv data on the page 
    Also gets header information so it can be used for sorting and filtering
    */
    function displayCSV(csvData, elementID) {
	    var table = document.getElementById(elementID);
	    table.innerHTML = ''; // Clear existing table
	    csvData.forEach(function(row, index) {
	        var tableRow = table.insertRow();
	        row.forEach(function(cell, cellIndex) {
	            var cellElement = document.createElement(index === 0 ? 'th' : 'td');
	            cellElement.textContent = cell;
	            tableRow.appendChild(cellElement);
	        });
	    });
	}



// when the file is loaded we want to display the CSV so the user can see and check it
// ideally we'd have the ability to paginate or collapse

// then we click on the export button
// this executes filtering, depending on the event listener
	function filterAndParseCsv(file) {
	    return new Promise((resolve, reject) => {
	        Papa.parse(file, {
	            complete: function(results) {
	                if (results.errors.length > 0) {
	                    console.error("CSV parsing error:", results.errors);
	                    reject("CSV parsing error");
	                    return;
	                }
	                if (!results.data || results.data.length === 0) {
	                    console.log("Empty CSV content");
	                    resolve([]);
	                    return;
	                }
	                resolve(results.data);
	            },
	            error: function(error) {
	                console.error("Error parsing CSV:", error);
	                reject("Error parsing CSV");
	            }
	        });
	    });
	}

function createBlobAndDownload(finalCsvContent, filename){
        // Create a blob from the filtered CSV content
        var blob = new Blob([finalCsvContent], { type: 'text/csv' });

        // Create a link element to trigger the download
        var link = document.createElement('a');
        link.href = window.URL.createObjectURL(blob);
        link.download = filename;

        // Append link to the document body
        document.body.appendChild(link);

        // Trigger the download
        link.click();

        // Clean up: Remove the link from the document body
        document.body.removeChild(link);

    }

// then exports the file(s) to the users computer
function filterAndSave(){
	var headerRow = assessmentsCsv[0];
	var filteredRows = assessmentsCsv.filter(function(row,index){
		// Skip empty lines and header row
        if (index === 0 || row.length === 0) return false;
        var assessmentName = row[3] ? row[3].trim() : ''; // Check if assessment name exists before trimming
        var reportedScore = row[7] ? parseInt(row[7]) : NaN; // Check if reported score exists before parsing
        return assessmentName === 'Analytic Fundamentals' && reportedScore > 130; // want scores of 131 or higher
	});
	var filteredCsvContent = filteredRows.map(row => row.join(',')).join('\n');
	var finalCsvContent = headerRow + '\n' + filteredCsvContent;
	console.log(finalCsvContent);
	createBlobAndDownload(finalCsvContent, 'high_assessment_scores.csv');
}