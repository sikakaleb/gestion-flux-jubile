import { supabase } from '@/lib/supabaseClient';
import { ParsedPassenger } from './csvParser';

export interface ImportResult {
  success: boolean;
  created: number;
  updated: number;
  errors: string[];
}

/**
 * Safe upsert: Updates flight details, phone, and accommodation
 * but NEVER overwrites status or is_urgent if record exists
 */
export async function upsertPassengers(passengers: ParsedPassenger[]): Promise<ImportResult> {
  const result: ImportResult = {
    success: true,
    created: 0,
    updated: 0,
    errors: [],
  };

  for (const passenger of passengers) {
    try {
      // Check if passenger already exists (by external_id + direction)
      const { data: existing, error: fetchError } = await supabase
        .from('passengers')
        .select('id, status, is_urgent')
        .eq('external_id', passenger.external_id)
        .eq('direction', passenger.direction)
        .maybeSingle();

      if (fetchError) {
        result.errors.push(
          `Error checking existing record for ${passenger.first_name} ${passenger.last_name}: ${fetchError.message}`
        );
        result.success = false;
        continue;
      }

      if (existing) {
        // UPDATE: Preserve status and is_urgent, update everything else
        const { error: updateError } = await supabase
          .from('passengers')
          .update({
            first_name: passenger.first_name,
            last_name: passenger.last_name,
            flight_date: passenger.flight_date,
            flight_time: passenger.flight_time,
            airline: passenger.airline,
            accommodation: passenger.accommodation,
            email: passenger.email,
            phone: passenger.phone,
            location: passenger.location,
            host_info: passenger.host_info,
            tags: passenger.tags,
            updated_at: new Date().toISOString(),
            // NEVER update: status, is_urgent
          })
          .eq('id', existing.id);

        if (updateError) {
          result.errors.push(
            `Error updating ${passenger.first_name} ${passenger.last_name}: ${updateError.message}`
          );
          result.success = false;
        } else {
          result.updated++;
        }
      } else {
        // INSERT: New record with all fields including default status
        const { error: insertError } = await supabase
          .from('passengers')
          .insert({
            external_id: passenger.external_id,
            first_name: passenger.first_name,
            last_name: passenger.last_name,
            flight_date: passenger.flight_date,
            flight_time: passenger.flight_time,
            airline: passenger.airline,
            accommodation: passenger.accommodation,
            direction: passenger.direction,
            status: passenger.status,
            email: passenger.email,
            phone: passenger.phone,
            location: passenger.location,
            host_info: passenger.host_info,
            tags: passenger.tags,
            is_urgent: false,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });

        if (insertError) {
          result.errors.push(
            `Error inserting ${passenger.first_name} ${passenger.last_name}: ${insertError.message}`
          );
          result.success = false;
        } else {
          result.created++;
        }
      }
    } catch (error) {
      result.errors.push(
        `Unexpected error processing ${passenger.first_name} ${passenger.last_name}: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`
      );
      result.success = false;
    }
  }

  return result;
}

/**
 * Complete import workflow: Parse CSV and upsert to database
 */
export async function importPassengersFromCSV(
  csvContent: string,
  parseFunction: (content: string) => Promise<any>
): Promise<{ parseResult: any; importResult: ImportResult }> {
  // Parse CSV
  const parseResult = await parseFunction(csvContent);

  if (!parseResult.success || parseResult.passengers.length === 0) {
    return {
      parseResult,
      importResult: {
        success: false,
        created: 0,
        updated: 0,
        errors: parseResult.errors,
      },
    };
  }

  // Upsert to database
  const importResult = await upsertPassengers(parseResult.passengers);

  return {
    parseResult,
    importResult,
  };
}
