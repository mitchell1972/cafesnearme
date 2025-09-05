'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Upload, FileSpreadsheet, CheckCircle, XCircle, Loader2 } from 'lucide-react'
import Link from 'next/link'

interface ImportResult {
  success: boolean
  totalRows: number
  successCount: number
  failedCount: number
  errors: string[]
}

export default function ImportPage() {
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<ImportResult | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
      setResult(null)
    }
  }

  const handleImport = async (useAdvanced = false) => {
    if (!file) return

    setLoading(true)
    setResult(null)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const endpoint = useAdvanced ? '/api/import-advanced' : '/api/import'
      const response = await fetch(endpoint, {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()
      setResult(data)
    } catch (error) {
      setResult({
        success: false,
        totalRows: 0,
        successCount: 0,
        failedCount: 0,
        errors: ['Failed to upload file: ' + (error instanceof Error ? error.message : 'Unknown error')],
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-2xl font-bold text-primary">
              Cafes Near Me
            </Link>
            <span className="text-sm text-gray-600">Admin Panel</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-12">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Import Cafe Data</CardTitle>
            <CardDescription>
              Upload a CSV or Excel file to import cafe data into the database
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* File Upload */}
            <div className="space-y-2">
              <Label htmlFor="file">Select File</Label>
              <div className="flex gap-4">
                <Input
                  id="file"
                  type="file"
                  accept=".csv,.xlsx,.xls"
                  onChange={handleFileChange}
                  className="flex-1"
                />
                <Button
                  onClick={() => handleImport(false)}
                  disabled={!file || loading}
                  className="min-w-[120px]"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Importing...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-2" />
                      Import
                    </>
                  )}
                </Button>
              </div>
              {file && (
                <>
                  <p className="text-sm text-gray-600">
                    Selected: {file.name} ({(file.size / 1024).toFixed(2)} KB)
                  </p>
                  <div className="mt-2">
                    <Button
                      onClick={() => handleImport(true)}
                      disabled={loading}
                      variant="outline"
                      size="sm"
                    >
                      <Upload className="h-3 w-3 mr-2" />
                      Try Advanced Import (if standard fails)
                    </Button>
                  </div>
                </>
              )}
            </div>

            {/* Import Results */}
            {result && (
              <div className={`rounded-lg p-6 ${
                result.success ? 'bg-green-50' : result.successCount > 0 ? 'bg-yellow-50' : 'bg-red-50'
              }`}>
                <div className="flex items-center gap-3 mb-4">
                  {result.success ? (
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  ) : (
                    <XCircle className="h-6 w-6 text-red-600" />
                  )}
                  <h3 className="text-lg font-semibold">
                    {result.success ? 'Import Successful' : 'Import Completed with Errors'}
                  </h3>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold">{result.totalRows}</p>
                    <p className="text-sm text-gray-600">Total Rows</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600">{result.successCount}</p>
                    <p className="text-sm text-gray-600">Successful</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-red-600">{result.failedCount}</p>
                    <p className="text-sm text-gray-600">Failed</p>
                  </div>
                </div>

                {result.errors.length > 0 && (
                  <div className="border-t pt-4">
                    <h4 className="font-medium mb-2">Errors:</h4>
                    <ul className="space-y-1 text-sm text-red-600 max-h-40 overflow-y-auto">
                      {result.errors.map((error, index) => (
                        <li key={index}>• {error}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* Instructions */}
            <div className="border-t pt-6">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <FileSpreadsheet className="h-5 w-5" />
                File Format Requirements
              </h3>
              <div className="space-y-3 text-sm text-gray-600">
                <p>Your CSV/Excel file should include the following columns:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li><strong>name</strong> - Cafe name (required)</li>
                  <li><strong>address</strong> - Street address (required)</li>
                  <li><strong>postcode</strong> - Postal code (required)</li>
                  <li><strong>latitude</strong> - Latitude coordinate (required)</li>
                  <li><strong>longitude</strong> - Longitude coordinate (required)</li>
                  <li><strong>phone</strong> - Phone number (optional)</li>
                  <li><strong>website</strong> - Website URL (optional)</li>
                  <li><strong>email</strong> - Email address (optional)</li>
                  <li><strong>amenities</strong> - Comma-separated list (optional)</li>
                  <li><strong>features</strong> - Comma-separated list (optional)</li>
                  <li><strong>city</strong> - City name (optional, extracted from address if not provided)</li>
                  <li><strong>area</strong> - Area/neighborhood (optional)</li>
                </ul>
                
                <div className="bg-gray-100 rounded p-3 mt-4">
                  <p className="font-medium mb-1">Example CSV format:</p>
                  <code className="text-xs">
                    name,address,postcode,latitude,longitude,phone,amenities<br />
                    "The Daily Grind","123 High St","SW1A 1AA",51.5074,-0.1278,"+44 20 1234 5678","WiFi,Parking"
                  </code>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Links */}
        <div className="mt-8 text-center space-y-2">
          <Link href="/search" className="text-primary hover:underline">
            View All Cafes
          </Link>
          <span className="mx-2">•</span>
          <Link href="/" className="text-primary hover:underline">
            Back to Home
          </Link>
        </div>
      </main>
    </div>
  )
}
