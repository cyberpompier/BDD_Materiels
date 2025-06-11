import { useEffect, useState } from 'react';
import { ItemCard } from '@/components/item-card';
import { Engin, Materiel, supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea'; // Importez Textarea

export function VehiclesPage() {
  const [engins, setEngins] = useState<Engin[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedEngin, setSelectedEngin] = useState<Engin | null>(null);
  const [associatedMateriels, setAssociatedMateriels] = useState<Materiel[]>([]);
  const [loadingMateriels, setLoadingMateriels] = useState(false);
  const [materielsError, setMaterielsError] = useState<string | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  // États pour le formulaire d'ajout d'engin
  const [isAddEnginDialogOpen, setIsAddEnginDialogOpen] = useState(false);
  const [newEnginName, setNewEnginName] = useState('');
  const [newEnginDescription, setNewEnginDescription] = useState('');
  const [newEnginPhotoUrl, setNewEnginPhotoUrl] = useState('');
  const [newEnginCsAffectation, setNewEnginCsAffectation] = useState('');
  const [addingEngin, setAddingEngin] = useState(false);
  const [addEnginError, setAddEnginError] = useState<string | null>(null);

  const fetchEngins = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: fetchError } = await supabase
        .from('engins')
        .select('*');

      if (fetchError) {
        throw fetchError;
      }
      setEngins(data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEngins();
  }, []);

  const handleEnginClick = async (engin: Engin) => {
    setSelectedEngin(engin);
    setShowDetails(true);
    setLoadingMateriels(true);
    setMaterielsError(null);
    setAssociatedMateriels([]);

    try {
      const { data, error: fetchError } = await supabase
        .from('materiels')
        .select('*, engins(name)')
        .eq('engin_id', engin.id);

      if (fetchError) {
        throw fetchError;
      }

      const materialsWithEnginName: Materiel[] = data.map((material: any) => ({
        ...material,
        engin_name: material.engins ? material.engins.name : null,
      }));

      setAssociatedMateriels(materialsWithEnginName || []);
    } catch (err: any) {
      setMaterielsError(err.message);
    } finally {
      setLoadingMateriels(false);
    }
  };

  const handleBackToList = () => {
    setSelectedEngin(null);
    setShowDetails(false);
    setAssociatedMateriels([]);
  };

  const handleAddEngin = async () => {
    setAddingEngin(true);
    setAddEnginError(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Utilisateur non authentifié.');
      }

      const { error: insertError } = await supabase
        .from('engins')
        .insert({
          user_id: user.id,
          name: newEnginName,
          description: newEnginDescription,
          photo_url: newEnginPhotoUrl,
          cs_affectation: newEnginCsAffectation,
        });

      if (insertError) {
        throw insertError;
      }

      // Réinitialiser les champs du formulaire et fermer la modale
      setNewEnginName('');
      setNewEnginDescription('');
      setNewEnginPhotoUrl('');
      setNewEnginCsAffectation('');
      setIsAddEnginDialogOpen(false);
      // Recharger la liste des engins
      fetchEngins();
    } catch (err: any) {
      setAddEnginError(err.message);
    } finally {
      setAddingEngin(false);
    }
  };

  return (
    <main className="container mx-auto p-6">
      <h2 className="text-3xl font-bold text-center mb-8">Nos Engins</h2>

      {!showDetails ? (
        <>
          <div className="flex justify-end mb-6">
            <Button onClick={() => setIsAddEnginDialogOpen(true)}>
              Ajouter un Engin
            </Button>
          </div>

          {loading && <p className="text-center">Chargement des engins...</p>}
          {error && <p className="text-center text-destructive">Erreur : {error}</p>}
          {!loading && !error && engins.length === 0 && (
            <p className="text-center text-muted-foreground">Aucun engin trouvé.</p>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {engins.map((engin) => (
              <ItemCard key={engin.id} item={engin} onClick={() => handleEnginClick(engin)} />
            ))}
          </div>
        </>
      ) : (
        selectedEngin && (
          <div className="max-w-3xl mx-auto bg-card p-6 rounded-lg shadow-lg">
            <Button onClick={handleBackToList} className="mb-6">
              &larr; Retour à la liste des engins
            </Button>
            <h3 className="text-2xl font-bold mb-4">{selectedEngin.name}</h3>
            <img
              src={selectedEngin.photo_url}
              alt={selectedEngin.name}
              className="w-full h-80 object-cover rounded-md mb-6"
              onError={(e) => {
                e.currentTarget.src = 'https://images.pexels.com/photos/1072179/pexels-photo-1072179.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2';
              }}
            />
            <p className="text-lg mb-4"><strong>Description:</strong> {selectedEngin.description}</p>
            <p className="text-lg mb-6"><strong>Affectation:</strong> {selectedEngin.cs_affectation}</p>

            <h4 className="text-xl font-semibold mt-8 mb-4">Matériels Associés</h4>
            {loadingMateriels && <p className="text-center">Chargement des matériels...</p>}
            {materielsError && <p className="text-center text-destructive">Erreur lors du chargement des matériels : {materielsError}</p>}
            {!loadingMateriels && !materielsError && associatedMateriels.length === 0 && (
              <p className="text-center text-muted-foreground">Aucun matériel associé à cet engin.</p>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {associatedMateriels.map((material) => (
                <ItemCard key={material.id} item={material} />
              ))}
            </div>
          </div>
        )
      )}

      {/* Dialog pour ajouter un nouvel engin */}
      <Dialog open={isAddEnginDialogOpen} onOpenChange={setIsAddEnginDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Ajouter un nouvel Engin</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Nom
              </Label>
              <Input
                id="name"
                value={newEnginName}
                onChange={(e) => setNewEnginName(e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">
                Description
              </Label>
              <Textarea
                id="description"
                value={newEnginDescription}
                onChange={(e) => setNewEnginDescription(e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="photo_url" className="text-right">
                URL Photo
              </Label>
              <Input
                id="photo_url"
                value={newEnginPhotoUrl}
                onChange={(e) => setNewEnginPhotoUrl(e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="cs_affectation" className="text-right">
                Affectation
              </Label>
              <Input
                id="cs_affectation"
                value={newEnginCsAffectation}
                onChange={(e) => setNewEnginCsAffectation(e.target.value)}
                className="col-span-3"
              />
            </div>
            {addEnginError && <p className="text-destructive text-center col-span-4">{addEnginError}</p>}
          </div>
          <DialogFooter>
            <Button onClick={handleAddEngin} disabled={addingEngin}>
              {addingEngin ? 'Ajout en cours...' : 'Ajouter l\'engin'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
}
