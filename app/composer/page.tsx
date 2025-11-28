'use client'

import { useState } from 'react'
import { useAuthStore } from '@/store/auth-store'
import { mockAssets, mockOrganizations } from '@/lib/mock-data'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import Papa from 'papaparse'
import { format } from 'date-fns'
import { Download, CheckCircle2, XCircle } from 'lucide-react'

export default function ComposerPage() {
  const { currentUser, currentOrg } = useAuthStore()
  const [inputData, setInputData] = useState('')
  const [parsedData, setParsedData] = useState<any[]>([])
  const [isValidJson, setIsValidJson] = useState<boolean | null>(null)
  const [selectedAssetOwner, setSelectedAssetOwner] = useState<string>('')
  const [selectedAsset, setSelectedAsset] = useState<string>('')
  const [tags, setTags] = useState('')
  const [isPublishing, setIsPublishing] = useState(false)

  const handleSmartPaste = () => {
    if (!inputData.trim()) {
      setIsValidJson(null)
      setParsedData([])
      return
    }

    try {
      const parsed = Papa.parse(inputData, {
        header: true,
        skipEmptyLines: true,
        transformHeader: (header) => header.trim(),
      })

      if (parsed.errors.length > 0) {
        setIsValidJson(false)
        setParsedData([])
        return
      }

      const data = parsed.data as any[]
      setParsedData(data)
      setIsValidJson(true)
    } catch (error) {
      setIsValidJson(false)
      setParsedData([])
    }
  }

  const handleRawJson = () => {
    if (!inputData.trim()) {
      setIsValidJson(null)
      setParsedData([])
      return
    }

    try {
      const parsed = JSON.parse(inputData)
      const data = Array.isArray(parsed) ? parsed : [parsed]
      setParsedData(data)
      setIsValidJson(true)
    } catch (error) {
      setIsValidJson(false)
      setParsedData([])
    }
  }

  const handlePublish = async () => {
    if (!selectedAsset || !parsedData.length || !isValidJson) return

    setIsPublishing(true)
    try {
      const asset = mockAssets.find(a => a.id === parseInt(selectedAsset))
      const assetOwner = mockOrganizations.find(o => o.id === asset?.ownerId)
      const timestamp = new Date().toISOString()
      const dataType = tags.split(',').find(t => t.trim().toUpperCase().includes('CAPITAL')) ? 'CAPITAL_CALL' : undefined

      // Extract LP IDs from parsed data and create one envelope per LP
      const lpIds = new Set<number>()
      parsedData.forEach((row: any) => {
        if (row.lp_id) lpIds.add(parseInt(row.lp_id))
        if (row.lpId) lpIds.add(parseInt(row.lpId))
      })

      if (lpIds.size === 0) {
        alert('No LP IDs found in data. Please include lp_id or lpId fields.')
        setIsPublishing(false)
        return
      }

      // Create one envelope per LP with LP-specific payload
      const envelopesToCreate = Array.from(lpIds).map(lpId => {
        // Extract LP-specific data from parsed data
        const lpPayload = parsedData.filter((row: any) => 
          parseInt(row.lp_id) === lpId || parseInt(row.lpId) === lpId
        )

        // Build payload structure based on data type
        let payload: any = {}
        if (dataType === 'CAPITAL_CALL' || parsedData[0]?.amount) {
          // Capital Call structure
          payload = {
            currency: parsedData[0]?.currency || 'USD',
            due_date: parsedData[0]?.due_date || parsedData[0]?.dueDate,
            bank_details: parsedData[0]?.bank_details || parsedData[0]?.bankDetails || {},
            line_items: lpPayload,
          }
        } else {
          // Generic structure - use LP-specific rows
          payload = lpPayload.length === 1 ? lpPayload[0] : lpPayload
        }

        return {
          publisherId: currentOrg?.id || 1001,
          userId: currentUser?.id || 501,
          assetOwnerId: asset?.ownerId || 2001,
          assetId: parseInt(selectedAsset),
          timestamp,
          recipientId: lpId, // One envelope per LP
          dataType,
          payload,
        }
      })

      const response = await fetch('/api/envelopes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(envelopesToCreate), // Batch create
      })

      if (response.ok) {
        const result = await response.json()
        const count = Array.isArray(result) ? result.length : 1
        alert(`Successfully published ${count} envelope(s) (one per LP)!`)
        setInputData('')
        setParsedData([])
        setSelectedAsset('')
        setTags('')
      } else {
        const error = await response.json()
        alert(`Failed to publish: ${error.error || 'Unknown error'}`)
      }
    } catch (error) {
      console.error('Error publishing:', error)
      alert('Error publishing envelope')
    } finally {
      setIsPublishing(false)
    }
  }

  const downloadTemplate = () => {
    const template = 'LP ID\tLP Name\tAmount\tCurrency\tDue Date\nlp_001\tExample LP\t1000000.00\tUSD\t2025-12-31'
    const blob = new Blob([template], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'waypoint-template.txt'
    a.click()
    URL.revokeObjectURL(url)
  }

  const availableAssets = mockAssets.filter(a => 
    a.publisherId === currentOrg?.id || a.ownerId === currentOrg?.id
  )

  const assetOwners = Array.from(new Set(availableAssets.map(a => a.ownerId)))
    .map(id => mockOrganizations.find(o => o.id === id))
    .filter(Boolean)

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Composer</h1>
        <p className="text-muted-foreground">Create and publish data packets</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Data Input</CardTitle>
            <CardDescription>
              Paste Excel/CSV data or enter raw JSON
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="smart-paste">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="smart-paste">Smart Paste</TabsTrigger>
                <TabsTrigger value="raw-json">Raw JSON</TabsTrigger>
              </TabsList>
              <TabsContent value="smart-paste" className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Paste tab-separated data</Label>
                  <Button variant="outline" size="sm" onClick={downloadTemplate}>
                    <Download className="h-4 w-4 mr-2" />
                    Download Template
                  </Button>
                </div>
                <Textarea
                  placeholder="Paste Excel data here..."
                  value={inputData}
                  onChange={(e) => setInputData(e.target.value)}
                  className="min-h-[300px] font-mono text-sm"
                />
                <Button onClick={handleSmartPaste} className="w-full">
                  Parse Data
                </Button>
              </TabsContent>
              <TabsContent value="raw-json" className="space-y-4">
                <Label>Enter JSON data</Label>
                <Textarea
                  placeholder='[{"key": "value"}]'
                  value={inputData}
                  onChange={(e) => setInputData(e.target.value)}
                  className="min-h-[300px] font-mono text-sm"
                />
                <Button onClick={handleRawJson} className="w-full">
                  Validate JSON
                </Button>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Preview</CardTitle>
            <CardDescription>
              {isValidJson === null && 'Enter data to see preview'}
              {isValidJson === true && (
                <span className="text-green-600 flex items-center gap-1">
                  <CheckCircle2 className="h-4 w-4" />
                  Valid JSON
                </span>
              )}
              {isValidJson === false && (
                <span className="text-red-600 flex items-center gap-1">
                  <XCircle className="h-4 w-4" />
                  Syntax Error
                </span>
              )}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {parsedData.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="border-b">
                      {Object.keys(parsedData[0]).map((key) => (
                        <th key={key} className="text-left p-2 font-semibold">
                          {key}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {parsedData.slice(0, 10).map((row, idx) => (
                      <tr key={idx} className="border-b">
                        {Object.values(row).map((val: any, i) => (
                          <td key={i} className="p-2">
                            {String(val)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
                {parsedData.length > 10 && (
                  <p className="text-sm text-muted-foreground mt-2">
                    Showing first 10 of {parsedData.length} rows
                  </p>
                )}
              </div>
            ) : (
              <div className="text-center text-muted-foreground py-12">
                No data to preview
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Envelope Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Publisher Entity</Label>
              <Input value={currentOrg?.name || ''} disabled />
            </div>
            <div className="space-y-2">
              <Label>Asset Owner</Label>
              <Select value={selectedAssetOwner} onValueChange={setSelectedAssetOwner}>
                <SelectTrigger>
                  <SelectValue placeholder="Select asset owner" />
                </SelectTrigger>
                <SelectContent>
                  {assetOwners.map((owner) => (
                    <SelectItem key={owner?.id} value={String(owner?.id)}>
                      {owner?.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Select Asset</Label>
              <Select
                value={selectedAsset}
                onValueChange={setSelectedAsset}
                disabled={!selectedAssetOwner}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select asset" />
                </SelectTrigger>
                <SelectContent>
                  {availableAssets
                    .filter(a => !selectedAssetOwner || a.ownerId === parseInt(selectedAssetOwner))
                    .map((asset) => (
                      <SelectItem key={asset.id} value={String(asset.id)}>
                        {asset.name} ({asset.type})
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Tags (Optional)</Label>
              <Input
                placeholder="Q3, CapCall, etc."
                value={tags}
                onChange={(e) => setTags(e.target.value)}
              />
            </div>
          </div>
          <div className="flex justify-end">
            <Button
              onClick={handlePublish}
              disabled={!selectedAsset || !parsedData.length || !isValidJson || isPublishing}
              size="lg"
            >
              {isPublishing ? 'Publishing...' : 'SIGN & PUBLISH'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

