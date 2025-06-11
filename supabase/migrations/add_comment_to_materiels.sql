/*
  # Add comment column to materiels table

  1. Modified Tables
    - `materiels`
      - Added `comment` (text, nullable) column.
  2. Security
    - No changes to RLS policies are needed for adding a nullable column.
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'materiels' AND column_name = 'comment'
  ) THEN
    ALTER TABLE materiels ADD COLUMN comment text;
  END IF;
END $$;