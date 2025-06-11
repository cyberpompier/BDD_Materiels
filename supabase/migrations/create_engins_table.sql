/*
  # Création de la table `engins` et configuration de la sécurité

  1. Nouvelles Tables
    - `engins`
      - `id` (uuid, clé primaire, générée automatiquement) : Identifiant unique pour chaque engin.
      - `user_id` (uuid, référence `auth.users`, par défaut `auth.uid()`) : L'identifiant de l'utilisateur qui a créé cet engin.
      - `name` (text, non nul) : Nom de l'engin.
      - `description` (text) : Description détaillée de l'engin.
      - `photo_url` (text) : URL de l'image associée à l'engin.
      - `cs_affectation` (text, par défaut '') : Centre de service ou affectation de l'engin.
      - `created_at` (timestamptz, par défaut `now()`) : Horodatage de la création de l'engin.

  2. Sécurité
    - Activation de la sécurité au niveau des lignes (RLS) sur la table `engins`.
    - Ajout d'une politique RLS pour permettre aux utilisateurs authentifiés de lire toutes les données de la table `engins`.
    - Ajout d'une politique RLS pour permettre aux utilisateurs authentifiés d'insérer de nouvelles données dans la table `engins`, en associant l'engin à leur `user_id`.
    - Ajout d'une politique RLS pour permettre aux utilisateurs authentifiés de mettre à jour leurs propres données dans la table `engins`.
    - Ajout d'une politique RLS pour permettre aux utilisateurs authentifiés de supprimer leurs propres données dans la table `engins`.
*/

CREATE TABLE IF NOT EXISTS engins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) DEFAULT auth.uid(),
  name text NOT NULL DEFAULT '',
  description text DEFAULT '',
  photo_url text DEFAULT 'https://images.pexels.com/photos/1072179/pexels-photo-1072179.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
  cs_affectation text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE engins ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated users to read engins"
  ON engins
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to insert their own engins"
  ON engins
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Allow authenticated users to update their own engins"
  ON engins
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Allow authenticated users to delete their own engins"
  ON engins
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);