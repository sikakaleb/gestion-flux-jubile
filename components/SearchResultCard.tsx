"use client";

import { Plane, Bed, AlertCircle, MapPin, Calendar, ArrowDown, ArrowUp } from 'lucide-react';
import { Passenger, PassengerStatus, STATUS_LABELS } from '@/lib/supabaseClient';
import { Badge } from '@/components/ui/badge';
import { clsx } from 'clsx';
import { format, parse } from 'date-fns';
import { fr } from 'date-fns/locale';

interface SearchResultCardProps {
  passenger: Passenger;
  onStatusChange: (id: string, newStatus: PassengerStatus) => void;
  onClick: () => void;
}

const STATUS_STYLES: Record<PassengerStatus, { button: string; border: string }> = {
  pending: {
    button: 'bg-white dark:bg-slate-800 border-2 border-slate-400 dark:border-slate-500 text-slate-900 dark:text-slate-100 active:bg-slate-100 dark:active:bg-slate-700 font-bold shadow-sm',
    border: 'border-l-slate-400 dark:border-l-slate-500',
  },
  picked_up: {
    button: 'bg-emerald-600 active:bg-emerald-700 text-white border-2 border-emerald-600 font-bold shadow-md',
    border: 'border-l-emerald-600',
  },
  housed: {
    button: 'bg-blue-600 active:bg-blue-700 text-white border-2 border-blue-600 font-bold shadow-md',
    border: 'border-l-blue-600',
  },
};

export function SearchResultCard({ passenger, onStatusChange, onClick }: SearchResultCardProps) {
  const cycleStatus = (e: React.MouseEvent) => {
    e.stopPropagation();
    const statusOrder: PassengerStatus[] = ['pending', 'picked_up', 'housed'];
    const currentIndex = statusOrder.indexOf(passenger.status);
    const nextStatus = statusOrder[(currentIndex + 1) % statusOrder.length];
    onStatusChange(passenger.id, nextStatus);
  };

  const isUrgent = passenger.is_urgent && passenger.status === 'pending';
  const styles = STATUS_STYLES[passenger.status];

  const formatDate = (dateStr: string) => {
    try {
      const date = parse(dateStr, 'yyyy-MM-dd', new Date());
      return format(date, 'EEE d MMM', { locale: fr });
    } catch {
      return dateStr;
    }
  };

  const isArrival = passenger.direction === 'arrival';

  return (
    <div
      onClick={onClick}
      className={clsx(
        'corporate-card rounded-lg overflow-hidden cursor-pointer transition-all duration-200 active:scale-[0.98]',
        'border-l-4',
        isUrgent ? 'border-l-red-600 dark:border-l-red-500' : styles.border
      )}
    >
      <div className="p-4 space-y-3">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="w-4 h-4 text-slate-500 dark:text-slate-400" />
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              {formatDate(passenger.flight_date)}
            </span>
          </div>

          <Badge
            variant={isArrival ? "default" : "secondary"}
            className={clsx(
              "flex items-center gap-1 font-semibold",
              isArrival
                ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300"
                : "bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300"
            )}
          >
            {isArrival ? (
              <>
                <ArrowDown className="w-3 h-3" />
                Arrivée
              </>
            ) : (
              <>
                <ArrowUp className="w-3 h-3" />
                Départ
              </>
            )}
          </Badge>
        </div>

        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            {isUrgent && <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-500 flex-shrink-0" />}
            <div className="text-3xl font-black font-mono text-slate-900 dark:text-white tracking-tight">
              {passenger.flight_time}
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-600 dark:text-slate-400">
            <Plane className="w-4 h-4" />
            <span>{passenger.airline.split(/[0-9]/)[0]}</span>
          </div>
        </div>

        <div>
          <h3 className="text-xl font-extrabold text-slate-900 dark:text-white leading-tight whitespace-normal break-words">
            {passenger.first_name} {passenger.last_name}
          </h3>
        </div>

        {passenger.location && (
          <div className="flex items-center gap-2 text-sm font-semibold text-sky-600 dark:text-sky-400">
            <MapPin className="w-4 h-4 flex-shrink-0" />
            <span className="whitespace-normal break-words">{passenger.location}</span>
          </div>
        )}

        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 min-w-0 flex-1">
            <Bed className="w-4 h-4 flex-shrink-0" />
            <span className="truncate font-medium">{passenger.accommodation}</span>
          </div>
          <button
            onClick={cycleStatus}
            className={clsx(
              'flex-shrink-0 px-4 py-2.5 rounded-lg text-sm transition-all duration-150 min-h-[44px] min-w-[110px] flex items-center justify-center',
              styles.button
            )}
          >
            {STATUS_LABELS[passenger.status]}
          </button>
        </div>
      </div>
    </div>
  );
}
