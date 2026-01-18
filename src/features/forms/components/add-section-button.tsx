"use client"

import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"

interface AddSectionButtonProps {
  onAdd: () => void
  className?: string
}

export function AddSectionButton({ onAdd, className }: AddSectionButtonProps) {
  return (
    <div className={className}>
      <div className="flex items-center gap-4 my-6">
        <div className="flex-1 border-t border-border" />
        <Button
          variant="outline"
          onClick={onAdd}
          className="flex items-center gap-2"
        >
          <Plus className="size-4" />
          Ajouter une section
        </Button>
        <div className="flex-1 border-t border-border" />
      </div>
    </div>
  )
}
