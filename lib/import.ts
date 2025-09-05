import { parse } from 'csv-parse'
import * as XLSX from 'xlsx'
import { prisma } from './prisma'
import { generateSlug } from './seo'
import { isValidCoordinates } from './geo'

export interface ImportRow {
  name: string
  address: string
  postcode: string
  latitude?: number
  longitude?: number
  phone?: string
  website?: string
  email?: string
  openingHours?: any
  amenities?: string[]
  features?: string[]
  description?: string
  priceRange?: string
  city?: string
  area?: string
  thumbnail?: string
  images?: string[]
  rating?: number
  reviewCount?: number
}

export interface ImportResult {
  success: boolean
  totalRows: number
  successCount: number
  failedCount: number
  errors: string[]
}

/**
 * Import cafes from CSV file
 */
export async function importFromCSV(fileContent: string): Promise<ImportResult> {
  const errors: string[] = []
  let successCount = 0
  let failedCount = 0
  const rows: ImportRow[] = []

  return new Promise((resolve) => {
    parse(fileContent, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
    })
      .on('data', (row) => {
        rows.push(parseRow(row))
      })
      .on('error', (err) => {
        errors.push(`CSV parsing error: ${err.message}`)
      })
      .on('end', async () => {
        for (const [index, row] of rows.entries()) {
          try {
            await importCafe(row)
            successCount++
          } catch (error) {
            failedCount++
            errors.push(`Row ${index + 2}: ${error instanceof Error ? error.message : 'Unknown error'}`)
          }
        }

        await prisma.importLog.create({
          data: {
            filename: 'csv_import',
            status: failedCount === 0 ? 'success' : successCount === 0 ? 'failed' : 'partial',
            rowsTotal: rows.length,
            rowsSuccess: successCount,
            rowsFailed: failedCount,
            errors: errors.length > 0 ? errors : undefined,
          },
        })

        resolve({
          success: failedCount === 0,
          totalRows: rows.length,
          successCount,
          failedCount,
          errors,
        })
      })
  })
}

/**
 * Import cafes from Excel file
 */
export async function importFromExcel(buffer: Buffer): Promise<ImportResult> {
  const errors: string[] = []
  let successCount = 0
  let failedCount = 0

  try {
    const workbook = XLSX.read(buffer, { type: 'buffer' })
    const sheetName = workbook.SheetNames[0]
    const worksheet = workbook.Sheets[sheetName]
    
    // Try different parsing options
    let data = XLSX.utils.sheet_to_json(worksheet, { defval: '' }) as any[]
    
    // Debug: Log sheet info
    console.log(`Sheet name: ${sheetName}`)
    console.log(`Data rows found: ${data.length}`)
    
    // If no data, try with raw parsing
    if (data.length === 0) {
      console.log('No data found with default parsing, trying raw parsing...')
      data = XLSX.utils.sheet_to_json(worksheet, { raw: true, defval: '' }) as any[]
      console.log(`Data rows after raw parsing: ${data.length}`)
    }
    
    // If still no data, try parsing with header option
    if (data.length === 0) {
      console.log('Still no data, trying with header=1...')
      data = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' }) as any[]
      console.log(`Rows found with header=1: ${data.length}`)
      
      if (data.length > 1) {
        // Convert array format to object format
        const headers = data[0] as string[]
        const objectData = []
        for (let i = 1; i < data.length; i++) {
          const row: any = {}
          const values = data[i] as any[]
          headers.forEach((header, index) => {
            row[header] = values[index] || ''
          })
          objectData.push(row)
        }
        data = objectData
        console.log(`Converted ${data.length} rows to object format`)
      }
    }

    // Debug: Log available columns
    if (data.length > 0) {
      const columns = Object.keys(data[0])
      console.log('Available columns in Excel file:', columns)
      errors.push(`DEBUG: Found ${columns.length} columns: ${columns.join(', ')}`)
      errors.push(`DEBUG: Total data rows: ${data.length}`)
    } else {
      errors.push('DEBUG: No data rows found in Excel file')
      return {
        success: false,
        totalRows: 0,
        successCount: 0,
        failedCount: 0,
        errors,
      }
    }

    for (const [index, row] of data.entries()) {
      try {
        const parsedRow = parseRow(row)
        
        // Debug: Log first few parsed rows
        if (index < 3) {
          console.log(`Parsed row ${index + 1}:`, {
            name: parsedRow.name,
            address: parsedRow.address,
            postcode: parsedRow.postcode,
            lat: parsedRow.latitude,
            lng: parsedRow.longitude
          })
        }
        
        await importCafe(parsedRow)
        successCount++
      } catch (error) {
        failedCount++
        errors.push(`Row ${index + 2}: ${error instanceof Error ? error.message : 'Unknown error'}`)
      }
    }

    await prisma.importLog.create({
      data: {
        filename: 'excel_import',
        status: failedCount === 0 ? 'success' : successCount === 0 ? 'failed' : 'partial',
        rowsTotal: data.length,
        rowsSuccess: successCount,
        rowsFailed: failedCount,
        errors: errors.length > 0 ? errors : undefined,
      },
    })

    return {
      success: failedCount === 0,
      totalRows: data.length,
      successCount,
      failedCount,
      errors,
    }
  } catch (error) {
    errors.push(`Excel parsing error: ${error instanceof Error ? error.message : 'Unknown error'}`)
    return {
      success: false,
      totalRows: 0,
      successCount: 0,
      failedCount: 0,
      errors,
    }
  }
}

