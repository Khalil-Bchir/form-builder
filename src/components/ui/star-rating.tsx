"use client"

import { Star } from "lucide-react"
import { cn } from "@/lib/utils"

interface StarRatingProps {
  value: number
  maxStars?: number
  onChange?: (value: number) => void
  disabled?: boolean
  size?: "sm" | "md" | "lg"
  color?: string
}

export function StarRating({
  value,
  maxStars = 5,
  onChange,
  disabled = false,
  size = "md",
  color,
}: StarRatingProps) {
  const sizeClasses = {
    sm: "size-5",
    md: "size-6",
    lg: "size-8",
  }

  const handleClick = (starValue: number) => {
    if (!disabled && onChange) {
      onChange(starValue)
    }
  }

  const handleMouseEnter = (starValue: number) => {
    if (!disabled && onChange) {
      // Optional: Add hover effect
    }
  }

  return (
    <div className="flex items-center gap-1 sm:gap-1.5">
      {Array.from({ length: maxStars }, (_, index) => {
        const starValue = index + 1
        const isFilled = starValue <= value

        return (
          <button
            key={starValue}
            type="button"
            onClick={() => handleClick(starValue)}
            onMouseEnter={() => handleMouseEnter(starValue)}
            disabled={disabled}
            className={cn(
              "transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 rounded",
              !disabled && "cursor-pointer hover:scale-110 active:scale-95",
              disabled && "cursor-not-allowed"
            )}
            style={{
              color: isFilled ? (color || "var(--color-primary)") : "var(--color-muted-foreground)",
            }}
          >
            <Star
              className={cn(
                sizeClasses[size],
                isFilled ? "fill-current" : "fill-none",
                "transition-all duration-200"
              )}
            />
          </button>
        )
      })}
      {value > 0 && (
        <span className="ml-2 text-sm text-muted-foreground">
          {value}/{maxStars}
        </span>
      )}
    </div>
  )
}
