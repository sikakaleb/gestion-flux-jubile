import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Force dynamic rendering to prevent static optimization
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const fetchCache = 'force-no-store';

// Inline type to avoid importing csvParser at build time
interface ParsedPassenger {
  external_id: string;
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
  location?: string;
  airline: string;
  accommodation: string;
  host_info?: string;
  flight_date: string;
  flight_time: string;
  direction: 'arrival' | 'departure';
  tags: string[];
  status: 'pending' | 'picked_up' | 'housed';
}

// Hardcoded Google Sheet configuration
const SHEET_ID = '1eBtzgwsUKQxw5L_-E6q2ncLok_4x3vBV6NLDSe1EMPA';
const SHEET_GID = '2032719076'; // Details_Inscriptions tab

function getCSVExportUrl(): string {
  return `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=${SHEET_GID}`;
}

/**
 * Server-side upsert - preserves status and is_urgent for existing records
 */
async function serverUpsertPassengers(passengers: ParsedPassenger[]): Promise<{
  created: number;
  updated: number;
  errors: string[];
}> {
  const { createClient } = await import('@supabase/supabase-js');
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  
  const result = { created: 0, updated: 0, errors: [] as string[] };

  for (const passenger of passengers) {
    try {
      // Check if passenger already exists
      const { data: existing, error: fetchError } = await supabase
        .from('passengers')
        .select('id, status, is_urgent')
        .eq('external_id', passenger.external_id)
        .eq('direction', passenger.direction)
        .maybeSingle();

      if (fetchError) {
        result.errors.push(`Fetch error for ${passenger.first_name} ${passenger.last_name}: ${fetchError.message}`);
        continue;
      }

      if (existing) {
        // UPDATE: Preserve status and is_urgent
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
          })
          .eq('id', existing.id);

        if (updateError) {
          result.errors.push(`Update error for ${passenger.first_name} ${passenger.last_name}: ${updateError.message}`);
        } else {
          result.updated++;
        }
      } else {
        // INSERT: New record
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
          result.errors.push(`Insert error for ${passenger.first_name} ${passenger.last_name}: ${insertError.message}`);
        } else {
          result.created++;
        }
      }
    } catch (error) {
      result.errors.push(
        `Unexpected error for ${passenger.first_name} ${passenger.last_name}: ${error instanceof Error ? error.message : 'Unknown'}`
      );
    }
  }

  return result;
}

/**
 * GET /api/cron/sync
 * Automated sync triggered by Vercel Cron
 */
export async function GET(request: NextRequest) {
  const startTime = Date.now();

  try {
    // Security: Verify CRON_SECRET
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      console.log('[CRON SYNC] Unauthorized request - invalid or missing CRON_SECRET');
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.log('[CRON SYNC] Starting automated sync...');

    // Step 1: Fetch CSV from Google Sheets
    const csvUrl = getCSVExportUrl();
    console.log(`[CRON SYNC] Fetching CSV from: ${csvUrl}`);

    const response = await fetch(csvUrl, {
      headers: {
        'User-Agent': 'CMCI-Jubile-Sync/1.0',
      },
    });

    if (!response.ok) {
      const errorMsg = `Failed to fetch CSV: ${response.status} ${response.statusText}`;
      console.error(`[CRON SYNC] ${errorMsg}`);
      return NextResponse.json(
        { success: false, error: errorMsg },
        { status: 502 }
      );
    }

    const csvContent = await response.text();
    const rawRowCount = csvContent.split('\n').length;
    console.log(`[CRON SYNC] CSV fetched successfully. ${rawRowCount} raw rows.`);

    // Step 2: Parse CSV using existing parser (dynamic import)
    const { parsePassengerCSV } = await import('@/utils/csvParser');
    const parseResult = await parsePassengerCSV(csvContent);
    console.log(`[CRON SYNC] Parsed ${parseResult.passengers.length} valid passengers. Skipped: ${parseResult.skipped}. Rescued: ${parseResult.rescued}`);

    if (parseResult.passengers.length === 0) {
      console.log('[CRON SYNC] No passengers to sync after parsing.');
      return NextResponse.json({
        success: true,
        message: 'No passengers to sync',
        stats: {
          rawRows: rawRowCount,
          parsed: 0,
          skipped: parseResult.skipped,
          rescued: parseResult.rescued,
          created: 0,
          updated: 0,
        },
        duration: `${Date.now() - startTime}ms`,
      });
    }

    // Step 3: Upsert to database
    const upsertResult = await serverUpsertPassengers(parseResult.passengers);
    console.log(`[CRON SYNC] Upsert complete. Created: ${upsertResult.created}, Updated: ${upsertResult.updated}`);

    if (upsertResult.errors.length > 0) {
      console.warn(`[CRON SYNC] ${upsertResult.errors.length} errors during upsert:`, upsertResult.errors.slice(0, 5));
    }

    const duration = Date.now() - startTime;
    console.log(`[CRON SYNC] Sync completed in ${duration}ms`);

    const totalSynced = upsertResult.created + upsertResult.updated;
    return NextResponse.json({
      success: true,
      message: `Synced ${totalSynced} rows (${upsertResult.created} created, ${upsertResult.updated} updated)`,
      stats: {
        rawRows: rawRowCount,
        parsed: parseResult.passengers.length,
        skipped: parseResult.skipped,
        rescued: parseResult.rescued,
        created: upsertResult.created,
        updated: upsertResult.updated,
        errors: upsertResult.errors.length,
      },
      duration: `${duration}ms`,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('[CRON SYNC] Fatal error:', errorMessage);

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
        duration: `${Date.now() - startTime}ms`,
      },
      { status: 500 }
    );
  }
}

// Also support POST for manual triggers
export async function POST(request: NextRequest) {
  return GET(request);
}
