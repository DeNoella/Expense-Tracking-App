import { useState, useEffect } from "react"
import { Helmet } from "react-helmet-async"
import {
  Plus,
  Search,
  MoreHorizontal,
  Edit,
  Trash2,
  Copy,
  Eye,
  Info,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Users,
  Globe,
  Shield,
  Loader2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
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
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { announcementsAPI } from "@/lib/api"
import { useToast } from "@/components/ui/toast-notification"

const typeConfig = {
  info: { label: "Info", color: "bg-info/10 text-info border-info/20", icon: Info },
  warning: { label: "Warning", color: "bg-warning/10 text-warning border-warning/20", icon: AlertTriangle },
  success: { label: "Success", color: "bg-success/10 text-success border-success/20", icon: CheckCircle },
  error: { label: "Error", color: "bg-destructive/10 text-destructive border-destructive/20", icon: XCircle },
}

const statusConfig = {
  active: { label: "Active", color: "bg-success/10 text-success" },
  scheduled: { label: "Scheduled", color: "bg-info/10 text-info" },
  expired: { label: "Expired", color: "bg-muted text-muted-foreground" },
}

const visibilityConfig = {
  public: { label: "Public", icon: Globe },
  admin: { label: "Admin Only", icon: Shield },
  users: { label: "Specific Users", icon: Users },
}

const tabs = ["all", "active", "scheduled", "expired"]

export default function AdminAnnouncementsPage() {
  const { success, error: showError } = useToast()
  const [announcements, setAnnouncements] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [createModal, setCreateModal] = useState(false)
  const [editingAnnouncement, setEditingAnnouncement] = useState(null)
  const [isSaving, setIsSaving] = useState(false)
  const [deletingId, setDeletingId] = useState(null)

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    message: "",
    type: "Info",
    visibility: "Public",
    startDate: "",
    endDate: "",
    priority: "Medium",
    dismissible: true,
    noEndDate: false,
  })

  useEffect(() => {
    const fetchAnnouncements = async () => {
      setIsLoading(true)
      try {
        const announcementsData = await announcementsAPI.getAll()
        setAnnouncements(announcementsData || [])
      } catch (err) {
        console.error("Failed to fetch announcements:", err)
        showError("Failed to load announcements. Please try again later.")
        setAnnouncements([])
      } finally {
        setIsLoading(false)
      }
    }
    fetchAnnouncements()
  }, [showError])

  const filteredAnnouncements = announcements.filter((ann) => {
    const matchesTab = activeTab === "all" || ann.status === activeTab
    const matchesSearch =
      (ann.title || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (ann.message || "").toLowerCase().includes(searchQuery.toLowerCase())
    return matchesTab && matchesSearch
  })

  const stats = {
    total: announcements.length,
    active: announcements.filter((a) => a.status === "Active").length,
    scheduled: announcements.filter((a) => a.status === "Scheduled").length,
    expired: announcements.filter((a) => a.status === "Expired").length,
  }

  const openCreateModal = () => {
    setFormData({
      title: "",
      message: "",
      type: "info",
      visibility: "public",
      startDate: "",
      endDate: "",
      priority: "medium",
      dismissible: true,
      noEndDate: false,
    })
    setEditingAnnouncement(null)
    setCreateModal(true)
  }

  const openEditModal = (announcement) => {
    setFormData({
      title: announcement.title,
      message: announcement.message,
      type: announcement.type,
      visibility: announcement.visibility,
      startDate: announcement.startDate ? announcement.startDate.split("T")[0] : "",
      endDate: announcement.endDate ? announcement.endDate.split("T")[0] : "",
      priority: announcement.priority,
      dismissible: announcement.dismissible,
      noEndDate: !announcement.endDate,
    })
    setEditingAnnouncement(announcement)
    setCreateModal(true)
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const announcementData = {
        title: formData.title,
        message: formData.message,
        type: formData.type,
        visibility: formData.visibility,
        startDate: formData.startDate || null,
        endDate: formData.noEndDate ? null : (formData.endDate || null),
        priority: formData.priority,
        dismissible: formData.dismissible,
        status: "Active",
      }

      if (editingAnnouncement) {
        await announcementsAPI.update(editingAnnouncement.id, announcementData)
        success("Announcement updated successfully")
      } else {
        await announcementsAPI.create(announcementData)
        success("Announcement created successfully")
      }

      // Refresh announcements
      const announcementsData = await announcementsAPI.getAll()
      setAnnouncements(announcementsData || [])
      setCreateModal(false)
    } catch (err) {
      showError(err.message || "Failed to save announcement")
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async (id) => {
    setDeletingId(id)
    try {
      await announcementsAPI.delete(id)
      // Refresh announcements
      const announcementsData = await announcementsAPI.getAll()
      setAnnouncements(announcementsData || [])
      success("Announcement deleted successfully")
    } catch (err) {
      showError(err.message || "Failed to delete announcement")
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <>
      <Helmet>
        <title>Announcements - BuyPoint Admin</title>
        <meta name="description" content="Create and manage site announcements" />
      </Helmet>
      <div className="p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Announcements</h1>
            <p className="text-muted-foreground">Create and manage site announcements</p>
          </div>
          <Button className="gap-2" onClick={openCreateModal}>
            <Plus className="h-4 w-4" />
            Create Announcement
          </Button>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">Total</p>
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
              <p className="text-sm text-info">Scheduled</p>
              <p className="text-2xl font-bold">{stats.scheduled}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">Expired</p>
              <p className="text-2xl font-bold">{stats.expired}</p>
            </CardContent>
          </Card>
        </div>

        {/* Search and Tabs */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search announcements..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="flex gap-2">
            {tabs.map((tab) => (
              <Button
                key={tab}
                variant={activeTab === tab ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveTab(tab)}
                className="capitalize"
              >
                {tab}
              </Button>
            ))}
          </div>
        </div>

        {/* Active Preview */}
        {stats.active > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Active Announcements Preview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {announcements
                .filter((a) => a.status === "Active")
                .map((announcement) => {
                  const type = typeConfig[announcement.type]
                  return (
                    <div key={announcement.id} className={`p-3 rounded-lg border flex items-center gap-3 ${type.color}`}>
                      <type.icon className="h-4 w-4 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <span className="font-medium">{announcement.title}</span>
                        <span className="text-sm ml-2 opacity-80">{announcement.message}</span>
                      </div>
                      {announcement.dismissible && (
                        <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0">
                          <XCircle className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  )
                })}
            </CardContent>
          </Card>
        )}

        {/* Announcements List */}
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="p-4 text-left text-sm font-medium">Announcement</th>
                  <th className="p-4 text-left text-sm font-medium">Type</th>
                  <th className="p-4 text-left text-sm font-medium">Status</th>
                  <th className="p-4 text-left text-sm font-medium">Visibility</th>
                  <th className="p-4 text-left text-sm font-medium">Schedule</th>
                  <th className="p-4 text-left text-sm font-medium">Active</th>
                  <th className="p-4 text-left text-sm font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center">
                      <Loader2 className="h-6 w-6 animate-spin text-primary mx-auto" />
                    </td>
                  </tr>
                ) : filteredAnnouncements.length > 0 ? (
                  filteredAnnouncements.map((announcement) => {
                    const type = typeConfig[announcement.type?.toLowerCase()] || typeConfig.info
                    const status = statusConfig[announcement.status?.toLowerCase()] || statusConfig.active
                    const visibility = visibilityConfig[announcement.visibility?.toLowerCase()] || visibilityConfig.public
                    return (
                    <tr key={announcement.id} className="border-b hover:bg-muted/50 transition-colors">
                      <td className="p-4">
                        <div className="max-w-xs">
                          <p className="font-medium truncate">{announcement.title}</p>
                          <p className="text-sm text-muted-foreground truncate">{announcement.message}</p>
                        </div>
                      </td>
                      <td className="p-4">
                        <Badge variant="outline" className={type.color}>
                          <type.icon className="h-3 w-3 mr-1" />
                          {type.label}
                        </Badge>
                      </td>
                      <td className="p-4">
                        <Badge className={status.color}>{status.label}</Badge>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <visibility.icon className="h-4 w-4" />
                          {visibility.label}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="text-sm">
                          <p>{new Date(announcement.startDate).toLocaleDateString()}</p>
                          <p className="text-muted-foreground">
                            {announcement.endDate
                              ? `to ${new Date(announcement.endDate).toLocaleDateString()}`
                              : "No end date"}
                          </p>
                        </div>
                      </td>
                      <td className="p-4">
                        <Switch checked={announcement.status === "Active"} />
                      </td>
                      <td className="p-4">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => openEditModal(announcement)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Copy className="h-4 w-4 mr-2" />
                              Duplicate
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Eye className="h-4 w-4 mr-2" />
                              Preview
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              className="text-destructive"
                              onClick={() => handleDelete(announcement.id)}
                              disabled={deletingId === announcement.id}
                            >
                              {deletingId === announcement.id ? (
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
                    <td colSpan={7} className="p-8 text-center">
                      <p className="text-muted-foreground">No announcements found</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Create/Edit Modal */}
        <Dialog open={createModal} onOpenChange={setCreateModal}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingAnnouncement ? "Edit Announcement" : "Create Announcement"}</DialogTitle>
              <DialogDescription>
                {editingAnnouncement
                  ? "Update the announcement details below"
                  : "Create a new announcement to display to users"}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto">
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  placeholder="Announcement title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="message">Message *</Label>
                <Textarea
                  id="message"
                  placeholder="Announcement message..."
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Type</Label>
                  <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="info">Info</SelectItem>
                      <SelectItem value="success">Success</SelectItem>
                      <SelectItem value="warning">Warning</SelectItem>
                      <SelectItem value="error">Error</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Visibility</Label>
                  <Select
                    value={formData.visibility}
                    onValueChange={(value) => setFormData({ ...formData, visibility: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="public">Public</SelectItem>
                      <SelectItem value="admin">Admin Only</SelectItem>
                      <SelectItem value="users">Specific Users</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Start Date</Label>
                  <Input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>End Date</Label>
                  <Input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    disabled={formData.noEndDate}
                  />
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="noEndDate"
                      checked={formData.noEndDate}
                      onCheckedChange={(checked) =>
                        setFormData({ ...formData, noEndDate: checked, endDate: "" })
                      }
                    />
                    <label htmlFor="noEndDate" className="text-sm">
                      No end date
                    </label>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Priority</Label>
                  <Select
                    value={formData.priority}
                    onValueChange={(value) => setFormData({ ...formData, priority: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Options</Label>
                  <div className="flex items-center gap-2 pt-2">
                    <Switch
                      checked={formData.dismissible}
                      onCheckedChange={(checked) => setFormData({ ...formData, dismissible: checked })}
                    />
                    <span className="text-sm">Users can dismiss</span>
                  </div>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => setCreateModal(false)}
                disabled={isSaving}
              >
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={isSaving}>
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  editingAnnouncement ? "Save Changes" : "Create Announcement"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </>
  )
}

