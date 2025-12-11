import { useState, useEffect } from "react"
import { Link, Navigate } from "react-router-dom"
import { Helmet } from "react-helmet-async"
import {
  User,
  Package,
  MapPin,
  Settings,
  Camera,
  ChevronRight,
  Eye,
  Truck,
  CheckCircle,
  Clock,
  XCircle,
  Loader2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { ImageWithLoader } from "@/components/ui/image-loader"
import { useAuth } from "@/contexts/AuthContext"
import { ordersAPI } from "@/lib/api"
import { useToast } from "@/components/ui/toast-notification"

const mockAddresses = [
  {
    id: "1",
    label: "Home",
    name: "",
    address: "",
    city: "",
    state: "",
    postalCode: "",
    country: "",
    isDefault: true,
  },
]

const statusConfig = {
  pending: { label: "Pending", color: "bg-warning text-warning-foreground", icon: Clock },
  processing: { label: "Processing", color: "bg-info text-info-foreground", icon: Package },
  shipped: { label: "Shipped", color: "bg-primary text-primary-foreground", icon: Truck },
  delivered: { label: "Delivered", color: "bg-success text-success-foreground", icon: CheckCircle },
  cancelled: { label: "Cancelled", color: "bg-destructive text-destructive-foreground", icon: XCircle },
}

export default function ProfilePage() {
  const { user: authUser, isAuthenticated, isLoading: authLoading } = useAuth()
  const { error: showError } = useToast()
  const [user, setUser] = useState({
    name: "",
    email: "",
    phone: "",
    avatar: null,
  })
  const [addresses] = useState(mockAddresses)
  const [orders, setOrders] = useState([])
  const [ordersLoading, setOrdersLoading] = useState(true)

  // Load user data from auth context
  useEffect(() => {
    if (authUser) {
      // Handle both camelCase and PascalCase from API
      const fullName = authUser.FullName || authUser.fullName || "";
      const email = authUser.Email || authUser.email || "";
      
      setUser({
        name: fullName || email.split("@")[0] || "User",
        email: email,
        phone: "",
        avatar: null,
      })
    }
  }, [authUser])

  // Fetch user orders
  useEffect(() => {
    const fetchOrders = async () => {
      if (!isAuthenticated) return
      
      setOrdersLoading(true)
      try {
        const ordersData = await ordersAPI.getMyOrders()
        setOrders(ordersData || [])
      } catch (err) {
        console.error("Failed to fetch orders:", err)
        showError("Failed to load orders. Please try again later.")
        setOrders([])
      } finally {
        setOrdersLoading(false)
      }
    }

    fetchOrders()
  }, [isAuthenticated, showError])

  // Redirect if not authenticated
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return (
    <>
      <Helmet>
        <title>My Account - BuyPoint</title>
        <meta name="description" content="Manage your account settings" />
      </Helmet>
      <main className="flex-1 bg-muted/30">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-8">My Account</h1>

          <Tabs defaultValue="profile" className="space-y-6">
            <TabsList className="w-full justify-start border-b rounded-none h-auto p-0 bg-transparent">
              <TabsTrigger
                value="profile"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent gap-2"
              >
                <User className="h-4 w-4" />
                Profile
              </TabsTrigger>
              <TabsTrigger
                value="orders"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent gap-2"
              >
                <Package className="h-4 w-4" />
                Orders
              </TabsTrigger>
              <TabsTrigger
                value="addresses"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent gap-2"
              >
                <MapPin className="h-4 w-4" />
                Addresses
              </TabsTrigger>
              <TabsTrigger
                value="settings"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent gap-2"
              >
                <Settings className="h-4 w-4" />
                Settings
              </TabsTrigger>
            </TabsList>

            {/* Profile Tab */}
            <TabsContent value="profile">
              <Card>
                <CardHeader>
                  <CardTitle>Profile Information</CardTitle>
                  <CardDescription>Update your personal details and profile picture</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Avatar */}
                  <div className="flex items-center gap-6">
                    <div className="relative">
                      <div className="h-24 w-24 rounded-full bg-muted flex items-center justify-center text-3xl font-bold">
                        {user.avatar ? (
                          <ImageWithLoader
                            src={user.avatar || "/placeholder.svg"}
                            alt={user.name || user.email}
                            fill
                            className="rounded-full object-cover"
                          />
                        ) : (
                          (user.name || user.email || "U").charAt(0).toUpperCase()
                        )}
                      </div>
                      <button className="absolute bottom-0 right-0 h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                        <Camera className="h-4 w-4" />
                      </button>
                    </div>
                    <div>
                      <h3 className="font-medium">{user.name || user.email || "User"}</h3>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                    </div>
                  </div>

                  <Separator />

                  {/* Form */}
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input id="name" value={user.name} onChange={(e) => setUser({ ...user, name: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={user.email}
                        onChange={(e) => setUser({ ...user, email: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone</Label>
                      <Input
                        id="phone"
                        value={user.phone}
                        onChange={(e) => setUser({ ...user, phone: e.target.value })}
                      />
                    </div>
                  </div>

                  <Button>Save Changes</Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Orders Tab */}
            <TabsContent value="orders">
              <Card>
                <CardHeader>
                  <CardTitle>Order History</CardTitle>
                  <CardDescription>View and track your orders</CardDescription>
                </CardHeader>
                <CardContent>
                  {ordersLoading ? (
                    <div className="text-center py-12">
                      <Loader2 className="h-8 w-8 mx-auto animate-spin text-primary mb-4" />
                      <p className="text-sm text-muted-foreground">Loading orders...</p>
                    </div>
                  ) : orders.length > 0 ? (
                    <div className="space-y-4">
                      {orders.map((order) => {
                        const status = statusConfig[order.status?.toLowerCase()] || statusConfig.pending
                        const StatusIcon = status.icon
                        const orderDate = order.createdAt ? new Date(order.createdAt).toLocaleDateString() : "N/A"
                        const orderItems = order.Items || order.items || []
                        return (
                          <div key={order.id || order.Id} className="border rounded-lg p-4">
                            <div className="flex items-start justify-between gap-4 mb-4">
                              <div>
                                <div className="flex items-center gap-3">
                                  <h4 className="font-medium">{order.orderNumber || order.OrderNumber || order.id || order.Id || "N/A"}</h4>
                                  <Badge className={status.color}>
                                    <StatusIcon className="h-3 w-3 mr-1" />
                                    {status.label}
                                  </Badge>
                                </div>
                                <p className="text-sm text-muted-foreground mt-1">Ordered on {orderDate}</p>
                              </div>
                              <Button variant="outline" size="sm" className="bg-transparent gap-1" asChild>
                                <Link to={`/track-order/${order.id || order.Id}`}>
                                  <Eye className="h-4 w-4" />
                                  Track Order
                                </Link>
                              </Button>
                            </div>

                            <div className="flex items-center gap-4">
                              <div className="flex -space-x-2">
                                {orderItems.slice(0, 3).map((item, i) => {
                                  const product = item.product || item.Product || {}
                                  return (
                                    <div
                                      key={i}
                                      className="relative h-12 w-12 rounded-lg border-2 border-background overflow-hidden bg-muted"
                                    >
                                      <ImageWithLoader
                                        src={product.imageUrl || product.ImageUrl || product.image || "/placeholder.svg"}
                                        alt={product.name || product.Name || "Product"}
                                        fill
                                        className="object-cover"
                                      />
                                    </div>
                                  )
                                })}
                                {orderItems.length > 3 && (
                                  <div className="h-12 w-12 rounded-lg border-2 border-background bg-muted flex items-center justify-center text-sm font-medium">
                                    +{orderItems.length - 3}
                                  </div>
                                )}
                              </div>
                              <div className="flex-1">
                                <p className="text-sm text-muted-foreground">
                                  {orderItems.length} item{orderItems.length !== 1 ? "s" : ""}
                                </p>
                              </div>
                              <p className="font-bold">${(order.Total || order.total || 0).toFixed(2)}</p>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <h3 className="font-medium mb-2">No orders yet</h3>
                      <p className="text-sm text-muted-foreground mb-4">Start shopping to see your orders here</p>
                      <Button asChild>
                        <Link to="/products">Browse Products</Link>
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Addresses Tab */}
            <TabsContent value="addresses">
              <Card>
                <CardHeader className="flex-row items-center justify-between">
                  <div>
                    <CardTitle>Saved Addresses</CardTitle>
                    <CardDescription>Manage your delivery addresses</CardDescription>
                  </div>
                  <Button>Add New Address</Button>
                </CardHeader>
                <CardContent>
                  {addresses.length > 0 ? (
                    <div className="grid gap-4 md:grid-cols-2">
                      {addresses.map((address) => (
                        <div
                          key={address.id}
                          className={`border rounded-lg p-4 relative ${address.isDefault ? "border-primary" : ""}`}
                        >
                          {address.isDefault && (
                            <Badge className="absolute top-3 right-3" variant="secondary">
                              Default
                            </Badge>
                          )}
                          <h4 className="font-medium mb-2">{address.label}</h4>
                          <p className="text-sm text-muted-foreground">
                            {address.name || user.name || ""}
                            <br />
                            {address.address || "No address set"}
                            <br />
                            {address.city && address.state ? `${address.city}, ${address.state} ${address.postalCode || ""}` : ""}
                            <br />
                            {address.country || ""}
                          </p>
                          <div className="flex gap-2 mt-4">
                            <Button variant="outline" size="sm" className="bg-transparent">
                              Edit
                            </Button>
                            {!address.isDefault && (
                              <Button variant="ghost" size="sm">
                                Delete
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <MapPin className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <h3 className="font-medium mb-2">No addresses saved</h3>
                      <p className="text-sm text-muted-foreground mb-4">Add an address for faster checkout</p>
                      <Button>Add Address</Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Settings Tab */}
            <TabsContent value="settings">
              <div className="space-y-6">
                {/* Password */}
                <Card>
                  <CardHeader>
                    <CardTitle>Change Password</CardTitle>
                    <CardDescription>Update your password to keep your account secure</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="currentPassword">Current Password</Label>
                      <Input id="currentPassword" type="password" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="newPassword">New Password</Label>
                      <Input id="newPassword" type="password" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirm New Password</Label>
                      <Input id="confirmPassword" type="password" />
                    </div>
                    <Button>Update Password</Button>
                  </CardContent>
                </Card>

                {/* Notifications */}
                <Card>
                  <CardHeader>
                    <CardTitle>Notification Preferences</CardTitle>
                    <CardDescription>Choose what notifications you want to receive</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Email notifications</p>
                        <p className="text-sm text-muted-foreground">Receive order updates via email</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Marketing emails</p>
                        <p className="text-sm text-muted-foreground">Receive promotions and deals</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">SMS notifications</p>
                        <p className="text-sm text-muted-foreground">Receive shipping updates via SMS</p>
                      </div>
                      <Switch />
                    </div>
                  </CardContent>
                </Card>

                {/* Quick Links */}
                <Card>
                  <CardHeader>
                    <CardTitle>Quick Links</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Link
                      to="/refund/claim"
                      className="flex items-center justify-between p-3 rounded-lg hover:bg-muted transition-colors"
                    >
                      <span>Request a Refund</span>
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </Link>
                    <Link
                      to="/refund/my-refunds"
                      className="flex items-center justify-between p-3 rounded-lg hover:bg-muted transition-colors"
                    >
                      <span>My Refunds</span>
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </Link>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </>
  )
}

