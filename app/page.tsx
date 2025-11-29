'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Navbar } from '@/components/shared/navbar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useAuthStore } from '@/store/auth-store'
import { Activity } from 'lucide-react'

interface ActivityMetrics {
  organizations: { daily: number; weekly: number; monthly: number; annual: number; inception: number }
  assets: { daily: number; weekly: number; monthly: number; annual: number; inception: number }
  envelopes: { daily: number; weekly: number; monthly: number; annual: number; inception: number }
}

export default function DashboardPage() {
  const { currentPersona } = useAuthStore()
  const [activity, setActivity] = useState<ActivityMetrics | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch activity metrics (only for Platform Admin)
        if (currentPersona.organizationType === 'PLATFORM_ADMIN') {
          const now = new Date()
          const daily = new Date(now.getTime() - 24 * 60 * 60 * 1000)
          const weekly = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
          const monthly = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
          const annual = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000)

          // Fetch organizations counts
          const [orgsDaily, orgsWeekly, orgsMonthly, orgsAnnual, orgsInception] = await Promise.all([
            fetch(`/api/organizations?countOnly=true&startDate=${daily.toISOString()}`),
            fetch(`/api/organizations?countOnly=true&startDate=${weekly.toISOString()}`),
            fetch(`/api/organizations?countOnly=true&startDate=${monthly.toISOString()}`),
            fetch(`/api/organizations?countOnly=true&startDate=${annual.toISOString()}`),
            fetch(`/api/organizations?countOnly=true`),
          ])

          // Fetch assets counts
          const [assetsDaily, assetsWeekly, assetsMonthly, assetsAnnual, assetsInception] = await Promise.all([
            fetch(`/api/assets?countOnly=true&startDate=${daily.toISOString()}`),
            fetch(`/api/assets?countOnly=true&startDate=${weekly.toISOString()}`),
            fetch(`/api/assets?countOnly=true&startDate=${monthly.toISOString()}`),
            fetch(`/api/assets?countOnly=true&startDate=${annual.toISOString()}`),
            fetch(`/api/assets?countOnly=true`),
          ])

          // Fetch envelopes counts (using audit logs for PUBLISH action)
          const [envelopesDaily, envelopesWeekly, envelopesMonthly, envelopesAnnual, envelopesInception] = await Promise.all([
            fetch(`/api/audit?entityType=Envelope&action=PUBLISH&startDate=${daily.toISOString()}`),
            fetch(`/api/audit?entityType=Envelope&action=PUBLISH&startDate=${weekly.toISOString()}`),
            fetch(`/api/audit?entityType=Envelope&action=PUBLISH&startDate=${monthly.toISOString()}`),
            fetch(`/api/audit?entityType=Envelope&action=PUBLISH&startDate=${annual.toISOString()}`),
            fetch(`/api/audit?entityType=Envelope&action=PUBLISH`),
          ])

          const [
            orgsDailyData,
            orgsWeeklyData,
            orgsMonthlyData,
            orgsAnnualData,
            orgsInceptionData,
            assetsDailyData,
            assetsWeeklyData,
            assetsMonthlyData,
            assetsAnnualData,
            assetsInceptionData,
            envelopesDailyData,
            envelopesWeeklyData,
            envelopesMonthlyData,
            envelopesAnnualData,
            envelopesInceptionData,
          ] = await Promise.all([
            orgsDaily.json(),
            orgsWeekly.json(),
            orgsMonthly.json(),
            orgsAnnual.json(),
            orgsInception.json(),
            assetsDaily.json(),
            assetsWeekly.json(),
            assetsMonthly.json(),
            assetsAnnual.json(),
            assetsInception.json(),
            envelopesDaily.json(),
            envelopesWeekly.json(),
            envelopesMonthly.json(),
            envelopesAnnual.json(),
            envelopesInception.json(),
          ])

          setActivity({
            organizations: {
              daily: orgsDailyData.count || 0,
              weekly: orgsWeeklyData.count || 0,
              monthly: orgsMonthlyData.count || 0,
              annual: orgsAnnualData.count || 0,
              inception: orgsInceptionData.count || 0,
            },
            assets: {
              daily: assetsDailyData.count || 0,
              weekly: assetsWeeklyData.count || 0,
              monthly: assetsMonthlyData.count || 0,
              annual: assetsAnnualData.count || 0,
              inception: assetsInceptionData.count || 0,
            },
            envelopes: {
              daily: envelopesDailyData.total || 0,
              weekly: envelopesWeeklyData.total || 0,
              monthly: envelopesMonthlyData.total || 0,
              annual: envelopesAnnualData.total || 0,
              inception: envelopesInceptionData.total || 0,
            },
          })
        }
      } catch (error) {
        console.error('Error fetching data:', error)
        setActivity({
          organizations: { daily: 0, weekly: 0, monthly: 0, annual: 0, inception: 0 },
          assets: { daily: 0, weekly: 0, monthly: 0, annual: 0, inception: 0 },
          envelopes: { daily: 0, weekly: 0, monthly: 0, annual: 0, inception: 0 },
        })
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [currentPersona.organizationType])

  // Show admin dashboard for Platform Admin
  if (currentPersona.organizationType === 'PLATFORM_ADMIN') {
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
              Platform activity monitoring
            </p>
          </motion.div>

          {/* Activity Table */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <Card className="border-border/50">
              <CardHeader className="pb-6">
                <CardTitle className="text-xl">Activity Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="empty-state py-12">
                    <p className="text-lg">Loading...</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[250px] text-base font-semibold py-4">Category</TableHead>
                          <TableHead className="text-right text-base font-semibold py-4">Daily</TableHead>
                          <TableHead className="text-right text-base font-semibold py-4">Weekly</TableHead>
                          <TableHead className="text-right text-base font-semibold py-4">Monthly</TableHead>
                          <TableHead className="text-right text-base font-semibold py-4">Annual</TableHead>
                          <TableHead className="text-right text-base font-semibold py-4">Since Inception</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        <TableRow>
                          <TableCell className="py-5">
                            <span className="text-base font-medium">Organizations</span>
                          </TableCell>
                          <TableCell className="text-right font-mono text-base py-5">
                            {activity?.organizations.daily ?? '-'}
                          </TableCell>
                          <TableCell className="text-right font-mono text-base py-5">
                            {activity?.organizations.weekly ?? '-'}
                          </TableCell>
                          <TableCell className="text-right font-mono text-base py-5">
                            {activity?.organizations.monthly ?? '-'}
                          </TableCell>
                          <TableCell className="text-right font-mono text-base py-5">
                            {activity?.organizations.annual ?? '-'}
                          </TableCell>
                          <TableCell className="text-right font-mono text-base py-5">
                            {activity?.organizations.inception ?? '-'}
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="py-5">
                            <span className="text-base font-medium">Assets</span>
                          </TableCell>
                          <TableCell className="text-right font-mono text-base py-5">
                            {activity?.assets.daily ?? '-'}
                          </TableCell>
                          <TableCell className="text-right font-mono text-base py-5">
                            {activity?.assets.weekly ?? '-'}
                          </TableCell>
                          <TableCell className="text-right font-mono text-base py-5">
                            {activity?.assets.monthly ?? '-'}
                          </TableCell>
                          <TableCell className="text-right font-mono text-base py-5">
                            {activity?.assets.annual ?? '-'}
                          </TableCell>
                          <TableCell className="text-right font-mono text-base py-5">
                            {activity?.assets.inception ?? '-'}
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="py-5">
                            <span className="text-base font-medium">Envelopes</span>
                          </TableCell>
                          <TableCell className="text-right font-mono text-base py-5">
                            {activity?.envelopes.daily ?? '-'}
                          </TableCell>
                          <TableCell className="text-right font-mono text-base py-5">
                            {activity?.envelopes.weekly ?? '-'}
                          </TableCell>
                          <TableCell className="text-right font-mono text-base py-5">
                            {activity?.envelopes.monthly ?? '-'}
                          </TableCell>
                          <TableCell className="text-right font-mono text-base py-5">
                            {activity?.envelopes.annual ?? '-'}
                          </TableCell>
                          <TableCell className="text-right font-mono text-base py-5">
                            {activity?.envelopes.inception ?? '-'}
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </main>
      </div>
    )
  }

  // Default dashboard for other personas
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
      </main>
    </div>
  )
}
