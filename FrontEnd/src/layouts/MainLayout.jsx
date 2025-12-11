import { Outlet } from "react-router-dom"
import { Helmet } from "react-helmet-async"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { BottomNav } from "@/components/layout/bottom-nav"

export default function MainLayout() {
  return (
    <>
      <Helmet>
        <title>BuyPoint - Your Premium Shopping Destination</title>
        <meta
          name="description"
          content="Discover quality products at great prices. Shop electronics, fashion, home goods and more at BuyPoint."
        />
      </Helmet>
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1">
          <Outlet />
        </main>
        <Footer />
        <BottomNav />
      </div>
    </>
  )
}

