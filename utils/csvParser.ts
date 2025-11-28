import Papa from 'papaparse';
import { format, parse } from 'date-fns';
import { PassengerStatus, PassengerDirection } from '@/lib/supabaseClient';

export interface CSVRow {
  'Registration ID': string;
  'First Name': string;
  'Last Name': string;
  'Email': string;
  'Phone': string;
  'Participation Mode': string;
  'STATUT': string;
  'LIEU D\'ARRIVEE': string;
  'COMPAGNIE': string;
  'HEBERGEMENT': string;
  'Référent': string;
  'Homme / Femme / Enfant': string;
  'Role': string;
  'JOUR D\'ARRIVEE': string;
  'HEURE D\'ARRIVEE': string;
  'JOUR DE DEPART': string;
  'HEURE DE DEPART': string;
}

export interface ParsedPassenger {
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
  direction: PassengerDirection;
  tags: string[];
  status: PassengerStatus;
}

export interface ParseResult {
  success: boolean;
  passengers: ParsedPassenger[];
  errors: string[];
  skipped: number;
}

/**
 * Parse a date string in various formats to YYYY-MM-DD
 */
function parseDate(dateStr: string): string | null {
  if (!dateStr || dateStr.trim() === '') return null;

  const cleaned = dateStr.trim();

  // Try common date formats
  const formats = [
    'dd/MM/yyyy',
    'MM/dd/yyyy',
    'yyyy-MM-dd',
    'd/M/yyyy',
    'M/d/yyyy',
  ];

  for (const fmt of formats) {
    try {
      const parsed = parse(cleaned, fmt, new Date());
      if (!isNaN(parsed.getTime())) {
        return format(parsed, 'yyyy-MM-dd');
      }
    } catch (e) {
      continue;
    }
  }

  return null;
}

/**
 * Parse a time string to HH:mm format
 */
function parseTime(timeStr: string): string {
  if (!timeStr || timeStr.trim() === '') return '00:00';

  const cleaned = timeStr.trim();

  // Handle formats like "14:30", "2:30 PM", "14h30", etc.
  const timeMatch = cleaned.match(/(\d{1,2})[:\h]?(\d{2})?/);

  if (timeMatch) {
    let hours = parseInt(timeMatch[1]);
    const minutes = timeMatch[2] ? parseInt(timeMatch[2]) : 0;

    // Handle AM/PM
    if (cleaned.toLowerCase().includes('pm') && hours < 12) {
      hours += 12;
    } else if (cleaned.toLowerCase().includes('am') && hours === 12) {
      hours = 0;
    }

    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  }

  return '00:00';
}

/**
 * Generate tags based on passenger attributes
 */
function generateTags(row: CSVRow): string[] {
  const tags: string[] = ['Regular'];

  // Check for child
  const personType = row['Homme / Femme / Enfant'] || '';
  if (personType.toLowerCase().includes('enfant')) {
    tags.push('Enfant');
  }

  // Check for VIP (Pastor/Leader)
  const role = row['Role'] || '';
  if (role.toLowerCase().includes('pastor') || role.toLowerCase().includes('leader')) {
    tags.push('VIP');
  }

  return tags;
}

/**
 * Parse CSV file and extract passenger data
 */
