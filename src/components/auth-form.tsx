import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

export function AuthForm() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [affectation, setAffectation] = useState('');
  const [name, setName] = useState('');
  const [prenom, setPrenom] = useState('');
  const [grade, setGrade] = useState('');
  const [status, setStatus] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);

  const handleAuth = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);

    try {
      let authError = null;
      let user = null;

      if (isSignUp) {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              affectation: affectation,
            },
          },
        });
        authError = signUpError;
        user = data?.user;

        if (!authError && user) {
          // Insérer les données du personnel après l'inscription réussie
          const { error: personnelError } = await supabase
            .from('personnel')
            .insert({
              user_id: user.id,
              name: name,
              prenom: prenom,
              grade: grade,
              affectation: affectation, // Utiliser l'affectation du formulaire d'inscription
              status: status,
              contact_email: contactEmail,
              photo_url: photoUrl,
            });

          if (personnelError) {
            toast.error(`Erreur lors de l'enregistrement des données du personnel : ${personnelError.message}`);
            // Optionnel: Déconnecter l'utilisateur si l'insertion du personnel échoue
            await supabase.auth.signOut();
            return;
          }
        }
      } else {
        const { data, error: signInError } = await supabase.auth.signInWithPassword({ email, password });
        authError = signInError;
        user = data?.user;
      }

      if (authError) {
        toast.error(authError.message);
      } else {
        toast.success(isSignUp ? 'Inscription réussie ! Veuillez vous connecter.' : 'Connexion réussie !');
      }
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">{isSignUp ? 'Inscription' : 'Connexion'}</CardTitle>
          <CardDescription>
            {isSignUp ? 'Créez un compte pour accéder à la galerie.' : 'Connectez-vous pour voir les éléments.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAuth} className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="votre@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Mot de passe</Label>
              <Input
                id="password"
                type="password"
                placeholder="********"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            {isSignUp && (
              <>
                <div className="grid gap-2">
                  <Label htmlFor="name">Nom</Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="Votre nom"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="prenom">Prénom</Label>
                  <Input
                    id="prenom"
                    type="text"
                    placeholder="Votre prénom"
                    value={prenom}
                    onChange={(e) => setPrenom(e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="grade">Grade</Label>
                  <Input
                    id="grade"
                    type="text"
                    placeholder="Ex: Caporal"
                    value={grade}
                    onChange={(e) => setGrade(e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="affectation">Affectation</Label>
                  <Input
                    id="affectation"
                    type="text"
                    placeholder="Ex: Noyon"
                    value={affectation}
                    onChange={(e) => setAffectation(e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="status">Statut</Label>
                  <Input
                    id="status"
                    type="text"
                    placeholder="Ex: Actif"
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="contactEmail">Email de contact</Label>
                  <Input
                    id="contactEmail"
                    type="email"
                    placeholder="contact@email.com"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="photoUrl">URL Photo</Label>
                  <Input
                    id="photoUrl"
                    type="url"
                    placeholder="https://example.com/photo.jpg"
                    value={photoUrl}
                    onChange={(e) => setPhotoUrl(e.target.value)}
                    disabled={loading}
                  />
                </div>
              </>
            )}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Chargement...' : (isSignUp ? 'S\'inscrire' : 'Se connecter')}
            </Button>
            <Button
              type="button"
              variant="link"
              className="w-full"
              onClick={() => setIsSignUp(!isSignUp)}
              disabled={loading}
            >
              {isSignUp ? 'Déjà un compte ? Connectez-vous' : 'Pas de compte ? Inscrivez-vous'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
