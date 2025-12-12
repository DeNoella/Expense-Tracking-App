import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Helmet } from "react-helmet-async"
import { ArrowLeft, MapPin, Banknote, Truck, Edit2, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Separator } from "@/components/ui/separator"
import { ImageWithLoader } from "@/components/ui/image-loader"
import { ButtonSpinner } from "@/components/ui/spinner"
import { useToast } from "@/components/ui/toast-notification"
import {
    products,
    mockDiscounts,
    mockPaymentMethods,
    getProductDiscount,
    calculateDiscountedPrice,
} from "@/lib/mock-data"

// Mock cart items
const cartItems = [
    { ...products[0], quantity: 1 },
    { ...products[4], quantity: 2 },
]

const shippingAddress = {
    name: "John Doe",
    phone: "+1 234 567 8900",
    address: "123 Main Street, Apt 4B",
    city: "New York",
    country: "USA",
    postalCode: "10001",
}

const deliveryOptions = [
    { id: "standard", name: "Standard Delivery", description: "5-7 business days", price: 5.99 },
    { id: "express", name: "Express Delivery", description: "2-3 business days", price: 12.99 },
    { id: "same-day", name: "Same Day Delivery", description: "Delivered today", price: 24.99 },
]

export default function CheckoutPage() {
    const navigate = useNavigate()
    const { success, error } = useToast()
    const [selectedDelivery, setSelectedDelivery] = useState("standard")
    const [orderNotes, setOrderNotes] = useState("")
    const [isPlacingOrder, setIsPlacingOrder] = useState(false)

    // Get active payment methods
    const activePaymentMethods = mockPaymentMethods.filter((pm) => pm.isActive)

    // Calculate totals with discounts
    const itemsWithDiscounts = cartItems.map((item) => {
        const discount = getProductDiscount(item, mockDiscounts)
        const { finalPrice, savings } = calculateDiscountedPrice(item.price, discount)
        return { ...item, discount, finalPrice, savings }
    })

    const subtotal = itemsWithDiscounts.reduce((sum, item) => sum + item.finalPrice * item.quantity, 0)
    const deliveryFee = deliveryOptions.find((d) => d.id === selectedDelivery)?.price || 0
    const tax = subtotal * 0.08 // 8% tax
    const total = subtotal + deliveryFee + tax

    const handlePlaceOrder = async () => {
        setIsPlacingOrder(true)

        try {
            // Simulate API call
            await new Promise((resolve) => setTimeout(resolve, 2000))

            success("Order placed successfully! Redirecting to order tracking...")

            // Redirect to order tracking after a short delay
            setTimeout(() => {
                navigate("/track-order/ORD-001")
            }, 1500)
        } catch (err) {
            error("Failed to place order. Please try again.")
            setIsPlacingOrder(false)
        }
    }

    return (
        <>
            <Helmet>
                <title>Checkout - BuyPoint</title>
                <meta name="description" content="Complete your purchase" />
            </Helmet>
            <div className="min-h-screen bg-background pb-24 md:pb-8">
                {/* Fixed Header */}
                <header className="sticky top-0 z-40 border-b bg-background">
                    <div className="flex h-14 items-center justify-between px-4">
                        <Link to="/cart" className="flex items-center gap-2">
                            <ArrowLeft className="h-5 w-5" />
                        </Link>
                        <h1 className="text-lg font-semibold">Checkout</h1>
                        <div className="w-5" />
                    </div>
                </header>

                {/* Content */}
                <div className="mx-auto max-w-lg space-y-4 p-4">
                    {/* Order Summary */}
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base">Order Summary</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {itemsWithDiscounts.map((item) => (
                                <div key={item.id} className="flex gap-3">
                                    <div className="relative h-16 w-16 overflow-hidden rounded-lg bg-muted">
                                        <ImageWithLoader src={item.image || "/placeholder.svg"} alt={item.name} fill className="object-cover" />
                                        {item.savings > 0 && (
                                            <Badge variant="destructive" className="absolute -right-1 -top-1 text-[10px] px-1">
                                                {item.discount?.type === "percentage" ? `${item.discount.value}%` : `$${item.discount?.value}`}
                                            </Badge>
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-medium line-clamp-1">{item.name}</p>
                                        <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                                    </div>
                                    <div className="text-right">
                                        {item.savings > 0 && (
                                            <p className="text-sm text-muted-foreground line-through">
                                                ${(item.price * item.quantity).toFixed(2)}
                                            </p>
                                        )}
                                        <p className="font-medium">${(item.finalPrice * item.quantity).toFixed(2)}</p>
                                        {item.savings > 0 && (
                                            <p className="text-xs text-primary">Save ${(item.savings * item.quantity).toFixed(2)}</p>
                                        )}
                                    </div>
                                </div>
                            ))}
                            <Separator />
                            <div className="space-y-1.5 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Subtotal</span>
                                    <span>${subtotal.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Shipping</span>
                                    <span>${deliveryFee.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Tax (8%)</span>
                                    <span>${tax.toFixed(2)}</span>
                                </div>
                                <Separator />
                                <div className="flex justify-between text-base font-semibold">
                                    <span>Total</span>
                                    <span>${total.toFixed(2)}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Shipping Address */}
                    <Card>
                        <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-base">Delivery Address</CardTitle>
                                <Button variant="ghost" size="sm" className="h-8 gap-1 text-xs">
                                    <Edit2 className="h-3 w-3" />
                                    Change
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <div className="flex items-start gap-2">
                                <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground" />
                                <div>
                                    <p className="font-medium">{shippingAddress.name}</p>
                                    <p className="text-sm text-muted-foreground">{shippingAddress.address}</p>
                                    <p className="text-sm text-muted-foreground">
                                        {shippingAddress.city}, {shippingAddress.postalCode}, {shippingAddress.country}
                                    </p>
                                    <p className="text-sm text-muted-foreground">{shippingAddress.phone}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Payment Method */}
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base">Payment Method</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {activePaymentMethods.length === 1 && activePaymentMethods[0].code === "cod" ? (
                                <div className="flex items-center gap-3 rounded-lg border-2 border-primary bg-primary/5 p-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                                        <Banknote className="h-5 w-5 text-primary" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <p className="font-medium">Cash on Delivery</p>
                                            <Badge variant="outline" className="text-xs">
                                                COD
                                            </Badge>
                                        </div>
                                        <p className="text-sm text-muted-foreground">Pay when you receive your order</p>
                                    </div>
                                    <CheckCircle2 className="h-5 w-5 text-primary" />
                                </div>
                            ) : (
                                <RadioGroup defaultValue={activePaymentMethods[0]?.code}>
                                    {activePaymentMethods.map((method) => (
                                        <div key={method.id} className="flex items-center gap-3 rounded-lg border p-3">
                                            <RadioGroupItem value={method.code} id={method.id} />
                                            <Label htmlFor={method.id} className="flex-1 cursor-pointer">
                                                <p className="font-medium">{method.name}</p>
                                                <p className="text-sm text-muted-foreground">{method.description}</p>
                                            </Label>
                                        </div>
                                    ))}
                                </RadioGroup>
                            )}
                        </CardContent>
                    </Card>

                    {/* Delivery Options */}
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base">Delivery Options</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <RadioGroup value={selectedDelivery} onValueChange={setSelectedDelivery}>
                                {deliveryOptions.map((option) => (
                                    <div
                                        key={option.id}
                                        className={`flex items-center gap-3 rounded-lg border p-3 transition-colors ${selectedDelivery === option.id ? "border-primary bg-primary/5" : ""
                                            }`}
                                    >
                                        <RadioGroupItem value={option.id} id={option.id} />
                                        <Truck className="h-4 w-4 text-muted-foreground" />
                                        <Label htmlFor={option.id} className="flex-1 cursor-pointer">
                                            <p className="font-medium">{option.name}</p>
                                            <p className="text-sm text-muted-foreground">{option.description}</p>
                                        </Label>
                                        <span className="font-medium">${option.price.toFixed(2)}</span>
                                    </div>
                                ))}
                            </RadioGroup>
                        </CardContent>
                    </Card>

                    {/* Order Notes */}
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base">Special Instructions</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Textarea
                                placeholder="Add any special delivery instructions or notes for your order..."
                                value={orderNotes}
                                onChange={(e) => setOrderNotes(e.target.value)}
                                className="min-h-[80px] resize-none"
                                disabled={isPlacingOrder}
                            />
                        </CardContent>
                    </Card>

                    {/* Place Order Button */}
                    <div className="sticky bottom-20 md:bottom-4 bg-background pt-2">
                        <Button className="w-full h-12 text-base gap-2" onClick={handlePlaceOrder} disabled={isPlacingOrder}>
                            {isPlacingOrder ? (
                                <>
                                    <ButtonSpinner />
                                    Placing Order...
                                </>
                            ) : (
                                <>
                                    <Banknote className="h-5 w-5" />
                                    Place Order (Cash on Delivery) - ${total.toFixed(2)}
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </div>
        </>
    )
}

