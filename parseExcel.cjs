const XLSX = require('xlsx');
const fs = require('fs');

// Read the Excel file
const workbook = XLSX.readFile('KPIs.xlsx');
const sheetName = workbook.SheetNames[0];
const worksheet = workbook.Sheets[sheetName];

// Convert to JSON
const data = XLSX.utils.sheet_to_json(worksheet, {
  header: 1,
  defval: '',
  blankrows: false
});

console.log('Total rows:', data.length);
console.log('\n=== First 5 rows (headers + data) ===');
data.slice(0, 5).forEach((row, idx) => {
  console.log(`Row ${idx}:`, JSON.stringify(row));
});

console.log('\n=== Column Headers (Row 0-2) ===');
console.log('Row 0:', JSON.stringify(data[0]));
console.log('Row 1:', JSON.stringify(data[1]));
console.log('Row 2:', JSON.stringify(data[2]));

console.log('\n=== Sample Data Rows ===');
// Show rows 3-8 (first few KPI data rows)
data.slice(3, 9).forEach((row, idx) => {
  console.log(`\nData Row ${idx + 1}:`, JSON.stringify(row));
});

// Save raw data to file for inspection
fs.writeFileSync('excel_data.json', JSON.stringify(data, null, 2));
console.log('\n✓ Full data saved to excel_data.json');
