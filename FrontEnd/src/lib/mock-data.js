export const categories = [
  { id: "electronics", name: "Electronics", image: "/electronics-gadgets.png", productCount: 156 },
  { id: "fashion", name: "Fashion", image: "/diverse-fashion-collection.png", productCount: 234 },
  { id: "home", name: "Home & Garden", image: "/home-garden-decor.jpg", productCount: 89 },
  { id: "sports", name: "Sports & Outdoors", image: "/assorted-sports-gear.png", productCount: 67 },
  { id: "beauty", name: "Beauty & Health", image: "/beauty-skincare-products.jpg", productCount: 112 },
  { id: "books", name: "Books & Media", image: "/books-library.jpg", productCount: 203 },
]

export const products = [
  {
    id: "1",
    name: "Wireless Noise-Canceling Headphones",
    description:
      "Premium over-ear headphones with active noise cancellation, 30-hour battery life, and crystal-clear audio quality.",
    price: 249.99,
    originalPrice: 299.99,
    image: "/wireless-headphones-premium-black.jpg",
    category: "electronics",
    rating: 4.8,
    reviewCount: 1234,
    stock: 45,
    brand: "AudioPro",
    tags: ["wireless", "noise-canceling", "premium"],
  },
  {
    id: "2",
    name: "Smart Fitness Watch Pro",
    description: "Advanced fitness tracker with heart rate monitoring, GPS, sleep tracking, and 7-day battery life.",
    price: 179.99,
    originalPrice: 219.99,
    image: "/smart-watch-fitness-tracker-black.jpg",
    category: "electronics",
    rating: 4.6,
    reviewCount: 892,
    stock: 78,
    brand: "FitTech",
    tags: ["fitness", "smartwatch", "health"],
  },
  {
    id: "3",
    name: "Organic Cotton T-Shirt",
    description: "Soft, breathable organic cotton t-shirt. Sustainably made with eco-friendly dyes.",
    price: 34.99,
    image: "/organic-cotton-tshirt-white-minimal.jpg",
    category: "fashion",
    rating: 4.5,
    reviewCount: 567,
    stock: 234,
    brand: "EcoWear",
    tags: ["organic", "sustainable", "casual"],
  },
  {
    id: "4",
    name: "Minimalist Desk Lamp",
    description: "Modern LED desk lamp with adjustable brightness, color temperature, and wireless charging base.",
    price: 89.99,
    originalPrice: 109.99,
    image: "/modern-desk-lamp-minimalist-white.jpg",
    category: "home",
    rating: 4.7,
    reviewCount: 345,
    stock: 56,
    brand: "LumiDesign",
    tags: ["lighting", "modern", "workspace"],
  },
  {
    id: "5",
    name: "Professional Yoga Mat",
    description: "Extra-thick eco-friendly yoga mat with non-slip surface and alignment guides.",
    price: 59.99,
    image: "/yoga-mat-purple-professional.jpg",
    category: "sports",
    rating: 4.9,
    reviewCount: 1567,
    stock: 123,
    brand: "ZenFit",
    tags: ["yoga", "fitness", "eco-friendly"],
  },
  {
    id: "6",
    name: "Vitamin C Brightening Serum",
    description: "Powerful antioxidant serum with 20% vitamin C for radiant, even-toned skin.",
    price: 45.99,
    originalPrice: 54.99,
    image: "/vitamin-c-serum-skincare-bottle.jpg",
    category: "beauty",
    rating: 4.4,
    reviewCount: 789,
    stock: 89,
    brand: "GlowLab",
    tags: ["skincare", "anti-aging", "brightening"],
  },
  {
    id: "7",
    name: "Portable Bluetooth Speaker",
    description: "Waterproof portable speaker with 360° sound, 24-hour playback, and built-in microphone.",
    price: 79.99,
    image: "/bluetooth-speaker-portable-black.jpg",
    category: "electronics",
    rating: 4.5,
    reviewCount: 456,
    stock: 67,
    brand: "SoundWave",
    tags: ["audio", "portable", "waterproof"],
  },
  {
    id: "8",
    name: "Leather Crossbody Bag",
    description: "Genuine leather crossbody bag with adjustable strap and multiple compartments.",
    price: 129.99,
    originalPrice: 159.99,
    image: "/leather-crossbody-bag-brown.jpg",
    category: "fashion",
    rating: 4.7,
    reviewCount: 234,
    stock: 34,
    brand: "CraftLeather",
    tags: ["leather", "accessories", "premium"],
  },
]

