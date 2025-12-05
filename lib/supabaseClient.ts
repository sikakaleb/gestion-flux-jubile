import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Re-export types from types.ts for backward compatibility
export * from './types';

let supabaseInstance: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient {
  if (!supabaseInstance) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Missing Supabase environment variables');
    }
    
    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey);
  }
  return supabaseInstance;
}

// For backward compatibility - lazy getter
export const supabase = new Proxy({} as SupabaseClient, {
  get(_, prop) {
    return (getSupabaseClient() as any)[prop];
  },
});

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
