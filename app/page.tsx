'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Navbar } from '@/components/shared/navbar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useAuthStore } from '@/store/auth-store'
import {
  Building2,
  FileText,
  Shield,
  Users,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
} from 'lucide-react'
import Link from 'next/link'

interface DashboardStats {
  organizations: number
  assets: number
  activeGrants: number
  pendingGrants: number
  envelopes: number
  subscriptions: number
}

export default function DashboardPage() {
  const { currentPersona, permissions, navItems } = useAuthStore()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchStats() {
      try {
        const [orgsRes, assetsRes, grantsRes, envelopesRes, subscriptionsRes] = await Promise.all([
          fetch('/api/organizations'),
          fetch('/api/assets'),
          fetch('/api/access-grants'),
          fetch('/api/envelopes'),
          fetch('/api/subscriptions'),
        ])

        const orgs = orgsRes.ok ? await orgsRes.json() : []
        const assets = assetsRes.ok ? await assetsRes.json() : []
        const grants = grantsRes.ok ? await grantsRes.json() : []
        const envelopes = envelopesRes.ok ? await envelopesRes.json() : []
        const subscriptions = subscriptionsRes.ok ? await subscriptionsRes.json() : []

        // Ensure we have arrays
        const orgsArray = Array.isArray(orgs) ? orgs : []
        const assetsArray = Array.isArray(assets) ? assets : []
        const grantsArray = Array.isArray(grants) ? grants : []
        const envelopesArray = Array.isArray(envelopes) ? envelopes : []
        const subscriptionsArray = Array.isArray(subscriptions) ? subscriptions : []

        setStats({
          organizations: orgsArray.length,
          assets: assetsArray.length,
          activeGrants: grantsArray.filter((g: any) => g.status === 'ACTIVE').length,
          pendingGrants: grantsArray.filter((g: any) => g.status === 'PENDING_APPROVAL').length,
          envelopes: envelopesArray.length,
          subscriptions: subscriptionsArray.length,
        })
      } catch (error) {
        console.error('Error fetching stats:', error)
        // Set empty stats on error
        setStats({
          organizations: 0,
          assets: 0,
          activeGrants: 0,
          pendingGrants: 0,
          envelopes: 0,
          subscriptions: 0,
        })
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  const quickActions = navItems.slice(1) // Skip Dashboard

  return (
    <div className="flex-1 bg-background">
      <Navbar />

      <main className="container mx-auto px-4 py-12 max-w-7xl">
        {/* Header */}
        <motion.div
          className="mb-12"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <h1 className="text-4xl font-semibold mb-3 gradient-text">
            Welcome back, {currentPersona.userName}
          </h1>
          <p className="text-muted-foreground text-base">
            {currentPersona.organizationName}
          </p>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 mb-12"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <StatCard
            icon={<Building2 className="w-4 h-4" />}
            label="Organizations"
            value={stats?.organizations ?? '-'}
            loading={loading}
          />
          <StatCard
            icon={<FileText className="w-4 h-4" />}
            label="Assets"
            value={stats?.assets ?? '-'}
            loading={loading}
          />
          <StatCard
            icon={<Shield className="w-4 h-4" />}
            label="Active Grants"
            value={stats?.activeGrants ?? '-'}
            loading={loading}
            color="text-green-400"
          />
          <StatCard
            icon={<Clock className="w-4 h-4" />}
            label="Pending"
            value={stats?.pendingGrants ?? '-'}
            loading={loading}
            color="text-yellow-400"
          />
          <StatCard
            icon={<TrendingUp className="w-4 h-4" />}
            label="Envelopes"
            value={stats?.envelopes ?? '-'}
            loading={loading}
          />
          <StatCard
            icon={<Users className="w-4 h-4" />}
            label="Subscriptions"
            value={stats?.subscriptions ?? '-'}
            loading={loading}
          />
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <h2 className="text-xl font-semibold mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {quickActions.map((action) => (
              <Link key={action.href} href={action.href}>
                <Card className="card-interactive h-full border-border/50 hover:border-border transition-colors">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base font-normal">{action.label}</CardTitle>
                    <CardDescription className="text-sm">
                      {getActionDescription(action.label)}
                    </CardDescription>
                  </CardHeader>
                </Card>
              </Link>
            ))}
          </div>
        </motion.div>
      </main>
    </div>
  )
}

function StatCard({
  icon,
  label,
  value,
  loading,
  color = 'text-primary',
}: {
  icon: React.ReactNode
  label: string
  value: number | string
  loading: boolean
  color?: string
}) {
  return (
    <Card className="border-border/50">
      <CardContent className="pt-6 pb-6">
        <div className="flex items-center gap-2 mb-3">
          <span className={color}>{icon}</span>
          <span className="text-xs text-muted-foreground font-light">{label}</span>
        </div>
        <div className="text-2xl font-semibold">
          {loading ? (
            <span className="animate-pulse text-muted-foreground">—</span>
          ) : (
            value
          )}
        </div>
      </CardContent>
    </Card>
  )
}


function getActionDescription(label: string): string {
  const descriptions: Record<string, string> = {
    Composer: 'Create and publish data packets to your fund subscribers',
    History: 'View all published envelopes and their versions',
    Ledger: 'Chronological feed of data packets with read tracking',
    Feeds: 'View data from your subscribed funds',
    Subscriptions: 'Manage LP subscriptions to your funds',
    'Access Grants': 'Delegate capabilities to service providers',
    Registry: 'Manage organizations and users in the platform',
    'Audit Log': 'View complete audit trail of all actions',
    IAM: 'Manage users and roles within your organization',
  }
  return descriptions[label] || 'Navigate to this section'
}

