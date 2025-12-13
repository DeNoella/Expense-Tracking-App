import { useState } from "react"
import { Link } from "react-router-dom"
import { Helmet } from "react-helmet-async"
import {
  ChevronRight,
  ChevronDown,
  Clock,
  CheckCircle,
  XCircle,
  RefreshCw,
  Search,
  FileText,
  Calendar,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { ImageWithLoader } from "@/components/ui/image-loader"
import { products } from "@/lib/mock-data"

const mockRefunds = [
  {
    id: "REF-001",
    orderId: "ORD-001",
    product: products[0],
    amount: 249.99,
    reason: "Defective Product",
    description: "The left earphone stopped working after 2 weeks of normal use.",
    status: "approved",
    createdAt: "2024-12-08",
    updatedAt: "2024-12-09",
    timeline: [
      { date: "2024-12-08", status: "submitted", message: "Refund request submitted" },
      { date: "2024-12-09", status: "reviewed", message: "Request reviewed by support team" },
      { date: "2024-12-09", status: "approved", message: "Refund approved - Processing payment" },
    ],
  },
  {
    id: "REF-002",
    orderId: "ORD-002",
    product: products[2],
    amount: 34.99,
    reason: "Not as Described",
    description: "The color is different from what was shown in the product images.",
    status: "pending",
    createdAt: "2024-12-10",
    updatedAt: "2024-12-10",
    timeline: [{ date: "2024-12-10", status: "submitted", message: "Refund request submitted" }],
  },
  {
    id: "REF-003",
    orderId: "ORD-003",
    product: products[4],
    amount: 59.99,
    reason: "Changed Mind",
    description: "No longer need this product.",
    status: "rejected",
    createdAt: "2024-12-05",
    updatedAt: "2024-12-07",
    timeline: [
      { date: "2024-12-05", status: "submitted", message: "Refund request submitted" },
      { date: "2024-12-07", status: "rejected", message: "Rejected - Product was used beyond return policy" },
    ],
  },
  {
    id: "REF-004",
    orderId: "ORD-004",
    product: products[1],
    amount: 179.99,
    reason: "Wrong Item Received",
    description: "Received a different model than what I ordered.",
    status: "processing",
    createdAt: "2024-12-09",
    updatedAt: "2024-12-10",
    timeline: [
      { date: "2024-12-09", status: "submitted", message: "Refund request submitted" },
      { date: "2024-12-10", status: "processing", message: "Refund approved - Payment being processed" },
    ],
  },
]

const statusConfig = {
  pending: {
    label: "Pending",
    color: "bg-warning text-warning-foreground",
    icon: Clock,
  },
  approved: {
    label: "Approved",
    color: "bg-success text-success-foreground",
    icon: CheckCircle,
  },
  rejected: {
    label: "Rejected",
    color: "bg-destructive text-destructive-foreground",
    icon: XCircle,
  },
  processing: {
    label: "Processing",
    color: "bg-info text-info-foreground",
    icon: RefreshCw,
  },
}

export default function MyRefundsPage() {
  const [filter, setFilter] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [expandedRefund, setExpandedRefund] = useState(null)

  const filteredRefunds = mockRefunds.filter((refund) => {
    const matchesFilter = filter === "all" || refund.status === filter
    const matchesSearch =
      refund.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      refund.orderId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      refund.product.name.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesFilter && matchesSearch
  })

  const stats = {
    total: mockRefunds.length,
    pending: mockRefunds.filter((r) => r.status === "pending").length,
    approved: mockRefunds.filter((r) => r.status === "approved").length,
    rejected: mockRefunds.filter((r) => r.status === "rejected").length,
    processing: mockRefunds.filter((r) => r.status === "processing").length,
  }

  return (
    <>
      <Helmet>
        <title>My Refunds - BuyPoint</title>
        <meta name="description" content="Track and manage your refund requests" />
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
            <span className="text-foreground">My Refunds</span>
          </nav>

          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold">My Refunds</h1>
              <p className="text-muted-foreground mt-1">Track and manage your refund requests</p>
            </div>
            <Button asChild>
              <Link to="/refund/claim">Request Refund</Link>
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-sm text-muted-foreground">Total</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold text-warning">{stats.pending}</p>
                <p className="text-sm text-muted-foreground">Pending</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold text-success">{stats.approved}</p>
                <p className="text-sm text-muted-foreground">Approved</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold text-info">{stats.processing}</p>
                <p className="text-sm text-muted-foreground">Processing</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold text-destructive">{stats.rejected}</p>
                <p className="text-sm text-muted-foreground">Rejected</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                {/* Filter Tabs */}
                <Tabs value={filter} onValueChange={setFilter}>
                  <TabsList>
                    <TabsTrigger value="all">All</TabsTrigger>
                    <TabsTrigger value="pending">Pending</TabsTrigger>
                    <TabsTrigger value="approved">Approved</TabsTrigger>
                    <TabsTrigger value="processing">Processing</TabsTrigger>
                    <TabsTrigger value="rejected">Rejected</TabsTrigger>
                  </TabsList>
                </Tabs>

                {/* Search */}
                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by ID or product..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {filteredRefunds.length > 0 ? (
                <div className="space-y-4">
                  {filteredRefunds.map((refund) => {
                    const status = statusConfig[refund.status]
                    const StatusIcon = status.icon
                    const isExpanded = expandedRefund === refund.id

                    return (
                      <Collapsible
                        key={refund.id}
                        open={isExpanded}
                        onOpenChange={() => setExpandedRefund(isExpanded ? null : refund.id)}
                      >
                        <div className="border rounded-lg overflow-hidden">
                          <CollapsibleTrigger className="w-full">
                            <div className="p-4 flex items-center gap-4 hover:bg-muted/50 transition-colors">
                              {/* Product Image */}
                              <div className="relative h-16 w-16 rounded-lg overflow-hidden bg-muted shrink-0">
                                <ImageWithLoader
                                  src={refund.product.image || "/placeholder.svg"}
                                  alt={refund.product.name}
                                  fill
                                  className="object-cover"
                                />
                              </div>

                              {/* Details */}
                              <div className="flex-1 min-w-0 text-left">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="font-medium">{refund.id}</span>
                                  <Badge className={status.color}>
                                    <StatusIcon className="h-3 w-3 mr-1" />
                                    {status.label}
                                  </Badge>
                                </div>
                                <p className="text-sm text-muted-foreground truncate">{refund.product.name}</p>
                                <p className="text-xs text-muted-foreground">Order: {refund.orderId}</p>
                              </div>

                              {/* Amount */}
                              <div className="text-right shrink-0">
                                <p className="text-lg font-bold">${refund.amount.toFixed(2)}</p>
                                <p className="text-xs text-muted-foreground">{refund.reason}</p>
                              </div>

                              {/* Expand Icon */}
                              <ChevronDown
                                className={`h-5 w-5 text-muted-foreground transition-transform ${isExpanded ? "rotate-180" : ""}`}
                              />
                            </div>
                          </CollapsibleTrigger>

                          <CollapsibleContent>
                            <div className="border-t p-4 bg-muted/30 space-y-4">
                              {/* Description */}
                              <div>
                                <h4 className="text-sm font-medium mb-1">Description</h4>
                                <p className="text-sm text-muted-foreground">{refund.description}</p>
                              </div>

                              {/* Dates */}
                              <div className="flex gap-6 text-sm">
                                <div className="flex items-center gap-2">
                                  <Calendar className="h-4 w-4 text-muted-foreground" />
                                  <span className="text-muted-foreground">Requested:</span>
                                  <span>{refund.createdAt}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <FileText className="h-4 w-4 text-muted-foreground" />
                                  <span className="text-muted-foreground">Updated:</span>
                                  <span>{refund.updatedAt}</span>
                                </div>
                              </div>

                              {/* Timeline */}
                              <div>
                                <h4 className="text-sm font-medium mb-3">Timeline</h4>
                                <div className="relative pl-6 space-y-4">
                                  {refund.timeline.map((event, i) => (
                                    <div key={i} className="relative">
                                      <div className="absolute -left-6 top-0.5 h-3 w-3 rounded-full bg-primary" />
                                      {i < refund.timeline.length - 1 && (
                                        <div className="absolute -left-[18px] top-3 h-full w-0.5 bg-border" />
                                      )}
                                      <p className="text-sm font-medium">{event.message}</p>
                                      <p className="text-xs text-muted-foreground">{event.date}</p>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </CollapsibleContent>
                        </div>
                      </Collapsible>
                    )
                  })}
                </div>
              ) : (
                <div className="text-center py-16">
                  <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="font-medium mb-2">No refunds found</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    {searchQuery ? "Try adjusting your search" : "You haven't requested any refunds yet"}
                  </p>
                  <Button asChild>
                    <Link to="/refund/claim">Request Refund</Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  )
}

