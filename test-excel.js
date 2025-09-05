const XLSX = require('xlsx');
const fs = require('fs');

console.log('Excel Debug Script');
console.log('==================');

// You'll need to save your Excel file to the project directory first
// For now, let's create a test with the Outscraper column structure

// Create a sample Excel file with Outscraper columns
const sampleData = [
  {
    query: 'cafes near me',
    name: 'Test Cafe 1',
    full_address: '123 Test Street, London',
    postal_code: 'SW1A 1AA',
    city: 'London',
    borough: 'Westminster',
    latitude: 51.5074,
    longitude: -0.1278,
    rating: 4.5,
    reviews: 100,
    about: 'A great test cafe',
    site: 'https://testcafe.com',
    category: 'Coffee shop',
    type: 'Cafe',
    subtypes: 'Coffee,Breakfast',
    working_hours: '{"monday":{"open":"08:00","close":"18:00"}}'
  },
  {
    query: 'cafes near me',
    name: 'Test Cafe 2',
    full_address: '456 Another Street, London',
    postal_code: 'SW1A 2BB',
    city: 'London',
    borough: 'Westminster',
    latitude: 51.5080,
    longitude: -0.1280,
    rating: 4.2,
    reviews: 75,
    about: 'Another test cafe',
    site: 'https://testcafe2.com',
    category: 'Restaurant',
    type: 'Cafe,Restaurant',
    subtypes: 'Brunch,Lunch',
    working_hours: '{"monday":{"open":"09:00","close":"17:00"}}'
  }
];

// Create a workbook and add the data
const ws = XLSX.utils.json_to_sheet(sampleData);
const wb = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');

// Write to file
const testFile = 'test-outscraper-format.xlsx';
XLSX.writeFile(wb, testFile);
console.log(`Created test file: ${testFile}`);

// Now read it back and test parsing
console.log('\nTesting Excel parsing...');
const workbook = XLSX.read(fs.readFileSync(testFile));
const sheetName = workbook.SheetNames[0];
console.log(`Sheet name: ${sheetName}`);

const worksheet = workbook.Sheets[sheetName];

// Test different parsing methods
console.log('\n1. Default parsing:');
const data1 = XLSX.utils.sheet_to_json(worksheet);
console.log(`   Rows found: ${data1.length}`);
if (data1.length > 0) {
  console.log('   First row keys:', Object.keys(data1[0]).slice(0, 10));
}

console.log('\n2. With defval option:');
const data2 = XLSX.utils.sheet_to_json(worksheet, { defval: '' });
console.log(`   Rows found: ${data2.length}`);

console.log('\n3. With raw option:');
const data3 = XLSX.utils.sheet_to_json(worksheet, { raw: true });
console.log(`   Rows found: ${data3.length}`);

console.log('\n4. With header=1 option:');
const data4 = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
console.log(`   Rows found: ${data4.length}`);
if (data4.length > 0) {
  console.log('   Headers:', data4[0].slice(0, 10));
}

// Show sample data
if (data1.length > 0) {
  console.log('\nSample parsed data:');
  const sample = data1[0];
  console.log('Name:', sample.name);
  console.log('Address:', sample.full_address);
  console.log('Postcode:', sample.postal_code);
  console.log('Lat/Lng:', sample.latitude, sample.longitude);
}

console.log('\nTest complete!');
console.log('\nTo test with your actual file:');
console.log('1. Copy your Excel file to this directory');
console.log('2. Update the script to read your file');
console.log('3. Run: node test-excel.js');
