const fs = require('fs');

// Read the parsed Excel data
const excelData = JSON.parse(fs.readFileSync('excel_data.json', 'utf8'));

// Skip first 3 header rows, process rows 3-48 (46 KPI rows)
const kpiRows = excelData.slice(3);

console.log(`Processing ${kpiRows.length} KPI rows...`);

// Helper function to determine completion percentage based on status
const getCompletionPercentage = (status) => {
  if (!status || status === '') return 0;
  const statusLower = status.toLowerCase();

  if (statusLower.includes('completed') || statusLower === 'passed' || statusLower === 'done') return 100;
  if (statusLower.includes('in progress') || statusLower.includes('inprogress')) return 50;
  if (statusLower.includes('failed')) return 0;
  if (statusLower === '?') return 0;
  if (statusLower.includes('not started')) return 0;
  if (statusLower.includes('pending')) return 0;
  if (statusLower.includes('onhold')) return 25;

  return 0;
};

// Helper function to normalize category
const normalizeCategory = (category) => {
  if (!category || category === '') return 'Other';
  return category;
};

// Helper function to clean string values
const cleanString = (value) => {
  if (value === null || value === undefined) return '';
  if (typeof value === 'number') {
    // Excel date serial numbers - convert to empty string or keep as string
    // 43800 and 45972 are Excel date serials, we'll return empty string
    if (value > 40000 && value < 50000) return '';
    return String(value);
  }
  if (typeof value !== 'string') return '';
  // Remove extra escaped quotes
  return value.replace(/^"(.*)"$/, '$1').trim();
};

// Transform Excel rows to KPI objects
const kpis = kpiRows.map((row, index) => {
  const [
    category,           // [0]
    name,              // [1]
    signoffStatus,     // [2]
    owner,             // [3]
    empty,             // [4]
    devStatus,         // [5]
    remarks,           // [6]
    customerDependency, // [7]
    revisedDevStatus,  // [8]
    sitStatus,         // [9]
    uatStatus,         // [10]
    prodStatus         // [11]
  ] = row;

  return {
    category: normalizeCategory(category),
    name: name || `Unnamed KPI ${index + 1}`,
    signoffStatus: signoffStatus || 'Pending',
    devStatus: devStatus || 'Not Started',
    devCompletion: getCompletionPercentage(devStatus),
    sitStatus: sitStatus || 'Not Started',
    sitCompletion: getCompletionPercentage(sitStatus),
    uatStatus: uatStatus || 'Not Started',
    uatCompletion: getCompletionPercentage(uatStatus),
    prodStatus: prodStatus || 'Not Started',
    prodCompletion: getCompletionPercentage(prodStatus),
    owner: cleanString(owner),
    remarks: cleanString(remarks),
    customerDependencyStatus: cleanString(customerDependency) || 'None',
    revisedDevStatus: cleanString(revisedDevStatus) || 'Not Started',
  };
});

console.log(`\nTransformed ${kpis.length} KPIs`);
console.log('\n=== Sample KPIs ===');
console.log(JSON.stringify(kpis.slice(0, 3), null, 2));

// Generate TypeScript file content
const generateTSFile = (kpis) => {
  const kpisJSON = JSON.stringify(kpis, null, 2)
    // Add proper TypeScript typing
    .replace(/"category":/g, 'category:')
    .replace(/"name":/g, 'name:')
    .replace(/"signoffStatus":/g, 'signoffStatus:')
    .replace(/"devStatus":/g, 'devStatus:')
    .replace(/"devCompletion":/g, 'devCompletion:')
    .replace(/"sitStatus":/g, 'sitStatus:')
    .replace(/"sitCompletion":/g, 'sitCompletion:')
    .replace(/"uatStatus":/g, 'uatStatus:')
    .replace(/"uatCompletion":/g, 'uatCompletion:')
    .replace(/"prodStatus":/g, 'prodStatus:')
    .replace(/"prodCompletion":/g, 'prodCompletion:')
    .replace(/"owner":/g, 'owner:')
    .replace(/"remarks":/g, 'remarks:')
    .replace(/"customerDependencyStatus":/g, 'customerDependencyStatus:')
    .replace(/"revisedDevStatus":/g, 'revisedDevStatus:');

  return `import { KPIInput } from '../types/kpi'

// Auto-generated from Excel file - KPIs.xlsx
// Generated on: ${new Date().toISOString()}
// Total KPIs: ${kpis.length}

export const initialKPIs: KPIInput[] = ${kpisJSON}
`;
};

const tsContent = generateTSFile(kpis);

// Write to file
fs.writeFileSync('src/data/initialKPIs.ts', tsContent);
console.log('\n✓ Updated src/data/initialKPIs.ts with accurate Excel data');

// Generate summary report
const summary = {
  totalKPIs: kpis.length,
  byCategory: {},
  byDevStatus: {},
  bySITStatus: {},
  emptyOwners: kpis.filter(k => !k.owner).length,
  emptyRemarks: kpis.filter(k => !k.remarks).length,
};

kpis.forEach(kpi => {
  summary.byCategory[kpi.category] = (summary.byCategory[kpi.category] || 0) + 1;
  summary.byDevStatus[kpi.devStatus] = (summary.byDevStatus[kpi.devStatus] || 0) + 1;
  summary.bySITStatus[kpi.sitStatus] = (summary.bySITStatus[kpi.sitStatus] || 0) + 1;
});

console.log('\n=== Summary Report ===');
console.log(JSON.stringify(summary, null, 2));

fs.writeFileSync('transformation_report.json', JSON.stringify({ kpis, summary }, null, 2));
console.log('\n✓ Detailed report saved to transformation_report.json');
