import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { User, Organization } from '@/types'
import { mockUsers, mockOrganizations } from '@/lib/mock-data'

interface AuthState {
  currentUserId: number
  currentUser: User | null
  currentOrg: Organization | null
  _hasHydrated: boolean
  setPersona: (userId: number) => void
  personas: { user: User; org: Organization }[]
}

// Predefined demo personas
const personas = [
  { userId: 501 }, // Alice Admin (Waypoint Platform Admin)
  { userId: 502 }, // Bob GP (Asset Owner)
  { userId: 521 }, // Genii Publisher (Genii Admin Services Publisher)
  { userId: 503 }, // Charlie LP (Subscriber)
  { userId: 504 }, // Dana Delegate (Auditor)
]

// Helper to get user and org from userId
const getUserAndOrg = (userId: number) => {
  const user = mockUsers.find(u => u.id === userId)
  if (user) {
    const org = mockOrganizations.find(o => o.id === user.orgId)!
    return { user, org }
  }
  return null
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => {
      // Default to Alice Admin
      const defaultUserId = 501
      const defaultUserData = getUserAndOrg(defaultUserId)!

      return {
        currentUserId: defaultUserId,
        currentUser: defaultUserData.user,
        currentOrg: defaultUserData.org,
        _hasHydrated: typeof window === 'undefined', // true on server, false on client until hydrated
        personas: personas.map(({ userId }) => {
          const user = mockUsers.find(u => u.id === userId)!
          const org = mockOrganizations.find(o => o.id === user.orgId)!
          return { user, org }
        }),
        setPersona: (userId: number) => {
          const result = getUserAndOrg(userId)
          if (result) {
            set({ 
              currentUserId: userId,
              currentUser: result.user, 
              currentOrg: result.org 
            })
          }
        },
      }
    },
    {
      name: 'waypoint-auth-storage',
      // Only persist the userId, not the full objects (to avoid stale data)
      partialize: (state) => ({ currentUserId: state.currentUserId }),
      // On rehydrate, reconstruct user and org from userId
      onRehydrateStorage: () => (state) => {
        if (state) {
          if (state.currentUserId) {
            const result = getUserAndOrg(state.currentUserId)
            if (result) {
              state.currentUser = result.user
              state.currentOrg = result.org
            } else {
              // Fallback to default if saved userId is invalid
              const defaultUserData = getUserAndOrg(501)!
              state.currentUserId = 501
              state.currentUser = defaultUserData.user
              state.currentOrg = defaultUserData.org
            }
          }
          // Mark as hydrated after rehydration completes (or immediately if no persisted state)
          state._hasHydrated = true
        }
      },
    }
  )
)

