'use client'

import { useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Upload, FileSpreadsheet, CheckCircle, XCircle, Loader2 } from 'lucide-react'
import Link from 'next/link'

interface ImportResult {
  success: boolean
  totalRows: number
  successCount: number
  failedCount: number
  errors: string[]
}

export default function ImportDragPage() {
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<ImportResult | null>(null)
  const [dragActive, setDragActive] = useState(false)

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0]
      const ext = droppedFile.name.split('.').pop()?.toLowerCase()
      
      if (ext && ['csv', 'xlsx', 'xls'].includes(ext)) {
        setFile(droppedFile)
        setResult(null)
      } else {
        alert('Please upload a CSV or Excel file')
      }
    }
  }, [])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
      setResult(null)
    }
  }

  const handleImport = async (useAdvanced = true) => {
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
            <span className="text-sm text-gray-600">Import with Drag & Drop</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-12">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Import Cafe Data - Drag & Drop</CardTitle>
            <CardDescription>
              Drag and drop your CSV or Excel file or click to browse
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Drag and Drop Area */}
            <div
              className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
                dragActive ? 'border-primary bg-primary/5' : 'border-gray-300'
              } ${file ? 'bg-green-50 border-green-300' : ''}`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <input
                type="file"
                id="file-upload"
                className="hidden"
                accept=".csv,.xlsx,.xls"
                onChange={handleFileChange}
              />
              
              {file ? (
                <div>
                  <FileSpreadsheet className="h-16 w-16 text-green-600 mx-auto mb-4" />
                  <p className="text-lg font-semibold">{file.name}</p>
                  <p className="text-sm text-gray-600">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-4"
                    onClick={() => {
                      setFile(null)
                      setResult(null)
                    }}
                  >
                    Remove File
                  </Button>
                </div>
              ) : (
                <label htmlFor="file-upload" className="cursor-pointer">
                  <Upload className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-lg font-medium">
                    Drag and drop your file here
                  </p>
                  <p className="text-sm text-gray-600 mt-2">
                    or <span className="text-primary underline">browse files</span>
                  </p>
                  <p className="text-xs text-gray-500 mt-4">
                    Supported formats: CSV, XLSX, XLS
                  </p>
                </label>
              )}
            </div>

            {/* Import Button */}
            {file && (
              <div className="flex gap-4 justify-center">
                <Button
                  onClick={() => handleImport(true)}
                  disabled={loading}
                  size="lg"
                  className="min-w-[200px]"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                      Importing...
                    </>
                  ) : (
                    <>
                      <Upload className="h-5 w-5 mr-2" />
                      Import Cafes
                    </>
                  )}
                </Button>
              </div>
            )}

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
                    <h4 className="font-medium mb-2">Details:</h4>
                    <ul className="space-y-1 text-sm text-gray-700 max-h-60 overflow-y-auto">
                      {result.errors.map((error, index) => (
                        <li key={index}>• {error}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {result.successCount > 0 && (
                  <div className="mt-4 pt-4 border-t">
                    <Link href="/search">
                      <Button className="w-full">
                        View Imported Cafes
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Links */}
        <div className="mt-8 text-center space-y-2">
          <Link href="/admin/import" className="text-primary hover:underline">
            Back to Standard Import
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
