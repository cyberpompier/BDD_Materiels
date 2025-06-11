/*
  # Création de la table `items` et configuration de la sécurité

  1. Nouvelles Tables
    - `items`
      - `id` (uuid, clé primaire, générée automatiquement) : Identifiant unique pour chaque élément.
      - `name` (text, non nul) : Nom de l'élément.
      - `description` (text) : Description détaillée de l'élément.
      - `image_url` (text) : URL de l'image associée à l'élément.
      - `created_at` (timestamptz, par défaut `now()`) : Horodatage de la création de l'élément.

  2. Sécurité
    - Activation de la sécurité au niveau des lignes (RLS) sur la table `items`.
    - Ajout d'une politique RLS pour permettre aux utilisateurs authentifiés de lire toutes les données de la table `items`.
    - Ajout d'une politique RLS pour permettre aux utilisateurs authentifiés d'insérer de nouvelles données dans la table `items`.
    - Ajout d'une politique RLS pour permettre aux utilisateurs authentifiés de mettre à jour leurs propres données dans la table `items`.
    - Ajout d'une politique RLS pour permettre aux utilisateurs authentifiés de supprimer leurs propres données dans la table `items`.
*/

CREATE TABLE IF NOT EXISTS items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL DEFAULT '',
  description text DEFAULT '',
  image_url text DEFAULT 'https://images.pexels.com/photos/1072179/pexels-photo-1072179.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated users to read items"
  ON items
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to insert items"
  ON items
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update their own items"
  ON items
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id); -- Assuming 'id' in 'items' table is the user's ID, adjust if 'user_id' column is present

CREATE POLICY "Allow authenticated users to delete their own items"
  ON items
  FOR DELETE
  TO authenticated
  USING (auth.uid() = id); -- Assuming 'id' in 'items' table is the user's ID, adjust if 'user_id' column is present