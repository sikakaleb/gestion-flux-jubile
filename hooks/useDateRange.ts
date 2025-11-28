import { useState, useEffect } from 'react';
import { subWeeks, endOfYear, startOfDay, parseISO, isBefore, isAfter } from 'date-fns';
import { supabase } from '@/lib/supabaseClient';

interface DateRange {
  start: Date;
  end: Date;
}

export function useDateRange() {
  const [dateRange, setDateRange] = useState<DateRange>(() => ({
    start: subWeeks(new Date(), 1),
    end: endOfYear(new Date()),
  }));

  useEffect(() => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);

    const fetchDateRange = async () => {
      try {
        const { data, error } = await supabase
          .from('passengers')
          .select('flight_date')
          .order('flight_date', { ascending: true })
          .limit(1)
          .maybeSingle();

        clearTimeout(timeoutId);

        if (error) throw error;

        if (data?.flight_date) {
          const minDate = startOfDay(parseISO(data.flight_date));

          const { data: maxData, error: maxError } = await supabase
            .from('passengers')
            .select('flight_date')
            .order('flight_date', { ascending: false })
            .limit(1)
            .maybeSingle();

          if (maxError) throw maxError;

          if (maxData?.flight_date) {
            const maxDate = startOfDay(parseISO(maxData.flight_date));

            setDateRange((current) => {
              const shouldUpdateStart = isBefore(minDate, current.start);
              const shouldUpdateEnd = isAfter(maxDate, current.end);

              if (shouldUpdateStart || shouldUpdateEnd) {
                return {
                  start: shouldUpdateStart ? minDate : current.start,
                  end: shouldUpdateEnd ? maxDate : current.end,
                };
              }

              return current;
            });
          }
        }
      } catch (error) {
        if (error instanceof Error && error.name === 'AbortError') {
          console.log('Date range fetch timed out, using default range');
        } else {
          console.error('Error fetching date range:', error);
        }
      }
    };

    fetchDateRange();

    return () => {
      clearTimeout(timeoutId);
      controller.abort();
    };
  }, []);

  return dateRange;
}
