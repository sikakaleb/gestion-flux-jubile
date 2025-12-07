'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { Search, Settings, Filter, AlertCircle, ChevronDown, ChevronUp, Globe, X, MapPin } from 'lucide-react';
import { supabase, Passenger, PassengerStatus, PassengerDirection, isPassengerUrgent } from '@/lib/supabaseClient';
import { PassengerCard } from '@/components/PassengerCard';
import { PassengerDetailsSheet } from '@/components/PassengerDetailsSheet';
import { CalendarStrip } from '@/components/CalendarStrip';
import { SearchOverlay } from '@/components/SearchOverlay';
import { StatsFooter } from '@/components/StatsFooter';
import { SkeletonCard } from '@/components/SkeletonCard';
import { BrandLogo } from '@/components/BrandLogo';
import { ThemeToggle } from '@/components/ThemeToggle';
import { FilterDrawer, FilterState } from '@/components/FilterDrawer';
import { DateJumpButton } from '@/components/DateJumpButton';
import { LocationSelector, getPreferredLocation } from '@/components/LocationSelector';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { clsx } from 'clsx';
import { useDateRange } from '@/hooks/useDateRange';
import { normalizeLocation } from '@/utils/csvParser';

interface TimeBlock {
  label: string;
  start: string;
  end: string;
  passengers: Passenger[];
  isExpanded: boolean;
}

