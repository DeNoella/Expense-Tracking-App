import * as React from "react"

import { useState } from "react"
import { ImageOff } from "lucide-react"
import { cn } from "@/lib/utils"
import { Spinner } from "./spinner"

export function ImageWithLoader({ src, alt, className, fallback, fill, ...props }) {
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)

  const handleLoad = () => {
    setIsLoading(false)
  }

  const handleError = () => {
    setIsLoading(false)
    setHasError(true)
  }

  if (hasError) {
    return (
      <div className={cn("flex items-center justify-center bg-muted", className)}>
        {fallback || (
          <div className="flex flex-col items-center gap-2 text-muted-foreground">
            <ImageOff className="h-8 w-8" />
            <span className="text-xs">Failed to load</span>
          </div>
        )}
      </div>
    )
  }

  const imageElement = (
    <img
      src={src || "/placeholder.svg"}
      alt={alt}
      className={cn("transition-opacity duration-300", isLoading ? "opacity-0" : "opacity-100", fill ? "w-full h-full object-cover" : "", className)}
      onLoad={handleLoad}
      onError={handleError}
      {...props}
    />
  )

  if (fill) {
    return (
      <div className={cn("relative", className)}>
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-muted z-10">
            <Spinner size="md" />
          </div>
        )}
        {imageElement}
      </div>
    )
  }

  return (
    <div className={cn("relative", className)}>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted z-10">
          <Spinner size="md" />
        </div>
      )}
      {imageElement}
    </div>
  )
}

