/*
  # Mise à jour de la politique RLS pour la table engins (filtrage strict par affectation)

  1. Sécurité
    - Mise à jour de la politique RLS sur la table `engins` pour filtrer STRICTEMENT les accès en lecture (`SELECT`) en fonction de l'affectation de l'utilisateur connecté (extraite de `auth.jwt() ->> 'user_metadata' ->> 'affectation'`).
    - La condition `auth.uid() = user_id` est retirée pour les `SELECT` afin d'appliquer un filtrage exclusif par affectation.
  */

DO $$
BEGIN
  -- Engins Table RLS Policy: Strict Affectation Filter
  EXECUTE 'DROP POLICY IF EXISTS "Enable read access for engins based on user affectation" ON public.engins;';
  EXECUTE 'CREATE POLICY "Enable read access for engins based on user affectation"
    ON public.engins
    FOR SELECT
    TO authenticated
    USING (cs_affectation = ((auth.jwt() ->> ''user_metadata'')::jsonb ->> ''affectation''));';
END
$$;