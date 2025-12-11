import { useState, useEffect } from "react"
import { Helmet } from "react-helmet-async"
import {
  Search,
  Plus,
  Download,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  Shield,
  Ban,
  CheckCircle,
  UserCheck,
  ShoppingBag,
  DollarSign,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { usersAPI } from "@/lib/api"
import { useToast } from "@/components/ui/toast-notification"

const mockUsers = [
  {
    id: "USR-001",
    name: "John Doe",
    email: "john@example.com",
    avatar: null,
    role: "customer",
    status: "active",
    verified: true,
    orders: 12,
    totalSpent: 1249.99,
    lastLogin: "2024-01-15T10:30:00",
    createdAt: "2023-06-15T08:00:00",
  },
  {
    id: "USR-002",
    name: "Jane Smith",
    email: "jane@example.com",
    avatar: null,
    role: "admin",
    status: "active",
    verified: true,
    orders: 0,
    totalSpent: 0,
    lastLogin: "2024-01-15T14:20:00",
    createdAt: "2023-01-10T09:00:00",
  },
  {
    id: "USR-003",
    name: "Mike Chen",
    email: "mike@example.com",
    avatar: null,
    role: "customer",
    status: "active",
    verified: true,
    orders: 8,
    totalSpent: 689.5,
    lastLogin: "2024-01-14T16:45:00",
    createdAt: "2023-09-22T11:30:00",
  },
  {
    id: "USR-004",
    name: "Sarah Lee",
    email: "sarah@example.com",
    avatar: null,
    role: "customer",
    status: "inactive",
    verified: true,
    orders: 3,
    totalSpent: 189.99,
    lastLogin: "2023-12-01T09:00:00",
    createdAt: "2023-08-05T14:00:00",
  },
  {
    id: "USR-005",
    name: "Alex Johnson",
    email: "alex@example.com",
    avatar: null,
    role: "customer",
    status: "suspended",
    verified: false,
    orders: 1,
    totalSpent: 49.99,
    lastLogin: "2024-01-10T11:00:00",
    createdAt: "2024-01-08T16:00:00",
  },
  {
    id: "USR-006",
    name: "Emily Brown",
    email: "emily@example.com",
    avatar: null,
    role: "customer",
    status: "active",
    verified: true,
    orders: 25,
    totalSpent: 3420.0,
    lastLogin: "2024-01-15T08:30:00",
    createdAt: "2022-11-20T10:00:00",
  },
]

const roleConfig = {
  admin: { label: "Admin", color: "bg-destructive/10 text-destructive" },
  customer: { label: "Customer", color: "bg-info/10 text-info" },
  guest: { label: "Guest", color: "bg-muted text-muted-foreground" },
}

const statusConfig = {
  active: { label: "Active", color: "bg-success/10 text-success", icon: CheckCircle },
  inactive: { label: "Inactive", color: "bg-muted text-muted-foreground", icon: UserCheck },
  suspended: { label: "Suspended", color: "bg-destructive/10 text-destructive", icon: Ban },
}

export default function AdminUsersPage() {
  const { success, error: showError } = useToast()
  const [users, setUsers] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [roleFilter, setRoleFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedUsers, setSelectedUsers] = useState([])
  const [createModal, setCreateModal] = useState(false)
  const [deletingId, setDeletingId] = useState(null)

  useEffect(() => {
    const fetchUsers = async () => {
      setIsLoading(true)
      try {
        const usersData = await usersAPI.getAll()
        setUsers(usersData || [])
      } catch (err) {
        console.error("Failed to fetch users:", err)
        showError("Failed to load users. Please try again later.")
        setUsers([])
      } finally {
        setIsLoading(false)
      }
    }
    fetchUsers()
  }, [showError])

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      (user.fullName || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (user.email || "").toLowerCase().includes(searchQuery.toLowerCase())
    const matchesRole = roleFilter === "all" || (roleFilter === "admin" ? user.hasAdminPermissions : !user.hasAdminPermissions)
    const matchesStatus = statusFilter === "all" || 
      (statusFilter === "active" && user.isEmailVerified) ||
      (statusFilter === "inactive" && !user.isEmailVerified) ||
      (statusFilter === "suspended" && false) // Backend doesn't have suspended status yet
    return matchesSearch && matchesRole && matchesStatus
  })

  const stats = {
    total: users.length,
    active: users.filter((u) => u.isEmailVerified).length,
    inactive: users.filter((u) => !u.isEmailVerified).length,
    suspended: 0, // Backend doesn't have suspended status yet
    newThisMonth: users.filter((u) => {
      const created = new Date(u.createdAt)
      const now = new Date()
      return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear()
    }).length,
  }

  const handleDeleteUser = async (id) => {
    setDeletingId(id)
    try {
      await usersAPI.delete(id)
      // Refresh users
      const usersData = await usersAPI.getAll()
      setUsers(usersData || [])
      success("User deleted successfully")
    } catch (err) {
      showError(err.message || "Failed to delete user")
    } finally {
      setDeletingId(null)
    }
  }

  const toggleSelectUser = (userId) => {
    setSelectedUsers((prev) => (prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]))
  }

  const toggleSelectAll = () => {
    if (selectedUsers.length === filteredUsers.length) {
      setSelectedUsers([])
    } else {
      setSelectedUsers(filteredUsers.map((u) => u.id))
    }
  }

  const getRelativeTime = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 60) return `${diffMins} min ago`
    if (diffHours < 24) return `${diffHours} hours ago`
    if (diffDays < 7) return `${diffDays} days ago`
    return date.toLocaleDateString()
  }

  return (
    <>
      <Helmet>
        <title>User Management - BuyPoint Admin</title>
        <meta name="description" content="Manage customer and admin accounts" />
      </Helmet>
      <div className="p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">User Management</h1>
            <p className="text-muted-foreground">Manage customer and admin accounts</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="gap-2 bg-transparent">
              <Download className="h-4 w-4" />
              Export
            </Button>
            <Button className="gap-2" onClick={() => setCreateModal(true)}>
              <Plus className="h-4 w-4" />
              Add User
            </Button>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">Total Users</p>
              <p className="text-2xl font-bold">{stats.total}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-success">Active</p>
              <p className="text-2xl font-bold">{stats.active}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">Inactive</p>
              <p className="text-2xl font-bold">{stats.inactive}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-destructive">Suspended</p>
              <p className="text-2xl font-bold">{stats.suspended}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-info">New This Month</p>
              <p className="text-2xl font-bold">{stats.newThisMonth}</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="customer">Customer</SelectItem>
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
              <SelectItem value="suspended">Suspended</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Bulk Actions */}
        {selectedUsers.length > 0 && (
          <div className="flex items-center gap-4 p-3 bg-muted rounded-lg">
            <span className="text-sm font-medium">{selectedUsers.length} selected</span>
            <Button size="sm" variant="outline" className="text-success bg-transparent">
              Activate Selected
            </Button>
            <Button size="sm" variant="outline" className="text-destructive bg-transparent">
              Suspend Selected
            </Button>
            <Button size="sm" variant="outline">
              Export Selected
            </Button>
          </div>
        )}

        {/* Users Table */}
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="p-4 text-left">
                    <Checkbox
                      checked={selectedUsers.length === filteredUsers.length && filteredUsers.length > 0}
                      onCheckedChange={toggleSelectAll}
                    />
                  </th>
                  <th className="p-4 text-left text-sm font-medium">User</th>
                  <th className="p-4 text-left text-sm font-medium">Role</th>
                  <th className="p-4 text-left text-sm font-medium">Orders</th>
                  <th className="p-4 text-left text-sm font-medium">Total Spent</th>
                  <th className="p-4 text-left text-sm font-medium">Status</th>
                  <th className="p-4 text-left text-sm font-medium">Last Login</th>
                  <th className="p-4 text-left text-sm font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={8} className="p-8 text-center">
                      <Loader2 className="h-6 w-6 animate-spin text-primary mx-auto" />
                    </td>
                  </tr>
                ) : filteredUsers.length > 0 ? (
                  filteredUsers.map((user) => {
                    const role = user.hasAdminPermissions 
                      ? roleConfig.admin 
                      : roleConfig.customer
                    const status = user.isEmailVerified 
                      ? statusConfig.active 
                      : statusConfig.inactive
                    const StatusIcon = status.icon
                    const userName = user.fullName || user.email || "Unknown"
                    
                    return (
                      <tr key={user.id} className="border-b hover:bg-muted/50 transition-colors">
                        <td className="p-4">
                          <Checkbox
                            checked={selectedUsers.includes(user.id)}
                            onCheckedChange={() => toggleSelectUser(user.id)}
                          />
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10">
                              <AvatarImage src={user.avatar || undefined} />
                              <AvatarFallback className="bg-primary/10 text-primary">
                                {userName.charAt(0).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium text-sm flex items-center gap-2">
                                {userName}
                                {user.isEmailVerified && <CheckCircle className="h-4 w-4 text-success" />}
                              </p>
                              <p className="text-xs text-muted-foreground">{user.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <Badge className={role.color}>{role.label}</Badge>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-1">
                            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">{user.ordersCount || 0}</span>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-1">
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                            <span className="font-bold">${(user.totalSpent || 0).toFixed(2)}</span>
                          </div>
                        </td>
                        <td className="p-4">
                          <Badge variant="outline" className={status.color}>
                            <StatusIcon className="h-3 w-3 mr-1" />
                            {status.label}
                          </Badge>
                        </td>
                        <td className="p-4">
                          <span className="text-sm text-muted-foreground">
                            {user.createdAt ? getRelativeTime(user.createdAt) : "N/A"}
                          </span>
                        </td>
                      <td className="p-4">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Eye className="h-4 w-4 mr-2" />
                              View Profile
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <ShoppingBag className="h-4 w-4 mr-2" />
                              View Orders
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Shield className="h-4 w-4 mr-2" />
                              Change Role
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            {user.isEmailVerified ? (
                              <DropdownMenuItem className="text-warning">
                                <Ban className="h-4 w-4 mr-2" />
                                Suspend
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem className="text-success">
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Activate
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem 
                              className="text-destructive"
                              onClick={() => handleDeleteUser(user.id)}
                              disabled={deletingId === user.id}
                            >
                              {deletingId === user.id ? (
                                <>
                                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                  Deleting...
                                </>
                              ) : (
                                <>
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Delete
                                </>
                              )}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  )
                })
                ) : (
                  <tr>
                    <td colSpan={8} className="p-8 text-center">
                      <p className="text-muted-foreground">No users found</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between p-4 border-t">
            <p className="text-sm text-muted-foreground">
              Showing {filteredUsers.length} of {mockUsers.length} users
            </p>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" disabled>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm">
                1
              </Button>
              <Button variant="ghost" size="sm">
                2
              </Button>
              <Button variant="outline" size="icon">
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </Card>

        {/* Create User Modal */}
        <Dialog open={createModal} onOpenChange={setCreateModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New User</DialogTitle>
              <DialogDescription>Create a new user account</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Full Name</Label>
                <Input placeholder="Enter full name" />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input type="email" placeholder="Enter email address" />
              </div>
              <div className="space-y-2">
                <Label>Password</Label>
                <Input type="password" placeholder="Enter password" />
              </div>
              <div className="space-y-2">
                <Label>Role</Label>
                <Select defaultValue="customer">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="customer">Customer</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setCreateModal(false)}>
                Cancel
              </Button>
              <Button>Create User</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </>
  )
}

