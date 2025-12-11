import { useState } from "react"
import { X, Info, AlertTriangle, CheckCircle, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"

const typeStyles = {
  info: "bg-info text-info-foreground",
  warning: "bg-warning text-warning-foreground",
  success: "bg-success text-success-foreground",
  error: "bg-destructive text-destructive-foreground",
}

const typeIcons = {
  info: Info,
  warning: AlertTriangle,
  success: CheckCircle,
  error: AlertCircle,
}

export function AnnouncementBanner({ announcements }) {
  const [dismissed, setDismissed] = useState([])

  const activeAnnouncements = announcements.filter((a) => a.status === "active" && !dismissed.includes(a.id))

  if (activeAnnouncements.length === 0) return null

  return (
    <div className="space-y-0">
      {activeAnnouncements.map((announcement) => {
        const Icon = typeIcons[announcement.type]
        return (
          <div key={announcement.id} className={`${typeStyles[announcement.type]} px-4 py-2`}>
            <div className="container mx-auto flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Icon className="h-4 w-4 shrink-0" />
                <p className="text-sm font-medium">
                  <span className="font-semibold">{announcement.title}</span>
                  {" — "}
                  {announcement.message}
                </p>
              </div>
              {announcement.dismissible && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 shrink-0 hover:bg-background/20"
                  onClick={() => setDismissed([...dismissed, announcement.id])}
                >
                  <X className="h-4 w-4" />
                  <span className="sr-only">Dismiss</span>
                </Button>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

