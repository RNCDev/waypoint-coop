import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { OrgType, UserRole } from '@prisma/client'

/**
 * Demo persona for the persona switcher
 */
export interface Persona {
  userId: string
  userName: string
  userEmail: string
  userRole: UserRole
  userPictureUrl?: string
  userNarrative?: string
  organizationId: string
  organizationName: string
  organizationType: OrgType
  description: string
}

/**
 * Predefined demo personas matching the seed data
 */
export const DEMO_PERSONAS: Persona[] = [
  {
    userId: 'user_alice',
    userName: 'Alice Admin',
    userEmail: 'alice@waypoint.coop',
    userRole: UserRole.ADMIN,
    userNarrative: 'Platform Operations Lead at Waypoint. Passionate about building infrastructure that makes private markets more accessible and transparent.',
    organizationId: 'org_waypoint',
    organizationName: 'Waypoint Cooperative',
    organizationType: OrgType.PLATFORM_ADMIN,
    description: 'Platform Admin - Manages registry, audit logs, and IAM',
  },
  {
    userId: 'user_bob',
    userName: 'Bob GP',
    userEmail: 'bob@kleinerperkins.com',
    userRole: UserRole.ADMIN,
    userNarrative: 'Partner at Kleiner Perkins focused on enterprise software and fintech investments.',
    organizationId: 'org_kp',
    organizationName: 'Kleiner Perkins',
    organizationType: OrgType.GP,
    description: 'Asset Manager - Manages subscriptions, grants, publishes data',
  },
  {
    userId: 'user_genii',
    userName: 'Genii Publisher',
    userEmail: 'publisher@genii.com',
    userRole: UserRole.ADMIN,
    userNarrative: 'Senior Fund Administrator managing reporting and investor communications for top-tier VC funds.',
    organizationId: 'org_genii',
    organizationName: 'Genii Admin Services',
    organizationType: OrgType.FUND_ADMIN,
    description: 'Fund Admin Delegate - Publishes data on behalf of GPs',
  },
  {
    userId: 'user_charlie',
    userName: 'Charlie LP',
    userEmail: 'charlie@ohiopension.gov',
    userRole: UserRole.ADMIN,
    userNarrative: 'Private Markets Investment Officer overseeing venture capital and private equity allocations for Ohio public employees.',
    organizationId: 'org_ohio',
    organizationName: 'State of Ohio Pension',
    organizationType: OrgType.LP,
    description: 'Limited Partner - Views history, manages access grants',
  },
  {
    userId: 'user_dana',
    userName: 'Dana Delegate',
    userEmail: 'dana@deloitte.com',
    userRole: UserRole.ADMIN,
    userNarrative: 'Senior Auditor specializing in private equity fund audits and SEC compliance reviews.',
    organizationId: 'org_deloitte',
    organizationName: 'Deloitte',
    organizationType: OrgType.AUDITOR,
    description: 'Auditor - Views delegated data for audit purposes',
  },
]

/**
 * Navigation items based on organization type
 */
export interface NavItem {
  label: string
  href: string
  icon?: string
}

/**
 * Get navigation items based on the current persona's organization type
 */
