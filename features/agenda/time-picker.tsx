"use client"

import { CalendarIcon } from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  dayRange,
  formatTime,
  minuteToDate,
  startOfLocalDay,
  STEP_MINUTES,
} from "@/lib/minutes"

const dayLabel = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "short",
})

/**
 * Picks a minute as a local day plus a time of that day, offered every
 * `STEP_MINUTES`. The value is the API's integer; the caller shows it next to
 * the field.
 */
export function TimePicker({
  id,
  value,
  onChange,
  invalid,
}: {
  id: string
  value: number
  onChange: (minute: number) => void
  invalid?: boolean
}) {
  const [open, setOpen] = useState(false)
  const date = minuteToDate(value)
  const day = dayRange(date)
  const offset = value - day.start
  const offsets = Array.from(
    { length: Math.ceil((day.end - day.start) / STEP_MINUTES) },
    (_, i) => i * STEP_MINUTES
  )
  // A booking made through the API directly may sit between the steps.
  if (!offsets.includes(offset)) {
    offsets.push(offset)
    offsets.sort((a, b) => a - b)
  }
  const items = offsets.map((minutes) => ({
    value: String(minutes),
    label: formatTime(day.start + minutes),
  }))

  return (
    <div className="flex gap-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger
          render={
            <Button
              id={id}
              variant="outline"
              className="flex-1 justify-start font-normal"
              aria-invalid={invalid || undefined}
            />
          }
        >
          <CalendarIcon
            data-icon="inline-start"
            className="text-muted-foreground"
          />
          {dayLabel.format(date)}
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={startOfLocalDay(date)}
            defaultMonth={date}
            onSelect={(next) => {
              if (!next) return
              const nextDay = dayRange(next)
              // Keep the time of day; a shorter (DST) day clamps to its last step.
              onChange(
                Math.min(nextDay.start + offset, nextDay.end - STEP_MINUTES)
              )
              setOpen(false)
            }}
          />
        </PopoverContent>
      </Popover>
      <Select
        items={items}
        value={String(offset)}
        onValueChange={(next) =>
          next !== null && onChange(day.start + Number(next))
        }
      >
        <SelectTrigger
          className="w-24"
          aria-label="Horário"
          aria-invalid={invalid || undefined}
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {items.map((item) => (
              <SelectItem key={item.value} value={item.value}>
                {item.label}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  )
}