export const mockDiscounts = [
  {
    id: "disc-1",
    name: "Holiday Sale",
    type: "percentage",
    value: 20,
    applicableTo: "all",
    startDate: "2024-12-01",
    endDate: "2024-12-31",
    status: "active",
  },
  {
    id: "disc-2",
    name: "Electronics Flash Sale",
    type: "percentage",
    value: 15,
    applicableTo: "category",
    categoryId: "electronics",
    startDate: "2024-12-10",
    endDate: "2024-12-20",
    status: "active",
  },
  {
    id: "disc-3",
    name: "New Year Special",
    type: "fixed",
    value: 10,
    applicableTo: "all",
    startDate: "2025-01-01",
    endDate: "2025-01-07",
    minPurchase: 50,
    status: "scheduled",
  },
  {
    id: "disc-4",
    name: "Headphones Deal",
    type: "percentage",
    value: 25,
    applicableTo: "product",
    productId: "1",
    startDate: "2024-12-01",
    endDate: "2024-12-15",
    maxDiscount: 75,
    status: "active",
  },
]

export const mockPaymentMethods = [
  {
    id: "pm-1",
    name: "Cash on Delivery",
    code: "cod",
    description: "Pay when you receive your order",
    isActive: true,
    icon: "banknote",
  },
  {
    id: "pm-2",
    name: "Bank Transfer",
    code: "bank",
    description: "Transfer directly to our bank account",
    isActive: false,
    icon: "building",
  },
  {
    id: "pm-3",
    name: "Mobile Money",
    code: "momo",
    description: "Pay with your mobile money wallet",
    isActive: false,
    icon: "smartphone",
  },
]

export const mockOrderTracking = {
  id: "track-1",
  orderNumber: "ORD-2024-001234",
  orderDate: "2024-12-05",
  total: 329.97,
  currentStatus: "In Transit",
  paymentMethod: "cod",
  paymentStatus: "pending",
  trackingNumber: "TRK-9876543210",
  estimatedDelivery: "2024-12-12",
  steps: [
    {
      id: "step-1",
      name: "Order Placed",
      description: "Your order has been successfully placed",
      status: "completed",
      timestamp: "2024-12-05 10:30 AM",
    },
    {
      id: "step-2",
      name: "Payment on Delivery",
      description: "Cash on Delivery - Payment will be collected upon delivery",
      status: "completed",
      timestamp: "2024-12-05 10:30 AM",
    },
    {
      id: "step-3",
      name: "Processing",
      description: "Your order is being prepared",
      status: "completed",
      timestamp: "2024-12-06 09:15 AM",
      adminNote: "Items verified and packed",
    },
    {
      id: "step-4",
      name: "Shipped",
      description: "Your order has been shipped",
      status: "completed",
      timestamp: "2024-12-07 02:45 PM",
      adminNote: "Handed to delivery partner",
    },
    {
      id: "step-5",
      name: "In Transit",
      description: "Your order is on its way",
      status: "active",
      timestamp: "2024-12-08 08:00 AM",
    },
    {
      id: "step-6",
      name: "Out for Delivery",
      description: "Your order is out for delivery",
      status: "pending",
    },
    {
      id: "step-7",
      name: "Delivered",
      description: "Your order has been delivered",
      status: "pending",
    },
  ],
  items: [
    { ...products[0], quantity: 1 },
    { ...products[4], quantity: 1 },
  ],
  shippingAddress: {
    name: "John Doe",
    phone: "+1 234 567 8900",
    address: "123 Main Street, Apt 4B",
    city: "New York",
    country: "USA",
    postalCode: "10001",
    instructions: "Please leave at the front door if not home",
  },
}

export const mockOrders = [
  {
    id: "ORD-001",
    userId: "user-1",
    items: [{ ...products[0], quantity: 1 }],
    total: 249.99,
    status: "delivered",
    paymentStatus: "paid",
    createdAt: "2024-12-01",
    shippingAddress: {
      name: "John Doe",
      address: "123 Main St",
      city: "New York",
      country: "USA",
      postalCode: "10001",
    },
  },
  {
    id: "ORD-002",
    userId: "user-1",
    items: [
      { ...products[2], quantity: 2 },
      { ...products[4], quantity: 1 },
    ],
    total: 129.97,
    status: "shipped",
    paymentStatus: "paid",
    createdAt: "2024-12-05",
    shippingAddress: {
      name: "John Doe",
      address: "123 Main St",
      city: "New York",
      country: "USA",
      postalCode: "10001",
    },
  },
]

