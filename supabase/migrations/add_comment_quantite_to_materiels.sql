/*
      # Ajout des colonnes comment et quantite à la table materiels et configuration RLS

      1. Modifications de la table `materiels`
        - Ajout de la colonne `comment` (text, nullable)
        - Ajout de la colonne `quantite` (integer, nullable)
      2. Sécurité
        - Activation de RLS sur la table `materiels`
        - Ajout d'une politique `SELECT` pour permettre aux utilisateurs authentifiés de lire leurs propres matériels (rendu idempotent).
        - Ajout d'une politique `UPDATE` pour permettre aux utilisateurs authentifiés de mettre à jour leurs propres matériels (rendu idempotent).
    */

    -- Ajout de la colonne 'comment' si elle n'existe pas
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'materiels' AND column_name = 'comment'
      ) THEN
        ALTER TABLE materiels ADD COLUMN comment text;
      END IF;
    END $$;

    -- Ajout de la colonne 'quantite' si elle n'existe pas
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'materiels' AND column_name = 'quantite'
      ) THEN
        ALTER TABLE materiels ADD COLUMN quantite integer;
      END IF;
    END $$;

    -- Activer RLS pour la table materiels (cette commande est généralement idempotente)
    ALTER TABLE materiels ENABLE ROW LEVEL SECURITY;

    -- Politique pour permettre aux utilisateurs authentifiés de lire leurs propres matériels
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1
        FROM pg_policies
        WHERE policyname = 'Authenticated users can view their own materiels'
          AND tablename = 'materiels'
      ) THEN
        CREATE POLICY "Authenticated users can view their own materiels"
          ON materiels
          FOR SELECT
          TO authenticated
          USING (auth.uid() = user_id);
      END IF;
    END $$;

    -- Politique pour permettre aux utilisateurs authentifiés de mettre à jour leurs propres matériels
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1
        FROM pg_policies
        WHERE policyname = 'Authenticated users can update their own materiels'
          AND tablename = 'materiels'
      ) THEN
        CREATE POLICY "Authenticated users can update their own materiels"
          ON materiels
          FOR UPDATE
          TO authenticated
          USING (auth.uid() = user_id)
          WITH CHECK (auth.uid() = user_id);
      END IF;
    END $$;