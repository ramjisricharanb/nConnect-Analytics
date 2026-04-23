const XLSX = require('xlsx');
const fs = require('fs');
const buf = fs.readFileSync('March.xlsx');
const wb = XLSX.read(buf, { type: 'buffer', cellDates: true });
const ws = wb.Sheets[wb.SheetNames[0]];
const data = XLSX.utils.sheet_to_json(ws, { raw: true });
console.log("Row 0:", data[0]);