export function getNavItemsForPersona(persona: Persona): NavItem[] {
  const baseItems: NavItem[] = []

  switch (persona.organizationType) {
    case OrgType.PLATFORM_ADMIN:
      return [
        { label: 'Dashboard', href: '/' },
        { label: 'Registry', href: '/registry' },
        { label: 'Audit Log', href: '/audit' },
        { label: 'IAM', href: '/settings/iam' },
      ]

    case OrgType.GP:
      return [
        { label: 'Dashboard', href: '/' },
        { label: 'Registry', href: '/registry' },
        { label: 'Subscriptions', href: '/subscriptions' },
        { label: 'Access Grants', href: '/access-grants' },
        { label: 'Composer', href: '/composer' },
        { label: 'History', href: '/history' },
        { label: 'IAM', href: '/settings/iam' },
      ]

    case OrgType.FUND_ADMIN:
      return [
        { label: 'Dashboard', href: '/' },
        { label: 'Subscriptions', href: '/subscriptions' },
        { label: 'Access Grants', href: '/access-grants' },
        { label: 'Composer', href: '/composer' },
        { label: 'History', href: '/history' },
        { label: 'IAM', href: '/settings/iam' },
      ]

    case OrgType.LP:
      return [
        { label: 'Dashboard', href: '/' },
        { label: 'Subscriptions', href: '/subscriptions' },
        { label: 'Access Grants', href: '/access-grants' },
        { label: 'History', href: '/history' },
        { label: 'IAM', href: '/settings/iam' },
      ]

    case OrgType.AUDITOR:
    case OrgType.CONSULTANT:
    case OrgType.TAX_ADVISOR:
      return [
        { label: 'Dashboard', href: '/' },
        { label: 'Access Grants', href: '/access-grants' },
        { label: 'History', href: '/history' },
        { label: 'IAM', href: '/settings/iam' },
      ]

    default:
      return baseItems
  }
}

/**
 * Permission flags for the current persona
 */
export interface PermissionFlags {
  canPublish: boolean
  canViewHistory: boolean
  canManageSubscriptions: boolean
  canManageGrants: boolean
  canViewRegistry: boolean
  canViewAudit: boolean
  canManageIAM: boolean
}

/**
 * Get permission flags based on organization type
 */
export function getPermissionFlags(orgType: OrgType): PermissionFlags {
  switch (orgType) {
    case OrgType.PLATFORM_ADMIN:
      return {
        canPublish: false,
        canViewHistory: true,
        canManageSubscriptions: false,
        canManageGrants: false,
        canViewRegistry: true,
        canViewAudit: true,
        canManageIAM: true,
      }

    case OrgType.GP:
      return {
        canPublish: true,
        canViewHistory: true,
        canManageSubscriptions: true,
        canManageGrants: true,
        canViewRegistry: true,
        canViewAudit: false,
        canManageIAM: true,
      }

    case OrgType.FUND_ADMIN:
      return {
        canPublish: true, // Delegated
        canViewHistory: true,
        canManageSubscriptions: true, // Delegated
        canManageGrants: false,
        canViewRegistry: false,
        canViewAudit: false,
        canManageIAM: true,
      }

    case OrgType.LP:
      return {
        canPublish: false,
        canViewHistory: true,
        canManageSubscriptions: false,
        canManageGrants: true, // Can delegate to their service providers
        canViewRegistry: false,
        canViewAudit: false,
        canManageIAM: true,
      }

    case OrgType.AUDITOR:
    case OrgType.CONSULTANT:
    case OrgType.TAX_ADVISOR:
      return {
        canPublish: false,
        canViewHistory: true, // Delegated view
        canManageSubscriptions: false,
        canManageGrants: false,
        canViewRegistry: false,
        canViewAudit: false,
        canManageIAM: true,
      }

    default:
      return {
        canPublish: false,
        canViewHistory: false,
        canManageSubscriptions: false,
        canManageGrants: false,
        canViewRegistry: false,
        canViewAudit: false,
        canManageIAM: false,
      }
  }
}

interface AuthState {
  currentPersona: Persona
  setPersona: (persona: Persona) => void
  navItems: NavItem[]
  permissions: PermissionFlags
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      currentPersona: DEMO_PERSONAS[0], // Default to Alice Admin
      navItems: getNavItemsForPersona(DEMO_PERSONAS[0]),
      permissions: getPermissionFlags(DEMO_PERSONAS[0].organizationType),

      setPersona: (persona: Persona) =>
        set({
          currentPersona: persona,
          navItems: getNavItemsForPersona(persona),
          permissions: getPermissionFlags(persona.organizationType),
        }),
    }),
    {
      name: 'waypoint-auth',
      partialize: (state) => ({ currentPersona: state.currentPersona }),
      onRehydrateStorage: () => (state) => {
        if (state?.currentPersona) {
          state.navItems = getNavItemsForPersona(state.currentPersona)
          state.permissions = getPermissionFlags(state.currentPersona.organizationType)
        }
      },
    }
  )
)

