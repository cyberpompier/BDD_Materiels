/*
  # Update RLS policy for materiels table to allow any authenticated user to update

  1. Security
    - Modified the RLS policy for `materiels` table to allow any authenticated user to perform `UPDATE` operations.
    - The previous policy restricted updates to the owner (`user_id`). This change broadens the access.
*/

-- Drop the existing UPDATE policy if it exists
DROP POLICY IF EXISTS "Enable update for users based on user_id" ON public.materiels;
DROP POLICY IF EXISTS "Allow authenticated users to update materiels" ON public.materiels;

-- Create a new UPDATE policy that allows any authenticated user to update
CREATE POLICY "Allow authenticated users to update materiels"
  ON public.materiels
  FOR UPDATE
  TO authenticated
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);