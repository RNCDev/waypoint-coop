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
  Send,
  Activity,
  BarChart3,
  ArrowUp
} from 'lucide-react'

interface ActivityMetrics {
  organizations: { daily: number; weekly: number; monthly: number; annual: number; inception: number }
  assets: { daily: number; weekly: number; monthly: number; annual: number; inception: number }
  dataPackets: { daily: number; weekly: number; monthly: number; annual: number; inception: number }
}

interface RecentActivity {
  id: string
  action: string
  entityType: string
  createdAt: string
  actor?: { name: string }
  organization?: { name: string; type: string }
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

// Get user profile image - only use database-stored images, never use external URLs to avoid cartoon placeholder flash
function getUserProfileImage(userId: string, fallbackUrl?: string, hasDatabaseImage?: boolean): string | null {
  if (hasDatabaseImage) {
    return `/api/images/user/${userId}`
  }
  // Don't use fallback URLs (like Dicebear) - show initial letter instead
  return null
}

export default function DashboardPage() {
  const { currentPersona, navItems } = useAuthStore()
  const [activity, setActivity] = useState<ActivityMetrics | null>(null)
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [recentDataPackets, setRecentDataPackets] = useState<RecentDataPacket[]>([])
  const [loading, setLoading] = useState(true)
  const [userHasDatabaseImage, setUserHasDatabaseImage] = useState(false)
  const [imageCheckComplete, setImageCheckComplete] = useState(false)
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([])

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
      } finally {
        setImageCheckComplete(true)
      }
    }
    setImageCheckComplete(false)
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

          // Fetch recent activity
          const activityRes = await fetch('/api/audit?limit=10')
          const activityData = await activityRes.json()
          setRecentActivity(activityData.logs || [])
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
              // Only check for image URL after we've completed the image check to avoid showing cartoon placeholder
              const profileImageUrl = imageCheckComplete 
                ? getUserProfileImage(
                    currentPersona.userId,
                    currentPersona.userPictureUrl,
                    userHasDatabaseImage
                  )
                : null
              return (
                <div className="flex items-center gap-5 mb-3">
                  {profileImageUrl ? (
                    <div className="w-[84px] h-[84px] rounded-full overflow-hidden relative flex-shrink-0 ring-2 ring-primary/20">
                      <Image
                        src={profileImageUrl}
                        alt={currentPersona.userName}
                        fill
                        className="object-cover"
                        unoptimized
                        priority
                      />
                    </div>
                  ) : (
                    <div className="w-[84px] h-[84px] rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                      <span className="text-3xl font-medium">
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

          {/* Key Metrics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
            >
              <Card className="border-border/50 hover:border-primary/30 transition-colors">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-end mb-4">
                    {activity && activity.organizations.weekly > activity.organizations.daily && (
                      <div className="flex items-center gap-1 text-green-400 text-sm">
                        <ArrowUp className="w-4 h-4" />
                        <span>{Math.round(((activity.organizations.weekly - activity.organizations.daily) / Math.max(activity.organizations.daily, 1)) * 100)}%</span>
                      </div>
                    )}
                  </div>
                  <div className="space-y-1">
                    <p className="text-3xl font-bold">{activity?.organizations.inception ?? 0}</p>
                    <p className="text-sm text-muted-foreground">Organizations</p>
                    <div className="flex gap-4 text-xs text-muted-foreground mt-2">
                      <span>+{activity?.organizations.monthly ?? 0} this month</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
            >
              <Card className="border-border/50 hover:border-primary/30 transition-colors">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-end mb-4">
                    {activity && activity.assets.weekly > activity.assets.daily && (
                      <div className="flex items-center gap-1 text-green-400 text-sm">
                        <ArrowUp className="w-4 h-4" />
                        <span>{Math.round(((activity.assets.weekly - activity.assets.daily) / Math.max(activity.assets.daily, 1)) * 100)}%</span>
                      </div>
                    )}
                  </div>
                  <div className="space-y-1">
                    <p className="text-3xl font-bold">{activity?.assets.inception ?? 0}</p>
                    <p className="text-sm text-muted-foreground">Assets</p>
                    <div className="flex gap-4 text-xs text-muted-foreground mt-2">
                      <span>+{activity?.assets.monthly ?? 0} this month</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.3 }}
            >
              <Card className="border-border/50 hover:border-primary/30 transition-colors">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-end mb-4">
                    {activity && activity.dataPackets.weekly > activity.dataPackets.daily && (
                      <div className="flex items-center gap-1 text-green-400 text-sm">
                        <ArrowUp className="w-4 h-4" />
                        <span>{Math.round(((activity.dataPackets.weekly - activity.dataPackets.daily) / Math.max(activity.dataPackets.daily, 1)) * 100)}%</span>
                      </div>
                    )}
                  </div>
                  <div className="space-y-1">
                    <p className="text-3xl font-bold">{activity?.dataPackets.inception ?? 0}</p>
                    <p className="text-sm text-muted-foreground">Data Packets</p>
                    <div className="flex gap-4 text-xs text-muted-foreground mt-2">
                      <span>+{activity?.dataPackets.monthly ?? 0} this month</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Growth Trends */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.4 }}
            >
              <Card className="border-border/50">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-primary" />
                    <CardTitle>Growth Trends</CardTitle>
                  </div>
                  <CardDescription>Activity over time periods</CardDescription>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="py-12 text-center text-muted-foreground">Loading...</div>
                  ) : activity ? (
                    <div className="space-y-6">
                      {[
                        { label: 'Organizations', data: activity.organizations, color: 'bg-blue-500' },
                        { label: 'Assets', data: activity.assets, color: 'bg-purple-500' },
                        { label: 'Data Packets', data: activity.dataPackets, color: 'bg-green-500' },
                      ].map(({ label, data, color }) => {
                        const max = Math.max(data.daily, data.weekly, data.monthly, data.annual, 1)
                        return (
                          <div key={label} className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                              <span className="font-medium">{label}</span>
                              <span className="text-muted-foreground font-mono">{data.monthly}</span>
                            </div>
                            <div className="flex gap-2 h-3">
                              <div className={`${color} rounded-full`} style={{ width: `${(data.daily / max) * 100}%`, opacity: 0.6 }} />
                              <div className={`${color} rounded-full`} style={{ width: `${(data.weekly / max) * 100}%`, opacity: 0.7 }} />
                              <div className={`${color} rounded-full`} style={{ width: `${(data.monthly / max) * 100}%`, opacity: 0.8 }} />
                              <div className={`${color} rounded-full`} style={{ width: `${(data.annual / max) * 100}%`, opacity: 0.9 }} />
                              <div className={`${color} rounded-full flex-1`} style={{ opacity: 1 }} />
                            </div>
                            <div className="flex gap-4 text-xs text-muted-foreground">
                              <span>D: {data.daily}</span>
                              <span>W: {data.weekly}</span>
                              <span>M: {data.monthly}</span>
                              <span>Y: {data.annual}</span>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  ) : null}
                </CardContent>
              </Card>
            </motion.div>

            {/* Recent Activity */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.5 }}
            >
              <Card className="border-border/50">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Activity className="w-5 h-5 text-primary" />
                      <CardTitle>Recent Activity</CardTitle>
                    </div>
                    <Link href="/audit">
                      <Button variant="ghost" size="sm" className="gap-2">
                        View All
                        <ArrowRight className="w-4 h-4" />
                      </Button>
                    </Link>
                  </div>
                  <CardDescription>Latest platform events and actions</CardDescription>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="py-12 text-center text-muted-foreground">Loading...</div>
                  ) : recentActivity.length > 0 ? (
                    <div className="space-y-3">
                      {recentActivity.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center gap-4 p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors"
                        >
                          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <Activity className="w-5 h-5 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <Badge variant="outline" className="text-xs">
                                {item.action}
                              </Badge>
                              <span className="text-sm font-medium">{item.entityType}</span>
                              {item.actor && (
                                <span className="text-xs text-muted-foreground">by {item.actor.name}</span>
                              )}
                              {item.organization && (
                                <span className="text-xs text-muted-foreground">• {item.organization.name}</span>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                              {formatDate(item.createdAt)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="py-12 text-center text-muted-foreground">No recent activity</div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>
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
            // Only check for image URL after we've completed the image check to avoid showing cartoon placeholder
            const profileImageUrl = imageCheckComplete 
              ? getUserProfileImage(
                  currentPersona.userId,
                  currentPersona.userPictureUrl,
                  userHasDatabaseImage
                )
              : null
            return (
              <div className="flex items-center gap-5 mb-3">
                {profileImageUrl ? (
                  <div className="w-[84px] h-[84px] rounded-full overflow-hidden relative flex-shrink-0 ring-2 ring-primary/20">
                    <Image
                      src={profileImageUrl}
                      alt={currentPersona.userName}
                      fill
                      className="object-cover"
                      unoptimized
                      priority
                    />
                  </div>
                ) : (
                  <div className="w-[84px] h-[84px] rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-3xl font-medium">
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
