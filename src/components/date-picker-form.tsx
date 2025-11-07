"use client"

import * as React from "react"
import { format } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

type DatePickerProps = {
  date: Date | undefined
  setDate: (date: Date | undefined) => void
}

export function DatePicker({ date, setDate }: DatePickerProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "w-full justify-start text-left font-normal",
            !date && "text-muted-foreground"
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? format(date, "PPP") : <span>Pick a date</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <Calendar
          mode="single"
          selected={date}
          onSelect={setDate}
          initialFocus
          disabled={(day) => {
            const today = new Date();
            const oneYearFromNow = new Date(today.setFullYear(today.getFullYear() + 1));
            oneYearFromNow.setHours(0, 0, 0, 0); // Start of the day
            const tenYearsFromNow = new Date(today.setFullYear(today.getFullYear() + 9)); // was already +1, so add 9 more
            tenYearsFromNow.setHours(23, 59, 59, 999); // End of the day

            return day < oneYearFromNow || day > tenYearsFromNow;
          }}
        />
      </PopoverContent>
    </Popover>
  )
}
