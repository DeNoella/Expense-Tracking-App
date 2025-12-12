import { Link, useLocation } from "react-router-dom"
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  RefreshCw,
  Megaphone,
  BarChart3,
  Activity,
  Users,
  Settings,
  ChevronLeft,
  Menu,
  Tag,
  CreditCard,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useState } from "react"

const navItems = [
  { href: "/admin", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/admin/products", icon: Package, label: "Products" },
  { href: "/admin/orders", icon: ShoppingCart, label: "Orders" },
  { href: "/admin/refunds", icon: RefreshCw, label: "Refunds" },
  { href: "/admin/discounts", icon: Tag, label: "Discounts" },
  { href: "/admin/payment-methods", icon: CreditCard, label: "Payments" },
  { href: "/admin/announcements", icon: Megaphone, label: "Announcements" },
  { href: "/admin/analytics", icon: BarChart3, label: "Analytics" },
  { href: "/admin/system", icon: Activity, label: "System Status" },
  { href: "/admin/users", icon: Users, label: "Users" },
]

export function AdminSidebar() {
  const location = useLocation()
  const pathname = location.pathname
  const [collapsed, setCollapsed] = useState(false)

  return (
    <>
      {/* Mobile Header */}
      <div className="lg:hidden sticky top-0 z-40 flex h-14 items-center gap-4 border-b bg-background px-4">
        <Button variant="ghost" size="icon" onClick={() => setCollapsed(!collapsed)}>
          <Menu className="h-5 w-5" />
        </Button>
        <Link to="/admin" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <Package className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="font-bold">BuyPoint Admin</span>
        </Link>
      </div>

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex flex-col border-r bg-card transition-all duration-300",
          collapsed ? "w-16" : "w-64",
          "lg:sticky lg:top-0 lg:h-screen",
          "max-lg:translate-x-[-100%]",
          collapsed && "max-lg:translate-x-0",
        )}
      >
        {/* Logo */}
        <div className="flex h-14 items-center justify-between border-b px-4">
          <Link to="/admin" className={cn("flex items-center gap-2", collapsed && "lg:hidden")}>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary shrink-0">
              <Package className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-bold">BuyPoint</span>
          </Link>
          <Link to="/admin" className={cn("hidden", collapsed && "lg:block")}>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <Package className="h-5 w-5 text-primary-foreground" />
            </div>
          </Link>
          <Button
            variant="ghost"
            size="icon"
            className="hidden lg:flex h-8 w-8"
            onClick={() => setCollapsed(!collapsed)}
          >
            <ChevronLeft className={cn("h-4 w-4 transition-transform", collapsed && "rotate-180")} />
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-auto p-2">
          <ul className="space-y-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href))
              return (
                <li key={item.href}>
                  <Link
                    to={item.href}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground",
                      collapsed && "lg:justify-center lg:px-2",
                    )}
                    title={collapsed ? item.label : undefined}
                  >
                    <item.icon className="h-5 w-5 shrink-0" />
                    <span className={cn(collapsed && "lg:hidden")}>{item.label}</span>
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>

        {/* Footer */}
        <div className="border-t p-2">
          <Link
            to="/"
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors",
              collapsed && "lg:justify-center lg:px-2",
            )}
          >
            <Settings className="h-5 w-5 shrink-0" />
            <span className={cn(collapsed && "lg:hidden")}>Back to Store</span>
          </Link>
        </div>
      </aside>

      {/* Mobile Overlay */}
      {collapsed && <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setCollapsed(false)} />}
    </>
  )
}