export default function Home() {
  const router = useRouter();
  const dateRange = useDateRange();
  const [passengers, setPassengers] = useState<Passenger[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [direction, setDirection] = useState<PassengerDirection>('arrival');
  const [searchOpen, setSearchOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [selectedPassenger, setSelectedPassenger] = useState<Passenger | null>(null);
  const [expandedBlocks, setExpandedBlocks] = useState<Set<string>>(new Set());
  const [quickFilter, setQuickFilter] = useState<PassengerStatus | null>(null);
  const [filters, setFilters] = useState<FilterState>({
    statuses: [],
    tags: [],
    timeOfDay: [],
    locations: [],
  });
  const [locationSelectorOpen, setLocationSelectorOpen] = useState(false);

  // Check localStorage for preferred location on mount
  useEffect(() => {
    const savedLocation = getPreferredLocation();
    if (savedLocation) {
      if (savedLocation === 'ALL') {
        // User chose to see all locations
        setFilters(prev => ({ ...prev, locations: [] }));
      } else {
        setFilters(prev => ({ ...prev, locations: [savedLocation] }));
      }
    } else {
      // No saved location, show the selector modal
      setLocationSelectorOpen(true);
    }
  }, []);

  // Clear location filter
  const clearLocationFilter = () => {
    localStorage.setItem('preferred_location', 'ALL');
    setFilters(prev => ({ ...prev, locations: [] }));
  };

  useEffect(() => {
    fetchPassengers();

    const subscription = supabase
      .channel('passengers_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'passengers' },
        () => {
          fetchPassengers();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchPassengers = async () => {
    try {
      const { data, error } = await supabase
        .from('passengers')
        .select('*')
        .order('flight_time', { ascending: true });

      if (error) throw error;
      setPassengers(data || []);
    } catch (error) {
      toast.error('Erreur de chargement des données');
      console.error('Error fetching passengers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id: string, newStatus: PassengerStatus) => {
    setPassengers((prev) =>
      prev.map((p) => (p.id === id ? { ...p, status: newStatus } : p))
    );

    if (selectedPassenger?.id === id) {
      setSelectedPassenger((prev) => prev ? { ...prev, status: newStatus } : null);
    }

    try {
      const { error } = await supabase
        .from('passengers')
        .update({ status: newStatus })
        .eq('id', id);

      if (error) throw error;
      toast.success('Statut mis à jour');
    } catch (error) {
      toast.error('Erreur de mise à jour');
      fetchPassengers();
    }
  };

  const getTimeOfDay = (time: string): 'morning' | 'afternoon' | 'evening' => {
    const hour = parseInt(time.split(':')[0]);
    if (hour >= 6 && hour < 12) return 'morning';
    if (hour >= 12 && hour < 18) return 'afternoon';
    return 'evening';
  };

  const filteredPassengers = useMemo(() => {
    const dateStr = format(selectedDate, 'yyyy-MM-dd');
    let filtered = passengers.filter(
      (p) => p.flight_date === dateStr && p.direction === direction
    );

    if (quickFilter) {
      filtered = filtered.filter((p) => p.status === quickFilter);
    } else if (filters.statuses.length > 0) {
      filtered = filtered.filter((p) => filters.statuses.includes(p.status));
    }

    if (filters.tags.length > 0) {
      filtered = filtered.filter((p) =>
        p.tags?.some(tag => filters.tags.includes(tag))
      );
    }

    if (filters.timeOfDay.length > 0) {
      filtered = filtered.filter((p) =>
        filters.timeOfDay.includes(getTimeOfDay(p.flight_time))
      );
    }

    if (filters.locations.length > 0) {
      filtered = filtered.filter((p) => {
        // CORRECTION : On normalise le lieu du passager (ex: "Douala" -> "DOUALA (DLA)")
        // pour qu'il corresponde exactement à la valeur sélectionnée dans le filtre
        const normalizedPassengerLocation = normalizeLocation(p.location || '');
        return filters.locations.includes(normalizedPassengerLocation);
      });
    }

    return filtered.sort((a, b) => a.flight_time.localeCompare(b.flight_time));
  }, [passengers, selectedDate, direction, filters, quickFilter]);

  const urgentPassengers = useMemo(() => {
    return filteredPassengers.filter((p) => isPassengerUrgent(p, 10));
  }, [filteredPassengers]);

  const regularPassengers = useMemo(() => {
    return filteredPassengers.filter((p) => !isPassengerUrgent(p, 10));
  }, [filteredPassengers]);

  const timeBlocks = useMemo(() => {
    const blocks: TimeBlock[] = [];
    const blockMap = new Map<string, Passenger[]>();

    regularPassengers.forEach((passenger) => {
      const hour = passenger.flight_time.split(':')[0];
      const nextHour = (parseInt(hour) + 1).toString().padStart(2, '0');
      const blockKey = `${hour}:00-${nextHour}:00`;

      if (!blockMap.has(blockKey)) {
        blockMap.set(blockKey, []);
      }
      blockMap.get(blockKey)!.push(passenger);
    });

    blockMap.forEach((passengers, blockKey) => {
      if (passengers.length > 0) {
        const [start, end] = blockKey.split('-');
        const shouldAutoExpand = quickFilter !== null;
        blocks.push({
          label: blockKey,
          start,
          end,
          passengers,
          isExpanded: shouldAutoExpand || expandedBlocks.has(blockKey),
        });
      }
    });

    return blocks.sort((a, b) => a.start.localeCompare(b.start));
  }, [regularPassengers, expandedBlocks, quickFilter]);

  const toggleBlock = (blockLabel: string) => {
    if (quickFilter !== null) return;

    setExpandedBlocks((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(blockLabel)) {
        newSet.delete(blockLabel);
      } else {
        newSet.add(blockLabel);
      }
      return newSet;
    });
  };

  const handleQuickFilterChange = (filter: PassengerStatus | null) => {
    setQuickFilter(filter);
    if (filter !== null) {
      setFilters({
        statuses: [],
        tags: [],
        timeOfDay: [],
        locations: [],
      });
    }
  };

  const availableTags = useMemo(() => {
    const tags = new Set<string>();
    passengers.forEach((p) => {
      p.tags?.forEach((tag) => tags.add(tag));
    });
    return Array.from(tags).sort();
  }, [passengers]);

  const availableLocations = useMemo(() => {
    const dateStr = format(selectedDate, 'yyyy-MM-dd');
    const locations = new Set<string>();
    passengers.forEach((p) => {
      if (p.flight_date === dateStr && p.direction === direction && p.location) {
        locations.add(p.location);
      }
    });
    return Array.from(locations).sort();
  }, [passengers, selectedDate, direction]);

  const activeFilterCount = (quickFilter ? 1 : 0) + filters.statuses.length + filters.tags.length + filters.timeOfDay.length + filters.locations.length;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <div className="relative z-10 pb-40">
        <div className="sticky top-0 z-40 glass-effect border-b border-slate-200 dark:border-white/10 shadow-2xl">
          <div className="flex items-center justify-between px-4 py-4">
            <BrandLogo size="compact" />
            <div className="flex items-center gap-2">
              <button
                onClick={() => setLocationSelectorOpen(true)}
                className="glass-card p-2.5 active:bg-slate-300 dark:active:bg-slate-600 rounded-lg transition-all duration-150 min-h-[44px] flex items-center gap-2"
                aria-label="Change Zone"
                title="Changer de zone"
              >
                <Globe className="w-5 h-5 text-blue-500" />
                <span className="text-xs font-bold text-slate-600 dark:text-slate-300 hidden sm:inline">
                  {filters.locations[0]?.match(/\(([^)]+)\)/)?.[1] || 'Zone'}
                </span>
              </button>
              <ThemeToggle />
              <DateJumpButton
                selectedDate={selectedDate}
                onDateSelect={setSelectedDate}
                dateRange={dateRange}
              />
              <button
                onClick={() => setSearchOpen(true)}
                className="glass-card p-2.5 active:bg-slate-300 dark:active:bg-slate-600 rounded-lg transition-all duration-150 min-h-[44px] min-w-[44px] flex items-center justify-center"
                aria-label="Search"
              >
                <Search className="w-5 h-5 text-slate-700 dark:text-slate-300" />
              </button>
              <button
                onClick={() => setFilterOpen(true)}
                className="glass-card p-2.5 active:bg-slate-300 dark:active:bg-slate-600 rounded-lg transition-all duration-150 min-h-[44px] min-w-[44px] flex items-center justify-center relative"
                aria-label="Filter"
              >
                <Filter className="w-5 h-5 text-slate-700 dark:text-slate-300" />
                {activeFilterCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {activeFilterCount}
                  </span>
                )}
              </button>
              <button
                onClick={() => router.push('/admin')}
                className="glass-card p-2.5 active:bg-slate-300 dark:active:bg-slate-600 rounded-lg transition-all duration-150 min-h-[44px] min-w-[44px] flex items-center justify-center md:flex hidden"
                aria-label="Admin"
              >
                <Settings className="w-5 h-5 text-slate-700 dark:text-slate-300" />
              </button>
            </div>
          </div>

          <div className="px-4 pb-3">
            <div className="inline-flex bg-slate-200/50 dark:bg-slate-800/30 rounded-full p-1 gap-1 w-full md:w-auto">
              <button
                onClick={() => setDirection('arrival')}
                className={clsx(
                  'flex-1 md:flex-none px-6 py-2.5 rounded-full font-bold transition-all duration-150 text-sm tracking-wide min-h-[44px]',
                  direction === 'arrival'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-md'
                    : 'text-slate-600 dark:text-slate-400'
                )}
              >
                Arrivées
              </button>
              <button
                onClick={() => setDirection('departure')}
                className={clsx(
                  'flex-1 md:flex-none px-6 py-2.5 rounded-full font-bold transition-all duration-150 text-sm tracking-wide min-h-[44px]',
                  direction === 'departure'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-md'
                    : 'text-slate-600 dark:text-slate-400'
                )}
              >
                Départs
              </button>
            </div>
          </div>
        </div>

        {/* Active Location Filter Banner */}
        {filters.locations.length > 0 && (() => {
          const count = filters.locations.length;
          const locationLabel = count === 1 
            ? filters.locations[0] 
            : count === 2 
              ? filters.locations.join(' + ') 
              : `${count} zones sélectionnées`;
          const zoneSingularPlural = count === 1 ? 'Zone active' : 'Zones actives';
          
          return (
            <div className="mx-4 mt-2 bg-blue-600 dark:bg-blue-700 rounded-lg px-3 py-2.5 flex items-center justify-between gap-2 shadow-lg">
              <div className="flex items-center gap-2 text-white min-w-0 flex-1">
                <MapPin className="w-4 h-4 flex-shrink-0" />
                <span className="text-sm font-medium truncate">
                  {zoneSingularPlural} : <span className="font-bold">{locationLabel}</span>
                </span>
              </div>
              <button
                onClick={clearLocationFilter}
                className="flex-shrink-0 flex items-center gap-1 text-white/80 hover:text-white text-xs font-medium bg-white/20 hover:bg-white/30 px-2 py-1 rounded transition-all"
              >
                <X className="w-3 h-3" />
                <span className="hidden sm:inline">Voir tout</span>
              </button>
            </div>
          );
        })()}

        <CalendarStrip
          selectedDate={selectedDate}
          onDateSelect={setSelectedDate}
          passengers={passengers}
          direction={direction}
        />

        <div className="px-4 py-4 space-y-4">
          {loading ? (
            <>
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
            </>
          ) : filteredPassengers.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-slate-400 dark:text-slate-600 text-xl font-bold mb-2">
                Aucun passager
              </div>
              <div className="text-slate-500 dark:text-slate-500 text-sm">
                pour cette date et direction
              </div>
            </div>
          ) : (
            <>
              {urgentPassengers.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 px-2">
                    <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-500" />
                    <h2 className="text-lg font-black text-red-600 dark:text-red-500 uppercase tracking-wide">
                      Priorité Urgente
                    </h2>
                    <Badge variant="destructive" className="font-bold">
                      {urgentPassengers.length}
                    </Badge>
                  </div>
                  {urgentPassengers.map((passenger) => (
                    <PassengerCard
                      key={passenger.id}
                      passenger={passenger}
                      onStatusChange={handleStatusChange}
                      onClick={() => setSelectedPassenger(passenger)}
                    />
                  ))}
                </div>
              )}

              {timeBlocks.map((block) => (
                <div key={block.label} className="space-y-2">
                  <button
                    onClick={() => toggleBlock(block.label)}
                    className="w-full flex items-center justify-between px-4 py-3 bg-slate-200 dark:bg-slate-800 rounded-lg active:bg-slate-300 dark:active:bg-slate-700 transition-all min-h-[52px]"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xl font-black font-mono text-slate-900 dark:text-white">
                        {block.label}
                      </span>
                      <Badge variant="secondary" className="font-bold">
                        {block.passengers.length} pax
                      </Badge>
                    </div>
                    {block.isExpanded ? (
                      <ChevronUp className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                    )}
                  </button>

                  {block.isExpanded && (
                    <div className="space-y-3 pl-2">
                      {block.passengers.map((passenger) => (
                        <PassengerCard
                          key={passenger.id}
                          passenger={passenger}
                          onStatusChange={handleStatusChange}
                          onClick={() => setSelectedPassenger(passenger)}
                        />
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </>
          )}
        </div>

        <StatsFooter
          passengers={filteredPassengers}
          quickFilter={quickFilter}
          onQuickFilterChange={handleQuickFilterChange}
        />

        <SearchOverlay
          isOpen={searchOpen}
          onClose={() => setSearchOpen(false)}
          passengers={passengers}
          onStatusChange={handleStatusChange}
          activeLocationFilter={filters.locations.length > 0 ? filters.locations[0] : null}
        />

        <FilterDrawer
          isOpen={filterOpen}
          onClose={() => setFilterOpen(false)}
          filters={filters}
          onFilterChange={(newFilters) => {
            setFilters(newFilters);
            if (newFilters.statuses.length > 0 || newFilters.tags.length > 0 || newFilters.timeOfDay.length > 0 || newFilters.locations.length > 0) {
              setQuickFilter(null);
            }
          }}
          availableTags={availableTags}
          availableLocations={availableLocations}
        />

        <PassengerDetailsSheet
          passenger={selectedPassenger}
          isOpen={!!selectedPassenger}
          onClose={() => setSelectedPassenger(null)}
          onStatusChange={handleStatusChange}
        />

        <LocationSelector
          isOpen={locationSelectorOpen}
          onClose={() => setLocationSelectorOpen(false)}
          onSelect={(location) => {
            if (location === null) {
              // "See All" was selected
              setFilters(prev => ({ ...prev, locations: [] }));
            } else {
              setFilters(prev => ({ ...prev, locations: [location] }));
            }
          }}
        />
      </div>
    </div>
  );
}
