// Passenger types - separated to avoid importing the Supabase client unnecessarily

export type PassengerStatus = 'pending' | 'picked_up' | 'housed';
export type PassengerDirection = 'arrival' | 'departure';

export interface Passenger {
  id: string;
  first_name: string;
  last_name: string;
  flight_date: string;
  flight_time: string;
  airline: string;
  accommodation: string;
  direction: PassengerDirection;
  status: PassengerStatus;
  host_info?: string;
  is_urgent?: boolean;
  tags?: string[];
  external_id?: string;
  phone?: string;
  location?: string;
  email?: string;
  last_synced_at?: string; // Track when passenger was last seen in source data
}

/**
 * Check if a passenger is no longer in the source data (not synced recently)
 * @param passenger - The passenger to check
 * @param hoursThreshold - Hours since last sync to consider as "removed" (default: 24)
 * @returns true if passenger hasn't been synced within the threshold
 */
export function isPassengerRemoved(passenger: Passenger, hoursThreshold: number = 24): boolean {
  if (!passenger.last_synced_at) return false; // No data = assume OK (legacy records)
  
  const lastSync = new Date(passenger.last_synced_at);
  const now = new Date();
  const hoursSinceSync = (now.getTime() - lastSync.getTime()) / (1000 * 60 * 60);
  
  return hoursSinceSync > hoursThreshold;
}

/**
 * Check if a passenger is urgent (pending and flight time has passed)
 * @param passenger - The passenger to check
 * @param minutesThreshold - Minutes after flight time to consider as urgent (default: 10)
 * @returns true if passenger is pending and their flight was more than minutesThreshold ago
 */
export function isPassengerUrgent(passenger: Passenger, minutesThreshold: number = 10): boolean {
  // Only pending passengers can be urgent
  if (passenger.status !== 'pending') return false;
  
  // Manual override: if is_urgent is explicitly set, use it
  if (passenger.is_urgent === true) return true;
  
  // Only arrivals can be "urgent" (departures are different)
  if (passenger.direction !== 'arrival') return false;
  
  try {
    // Parse flight date and time
    const [year, month, day] = passenger.flight_date.split('-').map(Number);
    const [hours, minutes] = passenger.flight_time.split(':').map(Number);
    
    const flightDateTime = new Date(year, month - 1, day, hours, minutes);
    const now = new Date();
    
    const minutesSinceFlight = (now.getTime() - flightDateTime.getTime()) / (1000 * 60);
    
    // Urgent if flight was more than minutesThreshold ago and still pending
    return minutesSinceFlight > minutesThreshold;
  } catch {
    return false; // If parsing fails, not urgent
  }
}

export const STATUS_LABELS: Record<PassengerStatus, string> = {
  pending: 'En attente',
  picked_up: 'Récupéré',
  housed: 'Hébergé',
};

export const STATUS_COLORS: Record<PassengerStatus, string> = {
  pending: 'bg-gray-100 text-gray-700 border-gray-300',
  picked_up: 'bg-green-100 text-green-700 border-green-300',
  housed: 'bg-blue-100 text-blue-700 border-blue-300',
};

export const STATUS_BORDER_COLORS: Record<PassengerStatus, string> = {
  pending: 'border-l-gray-400',
  picked_up: 'border-l-green-500',
  housed: 'border-l-blue-500',
};
