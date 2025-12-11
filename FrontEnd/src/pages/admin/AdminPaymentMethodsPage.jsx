import { useState, useEffect } from "react"
import { Helmet } from "react-helmet-async"
import { Plus, Pencil, Trash2, ToggleLeft, ToggleRight, Banknote, Building, Smartphone, CreditCard, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { paymentMethodsAPI } from "@/lib/api"
import { useToast } from "@/components/ui/toast-notification"

const iconOptions = [
  { value: "banknote", label: "Cash", icon: Banknote },
  { value: "building", label: "Bank", icon: Building },
  { value: "smartphone", label: "Mobile", icon: Smartphone },
  { value: "card", label: "Card", icon: CreditCard },
]

export default function AdminPaymentMethodsPage() {
  const { success, error: showError } = useToast()
  const [paymentMethods, setPaymentMethods] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingMethod, setEditingMethod] = useState(null)
  const [isSaving, setIsSaving] = useState(false)
  const [deletingId, setDeletingId] = useState(null)
  const [togglingId, setTogglingId] = useState(null)

  const [formData, setFormData] = useState({
    name: "",
    code: "cod",
    description: "",
    icon: "banknote",
    isActive: true,
  })

  useEffect(() => {
    const fetchPaymentMethods = async () => {
      setIsLoading(true)
      try {
        const methodsData = await paymentMethodsAPI.getAll()
        setPaymentMethods(methodsData || [])
      } catch (err) {
        console.error("Failed to fetch payment methods:", err)
        showError("Failed to load payment methods. Please try again later.")
        setPaymentMethods([])
      } finally {
        setIsLoading(false)
      }
    }
    fetchPaymentMethods()
  }, [showError])

  const getIcon = (iconName) => {
    const IconComponent = iconOptions.find((opt) => opt.value === iconName)?.icon || Banknote
    return <IconComponent className="h-5 w-5" />
  }

  const handleOpenDialog = (method) => {
    if (method) {
      setEditingMethod(method)
      setFormData({
        name: method.name,
        code: method.code,
        description: method.description,
        icon: method.icon,
        isActive: method.isActive,
      })
    } else {
      setEditingMethod(null)
      setFormData({
        name: "",
        code: "cod",
        description: "",
        icon: "banknote",
        isActive: true,
      })
    }
    setIsDialogOpen(true)
  }

  const handleSaveMethod = async () => {
    setIsSaving(true)
    try {
      const methodData = {
        name: formData.name,
        code: formData.code,
        description: formData.description,
        icon: formData.icon,
        isActive: formData.isActive,
      }

      if (editingMethod) {
        await paymentMethodsAPI.update(editingMethod.id, methodData)
        success("Payment method updated successfully")
      } else {
        await paymentMethodsAPI.create(methodData)
        success("Payment method created successfully")
      }

      // Refresh payment methods
      const methodsData = await paymentMethodsAPI.getAll()
      setPaymentMethods(methodsData || [])
      setIsDialogOpen(false)
    } catch (err) {
      showError(err.message || "Failed to save payment method")
    } finally {
      setIsSaving(false)
    }
  }

  const handleToggleStatus = async (id) => {
    setTogglingId(id)
    try {
      const method = paymentMethods.find((m) => m.id === id)
      if (!method) return

      await paymentMethodsAPI.update(id, { ...method, isActive: !method.isActive })
      
      // Refresh payment methods
      const methodsData = await paymentMethodsAPI.getAll()
      setPaymentMethods(methodsData || [])
      success("Payment method status updated")
    } catch (err) {
      showError(err.message || "Failed to update status")
    } finally {
      setTogglingId(null)
    }
  }

  const handleDeleteMethod = async (id) => {
    setDeletingId(id)
    try {
      await paymentMethodsAPI.delete(id)
      // Refresh payment methods
      const methodsData = await paymentMethodsAPI.getAll()
      setPaymentMethods(methodsData || [])
      success("Payment method deleted successfully")
    } catch (err) {
      showError(err.message || "Failed to delete payment method")
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <>
      <Helmet>
        <title>Payment Methods - BuyPoint Admin</title>
        <meta name="description" content="Manage payment methods" />
      </Helmet>
      <div className="space-y-6 p-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold">Payment Methods</h1>
            <p className="text-muted-foreground">Manage available payment options for customers</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2" onClick={() => handleOpenDialog()}>
                <Plus className="h-4 w-4" />
                Add Payment Method
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingMethod ? "Edit Payment Method" : "Add Payment Method"}</DialogTitle>
                <DialogDescription>Configure a payment option for your customers</DialogDescription>
              </DialogHeader>

              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Method Name</Label>
                  <Input
                    id="name"
                    placeholder="e.g., Cash on Delivery"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Payment Code</Label>
                  <Select
                    value={formData.code}
                    onValueChange={(v) => setFormData({ ...formData, code: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cod">COD (Cash on Delivery)</SelectItem>
                      <SelectItem value="bank">Bank Transfer</SelectItem>
                      <SelectItem value="momo">Mobile Money</SelectItem>
                      <SelectItem value="card">Card Payment</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Brief description for customers..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Icon</Label>
                  <Select value={formData.icon} onValueChange={(v) => setFormData({ ...formData, icon: v })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {iconOptions.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          <div className="flex items-center gap-2">
                            <opt.icon className="h-4 w-4" />
                            {opt.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="isActive">Active</Label>
                  <Switch
                    id="isActive"
                    checked={formData.isActive}
                    onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                  />
                </div>
              </div>

              <DialogFooter>
                <Button 
                  variant="outline" 
                  onClick={() => setIsDialogOpen(false)}
                  disabled={isSaving}
                >
                  Cancel
                </Button>
                <Button onClick={handleSaveMethod} disabled={isSaving}>
                  {isSaving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    editingMethod ? "Save Changes" : "Add Method"
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Methods</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{paymentMethods.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Active</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-success">{paymentMethods.filter((m) => m.isActive).length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Inactive</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-muted-foreground">
                {paymentMethods.filter((m) => !m.isActive).length}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Payment Methods Table */}
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Payment Method</TableHead>
                  <TableHead>Code</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin text-primary mx-auto" />
                    </TableCell>
                  </TableRow>
                ) : paymentMethods.length > 0 ? (
                  paymentMethods.map((method) => (
                  <TableRow key={method.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                          {getIcon(method.icon)}
                        </div>
                        <span className="font-medium">{method.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{method.code.toUpperCase()}</Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground max-w-xs truncate">{method.description}</TableCell>
                    <TableCell>
                      {method.isActive ? (
                        <Badge className="bg-success text-success-foreground">Active</Badge>
                      ) : (
                        <Badge variant="outline" className="text-muted-foreground">
                          Inactive
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleToggleStatus(method.id)}
                          disabled={togglingId === method.id}
                        >
                          {togglingId === method.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : method.isActive ? (
                            <ToggleRight className="h-4 w-4 text-primary" />
                          ) : (
                            <ToggleLeft className="h-4 w-4" />
                          )}
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleOpenDialog(method)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          onClick={() => handleDeleteMethod(method.id)}
                          disabled={deletingId === method.id}
                        >
                          {deletingId === method.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">
                      <p className="text-muted-foreground">No payment methods found</p>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </>
  )
}

