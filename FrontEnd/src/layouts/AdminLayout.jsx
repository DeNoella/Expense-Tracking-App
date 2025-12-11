import { Outlet, Navigate } from "react-router-dom"
import { Helmet } from "react-helmet-async"
import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { useAuth } from "@/contexts/AuthContext"

export default function AdminLayout() {
  const { isAuthenticated, isLoading, isAdmin, user } = useAuth()

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  // Show error message if not admin (instead of silent redirect)
  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center max-w-md p-6">
          <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
          <p className="text-muted-foreground mb-4">
            You don't have permission to access the admin dashboard.
          </p>
          <p className="text-sm text-muted-foreground mb-4">
            Debug info: isAdmin={String(isAdmin)}, HasAdminPermissions={user?.HasAdminPermissions || user?.hasAdminPermissions || 'undefined'}
          </p>
          <a href="/" className="text-primary hover:underline">Return to Home</a>
        </div>
      </div>
    )
  }

  return (
    <>
      <Helmet>
        <title>BuyPoint Admin Dashboard</title>
        <meta name="description" content="Admin panel for BuyPoint e-commerce platform." />
      </Helmet>
      <div className="min-h-screen flex">
        <AdminSidebar />
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </>
  )
}

