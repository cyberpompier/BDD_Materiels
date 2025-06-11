import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface GalleryItem {
  id: string;
  name: string;
  description: string;
  image_url: string;
}

export interface Materiel {
  id: string;
  user_id: string;
  name: string;
  description: string;
  photo_url: string;
  quantite_reelle: number;
  quantite_nominale: number;
  emplacement: string;
  etat: string;
  engin_id: string | null;
  doc: string | null;
  media: string | null;
  affectation: string | null;
  comment: string | null;
  created_at: string;
  engin_name?: string; // Pour la jointure
  is_controlled: boolean; // Nouveau champ
}

export interface Engin {
  id: string;
  user_id?: string; // Rendu optionnel
  name: string;
  description?: string; // Rendu optionnel
  photo_url?: string; // Rendu optionnel
  cs_affectation?: string; // Rendu optionnel
  created_at?: string; // Rendu optionnel
}

export interface Personnel {
  id: string;
  user_id: string;
  name: string;
  prenom: string; // Ajouté
  grade: string;
  status: string;
  photo_url: string;
  affectation: string; // Ajouté
  contact_email: string; // Ajouté
  created_at: string;
}