/**
 * Parse row data from import
 */
function parseRow(row: any): ImportRow {
  // Common field mappings for different data sources (Outscraper specific)
  const fieldMappings = {
    name: ['name', 'Name', 'cafe_name', 'business_name', 'title', 'place_name', 'restaurant_name'],
    address: ['full_address', 'address', 'Address', 'street_address', 'location', 'street', 'addr'],
    postcode: ['postal_code', 'postcode', 'Postcode', 'zip', 'zip_code', 'post_code'],
    latitude: ['latitude', 'lat', 'Latitude', 'LAT', 'coord_lat', 'lat_coord'],
    longitude: ['longitude', 'lng', 'lon', 'Longitude', 'LNG', 'LON', 'coord_lng', 'lng_coord'],
    phone: ['phone', 'Phone', 'telephone', 'tel', 'phone_number', 'contact_phone'],
    website: ['site', 'website', 'Website', 'url', 'web', 'homepage'],
    email: ['email', 'Email', 'e_mail', 'contact_email'],
    description: ['about', 'description', 'Description', 'summary', 'details'],
    city: ['city', 'City', 'locality', 'town'],
    area: ['borough', 'area', 'Area', 'neighborhood', 'district', 'region', 'zone'],
    priceRange: ['priceRange', 'price_range', 'price', 'price_level', 'cost'],
    rating: ['rating', 'Rating', 'score'],
    reviewCount: ['reviews', 'review_count', 'reviews_count', 'total_reviews'],
  }

  function getFieldValue(mappings: string[], defaultValue: any = '') {
    for (const field of mappings) {
      if (row[field] !== undefined && row[field] !== null && row[field] !== '') {
        return row[field]
      }
    }
    return defaultValue
  }

  const parsedRow = {
    name: getFieldValue(fieldMappings.name),
    address: getFieldValue(fieldMappings.address),
    postcode: getFieldValue(fieldMappings.postcode),
    latitude: parseFloat(getFieldValue(fieldMappings.latitude, 0)),
    longitude: parseFloat(getFieldValue(fieldMappings.longitude, 0)),
    phone: getFieldValue(fieldMappings.phone),
    website: getFieldValue(fieldMappings.website),
    email: getFieldValue(fieldMappings.email),
    description: getFieldValue(fieldMappings.description),
    priceRange: getFieldValue(fieldMappings.priceRange),
    city: getFieldValue(fieldMappings.city),
    area: getFieldValue(fieldMappings.area),
    thumbnail: row.thumbnail || row.image || row.photo || row.photos || '',
    amenities: parseArrayField(row.amenities || row.Amenities || row.services || row.subtypes || row.category),
    features: parseArrayField(row.features || row.Features || row.categories || row.type || row.subtypes),
    openingHours: parseOpeningHours(row),
    images: parseArrayField(row.images || row.Images || row.photos),
    rating: parseFloat(getFieldValue(fieldMappings.rating, 0)) || undefined,
    reviewCount: parseInt(getFieldValue(fieldMappings.reviewCount, 0)) || undefined,
  }

  return parsedRow
}

/**
 * Parse array fields from CSV/Excel
 */
function parseArrayField(field: any): string[] {
  if (!field) return []
  if (Array.isArray(field)) return field
  if (typeof field === 'string') {
    return field.split(/[,;|]/).map(item => item.trim()).filter(Boolean)
  }
  return []
}

/**
 * Parse opening hours from various formats
 */
