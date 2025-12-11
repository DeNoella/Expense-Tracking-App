import { useState, useEffect } from "react"
import { Helmet } from "react-helmet-async"
import {
  Search,
  Download,
  MoreHorizontal,
  Eye,
  Printer,
  XCircle,
  ChevronLeft,
  ChevronRight,
  Package,
  Truck,
  CheckCircle,
  Clock,
  Calendar,
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { ImageWithLoader } from "@/components/ui/image-loader"
import { ordersAPI } from "@/lib/api"
import { useToast } from "@/components/ui/toast-notification"

const mockOrders = [
  {
    id: "ORD-2024-001",
    customer: { name: "John Doe", email: "john@example.com", avatar: null },
    products: [
      { name: "Wireless Headphones", image: "/diverse-people-listening-headphones.png", quantity: 1 },
      { name: "Phone Case", image: "/colorful-phone-case-display.png", quantity: 2 },
    ],
    total: 289.97,
    date: "2024-01-15T10:30:00",
    status: "pending",
    paymentStatus: "paid",
  },
  {
    id: "ORD-2024-002",
    customer: { name: "Jane Smith", email: "jane@example.com", avatar: null },
    products: [{ name: "Smart Watch", image: "/modern-smartwatch.png", quantity: 1 }],
    total: 179.99,
    date: "2024-01-15T09:15:00",
    status: "processing",
    paymentStatus: "paid",
  },
  {
    id: "ORD-2024-003",
    customer: { name: "Mike Chen", email: "mike@example.com", avatar: null },
    products: [
      { name: "Yoga Mat", image: "/rolled-yoga-mat.png", quantity: 1 },
      { name: "Water Bottle", image: "/reusable-water-bottle.png", quantity: 1 },
    ],
    total: 89.98,
    date: "2024-01-14T16:45:00",
    status: "shipped",
    paymentStatus: "paid",
  },
  {
    id: "ORD-2024-004",
    customer: { name: "Sarah Lee", email: "sarah@example.com", avatar: null },
    products: [{ name: "Desk Lamp", image: "/modern-desk-lamp.png", quantity: 1 }],
    total: 89.99,
    date: "2024-01-14T14:20:00",
    status: "delivered",
    paymentStatus: "paid",
  },
  {
    id: "ORD-2024-005",
    customer: { name: "Alex Johnson", email: "alex@example.com", avatar: null },
    products: [{ name: "T-Shirt", image: "/plain-white-tshirt.png", quantity: 3 }],
    total: 104.97,
    date: "2024-01-13T11:00:00",
    status: "cancelled",
    paymentStatus: "refunded",
  },
  {
    id: "ORD-2024-006",
    customer: { name: "Emily Brown", email: "emily@example.com", avatar: null },
    products: [{ name: "Bluetooth Speaker", image: "/audio-speaker.png", quantity: 1 }],
    total: 149.99,
    date: "2024-01-13T08:30:00",
    status: "pending",
    paymentStatus: "pending",
  },
]

const statusConfig = {
  Pending: { label: "Pending", color: "bg-warning/10 text-warning border-warning/20", icon: Clock },
  Processing: { label: "Processing", color: "bg-info/10 text-info border-info/20", icon: Package },
  Shipped: { label: "Shipped", color: "bg-primary/10 text-primary border-primary/20", icon: Truck },
  InTransit: { label: "In Transit", color: "bg-primary/10 text-primary border-primary/20", icon: Truck },
  Delivered: { label: "Delivered", color: "bg-success/10 text-success border-success/20", icon: CheckCircle },
  Cancelled: { label: "Cancelled", color: "bg-destructive/10 text-destructive border-destructive/20", icon: XCircle },
}

const paymentStatusConfig = {
  paid: { label: "Paid", color: "bg-success/10 text-success" },
  pending: { label: "Pending", color: "bg-warning/10 text-warning" },
  failed: { label: "Failed", color: "bg-destructive/10 text-destructive" },
  refunded: { label: "Refunded", color: "bg-muted text-muted-foreground" },
}

const tabs = ["all", "Pending", "Processing", "Shipped", "Delivered", "Cancelled"]

export default function AdminOrdersPage() {
  const { success, error: showError } = useToast()
  const [orders, setOrders] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedOrders, setSelectedOrders] = useState([])
  const [statusModal, setStatusModal] = useState({ open: false, order: null })
  const [newStatus, setNewStatus] = useState("")
  const [statusNote, setStatusNote] = useState("")
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false)

  useEffect(() => {
    const fetchOrders = async () => {
      setIsLoading(true)
      try {
        const ordersData = await ordersAPI.getAll()
        setOrders(ordersData || [])
      } catch (err) {
        console.error("Failed to fetch orders:", err)
        showError("Failed to load orders. Please try again later.")
        setOrders([])
      } finally {
        setIsLoading(false)
      }
    }
    fetchOrders()
  }, [showError])

  const filteredOrders = orders.filter((order) => {
    const matchesTab = activeTab === "all" || order.status === activeTab
    const matchesSearch =
      (order.orderNumber || order.id || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (order.user?.fullName || order.user?.email || "").toLowerCase().includes(searchQuery.toLowerCase())
    return matchesTab && matchesSearch
  })

  const stats = {
    total: orders.length,
    pending: orders.filter((o) => o.status === "Pending").length,
    processing: orders.filter((o) => o.status === "Processing").length,
    completed: orders.filter((o) => o.status === "Delivered").length,
    revenue: orders.reduce((sum, o) => sum + (o.total || 0), 0),
  }

  const handleUpdateStatus = async () => {
    if (!statusModal.order || !newStatus) return

    setIsUpdatingStatus(true)
    try {
      await ordersAPI.updateStatus(statusModal.order.id, newStatus)
      // Refresh orders
      const ordersData = await ordersAPI.getAll()
      setOrders(ordersData || [])
      setStatusModal({ open: false, order: null })
      setNewStatus("")
      setStatusNote("")
      success("Order status updated successfully")
    } catch (err) {
      showError(err.message || "Failed to update order status")
    } finally {
      setIsUpdatingStatus(false)
    }
  }

  const toggleSelectOrder = (orderId) => {
    setSelectedOrders((prev) => (prev.includes(orderId) ? prev.filter((id) => id !== orderId) : [...prev, orderId]))
  }

  const toggleSelectAll = () => {
    if (selectedOrders.length === filteredOrders.length) {
      setSelectedOrders([])
    } else {
      setSelectedOrders(filteredOrders.map((o) => o.id))
    }
  }

  return (
    <>
      <Helmet>
        <title>Order Management - BuyPoint Admin</title>
        <meta name="description" content="Manage and track customer orders" />
      </Helmet>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Order Management</h1>
            <p className="text-muted-foreground">Manage and track all customer orders</p>
          </div>
          <Button variant="outline" className="gap-2 bg-transparent">
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">Total Orders</p>
              <p className="text-2xl font-bold">{stats.total}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">Pending</p>
              <p className="text-2xl font-bold text-warning">{stats.pending}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">Processing</p>
              <p className="text-2xl font-bold text-info">{stats.processing}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">Completed</p>
              <p className="text-2xl font-bold text-success">{stats.completed}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">Revenue</p>
              <p className="text-2xl font-bold">${stats.revenue.toFixed(2)}</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search orders..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="flex gap-2">
            <Select>
              <SelectTrigger className="w-[140px]">
                <Calendar className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Date Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
                <SelectItem value="custom">Custom Range</SelectItem>
              </SelectContent>
            </Select>
          </div>
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
                  {orders.filter((o) => o.status === tab).length}
                </Badge>
              )}
            </Button>
          ))}
        </div>

        {/* Bulk Actions */}
        {selectedOrders.length > 0 && (
          <div className="flex items-center gap-4 p-3 bg-muted rounded-lg">
            <span className="text-sm font-medium">{selectedOrders.length} selected</span>
            <Button size="sm" variant="outline">
              Update Status
            </Button>
            <Button size="sm" variant="outline">
              Export Selected
            </Button>
            <Button size="sm" variant="outline">
              Print Invoices
            </Button>
          </div>
        )}

        {/* Orders Table */}
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="p-4 text-left">
                    <Checkbox
                      checked={selectedOrders.length === filteredOrders.length && filteredOrders.length > 0}
                      onCheckedChange={toggleSelectAll}
                    />
                  </th>
                  <th className="p-4 text-left text-sm font-medium">Order ID</th>
                  <th className="p-4 text-left text-sm font-medium">Customer</th>
                  <th className="p-4 text-left text-sm font-medium">Products</th>
                  <th className="p-4 text-left text-sm font-medium">Total</th>
                  <th className="p-4 text-left text-sm font-medium">Date</th>
                  <th className="p-4 text-left text-sm font-medium">Status</th>
                  <th className="p-4 text-left text-sm font-medium">Payment</th>
                  <th className="p-4 text-left text-sm font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={9} className="p-8 text-center">
                      <Loader2 className="h-6 w-6 animate-spin text-primary mx-auto" />
                    </td>
                  </tr>
                ) : filteredOrders.length > 0 ? (
                  filteredOrders.map((order) => {
                    const status = statusConfig[order.status] || statusConfig.Pending
                    const StatusIcon = status.icon
                    const paymentStatus = order.payments?.[0]?.status || "pending"
                    const payment = paymentStatusConfig[paymentStatus] || paymentStatusConfig.pending
                    const orderItems = order.items || []
                    const user = order.user || {}

                    return (
                      <tr key={order.id} className="border-b hover:bg-muted/50 transition-colors">
                        <td className="p-4">
                          <Checkbox
                            checked={selectedOrders.includes(order.id)}
                            onCheckedChange={() => toggleSelectOrder(order.id)}
                        />
                      </td>
                      <td className="p-4">
                        <span className="font-medium text-primary">{order.orderNumber || order.id}</span>
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
                        <div className="flex items-center gap-1">
                          {orderItems.slice(0, 2).map((item, idx) => {
                            const product = item.product || item
                            return (
                              <div key={idx} className="relative h-8 w-8 rounded border overflow-hidden bg-muted">
                                <ImageWithLoader
                                  src={product.image || "/placeholder.svg"}
                                  alt={product.name || "Product"}
                                  fill
                                  className="object-cover"
                                />
                              </div>
                            )
                          })}
                          {orderItems.length > 2 && (
                            <span className="text-xs text-muted-foreground ml-1">+{orderItems.length - 2}</span>
                          )}
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="font-bold">${(order.total || 0).toFixed(2)}</span>
                      </td>
                      <td className="p-4">
                        <span className="text-sm text-muted-foreground">
                          {new Date(order.createdAt || order.orderDate).toLocaleDateString()}
                        </span>
                      </td>
                      <td className="p-4">
                        <Badge variant="outline" className={status.color}>
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {status.label}
                        </Badge>
                      </td>
                      <td className="p-4">
                        <Badge className={payment.color}>{payment.label}</Badge>
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
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setStatusModal({ open: true, order })}>
                              <Package className="h-4 w-4 mr-2" />
                              Update Status
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Printer className="h-4 w-4 mr-2" />
                              Print Invoice
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-destructive">
                              <XCircle className="h-4 w-4 mr-2" />
                              Cancel Order
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                      </tr>
                    )
                  })
                ) : (
                  <tr>
                    <td colSpan={9} className="p-8 text-center">
                      <p className="text-muted-foreground">No orders found</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between p-4 border-t">
            <p className="text-sm text-muted-foreground">
              Showing {filteredOrders.length} of {orders.length} orders
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
              <Button variant="ghost" size="sm">
                3
              </Button>
              <Button variant="outline" size="icon">
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </Card>

        {/* Status Update Modal */}
        <Dialog open={statusModal.open} onOpenChange={(open) => setStatusModal({ open, order: null })}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Update Order Status</DialogTitle>
              <DialogDescription>
                Update status for order {statusModal.order?.orderNumber || statusModal.order?.id}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">New Status</label>
                <Select value={newStatus} onValueChange={setNewStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Pending">Pending</SelectItem>
                    <SelectItem value="Processing">Processing</SelectItem>
                    <SelectItem value="Shipped">Shipped</SelectItem>
                    <SelectItem value="InTransit">In Transit</SelectItem>
                    <SelectItem value="Delivered">Delivered</SelectItem>
                    <SelectItem value="Cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Notes (Optional)</label>
                <Textarea
                  placeholder="Add any notes about this status change..."
                  value={statusNote}
                  onChange={(e) => setStatusNote(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => {
                  setStatusModal({ open: false, order: null })
                  setNewStatus("")
                  setStatusNote("")
                }}
                disabled={isUpdatingStatus}
              >
                Cancel
              </Button>
              <Button onClick={handleUpdateStatus} disabled={!newStatus || isUpdatingStatus}>
                {isUpdatingStatus ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  "Update Status"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </>
  )
}

