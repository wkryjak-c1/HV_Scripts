var assessmentsCsv;
var programsCsv;
var globalJson;
var globalFilteredCsv;

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

	//first filter by live course start date (e.g. march 13) based on specific cohort
	// then remove everyone with registration status of dropped or enrollment canceled, and keep Enrolled - done

	// then of these 24 enrolled learners, remove First and Last name columns if possible

	// add another option to get dropouts which is anyone = dropped or enrollment canceled, make sure the totals add up
	// they are used similarly in different ways.
	// export dropouts or export enrolled, so button does the filtering


	// Program Dates
	var courses = [
	  ["Deckhand 27", new Date("Tuesday, January 23, 2024")], // for example this should have 22 enrolled people. 
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
}

// Event listener for when the course selection changes
document.getElementById("courseSelector").addEventListener("change", function() {
	var selectedOption = this.value;
	//console.log("Selected Option",selectedOption)
	//console.log("Type of selected option:", typeof selectedOption);
	var selectedOptionDate = new Date(selectedOption); // Convert the value to a Date object

	// crazy transforms
	// Get the year, month, and day components from the Date object
	var year = selectedOptionDate.getFullYear();
	var month = selectedOptionDate.getMonth() + 1; // Months are zero-based
	var day = selectedOptionDate.getDate();

	// Calculate the number of days since epoch for the given date
	var daysSinceEpoch = Date.UTC(year, month - 1, day) / (1000 * 60 * 60 * 24);
	console.log("Days since epoch",daysSinceEpoch);
	//console.log("Year, Month, Day",year,month,day);

    // Filter JSON data based on the selected course's start date
    var filteredData = filterDataByRegistrationDate(daysSinceEpoch);
    console.log("Filtered Data by reg date", filteredData);
    filteredData = filterDataByRegistrationStatus(filteredData);
    console.log("Filtered Data by reg status", filteredData);
    //filteredData = filterDataByDropDate(filteredData);  //since we're just filtering on enrolled we shouldn't need this step (for now)
    //console.log("Filtered Data by drop date", filteredData);

    // Do something with the filtered data (e.g., display it)
    console.log("Filtered Data", filteredData);

    //convert to csv so we can use it normally
    globalFilteredCsv = jsonToCsv(filteredData); //not sure we need this if below works
    console.log("Global Filtered CSV", globalFilteredCsv);

    // Display the CSV
    var csvTableElementName = "superCsvTable";
    displayCSVSuper(filteredData, csvTableElementName);
    //createBlobAndDownload(filteredData, 'superteam_info.csv');
  
});

/*
document.getElementById('workdayFileInput').addEventListener('change', function(e) {
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
            //range.s.r = 11; // Start at row 12
            //range.s.c = 0;
            //range.e.c = 27;
            //range.e.r = 5000; //making this a big number because getting it dynamically was not working correctly

            // Extract the last row and column indices
            var lastRowIndex = range.e.r; // Last row index
            var lastColumnIndex = range.e.c;
            

            
            console.log('Last Row/Column Indices:', lastRowIndex, lastColumnIndex);
            console.log('Before modifying range:', sheet['!ref']);


           


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
*/

	

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
// There are issues with excel/unix date conversion which is why all the weird stuff
function filterDataByRegistrationDate(daysSinceEpoch) {
	//console.log("registration date for filter", registrationDate); // Displays the human readable date
    
    //var formattedRegistrationDate = new Date(registrationDate).getTime(); // Convert to milliseconds since epoch
    //var formattedRegistrationDate = new Date(registrationDate);
    
    //console.log("formatted date for filter", formattedRegistrationDate);
    //console.log("Type of selected option:", typeof formattedRegistrationDate);
    console.log("Days since epoch:",daysSinceEpoch)

    return globalJson.filter(function(item) {
        // Convert the "Registration Date" field to match the format of registrationDate for comparison
        //var itemRegistrationDate = new Date(item["Registration Date"]); // Convert to milliseconds since epoch
        console.log("Can you see me?");
        var itemRegistrationDate = excelSerialToUnix(item["Registration Date"])
        //console.log("Item Registration Date", itemRegistrationDate);
    	//console.log("Type of selected option:", typeof itemRegistrationDate);
        // Convert the "Registration Date" field from days since epoch to milliseconds since epoch
        //var daysSinceEpoch = parseFloat(item["Registration Date"]);
        var year = itemRegistrationDate.getFullYear();
		var month = itemRegistrationDate.getMonth() + 1; // Months are zero-based
		var day = itemRegistrationDate.getDate();


    	//console.log("Unix date for filter", formattedRegistrationDate);
		// Calculate the number of days since epoch for the given date
		var itemDaysSinceEpoch = Date.UTC(year, month - 1, day) / (1000 * 60 * 60 * 24);
		//console.log("Days since epoch",itemDaysSinceEpoch);
		//console.log("Year, Month, Day",year,month,day);
        //var itemRegistrationDate = new Date(daysSinceEpoch * 24 * 60 * 60 * 1000).getTime();
        //console.log("Item Registration Date",itemRegistrationDate);
        return itemDaysSinceEpoch === daysSinceEpoch;
    });
}

