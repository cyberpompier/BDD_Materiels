/*
      # Ajouter engin_id à la table materiels et mettre à jour RLS

      1. Tables modifiées
        - `materiels`
          - Ajout de `engin_id` (uuid, nullable, clé étrangère vers `engins.id`)
      2. Sécurité
        - Les politiques RLS existantes pour `materiels` permettent déjà aux utilisateurs authentifiés de mettre à jour leurs propres matériels, y compris la nouvelle colonne `engin_id`.
    */

    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'materiels' AND column_name = 'engin_id'
      ) THEN
        ALTER TABLE materiels ADD COLUMN engin_id uuid;
        ALTER TABLE materiels ADD CONSTRAINT fk_engin
          FOREIGN KEY (engin_id) REFERENCES engins(id) ON DELETE SET NULL;
      END IF;
    END $$;