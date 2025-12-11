import { useState, useEffect } from "react"
import { Link, useParams, useNavigate } from "react-router-dom"
import { Helmet } from "react-helmet-async"
import { ArrowLeft, Upload, X, Loader2, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { ImageWithLoader } from "@/components/ui/image-loader"
import { productsAPI, categoriesAPI, imagesAPI } from "@/lib/api"
import { useToast } from "@/components/ui/toast-notification"

export default function AdminEditProductPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { success, error: showError } = useToast()
  const [product, setProduct] = useState(null)
  const [categories, setCategories] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [uploadedImageUrls, setUploadedImageUrls] = useState([])
  const [imageUrls, setImageUrls] = useState([])
  const [isUploadingImages, setIsUploadingImages] = useState(false)
  const [primaryImage, setPrimaryImage] = useState(0)

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "",
    brand: "",
    sku: "",
    tags: "",
    price: "",
    comparePrice: "",
    stock: "",
    status: "active",
  })

  // Load product and categories on mount
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true)
      try {
        const [productData, categoriesData] = await Promise.all([
          productsAPI.getById(id),
          categoriesAPI.getAll(),
        ])
        
        setProduct(productData)
        setCategories(categoriesData || [])
        
        // Set form data from product
        if (productData) {
          setFormData({
            name: productData.name || "",
            description: productData.description || "",
            category: String(productData.categoryId || productData.CategoryId || productData.category || productData.Category || ""),
            brand: productData.brand || "",
            sku: productData.sku || "",
            tags: productData.tags || "",
            price: productData.price?.toString() || "",
            comparePrice: productData.originalPrice?.toString() || "",
            stock: String(productData.stock || productData.Stock || productData.stockQty || productData.StockQty || 0),
            status: productData.isActive ? "active" : "inactive",
          })
          
          // Set images
          if (productData.image || productData.imageUrl) {
            setUploadedImageUrls([productData.image || productData.imageUrl])
          }
        }
      } catch (err) {
        console.error('Failed to load product:', err)
        showError('Failed to load product. Please try again.')
      } finally {
        setIsLoading(false)
      }
    }
    
    loadData()
  }, [id, showError])

  const handleImageChange = async (e) => {
    if (!e.target.files || e.target.files.length === 0) return

    const newFiles = Array.from(e.target.files).slice(0, 6 - (uploadedImageUrls.length + imageUrls.length))
    
    if (newFiles.length === 0) {
      showError('Maximum 6 images allowed')
      return
    }

    setIsUploadingImages(true)
    
    try {
      const uploadPromises = newFiles.map(async (file, index) => {
        try {
          const result = await imagesAPI.upload(file, {
            productId: id,
            isPrimary: uploadedImageUrls.length + index === 0
          })
          return result.url || result.Url
        } catch (err) {
          console.error(`Failed to upload image ${file.name}:`, err)
          showError(`Failed to upload ${file.name}`)
          return null
        }
      })

      const uploadResults = await Promise.all(uploadPromises)
      const successful = uploadResults.filter(url => url !== null)
      
      setUploadedImageUrls(prev => [...prev, ...successful])
    } catch (err) {
      console.error('Failed to upload images:', err)
      showError('Failed to upload images')
    } finally {
      setIsUploadingImages(false)
    }
  }

  const removeImage = (index) => {
    setUploadedImageUrls(prev => prev.filter((_, i) => i !== index))
    if (primaryImage === index && primaryImage > 0) setPrimaryImage(primaryImage - 1)
    else if (primaryImage > index) setPrimaryImage(primaryImage - 1)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSaving(true)

    try {
      const allImageUrls = [...uploadedImageUrls, ...imageUrls]
      const primaryImageUrl = allImageUrls[primaryImage] || allImageUrls[0] || product?.image || product?.imageUrl || null

      const productData = {
        categoryId: formData.category ? parseInt(formData.category) : null,
        name: formData.name,
        sku: formData.sku || `SKU-${Date.now()}`,
        price: parseFloat(formData.price) || 0,
        originalPrice: formData.comparePrice ? parseFloat(formData.comparePrice) : null,
        stockQty: parseInt(formData.stock) || 0,
        imageUrl: primaryImageUrl,
        description: formData.description || null,
        brand: formData.brand || null,
        tags: formData.tags || null,
        isActive: formData.status === 'active',
        rating: product?.rating || 0,
        reviewCount: product?.reviewCount || 0
      }

      await productsAPI.update(id, productData)
      success('Product updated successfully!')
      navigate("/admin/products")
    } catch (err) {
      console.error('Failed to update product:', err)
      showError(err.message || 'Failed to update product. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    try {
      await productsAPI.delete(id)
      success('Product deleted successfully!')
      navigate("/admin/products")
    } catch (err) {
      console.error('Failed to delete product:', err)
      showError('Failed to delete product. Please try again.')
    }
  }

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!product) {
    return (
      <>
        <Helmet>
          <title>Product Not Found - BuyPoint Admin</title>
        </Helmet>
        <div className="p-6 text-center">
          <h1 className="text-2xl font-bold mb-4">Product Not Found</h1>
          <Button asChild>
            <Link to="/admin/products">Back to Products</Link>
          </Button>
        </div>
      </>
    )
  }

  const totalImages = uploadedImageUrls.length + imageUrls.length

  return (
    <>
      <Helmet>
        <title>Edit Product - {product.name} - BuyPoint Admin</title>
        <meta name="description" content={`Edit product: ${product.name}`} />
      </Helmet>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild className="bg-transparent">
              <Link to="/admin/products">
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold">Edit Product</h1>
              <p className="text-muted-foreground">{product.name}</p>
            </div>
          </div>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Product
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Product</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete &quot;{product.name}&quot;? This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Basic Info */}
              <Card>
                <CardHeader>
                  <CardTitle>Basic Information</CardTitle>
                  <CardDescription>Product name, description, and details</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Product Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Enter product name"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Describe your product..."
                      rows={6}
                    />
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="category">Category *</Label>
                      <Select
                        value={formData.category}
                        onValueChange={(value) => setFormData({ ...formData, category: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((cat) => (
                            <SelectItem key={cat.Id || cat.id} value={String(cat.Id || cat.id)}>
                              {cat.Name || cat.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="brand">Brand</Label>
                      <Input
                        id="brand"
                        value={formData.brand}
                        onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                        placeholder="Brand name"
                      />
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="sku">SKU</Label>
                      <Input
                        id="sku"
                        value={formData.sku}
                        onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                        placeholder="Product SKU"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="tags">Tags</Label>
                      <Input
                        id="tags"
                        value={formData.tags}
                        onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                        placeholder="tag1, tag2, tag3"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Product Images */}
              <Card>
                <CardHeader>
                  <CardTitle>Product Images</CardTitle>
                  <CardDescription>Upload up to 6 images. First image will be the main product image.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 mb-4">
                    {uploadedImageUrls.map((url, index) => (
                      <div key={index} className="relative group">
                        <div
                          className={`aspect-square rounded-lg overflow-hidden bg-muted border-2 ${
                            primaryImage === index ? "border-primary" : "border-transparent"
                          }`}
                        >
                          <ImageWithLoader
                            src={url || "/placeholder.svg"}
                            alt={`Product ${index + 1}`}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                          <Button
                            type="button"
                            variant="secondary"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => setPrimaryImage(index)}
                          >
                            Set Primary
                          </Button>
                          <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => removeImage(index)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {totalImages < 6 && (
                    <div
                      className="border-2 border-dashed rounded-lg p-4 text-center hover:border-primary/50 transition-colors cursor-pointer"
                      onClick={() => document.getElementById("image-upload")?.click()}
                    >
                      <Upload className="h-6 w-6 mx-auto text-muted-foreground mb-1" />
                      <p className="text-sm text-muted-foreground">
                        {isUploadingImages ? "Uploading..." : "Click to upload images"}
                      </p>
                      <Input
                        id="image-upload"
                        type="file"
                        accept="image/*"
                        multiple
                        className="hidden"
                        onChange={handleImageChange}
                        disabled={isUploadingImages}
                      />
                    </div>
                  )}
                  <p className="text-xs text-muted-foreground mt-2">{totalImages}/6 images added</p>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Pricing */}
              <Card>
                <CardHeader>
                  <CardTitle>Pricing</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="price">Price *</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                      <Input
                        id="price"
                        type="number"
                        step="0.01"
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                        className="pl-7"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="comparePrice">Original Price</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                      <Input
                        id="comparePrice"
                        type="number"
                        step="0.01"
                        value={formData.comparePrice}
                        onChange={(e) => setFormData({ ...formData, comparePrice: e.target.value })}
                        className="pl-7"
                        placeholder="Original price"
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">Original price to show discount</p>
                  </div>
                </CardContent>
              </Card>

              {/* Inventory */}
              <Card>
                <CardHeader>
                  <CardTitle>Inventory</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="stock">Stock Quantity *</Label>
                    <Input
                      id="stock"
                      type="number"
                      value={formData.stock}
                      onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                      required
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Status */}
              <Card>
                <CardHeader>
                  <CardTitle>Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <RadioGroup
                    value={formData.status}
                    onValueChange={(value) => setFormData({ ...formData, status: value })}
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="active" id="active" />
                      <Label htmlFor="active">Active</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="inactive" id="inactive" />
                      <Label htmlFor="inactive">Inactive</Label>
                    </div>
                  </RadioGroup>
                </CardContent>
              </Card>

              {/* Actions */}
              <div className="flex flex-col gap-3">
                <Button type="submit" size="lg" disabled={isSaving}>
                  {isSaving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </Button>
                <Button type="button" variant="outline" size="lg" asChild className="bg-transparent">
                  <Link to="/admin/products">Cancel</Link>
                </Button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </>
  )
}
