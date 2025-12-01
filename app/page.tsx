'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import { Navbar } from '@/components/shared/navbar'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useAuthStore } from '@/store/auth-store'
import { 
  Building2, 
  FileText, 
  Shield, 
  Users, 
  ArrowRight,
  Clock,
  TrendingUp,
  Send
} from 'lucide-react'

interface ActivityMetrics {
  organizations: { daily: number; weekly: number; monthly: number; annual: number; inception: number }
  assets: { daily: number; weekly: number; monthly: number; annual: number; inception: number }
  dataPackets: { daily: number; weekly: number; monthly: number; annual: number; inception: number }
}

interface DashboardStats {
  subscriptionsCount: number
  dataPacketsCount: number
  grantsGivenCount: number
  grantsReceivedCount: number
  assetsCount: number
}

interface RecentDataPacket {
  id: string
  type: string
  assetName: string
  publisherName: string
  createdAt: string
}

const TYPE_COLORS: Record<string, string> = {
  CAPITAL_CALL: 'bg-red-500/20 text-red-400 border-red-500/30',
  DISTRIBUTION: 'bg-green-500/20 text-green-400 border-green-500/30',
  FINANCIAL_STATEMENT: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  TAX_DOCUMENT: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  LEGAL_DOCUMENT: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
}

// Get user profile image - check for database-stored image first, then fall back to URL
function getUserProfileImage(userId: string, fallbackUrl?: string, hasDatabaseImage?: boolean): string | null {
  if (hasDatabaseImage) {
    return `/api/images/user/${userId}`
  }
  return fallbackUrl || null
}

