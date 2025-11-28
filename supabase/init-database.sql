/*
  # Initialize Passenger Manager Database

  This script initializes a new Supabase database with the complete schema
  for the Passenger Manager application.

  Usage:
    1. Create a new Supabase project (STAGING or PREPROD)
    2. Go to SQL Editor in the Supabase dashboard
    3. Copy and paste this entire script
    4. Click "Run" to execute

  What this script does:
    - Creates the passengers table with all required columns
    - Enables Row Level Security (RLS)
    - Creates permissive RLS policies (adjust for production)
    - Creates performance indexes
*/

-- ============================================================================
-- TABLE CREATION
-- ============================================================================

CREATE TABLE IF NOT EXISTS passengers (
  -- Primary Key
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Required Fields
  first_name text NOT NULL,
  last_name text NOT NULL,
  flight_date date NOT NULL,
  flight_time text NOT NULL,
  airline text NOT NULL,
  accommodation text NOT NULL,

  -- Constrained Fields
  direction text NOT NULL CHECK (direction IN ('arrival', 'departure')),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'picked_up', 'housed')),

  -- Timestamps
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),

  -- Optional Fields
  host_info text,
  is_urgent boolean DEFAULT false,
  tags text[],

  -- New Fields (from Google Sheets import)
  external_id text,
  phone text,
  location text,
  email text
);

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================

-- Enable RLS
ALTER TABLE passengers ENABLE ROW LEVEL SECURITY;

-- Policy: Allow all users to read passengers
CREATE POLICY "Enable read access for all users"
  ON passengers FOR SELECT
  USING (true);

-- Policy: Allow all users to insert passengers
CREATE POLICY "Enable insert access for all users"
  ON passengers FOR INSERT
  WITH CHECK (true);

-- Policy: Allow all users to update passengers
CREATE POLICY "Enable update access for all users"
  ON passengers FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Policy: Allow all users to delete passengers
CREATE POLICY "Enable delete access for all users"
  ON passengers FOR DELETE
  USING (true);

-- NOTE: The above policies are permissive (allow all access).
-- For production, you should implement proper authentication and
-- restrict access based on user roles. See DEPLOYMENT_GUIDE.md for examples.

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

-- Index for external_id lookups (used during CSV import)
CREATE INDEX IF NOT EXISTS idx_passengers_external_id
  ON passengers(external_id);

-- Index for flight_date queries (most common filter)
CREATE INDEX IF NOT EXISTS idx_passengers_flight_date
  ON passengers(flight_date);

-- Index for direction filtering (arrival vs departure)
CREATE INDEX IF NOT EXISTS idx_passengers_direction
  ON passengers(direction);

-- Index for status filtering
CREATE INDEX IF NOT EXISTS idx_passengers_status
  ON passengers(status);

-- Composite index for common query pattern (date + direction)
CREATE INDEX IF NOT EXISTS idx_passengers_date_direction
  ON passengers(flight_date, direction);

-- ============================================================================
-- SAMPLE DATA (OPTIONAL - Comment out for production)
-- ============================================================================

-- Uncomment the following lines to insert sample data for testing:

/*
INSERT INTO passengers (
  first_name, last_name, flight_date, flight_time,
  airline, accommodation, direction, status,
  external_id, phone, email, location, host_info, tags, is_urgent
) VALUES
  (
    'Jean', 'Dupont', '2025-11-27', '14:30',
    'Air France AF1234', 'Hôtel Central - Chambre 101', 'arrival', 'pending',
    'REG001', '+33612345678', 'jean.dupont@example.com',
    'Paris CDG Terminal 2', 'Marie Martin',
    ARRAY['Regular', 'VIP'], false
  ),
  (
    'Sophie', 'Bernard', '2025-11-27', '16:45',
    'Brussels Airlines SN123', 'Hilton Downtown - Suite 205', 'arrival', 'pending',
    'REG002', '+33698765432', 'sophie.b@example.com',
    'Paris Orly Sud', 'Pierre Dubois',
    ARRAY['Regular', 'VIP'], false
  ),
  (
    'Lucas', 'Martin', '2025-11-28', '09:15',
    'Ethiopian Airlines ET456', 'Marriott - Chambre 302', 'arrival', 'pending',
    'REG003', '+33687654321', NULL,
    'Lyon Saint-Exupéry', 'Jean Leroy',
    ARRAY['Regular', 'Enfant'], false
  );
*/

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Run these queries to verify the setup:

-- Check table structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'passengers'
ORDER BY ordinal_position;

-- Check RLS is enabled
SELECT tablename, rowsecurity
FROM pg_tables
WHERE tablename = 'passengers';

-- Check policies exist
SELECT policyname, cmd, qual
FROM pg_policies
WHERE tablename = 'passengers';

-- Check indexes exist
SELECT indexname, indexdef
FROM pg_indexes
WHERE tablename = 'passengers';

-- ============================================================================
-- SUCCESS MESSAGE
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '✅ Database initialization complete!';
  RAISE NOTICE 'Table: passengers';
  RAISE NOTICE 'RLS: Enabled';
  RAISE NOTICE 'Policies: 4 created (read, insert, update, delete)';
  RAISE NOTICE 'Indexes: 5 created';
  RAISE NOTICE '';
  RAISE NOTICE '⚠️  IMPORTANT: Update RLS policies for production use!';
  RAISE NOTICE 'See DEPLOYMENT_GUIDE.md for security recommendations.';
END $$;
