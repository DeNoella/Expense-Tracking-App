import { useState } from "react"
import { Link, useParams, useNavigate } from "react-router-dom"
import { Helmet } from "react-helmet-async"
import { ChevronRight, Star, Minus, Plus, ShoppingCart, Heart, Share2, Truck, Shield, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { ProductCard } from "@/components/product-card"
import { ImageWithLoader } from "@/components/ui/image-loader"
import { products } from "@/lib/mock-data"

const mockReviews = [
    {
        id: "1",
        userName: "Alex Johnson",
        rating: 5,
        date: "2024-12-01",
        comment: "Excellent product! The quality exceeded my expectations. Highly recommended.",
        helpful: 24,
    },
    {
        id: "2",
        userName: "Sarah Miller",
        rating: 4,
        date: "2024-11-28",
        comment: "Great value for money. Delivery was fast and packaging was secure.",
        helpful: 18,
    },
    {
        id: "3",
        userName: "Mike Chen",
        rating: 5,
        date: "2024-11-25",
        comment: "Been using this for a month now and it works perfectly. Would buy again!",
        helpful: 12,
    },
]

export default function ProductDetailPage() {
    const { id } = useParams()
    const navigate = useNavigate()
    const product = products.find((p) => p.id === id)
    const [quantity, setQuantity] = useState(1)
    const [selectedImage, setSelectedImage] = useState(0)

    if (!product) {
        return (
            <>
                <Helmet>
                    <title>Product Not Found - BuyPoint</title>
                </Helmet>
                <main className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                        <h1 className="text-2xl font-bold mb-4">Product Not Found</h1>
                        <Button asChild>
                            <Link to="/products">Back to Products</Link>
                        </Button>
                    </div>
                </main>
            </>
        )
    }

    const relatedProducts = products.filter((p) => p.category === product.category && p.id !== product.id).slice(0, 4)

    // Calculate discount from originalPrice and price
    const productPrice = product.price || product.Price || 0
    const productOriginalPrice = product.originalPrice || product.OriginalPrice || null
    const discount = productOriginalPrice && productOriginalPrice > productPrice
        ? Math.round(((productOriginalPrice - productPrice) / productOriginalPrice) * 100)
        : 0

    // Mock multiple images
    const images = [
        product.image,
        product.image.replace("query=", "query=side view "),
        product.image.replace("query=", "query=detail "),
        product.image.replace("query=", "query=packaging "),
    ]

    return (
        <>
            <Helmet>
                <title>{product.name} - BuyPoint</title>
                <meta name="description" content={product.description} />
            </Helmet>
            <main className="flex-1">
                <div className="container mx-auto px-4 py-8">
                    {/* Breadcrumb */}
                    <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
                        <Link to="/" className="hover:text-primary transition-colors">
                            Home
                        </Link>
                        <ChevronRight className="h-4 w-4" />
                        <Link to="/products" className="hover:text-primary transition-colors">
                            Products
                        </Link>
                        <ChevronRight className="h-4 w-4" />
                        <Link
                            to={`/products?category=${product.category}`}
                            className="hover:text-primary transition-colors capitalize"
                        >
                            {product.category}
                        </Link>
                        <ChevronRight className="h-4 w-4" />
                        <span className="text-foreground truncate max-w-[200px]">{product.name}</span>
                    </nav>

                    {/* Product Details */}
                    <div className="grid lg:grid-cols-2 gap-12 mb-16">
                        {/* Images */}
                        <div className="space-y-4">
                            <div className="relative aspect-square rounded-xl overflow-hidden bg-muted">
                                <ImageWithLoader
                                    src={images[selectedImage] || "/placeholder.svg"}
                                    alt={product.name}
                                    fill
                                    className="object-cover"
                                />
                                {discount > 0 && (
                                    <Badge className="absolute top-4 left-4 bg-destructive text-destructive-foreground">
                                        -{discount}%
                                    </Badge>
                                )}
                            </div>
                            <div className="grid grid-cols-4 gap-3">
                                {images.map((img, index) => (
                                    <button
                                        key={index}
                                        onClick={() => setSelectedImage(index)}
                                        className={`relative aspect-square rounded-lg overflow-hidden bg-muted border-2 transition-colors ${selectedImage === index ? "border-primary" : "border-transparent"
                                            }`}
                                    >
                                        <ImageWithLoader
                                            src={img || "/placeholder.svg"}
                                            alt={`${product.name} view ${index + 1}`}
                                            fill
                                            className="object-cover"
                                        />
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Info */}
                        <div className="space-y-6">
                            <div>
                                <p className="text-sm text-muted-foreground mb-1">{product.brand}</p>
                                <h1 className="text-3xl font-bold">{product.name}</h1>
                            </div>

                            {/* Rating */}
                            <div className="flex items-center gap-3">
                                <div className="flex items-center">
                                    {[...Array(5)].map((_, i) => (
                                        <Star
                                            key={i}
                                            className={`h-5 w-5 ${i < Math.floor(product.rating || product.Rating || 0) ? "text-warning fill-warning" : "text-muted-foreground"
                                                }`}
                                        />
                                    ))}
                                </div>
                                <span className="text-sm text-muted-foreground">
                                    {product.rating || product.Rating || 0} ({product.reviewCount || product.ReviewCount || 0} reviews)
                                </span>
                            </div>

                            {/* Price */}
                            <div className="flex items-baseline gap-3">
                                <span className="text-3xl font-bold">${productPrice.toFixed(2)}</span>
                                {productOriginalPrice && productOriginalPrice > productPrice && (
                                    <>
                                        <span className="text-xl text-muted-foreground line-through">
                                            ${productOriginalPrice.toFixed(2)}
                                        </span>
                                        {discount > 0 && (
                                            <Badge variant="secondary" className="text-success">
                                                Save {discount}%
                                            </Badge>
                                        )}
                                    </>
                                )}
                            </div>

                            <Separator />

                            {/* Description */}
                            <p className="text-muted-foreground leading-relaxed">{product.description}</p>

                            {/* Stock Status */}
                            <div className="flex items-center gap-2">
                                {(() => {
                                    const stock = product.stock || product.Stock || product.stockQty || product.StockQty || 0
                                    return stock > 0 ? (
                                        <>
                                            <div className="h-2 w-2 rounded-full bg-success" />
                                            <span className="text-sm font-medium text-success">In Stock ({stock} available)</span>
                                        </>
                                    ) : (
                                        <>
                                            <div className="h-2 w-2 rounded-full bg-destructive" />
                                            <span className="text-sm font-medium text-destructive">Out of Stock</span>
                                        </>
                                    )
                                })()}
                            </div>

                            {/* Quantity & Add to Cart */}
                            <div className="flex items-center gap-4">
                                <div className="flex items-center border rounded-lg">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                        disabled={quantity <= 1}
                                    >
                                        <Minus className="h-4 w-4" />
                                    </Button>
                                    <span className="w-12 text-center font-medium">{quantity}</span>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => setQuantity(Math.min((product.stock || product.Stock || product.stockQty || product.StockQty || 0), quantity + 1))}
                                        disabled={quantity >= (product.stock || product.Stock || product.stockQty || product.StockQty || 0)}
                                    >
                                        <Plus className="h-4 w-4" />
                                    </Button>
                                </div>
                                <Button className="flex-1 gap-2" size="lg" disabled={(product.stock || product.Stock || product.stockQty || product.StockQty || 0) === 0}>
                                    <ShoppingCart className="h-5 w-5" />
                                    Add to Cart
                                </Button>
                                <Button variant="outline" size="icon" className="h-12 w-12 bg-transparent">
                                    <Heart className="h-5 w-5" />
                                </Button>
                                <Button variant="outline" size="icon" className="h-12 w-12 bg-transparent">
                                    <Share2 className="h-5 w-5" />
                                </Button>
                            </div>

                            <Button variant="secondary" className="w-full" size="lg" disabled={(product.stock || product.Stock || product.stockQty || product.StockQty || 0) === 0}>
                                Buy Now
                            </Button>

                            {/* Features */}
                            <div className="grid grid-cols-3 gap-4 pt-4">
                                <div className="flex flex-col items-center text-center p-3 rounded-lg bg-muted/50">
                                    <Truck className="h-5 w-5 text-primary mb-2" />
                                    <span className="text-xs font-medium">Free Shipping</span>
                                </div>
                                <div className="flex flex-col items-center text-center p-3 rounded-lg bg-muted/50">
                                    <Shield className="h-5 w-5 text-primary mb-2" />
                                    <span className="text-xs font-medium">Secure Payment</span>
                                </div>
                                <div className="flex flex-col items-center text-center p-3 rounded-lg bg-muted/50">
                                    <RefreshCw className="h-5 w-5 text-primary mb-2" />
                                    <span className="text-xs font-medium">30-Day Returns</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Tabs */}
                    <Tabs defaultValue="description" className="mb-16">
                        <TabsList className="w-full justify-start border-b rounded-none h-auto p-0 bg-transparent">
                            <TabsTrigger
                                value="description"
                                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
                            >
                                Description
                            </TabsTrigger>
                            <TabsTrigger
                                value="specifications"
                                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
                            >
                                Specifications
                            </TabsTrigger>
                            <TabsTrigger
                                value="reviews"
                                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
                            >
                                Reviews ({product.reviewCount || product.ReviewCount || 0})
                            </TabsTrigger>
                            <TabsTrigger
                                value="shipping"
                                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
                            >
                                Shipping
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="description" className="pt-6">
                            <div className="prose max-w-none">
                                <p className="text-muted-foreground leading-relaxed">{product.description}</p>
                                <p className="text-muted-foreground leading-relaxed mt-4">
                                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et
                                    dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut
                                    aliquip ex ea commodo consequat.
                                </p>
                            </div>
                        </TabsContent>

                        <TabsContent value="specifications" className="pt-6">
                            <div className="grid gap-4 max-w-lg">
                                <div className="flex justify-between py-2 border-b">
                                    <span className="text-muted-foreground">Brand</span>
                                    <span className="font-medium">{product.brand}</span>
                                </div>
                                <div className="flex justify-between py-2 border-b">
                                    <span className="text-muted-foreground">Category</span>
                                    <span className="font-medium capitalize">{product.category}</span>
                                </div>
                                <div className="flex justify-between py-2 border-b">
                                    <span className="text-muted-foreground">SKU</span>
                                    <span className="font-medium">BP-{product.id.padStart(6, "0")}</span>
                                </div>
                                <div className="flex justify-between py-2 border-b">
                                    <span className="text-muted-foreground">Weight</span>
                                    <span className="font-medium">0.5 kg</span>
                                </div>
                                <div className="flex justify-between py-2 border-b">
                                    <span className="text-muted-foreground">Dimensions</span>
                                    <span className="font-medium">20 × 15 × 10 cm</span>
                                </div>
                            </div>
                        </TabsContent>

                        <TabsContent value="reviews" className="pt-6">
                            <div className="space-y-6">
                                {mockReviews.map((review) => (
                                    <div key={review.id} className="border-b pb-6 last:border-0">
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center font-medium">
                                                    {review.userName.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="font-medium">{review.userName}</p>
                                                    <p className="text-sm text-muted-foreground">{review.date}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center">
                                                {[...Array(5)].map((_, i) => (
                                                    <Star
                                                        key={i}
                                                        className={`h-4 w-4 ${i < review.rating ? "text-warning fill-warning" : "text-muted-foreground"
                                                            }`}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                        <p className="text-muted-foreground">{review.comment}</p>
                                        <Button variant="ghost" size="sm" className="mt-2">
                                            Helpful ({review.helpful})
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        </TabsContent>

                        <TabsContent value="shipping" className="pt-6">
                            <div className="space-y-4 max-w-2xl">
                                <div className="flex items-start gap-4">
                                    <Truck className="h-5 w-5 text-primary mt-0.5" />
                                    <div>
                                        <h4 className="font-medium">Free Standard Shipping</h4>
                                        <p className="text-sm text-muted-foreground">
                                            Free shipping on orders over $50. Delivery within 5-7 business days.
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4">
                                    <RefreshCw className="h-5 w-5 text-primary mt-0.5" />
                                    <div>
                                        <h4 className="font-medium">Easy Returns</h4>
                                        <p className="text-sm text-muted-foreground">
                                            30-day return policy. Items must be unused and in original packaging.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </TabsContent>
                    </Tabs>

                    {/* Related Products */}
                    {relatedProducts.length > 0 && (
                        <section>
                            <h2 className="text-2xl font-bold mb-6">Related Products</h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                                {relatedProducts.map((p) => (
                                    <ProductCard key={p.id} product={p} />
                                ))}
                            </div>
                        </section>
                    )}
                </div>
            </main>
        </>
    )
}

