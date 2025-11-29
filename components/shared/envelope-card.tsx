'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatDateTime } from '@/lib/utils'
import {
  ChevronDown,
  ChevronUp,
  FileText,
  DollarSign,
  BarChart3,
  FileSpreadsheet,
  Scale,
  CheckCircle,
  Clock,
  AlertCircle,
} from 'lucide-react'

export interface EnvelopeData {
  id: string
  type: string
  payload: Record<string, unknown>
  hash: string
  version: number
  parentId: string | null
  publisherId: string
  publisherName: string
  assetId: string
  assetName: string
  createdAt: string
  isRead?: boolean
}

const typeIcons: Record<string, React.ReactNode> = {
  CAPITAL_CALL: <DollarSign className="w-4 h-4" />,
  DISTRIBUTION: <DollarSign className="w-4 h-4" />,
  FINANCIAL_STATEMENT: <BarChart3 className="w-4 h-4" />,
  TAX_DOCUMENT: <FileSpreadsheet className="w-4 h-4" />,
  LEGAL_DOCUMENT: <Scale className="w-4 h-4" />,
}

const typeColors: Record<string, string> = {
  CAPITAL_CALL: 'bg-red-500/20 text-red-400 border-red-500/30',
  DISTRIBUTION: 'bg-green-500/20 text-green-400 border-green-500/30',
  FINANCIAL_STATEMENT: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  TAX_DOCUMENT: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  LEGAL_DOCUMENT: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
}

const typeLabels: Record<string, string> = {
  CAPITAL_CALL: 'Capital Call',
  DISTRIBUTION: 'Distribution',
  FINANCIAL_STATEMENT: 'Financial Statement',
  TAX_DOCUMENT: 'Tax Document',
  LEGAL_DOCUMENT: 'Legal Document',
}

interface EnvelopeCardProps {
  envelope: EnvelopeData
  onMarkAsRead?: (id: string) => void
  showReadStatus?: boolean
}

export function EnvelopeCard({ envelope, onMarkAsRead, showReadStatus = false }: EnvelopeCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <Card className="card-interactive border-border/50">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
              {typeIcons[envelope.type] || <FileText className="w-4 h-4" />}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1.5">
                <Badge variant="outline" className={`${typeColors[envelope.type]} text-xs font-light`}>
                  {typeLabels[envelope.type] || envelope.type}
                </Badge>
                {envelope.version > 1 && (
                  <Badge variant="outline" className="bg-orange-500/20 text-orange-400 border-orange-500/30 text-xs font-light">
                    v{envelope.version}
                  </Badge>
                )}
              </div>
              <div className="text-sm text-muted-foreground font-light">
                {envelope.assetName} • {envelope.publisherName}
              </div>
            </div>
          </div>

          <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
            {showReadStatus && (
              <div className="flex items-center gap-1.5">
                {envelope.isRead ? (
                  <CheckCircle className="w-3.5 h-3.5 text-green-500" />
                ) : (
                  <Clock className="w-3.5 h-3.5 text-yellow-500" />
                )}
                <span className="text-xs text-muted-foreground font-light">
                  {envelope.isRead ? 'Read' : 'Unread'}
                </span>
              </div>
            )}
            <span className="text-xs text-muted-foreground font-mono font-light">
              {formatDateTime(envelope.createdAt)}
            </span>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {/* Summary Info */}
        <div className="flex items-center gap-4 text-xs text-muted-foreground mb-4 font-light">
          <div className="flex items-center gap-1.5">
            <span>Hash:</span>
            <code className="font-mono bg-secondary/50 px-1.5 py-0.5 rounded text-[11px]">
              {shortHash(envelope.hash)}
            </code>
          </div>
          {envelope.parentId && (
            <div className="flex items-center gap-1.5">
              <AlertCircle className="w-3 h-3 text-orange-400" />
              <span>Correction</span>
            </div>
          )}
        </div>

        {/* Expandable Payload */}
        <div className="border-t border-border/50 pt-4">
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-between font-light text-sm hover:bg-secondary/50"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            <span>
              {isExpanded ? 'Hide Details' : 'Show Details'}
            </span>
            {isExpanded ? (
              <ChevronUp className="w-3.5 h-3.5" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5" />
            )}
          </Button>

          {isExpanded && (
            <div className="mt-4 code-block border border-border/50">
              <pre className="text-xs overflow-x-auto font-mono font-light">
                {JSON.stringify(envelope.payload, null, 2)}
              </pre>
            </div>
          )}
        </div>

        {/* Actions */}
        {showReadStatus && !envelope.isRead && onMarkAsRead && (
          <div className="border-t border-border/50 pt-4 mt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onMarkAsRead(envelope.id)}
              className="w-full font-light border-border/50 hover:bg-secondary/50"
            >
              <CheckCircle className="w-3.5 h-3.5 mr-2" />
              Mark as Read
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// Helper function for short hash display
function shortHash(hash: string): string {
  return hash.slice(0, 8)
}

