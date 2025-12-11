import { useState, useMemo, useEffect } from "react"
import { useSearchParams } from "react-router-dom"
import { Helmet } from "react-helmet-async"
import { SlidersHorizontal, Grid3X3, List, X, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { ProductCard } from "@/components/product-card"
import { productsAPI, categoriesAPI, discountsAPI } from "@/lib/api"
import { useToast } from "@/components/ui/toast-notification"

export default function ProductsPage() {
  const [searchParams] = useSearchParams()
  const initialCategory = searchParams.get("category") || ""
  const { error: showError } = useToast()

  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [discounts, setDiscounts] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedCategories, setSelectedCategories] = useState(initialCategory ? [initialCategory] : [])
  const [priceRange, setPriceRange] = useState([0, 500])
  const [minRating, setMinRating] = useState(0)
  const [sortBy, setSortBy] = useState("featured")
  const [viewMode, setViewMode] = useState("grid")

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      try {
        const [productsData, categoriesData, discountsData] = await Promise.all([
          productsAPI.getAll({ categoryId: initialCategory || undefined }),
          categoriesAPI.getAll().catch(() => []), // Categories might not exist
          discountsAPI.getAll().catch(() => []), // Fetch discounts from backend
        ])
        
        setProducts(productsData || [])
        setCategories(categoriesData || [])
        setDiscounts(discountsData || [])
        
        // Set max price from products
        if (productsData && productsData.length > 0) {
          const maxPrice = Math.max(...productsData.map(p => p.price || p.Price || 0))
          setPriceRange([0, Math.max(500, Math.ceil(maxPrice / 100) * 100)])
        }
      } catch (err) {
        console.error("Failed to fetch products:", err)
        showError("Failed to load products. Please try again later.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [initialCategory, showError])

  const filteredProducts = useMemo(() => {
    let result = [...products]

    // Filter by category
    if (selectedCategories.length > 0) {
      result = result.filter((p) => selectedCategories.includes(p.categoryId || p.category))
    }

    // Filter by price
    result = result.filter((p) => (p.price || 0) >= priceRange[0] && (p.price || 0) <= priceRange[1])

    // Filter by rating
    if (minRating > 0) {
      result = result.filter((p) => (p.rating || 0) >= minRating)
    }

    // Sort
    switch (sortBy) {
      case "price-asc":
        result.sort((a, b) => (a.price || 0) - (b.price || 0))
        break
      case "price-desc":
        result.sort((a, b) => (b.price || 0) - (a.price || 0))
        break
      case "newest":
        result.sort((a, b) => {
          const aDate = new Date(a.createdAt || a.id)
          const bDate = new Date(b.createdAt || b.id)
          return bDate - aDate
        })
        break
      case "rating":
        result.sort((a, b) => (b.rating || 0) - (a.rating || 0))
        break
    }

    return result
  }, [products, selectedCategories, priceRange, minRating, sortBy])

  const toggleCategory = (categoryId) => {
    setSelectedCategories((prev) =>
      prev.includes(categoryId) ? prev.filter((c) => c !== categoryId) : [...prev, categoryId],
    )
  }

  const clearFilters = () => {
    setSelectedCategories([])
    setPriceRange([0, 500])
    setMinRating(0)
    setSortBy("featured")
  }

  const hasActiveFilters = selectedCategories.length > 0 || priceRange[0] > 0 || priceRange[1] < 500 || minRating > 0

  const FilterContent = () => (
    <div className="space-y-6">
      {/* Categories */}
      <div className="space-y-3">
        <h3 className="font-semibold">Categories</h3>
        <div className="space-y-2">
          {categories.map((category) => (
            <div key={category.id} className="flex items-center space-x-2">
              <Checkbox
                id={`category-${category.id}`}
                checked={selectedCategories.includes(category.id)}
                onCheckedChange={() => toggleCategory(category.id)}
              />
              <Label htmlFor={`category-${category.id}`} className="text-sm font-normal cursor-pointer flex-1">
                {category.name}
              </Label>
              <span className="text-xs text-muted-foreground">
                ({products.filter(p => (p.categoryId || p.category) === category.id).length})
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div className="space-y-3">
        <h3 className="font-semibold">Price Range</h3>
        <Slider value={priceRange} onValueChange={setPriceRange} max={priceRange[1] || 500} step={10} className="py-2" />
        <div className="flex items-center justify-between text-sm">
          <span>${priceRange[0]}</span>
          <span>${priceRange[1]}</span>
        </div>
      </div>

      {/* Rating */}
      <div className="space-y-3">
        <h3 className="font-semibold">Minimum Rating</h3>
        <div className="space-y-2">
          {[4, 3, 2, 1].map((rating) => (
            <div key={rating} className="flex items-center space-x-2">
              <Checkbox
                id={`rating-${rating}`}
                checked={minRating === rating}
                onCheckedChange={(checked) => setMinRating(checked ? rating : 0)}
              />
              <Label htmlFor={`rating-${rating}`} className="text-sm font-normal cursor-pointer">
                {rating}+ Stars
              </Label>
            </div>
          ))}
        </div>
      </div>

      {hasActiveFilters && (
        <Button variant="outline" onClick={clearFilters} className="w-full bg-transparent">
          Clear All Filters
        </Button>
      )}
    </div>
  )

  return (
    <>
      <Helmet>
        <title>Products - BuyPoint</title>
        <meta name="description" content="Browse our wide selection of products" />
      </Helmet>
      <main className="flex-1">
        <div className="container mx-auto px-4 py-8">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold">All Products</h1>
            <p className="text-muted-foreground mt-1">{filteredProducts.length} products found</p>
          </div>

          {/* Active Filters */}
          {hasActiveFilters && (
            <div className="flex flex-wrap gap-2 mb-6">
              {selectedCategories.map((catId) => {
                const category = categories.find((c) => c.id === catId)
                return (
                  <Badge key={catId} variant="secondary" className="gap-1">
                    {category?.name}
                    <button onClick={() => toggleCategory(catId)}>
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                )
              })}
              {(priceRange[0] > 0 || priceRange[1] < 500) && (
                <Badge variant="secondary" className="gap-1">
                  ${priceRange[0]} - ${priceRange[1]}
                  <button onClick={() => setPriceRange([0, 500])}>
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              {minRating > 0 && (
                <Badge variant="secondary" className="gap-1">
                  {minRating}+ Stars
                  <button onClick={() => setMinRating(0)}>
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
            </div>
          )}

          <div className="flex gap-8">
            {/* Desktop Sidebar */}
            <aside className="hidden lg:block w-64 shrink-0">
              <div className="sticky top-24">
                <FilterContent />
              </div>
            </aside>

            {/* Products Grid */}
            <div className="flex-1">
              {/* Toolbar */}
              <div className="flex items-center justify-between mb-6 gap-4">
                {/* Mobile Filter Button */}
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="outline" className="lg:hidden gap-2 bg-transparent">
                      <SlidersHorizontal className="h-4 w-4" />
                      Filters
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left">
                    <SheetHeader>
                      <SheetTitle>Filters</SheetTitle>
                    </SheetHeader>
                    <div className="mt-6">
                      <FilterContent />
                    </div>
                  </SheetContent>
                </Sheet>

                {/* Sort & View */}
                <div className="flex items-center gap-4 ml-auto">
                  <Select value={sortBy} onValueChange={(value) => setSortBy(value)}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="featured">Featured</SelectItem>
                      <SelectItem value="price-asc">Price: Low to High</SelectItem>
                      <SelectItem value="price-desc">Price: High to Low</SelectItem>
                      <SelectItem value="newest">Newest</SelectItem>
                      <SelectItem value="rating">Highest Rated</SelectItem>
                    </SelectContent>
                  </Select>

                  <div className="hidden sm:flex items-center border rounded-lg p-1">
                    <Button
                      variant={viewMode === "grid" ? "secondary" : "ghost"}
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => setViewMode("grid")}
                    >
                      <Grid3X3 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant={viewMode === "list" ? "secondary" : "ghost"}
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => setViewMode("list")}
                    >
                      <List className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Products */}
              {isLoading ? (
                <div className="flex items-center justify-center py-16">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : filteredProducts.length > 0 ? (
                <div
                  className={viewMode === "grid" ? "grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6" : "space-y-4"}
                >
                  {filteredProducts.map((product) => (
                    <ProductCard key={product.id || product.Id} product={product} discounts={discounts} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-16">
                  <p className="text-lg font-medium mb-2">No products found</p>
                  <p className="text-muted-foreground mb-4">Try adjusting your filters</p>
                  <Button onClick={clearFilters}>Clear Filters</Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </>
  )
}