// for super team we need to filter out those with cancelled enrollment
function filterDataByRegistrationStatus(filteredData){
	return filteredData.filter(function(item){
		var registrationStatus = item["Registration Status"];
		return registrationStatus === 'Enrolled';
	});
}

// finally need to filter out blank Drop Dates
function filterDataByDropDate(filteredData) {
    return filteredData.filter(function(item) {
        // Check if the "Drop Date" field exists and is not null or undefined
        return item.hasOwnProperty('Drop Date') && item['Drop Date'] !== null && item['Drop Date'] !== undefined;
    });
}




/* 
function to parse and display the csv data on the page 
Also gets header information so it can be used for sorting and filtering
*/
function displayCSV(csvData, elementID) {
    var table = document.getElementById(elementID);
    table.innerHTML = ''; // Clear existing table
    csvData.forEach(function(row, index) {
        console.log("Row:", row);
        var tableRow = table.insertRow();
        row.forEach(function(cell, cellIndex) {
            var cellElement = document.createElement(index === 0 ? 'th' : 'td');
            cellElement.textContent = cell;
            tableRow.appendChild(cellElement);
        });
    });
}

function displayCSVSuper(csvData, elementID) {
    var table = document.getElementById(elementID);
    table.innerHTML = ''; // Clear existing table

    // Extract headers from the first object in the array
    var headers = Object.keys(csvData[0]);
    var headerRow = table.insertRow();
    headers.forEach(function(header) {
        var cell = headerRow.insertCell();
        cell.textContent = header;
    });

    // Iterate over each object in the array
    csvData.forEach(function(rowObj) {
        var tableRow = table.insertRow();
        headers.forEach(function(header) {
            var cell = tableRow.insertCell();
            cell.textContent = rowObj[header];
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


/* Thought maybe there were timezone issues with dates so used this to check */
function excelSerialToUnix(serialDate) {
    // Number of days between Excel base date (December 30, 1899) and Unix epoch base date (January 1, 1970)
    var excelBaseDate = new Date("1899-12-30").getTime();
    var unixBaseDate = new Date("1970-01-01").getTime();
    var daysDiff = Math.abs(unixBaseDate - excelBaseDate) / (1000 * 60 * 60 * 24);

    // Convert Excel serial date to Unix epoch format
    var unixDate = new Date((serialDate - daysDiff) * (1000 * 60 * 60 * 24));
    return unixDate;
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


function jsonToCsv(jsonData) {
    // Extract headers from the first object in the JSON array
    const headers = Object.keys(jsonData[0]);
    //console.log("Headers",headers);

    // Convert JSON data to CSV format
    const csvArray = [];
    csvArray.push(headers.join(',')); // Add header row
    console.log("CSV Array",csvArray);

    // Loop through each object in the JSON array
    jsonData.forEach(obj => {
        const values = headers.map(header => {
        	// First check if the property exists
        	if(obj.hasOwnProperty(header)){
        		// Escape double quotes and wrap values in double quotes
            	const escapedValue = obj[header].toString().replace(/"/g, '""');
            	return `"${escapedValue}"`;	
        	} else {
        		// if property doesn't exist add an empty string
        		return '""';
        	}
            
        });
        csvArray.push(values.join(','));
    });

    //return csvArray.join('\n');
    convertedCsv = csvArray.join('\n');
    
    return convertedCsv;
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


function superSave() {
	var table = document.getElementById('superCsvTable');

	// Extract the header row
	var headerRow = Array.from(table.rows[0].cells).map(function(cell) {
		return cell.textContent;
	}).join(',');

    
	// Convert sorted table back to CSV and display it
	var csvContent = Array.from(table.rows).map(function(row) {
		return Array.from(row.cells).map(function(cell) {
			return '"' + cell.textContent.replace(/[\r\n]+/g, '').replace(/"/g, '""') + '"'; // Quote and remove newline characters
		}).join(',');
	}).join('\n');

	createBlobAndDownload(csvContent, 'superteam_info.csv');
}


/* For program filtering */
function parsePrograms(){

	var dhDataCourses = getDataCourses(programsCsv,'Deckhand');
	createBlobAndDownload(dhDataCourses,'Deckhand Data Courses.csv');
    
    var bosunDataCourses = getDataCourses(programsCsv,'Bosun');
    createBlobAndDownload(bosunDataCourses,'Bosun Data Courses.csv');

    var dhCustomCourses = getCustomCourses(programsCsv,'Deckhand');
    createBlobAndDownload(dhCustomCourses,'Deckhand Custom Courses.csv');

    var bosunCustomCourses = getCustomCourses(programsCsv, 'Bosun');
    createBlobAndDownload(bosunCustomCourses,'Bosun Custom Courses.csv');

}