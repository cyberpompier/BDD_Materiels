/*
  # Update RLS policies for case-insensitivity and add affectation to materiels

  1. Table Modifications
    - `materiels`: Add `affectation` column (text, default '') if it doesn't exist.
  2. Security
    - Update RLS policies for `personnel`, `engins`, and `materiels` tables to use `lower()` for case-insensitive comparison of `affectation` fields with user metadata.
    - Ensure `SELECT` policies for `personnel`, `engins`, and `materiels` are based on `affectation` matching `auth.jwt() ->> 'user_metadata' ->> 'affectation'`.
*/

-- Add affectation column to materiels table if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'materiels' AND column_name = 'affectation'
  ) THEN
    ALTER TABLE materiels ADD COLUMN affectation text DEFAULT '';
  END IF;
END $$;

-- Update RLS policy for personnel table to be case-insensitive
DO $$ BEGIN
  EXECUTE 'DROP POLICY IF EXISTS "Users can read own data based on affectation" ON personnel;';
  EXECUTE 'CREATE POLICY "Users can read own data based on affectation"
    ON personnel
    FOR SELECT
    TO authenticated
    USING (lower(auth.jwt() ->> ''user_metadata'' ->> ''affectation'') = lower(affectation));';
END $$;

-- Update RLS policy for engins table to be case-insensitive
DO $$ BEGIN
  EXECUTE 'DROP POLICY IF EXISTS "Authenticated users can view engins by affectation" ON engins;';
  EXECUTE 'CREATE POLICY "Authenticated users can view engins by affectation"
    ON engins
    FOR SELECT
    TO authenticated
    USING (lower(auth.jwt() ->> ''user_metadata'' ->> ''affectation'') = lower(cs_affectation));';
END $$;

-- Update RLS policy for materiels table to use new affectation column and be case-insensitive
-- First, drop the old policy if it exists (the one using 'emplacement' for affectation)
DO $$ BEGIN
  EXECUTE 'DROP POLICY IF EXISTS "Authenticated users can view materiels by affectation" ON materiels;';
  EXECUTE 'CREATE POLICY "Authenticated users can view materiels by affectation"
    ON materiels
    FOR SELECT
    TO authenticated
    USING (lower(auth.jwt() ->> ''user_metadata'' ->> ''affectation'') = lower(affectation));';
END $$;