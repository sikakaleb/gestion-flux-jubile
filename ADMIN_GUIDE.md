# Admin Panel Guide

## Accessing the Admin Panel

1. Navigate to `/admin` in your browser
2. Enter the PIN code: **23700**
3. Click "Déverrouiller" to access the admin dashboard

## Features

### Google Sheets Synchronization

The admin panel allows you to sync passenger data directly from a Google Sheet.

#### Default Configuration

The Google Sheets URL is pre-filled with:
```
https://docs.google.com/spreadsheets/d/1eBtzgwsUKQxw5L_-E6q2ncLok_4x3vBV6NLDSe1EMPA/edit?usp=sharing
```

You can modify this URL if you need to sync from a different sheet.

#### How It Works

1. **URL Transformation**: The system automatically converts the Google Sheets edit URL to a CSV export URL
   - Input: `https://docs.google.com/spreadsheets/d/[ID]/edit?usp=sharing`
   - Converted: `https://docs.google.com/spreadsheets/d/[ID]/export?format=csv&gid=1`
   - **Smart Tab Detection**: If your URL contains `#gid=123456789`, that specific tab will be exported
   - **Default Behavior**: If no `gid` is found, the **second tab** (gid=1, "Details_Inscriptions") is used by default
   - **Note**: Google Sheets API only supports tab selection by gid number, not by name

2. **CSV Fetching**: The system downloads the CSV directly from Google Sheets

3. **Data Processing**:
   - Only rows with `STATUT = "PRIS EN CHARGE"` are imported
   - Smart tagging based on passenger attributes
   - Automatic arrival/departure record splitting

4. **Safe Upsert**:
   - New passengers are created with default status `pending`
   - Existing passengers are updated BUT their `status` and `is_urgent` fields are preserved
   - Uses `external_id` + `direction` as the unique key

### How to Target a Specific Sheet Tab

By default, the system imports from the **second tab** (gid=1, typically "Details_Inscriptions"). To import from a different tab:

#### Method 1: Copy URL from the Tab (Recommended)

1. Open your Google Sheet
2. Click on the tab you want to import (e.g., "Details_Inscriptions")
3. Copy the URL from your browser's address bar
4. The URL will look like: `https://docs.google.com/spreadsheets/d/[ID]/edit#gid=123456789`
5. Paste this complete URL in the admin panel
6. The system will automatically detect `gid=123456789` and use that tab

#### Method 2: Add gid Manually

If you know the tab's gid number:
- Add `#gid=123456789` to the end of your URL
- Example: `https://docs.google.com/spreadsheets/d/[ID]/edit#gid=123456789`

#### Finding a Tab's GID

1. Right-click on the tab name at the bottom of Google Sheets
2. Select "Copy link to this sheet"
3. The link will contain the gid number

**Note:** The sync logs will show which tab is being used (e.g., "Deuxième onglet 'Details_Inscriptions' (par défaut)" or "Onglet avec gid=123456789")

#### Why Second Tab by Default?

Your Google Sheet has the passenger data in the second tab named "Details_Inscriptions". Since Google Sheets API cannot select tabs by name (only by gid number), the system defaults to gid=1 (second tab) which corresponds to your "Details_Inscriptions" tab.

### Real-Time Logs

The admin panel displays a real-time console showing:

- **Info** (blue): Processing steps and statistics
- **Success** (green): Successful operations
- **Warning** (yellow): Non-critical issues
- **Error** (red): Problems that need attention

### Sync Statistics

After each sync, you'll see:
- Number of rows fetched from CSV
- Number of passengers extracted (after filtering)
- Arrival vs Departure breakdown
- Records created vs updated
- Any errors encountered

## Expected CSV Format

The Google Sheet should have these columns:

### Required Columns
- `Registration ID` - Unique identifier for the passenger
- `First Name` - Passenger's first name
- `Last Name` - Passenger's last name
- `STATUT` - Must contain "PRIS EN CHARGE" to be imported (e.g., "PRIS EN CHARGE PAR LA COMMISSION" or "ENFANT - PRIS EN CHARGE PAR LA COMMISSION")

