/*
      # Create personnel table

      1. New Tables
        - `personnel`
          - `id` (uuid, primary key, default gen_random_uuid())
          - `user_id` (uuid, foreign key to auth.users.id, not null)
          - `name` (text, not null, default '')
          - `role` (text, not null, default '')
          - `contact_email` (text, unique, default '')
          - `photo_url` (text, default 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2')
          - `created_at` (timestamptz, default now())
      2. Security
        - Enable RLS on `personnel` table
        - Add policy for authenticated users to select their own data
        - Add policy for authenticated users to insert their own data
        - Add policy for authenticated users to update their own data
        - Add policy for authenticated users to delete their own data
    */

    CREATE TABLE IF NOT EXISTS personnel (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
      name text NOT NULL DEFAULT '',
      role text NOT NULL DEFAULT '',
      contact_email text UNIQUE DEFAULT '',
      photo_url text DEFAULT 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
      created_at timestamptz DEFAULT now()
    );

    ALTER TABLE personnel ENABLE ROW LEVEL SECURITY;

    CREATE POLICY "Authenticated users can view their own personnel data."
      ON personnel FOR SELECT
      TO authenticated
      USING (auth.uid() = user_id);

    CREATE POLICY "Authenticated users can insert their own personnel data."
      ON personnel FOR INSERT
      TO authenticated
      WITH CHECK (auth.uid() = user_id);

    CREATE POLICY "Authenticated users can update their own personnel data."
      ON personnel FOR UPDATE
      TO authenticated
      USING (auth.uid() = user_id);

    CREATE POLICY "Authenticated users can delete their own personnel data."
      ON personnel FOR DELETE
      TO authenticated
      USING (auth.uid() = user_id);