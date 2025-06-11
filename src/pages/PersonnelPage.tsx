import { useEffect, useState } from 'react';
import { supabase, Personnel } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

export function PersonnelPage() {
  const [personnel, setPersonnel] = useState<Personnel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Form states for new personnel
  const [newName, setNewName] = useState('');
  const [newPrenom, setNewPrenom] = useState('');
  const [newGrade, setNewGrade] = useState('');
  const [newAffectation, setNewAffectation] = useState('');
  const [newStatus, setNewStatus] = useState('');
  const [newContactEmail, setNewContactEmail] = useState('');
  const [newPhotoUrl, setNewPhotoUrl] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const fetchPersonnel = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: fetchError } = await supabase
        .from('personnel')
        .select('*');

      if (fetchError) {
        throw fetchError;
      }
      setPersonnel(data || []);
    } catch (err: any) {
      setError(err.message);
      toast.error(`Erreur lors du chargement du personnel : ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPersonnel();
  }, []);

  const handleAddPersonnel = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAdding(true);
    setError(null);

    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();

      if (userError || !user) {
        throw new Error("Utilisateur non authentifié.");
      }

      const { error: insertError } = await supabase.from('personnel').insert({
        user_id: user.id,
        name: newName,
        prenom: newPrenom,
        grade: newGrade,
        affectation: newAffectation,
        status: newStatus,
        contact_email: newContactEmail,
        photo_url: newPhotoUrl || 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
      });

      if (insertError) {
        throw insertError;
      }

      toast.success('Personnel ajouté avec succès !');
      setIsDialogOpen(false);
      setNewName('');
      setNewPrenom('');
      setNewGrade('');
      setNewAffectation('');
      setNewStatus('');
      setNewContactEmail('');
      setNewPhotoUrl('');
      fetchPersonnel(); // Refresh the list
    } catch (err: any) {
      setError(err.message);
      toast.error(`Erreur lors de l'ajout du personnel : ${err.message}`);
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <main className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold">Notre Équipe</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>Ajouter un personnel</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Ajouter un nouveau personnel</DialogTitle>
              <DialogDescription>
                Remplissez les informations pour ajouter un nouveau membre à l'équipe.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddPersonnel} className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Nom
                </Label>
                <Input
                  id="name"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="prenom" className="text-right">
                  Prénom
                </Label>
                <Input
                  id="prenom"
                  value={newPrenom}
                  onChange={(e) => setNewPrenom(e.target.value)}
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="grade" className="text-right">
                  Grade
                </Label>
                <Input
                  id="grade"
                  value={newGrade}
                  onChange={(e) => setNewGrade(e.target.value)}
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="affectation" className="text-right">
                  Affectation
                </Label>
                <Input
                  id="affectation"
                  value={newAffectation}
                  onChange={(e) => setNewAffectation(e.target.value)}
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="status" className="text-right">
                  Statut
                </Label>
                <Input
                  id="status"
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="contact_email" className="text-right">
                  Email
                </Label>
                <Input
                  id="contact_email"
                  type="email"
                  value={newContactEmail}
                  onChange={(e) => setNewContactEmail(e.target.value)}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="photo_url" className="text-right">
                  URL Photo
                </Label>
                <Input
                  id="photo_url"
                  value={newPhotoUrl}
                  onChange={(e) => setNewPhotoUrl(e.target.value)}
                  className="col-span-3"
                  placeholder="https://images.pexels.com/..."
                />
              </div>
              <DialogFooter>
                <Button type="submit" disabled={isAdding}>
                  {isAdding ? 'Ajout en cours...' : 'Ajouter'}
                </Button>
              </DialogFooter>
            </form>
            {error && <p className="text-center text-destructive mt-2">{error}</p>}
          </DialogContent>
        </Dialog>
      </div>

      {loading && <p className="text-center">Chargement du personnel...</p>}
      {error && <p className="text-center text-destructive">Erreur : {error}</p>}
      {!loading && !error && personnel.length === 0 && (
        <p className="text-center text-muted-foreground">Aucun membre du personnel trouvé.</p>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {personnel.map((member) => (
          <Card key={member.id} className="flex flex-col items-center text-center p-4">
            <CardHeader className="flex flex-col items-center p-0"> {/* Adjusted padding */}
              <Avatar className="h-24 w-24 mb-4">
                <AvatarImage
                  src={member.photo_url}
                  alt={`${member.name} ${member.prenom}`}
                  onError={(e) => {
                    e.currentTarget.src = 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2';
                  }}
                />
                <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
              </Avatar>
            </CardHeader>
            <CardContent className="flex flex-col items-center p-0 pt-4"> {/* Adjusted padding */}
              {member.grade && <p className="text-lg font-semibold">{member.grade}</p>}
              <CardTitle className="text-xl font-bold mt-1">{member.name} {member.prenom}</CardTitle>
              {member.status && <p className="text-muted-foreground mt-1">{member.status}</p>}
              {member.affectation && <p className="text-muted-foreground mt-1">{member.affectation}</p>}
              {member.contact_email && (
                <p className="text-sm text-blue-500 hover:underline mt-2">
                  <a href={`mailto:${member.contact_email}`}>{member.contact_email}</a>
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </main>
  );
}
