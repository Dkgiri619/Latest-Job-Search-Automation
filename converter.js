const json2html = require('node-json2html');
const fs =require("fs");
const allData = JSON.parse(fs.readFileSync("./jobs.json", 'utf-8'));

