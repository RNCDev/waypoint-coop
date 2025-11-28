import { describe, it, expect, beforeEach } from 'vitest'
import { useAuthStore } from '../auth-store'
import { mockUsers, mockOrganizations } from '@/lib/mock-data'

describe('auth-store', () => {
  beforeEach(() => {
    const store = useAuthStore.getState()
    store.setPersona(501)
  })

  describe('initial state', () => {
    it('should initialize with Alice Admin as default user', () => {
      const { currentUser, currentOrg } = useAuthStore.getState()

      expect(currentUser).toBeDefined()
      expect(currentUser?.id).toBe(501)
      expect(currentUser?.name).toBe('Alice Admin')
      expect(currentUser?.email).toBe('alice@waypoint.coop')
      expect(currentUser?.role).toBe('Platform Admin')

      expect(currentOrg).toBeDefined()
      expect(currentOrg?.id).toBe(1)
      expect(currentOrg?.name).toBe('Waypoint Platform')
      expect(currentOrg?.role).toBe('Platform Admin')
    })

    it('should have 5 predefined personas', () => {
      const { personas } = useAuthStore.getState()

      expect(personas).toHaveLength(5)
      expect(personas.map(p => p.user.id)).toEqual([501, 521, 502, 503, 504])
    })
  })

  describe('setPersona', () => {
    it('should switch to Genii Publisher persona (userId 521)', () => {
      const store = useAuthStore.getState()
      store.setPersona(521)

      const { currentUser, currentOrg } = useAuthStore.getState()

      expect(currentUser?.id).toBe(521)
      expect(currentUser?.name).toBe('Genii Publisher')
      expect(currentUser?.email).toBe('publisher@genii.com')
      expect(currentUser?.role).toBe('Publisher')

      expect(currentOrg?.id).toBe(1001)
      expect(currentOrg?.name).toBe('Genii Admin Services')
      expect(currentOrg?.role).toBe('Publisher')
    })

    it('should switch to Bob GP persona (userId 502)', () => {
      const store = useAuthStore.getState()
      store.setPersona(502)

      const { currentUser, currentOrg } = useAuthStore.getState()

      expect(currentUser?.id).toBe(502)
      expect(currentUser?.name).toBe('Bob GP')
      expect(currentUser?.email).toBe('bob@kleinerperkins.com')
      expect(currentUser?.role).toBe('Asset Owner')

      expect(currentOrg?.id).toBe(2001)
      expect(currentOrg?.name).toBe('Kleiner Perkins')
      expect(currentOrg?.role).toBe('Asset Owner')
    })

    it('should switch to Charlie LP persona (userId 503)', () => {
      const store = useAuthStore.getState()
      store.setPersona(503)

      const { currentUser, currentOrg } = useAuthStore.getState()

      expect(currentUser?.id).toBe(503)
      expect(currentUser?.name).toBe('Charlie LP')
      expect(currentUser?.email).toBe('charlie@ohio.gov')
      expect(currentUser?.role).toBe('Subscriber')

      expect(currentOrg?.id).toBe(3001)
      expect(currentOrg?.name).toBe('State of Ohio Pension')
      expect(currentOrg?.role).toBe('Subscriber')
    })

    it('should switch to Dana Delegate persona (userId 504)', () => {
      const store = useAuthStore.getState()
      store.setPersona(504)

      const { currentUser, currentOrg } = useAuthStore.getState()

      expect(currentUser?.id).toBe(504)
      expect(currentUser?.name).toBe('Dana Delegate')
      expect(currentUser?.email).toBe('dana@deloitte.com')
      expect(currentUser?.role).toBe('Auditor')

      expect(currentOrg?.id).toBe(4001)
      expect(currentOrg?.name).toBe('Deloitte Audit')
      expect(currentOrg?.role).toBe('Delegate')
    })

    it('should not change state when user ID is not found', () => {
      const store = useAuthStore.getState()
      const initialUser = store.currentUser
      const initialOrg = store.currentOrg

      store.setPersona(999999)

      const { currentUser, currentOrg } = useAuthStore.getState()

      expect(currentUser).toBe(initialUser)
      expect(currentOrg).toBe(initialOrg)
    })

    it('should correctly update org when switching personas', () => {
      const store = useAuthStore.getState()

      store.setPersona(502)
      expect(useAuthStore.getState().currentOrg?.id).toBe(2001)

      store.setPersona(503)
      expect(useAuthStore.getState().currentOrg?.id).toBe(3001)

      store.setPersona(501)
      expect(useAuthStore.getState().currentOrg?.id).toBe(1)
    })
  })

  describe('personas list', () => {
    it('should contain correct user data for all personas', () => {
      const { personas } = useAuthStore.getState()

      const expectedPersonas = [
        { userId: 501, userName: 'Alice Admin', orgId: 1 },
        { userId: 521, userName: 'Genii Publisher', orgId: 1001 },
        { userId: 502, userName: 'Bob GP', orgId: 2001 },
        { userId: 503, userName: 'Charlie LP', orgId: 3001 },
        { userId: 504, userName: 'Dana Delegate', orgId: 4001 },
      ]

      expectedPersonas.forEach((expected, index) => {
        expect(personas[index].user.id).toBe(expected.userId)
        expect(personas[index].user.name).toBe(expected.userName)
        expect(personas[index].user.orgId).toBe(expected.orgId)
        expect(personas[index].org.id).toBe(expected.orgId)
      })
    })

    it('should have matching user and org relationships in personas', () => {
      const { personas } = useAuthStore.getState()

      personas.forEach(persona => {
        expect(persona.user.orgId).toBe(persona.org.id)
      })
    })
  })

  describe('data consistency', () => {
    it('should maintain consistency with mock data', () => {
      const store = useAuthStore.getState()

      const aliceFromStore = store.currentUser
      const aliceFromMock = mockUsers.find(u => u.id === 501)

      expect(aliceFromStore).toEqual(aliceFromMock)

      const waypointFromStore = store.currentOrg
      const waypointFromMock = mockOrganizations.find(o => o.id === 1)

      expect(waypointFromStore).toEqual(waypointFromMock)
    })

    it('should always have currentUser and currentOrg defined', () => {
      const personaIds = [501, 521, 502, 503, 504]
      const store = useAuthStore.getState()

      personaIds.forEach(userId => {
        store.setPersona(userId)
        const { currentUser, currentOrg } = useAuthStore.getState()

        expect(currentUser).toBeDefined()
        expect(currentOrg).toBeDefined()
        expect(currentUser?.orgId).toBe(currentOrg?.id)
      })
    })
  })
})
