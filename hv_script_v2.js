 // initialize variable to save CSV header names
    var headers = [];

    /*
    Event listener for when the CSV is loaded

    */
    // add event listener to the csvFileInput element which is the input button
    document.getElementById('assessmentsCsvFileInput').addEventListener('change', function(e) {
        
        csvTableElementName = "assessmentsCsvTable";
        //Inside the event listener function, this line retrieves the selected file from the event object (e). 
        //The files property of the file input element contains an array of selected files, and [0] selects the first file in the array.
        var file = e.target.files[0];
        console.log('csv file input debug');

        // if there is no file, break
        if (!file) {
            console.log("No file");
            return;
        }
        
        var reader = getCsvText(e, csvTableElementName);
        
        //This line initiates reading the selected file as text using the readAsText() method of the FileReader object. 
        //This asynchronous operation triggers the load event once the file content has been read successfully.
        reader.readAsText(file);
    });

    // add event listener to the csvFileInput element which is the input button
    document.getElementById('coursesCsvFileInput').addEventListener('change', function(e) {
        

        csvTableElementName = "programsCsvTable";
        //Inside the event listener function, this line retrieves the selected file from the event object (e). 
        //The files property of the file input element contains an array of selected files, and [0] selects the first file in the array.
        var file = e.target.files[0];
        console.log('csv file input debug');

        // if there is no file, break
        if (!file) {
            console.log("No file");
            return;
        }        

        var reader = getCsvText(e, csvTableElementName);
        
        //This line initiates reading the selected file as text using the readAsText() method of the FileReader object. 
        //This asynchronous operation triggers the load event once the file content has been read successfully.
        reader.readAsText(file);
        
    });

    function getCsvText(e, elementName){
        //Inside the event listener function, this line retrieves the selected file from the event object (e). 
        //The files property of the file input element contains an array of selected files, and [0] selects the first file in the array.
        var file = e.target.files[0];
        console.log('Read and Display CSV');
        
                
        // create a new FileReader object
        // FileReader is a built in js object that allows for reading files async
        var reader = new FileReader();
        
        //This line sets up an event handler for when the file has been successfully loaded. 
        //It defines a function to be executed when the load event occurs, which happens when the file content is fully loaded.
        reader.onload = function(e) {
            //The result property of the FileReader object contains the file content as a data URL or text, depending on how the file was read.
            var contents = e.target.result;
            
            // call displayCSV method on the contents (csv text in this case)
            displayCSV(contents,elementName);
        };
        

        return reader;

    }


    /* 
    function to parse and display the csv data on the page 
    Also gets header information so it can be used for sorting and filtering
    */
    function displayCSV(csv, elementID) {
        
        var lines = csv.split('\n');
        var table = document.getElementById(elementID);
        
        table.innerHTML = ''; // Clear existing table
        
        // take the first element of the lines array (which is the first row of the csv) and split by comma, breaking out the headers
        headers = lines[0].split(',');
        lines.forEach(function(line, index) {
            var row = table.insertRow();
            //console.log(row, index);
            line.split(',').forEach(function(cell, cellIndex) {
                var cellElement = document.createElement(index === 0 ? 'th' : 'td');
                cellElement.textContent = cell;
                
                row.appendChild(cellElement);
            });
        });
    }

    function getCsvHeader(table){
        // Extract the header row
        console.log(table);
        var headerRow = Array.from(table.rows[0].cells).map(function(cell) {
            
            return cell.textContent;

        }).join(',');

        return headerRow;
    }

    function getCsvContent(table){
        // Convert sorted table back to CSV and display it
        var csvContent = Array.from(table.rows).map(function(row) {
            return Array.from(row.cells).map(function(cell) {
                return cell.textContent;
            }).join(',');
        }).join('\n');

        return csvContent;
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

    function getUserCount(csvContent, emailIndex, assessmentIndex){
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


    /* Function to filter the high assessment scores and save them to a new file */
    function filterAndSave() {
        var table = document.getElementById('assessmentsCsvTable');
        
        var headerRow = getCsvHeader(table);

        var csvContent = getCsvContent(table);


        
        // Filter on 'Assessment Name' == 'Analytic Fundamentals' and 'Reported Score' >= 130
        var filteredCsvContent = csvContent.split('\n').filter(function(line, index) {
            
            // skip empty lines
            if (line.trim() === '') return false;

            // Skip header row
            if (index === 0) return false;

            var values = line.split(',');
            console.log(values);
            var assessmentName = values[3].trim(); // Assuming 'Assessment Name' is the fourth column
            var reportedScore = parseInt(values[7]); // Assuming 'Reported Score' is the eighth column
            return assessmentName === 'Analytic Fundamentals' && reportedScore > 130; // want scores of 131 or higher
        }).join('\n');

        var finalCsvContent = headerRow + '\n' + filteredCsvContent;

        createBlobAndDownload(finalCsvContent,'high_assessment_scores.csv')
        
    }


    function parsePrograms(){
        var table = document.getElementById('programsCsvTable');

        var headerRow = getCsvHeader(table);

        var csvContent = getCsvContent(table);

        // Preprocess data to count occurrences of UserEmail for courses other than 'Introduction to Data Literacy'
        var userEmailCounts = getUserCount(csvContent,2,8);
        


        // Filter on 'Assessment Name' == 'Intro to data literacy'
        var dhDataCourses = csvContent.split('\n').filter(function(line, index) {
            
            // skip empty lines and header row
            if (line.trim() === '' || index === 0) return false;
            
            var values = line.split(',');
            var assessmentName = values[8].trim(); // Assessment name is in 9th column (0 indexed)
            var userEmail = values[2].trim();
            var courseStatus = values[15].trim();
            return assessmentName === 'Introduction to Data Literacy';
        }).join('\n');


        // Filter on 'Assessment Name' == 'Analytic Fundamentals' and 'Reported Score' >= 130
        var dhCustomCourses = csvContent.split('\n').filter(function(line, index) {
            
            // skip empty lines and header row
            if (line.trim() === '' || index === 0) return false;

            var values = line.split(',');
            
            var assessmentName = values[8].trim(); // 'Assessment Name' is the 9th column
            var assessmentNameAlt = values[9].trim(); //sometimes it's the 10th column
            var userEmail = values[2].trim(); // email is in the 3rd column
            var courseStatus = values[15].trim(); // status in the 16th column
            var courseStatus = values[16].trim(); // sometimes it's the 17th column

            // Check if the assessment name is not 'Introduction to Data Literacy'
            if (assessmentName === 'Introduction to Data Literacy' || assessmentNameAlt ==='Introduction to Data Literacy') {
                console.log(userEmail," ",assessmentName);
                return false; // Skip this row
            }
            console.log("Still Made It?", userEmail,assessmentName);

         // Check if this UserEmail has more than one row,
            // considering only rows where the assessment name is not 'Introduction to Data Literacy'
            var userEmailCount = userEmailCounts[userEmail] || 0;

            // If the UserEmail has more than one row, only show the rows with CourseStatus == 'Completed'
            if (userEmailCount > 1) {
                return courseStatus === 'Completed';
            }

            // Otherwise, show all rows for that UserEmail
            return true;
                }).join('\n');

        // Filter on 'Assessment Name' == 'Analytic Fundamentals' and 'Reported Score' >= 130
        var bosunDataCourses = csvContent.split('\n').filter(function(line, index) {
            
            // skip empty lines
            if (line.trim() === '') return false;

            // Skip header row
            if (index === 0) return false;

            var values = line.split(',');
            console.log(values);
            var assessmentName = values[8].trim(); // Assuming 'Assessment Name' is the fourth column
            return assessmentName === 'Data Science for Business';
        }).join('\n');

        // Filter on 'Assessment Name' == 'Analytic Fundamentals' and 'Reported Score' >= 130
        var bosunCustomCourses = csvContent.split('\n').filter(function(line, index) {
            
            // skip empty lines
            if (line.trim() === '') return false;

            // Skip header row
            if (index === 0) return false;

            var values = line.split(',');
            console.log(values);
            var assessmentName = values[8].trim(); // Assuming 'Assessment Name' is the fourth column
            return assessmentName !== 'Data Science for Business';
        }).join('\n');

        // Filter on 'Assessment Name' == 'Analytic Fundamentals' and 'Reported Score' >= 130
        var bosunGovernanceCourses = csvContent.split('\n').filter(function(line, index) {
            
            // skip empty lines
            if (line.trim() === '') return false;

            // Skip header row
            if (index === 0) return false;

            var values = line.split(',');
            console.log(values);
            var assessmentName = values[8].trim(); // Assuming 'Assessment Name' is the fourth column
            return assessmentName === 'Data Governance Concepts';
        }).join('\n');

        
        

        // Output filtered courses to CSV files
        //var dhDataCourseOutput = 'Deckhand Data Courses.csv';
        var dhCustomCourseOutput = 'Deckhand Custom Courses.csv';
        //var bosunDataCourseOutput = 'Bosun Data Courses.csv';
        //var bosunCustomCourseOutput = 'Bosun Custom Courses.csv';
        //var bosunGovernanceCourseOutput = 'Bosun Data Governance Courses.csv';

        // Function to save CSV file
        function saveCSV(filename, data, headerRow) {
           
            console.log('Saving file:', filename);
            console.log('Header:',headerRow)
            console.log('Data:', data);
            
            var finalCsvContent = headerRow + '\n' + data;
            console.log(finalCsvContent);

            // Create a blob from the filtered CSV content
            var blob = new Blob([finalCsvContent], { type: 'text/csv' });
            console.log('')
            console.log('blobbed')

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

        // Save filtered courses to CSV files
        //saveCSV(dhDataCourseOutput, dhDataCourses, headerRow);
        saveCSV(dhCustomCourseOutput, dhCustomCourses, headerRow);
        //saveCSV(bosunDataCourseOutput, bosunDataCourses, headerRow);
        //saveCSV(bosunCustomCourseOutput, bosunCustomCourses, headerRow);
        //saveCSV(bosunGovernanceCourseOutput, bosunGovernanceCourses, headerRow);
    }
