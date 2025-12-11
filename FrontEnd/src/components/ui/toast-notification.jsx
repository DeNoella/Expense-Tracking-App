import * as React from "react"

import { useState, useEffect, createContext, useContext, useCallback } from "react"
import { X, CheckCircle2, AlertCircle, Info } from "lucide-react"
import { cn } from "@/lib/utils"

const ToastContext = createContext(undefined)

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider")
  }
  return context
}

function ToastItem({ toast, onRemove }) {
  const [isExiting, setIsExiting] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsExiting(true)
      setTimeout(() => onRemove(toast.id), 200)
    }, toast.duration || 4000)

    return () => clearTimeout(timer)
  }, [toast.id, toast.duration, onRemove])

  const handleDismiss = () => {
    setIsExiting(true)
    setTimeout(() => onRemove(toast.id), 200)
  }

  const icons = {
    success: <CheckCircle2 className="h-5 w-5 text-success shrink-0" />,
    error: <AlertCircle className="h-5 w-5 text-destructive shrink-0" />,
    info: <Info className="h-5 w-5 text-primary shrink-0" />,
  }

  const bgClasses = {
    success: "border-success/20 bg-success/5",
    error: "border-destructive/20 bg-destructive/5",
    info: "border-primary/20 bg-primary/5",
  }

  return (
    <div
      className={cn(
        "flex items-start gap-3 rounded-lg border p-4 shadow-lg backdrop-blur-sm transition-all duration-200",
        "bg-background",
        bgClasses[toast.type],
        isExiting ? "translate-x-full opacity-0" : "translate-x-0 opacity-100",
      )}
    >
      {icons[toast.type]}
      <p className="flex-1 text-sm font-medium">{toast.message}</p>
      <button onClick={handleDismiss} className="shrink-0 rounded-md p-1 hover:bg-muted transition-colors">
        <X className="h-4 w-4 text-muted-foreground" />
      </button>
    </div>
  )
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const showToast = useCallback((message, type = "info", duration) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    setToasts((prev) => [...prev, { id, message, type, duration }])
  }, [])

  const success = useCallback((message) => showToast(message, "success"), [showToast])
  const error = useCallback((message) => showToast(message, "error"), [showToast])
  const info = useCallback((message) => showToast(message, "info"), [showToast])

  return (
    <ToastContext.Provider value={{ showToast, success, error, info }}>
      {children}
      {/* Toast Container - Fixed position top-right */}
      <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 max-w-sm w-full pointer-events-none">
        {toasts.map((toast) => (
          <div key={toast.id} className="pointer-events-auto">
            <ToastItem toast={toast} onRemove={removeToast} />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