### Optional Columns
- `Email` - Email address
- `Phone` - Phone number
- `LIEU D'ARRIVEE` - Arrival location
- `COMPAGNIE` - Airline
- `HEBERGEMENT` - Accommodation
- `Référent` - Host/reference person
- `Homme / Femme / Enfant` - Person type (used for tagging)
- `Role` - Role (Pastor/Leader triggers VIP tag)
- `JOUR D'ARRIVEE` + `HEURE D'ARRIVEE` - Arrival date and time
- `JOUR DE DEPART` + `HEURE DE DEPART` - Departure date and time

### Example Rows

**Adult with full details:**
```csv
REG001,Jean,Dupont,jean@example.com,+33612345678,Paris CDG,Air France AF1234,Hôtel Central,Marie Martin,PRIS EN CHARGE PAR LA COMMISSION,Homme,Pastor,27/11/2025,14:30,30/11/2025,18:00
```
This creates **2 records**: Arrival (27/11 at 14:30) + Departure (30/11 at 18:00), with tags: `['Regular', 'VIP']`

**Child passenger:**
```csv
REG002,Lucas,Martin,,+33687654321,Lyon,Ethiopian Airlines ET456,Marriott,Jean Leroy,ENFANT - PRIS EN CHARGE PAR LA COMMISSION,Enfant,,28/11/2025,09:15,29/11/2025,20:30
```
This creates **2 records**: Arrival (28/11 at 09:15) + Departure (29/11 at 20:30), with tags: `['Regular', 'Enfant']`

**Skipped (wrong status):**
```csv
REG003,Marie,Dubois,marie@example.com,,Marseille,Turkish Airlines,InterContinental,Sophie,EN ATTENTE,Femme,,28/11/2025,11:00,,
```
This is **skipped** because STATUT doesn't contain "PRIS EN CHARGE"

## Smart Tagging Rules

The system automatically generates tags:

- **Base Tag**: All passengers get `'Regular'`
- **Child Tag**: If `Homme / Femme / Enfant` contains "Enfant" → Add `'Enfant'`
- **VIP Tag**: If `Role` contains "Pastor" or "Leader" → Add `'VIP'`

## Troubleshooting

### "URL Google Sheets invalide"
- Make sure the URL contains `/spreadsheets/d/[ID]/`
- The URL should be from Google Sheets, not Google Docs or Drive

### "Aucun passager à synchroniser"
- Check that your sheet has rows with `STATUT = "PRIS EN CHARGE"`
- Verify the CSV has the required columns
- Check the logs for parsing errors

### "Erreur HTTP: 404"
- The Google Sheet may not be publicly accessible
- Make sure the sheet is shared with "Anyone with the link"

### Data Not Updating
- Remember: `status` and `is_urgent` fields are NEVER overwritten
- Only flight details, contact info, and accommodation are updated
- Check the logs to see if records were updated vs created

## Security Notes

- The PIN code is hardcoded in the application (23700)
- This is client-side protection only - not suitable for production
- For production use, implement proper server-side authentication
- Consider using Supabase Auth for secure admin access

## Troubleshooting

### Error: "Failed to fetch" or "Erreur HTTP: 403"

This error means the Google Sheet is not publicly accessible. To fix:

1. Open your Google Sheet
2. Click the **"Share"** button (top-right corner)
3. Under "General access", select **"Anyone with the link"**
4. Set permission to **"Viewer"** (read-only is sufficient)
5. Click "Done"
6. Try syncing again

**Important**: The sheet must be publicly accessible for the CSV export to work.

### Error: No data imported

Possible causes:
1. **Wrong tab selected**: Make sure you clicked on the correct tab (e.g., "Details_Inscriptions") before copying the URL
2. **STATUT field missing**: Check that your CSV has a column named "STATUT"
3. **No matching rows**: All rows may have a STATUT that doesn't contain "PRIS EN CHARGE"

Check the sync logs for the exact number of rows skipped.

### Error: Missing required fields

Each row must have:
- `Registration ID` - Unique identifier
- `First Name` - Cannot be empty
- `Last Name` - Cannot be empty

Rows with missing required fields are skipped and logged.

## Best Practices

1. **Before Syncing**: Review the Google Sheet for data accuracy
2. **Share the Sheet**: Ensure it's set to "Anyone with the link" with Viewer access
3. **Select the Correct Tab**: Click on the data tab before copying the URL
4. **During Sync**: Monitor the real-time logs for errors
5. **After Sync**: Check the main app to verify data appears correctly
6. **Regular Syncs**: Run sync periodically to keep data up-to-date
7. **Backup**: Google Sheets serves as your backup - never delete it!