function parseOpeningHours(row: any): any {
  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
  const hours: any = {}

  // Try Outscraper working_hours format first
  if (row.working_hours || row.working_hours_csv_compatible) {
    try {
      const workingHours = row.working_hours || row.working_hours_csv_compatible
      if (typeof workingHours === 'string') {
        // Try to parse as JSON
        const parsed = JSON.parse(workingHours)
        if (parsed && typeof parsed === 'object') {
          return parsed
        }
      } else if (typeof workingHours === 'object') {
        return workingHours
      }
    } catch {
      // If JSON parsing fails, try to parse as text
      const workingHours = row.working_hours || row.working_hours_csv_compatible
      if (typeof workingHours === 'string') {
        // Simple text parsing for formats like "Mon-Fri: 9:00-17:00"
        const lines = workingHours.split(/[,;\n]/)
        for (const line of lines) {
          const dayMatch = line.match(/(monday|tuesday|wednesday|thursday|friday|saturday|sunday|mon|tue|wed|thu|fri|sat|sun)[\s:]*([0-9:]+[\s]*-[\s]*[0-9:]+)/i)
          if (dayMatch) {
            const dayName = dayMatch[1].toLowerCase()
            const timeRange = dayMatch[2]
            const parsed = parseHoursString(timeRange)
            if (parsed) {
              const fullDayName = dayName.length === 3 ? 
                days.find(d => d.startsWith(dayName)) || dayName : dayName
              hours[fullDayName] = parsed
            }
          }
        }
      }
    }
  }

  // Try to parse individual day columns
  for (const day of days) {
    const dayHours = row[day] || row[day.charAt(0).toUpperCase() + day.slice(1)]
    if (dayHours) {
      const parsed = parseHoursString(dayHours)
      if (parsed) {
        hours[day] = parsed
      }
    }
  }

  // Try to parse general opening hours field
  if (row.openingHours || row.opening_hours) {
    try {
      const parsed = JSON.parse(row.openingHours || row.opening_hours)
      return parsed
    } catch {
      // Not valid JSON, ignore
    }
  }

  return Object.keys(hours).length > 0 ? hours : null
}

/**
 * Parse hours string like "9:00-17:00" or "9am-5pm"
 */
function parseHoursString(hoursStr: string): { open: string; close: string } | null {
  const match = hoursStr.match(/(\d{1,2}):?(\d{2})?\s*(am|pm)?\s*[-–]\s*(\d{1,2}):?(\d{2})?\s*(am|pm)?/i)
  if (!match) return null

  const [, openHour, openMin = '00', openAmPm, closeHour, closeMin = '00', closeAmPm] = match
  
  let open = parseInt(openHour)
  let close = parseInt(closeHour)

  // Convert to 24-hour format if AM/PM is specified
  if (openAmPm?.toLowerCase() === 'pm' && open < 12) open += 12
  if (closeAmPm?.toLowerCase() === 'pm' && close < 12) close += 12
  if (openAmPm?.toLowerCase() === 'am' && open === 12) open = 0
  if (closeAmPm?.toLowerCase() === 'am' && close === 12) close = 0

  return {
    open: `${open.toString().padStart(2, '0')}:${openMin}`,
    close: `${close.toString().padStart(2, '0')}:${closeMin}`,
  }
}

/**
 * Import a single cafe
 */
async function importCafe(row: ImportRow): Promise<void> {
  // Validate required fields
  if (!row.name || !row.address || !row.postcode) {
    throw new Error('Missing required fields: name, address, or postcode')
  }

  // Validate coordinates if provided
  if (row.latitude && row.longitude && (row.latitude !== 0 || row.longitude !== 0)) {
    if (!isValidCoordinates({ latitude: row.latitude, longitude: row.longitude })) {
      throw new Error('Invalid coordinates')
    }
  } else {
    // For demo purposes, use default coordinates for London if missing
    console.warn(`Missing coordinates for ${row.name}, using default London coordinates`)
    row.latitude = 51.5074
    row.longitude = -0.1278
  }

  // Extract city from address if not provided
  const city = row.city || extractCityFromAddress(row.address)
  
  // Generate slug
  const slug = generateSlug(`${row.name} ${city} ${row.postcode}`)

  // Check if cafe already exists
  const existing = await prisma.cafe.findUnique({
    where: { slug },
  })

  if (existing) {
    // Update existing cafe
    await prisma.cafe.update({
      where: { slug },
      data: {
        name: row.name,
        address: row.address,
        city,
        area: row.area,
        postcode: row.postcode.toUpperCase(),
        latitude: row.latitude!,
        longitude: row.longitude!,
        phone: row.phone,
        website: row.website,
        email: row.email,
        description: row.description,
        priceRange: row.priceRange,
        amenities: row.amenities || [],
        features: row.features || [],
        openingHours: row.openingHours,
        thumbnail: row.thumbnail,
        images: row.images || [],
        rating: row.rating,
        reviewCount: row.reviewCount,
      },
    })
  } else {
    // Create new cafe
    await prisma.cafe.create({
      data: {
        name: row.name,
        slug,
        address: row.address,
        city,
        area: row.area,
        postcode: row.postcode.toUpperCase(),
        latitude: row.latitude!,
        longitude: row.longitude!,
        phone: row.phone,
        website: row.website,
        email: row.email,
        description: row.description,
        priceRange: row.priceRange,
        amenities: row.amenities || [],
        features: row.features || [],
        openingHours: row.openingHours,
        thumbnail: row.thumbnail,
        images: row.images || [],
        rating: row.rating,
        reviewCount: row.reviewCount,
      },
    })
  }
}

/**
 * Extract city from address string
 */
function extractCityFromAddress(address: string): string {
  const parts = address.split(',').map(p => p.trim())
  // Assume city is the second to last part
  return parts[parts.length - 2] || parts[parts.length - 1] || 'Unknown'
}
