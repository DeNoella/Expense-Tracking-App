import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Helmet } from "react-helmet-async"
import { ChevronRight, Upload, X, Check, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ImageWithLoader } from "@/components/ui/image-loader"
import { mockOrders } from "@/lib/mock-data"

const refundReasons = [
    { value: "defective", label: "Defective Product" },
    { value: "wrong-item", label: "Wrong Item Received" },
    { value: "not-as-described", label: "Not as Described" },
    { value: "changed-mind", label: "Changed Mind" },
    { value: "other", label: "Other" },
]

export default function ClaimRefundPage() {
    const navigate = useNavigate()
    const [selectedOrder, setSelectedOrder] = useState("")
    const [reason, setReason] = useState("")
    const [description, setDescription] = useState("")
    const [files, setFiles] = useState([])
    const [acceptPolicy, setAcceptPolicy] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [showSuccess, setShowSuccess] = useState(false)
    const [errors, setErrors] = useState({})

    const selectedOrderData = mockOrders.find((o) => o.id === selectedOrder)

    const handleFileChange = (e) => {
        if (e.target.files) {
            const newFiles = Array.from(e.target.files)
            setFiles((prev) => [...prev, ...newFiles].slice(0, 5))
        }
    }

    const removeFile = (index) => {
        setFiles((prev) => prev.filter((_, i) => i !== index))
    }

    const validateForm = () => {
        const newErrors = {}

        if (!selectedOrder) newErrors.order = "Please select an order"
        if (!reason) newErrors.reason = "Please select a reason"
        if (!description.trim()) newErrors.description = "Please provide additional details"
        if (description.length < 20) newErrors.description = "Description must be at least 20 characters"
        if (!acceptPolicy) newErrors.policy = "You must accept the refund policy"

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (!validateForm()) return

        setIsLoading(true)
        await new Promise((resolve) => setTimeout(resolve, 2000))
        setIsLoading(false)
        setShowSuccess(true)
    }

    return (
        <>
            <Helmet>
                <title>Request Refund - BuyPoint</title>
                <meta name="description" content="Submit a refund request" />
            </Helmet>
            <main className="flex-1 bg-muted/30">
                <div className="container mx-auto px-4 py-8">
                    {/* Breadcrumb */}
                    <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
                        <Link to="/" className="hover:text-primary transition-colors">
                            Home
                        </Link>
                        <ChevronRight className="h-4 w-4" />
                        <Link to="/profile" className="hover:text-primary transition-colors">
                            My Account
                        </Link>
                        <ChevronRight className="h-4 w-4" />
                        <span className="text-foreground">Request Refund</span>
                    </nav>

                    <div className="max-w-2xl mx-auto">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-2xl">Request a Refund</CardTitle>
                                <CardDescription>Fill out the form below to submit your refund request</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    {/* Order Selection */}
                                    <div className="space-y-2">
                                        <Label>Select Order</Label>
                                        <Select value={selectedOrder} onValueChange={setSelectedOrder}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Choose an order" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {mockOrders.map((order) => (
                                                    <SelectItem key={order.id} value={order.id}>
                                                        {order.id} - {order.createdAt} - ${order.total.toFixed(2)}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {errors.order && <p className="text-xs text-destructive">{errors.order}</p>}
                                    </div>

                                    {/* Selected Order Preview */}
                                    {selectedOrderData && (
                                        <div className="border rounded-lg p-4 bg-muted/50">
                                            <h4 className="font-medium mb-3">Order Items</h4>
                                            <div className="space-y-3">
                                                {selectedOrderData.items.map((item, i) => (
                                                    <div key={i} className="flex items-center gap-3">
                                                        <div className="relative h-16 w-16 rounded-lg overflow-hidden bg-muted shrink-0">
                                                            <ImageWithLoader
                                                                src={item.image || "/placeholder.svg"}
                                                                alt={item.name}
                                                                fill
                                                                className="object-cover"
                                                            />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="font-medium truncate">{item.name}</p>
                                                            <p className="text-sm text-muted-foreground">
                                                                Qty: {item.quantity} × ${item.price.toFixed(2)}
                                                            </p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Reason */}
                                    <div className="space-y-2">
                                        <Label>Reason for Refund</Label>
                                        <Select value={reason} onValueChange={setReason}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select a reason" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {refundReasons.map((r) => (
                                                    <SelectItem key={r.value} value={r.value}>
                                                        {r.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {errors.reason && <p className="text-xs text-destructive">{errors.reason}</p>}
                                    </div>

                                    {/* Description */}
                                    <div className="space-y-2">
                                        <Label>Additional Details</Label>
                                        <Textarea
                                            placeholder="Please provide additional details about your refund request..."
                                            value={description}
                                            onChange={(e) => setDescription(e.target.value)}
                                            rows={4}
                                        />
                                        <div className="flex justify-between text-xs text-muted-foreground">
                                            {errors.description ? (
                                                <p className="text-destructive">{errors.description}</p>
                                            ) : (
                                                <p>Minimum 20 characters</p>
                                            )}
                                            <p>{description.length} / 500</p>
                                        </div>
                                    </div>

                                    {/* Photo Upload */}
                                    <div className="space-y-2">
                                        <Label>Upload Photos (Optional)</Label>
                                        <div
                                            className="border-2 border-dashed rounded-lg p-6 text-center hover:border-primary/50 transition-colors cursor-pointer"
                                            onClick={() => document.getElementById("file-upload")?.click()}
                                        >
                                            <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                                            <p className="text-sm text-muted-foreground">Drag and drop files here, or click to select</p>
                                            <p className="text-xs text-muted-foreground mt-1">PNG, JPG up to 5MB (max 5 files)</p>
                                            <Input
                                                id="file-upload"
                                                type="file"
                                                accept="image/*"
                                                multiple
                                                className="hidden"
                                                onChange={handleFileChange}
                                            />
                                        </div>

                                        {files.length > 0 && (
                                            <div className="grid grid-cols-5 gap-2 mt-3">
                                                {files.map((file, i) => (
                                                    <div key={i} className="relative aspect-square rounded-lg overflow-hidden bg-muted group">
                                                        <ImageWithLoader
                                                            src={URL.createObjectURL(file) || "/placeholder.svg"}
                                                            alt={`Upload ${i + 1}`}
                                                            fill
                                                            className="object-cover"
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={() => removeFile(i)}
                                                            className="absolute top-1 right-1 h-5 w-5 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                                        >
                                                            <X className="h-3 w-3" />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    {/* Policy Acceptance */}
                                    <div className="space-y-2">
                                        <div className="flex items-start space-x-2">
                                            <Checkbox
                                                id="policy"
                                                checked={acceptPolicy}
                                                onCheckedChange={(checked) => setAcceptPolicy(checked)}
                                                className="mt-0.5"
                                            />
                                            <Label htmlFor="policy" className="text-sm font-normal cursor-pointer leading-relaxed">
                                                I agree to the{" "}
                                                <Link to="#" className="text-primary hover:underline">
                                                    Refund Policy
                                                </Link>{" "}
                                                and understand that my request will be reviewed within 3-5 business days.
                                            </Label>
                                        </div>
                                        {errors.policy && <p className="text-xs text-destructive">{errors.policy}</p>}
                                    </div>

                                    {/* Submit */}
                                    <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
                                        {isLoading ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                Submitting...
                                            </>
                                        ) : (
                                            "Submit Refund Request"
                                        )}
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </main>

            {/* Success Dialog */}
            <Dialog open={showSuccess} onOpenChange={setShowSuccess}>
                <DialogContent>
                    <DialogHeader>
                        <div className="flex justify-center mb-4">
                            <div className="h-16 w-16 rounded-full bg-success/20 flex items-center justify-center">
                                <Check className="h-8 w-8 text-success" />
                            </div>
                        </div>
                        <DialogTitle className="text-center">Refund Request Submitted</DialogTitle>
                        <DialogDescription className="text-center">
                            Your refund request has been submitted successfully.
                            <br />
                            <br />
                            <strong>Refund ID:</strong> REF-{Date.now().toString().slice(-6)}
                            <br />
                            <strong>Estimated Processing:</strong> 3-5 business days
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex gap-3 mt-4">
                        <Button variant="outline" className="flex-1 bg-transparent" asChild>
                            <Link to="/refund/my-refunds">View My Refunds</Link>
                        </Button>
                        <Button className="flex-1" asChild>
                            <Link to="/">Back to Home</Link>
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    )
}

