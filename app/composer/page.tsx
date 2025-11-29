'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Navbar } from '@/components/shared/navbar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useAuthStore } from '@/store/auth-store'
import {
  FileText,
  Send,
  CheckCircle,
  XCircle,
  AlertCircle,
  Table as TableIcon,
} from 'lucide-react'
import Papa from 'papaparse'

interface Asset {
  id: string
  name: string
  type: string
}

const DATA_TYPES = [
  { value: 'CAPITAL_CALL', label: 'Capital Call' },
  { value: 'DISTRIBUTION', label: 'Distribution' },
  { value: 'FINANCIAL_STATEMENT', label: 'Financial Statement' },
  { value: 'TAX_DOCUMENT', label: 'Tax Document' },
  { value: 'LEGAL_DOCUMENT', label: 'Legal Document' },
]

export default function ComposerPage() {
  const { currentPersona } = useAuthStore()
  const [assets, setAssets] = useState<Asset[]>([])
  const [selectedAsset, setSelectedAsset] = useState<string>('')
  const [dataType, setDataType] = useState<string>('')
  const [inputMode, setInputMode] = useState<'paste' | 'json'>('paste')
  const [rawInput, setRawInput] = useState<string>('')
  const [parsedData, setParsedData] = useState<any>(null)
  const [parseError, setParseError] = useState<string | null>(null)
  const [publishing, setPublishing] = useState(false)
  const [publishResult, setPublishResult] = useState<{ success: boolean; message: string } | null>(null)

  // Fetch assets the user can publish to
  useEffect(() => {
    async function fetchAssets() {
      try {
        const response = await fetch(`/api/assets?orgId=${currentPersona.organizationId}`)
        const data = await response.json()
        setAssets(data)
      } catch (error) {
        console.error('Error fetching assets:', error)
      }
    }
    fetchAssets()
  }, [currentPersona.organizationId])

  // Parse input when it changes
  useEffect(() => {
    if (!rawInput.trim()) {
      setParsedData(null)
      setParseError(null)
      return
    }

    if (inputMode === 'json') {
      try {
        const parsed = JSON.parse(rawInput)
        setParsedData(parsed)
        setParseError(null)
      } catch (e) {
        setParseError('Invalid JSON syntax')
        setParsedData(null)
      }
    } else {
      // Try to parse as CSV/TSV
      const result = Papa.parse(rawInput, {
        header: true,
        skipEmptyLines: true,
        dynamicTyping: true,
      })

      if (result.errors.length > 0) {
        setParseError(result.errors[0].message)
        setParsedData(null)
      } else if (result.data.length === 0) {
        setParseError('No data found')
        setParsedData(null)
      } else {
        setParsedData(result.data)
        setParseError(null)
      }
    }
  }, [rawInput, inputMode])

  const handlePublish = async () => {
    if (!selectedAsset || !dataType || !parsedData) return

    setPublishing(true)
    setPublishResult(null)

    try {
      const response = await fetch('/api/envelopes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: dataType,
          payload: parsedData,
          publisherId: currentPersona.organizationId,
          assetId: selectedAsset,
        }),
      })

      if (response.ok) {
        setPublishResult({ success: true, message: 'Envelope published successfully!' })
        setRawInput('')
        setParsedData(null)
      } else {
        const error = await response.json()
        setPublishResult({ success: false, message: error.error || 'Failed to publish' })
      }
    } catch (error) {
      setPublishResult({ success: false, message: 'Network error' })
    } finally {
      setPublishing(false)
    }
  }

  const isValid = selectedAsset && dataType && parsedData && !parseError

  return (
    <div className="flex-1 bg-background">
      <Navbar />

      <main className="container mx-auto px-4 py-12 max-w-7xl">
        {/* Header */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <h1 className="text-4xl font-semibold mb-3 gradient-text">Composer</h1>
          <p className="text-muted-foreground text-base">
            Create and publish data packets to your fund subscribers
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Input Panel */}
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-primary" />
                  Envelope Configuration
                </CardTitle>
                <CardDescription>
                  Configure and compose your data packet
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Asset Selection */}
                <div className="space-y-2">
                  <Label>Target Asset</Label>
                  <Select value={selectedAsset} onValueChange={setSelectedAsset}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select asset..." />
                    </SelectTrigger>
                    <SelectContent>
                      {assets.map((asset) => (
                        <SelectItem key={asset.id} value={asset.id}>
                          <div className="flex items-center gap-2">
                            <span>{asset.name}</span>
                            <Badge variant="outline" className="text-xs">
                              {asset.type}
                            </Badge>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Data Type Selection */}
                <div className="space-y-2">
                  <Label>Data Type</Label>
                  <Select value={dataType} onValueChange={setDataType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select data type..." />
                    </SelectTrigger>
                    <SelectContent>
                      {DATA_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Input Mode Tabs */}
                <div className="space-y-2">
                  <Label>Data Input</Label>
                  <Tabs value={inputMode} onValueChange={(v) => setInputMode(v as 'paste' | 'json')}>
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="paste">Smart Paste (CSV/TSV)</TabsTrigger>
                      <TabsTrigger value="json">Raw JSON</TabsTrigger>
                    </TabsList>
                    <TabsContent value="paste" className="mt-3">
                      <Textarea
                        placeholder="Paste CSV or TSV data here...&#10;&#10;Example:&#10;fundName,callNumber,callDate,dueDate,amount&#10;KP Fund XXI,3,2024-10-15,2024-10-30,25000000"
                        className="font-mono text-sm min-h-[250px]"
                        value={rawInput}
                        onChange={(e) => setRawInput(e.target.value)}
                      />
                    </TabsContent>
                    <TabsContent value="json" className="mt-3">
                      <Textarea
                        placeholder='Enter JSON data...&#10;&#10;Example:&#10;{&#10;  "fundName": "KP Fund XXI",&#10;  "callNumber": 3,&#10;  "callDate": "2024-10-15",&#10;  "amount": 25000000&#10;}'
                        className="font-mono text-sm min-h-[250px]"
                        value={rawInput}
                        onChange={(e) => setRawInput(e.target.value)}
                      />
                    </TabsContent>
                  </Tabs>
                </div>

                {/* Validation Status */}
                <div className="flex items-center gap-2">
                  {rawInput && (
                    parseError ? (
                      <>
                        <XCircle className="w-4 h-4 text-red-500" />
                        <span className="text-sm text-red-500">{parseError}</span>
                      </>
                    ) : parsedData ? (
                      <>
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span className="text-sm text-green-500">
                          Valid {inputMode === 'paste' ? 'CSV/TSV' : 'JSON'} data
                        </span>
                      </>
                    ) : null
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Preview Panel */}
          <motion.div
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TableIcon className="w-5 h-5 text-primary" />
                  Data Preview
                </CardTitle>
                <CardDescription>
                  Preview how your data will be published
                </CardDescription>
              </CardHeader>
              <CardContent>
                {parsedData ? (
                  <div className="space-y-4">
                    {/* Data Preview */}
                    <div className="code-block max-h-[350px] overflow-auto">
                      <pre className="text-xs">
                        {JSON.stringify(parsedData, null, 2)}
                      </pre>
                    </div>

                    {/* Publish Button */}
                    <Button
                      className="w-full"
                      size="lg"
                      disabled={!isValid || publishing}
                      onClick={handlePublish}
                    >
                      {publishing ? (
                        <>Publishing...</>
                      ) : (
                        <>
                          <Send className="w-4 h-4 mr-2" />
                          SIGN & PUBLISH
                        </>
                      )}
                    </Button>

                    {/* Publish Result */}
                    {publishResult && (
                      <div
                        className={`flex items-center gap-2 p-3 rounded-lg ${
                          publishResult.success
                            ? 'bg-green-500/20 text-green-400'
                            : 'bg-red-500/20 text-red-400'
                        }`}
                      >
                        {publishResult.success ? (
                          <CheckCircle className="w-4 h-4" />
                        ) : (
                          <AlertCircle className="w-4 h-4" />
                        )}
                        <span>{publishResult.message}</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="empty-state">
                    <p>Enter data to see preview</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </main>
    </div>
  )
}

