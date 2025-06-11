/*
  # Création de la table `materiels` et configuration de la sécurité

  1. Nouvelles Tables
    - `materiels`
      - `id` (uuid, clé primaire, générée automatiquement) : Identifiant unique pour chaque matériel.
      - `user_id` (uuid, référence `auth.users`, par défaut `auth.uid()`) : L'identifiant de l'utilisateur qui a créé ce matériel.
      - `name` (text, non nul) : Nom du matériel.
      - `description` (text) : Description détaillée du matériel.
      - `photo_url` (text) : URL de l'image associée au matériel.
      - `quantite` (integer, par défaut 0) : Quantité disponible de ce matériel.
      - `emplacement` (text, par défaut '') : Lieu de stockage du matériel.
      - `etat` (text, par défaut '') : État actuel du matériel (ex: 'bon', 'usagé', 'en réparation').
      - `created_at` (timestamptz, par défaut `now()`) : Horodatage de la création du matériel.

  2. Sécurité
    - Activation de la sécurité au niveau des lignes (RLS) sur la table `materiels`.
    - Ajout d'une politique RLS pour permettre aux utilisateurs authentifiés de lire toutes les données de la table `materiels`.
    - Ajout d'une politique RLS pour permettre aux utilisateurs authentifiés d'insérer de nouvelles données dans la table `materiels`, en associant le matériel à leur `user_id`.
    - Ajout d'une politique RLS pour permettre aux utilisateurs authentifiés de mettre à jour leurs propres données dans la table `materiels`.
    - Ajout d'une politique RLS pour permettre aux utilisateurs authentifiés de supprimer leurs propres données dans la table `materiels`.
*/

CREATE TABLE IF NOT EXISTS materiels (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) DEFAULT auth.uid(),
  name text NOT NULL DEFAULT '',
  description text DEFAULT '',
  photo_url text DEFAULT 'https://images.pexels.com/photos/1072179/pexels-photo-1072179.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
  quantite integer DEFAULT 0,
  emplacement text DEFAULT '',
  etat text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE materiels ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated users to read materiels"
  ON materiels
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to insert their own materiels"
  ON materiels
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Allow authenticated users to update their own materiels"
  ON materiels
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Allow authenticated users to delete their own materiels"
  ON materiels
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);