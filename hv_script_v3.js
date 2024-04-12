var assessmentsCsv;
var programsCsv;
var globalJson;

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


    window.onload = function(courses) {
	  var select = document.getElementById("courseSelector");

	  // Program Dates
	  var courses = [
	  ["Deckhand 27", new Date("Tuesday, January 23, 2024")],
	  ["Deckhand 28", new Date("Wednesday, February 7, 2024")],
	  ["Deckhand 29", new Date("Tuesday, February 27, 2024")],
	  ["Deckhand 30",	new Date("Friday, March 22, 2024")],
	  ["Deckhand 31",new Date(	"Tuesday, April 30, 2024")],
	  ["Deckhand 32", new Date("Tuesday, May 7, 2024")],
	  ["Deckhand 33", new Date("Thursday, July 11, 2024")],
	  ["Deckhand 34",new Date	("Tuesday, July 23, 2024")],
	  ["Deckhand 35",new Date	("Friday, August 9, 2024")],
	  ["Deckhand 36",new Date	("Wednesday, August 21, 2024")],
	  ["Deckhand 37",new Date	("Tuesday, September 10, 2024")],
	  ["Deckhand 38",new Date	("Thursday, September 19, 2024")],
	  ["Bosun 12",new Date ("Thursday, January 25, 2024")],
	  ["Bosun 13",new Date	("Friday, February 2, 2024")],
	  ["Bosun 14",new Date	("Wednesday, March 13, 2024")],
	  ["Bosun 15",new Date	("Tuesday, April 9, 2024")],
	  ["Bosun 16",new Date	("Thursday, June 6, 2024")],
	  ["Bosun 17",new Date	("Tuesday, June 18, 2024")],
	  ["Bosun 18",new Date	("Wednesday, July 31, 2024")],
	  ["Bosun 19",new Date	("Wednesday, August 7, 2024")],
	  ["Bosun 20",new Date	("Thursday, August 1, 2024")],
	  ["Bosun 21",new Date	("Wednesday, September 11, 2024")],
	  ["First Mate 1",new Date(	"Wednesday, February 14, 2024")],
	  ["First Mate 2",new Date(	"Thursday, May 23, 2024")],
	  ["First Mate 3",new Date(	"Tuesday, September 3, 2024")]
	  ];

		// Populate select element
	  courses.forEach(course => {
	    var option = document.createElement("option");
	    option.value = course[1];
	    option.textContent = course[0];
	    select.appendChild(option);
	  });

	  // Event listener for when the course selection changes
	  document.getElementById("courseSelector").addEventListener("change", function() {
	    var selectedOption = this.value;

	    // Filter JSON data based on the selected course's start date
	    var filteredData = filterDataByRegistrationDate(selectedOption);

	    // Do something with the filtered data (e.g., display it)
	    console.log(filteredData);
	  });

	};

	


   document.getElementById('superCsvFileInput').addEventListener('change', function(e) {
    var file = e.target.files[0];
    var reader = new FileReader();
    
    reader.onload = function(e) {
        try {
            var data = new Uint8Array(e.target.result);
            var workbook = XLSX.read(data, { type: 'array' });
            var sheetName = workbook.SheetNames[0];
            var sheet = workbook.Sheets[sheetName];

            // Modify the range to start from row 12
            var range = XLSX.utils.decode_range(sheet['!ref']);
            console.log(range);
            range.s.r = 11; // Start at row 12
            range.s.c = 0;
            range.e.c = 27;
            range.e.r = 5000; //making this a big number because getting it dynamically was not working correctly

            // Extract the last row and column indices
            var lastRowIndex = range.e.r; // Last row index
            var lastColumnIndex = range.e.c;
            

            
            console.log('Last Row/Column Indices:', lastRowIndex, lastColumnIndex);
            console.log('Before modifying range:', sheet['!ref']);


            // Modify the range to start from row 12 and extend to the last populated cell
            var rangeString = 'A12:' + XLSX.utils.encode_cell({ r: lastRowIndex, c: lastColumnIndex });
            sheet['!ref'] = rangeString;
            // Modify the range here
			console.log('After modifying range:', sheet['!ref']);


            // Convert the modified sheet to JSON
            var jsonData = XLSX.utils.sheet_to_json(sheet);
            console.log(jsonData);
            globalJson = jsonData;

            




        } catch (error) {
            console.error('Error parsing Excel file:', error);
        }
    };

    reader.onerror = function(event) {
        console.error('Error reading file:', event.target.error);
    };

    reader.readAsArrayBuffer(file);

});

/*
Before graduation of the cohort, and midpoint, always quality checks on Super Team.
First have to remove rows then filter by start date of the cohort. Start dates come from program dates file/sheet.
Let’s say it’s may 7th, filter by column U and may 7th. Then filter out blanks in drop date. Then filter out any Registration Status = canceled.
Then copy preferred name and email and AA and AB to copy into the participant tracker.
Dropdown for cohort or course type (bosun or deckhand) because they do them one at a time sometimes. 
Verify for graduation — do the 3 steps then copy the managers off the newest version of the report. 
*/

// Function to filter JSON objects based on registration date
function filterDataByRegistrationDate(registrationDate) {
	console.log("registration date for filter", registrationDate);
    // Convert the registrationDate to match the format of the "Registration Date" field in your JSON data
    var formattedRegistrationDate = new Date(registrationDate).getTime(); // Convert to milliseconds since epoch
    console.log("formatted date for filter", formattedRegistrationDate);
    return globalJson.filter(function(item) {
        // Convert the "Registration Date" field to match the format of registrationDate for comparison
        var itemRegistrationDate = new Date(item["Registration Date"]).getTime(); // Convert to milliseconds since epoch
        return itemRegistrationDate === formattedRegistrationDate;
    });
}

/* Leaving off here...need to get the dates to match up */



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