export const mockRefunds = [
  {
    id: "REF-001",
    orderId: "ORD-001",
    userId: "user-1",
    productId: "1",
    amount: 249.99,
    reason: "Defective Product",
    description: "The left earphone stopped working after 2 weeks.",
    status: "approved",
    createdAt: "2024-12-08",
    updatedAt: "2024-12-09",
  },
]

export const mockAnnouncements = [
  {
    id: "ANN-001",
    title: "Holiday Sale!",
    message: "Get up to 50% off on selected items. Use code HOLIDAY50 at checkout.",
    type: "success",
    status: "active",
    visibility: "public",
    startDate: "2024-12-01T00:00:00",
    endDate: "2024-12-31T23:59:59",
    priority: "high",
    dismissible: true,
  },
  {
    id: "ANN-002",
    title: "Shipping Delays",
    message: "Due to high demand, some orders may experience 2-3 day delays.",
    type: "warning",
    status: "active",
    visibility: "public",
    startDate: "2024-12-15T00:00:00",
    endDate: null,
    priority: "medium",
    dismissible: true,
  },
  {
    id: "ANN-003",
    title: "New Payment Methods Available",
    message: "We now accept Apple Pay and Google Pay for faster checkout!",
    type: "info",
    status: "active",
    visibility: "public",
    startDate: "2024-12-01T00:00:00",
    endDate: null,
    priority: "low",
    dismissible: true,
  },
  {
    id: "ANN-004",
    title: "Scheduled Maintenance",
    message: "Our site will be undergoing maintenance on December 20th from 2-4 AM EST.",
    type: "warning",
    status: "scheduled",
    visibility: "public",
    startDate: "2024-12-20T02:00:00",
    endDate: "2024-12-20T04:00:00",
    priority: "medium",
    dismissible: false,
  },
  {
    id: "ANN-005",
    title: "Flash Sale Ended",
    message: "Thank you for participating in our flash sale!",
    type: "success",
    status: "expired",
    visibility: "public",
    startDate: "2024-11-01T00:00:00",
    endDate: "2024-11-02T23:59:59",
    priority: "high",
    dismissible: true,
  },
]

export function getProductDiscount(product, discounts) {
  if (!discounts || discounts.length === 0) return null

  const now = new Date()
  
  // Filter active discounts and check date validity
  const activeDiscounts = discounts.filter((d) => {
    // Check status (support both string and enum values)
    const status = d.status || d.Status
    if (status !== "active" && status !== 0 && status !== "Active") return false
    
    // Check date range
    const startDate = d.startDate || d.StartDate
    const endDate = d.endDate || d.EndDate
    
    if (startDate && new Date(startDate) > now) return false
    if (endDate && new Date(endDate) < now) return false
    
    return true
  })

  if (activeDiscounts.length === 0) return null

  const productId = product.id || product.Id
  const productCategory = product.category || product.Category || product.categoryId || product.CategoryId

  // Check product-specific discount first
  const productDiscount = activeDiscounts.find(
    (d) => {
      const applicableTo = d.applicableTo || d.ApplicableTo
      if (applicableTo !== "product" && applicableTo !== 2) return false
      
      const discountProductId = d.productId || d.ProductId
      return discountProductId === productId
    }
  )
  if (productDiscount) return productDiscount

  // Check category discount
  const categoryDiscount = activeDiscounts.find(
    (d) => {
      const applicableTo = d.applicableTo || d.ApplicableTo
      if (applicableTo !== "category" && applicableTo !== 1) return false
      
      const discountCategory = d.category || d.Category || d.categoryId || d.CategoryId
      // Support both enum values and IDs
      return discountCategory === productCategory || 
             (typeof discountCategory === 'number' && typeof productCategory === 'number' && discountCategory === productCategory)
    }
  )
  if (categoryDiscount) return categoryDiscount

  // Check all-products discount
  const allDiscount = activeDiscounts.find((d) => {
    const applicableTo = d.applicableTo || d.ApplicableTo
    return applicableTo === "all" || applicableTo === 0
  })
  if (allDiscount) return allDiscount

  return null
}

export function calculateDiscountedPrice(price, discount) {
  if (!discount) return { finalPrice: price, savings: 0 }

  // Support both camelCase and PascalCase from backend
  const discountType = discount.type || discount.Type
  const discountValue = discount.value || discount.Value
  const maxDiscount = discount.maxDiscount || discount.MaxDiscount

  let savings = 0
  if (discountType === "percentage" || discountType === 0) {
    savings = (price * discountValue) / 100
    if (maxDiscount && savings > maxDiscount) {
      savings = maxDiscount
    }
  } else {
    // Fixed amount discount
    savings = discountValue
  }

  return {
    finalPrice: Math.max(0, price - savings),
    savings,
  }
}

