/*
      # Ajout de colonnes à la table personnel

      1. Modifications de la table `personnel`
        - Ajout de la colonne `prenom` (text, non null, default '')
        - Ajout de la colonne `grade` (text, non null, default '')
        - Ajout de la colonne `affectation` (text, non null, default '')
        - Ajout de la colonne `status` (text, non null, default 'Actif')
    */

    DO $$
    BEGIN
      IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'personnel' AND column_name = 'prenom') THEN
        ALTER TABLE personnel ADD COLUMN prenom text NOT NULL DEFAULT '';
      END IF;
      IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'personnel' AND column_name = 'grade') THEN
        ALTER TABLE personnel ADD COLUMN grade text NOT NULL DEFAULT '';
      END IF;
      IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'personnel' AND column_name = 'affectation') THEN
        ALTER TABLE personnel ADD COLUMN affectation text NOT NULL DEFAULT '';
      END IF;
      IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'personnel' AND column_name = 'status') THEN
        ALTER TABLE personnel ADD COLUMN status text NOT NULL DEFAULT 'Actif';
      END IF;
    END $$;