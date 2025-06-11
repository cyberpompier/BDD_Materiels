/*
  # Update materiels table for real and nominal quantities

  1. Modified Tables
    - `materiels`
      - Renamed `quantite` to `quantite_reelle` (integer, default 0)
      - Added `quantite_nominale` (integer, default 0)
  2. Data Migration
    - Populated `quantite_nominale` with existing `quantite_reelle` values for all rows.
  3. Security
    - No changes to RLS policies, existing policies apply to new column names.
*/

-- Rename existing 'quantite' column to 'quantite_reelle'
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'materiels' AND column_name = 'quantite') THEN
    ALTER TABLE materiels RENAME COLUMN quantite TO quantite_reelle;
  END IF;
END $$;

-- Add 'quantite_nominale' column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'materiels' AND column_name = 'quantite_nominale') THEN
    ALTER TABLE materiels ADD COLUMN quantite_nominale integer DEFAULT 0;
  END IF;
END $$;

-- Update 'quantite_nominale' for existing rows to match 'quantite_reelle'
-- This ensures that existing materials have a nominal quantity set.
UPDATE materiels
SET quantite_nominale = quantite_reelle
WHERE quantite_nominale IS NULL; -- Only update if not already set