import { NextRequest, NextResponse } from 'next/server'
import * as XLSX from 'xlsx'
import { prisma } from '@/lib/prisma'
import { generateSlug } from '@/lib/seo'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({
        success: false,
        totalRows: 0,
        successCount: 0,
        failedCount: 0,
        errors: ['No file provided. Please select a CSV or Excel file to upload.'],
      })
    }

    console.log(`Processing file: ${file.name} (${file.size} bytes)`)
    
    const buffer = Buffer.from(await file.arrayBuffer())
    const workbook = XLSX.read(buffer, { type: 'buffer', dense: true })
    
    console.log(`Sheets found: ${workbook.SheetNames.join(', ')}`)
    
    let allData: any[] = []
    let errors: string[] = []
    
    // Try all sheets
    for (const sheetName of workbook.SheetNames) {
      console.log(`\nProcessing sheet: ${sheetName}`)
      const worksheet = workbook.Sheets[sheetName]
      
      // Get the range
      const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1:A1')
      console.log(`Sheet range: ${worksheet['!ref']} (${range.e.r + 1} rows, ${range.e.c + 1} columns)`)
      
      // Try multiple parsing strategies
      let data = XLSX.utils.sheet_to_json(worksheet, { defval: '' })
      console.log(`Standard parsing: ${data.length} rows`)
      
      if (data.length === 0 && range.e.r > 0) {
        // Try skipping empty rows
        for (let skipRows = 1; skipRows <= Math.min(10, range.e.r); skipRows++) {
          data = XLSX.utils.sheet_to_json(worksheet, { 
            range: skipRows,
            defval: '' 
          })
          if (data.length > 0) {
            console.log(`Found data by skipping ${skipRows} rows: ${data.length} rows`)
            break
          }
        }
      }
      
      if (data.length > 0) {
        allData = allData.concat(data)
        const columns = Object.keys(data[0] as Record<string, any>)
        errors.push(`Sheet ${sheetName}: Found ${data.length} rows with ${columns.length} columns`)
        
        // Log first row for debugging
        console.log('First row sample:', JSON.stringify(data[0], null, 2).substring(0, 500))
      }
    }
    
    if (allData.length === 0) {
      return NextResponse.json({
        success: false,
        totalRows: 0,
        successCount: 0,
        failedCount: 0,
        errors: ['No data found in any sheet. The file might be empty or in an unsupported format.'],
      })
    }
    
    // Process the data
    let successCount = 0
    let failedCount = 0
    
    for (let index = 0; index < allData.length; index++) {
      const row = allData[index]
      try {
        // Map Outscraper fields to our schema
        const cafe = {
          name: row.name || row.Name || '',
          address: row.full_address || row.address || '',
          postcode: row.postal_code || row.postcode || '',
          latitude: parseFloat(row.latitude || row.lat || 0),
          longitude: parseFloat(row.longitude || row.lng || 0),
          city: row.city || row.City || 'London',
          area: row.borough || row.area || '',
          phone: row.phone || '',
          website: row.site || row.website || '',
          description: row.about || row.description || '',
          rating: parseFloat(row.rating || 0) || undefined,
          reviewCount: parseInt(row.reviews || 0) || undefined,
          amenities: row.subtypes ? row.subtypes.split(',').map((s: string) => s.trim()) : [],
          features: row.category ? [row.category] : [],
          priceRange: row.price_level || '',
          thumbnail: row.photo || '',
        }
        
        // Validate required fields
        if (!cafe.name || !cafe.address) {
          throw new Error('Missing required fields: name or address')
        }
        
        // Use default coordinates if missing
        if (!cafe.latitude || !cafe.longitude) {
          cafe.latitude = 51.5074
          cafe.longitude = -0.1278
        }
        
        // Generate slug
        const slug = generateSlug(`${cafe.name} ${cafe.city} ${cafe.postcode}`)
        
        // Check if exists
        const existing = await prisma.cafe.findUnique({
          where: { slug },
        })
        
        if (existing) {
          await prisma.cafe.update({
            where: { slug },
            data: cafe,
          })
        } else {
          await prisma.cafe.create({
            data: {
              ...cafe,
              slug,
            },
          })
        }
        
        successCount++
      } catch (error) {
        failedCount++
        errors.push(`Row ${index + 1}: ${error instanceof Error ? error.message : 'Unknown error'}`)
        if (failedCount <= 5) {
          console.error(`Error processing row ${index + 1}:`, error)
        }
      }
    }
    
    // Log import summary
    await prisma.importLog.create({
      data: {
        filename: file.name,
        status: failedCount === 0 ? 'success' : successCount === 0 ? 'failed' : 'partial',
        rowsTotal: allData.length,
        rowsSuccess: successCount,
        rowsFailed: failedCount,
        errors: errors.slice(0, 10), // Limit errors stored
      },
    })
    
    return NextResponse.json({
      success: failedCount === 0,
      totalRows: allData.length,
      successCount,
      failedCount,
      errors: errors.slice(0, 20), // Limit errors returned
    })
    
  } catch (error) {
    console.error('Import error:', error)
    return NextResponse.json({
      success: false,
      totalRows: 0,
      successCount: 0,
      failedCount: 0,
      errors: [
        'Failed to import file',
        error instanceof Error ? error.message : 'Unknown error'
      ],
    })
  }
}
