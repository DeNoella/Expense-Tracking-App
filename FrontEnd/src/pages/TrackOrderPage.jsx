import { useState, useEffect } from "react"
import { Link, useParams } from "react-router-dom"
import { Helmet } from "react-helmet-async"
import { ArrowLeft, Copy, Check, CheckCircle2, Circle, Loader2, MapPin, Phone, MessageSquare, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ImageWithLoader } from "@/components/ui/image-loader"
import { ButtonSpinner } from "@/components/ui/spinner"
import { Skeleton } from "@/components/ui/skeleton-loader"
import { useToast } from "@/components/ui/toast-notification"
import { mockOrderTracking, mockDiscounts, getProductDiscount, calculateDiscountedPrice } from "@/lib/mock-data"

function OrderTrackingSkeleton() {
  return (
    <div className="mx-auto max-w-lg space-y-4 p-4">
      {/* Order Info Skeleton */}
      <Card>
        <CardContent className="p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-6 w-32" />
            </div>
            <Skeleton className="h-6 w-20 rounded-full" />
          </div>
          <div className="flex items-center gap-4">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-4 w-20" />
          </div>
        </CardContent>
      </Card>

      {/* Progress Timeline Skeleton */}
      <Card>
        <CardContent className="p-4">
          <Skeleton className="h-5 w-32 mb-4" />
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex gap-3">
                <Skeleton className="h-5 w-5 rounded-full shrink-0" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Order Items Skeleton */}
      <Card>
        <CardContent className="p-4">
          <Skeleton className="h-5 w-28 mb-4" />
          <div className="space-y-3">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="flex gap-3">
                <Skeleton className="h-16 w-16 rounded-lg" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-16" />
                  <Skeleton className="h-4 w-20" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Shipping Info Skeleton */}
      <Card>
        <CardContent className="p-4 space-y-3">
          <Skeleton className="h-5 w-40" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons Skeleton */}
      <div className="space-y-2">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    </div>
  )
}

