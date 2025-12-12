import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { Helmet } from "react-helmet-async"
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight, Tag, Percent, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { ImageWithLoader } from "@/components/ui/image-loader"
import { cartAPI } from "@/lib/api"
import { useToast } from "@/components/ui/toast-notification"
import { mockDiscounts, getProductDiscount, calculateDiscountedPrice } from "@/lib/mock-data"

export default function CartPage() {
    const { success, error: showError } = useToast()
    const [cart, setCart] = useState(null)
    const [cartItems, setCartItems] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const [updatingItems, setUpdatingItems] = useState(new Set())
    const [promoCode, setPromoCode] = useState("")
    const [promoApplied, setPromoApplied] = useState(false)

    useEffect(() => {
        fetchCart()
    }, [])

    const fetchCart = async () => {
        setIsLoading(true)
        try {
            const cartData = await cartAPI.get()
            setCart(cartData)
            setCartItems(cartData?.items || [])
        } catch (err) {
            console.error("Failed to fetch cart:", err)
            // If unauthorized, cart will be empty (user not logged in)
            setCart(null)
            setCartItems([])
        } finally {
            setIsLoading(false)
        }
    }

    const updateQuantity = async (productId, newQuantity) => {
        if (newQuantity < 1) return

        setUpdatingItems(prev => new Set(prev).add(productId))
        try {
            await cartAPI.updateItem(productId, newQuantity)
            await fetchCart() // Refresh cart
            success("Cart updated")
        } catch (err) {
            showError(err.message || "Failed to update cart item")
        } finally {
            setUpdatingItems(prev => {
                const next = new Set(prev)
                next.delete(productId)
                return next
            })
        }
    }

    const removeItem = async (productId) => {
        setUpdatingItems(prev => new Set(prev).add(productId))
        try {
            await cartAPI.removeItem(productId)
            await fetchCart() // Refresh cart
            success("Item removed from cart")
        } catch (err) {
            showError(err.message || "Failed to remove item")
        } finally {
            setUpdatingItems(prev => {
                const next = new Set(prev)
                next.delete(productId)
                return next
            })
        }
    }

    const itemsWithDiscounts = cartItems.map((item) => {
        const product = item.product || item // Backend returns item.product, fallback to item
        const discount = getProductDiscount(product, mockDiscounts)
        const price = product.price || item.price || 0
        const { finalPrice, savings } = calculateDiscountedPrice(price, discount)
        return {
            ...product,
            ...item,
            id: product.id || item.productId,
            name: product.name,
            image: product.image,
            price: price,
            quantity: item.quantity,
            discount,
            finalPrice,
            savings
        }
    })

    const subtotal = itemsWithDiscounts.reduce((sum, item) => sum + item.finalPrice * item.quantity, 0)
    const originalSubtotal = itemsWithDiscounts.reduce((sum, item) => sum + item.price * item.quantity, 0)
    const autoDiscountSavings = originalSubtotal - subtotal

    const shipping = subtotal > 50 ? 0 : 9.99
    const promoDiscount = promoApplied ? subtotal * 0.1 : 0
    const tax = (subtotal - promoDiscount) * 0.08
    const total = subtotal - promoDiscount + shipping + tax

    const applyPromoCode = () => {
        if (promoCode.toUpperCase() === "HOLIDAY50" || promoCode.toUpperCase() === "SAVE10") {
            setPromoApplied(true)
        }
    }

    if (isLoading) {
        return (
            <>
                <Helmet>
                    <title>Cart - BuyPoint</title>
                </Helmet>
                <main className="flex-1 flex items-center justify-center pb-20 md:pb-0">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </main>
            </>
        )
    }

    if (cartItems.length === 0) {
        return (
            <>
                <Helmet>
                    <title>Cart - BuyPoint</title>
                </Helmet>
                <main className="flex-1 flex items-center justify-center pb-20 md:pb-0">
                    <div className="text-center px-4">
                        <div className="flex justify-center mb-6">
                            <div className="h-24 w-24 rounded-full bg-muted flex items-center justify-center">
                                <ShoppingBag className="h-12 w-12 text-muted-foreground" />
                            </div>
                        </div>
                        <h1 className="text-2xl font-bold mb-2">Your cart is empty</h1>
                        <p className="text-muted-foreground mb-6">Looks like you haven't added any items to your cart yet.</p>
                        <Button asChild size="lg">
                            <Link to="/products">
                                Start Shopping
                                <ArrowRight className="ml-2 h-5 w-5" />
                            </Link>
                        </Button>
                    </div>
                </main>
            </>
        )
    }

    return (
        <>
            <Helmet>
                <title>Shopping Cart - BuyPoint</title>
            </Helmet>
            <main className="flex-1 pb-24 md:pb-0">
                <div className="container mx-auto px-4 py-8">
                    <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>

                    <div className="grid lg:grid-cols-3 gap-8">
                        {/* Cart Items */}
                        <div className="lg:col-span-2 space-y-4">
                            {autoDiscountSavings > 0 && (
                                <div className="flex items-center gap-2 p-3 rounded-lg bg-primary/10 border border-primary/20">
                                    <Percent className="h-5 w-5 text-primary" />
                                    <span className="text-sm font-medium text-primary">
                                        You're saving ${autoDiscountSavings.toFixed(2)} with auto-applied discounts!
                                    </span>
                                </div>
                            )}

                            {itemsWithDiscounts.map((item) => (
                                <Card key={item.id}>
                                    <CardContent className="p-4">
                                        <div className="flex gap-4">
                                            {/* Product Image */}
                                            <Link to={`/products/${item.id}`} className="shrink-0">
                                                <div className="relative h-24 w-24 rounded-lg overflow-hidden bg-muted">
                                                    <ImageWithLoader src={item.image || "/placeholder.svg"} alt={item.name} fill className="object-cover" />
                                                    {item.savings > 0 && (
                                                        <Badge variant="destructive" className="absolute -right-1 -top-1 text-[10px] px-1.5">
                                                            {item.discount?.type === "percentage"
                                                                ? `${item.discount.value}% OFF`
                                                                : `-$${item.discount?.value}`}
                                                        </Badge>
                                                    )}
                                                </div>
                                            </Link>

                                            {/* Product Details */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-start justify-between gap-4">
                                                    <div>
                                                        <p className="text-sm text-muted-foreground">{item.brand}</p>
                                                        <Link to={`/products/${item.id}`}>
                                                            <h3 className="font-medium hover:text-primary transition-colors line-clamp-1">
                                                                {item.name}
                                                            </h3>
                                                        </Link>
                                                        {item.discount && (
                                                            <Badge variant="secondary" className="mt-1 text-xs">
                                                                <Tag className="h-3 w-3 mr-1" />
                                                                {item.discount.name}
                                                            </Badge>
                                                        )}
                                                        {item.stock < 10 && (
                                                            <p className="text-xs text-orange-600 mt-1">Only {item.stock} left in stock</p>
                                                        )}
                                                    </div>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="shrink-0 text-muted-foreground hover:text-destructive"
                                                        onClick={() => removeItem(item.id)}
                                                        disabled={updatingItems.has(item.id)}
                                                    >
                                                        {updatingItems.has(item.id) ? (
                                                            <Loader2 className="h-4 w-4 animate-spin" />
                                                        ) : (
                                                            <Trash2 className="h-4 w-4" />
                                                        )}
                                                        <span className="sr-only">Remove item</span>
                                                    </Button>
                                                </div>

                                                <div className="flex items-center justify-between mt-4">
                                                    {/* Quantity Controls */}
                                                    <div className="flex items-center border rounded-lg">
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8"
                                                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                            disabled={item.quantity <= 1 || updatingItems.has(item.id)}
                                                        >
                                                            {updatingItems.has(item.id) ? (
                                                                <Loader2 className="h-3 w-3 animate-spin" />
                                                            ) : (
                                                                <Minus className="h-3 w-3" />
                                                            )}
                                                        </Button>
                                                        <span className="w-10 text-center text-sm font-medium">{item.quantity}</span>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8"
                                                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                            disabled={(item.stock !== undefined && item.quantity >= item.stock) || updatingItems.has(item.id)}
                                                        >
                                                            {updatingItems.has(item.id) ? (
                                                                <Loader2 className="h-3 w-3 animate-spin" />
                                                            ) : (
                                                                <Plus className="h-3 w-3" />
                                                            )}
                                                        </Button>
                                                    </div>

                                                    <div className="text-right">
                                                        {item.savings > 0 && (
                                                            <p className="text-sm text-muted-foreground line-through">
                                                                ${(item.price * item.quantity).toFixed(2)}
                                                            </p>
                                                        )}
                                                        <p className="font-bold">${(item.finalPrice * item.quantity).toFixed(2)}</p>
                                                        {item.savings > 0 && (
                                                            <p className="text-xs text-primary">Save ${(item.savings * item.quantity).toFixed(2)}</p>
                                                        )}
                                                        {item.quantity > 1 && item.savings === 0 && (
                                                            <p className="text-xs text-muted-foreground">${item.price.toFixed(2)} each</p>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}

                            {/* Continue Shopping */}
                            <div className="pt-4">
                                <Button variant="outline" asChild className="bg-transparent">
                                    <Link to="/products">Continue Shopping</Link>
                                </Button>
                            </div>
                        </div>

                        {/* Order Summary */}
                        <div className="lg:col-span-1">
                            <div className="sticky top-24">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Order Summary</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        {/* Promo Code */}
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">Promo Code</label>
                                            <div className="flex gap-2">
                                                <div className="relative flex-1">
                                                    <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                                    <Input
                                                        placeholder="Enter code"
                                                        value={promoCode}
                                                        onChange={(e) => setPromoCode(e.target.value)}
                                                        className="pl-9"
                                                        disabled={promoApplied}
                                                    />
                                                </div>
                                                <Button variant="secondary" onClick={applyPromoCode} disabled={promoApplied || !promoCode}>
                                                    Apply
                                                </Button>
                                            </div>
                                            {promoApplied && <p className="text-xs text-green-600">Promo code applied! 10% off</p>}
                                            <p className="text-xs text-muted-foreground">Try: HOLIDAY50 or SAVE10</p>
                                        </div>

                                        <Separator />

                                        {/* Totals */}
                                        <div className="space-y-2 text-sm">
                                            {autoDiscountSavings > 0 && (
                                                <div className="flex justify-between text-muted-foreground">
                                                    <span>Original Subtotal</span>
                                                    <span className="line-through">${originalSubtotal.toFixed(2)}</span>
                                                </div>
                                            )}
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">Subtotal ({cartItems.length} items)</span>
                                                <span>${subtotal.toFixed(2)}</span>
                                            </div>
                                            {autoDiscountSavings > 0 && (
                                                <div className="flex justify-between text-primary">
                                                    <span>Auto Discounts</span>
                                                    <span>-${autoDiscountSavings.toFixed(2)}</span>
                                                </div>
                                            )}
                                            {promoApplied && (
                                                <div className="flex justify-between text-green-600">
                                                    <span>Promo Code (10%)</span>
                                                    <span>-${promoDiscount.toFixed(2)}</span>
                                                </div>
                                            )}
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">Shipping</span>
                                                <span>{shipping === 0 ? "Free" : `$${shipping.toFixed(2)}`}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">Tax</span>
                                                <span>${tax.toFixed(2)}</span>
                                            </div>
                                        </div>

                                        <Separator />

                                        <div className="flex justify-between text-lg font-bold">
                                            <span>Total</span>
                                            <span>${total.toFixed(2)}</span>
                                        </div>

                                        {shipping === 0 && (
                                            <p className="text-xs text-green-600 text-center">You qualify for free shipping!</p>
                                        )}

                                        <Button className="w-full" size="lg" asChild>
                                            <Link to="/checkout">
                                                Proceed to Checkout
                                                <ArrowRight className="ml-2 h-5 w-5" />
                                            </Link>
                                        </Button>

                                        {/* Estimated Delivery */}
                                        <div className="text-center text-sm text-muted-foreground">
                                            <p>Estimated delivery: Dec 15-18</p>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </>
    )
}

