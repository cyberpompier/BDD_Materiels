/*
  # Add UPDATE RLS policy for personnel table

  1. Security
    - Add RLS policy to allow authenticated users to update their own personnel data.
  */

DO $$
BEGIN
  -- Drop existing UPDATE policy if it exists to ensure a clean update
  EXECUTE 'DROP POLICY IF EXISTS "Enable update for authenticated users on their own personnel data" ON public.personnel;';

  -- Create or replace the UPDATE policy
  EXECUTE 'CREATE POLICY "Enable update for authenticated users on their own personnel data"
    ON public.personnel
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id);';
END
$$;