import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { Helmet } from "react-helmet-async"
import {
  DollarSign,
  ShoppingCart,
  Users,
  RefreshCw,
  Package,
  Megaphone,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Star,
  Plus,
  Eye,
  ArrowRight,
  CheckCircle,
  Clock,
  Loader2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ImageWithLoader } from "@/components/ui/image-loader"
import { dashboardAPI, ordersAPI, productsAPI, announcementsAPI } from "@/lib/api"
import { useToast } from "@/components/ui/toast-notification"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

const statsCards = [
  {
    title: "Total Sales",
    value: "$125,430",
    change: "+12.5%",
    trend: "up",
    icon: DollarSign,
    href: "/admin/analytics",
  },
  {
    title: "Total Orders",
    value: "1,234",
    change: "+8.2%",
    trend: "up",
    icon: ShoppingCart,
    href: "/admin/orders",
  },
  {
    title: "Total Users",
    value: "567",
    change: "+15.3%",
    trend: "up",
    icon: Users,
    href: "/admin/users",
  },
  {
    title: "Pending Refunds",
    value: "12",
    change: "-3",
    trend: "down",
    icon: RefreshCw,
    href: "/admin/refunds",
  },
  {
    title: "Low Stock Items",
    value: "8",
    change: "+2",
    trend: "up",
    icon: Package,
    href: "/admin/products",
  },
  {
    title: "Active Announcements",
    value: "3",
    change: "0",
    trend: "neutral",
    icon: Megaphone,
    href: "/admin/announcements",
  },
]

const revenueData = [
  { day: "Mon", revenue: 4200 },
  { day: "Tue", revenue: 3800 },
  { day: "Wed", revenue: 5100 },
  { day: "Thu", revenue: 4600 },
  { day: "Fri", revenue: 6200 },
  { day: "Sat", revenue: 7800 },
  { day: "Sun", revenue: 5400 },
]

const recentOrders = [
  { id: "ORD-1234", customer: "John Doe", product: "Wireless Headphones", amount: 249.99, status: "pending" },
  { id: "ORD-1235", customer: "Jane Smith", product: "Smart Watch", amount: 179.99, status: "processing" },
  { id: "ORD-1236", customer: "Mike Chen", product: "Yoga Mat", amount: 59.99, status: "shipped" },
  { id: "ORD-1237", customer: "Sarah Lee", product: "Desk Lamp", amount: 89.99, status: "delivered" },
  { id: "ORD-1238", customer: "Alex Johnson", product: "T-Shirt", amount: 34.99, status: "pending" },
]

const orderStatusConfig = {
  pending: { color: "bg-warning text-warning-foreground", icon: Clock },
  processing: { color: "bg-info text-info-foreground", icon: Package },
  shipped: { color: "bg-primary text-primary-foreground", icon: ShoppingCart },
  delivered: { color: "bg-success text-success-foreground", icon: CheckCircle },
}

