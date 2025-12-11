import { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Helmet } from "react-helmet-async"
import { Plus, Search, Filter, MoreHorizontal, Pencil, Trash2, Eye, Copy, Download, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { ImageWithLoader } from "@/components/ui/image-loader"
import { productsAPI } from "@/lib/api"
import { useToast } from "@/components/ui/toast-notification"

// ProductCategory enum values (matching backend)
const PRODUCT_CATEGORIES = [
  { value: 0, label: "Electronics" },
  { value: 1, label: "Clothing" },
  { value: 2, label: "Books" },
  { value: 3, label: "Home" },
  { value: 4, label: "Sports" },
  { value: 5, label: "Beauty" },
  { value: 6, label: "Food" },
  { value: 7, label: "Other" },
]

export default function AdminProductsPage() {
  const navigate = useNavigate()
  const { success, error: showError } = useToast()
  const [products, setProducts] = useState([])
  const [selectedProducts, setSelectedProducts] = useState([])
  const [searchQuery, setSearchQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [stockFilter, setStockFilter] = useState("all")
  const [deleteProduct, setDeleteProduct] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      try {
        const productsData = await productsAPI.getAll()
        setProducts(productsData || [])
      } catch (err) {
        console.error("Failed to fetch products:", err)
        showError("Failed to load products. Please try again later.")
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [showError])

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      (product.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (product.brand || "").toLowerCase().includes(searchQuery.toLowerCase())
    // Get category value (can be from categoryId, CategoryId, category, or Category field)
    const productCategory = product.categoryId || product.CategoryId || product.category || product.Category
    const productCategoryNum = typeof productCategory === 'string' ? parseInt(productCategory, 10) : productCategory
    const matchesCategory = categoryFilter === "all" || String(productCategoryNum) === categoryFilter
    const matchesStock =
      stockFilter === "all" ||
      (stockFilter === "low" && (product.stock || product.Stock || product.stockQty || product.StockQty || 0) < 20) ||
      (stockFilter === "out" && (product.stock || product.Stock || product.stockQty || product.StockQty || 0) === 0) ||
      (stockFilter === "in" && (product.stock || product.Stock || product.stockQty || product.StockQty || 0) > 0)
    return matchesSearch && matchesCategory && matchesStock
  })

  const stats = {
    total: products.length,
    active: products.filter((p) => (p.stock || p.Stock || p.stockQty || p.StockQty || 0) > 0).length,
    outOfStock: products.filter((p) => (p.stock || p.Stock || p.stockQty || p.StockQty || 0) === 0).length,
    lowStock: products.filter((p) => {
      const stock = p.stock || p.Stock || p.stockQty || p.StockQty || 0;
      return stock > 0 && stock < 20;
    }).length,
  }

  const toggleSelectAll = () => {
    if (selectedProducts.length === filteredProducts.length) {
      setSelectedProducts([])
    } else {
      setSelectedProducts(filteredProducts.map((p) => p.id || p.Id))
    }
  }

  const toggleSelect = (productId) => {
    setSelectedProducts((prev) =>
      prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId],
    )
  }

  const handleDelete = async () => {
    if (!deleteProduct) return
    
    setIsDeleting(true)
    try {
      const productId = deleteProduct.id || deleteProduct.Id
      await productsAPI.delete(productId)
      setProducts((prev) => prev.filter((p) => (p.id || p.Id) !== productId))
      setDeleteProduct(null)
      success("Product deleted successfully")
    } catch (err) {
      showError(err.message || "Failed to delete product")
    } finally {
      setIsDeleting(false)
    }
  }

  const getStockColor = (stock) => {
    if (stock === 0) return "text-destructive"
    if (stock < 20) return "text-warning"
    return "text-success"
  }

  // Helper function to get category name from enum number or string
  const getCategoryName = (categoryValue) => {
    // Handle null, undefined, and empty string, but allow 0 (Electronics)
    if (categoryValue === null || categoryValue === undefined || categoryValue === "") return "Uncategorized"
    
    // If it's already a string category name, return it capitalized
    if (typeof categoryValue === 'string' && isNaN(categoryValue)) {
      // Check if it's an enum name like "Electronics", "Clothing", etc.
      const category = PRODUCT_CATEGORIES.find(c => c.label.toLowerCase() === categoryValue.toLowerCase())
      return category ? category.label : categoryValue.charAt(0).toUpperCase() + categoryValue.slice(1).toLowerCase()
    }
    
    // Convert to number for comparison
    const numCategoryId = typeof categoryValue === 'string' ? parseInt(categoryValue, 10) : categoryValue
    
    // Check if it's a valid number (not NaN)
    if (isNaN(numCategoryId)) return "Uncategorized"
    
    // Find category in enum mapping
    const category = PRODUCT_CATEGORIES.find(c => c.value === numCategoryId)
    
    return category ? category.label : "Uncategorized"
  }

  return (
    <>
      <Helmet>
        <title>Products Management - BuyPoint Admin</title>
        <meta name="description" content="Manage product inventory" />
      </Helmet>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Products</h1>
            <p className="text-muted-foreground">Manage your product inventory</p>
          </div>
          <Button asChild>
            <Link to="/admin/products/add">
              <Plus className="mr-2 h-4 w-4" />
              Add Product
            </Link>
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <p className="text-2xl font-bold">{stats.total}</p>
              <p className="text-sm text-muted-foreground">Total Products</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-2xl font-bold text-success">{stats.active}</p>
              <p className="text-sm text-muted-foreground">Active</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-2xl font-bold text-destructive">{stats.outOfStock}</p>
              <p className="text-sm text-muted-foreground">Out of Stock</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-2xl font-bold text-warning">{stats.lowStock}</p>
              <p className="text-sm text-muted-foreground">Low Stock</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters & Search */}
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="relative flex-1 w-full sm:max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-[150px]">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {PRODUCT_CATEGORIES.map((cat) => (
                      <SelectItem key={cat.value} value={String(cat.value)}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={stockFilter} onValueChange={setStockFilter}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Stock" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Stock</SelectItem>
                    <SelectItem value="in">In Stock</SelectItem>
                    <SelectItem value="low">Low Stock</SelectItem>
                    <SelectItem value="out">Out of Stock</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" size="icon" className="bg-transparent">
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>

          {/* Bulk Actions */}
          {selectedProducts.length > 0 && (
            <div className="px-6 pb-4">
              <div className="flex items-center gap-4 p-3 bg-muted rounded-lg">
                <span className="text-sm font-medium">{selectedProducts.length} selected</span>
                <Button variant="destructive" size="sm">
                  Delete Selected
                </Button>
                <Button variant="outline" size="sm" className="bg-transparent">
                  Update Status
                </Button>
                <Button variant="outline" size="sm" className="bg-transparent">
                  Export Selected
                </Button>
              </div>
            </div>
          )}

          <CardContent>
            {/* Table */}
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-3 w-10">
                        <Checkbox
                          checked={selectedProducts.length === filteredProducts.length && filteredProducts.length > 0}
                          onCheckedChange={toggleSelectAll}
                        />
                      </th>
                      <th className="text-left p-3">Product</th>
                      <th className="text-left p-3">Category</th>
                      <th className="text-left p-3">Price</th>
                      <th className="text-left p-3">Stock</th>
                      <th className="text-left p-3">Status</th>
                      <th className="text-left p-3">Reviews</th>
                      <th className="text-left p-3 w-10"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProducts.length > 0 ? (
                      filteredProducts.map((product) => {
                        const productId = product.id || product.Id
                        return (
                    <tr key={productId} className="border-b hover:bg-muted/50 transition-colors">
                      <td className="p-3">
                        <Checkbox
                          checked={selectedProducts.includes(productId)}
                          onCheckedChange={() => toggleSelect(productId)}
                        />
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-3">
                          <div className="relative h-12 w-12 rounded-lg overflow-hidden bg-muted shrink-0">
                            <ImageWithLoader
                              src={product.image || product.imageUrl || product.Image || product.ImageUrl || "/placeholder.svg"}
                              alt={product.name || product.Name || "Product"}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div className="min-w-0">
                            <Link
                              to={`/admin/products/edit/${product.id || product.Id}`}
                              className="font-medium hover:text-primary truncate block max-w-[200px]"
                            >
                              {product.name || product.Name}
                            </Link>
                            <p className="text-xs text-muted-foreground">{product.brand || product.Brand}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-3">
                        <Badge variant="secondary" className="capitalize">
                          {(() => {
                            // Check all possible category fields in order of preference
                            const categoryValue = product.CategoryId !== undefined ? product.CategoryId :
                                                  product.categoryId !== undefined ? product.categoryId :
                                                  product.Category !== undefined ? product.Category :
                                                  product.category !== undefined ? product.category :
                                                  null
                            return getCategoryName(categoryValue)
                          })()}
                        </Badge>
                      </td>
                      <td className="p-3">
                        <div>
                          <p className="font-medium">${(product.price || product.Price || 0).toFixed(2)}</p>
                          {product.originalPrice && product.originalPrice > (product.price || product.Price || 0) && (
                            <p className="text-xs text-muted-foreground line-through">
                              ${product.originalPrice.toFixed(2)}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="p-3">
                        <p className={`font-medium ${getStockColor(product.stock || product.Stock || product.stockQty || product.StockQty || 0)}`}>
                          {product.stock || product.Stock || product.stockQty || product.StockQty || 0}
                        </p>
                      </td>
                      <td className="p-3">
                        <Switch checked={product.isActive || product.IsActive} />
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-1">
                          <span className="text-sm">{product.reviewCount || product.ReviewCount || 0}</span>
                          <span className="text-xs text-muted-foreground">({product.rating || product.Rating || 0})</span>
                        </div>
                      </td>
                      <td className="p-3">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                              <Link to={`/products/${product.id}`}>
                                <Eye className="mr-2 h-4 w-4" />
                                View
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link to={`/admin/products/edit/${product.id}`}>
                                <Pencil className="mr-2 h-4 w-4" />
                                Edit
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Copy className="mr-2 h-4 w-4" />
                              Duplicate
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-destructive" onClick={() => setDeleteProduct(product)}>
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                        </tr>
                        )
                      })
                    ) : (
                      <tr>
                        <td colSpan={8} className="text-center py-12">
                          <p className="text-muted-foreground">No products found</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={!!deleteProduct} onOpenChange={() => setDeleteProduct(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Product</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete &quot;{deleteProduct?.name}&quot;? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction 
                onClick={handleDelete} 
                className="bg-destructive text-destructive-foreground"
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  "Delete"
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </>
  )
}