export default function DashboardPage() {
  const { currentPersona, navItems } = useAuthStore()
  const [activity, setActivity] = useState<ActivityMetrics | null>(null)
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [recentDataPackets, setRecentDataPackets] = useState<RecentDataPacket[]>([])
  const [loading, setLoading] = useState(true)
  const [userHasDatabaseImage, setUserHasDatabaseImage] = useState(false)

  // Check if user has a database-stored image
  useEffect(() => {
    async function checkUserImage() {
      try {
        const res = await fetch(`/api/users/${currentPersona.userId}`)
        if (res.ok) {
          const user = await res.json()
          setUserHasDatabaseImage(!!user.pictureMime)
        }
      } catch (error) {
        console.error('Error checking user image:', error)
      }
    }
    checkUserImage()
  }, [currentPersona.userId])

  useEffect(() => {
    async function fetchData() {
      try {
        if (currentPersona.organizationType === 'PLATFORM_ADMIN') {
          // Platform admin: fetch activity metrics
          const now = new Date()
          const daily = new Date(now.getTime() - 24 * 60 * 60 * 1000)
          const weekly = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
          const monthly = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
          const annual = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000)

          const [orgsDaily, orgsWeekly, orgsMonthly, orgsAnnual, orgsInception] = await Promise.all([
            fetch(`/api/organizations?countOnly=true&startDate=${daily.toISOString()}`),
            fetch(`/api/organizations?countOnly=true&startDate=${weekly.toISOString()}`),
            fetch(`/api/organizations?countOnly=true&startDate=${monthly.toISOString()}`),
            fetch(`/api/organizations?countOnly=true&startDate=${annual.toISOString()}`),
            fetch(`/api/organizations?countOnly=true`),
          ])

          const [assetsDaily, assetsWeekly, assetsMonthly, assetsAnnual, assetsInception] = await Promise.all([
            fetch(`/api/assets?countOnly=true&startDate=${daily.toISOString()}`),
            fetch(`/api/assets?countOnly=true&startDate=${weekly.toISOString()}`),
            fetch(`/api/assets?countOnly=true&startDate=${monthly.toISOString()}`),
            fetch(`/api/assets?countOnly=true&startDate=${annual.toISOString()}`),
            fetch(`/api/assets?countOnly=true`),
          ])

          const [dataPacketsDaily, dataPacketsWeekly, dataPacketsMonthly, dataPacketsAnnual, dataPacketsInception] = await Promise.all([
            fetch(`/api/audit?entityType=DataPacket&action=PUBLISH&startDate=${daily.toISOString()}`),
            fetch(`/api/audit?entityType=DataPacket&action=PUBLISH&startDate=${weekly.toISOString()}`),
            fetch(`/api/audit?entityType=DataPacket&action=PUBLISH&startDate=${monthly.toISOString()}`),
            fetch(`/api/audit?entityType=DataPacket&action=PUBLISH&startDate=${annual.toISOString()}`),
            fetch(`/api/audit?entityType=DataPacket&action=PUBLISH`),
          ])

          const [
            orgsDailyData, orgsWeeklyData, orgsMonthlyData, orgsAnnualData, orgsInceptionData,
            assetsDailyData, assetsWeeklyData, assetsMonthlyData, assetsAnnualData, assetsInceptionData,
            dataPacketsDailyData, dataPacketsWeeklyData, dataPacketsMonthlyData, dataPacketsAnnualData, dataPacketsInceptionData,
          ] = await Promise.all([
            orgsDaily.json(), orgsWeekly.json(), orgsMonthly.json(), orgsAnnual.json(), orgsInception.json(),
            assetsDaily.json(), assetsWeekly.json(), assetsMonthly.json(), assetsAnnual.json(), assetsInception.json(),
            dataPacketsDaily.json(), dataPacketsWeekly.json(), dataPacketsMonthly.json(), dataPacketsAnnual.json(), dataPacketsInception.json(),
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
            dataPackets: {
              daily: dataPacketsDailyData.total || 0,
              weekly: dataPacketsWeeklyData.total || 0,
              monthly: dataPacketsMonthlyData.total || 0,
              annual: dataPacketsAnnualData.total || 0,
              inception: dataPacketsInceptionData.total || 0,
            },
          })
        } else {
          // Non-admin: fetch persona-specific stats
          const orgId = currentPersona.organizationId
          const isManager = ['GP', 'FUND_ADMIN'].includes(currentPersona.organizationType)

          // Fetch counts in parallel
          const [subsRes, grantsGivenRes, grantsReceivedRes, assetsRes] = await Promise.all([
            fetch(`/api/subscriptions?subscriberId=${orgId}&countOnly=true`),
            fetch(`/api/access-grants?grantorId=${orgId}&countOnly=true`),
            fetch(`/api/access-grants?granteeId=${orgId}&countOnly=true`),
            isManager 
              ? fetch(`/api/assets?managerId=${orgId}&countOnly=true`)
              : fetch(`/api/assets/delegatable?orgId=${orgId}`),
          ])

          const [subsData, grantsGivenData, grantsReceivedData, assetsData] = await Promise.all([
            subsRes.json(),
            grantsGivenRes.json(),
            grantsReceivedRes.json(),
            assetsRes.json(),
          ])

          setStats({
            subscriptionsCount: subsData.count || 0,
            dataPacketsCount: 0, // Will be set from recent data packets
            grantsGivenCount: grantsGivenData.count || 0,
            grantsReceivedCount: grantsReceivedData.count || 0,
            assetsCount: isManager ? (assetsData.count || 0) : (Array.isArray(assetsData) ? assetsData.length : 0),
          })

          // Fetch recent data packets
          let dataPacketsUrl = ''
          if (isManager) {
            dataPacketsUrl = `/api/data-packets?managerId=${orgId}&limit=5`
          } else {
            dataPacketsUrl = `/api/data-packets?subscriberId=${orgId}&limit=5`
          }

          const dataPacketsRes = await fetch(dataPacketsUrl)
          const dataPacketsData = await dataPacketsRes.json()

          const recent = (dataPacketsData.dataPackets || []).map((dp: any) => ({
            id: dp.id,
            type: dp.type,
            assetName: dp.asset?.name || 'Unknown',
            publisherName: dp.publisher?.name || 'Unknown',
            createdAt: dp.createdAt,
          }))

          setRecentDataPackets(recent)
          setStats((prev) => prev ? { ...prev, dataPacketsCount: dataPacketsData.total || 0 } : null)
        }
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [currentPersona.organizationId, currentPersona.organizationType])

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    })
  }

  // Platform Admin Dashboard
  if (currentPersona.organizationType === 'PLATFORM_ADMIN') {
    return (
      <div className="flex-1 bg-background">
        <Navbar />
        <main className="container mx-auto px-4 py-12 max-w-7xl">
          <motion.div
            className="mb-12"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            {(() => {
              const profileImageUrl = getUserProfileImage(
                currentPersona.userId,
                currentPersona.userPictureUrl,
                userHasDatabaseImage
              )
              return (
                <div className="flex items-center gap-4 mb-3">
                  {profileImageUrl ? (
                    <div className="w-14 h-14 rounded-full overflow-hidden relative flex-shrink-0 ring-2 ring-primary/20">
                      <Image
                        src={profileImageUrl}
                        alt={currentPersona.userName}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    </div>
                  ) : (
                    <div className="w-14 h-14 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                      <span className="text-xl font-medium">
                        {currentPersona.userName.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                  <div>
                    <h1 className="text-4xl font-semibold gradient-text">
                      Welcome back, {currentPersona.userName}
                    </h1>
                    <p className="text-muted-foreground text-base">
                      Platform activity monitoring
                    </p>
                  </div>
                </div>
              )
            })()}
          </motion.div>

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
                          <TableCell className="py-5"><span className="text-base font-medium">Organizations</span></TableCell>
                          <TableCell className="text-right font-mono text-base py-5">{activity?.organizations.daily ?? '-'}</TableCell>
                          <TableCell className="text-right font-mono text-base py-5">{activity?.organizations.weekly ?? '-'}</TableCell>
                          <TableCell className="text-right font-mono text-base py-5">{activity?.organizations.monthly ?? '-'}</TableCell>
                          <TableCell className="text-right font-mono text-base py-5">{activity?.organizations.annual ?? '-'}</TableCell>
                          <TableCell className="text-right font-mono text-base py-5">{activity?.organizations.inception ?? '-'}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="py-5"><span className="text-base font-medium">Assets</span></TableCell>
                          <TableCell className="text-right font-mono text-base py-5">{activity?.assets.daily ?? '-'}</TableCell>
                          <TableCell className="text-right font-mono text-base py-5">{activity?.assets.weekly ?? '-'}</TableCell>
                          <TableCell className="text-right font-mono text-base py-5">{activity?.assets.monthly ?? '-'}</TableCell>
                          <TableCell className="text-right font-mono text-base py-5">{activity?.assets.annual ?? '-'}</TableCell>
                          <TableCell className="text-right font-mono text-base py-5">{activity?.assets.inception ?? '-'}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell className="py-5"><span className="text-base font-medium">Data Packets</span></TableCell>
                          <TableCell className="text-right font-mono text-base py-5">{activity?.dataPackets.daily ?? '-'}</TableCell>
                          <TableCell className="text-right font-mono text-base py-5">{activity?.dataPackets.weekly ?? '-'}</TableCell>
                          <TableCell className="text-right font-mono text-base py-5">{activity?.dataPackets.monthly ?? '-'}</TableCell>
                          <TableCell className="text-right font-mono text-base py-5">{activity?.dataPackets.annual ?? '-'}</TableCell>
                          <TableCell className="text-right font-mono text-base py-5">{activity?.dataPackets.inception ?? '-'}</TableCell>
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

  // Non-admin Dashboard
  const isManager = ['GP', 'FUND_ADMIN'].includes(currentPersona.organizationType)

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
          {(() => {
            const profileImageUrl = getUserProfileImage(
              currentPersona.userId,
              currentPersona.userPictureUrl,
              userHasDatabaseImage
            )
            return (
              <div className="flex items-center gap-4 mb-3">
                {profileImageUrl ? (
                  <div className="w-14 h-14 rounded-full overflow-hidden relative flex-shrink-0 ring-2 ring-primary/20">
                    <Image
                      src={profileImageUrl}
                      alt={currentPersona.userName}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                ) : (
                  <div className="w-14 h-14 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-xl font-medium">
                      {currentPersona.userName.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                <div>
                  <h1 className="text-4xl font-semibold gradient-text">
                    Welcome back, {currentPersona.userName}
                  </h1>
                  <p className="text-muted-foreground text-base">
                    {currentPersona.organizationName}
                  </p>
                </div>
              </div>
            )
          })()}
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          {isManager && (
            <Card className="border-border/50">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-500/10">
                    <Building2 className="w-5 h-5 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stats?.assetsCount ?? '-'}</p>
                    <p className="text-xs text-muted-foreground">Managed Assets</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <Card className="border-border/50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-green-500/10">
                  <Users className="w-5 h-5 text-green-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats?.subscriptionsCount ?? '-'}</p>
                  <p className="text-xs text-muted-foreground">Subscriptions</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-purple-500/10">
                  <FileText className="w-5 h-5 text-purple-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats?.dataPacketsCount ?? '-'}</p>
                  <p className="text-xs text-muted-foreground">Data Packets</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-yellow-500/10">
                  <Shield className="w-5 h-5 text-yellow-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{(stats?.grantsGivenCount ?? 0) + (stats?.grantsReceivedCount ?? 0)}</p>
                  <p className="text-xs text-muted-foreground">Access Grants</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Activity */}
          <motion.div
            className="lg:col-span-2"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            <Card className="border-border/50">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Clock className="w-5 h-5 text-primary" />
                      Recent Data Packets
                    </CardTitle>
                    <CardDescription>Latest activity in your network</CardDescription>
                  </div>
                  <Link href="/history">
                    <Button variant="ghost" size="sm" className="gap-1">
                      View All <ArrowRight className="w-4 h-4" />
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="empty-state py-8">
                    <p>Loading...</p>
                  </div>
                ) : recentDataPackets.length === 0 ? (
                  <div className="empty-state py-8">
                    <FileText className="w-10 h-10 mx-auto mb-3 text-muted-foreground" />
                    <p>No recent data packets</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {recentDataPackets.map((dp) => (
                      <div
                        key={dp.id}
                        className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <Badge
                            variant="outline"
                            className={`text-xs ${TYPE_COLORS[dp.type] || ''}`}
                          >
                            {dp.type.replace('_', ' ')}
                          </Badge>
                          <div>
                            <p className="text-sm font-medium">{dp.assetName}</p>
                            <p className="text-xs text-muted-foreground">by {dp.publisherName}</p>
                          </div>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {formatDate(dp.createdAt)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
          >
            <Card className="border-border/50">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-primary" />
                  Quick Actions
                </CardTitle>
                <CardDescription>Common tasks for your role</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {isManager && navItems.find((item) => item.href === '/composer') && (
                  <Link href="/composer" className="block">
                    <Button variant="outline" className="w-full justify-start gap-2">
                      <Send className="w-4 h-4" />
                      Publish Data Packet
                    </Button>
                  </Link>
                )}

                {navItems.find((item) => item.href === '/access-grants') && (
                  <Link href="/access-grants" className="block">
                    <Button variant="outline" className="w-full justify-start gap-2">
                      <Shield className="w-4 h-4" />
                      Manage Access Grants
                    </Button>
                  </Link>
                )}

                {navItems.find((item) => item.href === '/subscriptions') && (
                  <Link href="/subscriptions" className="block">
                    <Button variant="outline" className="w-full justify-start gap-2">
                      <Users className="w-4 h-4" />
                      View Subscriptions
                    </Button>
                  </Link>
                )}

                <Link href="/history" className="block">
                  <Button variant="outline" className="w-full justify-start gap-2">
                    <FileText className="w-4 h-4" />
                    View History
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </main>
    </div>
  )
}
