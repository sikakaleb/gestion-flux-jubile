"use client";

import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { PassengerStatus } from '@/lib/supabaseClient';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';

export interface FilterState {
  statuses: PassengerStatus[];
  tags: string[];
  timeOfDay: ('morning' | 'afternoon' | 'evening')[];
}

interface FilterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
  availableTags: string[];
}

const TIME_RANGES = [
  { key: 'morning' as const, label: 'Matin (06:00-12:00)', from: '06:00', to: '12:00' },
  { key: 'afternoon' as const, label: 'Après-midi (12:00-18:00)', from: '12:00', to: '18:00' },
  { key: 'evening' as const, label: 'Soir (18:00-00:00)', from: '18:00', to: '00:00' },
];

const STATUS_OPTIONS: { key: PassengerStatus; label: string; color: string }[] = [
  { key: 'pending', label: 'En attente', color: 'bg-slate-100 text-slate-700' },
  { key: 'picked_up', label: 'Récupéré', color: 'bg-emerald-100 text-emerald-700' },
  { key: 'housed', label: 'Hébergé', color: 'bg-blue-100 text-blue-700' },
];

export function FilterDrawer({ isOpen, onClose, filters, onFilterChange, availableTags }: FilterDrawerProps) {
  const toggleStatus = (status: PassengerStatus) => {
    const newStatuses = filters.statuses.includes(status)
      ? filters.statuses.filter(s => s !== status)
      : [...filters.statuses, status];
    onFilterChange({ ...filters, statuses: newStatuses });
  };

  const toggleTag = (tag: string) => {
    const newTags = filters.tags.includes(tag)
      ? filters.tags.filter(t => t !== tag)
      : [...filters.tags, tag];
    onFilterChange({ ...filters, tags: newTags });
  };

  const toggleTimeOfDay = (time: 'morning' | 'afternoon' | 'evening') => {
    const newTimes = filters.timeOfDay.includes(time)
      ? filters.timeOfDay.filter(t => t !== time)
      : [...filters.timeOfDay, time];
    onFilterChange({ ...filters, timeOfDay: newTimes });
  };

  const clearAll = () => {
    onFilterChange({ statuses: [], tags: [], timeOfDay: [] });
  };

  const activeFilterCount = filters.statuses.length + filters.tags.length + filters.timeOfDay.length;

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="bottom" className="h-[85vh] rounded-t-3xl">
        <SheetHeader className="mb-6">
          <div className="flex items-center justify-between">
            <SheetTitle className="text-2xl font-bold">Filtres</SheetTitle>
            {activeFilterCount > 0 && (
              <Button variant="ghost" size="sm" onClick={clearAll}>
                <X className="w-4 h-4 mr-1" />
                Effacer tout
              </Button>
            )}
          </div>
          {activeFilterCount > 0 && (
            <Badge variant="secondary" className="w-fit">
              {activeFilterCount} filtre{activeFilterCount > 1 ? 's' : ''} actif{activeFilterCount > 1 ? 's' : ''}
            </Badge>
          )}
        </SheetHeader>

        <div className="space-y-8 pb-6">
          <div>
            <h3 className="font-semibold text-lg mb-4 text-slate-900 dark:text-white">Statut</h3>
            <div className="flex flex-wrap gap-2">
              {STATUS_OPTIONS.map(({ key, label, color }) => (
                <button
                  key={key}
                  onClick={() => toggleStatus(key)}
                  className={`px-4 py-2.5 rounded-lg font-semibold transition-all border-2 min-h-[44px] ${
                    filters.statuses.includes(key)
                      ? `${color} border-slate-900 dark:border-white`
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 border-transparent'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {availableTags.length > 0 && (
            <div>
              <h3 className="font-semibold text-lg mb-4 text-slate-900 dark:text-white">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {availableTags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => toggleTag(tag)}
                    className={`px-4 py-2.5 rounded-lg font-semibold transition-all border-2 min-h-[44px] ${
                      filters.tags.includes(tag)
                        ? 'bg-amber-100 text-amber-700 border-amber-700 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-500'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 border-transparent'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div>
            <h3 className="font-semibold text-lg mb-4 text-slate-900 dark:text-white">Heure de la journée</h3>
            <div className="space-y-2">
              {TIME_RANGES.map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => toggleTimeOfDay(key)}
                  className={`w-full px-4 py-3 rounded-lg font-semibold transition-all border-2 min-h-[52px] text-left ${
                    filters.timeOfDay.includes(key)
                      ? 'bg-blue-50 text-blue-700 border-blue-700 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-500'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-transparent'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
