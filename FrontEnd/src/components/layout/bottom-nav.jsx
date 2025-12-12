import { Link, useLocation } from "react-router-dom"
import { Home, Grid3X3, ShoppingCart, User, Package } from "lucide-react"
import { cn } from "@/lib/utils"

const navItems = [
  { href: "/", label: "Home", icon: Home },
  { href: "/products", label: "Category", icon: Grid3X3 },
  { href: "/cart", label: "Cart", icon: ShoppingCart, badge: 3 },
  { href: "/orders", label: "Orders", icon: Package },
  { href: "/profile", label: "Account", icon: User },
]

export function BottomNav() {
  const location = useLocation()
  const pathname = location.pathname

  // Don't show on admin pages
  if (pathname.startsWith("/admin")) return null

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background md:hidden">
      <div className="flex items-center justify-around">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href))
          const Icon = item.icon

          return (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                "flex flex-1 flex-col items-center gap-1 py-3 text-xs transition-colors",
                isActive ? "text-primary" : "text-muted-foreground",
              )}
            >
              <div className="relative">
                <Icon className="h-5 w-5" />
                {item.badge && (
                  <span className="absolute -right-2 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-medium text-primary-foreground">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className={cn("font-medium", isActive && "text-primary")}>{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}

