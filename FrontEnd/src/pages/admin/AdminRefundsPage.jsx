import { useState, useEffect } from "react"
import { Helmet } from "react-helmet-async"
import {
  Search,
  Download,
  MoreHorizontal,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  RefreshCw,
  ChevronDown,
  ChevronRight,
  Calendar,
  DollarSign,
  Loader2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
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
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { ImageWithLoader } from "@/components/ui/image-loader"
import { issuesAPI } from "@/lib/api"
import { useToast } from "@/components/ui/toast-notification"

const mockRefunds = [
  {
    id: "REF-2024-001",
    orderId: "ORD-2024-001",
    customer: { name: "John Doe", email: "john@example.com" },
    product: { name: "Wireless Headphones", image: "/diverse-people-listening-headphones.png", price: 249.99 },
    amount: 249.99,
    reason: "Defective Product",
    description: "The left ear speaker stopped working after 2 days of use.",
    status: "pending",
    requestDate: "2024-01-15T10:30:00",
    lastUpdated: "2024-01-15T10:30:00",
    evidence: ["/evidence-collection.png"],
  },
  {
    id: "REF-2024-002",
    orderId: "ORD-2024-002",
    customer: { name: "Jane Smith", email: "jane@example.com" },
    product: { name: "Smart Watch", image: "/modern-smartwatch.png", price: 179.99 },
    amount: 179.99,
    reason: "Wrong Item Received",
    description: "I ordered the black version but received the silver one.",
    status: "approved",
    requestDate: "2024-01-14T09:15:00",
    lastUpdated: "2024-01-15T14:20:00",
    evidence: [],
  },
  {
    id: "REF-2024-003",
    orderId: "ORD-2024-003",
    customer: { name: "Mike Chen", email: "mike@example.com" },
    product: { name: "Yoga Mat", image: "/rolled-yoga-mat.png", price: 59.99 },
    amount: 59.99,
    reason: "Not as Described",
    description: "The mat is much thinner than advertised.",
    status: "processing",
    requestDate: "2024-01-13T16:45:00",
    lastUpdated: "2024-01-14T11:00:00",
    evidence: ["/mat-evidence.jpg"],
  },
  {
    id: "REF-2024-004",
    orderId: "ORD-2024-004",
    customer: { name: "Sarah Lee", email: "sarah@example.com" },
    product: { name: "Desk Lamp", image: "/modern-desk-lamp.png", price: 89.99 },
    amount: 89.99,
    reason: "Changed Mind",
    description: "I no longer need this item.",
    status: "rejected",
    requestDate: "2024-01-12T14:20:00",
    lastUpdated: "2024-01-13T09:00:00",
    evidence: [],
  },
  {
    id: "REF-2024-005",
    orderId: "ORD-2024-005",
    customer: { name: "Alex Johnson", email: "alex@example.com" },
    product: { name: "T-Shirt Pack", image: "/plain-white-tshirt.png", price: 104.97 },
    amount: 104.97,
    reason: "Defective Product",
    description: "One of the shirts has a tear in the seam.",
    status: "pending",
    requestDate: "2024-01-11T11:00:00",
    lastUpdated: "2024-01-11T11:00:00",
    evidence: ["/torn-shirt.jpg"],
  },
]

const statusConfig = {
  Pending: { label: "Pending", color: "bg-warning/10 text-warning border-warning/20", icon: Clock },
  Approved: { label: "Approved", color: "bg-success/10 text-success border-success/20", icon: CheckCircle },
  Rejected: { label: "Rejected", color: "bg-destructive/10 text-destructive border-destructive/20", icon: XCircle },
  Processing: { label: "Processing", color: "bg-info/10 text-info border-info/20", icon: RefreshCw },
}

const tabs = ["all", "Pending", "Approved", "Rejected", "Processing"]

export default function AdminRefundsPage() {
  const { success, error: showError } = useToast()
  const [issues, setIssues] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [expandedRows, setExpandedRows] = useState([])
  const [selectedRefunds, setSelectedRefunds] = useState([])
  const [detailModal, setDetailModal] = useState({ open: false, refund: null })
  const [adminNote, setAdminNote] = useState("")
  const [isUpdating, setIsUpdating] = useState(false)

  useEffect(() => {
    const fetchIssues = async () => {
      setIsLoading(true)
      try {
        const issuesData = await issuesAPI.getAll()
        setIssues(issuesData || [])
      } catch (err) {
        console.error("Failed to fetch issues:", err)
        showError("Failed to load refund requests. Please try again later.")
        setIssues([])
      } finally {
        setIsLoading(false)
      }
    }
    fetchIssues()
  }, [showError])

  const filteredRefunds = issues.filter((issue) => {
    const matchesTab = activeTab === "all" || issue.status === activeTab
    const matchesSearch =
      (issue.id || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (issue.orderId || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (issue.user?.fullName || issue.user?.email || "").toLowerCase().includes(searchQuery.toLowerCase())
    return matchesTab && matchesSearch
  })

  const stats = {
    total: issues.reduce((sum, r) => sum + (r.amount || 0), 0),
    pending: issues.filter((r) => r.status === "Pending").length,
    approved: issues.filter((r) => r.status === "Approved").length,
    rejected: issues.filter((r) => r.status === "Rejected").length,
    processing: issues.filter((r) => r.status === "Processing").length,
  }

  const handleUpdateStatus = async (issueId, newStatus) => {
    setIsUpdating(true)
    try {
      await issuesAPI.update(issueId, { status: newStatus })
      // Refresh issues
      const issuesData = await issuesAPI.getAll()
      setIssues(issuesData || [])
      success(`Refund request ${newStatus.toLowerCase()} successfully`)
      setDetailModal({ open: false, refund: null })
    } catch (err) {
      showError(err.message || "Failed to update refund status")
    } finally {
      setIsUpdating(false)
    }
  }

  const toggleExpand = (id) => {
    setExpandedRows((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]))
  }

  const toggleSelect = (id) => {
    setSelectedRefunds((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]))
  }

  return (
    <>
      <Helmet>
        <title>Refund Management - BuyPoint Admin</title>
        <meta name="description" content="Review and process refund requests" />
      </Helmet>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Refund Management</h1>
            <p className="text-muted-foreground">Review and process customer refund requests</p>
          </div>
          <Button variant="outline" className="gap-2 bg-transparent">
            <Download className="h-4 w-4" />
            Export
          </Button>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <DollarSign className="h-4 w-4" />
                <span className="text-sm">Total Refunds</span>
              </div>
              <p className="text-2xl font-bold">${stats.total.toFixed(2)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-warning mb-1">
                <Clock className="h-4 w-4" />
                <span className="text-sm">Pending</span>
              </div>
              <p className="text-2xl font-bold">{stats.pending}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-success mb-1">
                <CheckCircle className="h-4 w-4" />
                <span className="text-sm">Approved</span>
              </div>
              <p className="text-2xl font-bold">{stats.approved}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-destructive mb-1">
                <XCircle className="h-4 w-4" />
                <span className="text-sm">Rejected</span>
              </div>
              <p className="text-2xl font-bold">{stats.rejected}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-info mb-1">
                <RefreshCw className="h-4 w-4" />
                <span className="text-sm">Processing</span>
              </div>
              <p className="text-2xl font-bold">{stats.processing}</p>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by refund ID, order ID, or customer..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Button variant="outline" className="gap-2 bg-transparent">
            <Calendar className="h-4 w-4" />
            Date Range
          </Button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {tabs.map((tab) => (
            <Button
              key={tab}
              variant={activeTab === tab ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveTab(tab)}
              className="capitalize"
            >
              {tab}
              {tab !== "all" && (
                <Badge variant="secondary" className="ml-2">
                  {issues.filter((r) => r.status === tab).length}
                </Badge>
              )}
            </Button>
          ))}
        </div>

        {/* Bulk Actions */}
        {selectedRefunds.length > 0 && (
          <div className="flex items-center gap-4 p-3 bg-muted rounded-lg">
            <span className="text-sm font-medium">{selectedRefunds.length} selected</span>
            <Button size="sm" variant="outline" className="text-success bg-transparent">
              <CheckCircle className="h-4 w-4 mr-2" />
              Approve Selected
            </Button>
            <Button size="sm" variant="outline" className="text-destructive bg-transparent">
              <XCircle className="h-4 w-4 mr-2" />
              Reject Selected
            </Button>
          </div>
        )}

        {/* Refunds Table */}
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="p-4 text-left">
                    <Checkbox
                      checked={selectedRefunds.length === filteredRefunds.length && filteredRefunds.length > 0}
                      onCheckedChange={() => {
                        if (selectedRefunds.length === filteredRefunds.length) {
                          setSelectedRefunds([])
                        } else {
                          setSelectedRefunds(filteredRefunds.map((r) => r.id))
                        }
                      }}
                    />
                  </th>
                  <th className="p-4 text-left text-sm font-medium w-8"></th>
                  <th className="p-4 text-left text-sm font-medium">Refund ID</th>
                  <th className="p-4 text-left text-sm font-medium">Customer</th>
                  <th className="p-4 text-left text-sm font-medium">Product</th>
                  <th className="p-4 text-left text-sm font-medium">Amount</th>
                  <th className="p-4 text-left text-sm font-medium">Reason</th>
                  <th className="p-4 text-left text-sm font-medium">Status</th>
                  <th className="p-4 text-left text-sm font-medium">Date</th>
                  <th className="p-4 text-left text-sm font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={10} className="p-8 text-center">
                      <Loader2 className="h-6 w-6 animate-spin text-primary mx-auto" />
                    </td>
                  </tr>
                ) : filteredRefunds.length > 0 ? (
                  filteredRefunds.map((refund) => {
                    const status = statusConfig[refund.status] || statusConfig.Pending
                    const StatusIcon = status.icon
                    const isExpanded = expandedRows.includes(refund.id)
                    const user = refund.user || {}
                    const product = refund.product || {}
                    
                    return (
                    <>
                      <tr key={refund.id} className="border-b hover:bg-muted/50 transition-colors">
                        <td className="p-4">
                          <Checkbox
                            checked={selectedRefunds.includes(refund.id)}
                            onCheckedChange={() => toggleSelect(refund.id)}
                          />
                        </td>
                        <td className="p-4">
                          <Button variant="ghost" size="icon" onClick={() => toggleExpand(refund.id)}>
                            {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                          </Button>
                        </td>
                        <td className="p-4">
                          <span className="font-medium text-primary">{refund.id}</span>
                          <p className="text-xs text-muted-foreground">{refund.orderId || "N/A"}</p>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium">
                              {(user.fullName || user.email || "U").charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-medium text-sm">{user.fullName || "Unknown"}</p>
                              <p className="text-xs text-muted-foreground">{user.email || ""}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="relative h-10 w-10 rounded border overflow-hidden bg-muted">
                              <ImageWithLoader
                                src={product.image || "/placeholder.svg"}
                                alt={product.name || "Product"}
                                fill
                                className="object-cover"
                              />
                            </div>
                            <span className="text-sm truncate max-w-[120px]">{product.name || "N/A"}</span>
                          </div>
                        </td>
                        <td className="p-4">
                          <span className="font-bold text-lg">${(refund.amount || 0).toFixed(2)}</span>
                        </td>
                        <td className="p-4">
                          <span className="text-sm">{refund.reason || "N/A"}</span>
                        </td>
                        <td className="p-4">
                          <Badge variant="outline" className={status.color}>
                            <StatusIcon className="h-3 w-3 mr-1" />
                            {status.label}
                          </Badge>
                        </td>
                        <td className="p-4">
                          <span className="text-sm text-muted-foreground">
                            {new Date(refund.createdAt || refund.requestDate).toLocaleDateString()}
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
                              <DropdownMenuItem onClick={() => setDetailModal({ open: true, refund })}>
                                <Eye className="h-4 w-4 mr-2" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                className="text-success"
                                onClick={() => handleUpdateStatus(refund.id, "Approved")}
                              >
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Approve
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                className="text-destructive"
                                onClick={() => handleUpdateStatus(refund.id, "Rejected")}
                              >
                                <XCircle className="h-4 w-4 mr-2" />
                                Reject
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-info">
                                <RefreshCw className="h-4 w-4 mr-2" />
                                Process Refund
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                      {isExpanded && (
                        <tr className="bg-muted/30">
                          <td colSpan={10} className="p-4">
                            <div className="grid md:grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <h4 className="font-medium">Customer Description</h4>
                                <p className="text-sm text-muted-foreground">{refund.description || "No description provided"}</p>
                              </div>
                              {refund.evidence && refund.evidence.length > 0 && (
                                <div className="space-y-2">
                                  <h4 className="font-medium">Evidence</h4>
                                  <div className="flex gap-2">
                                    {refund.evidence.map((img, idx) => (
                                      <div key={idx} className="relative h-20 w-20 rounded border overflow-hidden">
                                        <ImageWithLoader
                                          src={img || "/placeholder.svg"}
                                          alt={`Evidence ${idx + 1}`}
                                          fill
                                          className="object-cover"
                                        />
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                      </>
                    )
                  })
                ) : (
                  <tr>
                    <td colSpan={10} className="p-8 text-center">
                      <p className="text-muted-foreground">No refund requests found</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Detail Modal */}
        <Dialog open={detailModal.open} onOpenChange={(open) => setDetailModal({ open, refund: null })}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Refund Details - {detailModal.refund?.id}</DialogTitle>
              <DialogDescription>Review the refund request and take action</DialogDescription>
            </DialogHeader>
            {detailModal.refund && (
              <div className="space-y-6 py-4">
                <div className="flex items-start gap-4">
                  <div className="relative h-20 w-20 rounded-lg border overflow-hidden bg-muted shrink-0">
                    <ImageWithLoader
                      src={(detailModal.refund.product?.image || detailModal.refund.product?.imageUrl) || "/placeholder.svg"}
                      alt={detailModal.refund.product?.name || "Product"}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium">{detailModal.refund.product?.name || "N/A"}</h3>
                    <p className="text-sm text-muted-foreground">Order: {detailModal.refund.orderId || "N/A"}</p>
                    <p className="text-lg font-bold mt-1">${(detailModal.refund.amount || 0).toFixed(2)}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Customer</p>
                    <p className="font-medium">{detailModal.refund.user?.fullName || "Unknown"}</p>
                    <p className="text-sm text-muted-foreground">{detailModal.refund.user?.email || ""}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Request Date</p>
                    <p className="font-medium">
                      {new Date(detailModal.refund.createdAt || detailModal.refund.requestDate).toLocaleString()}
                    </p>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground">Reason</p>
                  <Badge variant="outline" className="mt-1">
                    {detailModal.refund.reason || "N/A"}
                  </Badge>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground">Description</p>
                  <p className="mt-1">{detailModal.refund.description || "No description provided"}</p>
                </div>

                <div>
                  <label className="text-sm font-medium">Admin Note</label>
                  <Textarea
                    placeholder="Add a note about this refund decision..."
                    value={adminNote}
                    onChange={(e) => setAdminNote(e.target.value)}
                    className="mt-1"
                  />
                </div>
              </div>
            )}
            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={() => setDetailModal({ open: false, refund: null })}>
                Cancel
              </Button>
              <Button 
                variant="destructive" 
                className="gap-2"
                onClick={() => handleUpdateStatus(detailModal.refund.id, "Rejected")}
                disabled={isUpdating}
              >
                {isUpdating ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  <>
                    <XCircle className="h-4 w-4" />
                    Reject
                  </>
                )}
              </Button>
              <Button 
                className="gap-2 bg-success hover:bg-success/90"
                onClick={() => handleUpdateStatus(detailModal.refund.id, "Approved")}
                disabled={isUpdating}
              >
                <CheckCircle className="h-4 w-4" />
                Approve
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </>
  )
}

