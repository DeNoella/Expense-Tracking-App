import { useState, useEffect } from "react"
import { Helmet } from "react-helmet-async"
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  Tag,
  ToggleLeft,
  ToggleRight,
  Percent,
  DollarSign,
  Calendar,
  X,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ButtonSpinner } from "@/components/ui/spinner"
import { SkeletonTable, SkeletonStatsCard } from "@/components/ui/skeleton-loader"
import { useToast } from "@/components/ui/toast-notification"
import { discountsAPI, productsAPI, categoriesAPI } from "@/lib/api"

const initialFormData = {
  name: "",
  type: "percentage",
  value: 0,
  applicableTo: "all",
  categoryIds: [],
  productIds: [],
  startDate: new Date().toISOString().split("T")[0],
  endDate: "",
  minPurchase: 0,
  maxDiscount: 0,
  status: "active",
}

export default function AdminDiscountsPage() {
  const { success, error } = useToast()
  const [discounts, setDiscounts] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingDiscount, setEditingDiscount] = useState(null)
  const [formData, setFormData] = useState(initialFormData)
  const [productSearch, setProductSearch] = useState("")
  const [categorySearch, setCategorySearch] = useState("")
  const [isSaving, setIsSaving] = useState(false)
  const [deletingId, setDeletingId] = useState(null)
  const [togglingId, setTogglingId] = useState(null)

  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true)
      try {
        const [discountsData, productsData, categoriesData] = await Promise.all([
          discountsAPI.getAll().catch(() => []),
          productsAPI.getAll().catch(() => []),
          categoriesAPI.getAll().catch(() => []),
        ])
        setDiscounts(discountsData || [])
        setProducts(productsData || [])
        setCategories(categoriesData || [])
      } catch (err) {
        console.error("Failed to load data:", err)
        error("Failed to load discounts. Please try again later.")
      } finally {
        setIsLoading(false)
      }
    }
    loadData()
  }, [error])

  const filteredDiscounts = discounts.filter(
    (d) =>
      d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.type.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const filteredProducts = products.filter((p) => p.name.toLowerCase().includes(productSearch.toLowerCase()))

  const filteredCategories = categories.filter((c) => c.name.toLowerCase().includes(categorySearch.toLowerCase()))

  const handleOpenDialog = (discount) => {
    if (discount) {
      setEditingDiscount(discount)
      setFormData({
        name: discount.name,
        type: discount.type,
        value: discount.value,
        applicableTo: discount.applicableTo,
        categoryIds: discount.categoryIds || (discount.categoryId ? [discount.categoryId] : []),
        productIds: discount.productIds || (discount.productId ? [discount.productId] : []),
        startDate: discount.startDate,
        endDate: discount.endDate || "",
        minPurchase: discount.minPurchase || 0,
        maxDiscount: discount.maxDiscount || 0,
        status: discount.status,
      })
    } else {
      setEditingDiscount(null)
      setFormData(initialFormData)
    }
    setIsDialogOpen(true)
  }

  const handleSaveDiscount = async () => {
    setIsSaving(true)

    try {
      const discountData = {
        name: formData.name,
        type: formData.type,
        value: formData.value,
        applicableTo: formData.applicableTo,
        categoryId:
          formData.applicableTo === "category" && formData.categoryIds.length > 0 ? formData.categoryIds[0] : null,
        productId:
          formData.applicableTo === "product" && formData.productIds.length > 0 ? formData.productIds[0] : null,
        startDate: formData.startDate,
        endDate: formData.endDate || null,
        minPurchase: formData.minPurchase || null,
        maxDiscount: formData.maxDiscount || null,
        status: formData.status,
      }

      if (editingDiscount) {
        await discountsAPI.update(editingDiscount.id, discountData)
        success("Discount updated successfully")
      } else {
        await discountsAPI.create(discountData)
        success("Discount created successfully")
      }

      // Refresh discounts
      const discountsData = await discountsAPI.getAll()
      setDiscounts(discountsData || [])
      setIsDialogOpen(false)
    } catch (err) {
      error(err.message || "Failed to save discount")
    } finally {
      setIsSaving(false)
    }
  }

  const handleToggleStatus = async (id) => {
    setTogglingId(id)

    try {
      const discount = discounts.find((d) => d.id === id)
      if (!discount) return

      const newStatus = discount.status === "Active" ? "Inactive" : "Active"
      await discountsAPI.update(id, { ...discount, status: newStatus })
      
      // Refresh discounts
      const discountsData = await discountsAPI.getAll()
      setDiscounts(discountsData || [])
      success("Discount status updated")
    } catch (err) {
      error(err.message || "Failed to update status")
    } finally {
      setTogglingId(null)
    }
  }

  const handleDeleteDiscount = async (id) => {
    setDeletingId(id)

    try {
      await discountsAPI.delete(id)
      // Refresh discounts
      const discountsData = await discountsAPI.getAll()
      setDiscounts(discountsData || [])
      success("Discount deleted successfully")
    } catch (err) {
      error(err.message || "Failed to delete discount")
    } finally {
      setDeletingId(null)
    }
  }

  const toggleProduct = (productId) => {
    setFormData((prev) => ({
      ...prev,
      productIds: prev.productIds.includes(productId)
        ? prev.productIds.filter((id) => id !== productId)
        : [...prev.productIds, productId],
    }))
  }

  const toggleCategory = (categoryId) => {
    setFormData((prev) => ({
      ...prev,
      categoryIds: prev.categoryIds.includes(categoryId)
        ? prev.categoryIds.filter((id) => id !== categoryId)
        : [...prev.categoryIds, categoryId],
    }))
  }

  const getApplicableToLabel = (discount) => {
    if (discount.applicableTo === "all") return "All Products"
    if (discount.applicableTo === "category") {
      const categoryIds = discount.categoryIds || (discount.categoryId ? [discount.categoryId] : [])
      const categoryNames = categoryIds
        .map((id) => categories.find((c) => c.id === id)?.name)
        .filter(Boolean)
        .slice(0, 2)
        .join(", ")
      const remaining = categoryIds.length - 2
      return categoryNames + (remaining > 0 ? ` +${remaining} more` : "")
    }
    if (discount.applicableTo === "product") {
      const productIds = discount.productIds || (discount.productId ? [discount.productId] : [])
      const productNames = productIds
        .map((id) => products.find((p) => p.id === id)?.name)
        .filter(Boolean)
        .slice(0, 1)
        .join(", ")
      const remaining = productIds.length - 1
      return productNames + (remaining > 0 ? ` +${remaining} more` : "")
    }
    return "Unknown"
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case "active":
        return (
          <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/20">
            Active
          </Badge>
        )
      case "inactive":
        return (
          <Badge variant="outline" className="bg-gray-500/10 text-gray-600 border-gray-500/20">
            Inactive
          </Badge>
        )
      case "scheduled":
        return (
          <Badge variant="outline" className="bg-blue-500/10 text-blue-600 border-blue-500/20">
            Scheduled
          </Badge>
        )
      case "expired":
        return (
          <Badge variant="outline" className="bg-red-500/10 text-red-600 border-red-500/20">
            Expired
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <>
      <Helmet>
        <title>Discount Management - BuyPoint Admin</title>
        <meta name="description" content="Create and manage promotional discounts" />
      </Helmet>
      <div className="space-y-6 p-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold">Discount Management</h1>
            <p className="text-muted-foreground">Create and manage promotional discounts</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <Button onClick={() => handleOpenDialog()} className="gap-2">
              <Plus className="h-4 w-4" />
              Create Discount
            </Button>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingDiscount ? "Edit Discount" : "Create New Discount"}</DialogTitle>
                <DialogDescription>
                  {editingDiscount ? "Update the discount details below" : "Fill in the details to create a new discount"}
                </DialogDescription>
              </DialogHeader>

              <div className="grid gap-4 py-4">
                {/* Discount Name */}
                <div className="grid gap-2">
                  <Label htmlFor="name">Discount Name</Label>
                  <Input
                    id="name"
                    placeholder="e.g., Summer Sale 20% Off"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>

                {/* Discount Type */}
                <div className="grid gap-2">
                  <Label>Discount Type</Label>
                  <RadioGroup
                    value={formData.type}
                    onValueChange={(value) => setFormData({ ...formData, type: value })}
                    className="flex gap-4"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="percentage" id="percentage" />
                      <Label htmlFor="percentage" className="flex items-center gap-1 cursor-pointer">
                        <Percent className="h-4 w-4" />
                        Percentage
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="fixed" id="fixed" />
                      <Label htmlFor="fixed" className="flex items-center gap-1 cursor-pointer">
                        <DollarSign className="h-4 w-4" />
                        Fixed Amount
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                {/* Discount Value */}
                <div className="grid gap-2">
                  <Label htmlFor="value">Discount Value</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                      {formData.type === "percentage" ? "%" : "$"}
                    </span>
                    <Input
                      id="value"
                      type="number"
                      className="pl-8"
                      value={formData.value}
                      onChange={(e) => setFormData({ ...formData, value: Number(e.target.value) })}
                    />
                  </div>
                </div>

                {/* Applicable To */}
                <div className="grid gap-2">
                  <Label>Apply Discount To</Label>
                  <Select
                    value={formData.applicableTo}
                    onValueChange={(value) =>
                      setFormData({ ...formData, applicableTo: value, categoryIds: [], productIds: [] })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Products</SelectItem>
                      <SelectItem value="category">Specific Categories</SelectItem>
                      <SelectItem value="product">Specific Products</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Category Selection */}
                {formData.applicableTo === "category" && (
                  <div className="grid gap-2">
                    <Label>Select Categories</Label>
                    {formData.categoryIds.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-2">
                        {formData.categoryIds.map((id) => {
                          const category = categories.find((c) => c.id === id)
                          return (
                            <Badge key={id} variant="secondary" className="gap-1">
                              {category?.name}
                              <button onClick={() => toggleCategory(id)} className="ml-1 hover:text-destructive">
                                <X className="h-3 w-3" />
                              </button>
                            </Badge>
                          )
                        })}
                      </div>
                    )}
                    <Input
                      placeholder="Search categories..."
                      value={categorySearch}
                      onChange={(e) => setCategorySearch(e.target.value)}
                    />
                    <ScrollArea className="h-[150px] rounded-md border p-2">
                      <div className="space-y-2">
                        {filteredCategories.map((category) => (
                          <div key={category.id} className="flex items-center space-x-2">
                            <Checkbox
                              id={`cat-${category.id}`}
                              checked={formData.categoryIds.includes(category.id)}
                              onCheckedChange={() => toggleCategory(category.id)}
                            />
                            <label
                              htmlFor={`cat-${category.id}`}
                              className="text-sm cursor-pointer flex-1 flex items-center gap-2"
                            >
                              <span>{category.icon}</span>
                              {category.name}
                            </label>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </div>
                )}

                {/* Product Selection */}
                {formData.applicableTo === "product" && (
                  <div className="grid gap-2">
                    <Label>Select Products</Label>
                    {formData.productIds.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-2">
                        {formData.productIds.map((id) => {
                          const product = products.find((p) => p.id === id)
                          return (
                            <Badge key={id} variant="secondary" className="gap-1">
                              {product?.name}
                              <button onClick={() => toggleProduct(id)} className="ml-1 hover:text-destructive">
                                <X className="h-3 w-3" />
                              </button>
                            </Badge>
                          )
                        })}
                      </div>
                    )}
                    <Input
                      placeholder="Search products..."
                      value={productSearch}
                      onChange={(e) => setProductSearch(e.target.value)}
                    />
                    <ScrollArea className="h-[200px] rounded-md border p-2">
                      <div className="space-y-2">
                        {filteredProducts.map((product) => (
                          <div key={product.id} className="flex items-center space-x-2">
                            <Checkbox
                              id={`prod-${product.id}`}
                              checked={formData.productIds.includes(product.id)}
                              onCheckedChange={() => toggleProduct(product.id)}
                            />
                            <label htmlFor={`prod-${product.id}`} className="text-sm cursor-pointer flex-1">
                              <span className="font-medium">{product.name}</span>
                              <span className="text-muted-foreground ml-2">${product.price}</span>
                            </label>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </div>
                )}

                {/* Date Range */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="startDate">Start Date</Label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="startDate"
                        type="date"
                        className="pl-10"
                        value={formData.startDate}
                        onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="endDate">End Date (Optional)</Label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="endDate"
                        type="date"
                        className="pl-10"
                        value={formData.endDate}
                        onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                      />
                    </div>
                  </div>
                </div>

                {/* Status */}
                <div className="grid gap-2">
                  <Label>Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) => setFormData({ ...formData, status: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="scheduled">Scheduled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={isSaving}>
                  Cancel
                </Button>
                <Button onClick={handleSaveDiscount} disabled={!formData.name || formData.value <= 0 || isSaving}>
                  {isSaving ? (
                    <>
                      <ButtonSpinner />
                      Saving...
                    </>
                  ) : editingDiscount ? (
                    "Save Changes"
                  ) : (
                    "Create Discount"
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Cards */}
        {isLoading ? (
          <div className="grid gap-4 md:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <SkeletonStatsCard key={i} />
            ))}
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Discounts</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{discounts.length}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Active</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-green-600">
                  {discounts.filter((d) => d.status === "active").length}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Scheduled</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{discounts.filter((d) => d.status === "scheduled").length}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Expired</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-muted-foreground">
                  {discounts.filter((d) => d.status === "expired").length}
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Search */}
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search discounts..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Discounts Table */}
        {isLoading ? (
          <SkeletonTable rows={5} columns={7} />
        ) : (
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Discount</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Value</TableHead>
                    <TableHead>Applicable To</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDiscounts.map((discount) => (
                    <TableRow key={discount.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Tag className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{discount.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{discount.type === "percentage" ? "Percentage" : "Fixed"}</Badge>
                      </TableCell>
                      <TableCell>
                        {discount.type === "percentage" ? `${discount.value}%` : `$${discount.value}`}
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">{getApplicableToLabel(discount)}</span>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <p>{new Date(discount.startDate).toLocaleDateString()}</p>
                          {discount.endDate && (
                            <p className="text-muted-foreground">to {new Date(discount.endDate).toLocaleDateString()}</p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(discount.status)}</TableCell>
                      <TableCell>
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleToggleStatus(discount.id)}
                            title={discount.status === "active" ? "Deactivate" : "Activate"}
                            disabled={togglingId === discount.id}
                          >
                            {togglingId === discount.id ? (
                              <ButtonSpinner />
                            ) : discount.status === "active" ? (
                              <ToggleRight className="h-4 w-4 text-green-600" />
                            ) : (
                              <ToggleLeft className="h-4 w-4" />
                            )}
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(discount)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteDiscount(discount.id)}
                            disabled={deletingId === discount.id}
                          >
                            {deletingId === discount.id ? (
                              <ButtonSpinner />
                            ) : (
                              <Trash2 className="h-4 w-4 text-destructive" />
                            )}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </div>
    </>
  )
}

