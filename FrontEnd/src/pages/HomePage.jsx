import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { Helmet } from "react-helmet-async"
import { ArrowRight, Truck, Shield, RefreshCw, Headphones, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ProductCard } from "@/components/product-card"
import { AnnouncementBanner } from "@/components/announcement-banner"
import { productsAPI, categoriesAPI, announcementsAPI, discountsAPI } from "@/lib/api"

const features = [
  { icon: Truck, title: "Free Shipping", description: "On orders over $50" },
  { icon: Shield, title: "Secure Payment", description: "100% secure checkout" },
  { icon: RefreshCw, title: "Easy Returns", description: "30-day return policy" },
  { icon: Headphones, title: "24/7 Support", description: "Dedicated support" },
]

export default function HomePage() {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [announcements, setAnnouncements] = useState([])
  const [discounts, setDiscounts] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      try {
        const [productsData, categoriesData, announcementsData, discountsData] = await Promise.all([
          productsAPI.getAll().catch(() => []),
          categoriesAPI.getAll().catch(() => []),
          announcementsAPI.getActive().catch(() => []),
          discountsAPI.getAll().catch(() => []),
        ])
        
        setProducts(productsData || [])
        setCategories(categoriesData || [])
        setAnnouncements(announcementsData || [])
        setDiscounts(discountsData || [])
      } catch (err) {
        console.error("Failed to fetch homepage data:", err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  const featuredProducts = products.slice(0, 4)

  return (
    <>
      <Helmet>
        <title>BuyPoint - Your Premium Shopping Destination</title>
        <meta name="description" content="Discover quality products at great prices. Shop electronics, fashion, home goods and more at BuyPoint." />
      </Helmet>
      <AnnouncementBanner announcements={announcements} />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-primary/10 via-background to-background">
          <div className="container mx-auto px-4 py-16 md:py-24">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-balance">
                  Welcome to <span className="text-primary">BuyPoint</span>
                </h1>
                <p className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-lg">
                  Discover quality products at great prices. From electronics to fashion, find everything you need in
                  one place.
                </p>
                <div className="flex flex-wrap gap-4">
                  <Button size="lg" asChild>
                    <Link to="/products">
                      Shop Now
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>
                  </Button>
                  <Button size="lg" variant="outline" asChild>
                    <Link to="/products">Browse Products</Link>
                  </Button>
                </div>
              </div>
              <div className="relative aspect-square lg:aspect-[4/3] rounded-2xl overflow-hidden">
                <img
                  src="/modern-ecommerce-shopping-lifestyle.jpg"
                  alt="Shopping at BuyPoint"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="border-y bg-muted/30">
          <div className="container mx-auto px-4 py-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {features.map((feature) => (
                <div key={feature.title} className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                    <feature.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium text-sm">{feature.title}</h3>
                    <p className="text-xs text-muted-foreground">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Categories */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold">Shop by Category</h2>
                <p className="text-muted-foreground mt-1">Browse our wide selection</p>
              </div>
              <Button variant="ghost" asChild>
                <Link to="/products">
                  View All
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {isLoading ? (
                <div className="col-span-full flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : (
                categories.map((category) => (
                  <Link key={category.id} to={`/products?category=${category.id}`} className="group">
                  <Card className="overflow-hidden transition-all hover:shadow-lg hover:border-primary/50">
                    <div className="aspect-square relative bg-muted">
                      <img
                        src={category.image || "/placeholder.svg"}
                        alt={category.name}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    </div>
                    <CardContent className="p-3 text-center">
                      <h3 className="font-medium text-sm">{category.name}</h3>
                      <p className="text-xs text-muted-foreground">
                        {products.filter(p => (p.categoryId || p.category) === category.id).length} products
                      </p>
                    </CardContent>
                  </Card>
                  </Link>
                ))
              )}
            </div>
          </div>
        </section>

        {/* Featured Products */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold">Featured Products</h2>
                <p className="text-muted-foreground mt-1">Handpicked just for you</p>
              </div>
              <Button variant="ghost" asChild>
                <Link to="/products">
                  View All
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {isLoading ? (
                <div className="col-span-full flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : featuredProducts.length > 0 ? (
                featuredProducts.map((product) => (
                  <ProductCard key={product.id || product.Id} product={product} discounts={discounts} />
                ))
              ) : (
                <div className="col-span-full text-center py-8 text-muted-foreground">
                  No featured products available
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Special Offer Banner */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-primary to-primary/80 text-primary-foreground">
              <div className="absolute inset-0 bg-[url('/abstract-geometric-flow.png')] opacity-10" />
              <div className="relative p-8 md:p-12 lg:p-16">
                <div className="max-w-2xl">
                  <p className="text-sm font-medium uppercase tracking-wider opacity-90">Limited Time Offer</p>
                  <h2 className="text-3xl md:text-4xl font-bold mt-2 mb-4">Holiday Sale — Up to 50% Off</h2>
                  <p className="text-lg opacity-90 mb-6">
                    Don't miss out on our biggest sale of the year. Use code HOLIDAY50 at checkout.
                  </p>
                  <Button size="lg" variant="secondary" asChild>
                    <Link to="/products">
                      Shop the Sale
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Newsletter */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="max-w-xl mx-auto text-center">
              <h2 className="text-2xl md:text-3xl font-bold mb-4">Subscribe to Our Newsletter</h2>
              <p className="text-muted-foreground mb-6">Get the latest updates on new products and upcoming sales.</p>
              <div className="flex gap-3 max-w-md mx-auto">
                <Input type="email" placeholder="Enter your email" className="flex-1" />
                <Button>Subscribe</Button>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  )
}

