"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/components/providers/auth-provider"
import { Navbar } from "@/components/layout/navbar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DollarSign,
  Shield,
  Users,
  Mail,
  Plus,
  Edit,
  Trash2,
  Eye,
  UserPlus,
  Save,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

// Available permissions
const PERMISSIONS = [
  { id: "users.view", name: "View Users", description: "View user lists and details" },
  { id: "users.manage", name: "Manage Users", description: "Suspend, ban, activate users" },
  { id: "users.wallet", name: "User Wallet Operations", description: "Credit/debit user wallets" },
  { id: "advertisers.view", name: "View Advertisers", description: "View advertiser applications" },
  { id: "advertisers.approve", name: "Approve Advertisers", description: "Approve/reject advertiser applications" },
  { id: "campaigns.view", name: "View Campaigns", description: "View all campaigns" },
  { id: "campaigns.manage", name: "Manage Campaigns", description: "Approve, reject, pause campaigns" },
  { id: "payouts.view", name: "View Payouts", description: "View payout requests" },
  { id: "payouts.process", name: "Process Payouts", description: "Approve/reject payout requests" },
  { id: "settings.view", name: "View Settings", description: "View platform settings" },
  { id: "settings.manage", name: "Manage Settings", description: "Modify platform settings" },
  { id: "admin.manage", name: "Admin Management", description: "Invite and manage other admins" },
]

