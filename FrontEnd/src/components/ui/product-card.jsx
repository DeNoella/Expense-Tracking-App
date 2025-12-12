import { useState } from "react"
import { Link } from "react-router-dom"
import { Star, ShoppingCart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { ImageWithLoader } from "@/components/ui/image-loader"
import { ButtonSpinner } from "@/components/ui/spinner"
import { useToast } from "@/components/ui/toast-notification"
import { cartAPI } from "@/lib/api"
import { getProductDiscount, calculateDiscountedPrice } from "@/lib/mock-data"

export function ProductCard({ product, discounts = [] }) {
  const [isAddingToCart, setIsAddingToCart] = useState(false)
  const { success, error } = useToast()

  const productPrice = product.price || product.Price || 0
  const productOriginalPrice = product.originalPrice || product.OriginalPrice || null
  const discount = getProductDiscount(product, discounts)
  const { finalPrice, savings } = calculateDiscountedPrice(productPrice, discount)

  // Use discount-calculated values or fallback to original price comparison
  const hasDiscount = savings > 0 || (productOriginalPrice && productOriginalPrice > productPrice)
  const displayOriginalPrice = savings > 0 ? productPrice : productOriginalPrice
  const displayFinalPrice = savings > 0 ? finalPrice : productPrice
  const displaySavings = savings > 0 ? savings : productOriginalPrice ? productOriginalPrice - productPrice : 0

  // Calculate discount percentage for badge
  const discountType = discount?.type || discount?.Type
  const discountValue = discount?.value || discount?.Value || 0
  const discountPercent =
    discountType === "percentage" || discountType === 0
      ? discountValue
      : displayOriginalPrice
        ? Math.round((displaySavings / displayOriginalPrice) * 100)
        : 0

  const handleAddToCart = async (e) => {
    e.preventDefault()
    e.stopPropagation()

    if ((product.stock || product.Stock || product.stockQty || product.StockQty || 0) === 0) return

    setIsAddingToCart(true)

    try {
      await cartAPI.addItem(product.id, 1)
      success(`${product.name} added to cart`)
    } catch (err) {
      const errorMessage = err.message || "Failed to add item to cart"
      error(errorMessage)
    } finally {
      setIsAddingToCart(false)
    }
  }

  return (
    <Card className="group overflow-hidden transition-all hover:shadow-lg">
      <Link to={`/products/${product.id}`}>
        <div className="relative aspect-square overflow-hidden bg-muted">
          <ImageWithLoader
            src={product.image || "/placeholder.svg"}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
          {hasDiscount && discountPercent > 0 && (
            <Badge className="absolute top-3 left-3 bg-destructive text-destructive-foreground z-20">
              {(discountType === "fixed" || discountType === 1) ? `$${discountValue} OFF` : `-${discountPercent}%`}
            </Badge>
          )}
          {(() => {
            const stock = product.stock || product.Stock || product.stockQty || product.StockQty || 0
            return (
              <>
                {stock < 10 && stock > 0 && (
                  <Badge variant="secondary" className="absolute top-3 right-3 z-20">
                    Low Stock
                  </Badge>
                )}
                {stock === 0 && (
                  <Badge variant="destructive" className="absolute top-3 right-3 z-20">
                    Out of Stock
                  </Badge>
                )}
              </>
            )
          })()}
        </div>
      </Link>
      <CardContent className="p-4 space-y-3">
        <div className="space-y-1">
          {(product.brand || product.Brand) && (
            <p className="text-xs text-muted-foreground">{product.brand || product.Brand}</p>
          )}
          <Link to={`/products/${product.id}`}>
            <h3 className="text-sm font-medium line-clamp-1 hover:text-primary transition-colors">{product.name || product.Name}</h3>
          </Link>
        </div>

        <div className="flex items-center gap-1">
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`h-3.5 w-3.5 ${
                  i < Math.floor(product.rating || product.Rating || 0) ? "text-warning fill-warning" : "text-muted-foreground"
                }`}
              />
            ))}
          </div>
          {(product.reviewCount || product.ReviewCount) !== undefined && (
            <span className="text-xs text-muted-foreground">({product.reviewCount || product.ReviewCount || 0})</span>
          )}
        </div>

        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold">${displayFinalPrice.toFixed(2)}</span>
            {hasDiscount && displayOriginalPrice && (
              <span className="text-sm text-muted-foreground line-through">${displayOriginalPrice.toFixed(2)}</span>
            )}
          </div>
          {hasDiscount && displaySavings > 0 && (
            <p className="text-xs text-primary font-medium">Save ${displaySavings.toFixed(2)}</p>
          )}
        </div>

        <Button
          className="w-full gap-2"
          disabled={(product.stock || product.Stock || product.stockQty || product.StockQty || 0) === 0 || isAddingToCart}
          size="sm"
          onClick={handleAddToCart}
        >
          {isAddingToCart ? (
            <>
              <ButtonSpinner />
              Adding...
            </>
          ) : (
            <>
              <ShoppingCart className="h-4 w-4" />
              Add to Cart
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  )
}

