"use client";

import * as React from "react";
import { format, parse, isValid } from "date-fns";
import { id } from "date-fns/locale";
import {
  CalendarIcon,
  ClockIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";
import { DayPicker } from "react-day-picker";
import "react-day-picker/style.css";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface DateTimePickerProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function DateTimePicker({
  value,
  onChange,
  placeholder = "Pilih tanggal & waktu",
  className,
}: DateTimePickerProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>();
  const [hours, setHours] = React.useState("00");
  const [minutes, setMinutes] = React.useState("00");

  // Parse initial value
  React.useEffect(() => {
    if (value) {
      const parsed = parse(value, "yyyy-MM-dd'T'HH:mm", new Date());
      if (isValid(parsed)) {
        setSelectedDate(parsed);
        setHours(format(parsed, "HH"));
        setMinutes(format(parsed, "mm"));
      }
    } else {
      setSelectedDate(undefined);
      setHours("00");
      setMinutes("00");
    }
  }, [value]);

  // Update parent value when date/time changes
  const updateValue = (date: Date | undefined, h: string, m: string) => {
    if (date) {
      const newDate = new Date(date);
      newDate.setHours(parseInt(h, 10), parseInt(m, 10), 0, 0);
      onChange(format(newDate, "yyyy-MM-dd'T'HH:mm"));
    } else {
      onChange("");
    }
  };

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
    updateValue(date, hours, minutes);
  };

  const handleHoursChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const h = e.target.value;
    setHours(h);
    updateValue(selectedDate, h, minutes);
  };

  const handleMinutesChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const m = e.target.value;
    setMinutes(m);
    updateValue(selectedDate, hours, m);
  };

  const handleClear = () => {
    setSelectedDate(undefined);
    setHours("00");
    setMinutes("00");
    onChange("");
  };

  const displayValue = selectedDate
    ? `${format(selectedDate, "dd MMM yyyy", { locale: id })} ${hours}:${minutes}`
    : "";

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            "w-full flex items-center justify-between px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-pln-primary focus:border-pln-primary transition-colors",
            !selectedDate && "text-slate-400 dark:text-slate-500",
            className,
          )}
        >
          <span className="flex items-center gap-2">
            <CalendarIcon className="h-4 w-4 text-slate-400" />
            {displayValue || placeholder}
          </span>
          {selectedDate && (
            <span className="flex items-center gap-1 text-xs text-slate-500">
              <ClockIcon className="h-3.5 w-3.5" />
              {hours}:{minutes}
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent
        className="w-auto p-0 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl"
        align="start"
      >
        <div className="p-4">
          {/* Calendar with custom styling */}
          <style>{`
            .rdp {
              --rdp-cell-size: 36px;
              --rdp-accent-color: #035B71;
              --rdp-background-color: #035B71;
              margin: 0;
            }
            .rdp-month_caption {
              display: flex;
              justify-content: center;
              padding: 0.5rem 0;
              font-weight: 600;
              color: #1e293b;
            }
            .dark .rdp-month_caption {
              color: #f1f5f9;
            }
            .rdp-weekdays {
              display: grid;
              grid-template-columns: repeat(7, 1fr);
              gap: 0;
            }
            .rdp-weekday {
              width: 36px;
              height: 36px;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 0.75rem;
              font-weight: 500;
              color: #64748b;
            }
            .rdp-weeks {
              display: flex;
              flex-direction: column;
            }
            .rdp-week {
              display: grid;
              grid-template-columns: repeat(7, 1fr);
              gap: 0;
            }
            .rdp-day {
              width: 36px;
              height: 36px;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 0.875rem;
              border-radius: 0.5rem;
              cursor: pointer;
              transition: all 0.15s;
            }
            .rdp-day:hover {
              background-color: #f1f5f9;
            }
            .dark .rdp-day:hover {
              background-color: #334155;
            }
            .rdp-day_button {
              width: 100%;
              height: 100%;
              display: flex;
              align-items: center;
              justify-content: center;
              border: none;
              background: none;
              cursor: pointer;
              border-radius: 0.5rem;
            }
            .rdp-selected .rdp-day_button {
              background-color: #035B71 !important;
              color: white !important;
            }
            .rdp-today .rdp-day_button {
              background-color: #e2e8f0;
              font-weight: 600;
            }
            .dark .rdp-today .rdp-day_button {
              background-color: #475569;
            }
            .rdp-outside .rdp-day_button {
              color: #cbd5e1;
            }
            .dark .rdp-outside .rdp-day_button {
              color: #475569;
            }
            .rdp-nav {
              display: flex;
              gap: 0.25rem;
            }
            .rdp-button_previous,
            .rdp-button_next {
              width: 28px;
              height: 28px;
              display: flex;
              align-items: center;
              justify-content: center;
              border-radius: 0.375rem;
              border: none;
              background: transparent;
              cursor: pointer;
              color: #64748b;
            }
            .rdp-button_previous:hover,
            .rdp-button_next:hover {
              background-color: #f1f5f9;
            }
            .dark .rdp-button_previous:hover,
            .dark .rdp-button_next:hover {
              background-color: #334155;
            }
            .rdp-caption_label {
              font-size: 0.875rem;
              font-weight: 600;
            }
            .rdp-chevron {
              width: 16px;
              height: 16px;
            }
          `}</style>

          <DayPicker
            mode="single"
            selected={selectedDate}
            onSelect={handleDateSelect}
            locale={id}
            showOutsideDays
          />

          {/* Time Picker */}
          <div className="border-t border-slate-200 dark:border-slate-700 mt-4 pt-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
                <ClockIcon className="h-4 w-4" />
                Waktu
              </span>
              <div className="flex items-center gap-2">
                <select
                  value={hours}
                  onChange={handleHoursChange}
                  className="w-16 px-2 py-1.5 text-sm text-center border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-pln-primary focus:outline-none"
                >
                  {Array.from({ length: 24 }, (_, i) => (
                    <option key={i} value={String(i).padStart(2, "0")}>
                      {String(i).padStart(2, "0")}
                    </option>
                  ))}
                </select>
                <span className="text-slate-500 font-bold text-lg">:</span>
                <select
                  value={minutes}
                  onChange={handleMinutesChange}
                  className="w-16 px-2 py-1.5 text-sm text-center border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-pln-primary focus:outline-none"
                >
                  {Array.from({ length: 60 }, (_, i) => (
                    <option key={i} value={String(i).padStart(2, "0")}>
                      {String(i).padStart(2, "0")}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="border-t border-slate-200 dark:border-slate-700 mt-4 pt-4 flex justify-between">
            <button
              type="button"
              onClick={handleClear}
              className="text-sm text-slate-500 hover:text-red-500 transition-colors"
            >
              Hapus
            </button>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="px-4 py-2 text-sm font-medium text-white bg-pln-primary hover:bg-pln-primary/90 rounded-lg transition-colors"
            >
              Selesai
            </button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
