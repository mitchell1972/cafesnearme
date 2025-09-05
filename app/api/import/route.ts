import { NextRequest, NextResponse } from 'next/server'
import { importFromCSV, importFromExcel } from '@/lib/import'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    const fileExtension = file.name.split('.').pop()?.toLowerCase()
    
    if (!fileExtension || !['csv', 'xlsx', 'xls'].includes(fileExtension)) {
      return NextResponse.json(
        { error: 'Invalid file type. Please upload a CSV or Excel file.' },
        { status: 400 }
      )
    }

    console.log(`Processing file: ${file.name} (${file.size} bytes, type: ${fileExtension})`)
    
    let result
    
    if (fileExtension === 'csv') {
      const text = await file.text()
      console.log(`CSV content length: ${text.length} characters`)
      result = await importFromCSV(text)
    } else {
      const arrayBuffer = await file.arrayBuffer()
      console.log(`Excel arrayBuffer size: ${arrayBuffer.byteLength} bytes`)
      const buffer = Buffer.from(arrayBuffer)
      console.log(`Excel buffer size: ${buffer.length} bytes`)
      result = await importFromExcel(buffer)
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error('Import error:', error)
    return NextResponse.json(
      { error: 'Failed to import file', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
