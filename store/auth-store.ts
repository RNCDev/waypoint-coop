import { create } from 'zustand'
import { User, Organization } from '@/types'
import { mockUsers, mockOrganizations } from '@/lib/mock-data'

interface AuthState {
  currentUser: User | null
  currentOrg: Organization | null
  setPersona: (userId: number) => void
  personas: { user: User; org: Organization }[]
}

// Predefined demo personas
const personas = [
  { userId: 501 }, // Alice Admin (Waypoint Platform Admin)
  { userId: 521 }, // Genii Publisher (Genii Admin Services Publisher)
  { userId: 502 }, // Bob GP (Asset Owner)
  { userId: 503 }, // Charlie LP (Subscriber)
  { userId: 504 }, // Dana Delegate (Auditor)
]

export const useAuthStore = create<AuthState>((set) => {
  // Initialize with Alice Admin
  const initialUser = mockUsers.find(u => u.id === 501)!
  const initialOrg = mockOrganizations.find(o => o.id === initialUser.orgId)!

  return {
    currentUser: initialUser,
    currentOrg: initialOrg,
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
  }
})

