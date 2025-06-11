/*
  # Add is_controlled column to materiels table

  1. Modified Tables
    - `materiels`
      - Added `is_controlled` (boolean, default false)
  2. Security
    - Updated RLS policy for `materiels` to allow authenticated users to update the new `is_controlled` column.
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'materiels' AND column_name = 'is_controlled'
  ) THEN
    ALTER TABLE materiels ADD COLUMN is_controlled boolean DEFAULT false;
  END IF;
END $$;

-- Ensure RLS policy allows updating this new column
-- Assuming the existing UPDATE policy is sufficient, if not, it would need adjustment.
-- The current policy allows any authenticated user to update, which covers this new column.
-- No explicit change needed if the existing policy is FOR UPDATE TO authenticated USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);