export default function TrackOrderPage() {
  const { id } = useParams()
  const { success, error, info } = useToast()
  const [copied, setCopied] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [order, setOrder] = useState(null)
  const [isContactingLoading, setIsContactingLoading] = useState(false)
  const [isCancellingLoading, setIsCancellingLoading] = useState(false)

  useEffect(() => {
    const fetchOrder = async () => {
      setIsLoading(true)
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500))
      setOrder(mockOrderTracking)
      setIsLoading(false)
    }
    fetchOrder()
  }, [id])

  const handleCopyOrderNumber = () => {
    if (!order) return
    navigator.clipboard.writeText(order.orderNumber)
    setCopied(true)
    info("Order number copied to clipboard")
    setTimeout(() => setCopied(false), 2000)
  }

  const handleContactSeller = async () => {
    setIsContactingLoading(true)
    await new Promise((resolve) => setTimeout(resolve, 1000))
    success("Message sent to seller. They will respond shortly.")
    setIsContactingLoading(false)
  }

  const handleCancelOrder = async () => {
    setIsCancellingLoading(true)
    await new Promise((resolve) => setTimeout(resolve, 1500))
    error("Order cancellation request submitted")
    setIsCancellingLoading(false)
  }

  const getStepIcon = (status) => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="h-5 w-5 text-primary" />
      case "active":
        return <Loader2 className="h-5 w-5 text-primary animate-spin" />
      default:
        return <Circle className="h-5 w-5 text-muted-foreground" />
    }
  }

  const getStatusBadgeVariant = (status) => {
    switch (status) {
      case "Delivered":
        return "default"
      case "In Transit":
      case "Out for Delivery":
        return "secondary"
      case "Processing":
      case "Shipped":
        return "outline"
      default:
        return "secondary"
    }
  }

  if (isLoading) {
    return (
      <>
        <Helmet>
          <title>Track Order - BuyPoint</title>
        </Helmet>
        <div className="min-h-screen bg-background pb-20">
          <header className="sticky top-0 z-40 border-b bg-background">
            <div className="flex h-14 items-center justify-between px-4">
              <Link to="/orders" className="flex items-center gap-2">
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <h1 className="text-lg font-semibold">Track Order</h1>
              <div className="w-5" />
            </div>
          </header>
          <OrderTrackingSkeleton />
        </div>
      </>
    )
  }

  if (!order) {
    return (
      <>
        <Helmet>
          <title>Order Not Found - BuyPoint</title>
        </Helmet>
        <div className="min-h-screen bg-background pb-20">
          <header className="sticky top-0 z-40 border-b bg-background">
            <div className="flex h-14 items-center justify-between px-4">
              <Link to="/orders" className="flex items-center gap-2">
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <h1 className="text-lg font-semibold">Track Order</h1>
              <div className="w-5" />
            </div>
          </header>
          <div className="flex flex-col items-center justify-center py-20">
            <p className="text-muted-foreground">Order not found</p>
            <Button asChild variant="link">
              <Link to="/orders">Back to Orders</Link>
            </Button>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <Helmet>
        <title>Track Order {order.orderNumber} - BuyPoint</title>
      </Helmet>
      <div className="min-h-screen bg-background pb-20">
        {/* Fixed Header */}
        <header className="sticky top-0 z-40 border-b bg-background">
          <div className="flex h-14 items-center justify-between px-4">
            <Link to="/orders" className="flex items-center gap-2">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <h1 className="text-lg font-semibold">Track Order</h1>
            <div className="w-5" />
          </div>
        </header>

        {/* Content */}
        <div className="mx-auto max-w-lg space-y-4 p-4">
          {/* Order Information */}
          <Card>
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Order Number</p>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold">{order.orderNumber}</span>
                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={handleCopyOrderNumber}>
                      {copied ? <Check className="h-3.5 w-3.5 text-primary" /> : <Copy className="h-3.5 w-3.5" />}
                    </Button>
                  </div>
                </div>
                <Badge variant={getStatusBadgeVariant(order.currentStatus)} className="text-sm">
                  {order.currentStatus}
                </Badge>
              </div>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span>Ordered: {new Date(order.orderDate).toLocaleDateString()}</span>
                <span>Total: ${order.total.toFixed(2)}</span>
              </div>
            </CardContent>
          </Card>

          {/* Progress Timeline */}
          <Card>
            <CardContent className="p-4">
              <h2 className="mb-4 font-semibold">Order Progress</h2>
              <div className="space-y-0">
                {order.steps.map((step, index) => (
                  <div key={step.id} className="flex gap-3">
                    {/* Timeline Line and Icon */}
                    <div className="flex flex-col items-center">
                      {getStepIcon(step.status)}
                      {index < order.steps.length - 1 && (
                        <div
                          className={`w-0.5 flex-1 my-1 min-h-[40px] ${
                            step.status === "completed" ? "bg-primary" : "bg-muted"
                          }`}
                        />
                      )}
                    </div>
                    {/* Step Content */}
                    <div className="flex-1 pb-4">
                      <div className="flex items-center justify-between">
                        <p className={`font-medium ${step.status === "pending" ? "text-muted-foreground" : ""}`}>
                          {step.name}
                        </p>
                        {step.status === "active" && (
                          <Badge variant="outline" className="text-xs">
                            In Progress
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{step.description}</p>
                      {step.timestamp && <p className="mt-1 text-xs text-muted-foreground">{step.timestamp}</p>}
                      {step.adminNote && <p className="mt-1 text-xs text-primary">{step.adminNote}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Order Items */}
          <Card>
            <CardContent className="p-4">
              <h2 className="mb-4 font-semibold">Order Details</h2>
              <div className="space-y-3">
                {order.items.map((item) => {
                  const discount = getProductDiscount(item, mockDiscounts)
                  const { finalPrice, savings } = calculateDiscountedPrice(item.price, discount)

                  return (
                    <div key={item.id} className="flex gap-3">
                      <div className="relative h-16 w-16 overflow-hidden rounded-lg bg-muted">
                        <ImageWithLoader src={item.image || "/placeholder.svg"} alt={item.name} fill className="object-cover" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium line-clamp-1">{item.name}</p>
                        <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                        <div className="flex items-center gap-2">
                          {savings > 0 && (
                            <span className="text-sm text-muted-foreground line-through">${item.price.toFixed(2)}</span>
                          )}
                          <span className="font-medium">${finalPrice.toFixed(2)}</span>
                          {savings > 0 && (
                            <Badge variant="destructive" className="text-xs">
                              {discount?.type === "percentage" ? `${discount.value}% OFF` : `$${discount?.value} OFF`}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {/* Shipping Information */}
          <Card>
            <CardContent className="p-4 space-y-3">
              <h2 className="font-semibold">Shipping Information</h2>
              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">{order.shippingAddress.name}</p>
                    <p className="text-sm text-muted-foreground">{order.shippingAddress.address}</p>
                    <p className="text-sm text-muted-foreground">
                      {order.shippingAddress.city}, {order.shippingAddress.postalCode}, {order.shippingAddress.country}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <p className="text-sm">{order.shippingAddress.phone}</p>
                </div>
                {order.shippingAddress.instructions && (
                  <div className="rounded-lg bg-muted p-2">
                    <p className="text-xs text-muted-foreground">Delivery Instructions:</p>
                    <p className="text-sm">{order.shippingAddress.instructions}</p>
                  </div>
                )}
              </div>
              <Separator />
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <p className="text-muted-foreground">Estimated Delivery</p>
                  <p className="font-medium">{new Date(order.estimatedDelivery).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Payment Method</p>
                  <p className="font-medium">Cash on Delivery</p>
                </div>
                {order.trackingNumber && (
                  <div className="col-span-2">
                    <p className="text-muted-foreground">Tracking Number</p>
                    <p className="font-medium">{order.trackingNumber}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="space-y-2">
            <Button className="w-full gap-2" onClick={handleContactSeller} disabled={isContactingLoading}>
              {isContactingLoading ? (
                <>
                  <ButtonSpinner />
                  Sending...
                </>
              ) : (
                <>
                  <MessageSquare className="h-4 w-4" />
                  Contact Seller
                </>
              )}
            </Button>
            <Button
              variant="outline"
              className="w-full gap-2 text-destructive hover:text-destructive bg-transparent"
              disabled={
                (order.currentStatus !== "Processing" && order.currentStatus !== "Order Placed") || isCancellingLoading
              }
              onClick={handleCancelOrder}
            >
              {isCancellingLoading ? (
                <>
                  <ButtonSpinner />
                  Cancelling...
                </>
              ) : (
                <>
                  <X className="h-4 w-4" />
                  Cancel Order
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </>
  )
}

