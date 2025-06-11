import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Interfaces pour les types de données de la base de données
export interface GalleryItem {
  id: string;
  name: string;
  description: string;
  image_url: string;
  created_at: string;
}

export interface Materiel {
  id: string;
  user_id: string;
  name: string;
  description: string;
  photo_url: string;
  quantite_reelle?: number; // Renommé de 'quantite'
  quantite_nominale?: number; // Nouvelle colonne
  emplacement: string;
  etat: string;
  created_at: string;
  engin_id: string | null;
  engin_name?: string; // Added for join
  doc?: string | null; // New column
  media?: string | null; // New column
  affectation?: string | null; // NEW: Add affectation column
  comment?: string | null; // NEW: Add comment column
  is_controlled?: boolean; // NEW: Add is_controlled column
}

export interface Engin {
  id: string;
  user_id: string;
  name: string;
  description: string;
  photo_url: string;
  cs_affectation: string;
  created_at: string;
}

export interface Personnel {
  id: string;
  user_id: string;
  name: string;
  prenom: string;
  grade: string;
  affectation: string;
  status: string;
  contact_email: string;
  photo_url: string;
  created_at: string;
}
