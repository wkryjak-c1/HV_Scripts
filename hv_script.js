    var headers = [];

    document.getElementById('csvFileInput').addEventListener('change', function(e) {
        var file = e.target.files[0];
        if (!file) {
            return;
        }
        
        var reader = new FileReader();
        reader.onload = function(e) {
            var contents = e.target.result;
            displayCSV(contents);
        };
        reader.readAsText(file);
    });

    function displayCSV(csv) {
        var lines = csv.split('\n');
        var table = document.getElementById('csvTable');
        var sortSelect = document.getElementById('sortColumn');
        var filtersDiv = document.getElementById('filters');
        table.innerHTML = ''; // Clear existing table
        sortSelect.innerHTML = ''; // Clear existing select options
        filtersDiv.innerHTML = ''; // Clear existing filters
        
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
        
        alert("Sorted Data:\n\n" + csvContent);

        // Create a blob from the CSV content
        var blob = new Blob([csvContent], { type: 'text/csv' });

        // Create a link element to trigger the download
        var link = document.createElement('a');
        link.href = window.URL.createObjectURL(blob);
        link.download = 'sorted_data.csv';
        link.click();
    }