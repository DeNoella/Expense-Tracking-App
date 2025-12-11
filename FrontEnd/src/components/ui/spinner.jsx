import * as React from "react"
import { Loader2Icon } from "lucide-react"
import { cn } from "@/lib/utils"

const sizeClasses = {
  sm: "size-4",
  md: "size-6",
  lg: "size-8",
}

function Spinner({ className, size = "md", ...props }) {
  return (
    <Loader2Icon
      role="status"
      aria-label="Loading"
      className={cn("animate-spin", sizeClasses[size], className)}
      {...props}
    />
  )
}

// Button spinner - small inline spinner for buttons
function ButtonSpinner({ className, ...props }) {
  return <Loader2Icon role="status" aria-label="Loading" className={cn("size-4 animate-spin", className)} {...props} />
}

// Centered spinner for full-page or section loading
function CenteredSpinner({ size = "lg", className }) {
  return (
    <div className={cn("flex items-center justify-center py-12", className)}>
      <Spinner size={size} />
    </div>
  )
}

// Full page spinner overlay
function PageSpinner() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <Spinner size="lg" />
    </div>
  )
}

export { Spinner, ButtonSpinner, CenteredSpinner, PageSpinner }

