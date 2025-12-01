'use client'

import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'
import { Navbar } from '@/components/shared/navbar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useAuthStore } from '@/store/auth-store'
import { Users, Plus, Pencil, Camera, Upload, Loader2 } from 'lucide-react'

interface User {
  id: string
  name: string
  email: string
  role: string
  narrative?: string
  pictureUrl?: string
  pictureMime?: string // If set, image is stored in database
  createdAt: string
}

interface Organization {
  id: string
  name: string
  type: string
  lei?: string
  narrative?: string
  imageUrl?: string
  imageMime?: string // If set, image is stored in database
}

// Helper to get image URL - either from database API or external URL
function getUserImageUrl(user: User): string | null {
  if (user.pictureMime) {
    // Image stored in database
    return `/api/images/user/${user.id}?t=${Date.now()}`
  }
  return user.pictureUrl || null
}

function getOrgImageUrl(org: Organization): string | null {
  if (org.imageMime) {
    // Image stored in database
    return `/api/images/organization/${org.id}?t=${Date.now()}`
  }
  return org.imageUrl || null
}

export default function IAMPage() {
  const { currentPersona } = useAuthStore()
  const [users, setUsers] = useState<User[]>([])
  const [organization, setOrganization] = useState<Organization | null>(null)
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editOrgDialogOpen, setEditOrgDialogOpen] = useState(false)
  const [editUserDialogOpen, setEditUserDialogOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    role: 'MEMBER',
  })
  const [editOrg, setEditOrg] = useState({
    name: '',
    narrative: '',
  })
  const [editUser, setEditUser] = useState({
    name: '',
    narrative: '',
  })
  const [previewUserImage, setPreviewUserImage] = useState<string | null>(null)
  const [previewOrgImage, setPreviewOrgImage] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const orgImageInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    async function fetchData() {
      try {
        const [usersRes, orgRes] = await Promise.all([
          fetch(`/api/users?organizationId=${currentPersona.organizationId}`),
          fetch(`/api/organizations/${currentPersona.organizationId}`),
        ])
        const usersData = await usersRes.json()
        const orgData = await orgRes.json()
        setUsers(usersData)
        setOrganization(orgData)
        setEditOrg({
          name: orgData.name || '',
          narrative: orgData.narrative || '',
        })
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [currentPersona.organizationId])

  const handleCreateUser = async () => {
    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newUser,
          organizationId: currentPersona.organizationId,
        }),
      })

      if (response.ok) {
        const created = await response.json()
        setUsers((prev) => [...prev, created])
        setDialogOpen(false)
        setNewUser({ name: '', email: '', role: 'MEMBER' })
      }
    } catch (error) {
      console.error('Error creating user:', error)
    }
  }

  const handleUpdateOrganization = async () => {
    try {
      const response = await fetch(`/api/organizations/${currentPersona.organizationId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editOrg),
      })

      if (response.ok) {
        const updated = await response.json()
        setOrganization(updated)
        setEditOrgDialogOpen(false)
        setPreviewOrgImage(null)
      }
    } catch (error) {
      console.error('Error updating organization:', error)
    }
  }

  const handleUpdateUser = async () => {
    if (!selectedUser) return
    try {
      const response = await fetch(`/api/users/${selectedUser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editUser),
      })

      if (response.ok) {
        const updated = await response.json()
        setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)))
        setEditUserDialogOpen(false)
        setSelectedUser(null)
        setPreviewUserImage(null)
      }
    } catch (error) {
      console.error('Error updating user:', error)
    }
  }

  // Upload image directly to database
  const handleImageUpload = async (file: File, type: 'user' | 'org') => {
    setUploading(true)
    const formData = new FormData()
    formData.append('file', file)

    try {
      const endpoint = type === 'user' 
        ? `/api/users/${selectedUser?.id}/image`
        : `/api/organizations/${currentPersona.organizationId}/image`

      const response = await fetch(endpoint, {
        method: 'POST',
        body: formData,
      })

      if (response.ok) {
        const data = await response.json()
        
        if (type === 'user' && selectedUser) {
          // Update user with new image indicator
          setUsers((prev) => prev.map((u) => 
            u.id === selectedUser.id 
              ? { ...u, pictureMime: 'image/uploaded' }
              : u
          ))
          setSelectedUser((prev) => prev ? { ...prev, pictureMime: 'image/uploaded' } : null)
          setPreviewUserImage(data.pictureUrl + `?t=${Date.now()}`)
        } else {
          // Update organization with new image indicator
          setOrganization((prev) => prev ? { ...prev, imageMime: 'image/uploaded' } : null)
          setPreviewOrgImage(data.imageUrl + `?t=${Date.now()}`)
        }
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to upload image')
      }
    } catch (error) {
      console.error('Error uploading image:', error)
      alert('Failed to upload image')
    } finally {
      setUploading(false)
    }
  }

  const openEditUserDialog = (user: User) => {
    setSelectedUser(user)
    setEditUser({
      name: user.name || '',
      narrative: user.narrative || '',
    })
    setPreviewUserImage(getUserImageUrl(user))
    setEditUserDialogOpen(true)
  }

  const openEditOrgDialog = () => {
    if (organization) {
      setEditOrg({
        name: organization.name || '',
        narrative: organization.narrative || '',
      })
      setPreviewOrgImage(getOrgImageUrl(organization))
    }
    setEditOrgDialogOpen(true)
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'bg-purple-500/20 text-purple-400 border-purple-500/30'
      case 'MEMBER':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30'
      case 'VIEWER':
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
      default:
        return ''
    }
  }

  const isAdmin = currentPersona.userRole === 'ADMIN'
  const orgImageUrl = organization ? getOrgImageUrl(organization) : null

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
          <h1 className="text-4xl font-semibold mb-3 gradient-text">Identity and Access Management</h1>
          <p className="text-muted-foreground text-base">
            Manage users and roles for {currentPersona.organizationName}
          </p>
        </motion.div>

        {/* Organization Info - Compact with Background Image */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <Card className="overflow-hidden relative">
            {/* Background Image - larger than container, clipped at edges */}
            {orgImageUrl && (
              <div className="absolute inset-0 z-0 overflow-hidden">
                <div className="absolute -inset-0">
                  <Image
                    src={orgImageUrl}
                    alt=""
                    fill
                    className="object-cover object-center opacity-25"
                    unoptimized
                  />
                </div>
                <div className="absolute inset-0 bg-gradient-to-r from-background via-background/85 to-background/60" />
              </div>
            )}
            
            <CardHeader className="relative z-10 pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">
                  Organization Details
                </CardTitle>
                {isAdmin && (
                  <Dialog open={editOrgDialogOpen} onOpenChange={setEditOrgDialogOpen}>
                    <DialogTrigger asChild>
                      <Button variant="ghost" size="sm" className="gap-1" onClick={openEditOrgDialog}>
                        <Pencil className="w-3.5 h-3.5" />
                        Edit
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-lg">
                      <DialogHeader>
                        <DialogTitle>Edit Organization</DialogTitle>
                        <DialogDescription>
                          Update organization details and branding
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 pt-4">
                        <div className="space-y-2">
                          <Label>Organization Name</Label>
                          <Input
                            value={editOrg.name}
                            onChange={(e) =>
                              setEditOrg((prev) => ({ ...prev, name: e.target.value }))
                            }
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Narrative / Mission</Label>
                          <Textarea
                            value={editOrg.narrative}
                            onChange={(e) =>
                              setEditOrg((prev) => ({ ...prev, narrative: e.target.value }))
                            }
                            placeholder="Describe your organization's mission and focus..."
                            rows={3}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Background Image</Label>
                          <div className="flex gap-2 items-center">
                            <input
                              type="file"
                              ref={orgImageInputRef}
                              className="hidden"
                              accept="image/jpeg,image/png,image/gif,image/webp"
                              onChange={(e) => {
                                const file = e.target.files?.[0]
                                if (file) handleImageUpload(file, 'org')
                              }}
                            />
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => orgImageInputRef.current?.click()}
                              disabled={uploading}
                              className="w-full"
                            >
                              {uploading ? (
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              ) : (
                                <Upload className="w-4 h-4 mr-2" />
                              )}
                              {uploading ? 'Uploading...' : 'Upload Image'}
                            </Button>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Max 2MB. JPEG, PNG, GIF, or WebP. Stored in database.
                          </p>
                          {previewOrgImage && (
                            <div className="mt-2 relative h-24 rounded-md overflow-hidden bg-secondary/50">
                              <Image
                                src={previewOrgImage}
                                alt="Preview"
                                fill
                                className="object-cover opacity-50"
                                unoptimized
                              />
                            </div>
                          )}
                        </div>
                        <Button className="w-full" onClick={handleUpdateOrganization}>
                          Save Changes
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                )}
              </div>
            </CardHeader>
            <CardContent className="relative z-10 pt-0">
              <div className="flex flex-wrap items-start gap-x-8 gap-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Name</span>
                  <span className="font-medium">{organization?.name || currentPersona.organizationName}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Type</span>
                  <Badge variant="outline" className="font-normal">{currentPersona.organizationType}</Badge>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Organization ID</span>
                  <code className="text-xs font-mono bg-secondary/50 px-1.5 py-0.5 rounded">
                    {currentPersona.organizationId}
                  </code>
                </div>
              </div>
              {organization?.narrative && (
                <p className="mt-3 text-sm text-muted-foreground leading-relaxed max-w-3xl">
                  {organization.narrative}
                </p>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Users Table */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>
                    Team Members
                  </CardTitle>
                  <CardDescription>
                    Users within your organization
                  </CardDescription>
                </div>
                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="w-4 h-4 mr-2" />
                      Add User
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add Team Member</DialogTitle>
                      <DialogDescription>
                        Create a new user for {currentPersona.organizationName}
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 pt-4">
                      <div className="space-y-2">
                        <Label>Full Name</Label>
                        <Input
                          value={newUser.name}
                          onChange={(e) =>
                            setNewUser((prev) => ({ ...prev, name: e.target.value }))
                          }
                          placeholder="John Doe"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Email</Label>
                        <Input
                          type="email"
                          value={newUser.email}
                          onChange={(e) =>
                            setNewUser((prev) => ({ ...prev, email: e.target.value }))
                          }
                          placeholder="john@example.com"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Role</Label>
                        <Select
                          value={newUser.role}
                          onValueChange={(v) =>
                            setNewUser((prev) => ({ ...prev, role: v }))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="ADMIN">Admin - Full access</SelectItem>
                            <SelectItem value="MEMBER">Member - Standard access</SelectItem>
                            <SelectItem value="VIEWER">Viewer - Read-only</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <Button
                        className="w-full"
                        onClick={handleCreateUser}
                        disabled={!newUser.name || !newUser.email}
                      >
                        Add User
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="empty-state">Loading...</div>
              ) : users.length === 0 ? (
                <div className="empty-state">
                  <Users className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <p>No users found</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="w-[80px]"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.map((user) => {
                        const userImageUrl = getUserImageUrl(user)
                        return (
                          <TableRow key={user.id}>
                            <TableCell className="font-medium">
                              <div className="flex items-center gap-3">
                                {userImageUrl ? (
                                  <div className="w-[54px] h-[54px] rounded-full overflow-hidden relative flex-shrink-0">
                                    <Image
                                      src={userImageUrl}
                                      alt={user.name}
                                      fill
                                      className="object-cover"
                                      unoptimized
                                    />
                                  </div>
                                ) : (
                                  <div className="w-[54px] h-[54px] rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                                    <span className="text-lg font-medium">
                                      {user.name.charAt(0).toUpperCase()}
                                    </span>
                                  </div>
                                )}
                                <div className="min-w-0">
                                  <div className="flex items-center gap-2">
                                    <span className="truncate">{user.name}</span>
                                    {user.id === currentPersona.userId && (
                                      <Badge variant="outline" className="text-xs flex-shrink-0">
                                        You
                                      </Badge>
                                    )}
                                  </div>
                                  {user.narrative && (
                                    <p className="text-xs text-muted-foreground truncate max-w-[300px]">
                                      {user.narrative}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="font-mono text-sm">
                              {user.email}
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className={getRoleColor(user.role)}>
                                {user.role}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className="status-active">
                                Active
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {user.id === currentPersona.userId && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => openEditUserDialog(user)}
                                >
                                  <Pencil className="w-3.5 h-3.5" />
                                </Button>
                              )}
                            </TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Edit User Dialog */}
        <Dialog open={editUserDialogOpen} onOpenChange={setEditUserDialogOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Edit Profile</DialogTitle>
              <DialogDescription>
                Update your profile information
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              {/* Profile Picture */}
              <div className="flex justify-center">
                <div className="relative">
                  {previewUserImage ? (
                    <div className="w-24 h-24 rounded-full overflow-hidden relative">
                      <Image
                        src={previewUserImage}
                        alt={editUser.name}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    </div>
                  ) : (
                    <div className="w-24 h-24 rounded-full bg-primary/20 flex items-center justify-center">
                      <span className="text-3xl font-medium">
                        {editUser.name?.charAt(0)?.toUpperCase() || '?'}
                      </span>
                    </div>
                  )}
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/jpeg,image/png,image/gif,image/webp"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) handleImageUpload(file, 'user')
                    }}
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    size="icon"
                    className="absolute -bottom-1 -right-1 rounded-full w-8 h-8"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                  >
                    {uploading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Camera className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>
              <p className="text-xs text-center text-muted-foreground">
                Max 1MB. JPEG, PNG, GIF, or WebP. Stored in database.
              </p>

              <div className="space-y-2">
                <Label>Full Name</Label>
                <Input
                  value={editUser.name}
                  onChange={(e) =>
                    setEditUser((prev) => ({ ...prev, name: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Bio / Narrative</Label>
                <Textarea
                  value={editUser.narrative}
                  onChange={(e) =>
                    setEditUser((prev) => ({ ...prev, narrative: e.target.value }))
                  }
                  placeholder="Tell others about yourself..."
                  rows={3}
                />
              </div>
              <Button className="w-full" onClick={handleUpdateUser}>
                Save Changes
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  )
}