export function parsePassengerCSV(csvContent: string): Promise<ParseResult> {
  return new Promise((resolve) => {
    const passengers: ParsedPassenger[] = [];
    const errors: string[] = [];
    let skipped = 0;
    const statutSamples: Set<string> = new Set();
    const availableColumns: string[] = [];

    // Clean CSV: Remove noise lines before the real header
    // Look for the line that starts with "Registration ID"
    const lines = csvContent.split('\n');
    let headerLineIndex = -1;

    for (let i = 0; i < Math.min(lines.length, 20); i++) {
      const line = lines[i].trim();
      if (line.startsWith('Registration ID')) {
        headerLineIndex = i;
        break;
      }
    }

    // If we found the header, remove all lines before it
    let cleanedContent = csvContent;
    if (headerLineIndex > 0) {
      cleanedContent = lines.slice(headerLineIndex).join('\n');
      errors.push(`ℹ️ Nettoyage: ${headerLineIndex} ligne(s) de bruit supprimée(s) avant l'en-tête`);
    } else if (headerLineIndex === -1) {
      errors.push('⚠️ ATTENTION: En-tête "Registration ID" non trouvé dans les 20 premières lignes');
    }

    Papa.parse<CSVRow>(cleanedContent, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header: string) => header.trim(),
      complete: (results) => {
        // Capture column names from first row
        if (results.data.length > 0) {
          availableColumns.push(...Object.keys(results.data[0]));
        }

        results.data.forEach((row, index) => {
          try {
            // Collect sample status values (first 10 unique values)
            // ONLY use "STATUT" column
            if (statutSamples.size < 10) {
              const statutValue = (row['STATUT'] || '').trim();
              if (statutValue) {
                statutSamples.add(statutValue);
              }
            }

            // FILTER: Only process rows where status is EXACTLY one of these two values
            // ✅ Accepts: "PRIS EN CHARGE PAR LA COMMISSION"
            // ✅ Accepts: "ENFANT - PRIS EN CHARGE PAR LA COMMISSION"
            // ❌ Rejects: "NON PRIS EN CHARGE PAR LA COMMISSION" and all others
            const statut = (row['STATUT'] || '').trim();

            const isValidStatut =
              statut === 'PRIS EN CHARGE PAR LA COMMISSION' ||
              statut === 'ENFANT - PRIS EN CHARGE PAR LA COMMISSION';

            if (!isValidStatut) {
              skipped++;
              return;
            }

            // Validate required fields
            const externalId = (row['Registration ID'] || '').trim();
            const firstName = (row['First Name'] || '').trim();
            const lastName = (row['Last Name'] || '').trim();

            if (!externalId || !firstName || !lastName) {
              errors.push(`Row ${index + 2}: Missing required fields (Registration ID, First Name, or Last Name)`);
              skipped++;
              return;
            }

            // Extract common fields
            const email = (row['Email'] || '').trim() || undefined;
            const phone = (row['Phone'] || '').trim() || undefined;
            const location = (row['LIEU D\'ARRIVEE'] || '').trim() || undefined;
            const airline = (row['COMPAGNIE'] || '').trim() || 'Non spécifié';
            const accommodation = (row['HEBERGEMENT'] || '').trim() || 'Non assigné';
            const host_info = (row['Référent'] || '').trim() || undefined;
            const tags = generateTags(row);

            // ARRIVAL: Process if JOUR D'ARRIVEE exists
            const arrivalDate = parseDate(row['JOUR D\'ARRIVEE'] || '');
            if (arrivalDate) {
              const arrivalTime = parseTime(row['HEURE D\'ARRIVEE'] || '');

              passengers.push({
                external_id: externalId,
                first_name: firstName,
                last_name: lastName,
                email,
                phone,
                location,
                airline,
                accommodation,
                host_info,
                flight_date: arrivalDate,
                flight_time: arrivalTime,
                direction: 'arrival',
                tags,
                status: 'pending',
              });
            }

            // DEPARTURE: Process if JOUR DE DEPART exists
            const departureDate = parseDate(row['JOUR DE DEPART'] || '');
            if (departureDate) {
              const departureTime = parseTime(row['HEURE DE DEPART'] || '');

              passengers.push({
                external_id: externalId,
                first_name: firstName,
                last_name: lastName,
                email,
                phone,
                location,
                airline,
                accommodation,
                host_info,
                flight_date: departureDate,
                flight_time: departureTime,
                direction: 'departure',
                tags,
                status: 'pending',
              });
            }

            // If neither arrival nor departure date exists, log error
            if (!arrivalDate && !departureDate) {
              errors.push(`Row ${index + 2}: No valid arrival or departure date found for ${firstName} ${lastName}`);
              skipped++;
            }

          } catch (error) {
            errors.push(`Row ${index + 2}: ${error instanceof Error ? error.message : 'Unknown error'}`);
            skipped++;
          }
        });

        // Add diagnostic info if no passengers found
        if (passengers.length === 0 && skipped > 0) {
          const requiredColumns = ['Registration ID', 'First Name', 'Last Name'];
          const statusColumns = ['STATUT'];
          const dateColumns = ['JOUR D\'ARRIVEE', 'JOUR DE DEPART'];
          const optionalColumns = ['Email', 'Phone', 'LIEU D\'ARRIVEE', 'COMPAGNIE', 'HEBERGEMENT', 'Référent'];

          errors.push('❌ DIAGNOSTIC: Aucun passager trouvé avec statut valide');
          errors.push('   Statuts acceptés:');
          errors.push('     ✅ "PRIS EN CHARGE PAR LA COMMISSION"');
          errors.push('     ✅ "ENFANT - PRIS EN CHARGE PAR LA COMMISSION"');
          errors.push('   Tous les autres statuts sont ignorés (y compris "NON PRIS EN CHARGE...")');
          errors.push('');
          errors.push('📋 CHAMPS REQUIS:');
          requiredColumns.forEach(col => {
            const found = availableColumns.includes(col);
            errors.push(`   ${found ? '✅' : '❌'} ${col} ${found ? '' : '(MANQUANT!)'}`);
          });

          errors.push('');
          errors.push('📋 CHAMP STATUT (requis):');
          statusColumns.forEach(col => {
            const found = availableColumns.includes(col);
            errors.push(`   ${found ? '✅' : '❌'} ${col} ${found ? '' : '(MANQUANT!)'}`);
          });

          errors.push('');
          errors.push('📋 CHAMPS DATE (au moins 1 requis):');
          dateColumns.forEach(col => {
            const found = availableColumns.includes(col);
            errors.push(`   ${found ? '✅' : '⚠️'} ${col} ${found ? '' : '(absent)'}`);
          });

          errors.push('');
          errors.push('📋 CHAMPS OPTIONNELS:');
          optionalColumns.forEach(col => {
            const found = availableColumns.includes(col);
            errors.push(`   ${found ? '✅' : '⚪'} ${col}`);
          });

          errors.push('');
          errors.push('📊 TOUTES LES COLONNES TROUVÉES:');
          if (availableColumns.length > 0) {
            errors.push(`   ${availableColumns.join(', ')}`);
          } else {
            errors.push('   (Aucune colonne trouvée)');
          }

          errors.push('');
          const hasStatut = availableColumns.includes('STATUT');

          if (hasStatut) {
            errors.push(`✓ Colonne STATUT utilisée: "STATUT"`);
            errors.push('');
            errors.push(`📊 Exemples de valeurs dans "STATUT":`);
            if (statutSamples.size > 0) {
              Array.from(statutSamples).slice(0, 10).forEach(sample => {
                const isValid =
                  sample === 'PRIS EN CHARGE PAR LA COMMISSION' ||
                  sample === 'ENFANT - PRIS EN CHARGE PAR LA COMMISSION';
                errors.push(`   ${isValid ? '✅' : '❌'} "${sample}"`);
              });
            } else {
              errors.push(`   (La colonne "STATUT" est vide dans toutes les lignes)`);
            }
          } else {
            errors.push('❌ ERREUR CRITIQUE: La colonne "STATUT" est requise mais absente du CSV!');
          }
        }

        resolve({
          success: errors.length === 0,
          passengers,
          errors,
          skipped,
        });
      },
      error: (error: Error) => {
        resolve({
          success: false,
          passengers: [],
          errors: [`CSV parsing failed: ${error.message}`],
          skipped: 0,
        });
      },
    });
  });
}
