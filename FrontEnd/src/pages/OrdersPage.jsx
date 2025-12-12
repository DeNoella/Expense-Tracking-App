import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { Helmet } from "react-helmet-async"
import { ArrowLeft, Package, Truck, CheckCircle, Clock, XCircle, Eye, Search, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ImageWithLoader } from "@/components/ui/image-loader"
import { SkeletonOrderCard } from "@/components/ui/skeleton-loader"
import { ordersAPI } from "@/lib/api"
import { useToast } from "@/components/ui/toast-notification"

const statusConfig = {
    Pending: { label: "Pending", color: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20", icon: Clock },
    Processing: { label: "Processing", color: "bg-blue-500/10 text-blue-600 border-blue-500/20", icon: Package },
    Shipped: { label: "Shipped", color: "bg-primary/10 text-primary border-primary/20", icon: Truck },
    InTransit: { label: "In Transit", color: "bg-primary/10 text-primary border-primary/20", icon: Truck },
    Delivered: { label: "Delivered", color: "bg-green-500/10 text-green-600 border-green-500/20", icon: CheckCircle },
    Cancelled: { label: "Cancelled", color: "bg-red-500/10 text-red-600 border-red-500/20", icon: XCircle },
}

function OrdersSkeletonList() {
    return (
        <div className="p-4 space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
                <SkeletonOrderCard key={i} />
            ))}
        </div>
    )
}

export default function OrdersPage() {
    const { error: showError } = useToast()
    const [searchQuery, setSearchQuery] = useState("")
    const [activeTab, setActiveTab] = useState("all")
    const [isLoading, setIsLoading] = useState(true)
    const [orders, setOrders] = useState([])

    useEffect(() => {
        const fetchOrders = async () => {
            setIsLoading(true)
            try {
                const ordersData = await ordersAPI.getMyOrders()
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
        const matchesSearch =
            (order.orderNumber || order.id || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
            (order.items || []).some((item) => {
                const product = item.product || item
                return (product.name || "").toLowerCase().includes(searchQuery.toLowerCase())
            })

        if (activeTab === "all") return matchesSearch
        return matchesSearch && order.status === activeTab
    })

    return (
        <>
            <Helmet>
                <title>My Orders - BuyPoint</title>
                <meta name="description" content="View and track your orders" />
            </Helmet>
            <div className="min-h-screen bg-background pb-20">
                {/* Header */}
                <header className="sticky top-0 z-40 border-b bg-background">
                    <div className="flex h-14 items-center justify-between px-4">
                        <Link to="/profile" className="flex items-center gap-2">
                            <ArrowLeft className="h-5 w-5" />
                        </Link>
                        <h1 className="text-lg font-semibold">My Orders</h1>
                        <div className="w-5" />
                    </div>
                </header>

                {/* Search */}
                <div className="p-4 border-b">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search orders..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                </div>

                {/* Tabs */}
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <div className="border-b px-4">
                        <TabsList className="w-full justify-start h-auto p-0 bg-transparent gap-4 overflow-x-auto">
                            <TabsTrigger
                                value="all"
                                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-1 py-3"
                            >
                                All
                            </TabsTrigger>
                            <TabsTrigger
                                value="Pending"
                                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-1 py-3"
                            >
                                Pending
                            </TabsTrigger>
                            <TabsTrigger
                                value="Processing"
                                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-1 py-3"
                            >
                                Processing
                            </TabsTrigger>
                            <TabsTrigger
                                value="Shipped"
                                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-1 py-3"
                            >
                                Shipped
                            </TabsTrigger>
                            <TabsTrigger
                                value="Delivered"
                                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-1 py-3"
                            >
                                Delivered
                            </TabsTrigger>
                        </TabsList>
                    </div>

                    <TabsContent value={activeTab} className="mt-0">
                        {isLoading ? (
                            <OrdersSkeletonList />
                        ) : (
                            <div className="p-4 space-y-4">
                                {filteredOrders.length > 0 ? (
                                    filteredOrders.map((order) => {
                                        const status = statusConfig[order.status] || statusConfig.Pending
                                        const StatusIcon = status.icon
                                        const orderItems = order.items || []
                                        const firstItem = orderItems[0]
                                        const firstProduct = firstItem?.product || firstItem

                                        return (
                                            <Card key={order.id}>
                                                <CardContent className="p-4">
                                                    {/* Order Header */}
                                                    <div className="flex items-start justify-between mb-3">
                                                        <div>
                                                            <p className="font-medium">{order.orderNumber || order.id}</p>
                                                            <p className="text-xs text-muted-foreground">
                                                                {new Date(order.createdAt || order.orderDate).toLocaleDateString()}
                                                            </p>
                                                        </div>
                                                        <Badge variant="outline" className={status.color}>
                                                            <StatusIcon className="h-3 w-3 mr-1" />
                                                            {status.label}
                                                        </Badge>
                                                    </div>

                                                    {/* Order Items */}
                                                    {orderItems.length > 0 && (
                                                        <div className="flex items-center gap-3 mb-3">
                                                            <div className="flex -space-x-2">
                                                                {orderItems.slice(0, 3).map((item, i) => {
                                                                    const product = item.product || item
                                                                    return (
                                                                        <div
                                                                            key={i}
                                                                            className="relative h-12 w-12 rounded-lg border-2 border-background overflow-hidden bg-muted"
                                                                        >
                                                                            <ImageWithLoader
                                                                                src={product.image || "/placeholder.svg"}
                                                                                alt={product.name || "Product"}
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
                                                            <div className="flex-1 min-w-0">
                                                                <p className="text-sm truncate">{firstProduct?.name || "Product"}</p>
                                                                {orderItems.length > 1 && (
                                                                    <p className="text-xs text-muted-foreground">
                                                                        and {orderItems.length - 1} more item{orderItems.length > 2 ? "s" : ""}
                                                                    </p>
                                                                )}
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* Order Footer */}
                                                    <div className="flex items-center justify-between pt-3 border-t">
                                                        <div>
                                                            <p className="text-xs text-muted-foreground">Total</p>
                                                            <p className="font-bold">${(order.total || 0).toFixed(2)}</p>
                                                        </div>
                                                        <Button size="sm" asChild>
                                                            <Link to={`/track-order/${order.id}`}>
                                                                <Eye className="h-4 w-4 mr-1" />
                                                                Track Order
                                                            </Link>
                                                        </Button>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        )
                                    })
                                ) : (
                                    <div className="text-center py-12">
                                        <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                                        <h3 className="font-medium mb-2">No orders found</h3>
                                        <p className="text-sm text-muted-foreground mb-4">
                                            {searchQuery ? "Try a different search term" : "Start shopping to see your orders here"}
                                        </p>
                                        <Button asChild>
                                            <Link to="/products">Browse Products</Link>
                                        </Button>
                                    </div>
                                )}
                            </div>
                        )}
                    </TabsContent>
                </Tabs>
            </div>
        </>
    )
}

