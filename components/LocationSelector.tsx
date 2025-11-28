'use client';

import { MapPin, Plane, Globe } from 'lucide-react';

const LOCATIONS = [
  { code: 'YAOUNDÉ (NSI)', name: 'Yaoundé', airport: 'Nsimalen', icon: '🏛️' },
  { code: 'DOUALA (DLA)', name: 'Douala', airport: 'International', icon: '🌊' },
  { code: 'GAROUA (GOU)', name: 'Garoua', airport: 'International', icon: '🌅' },
] as const;

const STORAGE_KEY = 'preferred_location';

interface LocationSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (location: string | null) => void;
}

export function LocationSelector({ isOpen, onClose, onSelect }: LocationSelectorProps) {
  if (!isOpen) return null;

  const handleSelect = (locationCode: string) => {
    localStorage.setItem(STORAGE_KEY, locationCode);
    onSelect(locationCode);
    onClose();
  };

  const handleSelectAll = () => {
    localStorage.setItem(STORAGE_KEY, 'ALL');
    onSelect(null); // null means no filter (see all)
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] backdrop-blur-xl bg-black/90 flex items-center justify-center p-4">
      <div className="w-full max-w-lg space-y-6 animate-in fade-in zoom-in duration-300">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex justify-center mb-4">
            <div className="bg-gradient-to-br from-blue-500 to-cyan-500 p-4 rounded-2xl shadow-lg shadow-blue-500/30">
              <MapPin className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-2xl font-black text-white">
            Quelle est votre zone de travail ?
          </h1>
          <p className="text-slate-400 text-sm">
            Sélectionnez l'aéroport où vous êtes affecté
          </p>
        </div>

        {/* Location Cards */}
        <div className="space-y-3">
          {/* See All Option */}
          <button
            onClick={handleSelectAll}
            className="w-full group"
          >
            <div className="glass-card p-5 rounded-xl border border-white/10 hover:border-emerald-500/50 hover:bg-white/10 transition-all duration-300 active:scale-[0.98]">
              <div className="flex items-center gap-4">
                <div className="text-4xl">🌍</div>
                <div className="flex-1 text-left">
                  <div className="text-xl font-bold text-white group-hover:text-emerald-400 transition-colors">
                    Voir tous les sites
                  </div>
                  <div className="text-slate-400 text-sm flex items-center gap-1">
                    <Globe className="w-3 h-3" />
                    Tous les aéroports
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-mono text-emerald-500 bg-emerald-500/20 px-2 py-1 rounded">
                    ALL
                  </div>
                </div>
              </div>
            </div>
          </button>

          {LOCATIONS.map((location) => (
            <button
              key={location.code}
              onClick={() => handleSelect(location.code)}
              className="w-full group"
            >
              <div className="glass-card p-5 rounded-xl border border-white/10 hover:border-blue-500/50 hover:bg-white/10 transition-all duration-300 active:scale-[0.98]">
                <div className="flex items-center gap-4">
                  <div className="text-4xl">{location.icon}</div>
                  <div className="flex-1 text-left">
                    <div className="text-xl font-bold text-white group-hover:text-blue-400 transition-colors">
                      {location.name}
                    </div>
                    <div className="text-slate-400 text-sm flex items-center gap-1">
                      <Plane className="w-3 h-3" />
                      {location.airport}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-mono text-slate-500 bg-slate-800 px-2 py-1 rounded">
                      {location.code.match(/\(([^)]+)\)/)?.[1]}
                    </div>
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Footer hint */}
        <p className="text-center text-slate-500 text-xs">
          Vous pourrez changer de zone à tout moment depuis le menu
        </p>
      </div>
    </div>
  );
}

// Utility functions for localStorage access
export function getPreferredLocation(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(STORAGE_KEY);
}

export function clearPreferredLocation(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEY);
}
