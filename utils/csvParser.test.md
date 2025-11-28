# CSV Parser Test Documentation

## Overview
The CSV parser handles Google Sheet exports with strict filtering and mapping rules.

## Parsing Rules

### 1. FILTER RULE
**Only process rows where `STATUT` contains "PRIS EN CHARGE"**
- Case-insensitive matching
- Accepts two variants:
  - "PRIS EN CHARGE PAR LA COMMISSION"
  - "ENFANT - PRIS EN CHARGE PAR LA COMMISSION"
- Any other status containing "PRIS EN CHARGE" will also work
- Rows with other statuses are skipped and counted

### 2. FIELD MAPPING

| CSV Header | Database Column | Notes |
|------------|----------------|-------|
| Registration ID | external_id | Required - Used as unique key |
| First Name | first_name | Required |
| Last Name | last_name | Required |
| Email | email | Optional |
| Phone | phone | Optional |
| LIEU D'ARRIVEE | location | Optional |
| COMPAGNIE | airline | Defaults to "Non spécifié" |
| HEBERGEMENT | accommodation | Defaults to "Non assigné" |
| Référent | host_info | Optional |

### 3. SMART TAGGING

The system automatically generates tags based on passenger attributes:

- **Base Tag**: All passengers get `'Regular'`
- **Child Detection**: If `Homme / Femme / Enfant` contains "Enfant" → Add `'Enfant'`
- **VIP Detection**: If `Role` contains "Pastor" or "Leader" → Add `'VIP'`

Examples:
- Regular passenger: `['Regular']`
- Child: `['Regular', 'Enfant']`
- Pastor: `['Regular', 'VIP']`
- Child Pastor: `['Regular', 'Enfant', 'VIP']`

### 4. ROW SPLITTING (Arrival vs Departure)

Each CSV row can generate **1 or 2 database records**:

#### Arrival Record
Created if `JOUR D'ARRIVEE` has a valid date:
- `direction`: `'arrival'`
- `flight_date`: Parsed from `JOUR D'ARRIVEE`
- `flight_time`: Parsed from `HEURE D'ARRIVEE`

#### Departure Record
Created if `JOUR DE DEPART` has a valid date:
- `direction`: `'departure'`
- `flight_date`: Parsed from `JOUR DE DEPART`
- `flight_time`: Parsed from `HEURE DE DEPART`

**Important**: Both records share the same `external_id` but have different `direction` values.

### 5. DATE & TIME PARSING

#### Date Formats Supported
- `dd/MM/yyyy` (e.g., "27/11/2025")
- `MM/dd/yyyy` (e.g., "11/27/2025")
- `yyyy-MM-dd` (e.g., "2025-11-27")
- `d/M/yyyy` (e.g., "7/1/2025")
- `M/d/yyyy` (e.g., "1/7/2025")

Output format: `yyyy-MM-dd`

#### Time Formats Supported
- `HH:mm` (e.g., "14:30")
- `H:mm` (e.g., "9:15")
- `HH` (e.g., "14" → "14:00")
- `H:MM AM/PM` (e.g., "2:30 PM" → "14:30")
- `HHhMM` (e.g., "14h30" → "14:30")

Output format: `HH:mm` (24-hour)

### 6. SAFE UPSERT LOGIC

The upsert uses **`external_id` + `direction`** as the composite unique key.

#### On INSERT (New Record)
All fields are set, including:
- `status`: `'pending'` (default)
- `is_urgent`: `false` (default)

#### On UPDATE (Existing Record)
**Updated Fields**:
- `first_name`, `last_name`
- `flight_date`, `flight_time`
- `airline`, `accommodation`
- `email`, `phone`, `location`
- `host_info`, `tags`
- `updated_at`

**NEVER Updated** (Preserved from existing record):
- `status` (User may have marked as picked_up or housed)
- `is_urgent` (Admin may have flagged as urgent)

This ensures manual updates by staff are never lost during CSV sync.

## Example CSV Row

```csv
Registration ID,First Name,Last Name,Email,Phone,LIEU D'ARRIVEE,COMPAGNIE,HEBERGEMENT,Référent,STATUT,Homme / Femme / Enfant,Role,JOUR D'ARRIVEE,HEURE D'ARRIVEE,JOUR DE DEPART,HEURE DE DEPART
REG001,Jean,Dupont,jean@example.com,+33612345678,Paris CDG,Air France AF1234,Hôtel Central,Marie Martin,PRIS EN CHARGE,Homme,Pastor,27/11/2025,14:30,30/11/2025,18:00
```

**Generates 2 records**:

1. **Arrival Record**:
   - external_id: "REG001"
   - direction: "arrival"
   - flight_date: "2025-11-27"
   - flight_time: "14:30"
   - tags: ['Regular', 'VIP']

2. **Departure Record**:
   - external_id: "REG001"
   - direction: "departure"
   - flight_date: "2025-11-30"
   - flight_time: "18:00"
   - tags: ['Regular', 'VIP']

## Error Handling

The parser tracks:
- **Skipped rows**: Rows that don't match "PRIS EN CHARGE" filter
- **Errors**: Rows with missing required fields or invalid data
- **Successful parses**: Valid passenger records created

Return format:
```typescript
{
  success: boolean,
  passengers: ParsedPassenger[],
  errors: string[],
  skipped: number
}
```
