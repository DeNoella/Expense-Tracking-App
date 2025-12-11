import { useState, useEffect } from "react"
import { Helmet } from "react-helmet-async"
import {
  Calendar,
  TrendingUp,
  Star,
  Package,
  DollarSign,
  MessageSquare,
  AlertTriangle,
  Download,
  Filter,
  Eye,
  RefreshCw,
  Loader2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ImageWithLoader } from "@/components/ui/image-loader"
import { analyticsAPI, productsAPI } from "@/lib/api"
import { useToast } from "@/components/ui/toast-notification"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts"

export default function AdminAnalyticsPage() {
  const { error: showError } = useToast()
  const [dateRange, setDateRange] = useState("30d")
  const [category, setCategory] = useState("all")
  const [isLoading, setIsLoading] = useState(true)
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalRevenue: 0,
    avgRating: 0,
    totalReviews: 0,
  })
  const [salesByCategory, setSalesByCategory] = useState([])
  const [topSellingProducts, setTopSellingProducts] = useState([])
  const [salesTrend, setSalesTrend] = useState([])
  const [lowStockProducts, setLowStockProducts] = useState([])
  const [topReviewedProducts, setTopReviewedProducts] = useState([])

  useEffect(() => {
    const fetchAnalytics = async () => {
      setIsLoading(true)
      try {
        const months = dateRange === "7d" ? 1 : dateRange === "30d" ? 3 : dateRange === "90d" ? 6 : 12
        
        const [
          productStats,
          salesByCat,
          topSelling,
          trend,
          lowStock,
          topReviewed
        ] = await Promise.all([
          analyticsAPI.getProductStats().catch(() => ({ totalProducts: 0, totalRevenue: 0, avgRating: 0, totalReviews: 0 })),
          analyticsAPI.getSalesByCategory().catch(() => []),
          analyticsAPI.getTopSellingProducts(5).catch(() => []),
          analyticsAPI.getSalesTrend(months).catch(() => []),
          analyticsAPI.getLowStockProducts(50).catch(() => []),
          analyticsAPI.getTopReviewedProducts(10).catch(() => []),
        ])

        setStats(productStats)
        setSalesByCategory(salesByCat)
        setTopSellingProducts(topSelling)
        setSalesTrend(trend.map(t => ({ month: t.month, sales: t.sales })))
        setLowStockProducts(lowStock)
        setTopReviewedProducts(topReviewed)
      } catch (err) {
        console.error("Failed to fetch analytics:", err)
        showError("Failed to load analytics data. Please try again later.")
      } finally {
        setIsLoading(false)
      }
    }
    fetchAnalytics()
  }, [dateRange, showError])

  return (
    <>
      <Helmet>
        <title>Product Analytics - BuyPoint Admin</title>
        <meta name="description" content="Product analytics and insights" />
      </Helmet>
      <div className="p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Product Analytics</h1>
            <p className="text-muted-foreground">Insights into product performance and sales</p>
          </div>
          <div className="flex gap-2">
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger className="w-[140px]">
                <Calendar className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="90d">Last 90 days</SelectItem>
                <SelectItem value="1y">Last year</SelectItem>
              </SelectContent>
            </Select>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="w-[140px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="electronics">Electronics</SelectItem>
                <SelectItem value="clothing">Clothing</SelectItem>
                <SelectItem value="home">Home & Garden</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" className="gap-2 bg-transparent">
              <Download className="h-4 w-4" />
              Export
            </Button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Products</p>
                  <p className="text-2xl font-bold">{stats.totalProducts}</p>
                </div>
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Package className="h-6 w-6 text-primary" />
                </div>
              </div>
              <div className="flex items-center gap-1 mt-2 text-sm text-success">
                <TrendingUp className="h-4 w-4" />
                <span>+12 this month</span>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Revenue</p>
                  <p className="text-2xl font-bold">${stats.totalRevenue.toLocaleString()}</p>
                </div>
                <div className="h-12 w-12 rounded-lg bg-success/10 flex items-center justify-center">
                  <DollarSign className="h-6 w-6 text-success" />
                </div>
              </div>
              <div className="flex items-center gap-1 mt-2 text-sm text-success">
                <TrendingUp className="h-4 w-4" />
                <span>+18.2% vs last month</span>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Average Rating</p>
                  <p className="text-2xl font-bold">{stats.avgRating}</p>
                </div>
                <div className="h-12 w-12 rounded-lg bg-warning/10 flex items-center justify-center">
                  <Star className="h-6 w-6 text-warning" />
                </div>
              </div>
              <div className="flex items-center gap-1 mt-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`h-4 w-4 ${star <= Math.floor(stats.avgRating) ? "fill-warning text-warning" : "text-muted"}`}
                  />
                ))}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Reviews</p>
                  <p className="text-2xl font-bold">{stats.totalReviews.toLocaleString()}</p>
                </div>
                <div className="h-12 w-12 rounded-lg bg-info/10 flex items-center justify-center">
                  <MessageSquare className="h-6 w-6 text-info" />
                </div>
              </div>
              <div className="flex items-center gap-1 mt-2 text-sm text-success">
                <TrendingUp className="h-4 w-4" />
                <span>+256 this week</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Sales Trend */}
          <Card>
            <CardHeader>
              <CardTitle>Sales Trend</CardTitle>
              <CardDescription>Revenue over the last 6 months</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                {isLoading ? (
                  <div className="flex items-center justify-center h-full">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : salesTrend.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={salesTrend}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="month" className="text-xs" />
                    <YAxis className="text-xs" tickFormatter={(value) => `$${value / 1000}k`} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                      formatter={(value) => [`$${value.toLocaleString()}`, "Revenue"]}
                    />
                    <Line
                      type="monotone"
                      dataKey="sales"
                      stroke="hsl(var(--primary))"
                      strokeWidth={2}
                      dot={{ fill: "hsl(var(--primary))" }}
                    />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full text-muted-foreground">
                    No sales data available
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Revenue by Category */}
          <Card>
            <CardHeader>
              <CardTitle>Revenue by Category</CardTitle>
              <CardDescription>Distribution of sales across categories</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] flex items-center">
                {isLoading ? (
                  <div className="flex items-center justify-center w-full h-full">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : salesByCategory.length > 0 ? (
                  <>
                    <ResponsiveContainer width="50%" height="100%">
                      <PieChart>
                    <Pie
                      data={salesByCategory}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {salesByCategory.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                      formatter={(value) => [`$${value.toLocaleString()}`, "Revenue"]}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex-1 space-y-2">
                  {salesByCategory.map((category) => (
                    <div key={category.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full" style={{ backgroundColor: category.color }} />
                        <span className="text-sm">{category.name}</span>
                      </div>
                      <span className="text-sm font-medium">${(category.value / 1000).toFixed(1)}k</span>
                      </div>
                    ))}
                  </div>
                </>
                ) : (
                  <div className="flex items-center justify-center w-full h-full text-muted-foreground">
                    No category sales data available
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Top Selling Products */}
        <Card>
          <CardHeader>
            <CardTitle>Top Selling Products</CardTitle>
            <CardDescription>Best performing products by units sold</CardDescription>
          </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                {isLoading ? (
                  <div className="flex items-center justify-center h-full">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : topSellingProducts.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={topSellingProducts} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis type="number" className="text-xs" />
                  <YAxis dataKey="name" type="category" className="text-xs" width={150} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                    formatter={(value, name) => [
                      name === "units" ? `${value} units` : `$${value.toLocaleString()}`,
                      name === "units" ? "Units Sold" : "Revenue",
                    ]}
                  />
                      <Bar dataKey="units" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full text-muted-foreground">
                    No top selling products data available
                  </div>
                )}
              </div>
          </CardContent>
        </Card>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Most Reviewed Products */}
          <Card>
            <CardHeader className="flex-row items-center justify-between">
              <div>
                <CardTitle>Most Reviewed Products</CardTitle>
                <CardDescription>Products with the most customer reviews</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {isLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  </div>
                ) : topReviewedProducts.length > 0 ? (
                  topReviewedProducts.map((product, index) => (
                    <div key={product.id} className="flex items-center gap-3">
                      <span className="text-sm font-bold text-muted-foreground w-6">#{index + 1}</span>
                      <div className="relative h-10 w-10 rounded-lg overflow-hidden bg-muted shrink-0">
                        <ImageWithLoader src={product.imageUrl || "/placeholder.svg"} alt={product.name} fill className="object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{product.name}</p>
                        <div className="flex items-center gap-1">
                          <Star className="h-3 w-3 fill-warning text-warning" />
                          <span className="text-xs text-muted-foreground">{product.rating}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">{product.reviewCount}</p>
                        <p className="text-xs text-muted-foreground">reviews</p>
                      </div>
                      <Button variant="ghost" size="icon">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-muted-foreground py-8">No reviewed products found</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Low Stock Alerts */}
          <Card>
            <CardHeader className="flex-row items-center justify-between">
              <div>
                <CardTitle>Low Stock Alerts</CardTitle>
                <CardDescription>Products that need restocking</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {isLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  </div>
                ) : lowStockProducts.length > 0 ? (
                  lowStockProducts.map((product) => (
                    <div key={product.id} className="flex items-center gap-3">
                      <div className="relative h-10 w-10 rounded-lg overflow-hidden bg-muted shrink-0">
                        <ImageWithLoader src={product.imageUrl || "/placeholder.svg"} alt={product.name} fill className="object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{product.name}</p>
                        <p className={`text-xs ${product.stockQty < 20 ? "text-destructive" : "text-warning"}`}>
                          {product.stockQty} in stock
                        </p>
                      </div>
                      <Badge
                        variant="outline"
                        className={
                          product.stockQty < 20 ? "text-destructive border-destructive" : "text-warning border-warning"
                        }
                      >
                        <AlertTriangle className="h-3 w-3 mr-1" />
                        {product.stockQty < 20 ? "Critical" : "Low"}
                      </Badge>
                      <Button size="sm" variant="outline" className="gap-1 bg-transparent">
                        <RefreshCw className="h-3 w-3" />
                        Restock
                      </Button>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-muted-foreground py-8">No low stock products</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  )
}

