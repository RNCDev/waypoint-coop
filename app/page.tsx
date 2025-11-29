'use client'

import { useAuthStore } from '@/store/auth-store'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ArrowRight, Building2, FileSearch, Users, FolderOpen, Send, History, BookOpen, Share2, Shield } from 'lucide-react'
import { motion } from 'framer-motion'
import { useMemo } from 'react'
import { mockDelegations, mockAccessGrants, mockAssets, mockSubscriptions } from '@/lib/mock-data'
import Image from 'next/image'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: [0.25, 0.1, 0.25, 1],
    },
  },
}

// Minimal action card component
function ActionCard({ 
  title, 
  description, 
  href, 
  buttonText, 
  icon: Icon 
}: { 
  title: string
  description: string
  href: string
  buttonText: string
  icon: React.ElementType
}) {
  return (
    <motion.div variants={itemVariants}>
      <Link href={href} className="block group">
        <div className="flex items-start gap-4 p-5 rounded-xl border border-border/40 bg-card/50 hover:bg-card hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300">
          <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
            <Icon className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-foreground group-hover:text-primary transition-colors mb-1">
              {title}
            </h3>
            <p className="text-sm text-muted-foreground line-clamp-2">
              {description}
            </p>
          </div>
          <ArrowRight className="w-4 h-4 text-muted-foreground/50 group-hover:text-primary group-hover:translate-x-1 transition-all flex-shrink-0 mt-1" />
        </div>
      </Link>
    </motion.div>
  )
}

