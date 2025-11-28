'use client';

import { useRef, useEffect, useState } from 'react';
import { format, addDays, isSameDay, differenceInDays } from 'date-fns';
import { fr } from 'date-fns/locale';
import { clsx } from 'clsx';
import { CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { Passenger, PassengerDirection } from '@/lib/supabaseClient';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';

interface CalendarStripProps {
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
  passengers: Passenger[];
  direction: PassengerDirection;
  minDate: Date;
  maxDate: Date;
}

export function CalendarStrip({
  selectedDate,
  onDateSelect,
  passengers,
  direction,
  minDate,
  maxDate,
}: CalendarStripProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const selectedDateRef = useRef<HTMLButtonElement>(null);
  const [calendarOpen, setCalendarOpen] = useState(false);

  const dayCount = differenceInDays(maxDate, minDate) + 1;
  const dates = Array.from({ length: dayCount }, (_, i) => addDays(minDate, i));

  const getCountForDate = (date: Date): number => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return passengers.filter(
      (p) => p.flight_date === dateStr && p.direction === direction
    ).length;
  };

  const scrollToSelected = () => {
    if (selectedDateRef.current && scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const button = selectedDateRef.current;

      const containerWidth = container.offsetWidth;
      const buttonLeft = button.offsetLeft;
      const buttonWidth = button.offsetWidth;

      const scrollPosition = buttonLeft - (containerWidth / 2) + (buttonWidth / 2);

      container.scrollTo({
        left: scrollPosition,
        behavior: 'smooth',
      });
    }
  };

  useEffect(() => {
    const timer = window.setTimeout(() => {
      scrollToSelected();
    }, 100);

    return () => {
      window.clearTimeout(timer);
    };
  }, [selectedDate]);

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({
        left: -300,
        behavior: 'smooth',
      });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({
        left: 300,
        behavior: 'smooth',
      });
    }
  };

  const handleCalendarSelect = (date: Date | undefined) => {
    if (date) {
      onDateSelect(date);
      setCalendarOpen(false);
    }
  };

  const today = new Date();

  return (
    <div className="relative bg-slate-100 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800">
      <div className="flex items-center gap-2 px-4 py-4">
        <button
          onClick={scrollLeft}
          className="hidden md:flex flex-shrink-0 items-center justify-center w-10 h-10 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
          aria-label="Scroll left"
        >
          <ChevronLeft className="w-5 h-5 text-slate-600 dark:text-slate-400" />
        </button>

        <div
          ref={scrollContainerRef}
          className="flex-1 flex gap-2 overflow-x-auto scrollbar-hide scroll-smooth"
        >
          {dates.map((date, index) => {
            const isSelected = isSameDay(date, selectedDate);
            const isToday = isSameDay(date, today);
            const count = getCountForDate(date);

            return (
              <button
                key={index}
                ref={isSelected ? selectedDateRef : null}
                onClick={() => onDateSelect(date)}
                className={clsx(
                  'flex-shrink-0 flex flex-col items-center justify-center px-5 py-3 rounded-lg transition-all duration-200 min-w-[85px] min-h-[75px] border relative',
                  isSelected
                    ? 'bg-blue-600 text-white border-blue-500 shadow-lg'
                    : 'bg-white dark:bg-slate-800/50 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/70 hover:text-slate-900 dark:hover:text-slate-300'
                )}
              >
                <div className={clsx(
                  'text-xs font-semibold uppercase tracking-wider',
                  isSelected ? 'opacity-90' : 'opacity-70'
                )}>
                  {format(date, 'EEE', { locale: fr })}
                </div>
                <div className="text-2xl font-bold mt-1">
                  {format(date, 'd')}
                </div>
                {count > 0 && (
                  <div
                    className={clsx(
                      'mt-2 text-xs font-bold',
                      isSelected ? 'text-white' : 'text-slate-600 dark:text-slate-400'
                    )}
                  >
                    {count}
                  </div>
                )}
                {isToday && !isSelected && (
                  <div className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                )}
              </button>
            );
          })}
        </div>

        <button
          onClick={scrollRight}
          className="hidden md:flex flex-shrink-0 items-center justify-center w-10 h-10 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
          aria-label="Scroll right"
        >
          <ChevronRight className="w-5 h-5 text-slate-600 dark:text-slate-400" />
        </button>

        <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="flex-shrink-0 w-10 h-10 p-0 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700"
              aria-label="Jump to date"
            >
              <CalendarIcon className="w-5 h-5 text-slate-600 dark:text-slate-400" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="end">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={handleCalendarSelect}
              disabled={(date) => {
                const dateStr = format(date, 'yyyy-MM-dd');
                const minStr = format(minDate, 'yyyy-MM-dd');
                const maxStr = format(maxDate, 'yyyy-MM-dd');
                return dateStr < minStr || dateStr > maxStr;
              }}
              initialFocus
              locale={fr}
            />
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}
