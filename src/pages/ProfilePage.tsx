import { useEffect, useState } from 'react';
import { supabase, Personnel } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Définir les options d'affectation avec la capitalisation correcte
const AFFECTATION_OPTIONS = [
  "Noyon",
	"Guiscard",
  "Compiègne",
  "Beauvais",
  "Creil",
  "Senlis",
  "Clermont",
  "Méru",
  "Chantilly",
  "Pont-Sainte-Maxence",
  "Nogent-sur-Oise",
  "Autres" // Option pour les affectations non listées
];

export function ProfilePage() {
  const [profile, setProfile] = useState<Personnel | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  const fetchProfile = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();

      if (userError || !user) {
        throw new Error("Utilisateur non authentifié.");
      }

      const { data, error: fetchError } = await supabase
        .from('personnel')
        .select('*')
        .eq('user_id', user.id)
        .single(); // Expecting only one profile per user

      if (fetchError) {
        throw fetchError;
      }
      setProfile(data);
    } catch (err: any) {
      setError(err.message);
      toast.error(`Erreur lors du chargement du profil : ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setProfile((prevProfile) => {
      if (!prevProfile) return null;
      return { ...prevProfile, [id]: value };
    });
  };

  const handleSelectChange = (value: string) => {
    setProfile((prevProfile) => {
      if (!prevProfile) return null;
      return { ...prevProfile, affectation: value };
    });
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    setError(null);

    if (!profile) {
      toast.error("Aucun profil à mettre à jour.");
      setIsUpdating(false);
      return;
    }

    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();

      if (userError || !user) {
        throw new Error("Utilisateur non authentifié.");
      }

      // Update personnel table
      const { error: updatePersonnelError } = await supabase
        .from('personnel')
        .update({
          name: profile.name,
          prenom: profile.prenom,
          grade: profile.grade,
          affectation: profile.affectation,
          status: profile.status,
          contact_email: profile.contact_email,
          photo_url: profile.photo_url,
        })
        .eq('user_id', user.id);

      if (updatePersonnelError) {
        throw updatePersonnelError;
      }

      // Also update user_metadata affectation if it changed, for RLS consistency
      const currentAffectationInMetadata = user.user_metadata?.affectation;
      if (profile.affectation !== currentAffectationInMetadata) {
        const { error: updateAuthError } = await supabase.auth.updateUser({
          data: { affectation: profile.affectation },
        });
        if (updateAuthError) {
          console.warn("Could not update user metadata affectation:", updateAuthError.message);
          // Don't throw, as personnel table update was successful. Just warn.
        } else {
          // IMPORTANT: Refresh session to get a new JWT with updated user_metadata
          toast.info("Mise à jour de l'affectation détectée. Rafraîchissement de la session...");
          const { error: refreshError } = await supabase.auth.refreshSession();
          if (refreshError) {
            console.error("Erreur lors du rafraîchissement de la session:", refreshError.message);
            toast.error(`Erreur lors du rafraîchissement de la session : ${refreshError.message}`);
          }
        }
      }

      toast.success('Profil mis à jour avec succès !');
    } catch (err: any) {
      setError(err.message);
      toast.error(`Erreur lors de la mise à jour du profil : ${err.message}`);
    } finally {
      setIsUpdating(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-background text-foreground">Chargement du profil...</div>;
  }

  if (error) {
    return <div className="min-h-screen flex items-center justify-center bg-background text-destructive">Erreur : {error}</div>;
  }

  if (!profile) {
    return <div className="min-h-screen flex items-center justify-center bg-background text-muted-foreground">Aucun profil trouvé.</div>;
  }

  return (
    <main className="container mx-auto p-6">
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl">Modifier votre Profil</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleUpdateProfile} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="grid gap-2">
              <Label htmlFor="name">Nom</Label>
              <Input
                id="name"
                type="text"
                value={profile.name || ''}
                onChange={handleChange}
                required
                disabled={isUpdating}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="prenom">Prénom</Label>
              <Input
                id="prenom"
                type="text"
                value={profile.prenom || ''}
                onChange={handleChange}
                required
                disabled={isUpdating}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="grade">Grade</Label>
              <Input
                id="grade"
                type="text"
                value={profile.grade || ''}
                onChange={handleChange}
                required
                disabled={isUpdating}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="affectation">Affectation</Label>
              <Select
                onValueChange={handleSelectChange}
                value={profile.affectation || ''}
                disabled={isUpdating}
              >
                <SelectTrigger id="affectation">
                  <SelectValue placeholder="Sélectionner une affectation" />
                </SelectTrigger>
                <SelectContent>
                  {AFFECTATION_OPTIONS.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="status">Statut</Label>
              <Input
                id="status"
                type="text"
                value={profile.status || ''}
                onChange={handleChange}
                required
                disabled={isUpdating}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="contact_email">Email de contact</Label>
              <Input
                id="contact_email"
                type="email"
                value={profile.contact_email || ''}
                onChange={handleChange}
                required
                disabled={isUpdating}
              />
            </div>
            <div className="grid gap-2 md:col-span-2">
              <Label htmlFor="photo_url">URL Photo</Label>
              <Input
                id="photo_url"
                type="url"
                value={profile.photo_url || ''}
                onChange={handleChange}
                placeholder="https://images.pexels.com/..."
                disabled={isUpdating}
              />
            </div>
            <div className="md:col-span-2 flex justify-end">
              <Button type="submit" disabled={isUpdating}>
                {isUpdating ? 'Mise à jour...' : 'Enregistrer les modifications'}
              </Button>
            </div>
          </form>
          {error && <p className="text-center text-destructive mt-4">{error}</p>}
        </CardContent>
      </Card>
    </main>
  );
}
