import { useState, useEffect } from 'react';
import { X, Search, Sparkles } from 'lucide-react';
import { Passenger, PassengerStatus } from '@/lib/supabaseClient';
import { PassengerCard } from './PassengerCard';

interface SearchOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  passengers: Passenger[];
  onStatusChange: (id: string, newStatus: PassengerStatus) => void;
}

export function SearchOverlay({ isOpen, onClose, passengers, onStatusChange }: SearchOverlayProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<Passenger[]>([]);

  useEffect(() => {
    if (searchTerm.length >= 2) {
      const filtered = passengers.filter((p) => {
        const fullName = `${p.first_name} ${p.last_name}`.toLowerCase();
        return fullName.includes(searchTerm.toLowerCase());
      });
      setResults(filtered.sort((a, b) => a.flight_time.localeCompare(b.flight_time)));
    } else {
      setResults([]);
    }
  }, [searchTerm, passengers]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 backdrop-blur-xl bg-black/80">
      <div className="h-full flex flex-col">
        <div className="glass-effect border-b border-white/10">
          <div className="flex items-center gap-4 p-5">
            <div className="bg-gradient-to-br from-violet-500 to-fuchsia-500 p-2.5 rounded-xl">
              <Search className="w-5 h-5 text-white" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Rechercher un passager..."
              className="flex-1 outline-none text-lg bg-transparent text-white placeholder-gray-400"
              autoFocus
            />
            <button
              onClick={onClose}
              className="p-2.5 glass-card hover:bg-white/20 rounded-xl transition-all duration-300 hover:scale-110"
            >
              <X className="w-6 h-6 text-gray-300" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-5 bg-gradient-to-b from-transparent to-black/30">
          {searchTerm.length < 2 ? (
            <div className="text-center mt-20 space-y-4">
              <div className="flex justify-center">
                <div className="glass-card p-5 rounded-2xl">
                  <Sparkles className="w-12 h-12 text-violet-400 animate-pulse" />
                </div>
              </div>
              <div className="text-gray-300 text-lg font-medium">
                Tapez au moins 2 caractères pour rechercher
              </div>
              <div className="text-gray-500 text-sm">
                Recherchez par nom ou prénom
              </div>
            </div>
          ) : results.length === 0 ? (
            <div className="text-center mt-20 space-y-4">
              <div className="flex justify-center">
                <div className="glass-card p-5 rounded-2xl">
                  <Search className="w-12 h-12 text-gray-500" />
                </div>
              </div>
              <div className="text-gray-400 text-lg font-medium">
                Aucun passager trouvé
              </div>
              <div className="text-gray-600 text-sm">
                Essayez une autre recherche
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="text-gray-400 text-sm font-medium mb-4">
                {results.length} résultat{results.length > 1 ? 's' : ''} trouvé{results.length > 1 ? 's' : ''}
              </div>
              {results.map((passenger) => (
                <PassengerCard
                  key={passenger.id}
                  passenger={passenger}
                  onStatusChange={onStatusChange}
                  onClick={() => {}}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
