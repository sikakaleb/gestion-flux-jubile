import { Passenger, PassengerStatus } from '@/lib/supabaseClient';
import { TrendingUp, CheckCircle, Home, Clock } from 'lucide-react';
import { clsx } from 'clsx';

interface StatsFooterProps {
  passengers: Passenger[];
  quickFilter: PassengerStatus | null;
  onQuickFilterChange: (filter: PassengerStatus | null) => void;
}

export function StatsFooter({ passengers, quickFilter, onQuickFilterChange }: StatsFooterProps) {
  const total = passengers.length;
  const pickedUp = passengers.filter((p) => p.status === 'picked_up').length;
  const housed = passengers.filter((p) => p.status === 'housed').length;
  const pending = passengers.filter((p) => p.status === 'pending').length;

  const isActive = (filter: PassengerStatus | null) => quickFilter === filter;
  const isInactive = (filter: PassengerStatus | null) => quickFilter !== null && quickFilter !== filter;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 shadow-2xl">
      <div className="max-w-4xl mx-auto px-4 py-4">
        <div className="flex items-center justify-around gap-8">
          <button
            onClick={() => onQuickFilterChange(null)}
            className={clsx(
              'text-center transition-all duration-150 active:scale-95 cursor-pointer',
              isInactive(null) && 'opacity-50'
            )}
          >
            <div className="flex justify-center mb-1">
              <TrendingUp className="w-5 h-5 text-slate-500 dark:text-slate-400" />
            </div>
            <div className="text-slate-500 dark:text-slate-400 text-xs font-medium uppercase tracking-wider">Total</div>
            <div className="text-slate-900 dark:text-white font-bold text-2xl mt-1">{total}</div>
          </button>

          <button
            onClick={() => onQuickFilterChange('picked_up')}
            className={clsx(
              'text-center transition-all duration-150 active:scale-95 cursor-pointer',
              isInactive('picked_up') && 'opacity-50'
            )}
          >
            <div className="flex justify-center mb-1">
              <CheckCircle className="w-5 h-5 text-emerald-500" />
            </div>
            <div className="text-emerald-600 dark:text-emerald-400 text-xs font-medium uppercase tracking-wider">Récupérés</div>
            <div className="text-slate-900 dark:text-white font-bold text-2xl mt-1">{pickedUp}</div>
          </button>

          <button
            onClick={() => onQuickFilterChange('housed')}
            className={clsx(
              'text-center transition-all duration-150 active:scale-95 cursor-pointer',
              isInactive('housed') && 'opacity-50'
            )}
          >
            <div className="flex justify-center mb-1">
              <Home className="w-5 h-5 text-blue-500" />
            </div>
            <div className="text-blue-600 dark:text-blue-400 text-xs font-medium uppercase tracking-wider">Hébergés</div>
            <div className="text-slate-900 dark:text-white font-bold text-2xl mt-1">{housed}</div>
          </button>

          <button
            onClick={() => onQuickFilterChange('pending')}
            className={clsx(
              'text-center transition-all duration-150 active:scale-95 cursor-pointer',
              isInactive('pending') && 'opacity-50'
            )}
          >
            <div className="flex justify-center mb-1">
              <Clock className="w-5 h-5 text-slate-500 dark:text-slate-400" />
            </div>
            <div className="text-slate-500 dark:text-slate-400 text-xs font-medium uppercase tracking-wider">En attente</div>
            <div className="text-slate-900 dark:text-white font-bold text-2xl mt-1">{pending}</div>
          </button>
        </div>
      </div>
    </div>
  );
}
