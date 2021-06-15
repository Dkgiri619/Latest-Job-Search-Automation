async function converter(){
    const fs = require('fs');
    // JSON data
    const data = require('./jobs.json');
    // Build paths
    const buildPathHtml = "./jobSearch.html";
    const createRow = (item) => `
    <tr>
        <td>${item.company}</td>
        <td>${item.designation}</td>
        <td>${item.location}</td>
        <td>${item.salary}</td>
        <td><button class="apply-button" onclick="location.href='${item.link}'" type="button">Apply</button></td>
    </tr>
    `;
    const createTable = (rows) => `
    <table>
        <tr>
            <th>Company</td>
            <th>Role</td>
            <th>Location</td>
            <th>Salary</td>
            <th>Apply</td>
        </tr>
        ${rows}
    </table>
    `;

    const createHtml = (table) => `
    <html>
        <head>
        <style>
            table {
            width: 100%;
            }
            tr {
            text-align: left;
            border: 1px solid black;
            }
            th, td {
            padding: 15px;
            }
            tr:nth-child(odd) {
            background: #CCC
            }
            tr:nth-child(even) {
            background: #FFF
            }
            .no-content {
            background-color: red;
            }
            .apply-button {
                padding: 11px;
            }
        </style>
        </head>
        <body>
        ${table}
        </body>
    </html>
    `;
    const doesFileExist = (filePath) => {
        try {
            fs.statSync(filePath); // get information of the specified file path.
            return true;
        } catch (error) {
            return false;
        }
    };

    try {
        if (doesFileExist(buildPathHtml)) {
            console.log('Deleting old build file');
            fs.unlinkSync(buildPathHtml);
        }
        const rows = data.map(createRow).join('');
        const table = createTable(rows);
        const html = createHtml(table);
        fs.writeFileSync(buildPathHtml, html);
        console.log('Succesfully created an HTML table');
    } catch (error) {
        console.log('Error generating table', error);
    }
}
module.exports = converter;