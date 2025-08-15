"use client"

import * as React from "react"
import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Label } from "@/components/ui/label"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"

interface DatePickerProps {
  value?: Date
  onChange?: (date: Date | undefined) => void
  placeholder?: string
  label?: string
  id?: string
  disabled?: boolean
  fromDate?: Date
  toDate?: Date
  className?: string
  error?: string
}

export function DatePicker({
  value,
  onChange,
  placeholder = "Select date",
  label,
  id,
  disabled = false,
  fromDate,
  toDate,
  className,
  error,
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false)

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      {label && (
        <Label htmlFor={id} className="text-sm font-medium">
          {label}
        </Label>
      )}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            id={id}
            className={cn(
              "w-full justify-start text-left font-normal",
              !value && "text-muted-foreground",
              error && "border-red-500 focus-visible:ring-red-500"
            )}
            disabled={disabled}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {value ? format(value, "PPP") : placeholder}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={value}
            onSelect={(date) => {
              onChange?.(date)
              setOpen(false)
            }}
            disabled={(date) => {
              if (fromDate && date < fromDate) return true
              if (toDate && date > toDate) return true
              return false
            }}
            initialFocus
          />
        </PopoverContent>
      </Popover>
      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}
    </div>
  )
}
