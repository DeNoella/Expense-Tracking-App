import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Helmet } from "react-helmet-async"
import { ArrowLeft, Upload, X, Loader2, GripVertical, Plus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Separator } from "@/components/ui/separator"
import { ImageWithLoader } from "@/components/ui/image-loader"
import { imagesAPI } from "@/lib/api/images"
import { productsAPI } from "@/lib/api/products"
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

export default function AdminAddProductPage() {
  const navigate = useNavigate()
  const { success, error: showError } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [isUploadingImages, setIsUploadingImages] = useState(false)
  const [images, setImages] = useState([]) // Store File objects for preview
  const [uploadedImageUrls, setUploadedImageUrls] = useState([]) // Store uploaded URLs from backend
  const [imageUrls, setImageUrls] = useState([]) // Store manually added URLs
  const [primaryImage, setPrimaryImage] = useState(0)
  const [showVariants, setShowVariants] = useState(false)
  const [showSeo, setShowSeo] = useState(false)
  const [showSpecifications, setShowSpecifications] = useState(false)

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "",
    brand: "",
    sku: "",
    tags: "",
    price: "",
    comparePrice: "",
    costPrice: "",
    stock: "",
    lowStockThreshold: "10",
    trackInventory: true,
    weight: "",
    dimensions: { length: "", width: "", height: "" },
    status: "active",
    metaTitle: "",
    metaDescription: "",
    slug: "",
  })

  const [specifications, setSpecifications] = useState([{ key: "", value: "" }])

  const [variants, setVariants] = useState({
    hasVariants: false,
    options: [{ name: "Size", values: [] }],
  })


  // Upload images automatically when selected
  const handleImageChange = async (e) => {
    if (!e.target.files || e.target.files.length === 0) return

    const newFiles = Array.from(e.target.files).slice(0, 6 - (images.length + uploadedImageUrls.length + imageUrls.length))
    
    if (newFiles.length === 0) {
      showError('Maximum 6 images allowed')
      return
    }

    setIsUploadingImages(true)
    
    try {
      // Upload each image to backend
      const uploadPromises = newFiles.map(async (file, index) => {
        try {
          const result = await imagesAPI.upload(file, {
            isPrimary: images.length + uploadedImageUrls.length + index === 0 // First image is primary
          })
          return { file, url: result.url, uploaded: true }
        } catch (err) {
          console.error(`Failed to upload image ${file.name}:`, err)
          showError(`Failed to upload ${file.name}`)
          return null
        }
      })

      const uploadResults = await Promise.all(uploadPromises)
      const successful = uploadResults.filter(r => r !== null)

      // Add files for preview
      setImages(prev => [...prev, ...successful.map(r => r.file)])
      
      // Add uploaded URLs
      setUploadedImageUrls(prev => [...prev, ...successful.map(r => r.url)])

      if (successful.length > 0) {
        success(`Uploaded ${successful.length} image(s) successfully`)
      }
    } catch (err) {
      console.error('Error uploading images:', err)
      showError('Failed to upload images')
    } finally {
      setIsUploadingImages(false)
    }
  }

  const handleAddImageUrl = () => {
    const url = prompt("Enter image URL:")
    if (url) {
      setImageUrls((prev) => [...prev, url].slice(0, 6 - images.length))
    }
  }

  const removeImage = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index))
    setUploadedImageUrls((prev) => prev.filter((_, i) => i !== index))
    if (primaryImage === index) setPrimaryImage(0)
    else if (primaryImage > index) setPrimaryImage((prev) => prev - 1)
  }

  const removeImageUrl = (index) => {
    const adjustedIndex = index - images.length
    setImageUrls((prev) => prev.filter((_, i) => i !== adjustedIndex))
  }

  const addSpecification = () => {
    setSpecifications([...specifications, { key: "", value: "" }])
  }

  const updateSpecification = (index, field, value) => {
    const updated = [...specifications]
    updated[index][field] = value
    setSpecifications(updated)
  }

  const removeSpecification = (index) => {
    setSpecifications(specifications.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e, isDraft = false) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Get all image URLs (uploaded + manually added)
      const allImageUrls = [...uploadedImageUrls, ...imageUrls]
      const primaryImageUrl = allImageUrls[primaryImage] || allImageUrls[0] || null

      // Create product data
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
        rating: 0,
        reviewCount: 0
      }

      // Create product
      const createdProduct = await productsAPI.create(productData)

      // Link uploaded images to the product
      if (createdProduct?.id && uploadedImageUrls.length > 0) {
        try {
          // Get all images that were uploaded (they should have the URLs we stored)
          const allImages = await imagesAPI.getAll()
          
          // Find images matching our uploaded URLs and link them to the product
          const imagesToLink = allImages.filter(img => 
            uploadedImageUrls.some(url => img.url === url || img.Url === url)
          )
          
          // Update each image to link to the product
          // Note: We'll need to update images after product creation
          // For now, the primary image URL is already set on the product
          // Additional images can be linked later if needed
        } catch (err) {
          console.warn('Failed to link images to product:', err)
          // Don't fail the product creation if image linking fails
        }
      }

      success('Product created successfully!')

      navigate("/admin/products")
    } catch (err) {
      console.error('Failed to create product:', err)
      showError(err.message || 'Failed to create product. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const generateSku = () => {
    const sku = `SKU-${Date.now().toString(36).toUpperCase()}`
    setFormData({ ...formData, sku })
  }

  const generateSlug = () => {
    const slug = formData.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")
    setFormData({ ...formData, slug })
  }

  const totalImages = images.length + uploadedImageUrls.length + imageUrls.length

  return (
    <>
      <Helmet>
        <title>Add New Product - BuyPoint Admin</title>
        <meta name="description" content="Create a new product listing" />
      </Helmet>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild className="bg-transparent">
            <Link to="/admin/products">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Add New Product</h1>
            <p className="text-muted-foreground">Create a new product listing</p>
          </div>
        </div>

        <form onSubmit={(e) => handleSubmit(e, false)}>
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
                    <p className="text-xs text-muted-foreground text-right">{formData.name.length} / 100</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Describe your product in detail. Include key features, materials, and benefits..."
                      rows={6}
                    />
                    <p className="text-xs text-muted-foreground">
                      Provide a detailed description to help customers understand your product
                    </p>
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
                          {PRODUCT_CATEGORIES.map((cat) => (
                            <SelectItem key={cat.value} value={String(cat.value)}>
                              {cat.label}
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
                      <div className="flex gap-2">
                        <Input
                          id="sku"
                          value={formData.sku}
                          onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                          placeholder="Product SKU"
                        />
                        <Button type="button" variant="outline" onClick={generateSku} className="bg-transparent shrink-0">
                          Auto
                        </Button>
                      </div>
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

              {/* Images */}
              <Card>
                <CardHeader>
                  <CardTitle>Product Images</CardTitle>
                  <CardDescription>
                    Upload up to 6 images or add URLs. First image will be the main product image.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Upload Area */}
                    <div
                      className="border-2 border-dashed rounded-lg p-6 text-center hover:border-primary/50 transition-colors cursor-pointer"
                      onClick={() => document.getElementById("image-upload")?.click()}
                    >
                      <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                      <p className="text-sm text-muted-foreground">
                        {isUploadingImages ? 'Uploading images...' : 'Drag and drop images here, or click to select'}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        PNG, JPG up to 10MB each (max 6 images). Images upload automatically when selected.
                      </p>
                      {isUploadingImages && <Loader2 className="h-4 w-4 mx-auto mt-2 animate-spin" />}
                      <Input
                        id="image-upload"
                        type="file"
                        accept="image/*"
                        multiple
                        className="hidden"
                        onChange={handleImageChange}
                      />
                    </div>

                    <div className="flex justify-center">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleAddImageUrl}
                        disabled={totalImages >= 6}
                        className="gap-2"
                      >
                        <Plus className="h-4 w-4" />
                        Add Image URL
                      </Button>
                    </div>

                    {/* Image Grid */}
                    {totalImages > 0 && (
                      <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                        {/* Uploaded Files */}
                        {images.map((file, index) => {
                          const imageUrl = uploadedImageUrls[index] || URL.createObjectURL(file)
                          return (
                          <div key={`file-${index}`} className="relative group">
                            <div
                              className={`aspect-square rounded-lg overflow-hidden bg-muted border-2 ${primaryImage === index ? "border-primary" : "border-transparent"}`}
                            >
                              <img
                                src={imageUrl || "/placeholder.svg"}
                                alt={`Upload ${index + 1}`}
                                className="object-cover w-full h-full"
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
                                <GripVertical className="h-3 w-3" />
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
                            {primaryImage === index && (
                              <span className="absolute bottom-1 left-1 text-[10px] bg-primary text-primary-foreground px-1.5 py-0.5 rounded">
                                Primary
                              </span>
                            )}
                          </div>
                          )
                        })}

                        {/* URL Images */}
                        {imageUrls.map((url, index) => {
                          const urlIndex = images.length + index
                          return (
                          <div key={`url-${index}`} className="relative group">
                            <div
                              className={`aspect-square rounded-lg overflow-hidden bg-muted border-2 ${primaryImage === urlIndex ? "border-primary" : "border-transparent"}`}
                            >
                              <img
                                src={url || "/placeholder.svg"}
                                alt={`Image ${urlIndex + 1}`}
                                className="object-cover w-full h-full"
                                onError={(e) => {
                                  e.target.src = "/placeholder.svg"
                                }}
                              />
                            </div>
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                              <Button
                                type="button"
                                variant="secondary"
                                size="icon"
                                className="h-7 w-7"
                                onClick={() => setPrimaryImage(urlIndex)}
                              >
                                <GripVertical className="h-3 w-3" />
                              </Button>
                              <Button
                                type="button"
                                variant="destructive"
                                size="icon"
                                className="h-7 w-7"
                                onClick={() => removeImageUrl(urlIndex)}
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                            {primaryImage === urlIndex && (
                              <span className="absolute bottom-1 left-1 text-[10px] bg-primary text-primary-foreground px-1.5 py-0.5 rounded">
                                Primary
                              </span>
                            )}
                          </div>
                          )
                        })}
                      </div>
                    )}

                    <p className="text-xs text-muted-foreground text-center">{totalImages}/6 images added</p>
                  </div>
                </CardContent>
              </Card>

              <Collapsible open={showSpecifications} onOpenChange={setShowSpecifications}>
                <Card>
                  <CollapsibleTrigger asChild>
                    <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                      <CardTitle className="flex items-center justify-between">
                        Product Specifications
                        <span className="text-sm font-normal text-muted-foreground">
                          {showSpecifications ? "−" : "+"}
                        </span>
                      </CardTitle>
                      <CardDescription>Add technical specifications and details</CardDescription>
                    </CardHeader>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <CardContent className="space-y-4">
                      {specifications.map((spec, index) => (
                        <div key={index} className="flex gap-2 items-start">
                          <div className="flex-1 space-y-1">
                            <Input
                              placeholder="Specification name (e.g., Material)"
                              value={spec.key}
                              onChange={(e) => updateSpecification(index, "key", e.target.value)}
                            />
                          </div>
                          <div className="flex-1 space-y-1">
                            <Input
                              placeholder="Value (e.g., Cotton 100%)"
                              value={spec.value}
                              onChange={(e) => updateSpecification(index, "value", e.target.value)}
                            />
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removeSpecification(index)}
                            disabled={specifications.length === 1}
                            className="shrink-0"
                          >
                            <Trash2 className="h-4 w-4 text-muted-foreground" />
                          </Button>
                        </div>
                      ))}
                      <Button
                        type="button"
                        variant="outline"
                        onClick={addSpecification}
                        className="w-full gap-2 bg-transparent"
                      >
                        <Plus className="h-4 w-4" />
                        Add Specification
                      </Button>

                      <Separator />

                      {/* Common Specifications */}
                      <div className="space-y-4">
                        <Label className="text-sm font-medium">Common Specifications</Label>
                        <div className="grid sm:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="weight" className="text-xs text-muted-foreground">
                              Weight (kg)
                            </Label>
                            <Input
                              id="weight"
                              type="number"
                              step="0.01"
                              value={formData.weight}
                              onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                              placeholder="0.00"
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label className="text-xs text-muted-foreground">Dimensions (cm)</Label>
                          <div className="grid grid-cols-3 gap-2">
                            <Input
                              placeholder="Length"
                              type="number"
                              value={formData.dimensions.length}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  dimensions: { ...formData.dimensions, length: e.target.value },
                                })
                              }
                            />
                            <Input
                              placeholder="Width"
                              type="number"
                              value={formData.dimensions.width}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  dimensions: { ...formData.dimensions, width: e.target.value },
                                })
                              }
                            />
                            <Input
                              placeholder="Height"
                              type="number"
                              value={formData.dimensions.height}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  dimensions: { ...formData.dimensions, height: e.target.value },
                                })
                              }
                            />
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </CollapsibleContent>
                </Card>
              </Collapsible>

              {/* Variants */}
              <Collapsible open={showVariants} onOpenChange={setShowVariants}>
                <Card>
                  <CollapsibleTrigger asChild>
                    <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                      <CardTitle className="flex items-center justify-between">
                        Product Variants
                        <span className="text-sm font-normal text-muted-foreground">{showVariants ? "−" : "+"}</span>
                      </CardTitle>
                      <CardDescription>Add size, color, or other variations (optional)</CardDescription>
                    </CardHeader>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <CardContent className="space-y-4">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="hasVariants"
                          checked={variants.hasVariants}
                          onCheckedChange={(checked) => setVariants({ ...variants, hasVariants: checked })}
                        />
                        <Label htmlFor="hasVariants" className="text-sm font-normal">
                          This product has multiple variants
                        </Label>
                      </div>

                      {variants.hasVariants && (
                        <div className="space-y-4 pt-4">
                          <div className="grid sm:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label>Size Options</Label>
                              <Input placeholder="S, M, L, XL (comma separated)" />
                            </div>
                            <div className="space-y-2">
                              <Label>Color Options</Label>
                              <Input placeholder="Red, Blue, Green (comma separated)" />
                            </div>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Variants will be automatically generated based on your options
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </CollapsibleContent>
                </Card>
              </Collapsible>

              {/* SEO */}
              <Collapsible open={showSeo} onOpenChange={setShowSeo}>
                <Card>
                  <CollapsibleTrigger asChild>
                    <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                      <CardTitle className="flex items-center justify-between">
                        SEO Settings
                        <span className="text-sm font-normal text-muted-foreground">{showSeo ? "−" : "+"}</span>
                      </CardTitle>
                      <CardDescription>Optimize for search engines (optional)</CardDescription>
                    </CardHeader>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="metaTitle">Meta Title</Label>
                        <Input
                          id="metaTitle"
                          value={formData.metaTitle}
                          onChange={(e) => setFormData({ ...formData, metaTitle: e.target.value })}
                          placeholder="SEO title"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="metaDescription">Meta Description</Label>
                        <Textarea
                          id="metaDescription"
                          value={formData.metaDescription}
                          onChange={(e) => setFormData({ ...formData, metaDescription: e.target.value })}
                          placeholder="SEO description"
                          rows={3}
                        />
                        <p className="text-xs text-muted-foreground text-right">
                          {formData.metaDescription.length} / 160
                        </p>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="slug">URL Slug</Label>
                        <div className="flex gap-2">
                          <Input
                            id="slug"
                            value={formData.slug}
                            onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                            placeholder="product-url-slug"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            onClick={generateSlug}
                            className="bg-transparent shrink-0"
                          >
                            Auto
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </CollapsibleContent>
                </Card>
              </Collapsible>
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
                        placeholder="0.00"
                        className="pl-7"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="comparePrice">Compare at Price</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                      <Input
                        id="comparePrice"
                        type="number"
                        step="0.01"
                        value={formData.comparePrice}
                        onChange={(e) => setFormData({ ...formData, comparePrice: e.target.value })}
                        placeholder="0.00"
                        className="pl-7"
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">Original price to show discount</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="costPrice">Cost per Item</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                      <Input
                        id="costPrice"
                        type="number"
                        step="0.01"
                        value={formData.costPrice}
                        onChange={(e) => setFormData({ ...formData, costPrice: e.target.value })}
                        placeholder="0.00"
                        className="pl-7"
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">For profit calculation</p>
                  </div>

                  {formData.price && formData.costPrice && (
                    <div className="p-3 bg-muted rounded-lg">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Profit Margin</span>
                        <span className="font-medium">
                          ${(parseFloat(formData.price) - parseFloat(formData.costPrice)).toFixed(2)}
                          <span className="text-muted-foreground ml-1">
                            (
                            {(
                              ((parseFloat(formData.price) - parseFloat(formData.costPrice)) /
                                parseFloat(formData.price)) *
                              100
                            ).toFixed(1)}
                            %)
                          </span>
                        </span>
                      </div>
                    </div>
                  )}
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
                      placeholder="0"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="lowStock">Low Stock Threshold</Label>
                    <Input
                      id="lowStock"
                      type="number"
                      value={formData.lowStockThreshold}
                      onChange={(e) => setFormData({ ...formData, lowStockThreshold: e.target.value })}
                      placeholder="10"
                    />
                    <p className="text-xs text-muted-foreground">Alert when stock falls below this number</p>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="trackInventory"
                      checked={formData.trackInventory}
                      onCheckedChange={(checked) => setFormData({ ...formData, trackInventory: checked })}
                    />
                    <Label htmlFor="trackInventory" className="text-sm font-normal">
                      Track inventory
                    </Label>
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
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="draft" id="draft" />
                      <Label htmlFor="draft">Draft</Label>
                    </div>
                  </RadioGroup>
                </CardContent>
              </Card>

              {/* Actions */}
              <div className="flex flex-col gap-3">
                <Button type="submit" size="lg" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Publishing...
                    </>
                  ) : (
                    "Publish Product"
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  onClick={(e) => handleSubmit(e, true)}
                  disabled={isLoading}
                >
                  Save as Draft
                </Button>
                <Button type="button" variant="ghost" asChild>
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