export default function Home() {
  const { currentUser, currentOrg } = useAuthStore()
  
  // Derive roles from relationships (multi-context support)
  const roles = useMemo(() => {
    if (!currentOrg) return { isPlatformAdmin: false, isAssetManager: false, isLimitedPartner: false, isDelegate: false }
    
    const isPlatformAdmin = currentOrg.isPlatformAdmin === true || 
                           currentOrg.type === 'Platform Operator' || 
                           currentOrg.role === 'Platform Admin'
    
    // Check if org manages any assets
    const isAssetManager = mockAssets.some(a => a.ownerId === currentOrg.id)
    
    // Check if org has any active subscriptions
    const isLimitedPartner = mockSubscriptions.some(
      s => s.subscriberId === currentOrg.id && s.status === 'Active'
    )
    
    // Check if org has any active access grants
    const isDelegate = mockAccessGrants.some(
      g => g.granteeId === currentOrg.id && g.status === 'Active'
    )
    
    return { isPlatformAdmin, isAssetManager, isLimitedPartner, isDelegate }
  }, [currentOrg])

  // Check if delegate can request or accept subscriptions (via LP grants)
  const canManageSubscriptions = useMemo(() => {
    if (!currentUser || !currentOrg) return false
    return mockAccessGrants.some(
      g => g.granteeId === currentOrg.id && 
           g.status === 'Active' &&
           !g.canPublish && // LP grant
           g.canManageSubscriptions === true
    )
  }, [currentUser, currentOrg])

  // Check if user can view data
  const canViewData = useMemo(() => {
    if (!currentUser || !currentOrg) return false
    
    // Platform Admins can view everything
    if (roles.isPlatformAdmin) return true
    
    // Asset Managers can always view data for their assets
    if (roles.isAssetManager) return true
    
    // Limited Partners can view data they're subscribed to
    if (roles.isLimitedPartner) return true
    
    // Delegates can view if they have grants with canViewData
    if (roles.isDelegate) {
      return mockAccessGrants.some(
        g => g.granteeId === currentOrg.id && 
             g.status === 'Active' && 
             g.canViewData === true
      )
    }
    
    return false
  }, [currentUser, currentOrg, roles])

  // Check if delegate has publishing rights (GP grants)
  const hasPublishingRights = useMemo(() => {
    if (!currentOrg) return false
    return mockAccessGrants.some(
      g => g.granteeId === currentOrg.id && g.status === 'Active' && g.canPublish
    )
  }, [currentOrg])

  return (
    <div className="min-h-[calc(100vh-4rem)] relative overflow-hidden">
      {/* Logo in upper right */}
      <motion.div
        className="absolute top-0 right-0 pointer-events-none select-none"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 0.05, scale: 1 }}
        transition={{ duration: 1.2, delay: 0.3 }}
      >
        <Image 
          src="/waypoint-logo-dark.svg" 
          alt=""
          width={400}
          height={489}
          className="w-[400px] h-auto"
          priority
        />
      </motion.div>

      <div className="container mx-auto px-4 py-16 relative z-10">
        <div className="max-w-2xl mx-auto">
          {/* User context - prominent but minimal */}
          {currentUser && currentOrg && (
            <motion.div 
              className="mb-12"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-semibold text-sm">
                  {currentUser.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <p className="font-medium text-foreground">{currentUser.name}</p>
                  <p className="text-sm text-muted-foreground">{currentOrg.name}</p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Action cards - Multi-context view based on derived roles */}
          <motion.div 
            className="space-y-3"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
          {/* Waypoint Platform Admin - Registry, Audit, Access Grants, Ledger, IAM */}
          {roles.isPlatformAdmin && (
            <>
              <ActionCard
                icon={Building2}
                title="Entity Registry"
                description="Manage organizations and users across the platform"
                href="/registry"
                buttonText="Open Registry"
              />
              <ActionCard
                icon={FileSearch}
                title="Global Audit"
                description="View system-wide audit log and activity history"
                href="/audit"
                buttonText="View Audit"
              />
              <ActionCard
                icon={Share2}
                title="Access Grants"
                description="View all access grants across the platform"
                href="/access-grants"
                buttonText="View Grants"
              />
              <ActionCard
                icon={BookOpen}
                title="Ledger"
                description="View platform data feed"
                href="/ledger"
                buttonText="Open Ledger"
              />
              <ActionCard
                icon={Shield}
                title="IAM"
                description="Manage Waypoint team members and permissions"
                href="/settings/iam"
                buttonText="Manage IAM"
              />
            </>
          )}

          {/* As Asset Manager - Assets, Subscriptions, Access Grants, Publish Data, History */}
          {!roles.isPlatformAdmin && roles.isAssetManager && (
            <>
              <ActionCard
                icon={FolderOpen}
                title="Assets"
                description="Create and manage your fund assets and their attributes"
                href="/assets"
                buttonText="Asset Registry"
              />
              <ActionCard
                icon={Users}
                title="Subscriptions"
                description="Issue and manage subscriptions for your assets"
                href="/subscriptions"
                buttonText="Manage Subscriptions"
              />
              <ActionCard
                icon={Share2}
                title="Access Grants"
                description="Grant capabilities to delegates for your assets"
                href="/access-grants"
                buttonText="Manage Grants"
              />
              <ActionCard
                icon={Send}
                title="Publish Data"
                description="Compose and publish data packets for your assets"
                href="/composer"
                buttonText="Open Composer"
              />
              <ActionCard
                icon={History}
                title="History"
                description="View history of published data packets and envelopes"
                href="/history"
                buttonText="View History"
              />
            </>
          )}

          {/* As Limited Partner - Subscriptions (Feeds), Access Grants */}
          {!roles.isPlatformAdmin && roles.isLimitedPartner && (
            <>
              <ActionCard
                icon={Users}
                title="Subscriptions"
                description="View and manage your subscription feeds"
                href="/feeds"
                buttonText="View Feeds"
              />
              {/* Only show Access Grants if not already shown as Asset Manager */}
              {!roles.isAssetManager && (
                <ActionCard
                  icon={Share2}
                  title="Access Grants"
                  description="Grant data access to service providers"
                  href="/access-grants"
                  buttonText="Manage Grants"
                />
              )}
            </>
          )}

          {/* As Delegate - Based on grant capabilities */}
          {!roles.isPlatformAdmin && roles.isDelegate && !roles.isAssetManager && !roles.isLimitedPartner && (
            <>
              {/* GP grants - Publishing capabilities */}
              {hasPublishingRights && (
                <>
                  <ActionCard
                    icon={Users}
                    title="Subscriptions"
                    description="View and manage subscriptions for assets you publish"
                    href="/subscriptions"
                    buttonText="Manage Subscriptions"
                  />
                  <ActionCard
                    icon={Send}
                    title="Publish Data"
                    description="Compose and publish data packets for your assets"
                    href="/composer"
                    buttonText="Open Composer"
                  />
                  <ActionCard
                    icon={History}
                    title="History"
                    description="View history of published data packets and envelopes"
                    href="/history"
                    buttonText="View History"
                  />
                </>
              )}
              {/* LP grants - Subscription management on behalf of LPs */}
              {canManageSubscriptions && !hasPublishingRights && (
                <ActionCard
                  icon={Users}
                  title="Subscriptions"
                  description="Manage subscriptions on behalf of subscribers"
                  href="/feeds"
                  buttonText="View Feeds"
                />
              )}
              <ActionCard
                icon={Share2}
                title="Access Grants"
                description="View your access grants"
                href="/access-grants"
                buttonText="View Grants"
              />
            </>
          )}

          {/* Ledger - Show if user can view data */}
          {!roles.isPlatformAdmin && canViewData && (
            <ActionCard
              icon={BookOpen}
              title="Ledger"
              description="View your chronological data feed"
              href="/ledger"
              buttonText="Open Ledger"
            />
          )}

          {/* IAM - Show for org admins (non-platform admin) */}
          {!roles.isPlatformAdmin && currentUser?.isOrgAdmin && (
            <ActionCard
              icon={Shield}
              title="IAM"
              description="Manage team members and organization permissions"
              href="/settings/iam"
              buttonText="Manage IAM"
            />
          )}
        </motion.div>
        </div>
      </div>
    </div>
  )
}

