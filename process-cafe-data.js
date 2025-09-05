#!/usr/bin/env node

/**
 * Script to help process and validate cafe data
 * Usage: node process-cafe-data.js input.csv output.csv
 */

const fs = require('fs');
const path = require('path');

function processCSV(inputFile, outputFile) {
  console.log('Processing cafe data...');
  
  if (!fs.existsSync(inputFile)) {
    console.error(`Input file ${inputFile} not found`);
    console.log('Please create a CSV file with your cafe data first.');
    console.log('\nExpected columns:');
    console.log('name,address,postcode,latitude,longitude,phone,website,email,city,area,amenities,features,description,priceRange');
    return;
  }

  const data = fs.readFileSync(inputFile, 'utf8');
  const lines = data.split('\n');
  const header = lines[0];
  
  console.log(`Found ${lines.length - 1} data rows`);
  console.log(`Header: ${header}`);
  
  // Validate and clean data
  const processedLines = [header];
  let validRows = 0;
  let invalidRows = 0;
  
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    // Basic validation - check if we have minimum required fields
    const fields = line.split(',');
    if (fields.length < 5) {
      console.log(`Row ${i}: Insufficient fields - ${line.substring(0, 50)}...`);
      invalidRows++;
      continue;
    }
    
    // Add the line to processed data
    processedLines.push(line);
    validRows++;
  }
  
  // Write processed data
  fs.writeFileSync(outputFile, processedLines.join('\n'));
  
  console.log(`\nProcessing complete:`);
  console.log(`Valid rows: ${validRows}`);
  console.log(`Invalid rows: ${invalidRows}`);
  console.log(`Output written to: ${outputFile}`);
}

// Command line usage
const args = process.argv.slice(2);
if (args.length < 2) {
  console.log('Usage: node process-cafe-data.js input.csv output.csv');
  console.log('\nOr just run without arguments to see sample format:');
  
  // Show sample format
  console.log('\nSample CSV format:');
  console.log('name,address,postcode,latitude,longitude,phone,website,email,city,area,amenities,features,description,priceRange');
  console.log('"Coffee Shop","123 Main St","SW1A 1AA",51.5074,-0.1278,"+44 20 1234 5678","https://example.com","info@example.com","London","Westminster","WiFi,Parking","Breakfast,Coffee","Great coffee shop","$$"');
} else {
  processCSV(args[0], args[1]);
}
