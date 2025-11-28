import { useState, useEffect, useRef } from 'react';
import { supabase, PassengerDirection } from '@/lib/supabaseClient';
import { addDays, subDays, parseISO } from 'date-fns';

interface DateRange {
  minDate: Date;
  maxDate: Date;
  loading: boolean;
}

const DEFAULT_RANGE = {
  minDate: subDays(new Date(), 3),
  maxDate: addDays(new Date(), 3),
  loading: false,
};

export function useDateRange(direction: PassengerDirection): DateRange {
  const [dateRange, setDateRange] = useState<DateRange>({
    ...DEFAULT_RANGE,
    loading: true,
  });
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    let cancelled = false;

    const fetchDateRange = async () => {
      try {
        const { data, error } = await supabase
          .from('passengers')
          .select('flight_date')
          .eq('direction', direction)
          .order('flight_date', { ascending: true });

        if (cancelled || !isMountedRef.current) return;

        if (error) throw error;

        if (data && data.length > 0) {
          const dates = data
            .map(d => d.flight_date)
            .filter(Boolean)
            .map(d => parseISO(d));

          if (dates.length > 0 && !cancelled) {
            const minDate = dates[0];
            const maxDate = dates[dates.length - 1];

            setDateRange({
              minDate,
              maxDate,
              loading: false,
            });
            return;
          }
        }

        if (!cancelled) {
          setDateRange(DEFAULT_RANGE);
        }
      } catch (error) {
        console.error('Error fetching date range:', error);
        if (!cancelled && isMountedRef.current) {
          setDateRange(DEFAULT_RANGE);
        }
      }
    };

    fetchDateRange();

    return () => {
      cancelled = true;
      isMountedRef.current = false;
    };
  }, [direction]);

  return dateRange;
}
