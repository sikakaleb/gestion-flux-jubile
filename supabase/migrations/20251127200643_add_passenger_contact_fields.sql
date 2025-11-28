/*
  # Add Contact and External ID Fields to Passengers

  ## Changes
  
  1. New Columns Added
    - `external_id` (text) - Maps to 'Registration ID' from Excel, used for deduplication
    - `phone` (text) - Passenger phone number
    - `location` (text) - Maps to 'LIEU D'ARRIVEE' (arrival location)
    - `email` (text) - Passenger email address
  
  2. Notes
    - All new fields are nullable to support gradual migration of existing data
    - `external_id` will be used for uniqueness checks during CSV import
    - These fields align with the client's Excel file structure
*/

-- Add external_id column for tracking Registration ID
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'passengers' AND column_name = 'external_id'
  ) THEN
    ALTER TABLE passengers ADD COLUMN external_id text;
  END IF;
END $$;

-- Add phone column
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'passengers' AND column_name = 'phone'
  ) THEN
    ALTER TABLE passengers ADD COLUMN phone text;
  END IF;
END $$;

-- Add location column (LIEU D'ARRIVEE)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'passengers' AND column_name = 'location'
  ) THEN
    ALTER TABLE passengers ADD COLUMN location text;
  END IF;
END $$;

-- Add email column
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'passengers' AND column_name = 'email'
  ) THEN
    ALTER TABLE passengers ADD COLUMN email text;
  END IF;
END $$;

-- Create index on external_id for faster lookups during import
CREATE INDEX IF NOT EXISTS idx_passengers_external_id ON passengers(external_id);
