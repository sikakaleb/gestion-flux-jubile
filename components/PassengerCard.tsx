"use client";

import { Plane, Bed, AlertCircle } from 'lucide-react';
import { Passenger, PassengerStatus, STATUS_LABELS } from '@/lib/supabaseClient';
import { clsx } from 'clsx';

interface PassengerCardProps {
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

export function PassengerCard({ passenger, onStatusChange, onClick }: PassengerCardProps) {
  const cycleStatus = (e: React.MouseEvent) => {
    e.stopPropagation();
    const statusOrder: PassengerStatus[] = ['pending', 'picked_up', 'housed'];
    const currentIndex = statusOrder.indexOf(passenger.status);
    const nextStatus = statusOrder[(currentIndex + 1) % statusOrder.length];
    onStatusChange(passenger.id, nextStatus);
  };

  const isUrgent = passenger.is_urgent && passenger.status === 'pending';
  const styles = STATUS_STYLES[passenger.status];

  return (
    <div
      onClick={onClick}
      className={clsx(
        'corporate-card rounded-lg overflow-hidden cursor-pointer transition-all duration-200 active:scale-[0.98]',
        'border-l-4',
        isUrgent ? 'border-l-red-600 dark:border-l-red-500' : styles.border,
        'md:flex md:items-center md:gap-4 md:p-4'
      )}
    >
      {/* MOBILE LAYOUT - Vertical Stack */}
      <div className="md:hidden">
        {/* Row 1: Time + Flight Number + Urgent Icon */}
        <div className="flex items-center justify-between px-4 pt-4 pb-2">
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

        {/* Row 2: FULL NAME - Never Truncated */}
        <div className="px-4 py-3">
          <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white leading-tight whitespace-normal break-words">
            {passenger.first_name} {passenger.last_name}
          </h3>
        </div>

        {/* Row 3: Accommodation + Status Button */}
        <div className="flex items-center justify-between px-4 pb-4 gap-3">
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

      {/* DESKTOP LAYOUT - Horizontal (Original) */}
      <div className="hidden md:flex md:flex-1 md:items-center md:gap-4">
        <div className="flex-shrink-0 text-center min-w-[70px]">
          <div className="text-3xl font-bold font-mono text-slate-900 dark:text-white">
            {passenger.flight_time}
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-3">
            <h3 className="font-semibold text-slate-900 dark:text-white text-lg">
              {passenger.first_name} {passenger.last_name}
            </h3>
            {isUrgent && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800">
                <AlertCircle className="w-3 h-3" />
                Urgent
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 mb-2">
            <Plane className="w-4 h-4 flex-shrink-0" />
            <span className="truncate">{passenger.airline}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
            <Bed className="w-4 h-4 flex-shrink-0" />
            <span className="truncate">{passenger.accommodation}</span>
          </div>
        </div>

        <button
          onClick={cycleStatus}
          className={clsx(
            'flex-shrink-0 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 min-h-[44px] min-w-[110px] flex items-center justify-center',
            styles.button
          )}
        >
          {STATUS_LABELS[passenger.status]}
        </button>
      </div>
    </div>
  );
}