export default function AdminDashboard() {
  const { error: showError } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [dashboardData, setDashboardData] = useState({
    totalSales: 0,
    lowStockCount: 0,
    pendingIssues: 0,
  })
  const [orders, setOrders] = useState([])
  const [products, setProducts] = useState([])
  const [announcements, setAnnouncements] = useState([])

  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true)
      try {
        const [summary, ordersData, productsData, announcementsData] = await Promise.all([
          dashboardAPI.getSummary().catch(() => ({ totalSales: 0, lowStockCount: 0, pendingIssues: 0 })),
          ordersAPI.getAll().catch(() => []),
          productsAPI.getAll().catch(() => []),
          announcementsAPI.getAll().catch(() => []),
        ])

        setDashboardData(summary)
        setOrders(ordersData || [])
        setProducts(productsData || [])
        setAnnouncements(announcementsData || [])
      } catch (err) {
        console.error("Failed to fetch dashboard data:", err)
        showError("Failed to load dashboard data. Please try again later.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchDashboardData()
  }, [showError])

  const topReviewedProducts = products.slice(0, 5).sort((a, b) => (b.reviewCount || 0) - (a.reviewCount || 0))
  const lowStockProducts = products.filter((p) => (p.stock || 0) < 50).slice(0, 5)
  const recentOrders = orders.slice(0, 5)

  const statsCards = [
    {
      title: "Total Sales",
      value: `$${dashboardData.totalSales.toFixed(2)}`,
      change: "+12.5%",
      trend: "up",
      icon: DollarSign,
      href: "/admin/analytics",
    },
    {
      title: "Total Orders",
      value: orders.length.toString(),
      change: "+8.2%",
      trend: "up",
      icon: ShoppingCart,
      href: "/admin/orders",
    },
    {
      title: "Total Users",
      value: "567", // TODO: Add users API
      change: "+15.3%",
      trend: "up",
      icon: Users,
      href: "/admin/users",
    },
    {
      title: "Pending Refunds",
      value: dashboardData.pendingIssues.toString(),
      change: "-3",
      trend: "down",
      icon: RefreshCw,
      href: "/admin/refunds",
    },
    {
      title: "Low Stock Items",
      value: dashboardData.lowStockCount.toString(),
      change: "+2",
      trend: "up",
      icon: Package,
      href: "/admin/products",
    },
    {
      title: "Active Announcements",
      value: announcements.filter((a) => a.status === "Active").length.toString(),
      change: "0",
      trend: "neutral",
      icon: Megaphone,
      href: "/admin/announcements",
    },
  ]

  return (
    <>
      <Helmet>
        <title>Admin Dashboard - BuyPoint</title>
        <meta name="description" content="Admin dashboard overview" />
      </Helmet>
      <div className="p-6 space-y-6">
        {/* System Status Banner */}
        <div className="flex items-center justify-between p-4 rounded-lg bg-success/10 border border-success/20">
          <div className="flex items-center gap-3">
            <div className="h-3 w-3 rounded-full bg-success animate-pulse" />
            <span className="font-medium text-success">All Systems Operational</span>
          </div>
          <Link to="/admin/system" className="text-sm text-primary hover:underline">
            View Details
          </Link>
        </div>

        {/* Active Announcements */}
        {announcements.filter((a) => a.status === "active" || a.status === "Active").length > 0 && (
          <div className="space-y-2">
            {announcements
              .filter((a) => a.status === "active" || a.status === "Active")
              .map((announcement) => (
                <div
                  key={announcement.id}
                  className={`p-3 rounded-lg border flex items-center justify-between ${
                    announcement.type === "warning"
                      ? "bg-warning/10 border-warning/20"
                      : announcement.type === "success"
                        ? "bg-success/10 border-success/20"
                        : "bg-info/10 border-info/20"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <AlertTriangle
                      className={`h-4 w-4 ${
                        announcement.type === "warning"
                          ? "text-warning"
                          : announcement.type === "success"
                            ? "text-success"
                            : "text-info"
                      }`}
                    />
                    <span className="text-sm">
                      <strong>{announcement.title}</strong> — {announcement.message}
                    </span>
                  </div>
                </div>
              ))}
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {statsCards.map((stat) => (
            <Link key={stat.title} to={stat.href}>
              <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div
                      className={`h-10 w-10 rounded-lg flex items-center justify-center ${
                        stat.trend === "up"
                          ? "bg-success/10 text-success"
                          : stat.trend === "down"
                            ? "bg-destructive/10 text-destructive"
                            : "bg-muted text-muted-foreground"
                      }`}
                    >
                      <stat.icon className="h-5 w-5" />
                    </div>
                    <div className="flex items-center gap-1 text-xs">
                      {stat.trend === "up" ? (
                        <TrendingUp className="h-3 w-3 text-success" />
                      ) : stat.trend === "down" ? (
                        <TrendingDown className="h-3 w-3 text-destructive" />
                      ) : null}
                      <span
                        className={stat.trend === "up" ? "text-success" : stat.trend === "down" ? "text-destructive" : ""}
                      >
                        {stat.change}
                      </span>
                    </div>
                  </div>
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.title}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Revenue Chart */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Revenue Overview</CardTitle>
              <CardDescription>Last 7 days performance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="day" className="text-xs" />
                    <YAxis className="text-xs" tickFormatter={(value) => `$${value}`} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                      formatter={(value) => [`$${value}`, "Revenue"]}
                    />
                    <Line
                      type="monotone"
                      dataKey="revenue"
                      stroke="hsl(var(--primary))"
                      strokeWidth={2}
                      dot={{ fill: "hsl(var(--primary))" }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full justify-start gap-2" asChild>
                <Link to="/admin/products/add">
                  <Plus className="h-4 w-4" />
                  Add New Product
                </Link>
              </Button>
              <Button variant="outline" className="w-full justify-start gap-2 bg-transparent" asChild>
                <Link to="/admin/announcements">
                  <Megaphone className="h-4 w-4" />
                  Create Announcement
                </Link>
              </Button>
              <Button variant="outline" className="w-full justify-start gap-2 bg-transparent" asChild>
                <Link to="/admin/analytics">
                  <Eye className="h-4 w-4" />
                  View Analytics
                </Link>
              </Button>
              <Button variant="outline" className="w-full justify-start gap-2 bg-transparent" asChild>
                <Link to="/admin/orders">
                  <ShoppingCart className="h-4 w-4" />
                  Manage Orders
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Recent Orders */}
          <Card>
            <CardHeader className="flex-row items-center justify-between">
              <div>
                <CardTitle>Recent Orders</CardTitle>
                <CardDescription>Latest 5 orders</CardDescription>
              </div>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/admin/orders">
                  View All
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {isLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  </div>
                ) : recentOrders.length > 0 ? (
                  recentOrders.map((order) => {
                    const user = order.user || {}
                    const firstItem = order.items?.[0]
                    const product = firstItem?.product || firstItem
                    const status = orderStatusConfig[order.status] || orderStatusConfig.pending
                    const StatusIcon = status.icon

                    return (
                      <div key={order.id} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center font-medium">
                            {(user.fullName || user.email || "U").charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-medium text-sm">{order.orderNumber || order.id}</p>
                            <p className="text-xs text-muted-foreground">{user.fullName || user.email || "Unknown"}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">${(order.total || 0).toFixed(2)}</p>
                          <Badge className={`${status.color} text-xs`}>{order.status}</Badge>
                        </div>
                      </div>
                    )
                  })
                ) : (
                  <p className="text-center text-muted-foreground py-4">No recent orders</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Top Reviewed Products */}
          <Card>
            <CardHeader className="flex-row items-center justify-between">
              <div>
                <CardTitle>Most Reviewed Products</CardTitle>
                <CardDescription>Top performing items</CardDescription>
              </div>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/admin/analytics">
                  View All
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topReviewedProducts.map((product) => (
                  <div key={product.id} className="flex items-center gap-3">
                    <div className="relative h-10 w-10 rounded-lg overflow-hidden bg-muted shrink-0">
                      <ImageWithLoader src={product.image || "/placeholder.svg"} alt={product.name} fill className="object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{product.name}</p>
                      <div className="flex items-center gap-1">
                        <Star className="h-3 w-3 fill-warning text-warning" />
                        <span className="text-xs text-muted-foreground">{product.rating}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-sm">{product.reviewCount}</p>
                      <p className="text-xs text-muted-foreground">reviews</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Low Stock Alerts */}
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <div>
              <CardTitle>Stock Alerts</CardTitle>
              <CardDescription>Products running low on stock</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/admin/products">
                View All
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
              {lowStockProducts.map((product) => (
                <div key={product.id} className="flex items-center gap-3 p-3 border rounded-lg">
                  <div className="relative h-12 w-12 rounded-lg overflow-hidden bg-muted shrink-0">
                    <ImageWithLoader src={product.image || "/placeholder.svg"} alt={product.name} fill className="object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{product.name}</p>
                    <p className={`text-xs ${product.stock < 20 ? "text-destructive" : "text-warning"}`}>
                      {product.stock} in stock
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  )
}

