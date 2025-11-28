'use client';

import { useState } from 'react';
import { Calendar as CalendarIcon } from 'lucide-react';
import { format, subMonths, addMonths, startOfDay } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

interface DateJumpButtonProps {
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
  dateRange: { start: Date; end: Date };
}

export function DateJumpButton({ selectedDate, onDateSelect, dateRange }: DateJumpButtonProps) {
  const [open, setOpen] = useState(false);
  const today = startOfDay(new Date());

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      onDateSelect(startOfDay(date));
      setOpen(false);
    }
  };

  const handleTodayClick = () => {
    onDateSelect(today);
    setOpen(false);
  };

  const minDate = subMonths(today, 1);
  const maxDate = addMonths(today, 1);

  const fromDate = dateRange.start < minDate ? dateRange.start : minDate;
  const toDate = dateRange.end > maxDate ? dateRange.end : maxDate;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          className="glass-card p-2.5 active:bg-slate-300 dark:active:bg-slate-600 rounded-lg transition-all duration-150 min-h-[44px] min-w-[44px] flex items-center justify-center"
          aria-label="Jump to date"
        >
          <CalendarIcon className="w-5 h-5 text-slate-700 dark:text-slate-300" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="end">
        <div className="p-3 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
          <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
            Choisir une date
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={handleTodayClick}
            className="h-7 text-xs font-bold"
          >
            Aujourd'hui
          </Button>
        </div>
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={handleDateSelect}
          fromDate={fromDate}
          toDate={toDate}
          locale={fr}
          initialFocus
          className="rounded-md"
        />
      </PopoverContent>
    </Popover>
  );
}
