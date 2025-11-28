import { format, addDays, isSameDay, eachDayOfInterval, startOfDay, isBefore, isAfter, subDays } from 'date-fns';
import { fr } from 'date-fns/locale';
import { clsx } from 'clsx';
import { useMemo, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Passenger, PassengerDirection } from '@/lib/supabaseClient';
import { useDateRange } from '@/hooks/useDateRange';

interface CalendarStripProps {
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
  passengers: Passenger[];
  direction: PassengerDirection;
}

export function CalendarStrip({ selectedDate, onDateSelect, passengers, direction }: CalendarStripProps) {
  const dateRange = useDateRange();
  const today = startOfDay(new Date());
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const buttonRefs = useRef<Map<string, HTMLButtonElement>>(new Map());

  const getVisibleDates = () => {
    const selectedDay = startOfDay(selectedDate);

    let start = selectedDay;
    let end = addDays(selectedDay, 6);

    if (isBefore(start, dateRange.start)) {
      start = dateRange.start;
      end = addDays(start, 6);
    }

    if (isAfter(end, dateRange.end)) {
      end = dateRange.end;
      start = addDays(end, -6);
    }

    if (isBefore(start, dateRange.start)) {
      start = dateRange.start;
    }

    return eachDayOfInterval({ start, end });
  };

  const dates = getVisibleDates();

  const passengerCountCache = useMemo(() => {
    const cache = new Map<string, number>();
    passengers.forEach((p) => {
      if (p.direction === direction) {
        const count = cache.get(p.flight_date) || 0;
        cache.set(p.flight_date, count + 1);
      }
    });
    return cache;
  }, [passengers, direction]);

  const getCountForDate = (date: Date): number => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return passengerCountCache.get(dateStr) || 0;
  };

  useEffect(() => {
    const selectedDateStr = format(selectedDate, 'yyyy-MM-dd');
    const selectedButton = buttonRefs.current.get(selectedDateStr);

    if (selectedButton && scrollContainerRef.current) {
      setTimeout(() => {
        selectedButton.scrollIntoView({
          behavior: 'smooth',
          inline: 'center',
          block: 'nearest'
        });
      }, 100);
    }
  }, [selectedDate, dates]);

  const handleWeekJump = (direction: 'prev' | 'next') => {
    const newDate = direction === 'prev'
      ? subDays(selectedDate, 7)
      : addDays(selectedDate, 7);

    const clampedDate = isBefore(newDate, dateRange.start)
      ? dateRange.start
      : isAfter(newDate, dateRange.end)
      ? dateRange.end
      : newDate;

    onDateSelect(clampedDate);
  };

  const canGoBack = !isSameDay(selectedDate, dateRange.start) && isAfter(selectedDate, dateRange.start);
  const canGoForward = !isSameDay(selectedDate, dateRange.end) && isBefore(selectedDate, dateRange.end);

  return (
    <div className="bg-slate-100 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800 relative">
      <button
        onClick={() => handleWeekJump('prev')}
        disabled={!canGoBack}
        className={clsx(
          'absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white dark:bg-slate-800 border-2 border-slate-300 dark:border-slate-600 rounded-full p-2 shadow-lg transition-all',
          canGoBack
            ? 'opacity-100 hover:scale-110 active:scale-95'
            : 'opacity-30 cursor-not-allowed'
        )}
        aria-label="Previous week"
      >
        <ChevronLeft className="w-5 h-5 text-slate-700 dark:text-slate-300" />
      </button>

      <button
        onClick={() => handleWeekJump('next')}
        disabled={!canGoForward}
        className={clsx(
          'absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white dark:bg-slate-800 border-2 border-slate-300 dark:border-slate-600 rounded-full p-2 shadow-lg transition-all',
          canGoForward
            ? 'opacity-100 hover:scale-110 active:scale-95'
            : 'opacity-30 cursor-not-allowed'
        )}
        aria-label="Next week"
      >
        <ChevronRight className="w-5 h-5 text-slate-700 dark:text-slate-300" />
      </button>

      <div
        ref={scrollContainerRef}
        className="flex gap-2 overflow-x-auto px-4 py-4 scrollbar-hide scroll-smooth"
        style={{
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          WebkitOverflowScrolling: 'touch',
          paddingLeft: '3rem',
          paddingRight: '3rem'
        }}
      >
        {dates.map((date, index) => {
          const isSelected = isSameDay(date, selectedDate);
          const isToday = isSameDay(date, today);
          const count = getCountForDate(date);
          const hasData = count > 0;

          const dateStr = format(date, 'yyyy-MM-dd');

          return (
            <button
              key={`${dateStr}-${index}`}
              ref={(el) => {
                if (el) {
                  buttonRefs.current.set(dateStr, el);
                } else {
                  buttonRefs.current.delete(dateStr);
                }
              }}
              onClick={() => onDateSelect(date)}
              className={clsx(
                'flex-shrink-0 flex flex-col items-center justify-center px-5 py-3 rounded-xl transition-all duration-200 min-w-[85px] min-h-[75px] border relative',
                isSelected
                  ? 'bg-blue-600 text-white border-blue-500 shadow-2xl scale-110 ring-4 ring-blue-200 dark:ring-blue-900/50'
                  : 'bg-white dark:bg-slate-800/50 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 active:scale-95 hover:shadow-md'
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
              {hasData ? (
                <div
                  className={clsx(
                    'mt-2 px-2 py-0.5 rounded-full text-xs font-bold transition-opacity duration-300',
                    isSelected
                      ? 'bg-white/20 text-white'
                      : 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                  )}
                >
                  {count}
                </div>
              ) : (
                <div className="mt-2 h-5" />
              )}
              {isToday && (
                <div className={clsx(
                  'absolute top-2 right-2 w-2 h-2 rounded-full transition-all duration-200',
                  isSelected ? 'bg-white' : 'bg-blue-500'
                )}></div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
