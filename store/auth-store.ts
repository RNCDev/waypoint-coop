import { create } from 'zustand'
import { User, Organization } from '@/types'
import { mockUsers, mockOrganizations } from '@/lib/mock-data'
import { Permission, AuthContext } from '@/types/iam'
import { getRolePermissions } from '@/lib/iam/permissions'

interface AuthState {
  currentUser: User | null
  currentOrg: Organization | null
  sessionId: string | null
  setPersona: (userId: number) => void
  setSession: (sessionId: string) => void
  clearSession: () => void
  getAuthContext: () => AuthContext | null
  getPermissions: () => Permission[]
  hasPermission: (permission: Permission) => boolean
  personas: { user: User; org: Organization }[]
}

const personas = [
  { userId: 501 },
  { userId: 521 },
  { userId: 502 },
  { userId: 503 },
  { userId: 504 },
]

export const useAuthStore = create<AuthState>((set, get) => {
  const initialUser = mockUsers.find(u => u.id === 501)!
  const initialOrg = mockOrganizations.find(o => o.id === initialUser.orgId)!

  return {
    currentUser: initialUser,
    currentOrg: initialOrg,
    sessionId: null,
    personas: personas.map(({ userId }) => {
      const user = mockUsers.find(u => u.id === userId)!
      const org = mockOrganizations.find(o => o.id === user.orgId)!
      return { user, org }
    }),
    setPersona: (userId: number) => {
      const user = mockUsers.find(u => u.id === userId)
      if (user) {
        const org = mockOrganizations.find(o => o.id === user.orgId)!
        set({ currentUser: user, currentOrg: org })
      }
    },
    setSession: (sessionId: string) => {
      set({ sessionId })
    },
    clearSession: () => {
      set({ sessionId: null })
    },
    getAuthContext: () => {
      const state = get()
      if (!state.currentUser || !state.currentOrg) return null
      
      return {
        userId: state.currentUser.id,
        orgId: state.currentUser.orgId,
        role: state.currentUser.role,
        permissions: getRolePermissions(state.currentUser.role),
        sessionId: state.sessionId || undefined,
      }
    },
    getPermissions: () => {
      const state = get()
      if (!state.currentUser) return []
      return getRolePermissions(state.currentUser.role)
    },
    hasPermission: (permission: Permission) => {
      const permissions = get().getPermissions()
      return permissions.includes('admin:all') || permissions.includes(permission)
    },
  }
})