// Mock admin users data with pagination
const generateMockAdmins = () => {
  const roles = ["Super Admin", "Admin", "Moderator", "Finance Manager"]
  const admins = []

  for (let i = 1; i <= 47; i++) {
    admins.push({
      id: `admin-${i}`,
      name: `Admin User ${i}`,
      email: `admin${i}@kuditask.com`,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=admin${i}`,
      roleId: `role-${(i % 4) + 1}`,
      roleName: roles[i % 4],
      status: i % 10 === 0 ? "inactive" : "active",
      lastLogin: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
      createdAt: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
    })
  }

  return admins
}

export default function AdminSettingsPage() {
  const { user } = useAuth()
  const router = useRouter()
  
  const [activeTab, setActiveTab] = useState("financial")
  const [newRoleDialog, setNewRoleDialog] = useState(false)
  const [editRoleDialog, setEditRoleDialog] = useState(false)
  const [inviteAdminDialog, setInviteAdminDialog] = useState(false)
  const [selectedRole, setSelectedRole] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [roles, setRoles] = useState([
    {
      id: "role-1",
      name: "Super Admin",
      description: "Full system access with all permissions",
      permissions: PERMISSIONS.map((p) => p.id),
      isSystem: true,
      userCount: 1,
      createdAt: "2023-01-01T00:00:00Z",
    },
    {
      id: "role-2",
      name: "Admin",
      description: "General admin with most permissions",
      permissions: PERMISSIONS.filter((p) => !p.id.includes("admin.manage")).map((p) => p.id),
      isSystem: true,
      userCount: 15,
      createdAt: "2023-01-01T00:00:00Z",
    },
    {
      id: "role-3",
      name: "Moderator",
      description: "Content and user moderation",
      permissions: ["users.view", "users.manage", "campaigns.view", "campaigns.manage"],
      isSystem: true,
      userCount: 20,
      createdAt: "2023-01-01T00:00:00Z",
    },
    {
      id: "role-4",
      name: "Finance Manager",
      description: "Financial operations and payouts",
      permissions: ["users.view", "users.wallet", "payouts.view", "payouts.process"],
      isSystem: true,
      userCount: 11,
      createdAt: "2023-01-01T00:00:00Z",
    },
  ])
  const [settings, setSettings] = useState({
    // Financial Settings
    campaignCreationFee: 5000, // Fixed amount in Naira
    withdrawalFee: 100, // Fixed withdrawal fee
    minimumWithdrawal: 1000,
    maximumWithdrawal: 1000000,
    minimumDeposit: 500,
    maximumDeposit: 1000000,
  })
  const [allAdmins] = useState(generateMockAdmins())
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)
  const [newRole, setNewRole] = useState({
    name: "",
    description: "",
    permissions: [],
  })
  const [inviteForm, setInviteForm] = useState({
    email: "",
    name: "",
    roleId: "",
  })

  useEffect(() => {
    if (!user || user.role !== "admin") {
      router.push("/login")
    }
  }, [user, router])

  // Pagination logic
  const totalPages = Math.ceil(allAdmins.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentAdmins = allAdmins.slice(startIndex, endIndex)

  const handlePageChange = (page) => {
    setCurrentPage(page)
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const handleSaveSettings = async () => {
    setIsLoading(true)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    toast({
      title: "Settings Updated",
      description: "Platform settings have been successfully updated.",
    })
    setIsLoading(false)
  }

  const handleCreateRole = async () => {
    if (!newRole.name || !newRole.description || newRole.permissions.length === 0) {
      toast({
        title: "Missing Information",
        description: "Please fill in all fields and select at least one permission.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    const role = {
      id: `custom_${Date.now()}`,
      name: newRole.name,
      description: newRole.description,
      permissions: newRole.permissions,
      isSystem: false,
      userCount: 0,
      createdAt: new Date().toISOString(),
    }

    setRoles([...roles, role])
    setNewRole({ name: "", description: "", permissions: [] })
    setNewRoleDialog(false)
    setIsLoading(false)

    toast({
      title: "Role Created",
      description: `Role "${role.name}" has been created successfully.`,
    })
  }

  const handleEditRole = (role) => {
    setSelectedRole(role)
    setNewRole({
      name: role.name,
      description: role.description,
      permissions: [...role.permissions],
    })
    setEditRoleDialog(true)
  }

  const handleUpdateRole = async () => {
    if (!newRole.name || !newRole.description) {
      toast({
        title: "Missing Information",
        description: "Please fill in all fields.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    await new Promise((resolve) => setTimeout(resolve, 1000))

    toast({
      title: "Role Updated",
      description: `Role "${newRole.name}" has been updated successfully.`,
    })

    setEditRoleDialog(false)
    setSelectedRole(null)
    setNewRole({ name: "", description: "", permissions: [] })
    setIsLoading(false)
  }

  const handleInviteAdmin = async () => {
    if (!inviteForm.email || !inviteForm.name || !inviteForm.roleId) {
      toast({
        title: "Missing Information",
        description: "Please fill in all fields.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000))

    const selectedRole = roles.find((r) => r.id === inviteForm.roleId)
    const generatedPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8).toUpperCase()

    toast({
      title: "Invitation Sent",
      description: `Admin invitation sent to ${inviteForm.email} as ${selectedRole?.name}. Password: ${generatedPassword}`,
    })

    setInviteForm({ email: "", name: "", roleId: "" })
    setInviteAdminDialog(false)
    setIsLoading(false)
  }

  const handlePasswordReset = async () => {
    setIsLoading(true)
    // Simulate sending password reset email
    await new Promise((resolve) => setTimeout(resolve, 2000))

    toast({
      title: "Password Reset Email Sent",
      description: "A secure password reset link has been sent to your email address.",
    })
    setIsLoading(false)
  }

  const togglePermission = (permissionId) => {
    setNewRole((prev) => ({
      ...prev,
      permissions: prev.permissions.includes(permissionId)
        ? prev.permissions.filter((p) => p !== permissionId)
        : [...prev.permissions, permissionId],
    }))
  }

  const getPermissionName = (permissionId) => {
    return PERMISSIONS.find((p) => p.id === permissionId)?.name || permissionId
  }

  const getRoleBadge = (roleName) => {
    switch (roleName) {
      case "Super Admin":
        return <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-100">Super Admin</Badge>
      case "Admin":
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Admin</Badge>
      case "Moderator":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Moderator</Badge>
      case "Finance Manager":
        return <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-100">Finance Manager</Badge>
      default:
        return <Badge variant="secondary">{roleName}</Badge>
    }
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Active</Badge>
      case "inactive":
        return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">Inactive</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const PaginationComponent = () => (
    <div className="flex items-center justify-between px-2 py-4">
      <div className="text-sm text-muted-foreground">
        Showing {startIndex + 1} to {Math.min(endIndex, allAdmins.length)} of {allAdmins.length} entries
      </div>
      <div className="flex items-center space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          <ChevronLeft className="h-4 w-4" />
          Previous
        </Button>

        <div className="flex items-center space-x-1">
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            let pageNumber
            if (totalPages <= 5) {
              pageNumber = i + 1
            } else if (currentPage <= 3) {
              pageNumber = i + 1
            } else if (currentPage >= totalPages - 2) {
              pageNumber = totalPages - 4 + i
            } else {
              pageNumber = currentPage - 2 + i
            }

            return (
              <Button
                key={pageNumber}
                variant={currentPage === pageNumber ? "default" : "outline"}
                size="sm"
                onClick={() => handlePageChange(pageNumber)}
                className="w-8 h-8 p-0"
              >
                {pageNumber}
              </Button>
            )
          })}
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          Next
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )

  if (!user || user.role !== "admin") {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Settings</h1>
          <p className="text-gray-600 mt-2">Manage platform settings and configurations</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="financial">Financial</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
            <TabsTrigger value="roles">Roles & Permissions</TabsTrigger>
          </TabsList>

          {/* Financial Settings */}
          <TabsContent value="financial">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <DollarSign className="h-5 w-5 mr-2" />
                  Financial Settings
                </CardTitle>
                <CardDescription>Configure fees and transaction limits</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Fees</h3>
                    <div>
                      <Label htmlFor="campaign-fee">Campaign Creation Fee (₦)</Label>
                      <Input
                        id="campaign-fee"
                        type="number"
                        value={settings.campaignCreationFee}
                        onChange={(e) =>
                          setSettings((prev) => ({ ...prev, campaignCreationFee: Number(e.target.value) }))
                        }
                      />
                      <p className="text-sm text-muted-foreground mt-1">Fixed fee charged for creating campaigns</p>
                    </div>
                    <div>
                      <Label htmlFor="withdrawal-fee">Withdrawal Fee (₦)</Label>
                      <Input
                        id="withdrawal-fee"
                        type="number"
                        value={settings.withdrawalFee}
                        onChange={(e) => setSettings((prev) => ({ ...prev, withdrawalFee: Number(e.target.value) }))}
                      />
                      <p className="text-sm text-muted-foreground mt-1">Fixed fee charged for withdrawals</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Transaction Limits</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="min-withdrawal">Min Withdrawal (₦)</Label>
                        <Input
                          id="min-withdrawal"
                          type="number"
                          value={settings.minimumWithdrawal}
                          onChange={(e) =>
                            setSettings((prev) => ({ ...prev, minimumWithdrawal: Number(e.target.value) }))
                          }
                        />
                      </div>
                      <div>
                        <Label htmlFor="max-withdrawal">Max Withdrawal (₦)</Label>
                        <Input
                          id="max-withdrawal"
                          type="number"
                          value={settings.maximumWithdrawal}
                          onChange={(e) =>
                            setSettings((prev) => ({ ...prev, maximumWithdrawal: Number(e.target.value) }))
                          }
                        />
                      </div>
                      <div>
                        <Label htmlFor="min-deposit">Min Deposit (₦)</Label>
                        <Input
                          id="min-deposit"
                          type="number"
                          value={settings.minimumDeposit}
                          onChange={(e) => setSettings((prev) => ({ ...prev, minimumDeposit: Number(e.target.value) }))}
                        />
                      </div>
                      <div>
                        <Label htmlFor="max-deposit">Max Deposit (₦)</Label>
                        <Input
                          id="max-deposit"
                          type="number"
                          value={settings.maximumDeposit}
                          onChange={(e) => setSettings((prev) => ({ ...prev, maximumDeposit: Number(e.target.value) }))}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">Current Settings Summary</h4>
                  <div className="text-sm text-blue-800 space-y-1">
                    <div>Campaign Creation Fee: {formatCurrency(settings.campaignCreationFee)}</div>
                    <div>Withdrawal Fee: {formatCurrency(settings.withdrawalFee)}</div>
                    <div>
                      Withdrawal Range: {formatCurrency(settings.minimumWithdrawal)} -{" "}
                      {formatCurrency(settings.maximumWithdrawal)}
                    </div>
                    <div>
                      Deposit Range: {formatCurrency(settings.minimumDeposit)} -{" "}
                      {formatCurrency(settings.maximumDeposit)}
                    </div>
                  </div>
                </div>

                <Button onClick={handleSaveSettings} disabled={isLoading}>
                  <Save className="h-4 w-4 mr-2" />
                  {isLoading ? "Saving..." : "Save Financial Settings"}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Settings */}
          <TabsContent value="security">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="h-5 w-5 mr-2" />
                  Password Reset
                </CardTitle>
                <CardDescription>Reset your admin password</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-medium text-blue-900 mb-2">Password Reset Process</h4>
                    <ul className="text-sm text-blue-800 space-y-1">
                      <li>• A secure reset link will be sent to your email</li>
                      <li>• The link expires in 1 hour for security</li>
                      <li>• You'll be able to set a new password</li>
                      <li>• All active sessions will be logged out</li>
                    </ul>
                  </div>
                  <Button onClick={handlePasswordReset} disabled={isLoading}>
                    <Mail className="h-4 w-4 mr-2" />
                    {isLoading ? "Sending..." : "Send Password Reset Email"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Roles & Permissions */}
          <TabsContent value="roles">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Users className="h-5 w-5 mr-2" />
                      Roles & Permissions
                    </div>
                    <div className="flex space-x-2">
                      <Dialog open={newRoleDialog} onOpenChange={setNewRoleDialog}>
                        <DialogTrigger asChild>
                          <Button>
                            <Plus className="h-4 w-4 mr-2" />
                            Create Role
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>Create New Role</DialogTitle>
                            <DialogDescription>Define a new role with specific permissions</DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <Label htmlFor="role-name">Role Name</Label>
                              <Input
                                id="role-name"
                                value={newRole.name}
                                onChange={(e) => setNewRole((prev) => ({ ...prev, name: e.target.value }))}
                                placeholder="Enter role name"
                              />
                            </div>
                            <div>
                              <Label htmlFor="role-description">Description</Label>
                              <Textarea
                                id="role-description"
                                value={newRole.description}
                                onChange={(e) => setNewRole((prev) => ({ ...prev, description: e.target.value }))}
                                placeholder="Describe this role's purpose"
                              />
                            </div>
                            <div>
                              <Label>Permissions</Label>
                              <div className="grid grid-cols-1 gap-3 mt-2 max-h-60 overflow-y-auto">
                                {PERMISSIONS.map((permission) => (
                                  <div key={permission.id} className="flex items-start space-x-2">
                                    <Checkbox
                                      id={permission.id}
                                      checked={newRole.permissions.includes(permission.id)}
                                      onCheckedChange={() => togglePermission(permission.id)}
                                    />
                                    <div className="grid gap-1.5 leading-none">
                                      <Label htmlFor={permission.id} className="text-sm font-medium">
                                        {permission.name}
                                      </Label>
                                      <p className="text-xs text-muted-foreground">{permission.description}</p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                          <DialogFooter>
                            <Button variant="outline" onClick={() => setNewRoleDialog(false)}>
                              Cancel
                            </Button>
                            <Button onClick={handleCreateRole} disabled={isLoading}>
                              {isLoading ? "Creating..." : "Create Role"}
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>

                      <Dialog open={inviteAdminDialog} onOpenChange={setInviteAdminDialog}>
                        <DialogTrigger asChild>
                          <Button variant="outline">
                            <UserPlus className="h-4 w-4 mr-2" />
                            Invite Admin
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Invite New Admin</DialogTitle>
                            <DialogDescription>Send an invitation to a new admin user</DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <Label htmlFor="invite-email">Email Address</Label>
                              <Input
                                id="invite-email"
                                type="email"
                                value={inviteForm.email}
                                onChange={(e) => setInviteForm((prev) => ({ ...prev, email: e.target.value }))}
                                placeholder="admin@example.com"
                              />
                            </div>
                            <div>
                              <Label htmlFor="invite-name">Full Name</Label>
                              <Input
                                id="invite-name"
                                value={inviteForm.name}
                                onChange={(e) => setInviteForm((prev) => ({ ...prev, name: e.target.value }))}
                                placeholder="John Doe"
                              />
                            </div>
                            <div>
                              <Label htmlFor="invite-role">Assign Role</Label>
                              <Select
                                value={inviteForm.roleId}
                                onValueChange={(value) => setInviteForm((prev) => ({ ...prev, roleId: value }))}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select a role" />
                                </SelectTrigger>
                                <SelectContent>
                                  {roles.map((role) => (
                                    <SelectItem key={role.id} value={role.id}>
                                      {role.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                          <DialogFooter>
                            <Button variant="outline" onClick={() => setInviteAdminDialog(false)}>
                              Cancel
                            </Button>
                            <Button onClick={handleInviteAdmin} disabled={isLoading}>
                              {isLoading ? "Sending..." : "Send Invitation"}
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </CardTitle>
                  <CardDescription>Manage roles and their permissions</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Role Name</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Permissions</TableHead>
                        <TableHead>Users</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {roles.map((role) => (
                        <TableRow key={role.id}>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <span className="font-medium">{role.name}</span>
                              {role.isSystem && (
                                <Badge variant="secondary" className="text-xs">
                                  System
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="max-w-xs">
                            <p className="text-sm text-muted-foreground truncate">{role.description}</p>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-1">
                              {role.permissions.slice(0, 2).map((permissionId) => (
                                <Badge key={permissionId} variant="outline" className="text-xs">
                                  {getPermissionName(permissionId)}
                                </Badge>
                              ))}
                              {role.permissions.length > 2 && (
                                <Badge variant="outline" className="text-xs">
                                  +{role.permissions.length - 2} more
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary">{role.userCount}</Badge>
                          </TableCell>
                          <TableCell>{formatDate(role.createdAt)}</TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button size="sm" variant="ghost">
                                <Eye className="h-4 w-4" />
                              </Button>
                              {!role.isSystem && (
                                <>
                                  <Button size="sm" variant="ghost" onClick={() => handleEditRole(role)}>
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button size="sm" variant="ghost" className="text-red-600 hover:text-red-700">
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              {/* Edit Role Dialog */}
              <Dialog open={editRoleDialog} onOpenChange={setEditRoleDialog}>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Edit Role</DialogTitle>
                    <DialogDescription>Modify role permissions and details</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="edit-role-name">Role Name</Label>
                      <Input
                        id="edit-role-name"
                        value={newRole.name}
                        onChange={(e) => setNewRole((prev) => ({ ...prev, name: e.target.value }))}
                        placeholder="Enter role name"
                        disabled={selectedRole?.isSystem}
                      />
                    </div>
                    <div>
                      <Label htmlFor="edit-role-description">Description</Label>
                      <Textarea
                        id="edit-role-description"
                        value={newRole.description}
                        onChange={(e) => setNewRole((prev) => ({ ...prev, description: e.target.value }))}
                        placeholder="Describe this role's purpose"
                        disabled={selectedRole?.isSystem}
                      />
                    </div>
                    <div>
                      <Label>Permissions</Label>
                      <div className="grid grid-cols-1 gap-3 mt-2 max-h-60 overflow-y-auto">
                        {PERMISSIONS.map((permission) => (
                          <div key={permission.id} className="flex items-start space-x-2">
                            <Checkbox
                              id={`edit-${permission.id}`}
                              checked={newRole.permissions.includes(permission.id)}
                              onCheckedChange={() => togglePermission(permission.id)}
                              disabled={selectedRole?.isSystem}
                            />
                            <div className="grid gap-1.5 leading-none">
                              <Label htmlFor={`edit-${permission.id}`} className="text-sm font-medium">
                                {permission.name}
                              </Label>
                              <p className="text-xs text-muted-foreground">{permission.description}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    {selectedRole?.isSystem && (
                      <div className="bg-yellow-50 p-3 rounded-lg">
                        <p className="text-sm text-yellow-800">
                          <strong>Note:</strong> System roles cannot be modified to maintain platform security.
                        </p>
                      </div>
                    )}
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setEditRoleDialog(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleUpdateRole} disabled={selectedRole?.isSystem || isLoading}>
                      {isLoading ? "Updating..." : "Update Role"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              {/* Admin Users Table with Pagination */}
              <Card>
                <CardHeader>
                  <CardTitle>Admin Users</CardTitle>
                  <CardDescription>Manage administrative access and assign roles</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Admin</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Last Login</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {currentAdmins.map((admin) => (
                        <TableRow key={admin.id}>
                          <TableCell>
                            <div className="flex items-center space-x-3">
                              <div className="h-8 w-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-medium">
                                {admin.name.charAt(0)}
                              </div>
                              <div>
                                <div className="font-medium">{admin.name}</div>
                                <div className="text-sm text-muted-foreground">{admin.email}</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>{getRoleBadge(admin.roleName)}</TableCell>
                          <TableCell>{getStatusBadge(admin.status)}</TableCell>
                          <TableCell>{formatDate(admin.lastLogin)}</TableCell>
                          <TableCell>{formatDate(admin.createdAt)}</TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button size="sm" variant="ghost">
                                <Edit className="h-4 w-4" />
                              </Button>
                              {admin.roleName !== "Super Admin" && (
                                <Button size="sm" variant="ghost" className="text-red-600 hover:text-red-700">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  <PaginationComponent />
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
