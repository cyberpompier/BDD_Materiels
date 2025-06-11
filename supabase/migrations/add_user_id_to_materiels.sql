/*
  # Add user_id column to materiels table and update RLS policies

  1. Modified Tables
    - `materiels`
      - Added `user_id` (uuid, nullable) column. This column will link materiels to the user who created/owns them.
  2. Security
    - The existing RLS policies for `materiels` (SELECT and UPDATE) are designed to use the `user_id` column. This migration ensures the column exists for these policies to function correctly.
    - No new policies are created, but the existing ones will now have the necessary column to enforce row-level security based on user ownership.
*/

DO $$
BEGIN
  -- Add user_id column if it does not exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'materiels' AND column_name = 'user_id'
  ) THEN
    ALTER TABLE materiels ADD COLUMN user_id uuid;
  END IF;
END $$;

-- The RLS policies for SELECT and UPDATE are already defined in a previous migration
-- and rely on the 'user_id' column. This migration ensures that column exists.
-- No changes to existing policies are needed here, as they are already idempotent
-- and correctly reference 'user_id'.