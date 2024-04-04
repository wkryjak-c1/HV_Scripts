    // initialize variable to save CSV header names
    var headers = [];

    /*
    Event listener for when the CSV is loaded

    */
    // add event listener to the csvFileInput element which is the input button
    document.getElementById('csvFileInput').addEventListener('change', function(e) {
        
        //Inside the event listener function, this line retrieves the selected file from the event object (e). 
        //The files property of the file input element contains an array of selected files, and [0] selects the first file in the array.
        var file = e.target.files[0];
        
        // if there is no file, break
        if (!file) {
            return;
        }
        
        // create a new FileReader object
        // FileReader is a built in js object that allows for reading files async
        var reader = new FileReader();
        
        //This line sets up an event handler for when the file has been successfully loaded. 
        //It defines a function to be executed when the load event occurs, which happens when the file content is fully loaded.
        reader.onload = function(e) {
            //The result property of the FileReader object contains the file content as a data URL or text, depending on how the file was read.
            var contents = e.target.result;
            
            // call displayCSV method on the contents (csv text in this case)
            displayCSV(contents);
        };
        //This line initiates reading the selected file as text using the readAsText() method of the FileReader object. 
        //This asynchronous operation triggers the load event once the file content has been read successfully.
        reader.readAsText(file);
    });

    /* 
    function to parse and display the csv data on the page 
    Also gets header information so it can be used for sorting and filtering
    */
    function displayCSV(csv) {
        
        var lines = csv.split('\n');
        var table = document.getElementById('csvTable');
        var sortSelect = document.getElementById('sortColumn');
        var filtersDiv = document.getElementById('filters');
        table.innerHTML = ''; // Clear existing table
        sortSelect.innerHTML = ''; // Clear existing select options
        filtersDiv.innerHTML = ''; // Clear existing filters
        
        // take the first element of the lines array (which is the first row of the csv) and split by comma, breaking out the headers
        headers = lines[0].split(',');
        lines.forEach(function(line, index) {
            var row = table.insertRow();
            line.split(',').forEach(function(cell, cellIndex) {
                var cellElement = document.createElement(index === 0 ? 'th' : 'td');
                cellElement.textContent = cell;
                if (index === 0) {
                    var option = document.createElement('option');
                    option.text = cell;
                    option.value = cellIndex;
                    sortSelect.add(option);
                    // Add filter inputs
                    var filterInput = document.createElement('input');
                    filterInput.type = 'text';
                    filterInput.placeholder = 'Filter ' + cell;
                    filterInput.setAttribute('data-index', cellIndex);
                    filterInput.addEventListener('input', applyFilters);
                    filtersDiv.appendChild(filterInput);
                }
                row.appendChild(cellElement);
            });
        });
    }

    function applyFilters() {
        var filterInputs = document.querySelectorAll('#filters input');
        var table = document.getElementById('csvTable');
        var rows = table.rows;
        
        for (var i = 1; i < rows.length; i++) {
            var row = rows[i];
            var visible = true;
            for (var j = 0; j < filterInputs.length; j++) {
                var columnIndex = parseInt(filterInputs[j].getAttribute('data-index'));
                var filterValue = filterInputs[j].value.toLowerCase();
                var cellValue = row.cells[columnIndex].textContent.toLowerCase();
                if (!cellValue.includes(filterValue)) {
                    visible = false;
                    break;
                }
            }
            row.style.display = visible ? '' : 'none';
        }
    }

    function sortAndSave() {
        var sortIndex = document.getElementById('sortColumn').value;
        var table = document.getElementById('csvTable');
        var rows = Array.from(table.rows).slice(1); // Exclude header row
        rows.sort(function(a, b) {
            var aVal = a.cells[sortIndex].textContent;
            var bVal = b.cells[sortIndex].textContent;
            return aVal.localeCompare(bVal);
        });
        
        // Reorder table rows
        table.innerHTML = ''; // Clear existing table
        rows.forEach(function(row) {
            table.appendChild(row);
        });

        // Convert sorted table back to CSV and display it
        var csvContent = Array.from(table.rows).map(function(row) {
            return Array.from(row.cells).map(function(cell) {
                return cell.textContent;
            }).join(',');
        }).join('\n');
        
        // Filter on 'Assessment Name' == 'Analytic Fundamentals'
        var filteredCsvContent = csvContent.split('\n').filter(function(line) {
            return line.includes('Analytic Fundamentals') && parseInt(line.split(',')[2]) > 130;
        }).join('\n');
        
        // Create a blob from the filtered CSV content
        var blob = new Blob([filteredCsvContent], { type: 'text/csv' });

        // Create a link element to trigger the download
        var link = document.createElement('a');
        link.href = window.URL.createObjectURL(blob);
        link.download = 'high_assessment_scores.csv';
        link.click();
    }