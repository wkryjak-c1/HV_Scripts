var assessmentsCsv;
var programsCsv;

// event listeners to get files and recognize when the file is loaded

	document.getElementById('assessmentsCsvFileInput').addEventListener('change', async function(e) {
	    
	    var csvTableElementName = "assessmentsCsvTable";
	    var file = e.target.files[0];
	    
	    if (!file) {
	        console.log("No file selected");
	        return;
	    }
	    try {
	        var csvData = await parseCsv(file);
	        displayCSV(csvData, csvTableElementName);
	        assessmentsCsv = csvData;
	    } catch (error) {
	        console.error("Error processing CSV:", error);
	    }
	});


	    // add event listener to the csvFileInput element which is the input button
    document.getElementById('coursesCsvFileInput').addEventListener('change', async function(e) {
 		
 		var csvTableElementName = "programsCsvTable";
        var file = e.target.files[0];
    
        if (!file) {
	        console.log("No file selected");
	        return;
	    }
	    try {
	        var csvData = await parseCsv(file);
	        console.log(csvData);
	        displayCSV(csvData, csvTableElementName); //works great
	        programsCsv = csvData;
	        //createBlobAndDownload(programsCsv,'testing.csv');
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

	/* function to download the filtered csv */
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



// when the file is loaded we want to display the CSV so the user can see and check it
// ideally we'd have the ability to paginate or collapse

// then we click on the export button
// this executes filtering, depending on the event listener

/* Before parsing the CSV we need to quote fields because of how they're formatted, specifically for parsing course data */

function quoteFields(csv) {
    // Split the CSV into rows
    const rows = csv.split('\n');

    // Process each row
    const quotedRows = rows.map(row => {
        // Check if the row contains quotes
        if (/"/.test(row)) {
            // Split the row into fields while preserving quoted segments
            const fields = row.match(/(?:[^",]|"(?:\\.|[^"])*")+/g);

            // Process each field
            const quotedFields = fields.map(field => {
                // Check if the field already contains quotes and trim them
                if (/^".*"$/.test(field)) {
                    return field; // Return the field unchanged
                } else {
                    // Surround the field with quotes
                    return `"${field.replace(/"/g, '""')}"`;
                }
            });

            // Reconstruct the row with properly quoted fields
            return quotedFields.join(',');
        } else {
            // If the row doesn't contain quotes, split it by commas and quote each field
            const fields = row.split(',');
            const quotedFields = fields.map(field => `"${field.replace(/"/g, '""')}"`);
            return quotedFields.join(',');
        }
    });

    // Reconstruct the CSV with properly quoted rows
    return quotedRows.join('\n');
}

function quoteArrays(filteredRows){
    var quotedRows = filteredRows.map(row => {
        return row.map(field => {
            // Check if the field contains quotes or commas
            if (/["\n,]/.test(field)) {
                // If the field contains quotes, surround it with quotes and escape existing quotes
                return '"' + field.replace(/"/g, '""') + '"';
            } else {
                // Otherwise, return the field as is
                return field;
            }
        });
    });

    // Reconstruct the CSV with properly quoted rows
    var quotedCsvContent = quotedRows.map(row => row.join(',')).join('\n');
    return quotedCsvContent;
}


function getUserCountOld(csvContent, emailIndex, assessmentIndex){
        // Preprocess data to count occurrences of UserEmail for courses other than 'Introduction to Data Literacy'
        var userEmailCounts = {};
        csvContent.split('\n').forEach(function(line, index) {
            // Skip empty lines and header row
            if (line.trim() === '' || index === 0) return;

            var values = line.split(',');
            var assessmentName = values[assessmentIndex].trim(); 
            var assessmentNameAlt = values[assessmentIndex+1].trim(); // because of commas I am checking two columns. Not elegant but works for now
            var userEmail = values[emailIndex].trim(); // Assuming the index of UserEmail column
            
            // Check if the assessment name is not 'Introduction to Data Literacy'
            if (assessmentName === 'Introduction to Data Literacy' || assessmentNameAlt === 'Introduction to Data Literacy') {
                return false;
            }
            else {
                userEmailCounts[userEmail] = (userEmailCounts[userEmail] || 0) + 1;
            }

            return userEmailCounts;
        });
    }

function getUserCount(){

}





	function parseCsv(file) {
    return new Promise((resolve, reject) => {
        // Read the file content
        const reader = new FileReader();
        reader.onload = function(event) {
            const csvContent = event.target.result;
            const quotedCsv = quoteFields(csvContent); // Quote the CSV content
            //createBlobAndDownload(quotedCsv,'testing.csv');
            Papa.parse(quotedCsv, {
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
                },
                //header: true,
                //dynamicTyping: true,
                quoteChar: '"' 
            });
        };
        reader.readAsText(file); // Start reading the file
    });
}

	function getDataCourses(csvContent, cohortType){		

		var headerRow = csvContent[0];

        if(cohortType === 'Deckhand'){
            var programFilter = 'Introduction to Data Literacy'
        }
        else if(cohortType === 'Bosun'){
            var programFilter = 'Data Science for Business'

        }

        var filteredRows = csvContent.filter(function(row,index){
			// Skip empty lines and header row
	        if (index === 0 || row.length === 0) return false;
	        var assessmentName = row[8] ? row[8].trim() : ''; // Check if assessment name exists before trimming
	        var userEmail = row[2] ? row[2].trim() : ''; // Check if reported score exists before parsing
	        var courseStatus = row[15] ? row[15].trim() : '';
	        return assessmentName === programFilter;
		});
		console.log('Get Data Courses!');
		console.log(filteredRows);

		// csv being reconstructed in the quoteArrays function
		var quotedRows = quoteArrays(filteredRows);
		
		var finalCsvContent = headerRow + '\n' + quotedRows;
		return finalCsvContent;

    }


    function getCustomCourses(csvContent, cohortType){

    	var headerRow = csvContent[0];
    	var emailCounts = {}; // object to store email counts

        if(cohortType === 'Deckhand'){
            var programFilter = 'Introduction to Data Literacy'
        }
        else if(cohortType === 'Bosun'){
            var programFilter = 'Data Science for Business'

        }

        // loop through the rows and save to variables for filtering
        var filteredRows = csvContent.filter(function(row,index){
			// Skip empty lines and header row
	        if (index === 0 || row.length === 0) return false;
	        var assessmentName = row[8] ? row[8].trim() : ''; // Right now this is the only one we use
	        var userEmail = row[2] ? row[2].trim() : ''; 
	        var courseStatus = row[15] ? row[15].trim() : '';

	        if (userEmail) {
     	   		// Increment count for this email or initialize count to 1 if it's the first occurrence
        		emailCounts[userEmail] = (emailCounts[userEmail] || 0) + 1;
    		}

	        return assessmentName !== programFilter; // and we use it here to filter
		});

		var filteredAndCompletedRows = filteredRows.filter(function(row){
			var userEmail = row[2] ? row[2].trim() : ''; 
	        var courseStatus = row[15] ? row[15].trim() : '';

	        // Return rows where emailCount is 1 or emailCount is > 1 and courseStatus is "Completed"
        	return emailCounts[userEmail] === 1 || (emailCounts[userEmail] > 1 && courseStatus === "Completed");
		});
		
		console.log(emailCounts);

		// csv being reconstructed in the quoteArrays function
		var quotedRows = quoteArrays(filteredAndCompletedRows);
		
		var finalCsvContent = headerRow + '\n' + quotedRows;
		return finalCsvContent;

    }

  

/* For assessments */

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


/* For program filtering */
function parsePrograms(){

	//var dhDataCourses = getDataCourses(programsCsv,'Deckhand');
	//createBlobAndDownload(dhDataCourses,'Deckhand Custom Courses.csv');
    //var bosunDataCourses = getDataCourses(programsCsv,'Bosun');

    var dhCustomCourses = getCustomCourses(programsCsv,'Deckhand');
    createBlobAndDownload(dhCustomCourses,'Deckhand Custom Courses.csv');

    //var bosunCustomCourses = getCustomCourses(programsCsv, 'Bosun');

}