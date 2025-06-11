/*
  # Ajout des colonnes doc et media à la table materiels et mise à jour des politiques RLS

  1. Tables Modifiées
    - `materiels`
      - Ajout de la colonne `doc` (text, nullable, par défaut '') pour les liens vers les documents.
      - Ajout de la colonne `media` (text, nullable, par défaut '') pour les liens vers les médias.
  2. Sécurité
    - Suppression et recréation des politiques RLS pour la table `materiels` afin d'inclure les nouvelles colonnes dans les opérations SELECT, INSERT et UPDATE.
*/

DO $$
BEGIN
  -- Ajout de la colonne doc si elle n'existe pas
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'materiels' AND column_name = 'doc'
  ) THEN
    ALTER TABLE materiels ADD COLUMN doc text DEFAULT '';
  END IF;

  -- Ajout de la colonne media si elle n'existe pas
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'materiels' AND column_name = 'media'
  ) THEN
    ALTER TABLE materiels ADD COLUMN media text DEFAULT '';
  END IF;

  -- Suppression des politiques existantes avant de les recréer
  EXECUTE 'DROP POLICY IF EXISTS "Authenticated users can view their own materiels" ON materiels;';
  EXECUTE 'DROP POLICY IF EXISTS "Authenticated users can create materiels" ON materiels;';
  EXECUTE 'DROP POLICY IF EXISTS "Authenticated users can update their own materiels" ON materiels;';
  EXECUTE 'DROP POLICY IF EXISTS "Authenticated users can delete their own materiels" ON materiels;';

  -- Recréation des politiques RLS pour inclure implicitement les nouvelles colonnes
  -- Politique pour les utilisateurs authentifiés pour sélectionner leurs propres données
  EXECUTE 'CREATE POLICY "Authenticated users can view their own materiels"
    ON materiels
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id)';

  -- Politique pour les utilisateurs authentifiés pour insérer leurs propres données
  EXECUTE 'CREATE POLICY "Authenticated users can create materiels"
    ON materiels
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id)';

  -- Politique pour les utilisateurs authentifiés pour mettre à jour leurs propres données
  EXECUTE 'CREATE POLICY "Authenticated users can update their own materiels"
    ON materiels
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id)';

  -- Politique pour les utilisateurs authentifiés pour supprimer leurs propres données
  EXECUTE 'CREATE POLICY "Authenticated users can delete their own materiels"
    ON materiels
    FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id)';
END $$;