/*
  # Mise à jour des politiques RLS pour filtrer par affectation

  1. Sécurité
    - Mise à jour de la politique RLS sur la table `personnel` pour filtrer les accès en lecture (`SELECT`) en fonction de l'affectation de l'utilisateur connecté (extraite de `auth.jwt() ->> 'user_metadata' ->> 'affectation'`).
    - Mise à jour de la politique RLS sur la table `engins` pour filtrer les accès en lecture (`SELECT`) en fonction de l'affectation de l'utilisateur connecté (extraite de `auth.jwt() ->> 'user_metadata' ->> 'affectation'`).
    - Mise à jour de la politique RLS sur la table `materiels` pour filtrer les accès en lecture (`SELECT`) en fonction de l'affectation de l'engin associé (qui doit correspondre à l'affectation de l'utilisateur connecté).
  */

DO $$
BEGIN
  -- Personnel Table RLS Policy
  EXECUTE 'DROP POLICY IF EXISTS "Enable read access for users based on their affectation" ON public.personnel;';
  EXECUTE 'CREATE POLICY "Enable read access for users based on their affectation"
    ON public.personnel
    FOR SELECT
    TO authenticated
    USING (affectation = ((auth.jwt() ->> ''user_metadata'')::jsonb ->> ''affectation''));';

  -- Engins Table RLS Policy
  EXECUTE 'DROP POLICY IF EXISTS "Enable read access for engins based on user affectation" ON public.engins;';
  EXECUTE 'CREATE POLICY "Enable read access for engins based on user affectation"
    ON public.engins
    FOR SELECT
    TO authenticated
    USING (cs_affectation = ((auth.jwt() ->> ''user_metadata'')::jsonb ->> ''affectation''));';

  -- Materiels Table RLS Policy
  EXECUTE 'DROP POLICY IF EXISTS "Enable read access for materiels based on associated engin''s affectation" ON public.materiels;';
  EXECUTE 'CREATE POLICY "Enable read access for materiels based on associated engin''s affectation"
    ON public.materiels
    FOR SELECT
    TO authenticated
    USING (EXISTS (
      SELECT 1
      FROM public.engins
      WHERE engins.id = materiels.engin_id
      AND engins.cs_affectation = ((auth.jwt() ->> ''user_metadata'')::jsonb ->> ''affectation'')
    ));';
END
$$;