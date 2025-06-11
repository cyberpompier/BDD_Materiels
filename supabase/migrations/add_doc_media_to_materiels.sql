/*
      # Add doc and media columns to materiels table

      1. Modified Tables
        - `materiels`
          - `doc` (text, nullable, default '')
          - `media` (text, nullable, default '')
      2. Security
        - Update RLS policies for `materiels` to include new columns in SELECT, INSERT, UPDATE.
    */

    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'materiels' AND column_name = 'doc'
      ) THEN
        ALTER TABLE materiels ADD COLUMN doc text DEFAULT '';
      END IF;

      IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'materiels' AND column_name = 'media'
      ) THEN
        ALTER TABLE materiels ADD COLUMN media text DEFAULT '';
      END IF;
    END $$;

    -- Update RLS policies to include new columns in SELECT, INSERT, UPDATE
    -- Policy for authenticated users to select their own data
    CREATE OR REPLACE POLICY "Authenticated users can view their own materiels"
      ON materiels
      FOR SELECT
      TO authenticated
      USING (auth.uid() = user_id);

    -- Policy for authenticated users to insert their own data
    CREATE OR REPLACE POLICY "Authenticated users can create materiels"
      ON materiels
      FOR INSERT
      TO authenticated
      WITH CHECK (auth.uid() = user_id);

    -- Policy for authenticated users to update their own data
    CREATE OR REPLACE POLICY "Authenticated users can update their own materiels"
      ON materiels
      FOR UPDATE
      TO authenticated
      USING (auth.uid() = user_id)
      WITH CHECK (auth.uid() = user_id);

    -- Policy for authenticated users to delete their own data
    CREATE OR REPLACE POLICY "Authenticated users can delete their own materiels"
      ON materiels
      FOR DELETE
      TO authenticated
      USING (auth.uid() = user_id);