"use client"

import * as React from "react"
import { Check, ChevronDown, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"

interface Option {
  id: string
  name: string
}

interface CreatableSelectProps {
  options: Option[]
  value: string[]
  onChange: (value: string[]) => void
  onCreateOption: (name: string) => Promise<void>
  placeholder?: string
  loading?: boolean
  multiple?: boolean
  className?: string
}

export function CreatableSelect({
  options,
  value,
  onChange,
  onCreateOption,
  placeholder = "Select options...",
  loading = false,
  multiple = true,
  className,
}: CreatableSelectProps) {
  const [open, setOpen] = React.useState(false)
  const [inputValue, setInputValue] = React.useState("")
  const [creating, setCreating] = React.useState(false)

  const filteredOptions = options.filter((option) =>
    option.name.toLowerCase().includes(inputValue.toLowerCase())
  )

  const isExactMatch = filteredOptions.some(
    (option) => option.name.toLowerCase() === inputValue.toLowerCase()
  )

  const handleSelect = (optionName: string) => {
    if (multiple) {
      const newValue = value.includes(optionName)
        ? value.filter((v) => v !== optionName)
        : [...value, optionName]
      onChange(newValue)
    } else {
      onChange([optionName])
      setOpen(false)
    }
  }

  const handleCreate = async () => {
    if (!inputValue.trim() || isExactMatch || creating) return

    setCreating(true)
    try {
      await onCreateOption(inputValue.trim())
      handleSelect(inputValue.trim())
      setInputValue("")
    } catch (error) {
      console.error("Error creating option:", error)
    } finally {
      setCreating(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && inputValue.trim() && !isExactMatch) {
      e.preventDefault()
      handleCreate()
    }
  }

  const removeValue = (valueToRemove: string) => {
    onChange(value.filter((v) => v !== valueToRemove))
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "w-full justify-between min-h-[40px] h-auto",
            className
          )}
          disabled={loading}
        >
          <div className="flex flex-wrap gap-1 flex-1">
            {value.length === 0 ? (
              <span className="text-muted-foreground">
                {loading ? "Loading..." : placeholder}
              </span>
            ) : (
              value.map((val) => (
                <Badge
                  key={val}
                  variant="secondary"
                  className="text-xs"
                  onClick={(e) => {
                    e.stopPropagation()
                    removeValue(val)
                  }}
                >
                  {val}
                  <X className="ml-1 h-3 w-3 cursor-pointer" />
                </Badge>
              ))
            )}
          </div>
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <div className="p-2">
          <Input
            placeholder="Search or type to create..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            className="mb-2"
          />
        </div>
        <div className="max-h-60 overflow-auto">
          {filteredOptions.length === 0 && !inputValue ? (
            <div className="p-2 text-sm text-muted-foreground">
              No options available
            </div>
          ) : (
            <>
              {filteredOptions.map((option) => (
                <div
                  key={option.id}
                  className={cn(
                    "flex items-center px-2 py-1.5 text-sm cursor-pointer hover:bg-accent",
                    value.includes(option.name) && "bg-accent"
                  )}
                  onClick={() => handleSelect(option.name)}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value.includes(option.name) ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {option.name}
                </div>
              ))}
              {inputValue && !isExactMatch && (
                <div
                  className="flex items-center px-2 py-1.5 text-sm cursor-pointer hover:bg-accent border-t"
                  onClick={handleCreate}
                >
                  <span className="text-muted-foreground mr-2">Create:</span>
                  <span className="font-medium">&quot;{inputValue}&quot;</span>
                  {creating && (
                    <span className="ml-2 text-xs text-muted-foreground">
                      Creating...
                    </span>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}