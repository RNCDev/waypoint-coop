'use client'

import { useAuthStore } from '@/store/auth-store'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { motion } from 'framer-motion'
import { useMemo } from 'react'
import { mockDelegations } from '@/lib/mock-data'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: 'easeOut',
    },
  },
}

export default function Home() {
  const { currentUser, currentOrg } = useAuthStore()
  
  // Check if delegate can request or accept subscriptions
  // This checks if they have any delegation (active or pending) with canManageSubscriptions = true
  const canManageSubscriptions = useMemo(() => {
    if (!currentUser || !currentOrg || currentOrg.role !== 'Delegate') return false
    return mockDelegations.some(
      d => d.delegateId === currentOrg.id && 
           (d.status === 'Active' || d.status === 'Pending GP Approval') &&
           d.canManageSubscriptions === true
    )
  }, [currentUser, currentOrg])

  return (
    <div className="container mx-auto px-4 py-12 min-h-[calc(100vh-4rem)]">
      <div className="max-w-4xl mx-auto">
        <motion.div 
          className="text-center mb-12 overflow-visible"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <p className="text-xl text-muted-foreground mb-8 font-light">
            The Digital Clearinghouse for Private Market Data
          </p>
          {currentUser && currentOrg && (
            <motion.div 
              className="inline-flex items-center gap-2 px-4 py-2 bg-card border border-border/50 rounded-lg backdrop-blur-sm"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
            >
              <span className="text-sm text-muted-foreground">Logged in as</span>
              <span className="font-semibold">{currentUser.name}</span>
              <span className="text-muted-foreground">•</span>
              <span>{currentOrg.name}</span>
            </motion.div>
          )}
        </motion.div>

        <motion.div 
          className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Publisher (Fund Admin) - Subscriptions, Publish Data, History, IAM */}
          {currentUser?.role === 'Publisher' && (
            <>
              <motion.div variants={itemVariants}>
                <Card className="group hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10">
                  <CardHeader>
                    <CardTitle className="group-hover:text-primary transition-colors">Subscriptions</CardTitle>
                    <CardDescription className="min-h-[2.5rem]">View and manage subscriptions for assets you publish</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Link href="/subscriptions">
                      <Button className="w-full group/btn" variant="outline">
                        Manage Subscriptions
                        <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              </motion.div>
              <motion.div variants={itemVariants}>
                <Card className="group hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10">
                  <CardHeader>
                    <CardTitle className="group-hover:text-primary transition-colors">Publish Data</CardTitle>
                    <CardDescription className="min-h-[2.5rem]">Compose and publish data packets for your assets</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Link href="/composer">
                      <Button className="w-full group/btn" variant="outline">
                        Open Composer
                        <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              </motion.div>
              <motion.div variants={itemVariants}>
                <Card className="group hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10">
                  <CardHeader>
                    <CardTitle className="group-hover:text-primary transition-colors">History</CardTitle>
                    <CardDescription className="min-h-[2.5rem]">View history of published data packets and envelopes</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Link href="/history">
                      <Button className="w-full group/btn" variant="outline">
                        View History
                        <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              </motion.div>
              {currentUser?.isOrgAdmin && (
                <motion.div variants={itemVariants}>
                  <Card className="group hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10">
                    <CardHeader>
                      <CardTitle className="group-hover:text-primary transition-colors">IAM</CardTitle>
                      <CardDescription className="min-h-[2.5rem]">Manage team members and organization permissions</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Link href="/settings/iam">
                        <Button className="w-full group/btn" variant="outline">
                          Manage IAM
                          <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </>
          )}

          {/* Asset Owner (GP) - Assets, Subscriptions, Delegations, IAM, Publish Data */}
          {currentUser?.role === 'Asset Owner' && (
            <>
              <motion.div variants={itemVariants}>
                <Card className="group hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10">
                  <CardHeader>
                    <CardTitle className="group-hover:text-primary transition-colors">Assets</CardTitle>
                    <CardDescription className="min-h-[2.5rem]">Create and manage your fund assets and their attributes.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Link href="/assets">
                      <Button className="w-full group/btn" variant="outline">
                        Asset Registry
                        <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              </motion.div>
              <motion.div variants={itemVariants}>
                <Card className="group hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10">
                  <CardHeader>
                    <CardTitle className="group-hover:text-primary transition-colors">Subscriptions</CardTitle>
                    <CardDescription className="min-h-[2.5rem]">Issue and manage subscriptions for your assets</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Link href="/subscriptions">
                      <Button className="w-full group/btn" variant="outline">
                        Manage Subscriptions
                        <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              </motion.div>
              <motion.div variants={itemVariants}>
                <Card className="group hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10">
                  <CardHeader>
                    <CardTitle className="group-hover:text-primary transition-colors">Delegations</CardTitle>
                    <CardDescription className="min-h-[2.5rem]">Delegate access permissions to organizations for your assets</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Link href="/data-rights">
                      <Button className="w-full group/btn" variant="outline">
                        Manage Delegations
                        <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              </motion.div>
              {currentUser?.isOrgAdmin && (
                <motion.div variants={itemVariants}>
                  <Card className="group hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10">
                    <CardHeader>
                      <CardTitle className="group-hover:text-primary transition-colors">IAM</CardTitle>
                      <CardDescription className="min-h-[2.5rem]">Manage team members and organization permissions</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Link href="/settings/iam">
                        <Button className="w-full group/btn" variant="outline">
                          Manage IAM
                          <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
              <motion.div variants={itemVariants}>
                <Card className="group hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10">
                  <CardHeader>
                    <CardTitle className="group-hover:text-primary transition-colors">Publish Data</CardTitle>
                    <CardDescription className="min-h-[2.5rem]">Compose and publish data packets for your assets</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Link href="/composer">
                      <Button className="w-full group/btn" variant="outline">
                        Open Composer
                        <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              </motion.div>
              <motion.div variants={itemVariants}>
                <Card className="group hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10">
                  <CardHeader>
                    <CardTitle className="group-hover:text-primary transition-colors">History</CardTitle>
                    <CardDescription className="min-h-[2.5rem]">View history of published data packets and envelopes</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Link href="/history">
                      <Button className="w-full group/btn" variant="outline">
                        View History
                        <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              </motion.div>
            </>
          )}

          {(currentUser?.role === 'Subscriber' || ((currentUser?.role === 'Analytics' || currentUser?.role === 'Auditor') && currentOrg?.role !== 'Delegate')) && (
            <>
              <motion.div variants={itemVariants}>
                <Card className="group hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10">
                  <CardHeader>
                    <CardTitle className="group-hover:text-primary transition-colors">Subscriptions</CardTitle>
                    <CardDescription className="min-h-[2.5rem]">View and manage your subscription feeds</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Link href="/feeds">
                      <Button className="w-full group/btn" variant="outline">
                        View Feeds
                        <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              </motion.div>
              <motion.div variants={itemVariants}>
                <Card className="group hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10">
                  <CardHeader>
                    <CardTitle className="group-hover:text-primary transition-colors">Delegations</CardTitle>
                    <CardDescription className="min-h-[2.5rem]">Manage access to your data with other organizations</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Link href="/delegations">
                      <Button className="w-full group/btn" variant="outline">
                        Manage Delegations
                        <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              </motion.div>
              <motion.div variants={itemVariants}>
                <Card className="group hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10">
                  <CardHeader>
                    <CardTitle className="group-hover:text-primary transition-colors">Ledger</CardTitle>
                    <CardDescription className="min-h-[2.5rem]">View your data feed</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Link href="/ledger">
                      <Button className="w-full group/btn" variant="outline">
                        Open Ledger
                        <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              </motion.div>
              {currentUser?.isOrgAdmin && (
                <motion.div variants={itemVariants}>
                  <Card className="group hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10">
                    <CardHeader>
                      <CardTitle className="group-hover:text-primary transition-colors">IAM</CardTitle>
                      <CardDescription className="min-h-[2.5rem]">Manage team members and organization permissions</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Link href="/settings/iam">
                        <Button className="w-full group/btn" variant="outline">
                          Manage IAM
                          <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </>
          )}

          {/* Delegate - Subscriptions (conditional), Delegations, Ledger, IAM */}
          {currentOrg?.role === 'Delegate' && (
            <>
              {canManageSubscriptions && (
                <motion.div variants={itemVariants}>
                  <Card className="group hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10">
                    <CardHeader>
                      <CardTitle className="group-hover:text-primary transition-colors">Subscriptions</CardTitle>
                      <CardDescription className="min-h-[2.5rem]">Manage subscriptions on behalf of subscribers</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Link href="/feeds">
                        <Button className="w-full group/btn" variant="outline">
                          View Feeds
                          <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
              <motion.div variants={itemVariants}>
                <Card className="group hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10">
                  <CardHeader>
                    <CardTitle className="group-hover:text-primary transition-colors">Delegations</CardTitle>
                    <CardDescription className="min-h-[2.5rem]">View your delegations</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Link href="/delegations">
                      <Button className="w-full group/btn" variant="outline">
                        View Delegations
                        <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              </motion.div>
              <motion.div variants={itemVariants}>
                <Card className="group hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10">
                  <CardHeader>
                    <CardTitle className="group-hover:text-primary transition-colors">Ledger</CardTitle>
                    <CardDescription className="min-h-[2.5rem]">View your data feed</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Link href="/ledger">
                      <Button className="w-full group/btn" variant="outline">
                        Open Ledger
                        <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              </motion.div>
              {currentUser?.isOrgAdmin && (
                <motion.div variants={itemVariants}>
                  <Card className="group hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10">
                    <CardHeader>
                      <CardTitle className="group-hover:text-primary transition-colors">IAM</CardTitle>
                      <CardDescription className="min-h-[2.5rem]">Manage team members and organization permissions</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Link href="/settings/iam">
                        <Button className="w-full group/btn" variant="outline">
                          Manage IAM
                          <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </>
          )}

          {/* Waypoint Platform Admin - Registry, Audit, and IAM */}
          {(currentUser?.role === 'Platform Admin' || currentOrg?.role === 'Platform Admin') && (
            <>
              <motion.div variants={itemVariants}>
                <Card className="group hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10">
                  <CardHeader>
                    <CardTitle className="group-hover:text-primary transition-colors">Entity Registry</CardTitle>
                    <CardDescription className="min-h-[2.5rem]">Manage organizations and users across the platform</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Link href="/registry">
                      <Button className="w-full group/btn" variant="outline">
                        Open Registry
                        <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              </motion.div>
              <motion.div variants={itemVariants}>
                <Card className="group hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10">
                  <CardHeader>
                    <CardTitle className="group-hover:text-primary transition-colors">Global Audit</CardTitle>
                    <CardDescription className="min-h-[2.5rem]">View system-wide audit log and activity history</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Link href="/audit">
                      <Button className="w-full group/btn" variant="outline">
                        View Audit
                        <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              </motion.div>
              <motion.div variants={itemVariants}>
                <Card className="group hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10">
                  <CardHeader>
                    <CardTitle className="group-hover:text-primary transition-colors">IAM</CardTitle>
                    <CardDescription className="min-h-[2.5rem]">Manage Waypoint team members and permissions</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Link href="/settings/iam">
                      <Button className="w-full group/btn" variant="outline">
                        Manage IAM
                        <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              </motion.div>
            </>
          )}
        </motion.div>
      </div>
    </div>
  )
}

