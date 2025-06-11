import { useEffect, useState } from 'react';
import { ItemCard } from '@/components/item-card';
import { Materiel, Engin, supabase } from '@/lib/supabase';
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
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export function MaterialsPage() {
  const [materiels, setMateriels] = useState<Materiel[]>([]);
  const [engins, setEngins] = useState<Engin[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddMaterialDialogOpen, setIsAddMaterialDialogOpen] = useState(false);
  const [addingMaterial, setAddingMaterial] = useState(false);
  const [addMaterialError, setAddMaterialError] = useState<string | null>(null);

  // États pour le formulaire d'ajout de matériel
  const [newMaterialName, setNewMaterialName] = useState('');
  const [newMaterialDescription, setNewMaterialDescription] = useState('');
  const [newMaterialPhotoUrl, setNewMaterialPhotoUrl] = useState('');
  const [newMaterialQuantity, setNewMaterialQuantity] = useState<number | undefined>(undefined);
  const [newMaterialLocation, setNewMaterialLocation] = useState('');
  const [newMaterialState, setNewMaterialState] = useState('');
  const [newMaterialEnginId, setNewMaterialEnginId] = useState<string | null>(null);
  const [newMaterialDocUrl, setNewMaterialDocUrl] = useState('');
  const [newMaterialMediaUrl, setNewMaterialMediaUrl] = useState('');
  const [newMaterialAffectation, setNewMaterialAffectation] = useState('');

  const fetchMaterials = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: fetchError } = await supabase
        .from('materiels')
        .select('*, engins(name)'); // Joindre la table engins pour le nom

      if (fetchError) {
        throw fetchError;
      }

      const materialsWithEnginName: Materiel[] = data.map((material: any) => ({
        ...material,
        engin_name: material.engins ? material.engins.name : null,
      }));

      setMateriels(materialsWithEnginName || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchEngins = async () => {
    try {
      const { data, error: fetchError } = await supabase
        .from('engins')
        .select('id, name');
      if (fetchError) {
        throw fetchError;
      }
      // Assurez-vous que les données correspondent au type Engin (avec les champs optionnels)
      setEngins(data as Engin[] || []);
    } catch (err: any) {
      console.error('Erreur lors du chargement des engins:', err.message);
    }
  };

  useEffect(() => {
    fetchMaterials();
    fetchEngins();
  }, []);

  const handleMaterielUpdate = (id: string, updatedFields: { comment?: string; quantite_reelle?: number }) => {
    setMateriels(prevMateriels =>
      prevMateriels.map(materiel =>
        materiel.id === id
          ? { ...materiel, ...updatedFields }
          : materiel
      )
    );
  };

  const handleAddMaterial = async () => {
    setAddingMaterial(true);
    setAddMaterialError(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Utilisateur non authentifié.');
      }

      const { error: insertError } = await supabase
        .from('materiels')
        .insert({
          user_id: user.id,
          name: newMaterialName,
          description: newMaterialDescription,
          photo_url: newMaterialPhotoUrl,
          quantite_reelle: newMaterialQuantity, // Utiliser quantite_reelle
          quantite_nominale: newMaterialQuantity, // Initialiser quantite_nominale avec la même valeur
          emplacement: newMaterialLocation,
          etat: newMaterialState,
          engin_id: newMaterialEnginId,
          doc: newMaterialDocUrl,
          media: newMaterialMediaUrl,
          affectation: newMaterialAffectation,
        });

      if (insertError) {
        throw insertError;
      }

      // Réinitialiser les champs du formulaire et fermer la modale
      setNewMaterialName('');
      setNewMaterialDescription('');
      setNewMaterialPhotoUrl('');
      setNewMaterialQuantity(undefined);
      setNewMaterialLocation('');
      setNewMaterialState('');
      setNewMaterialEnginId(null);
      setNewMaterialDocUrl('');
      setNewMaterialMediaUrl('');
      setNewMaterialAffectation('');
      setIsAddMaterialDialogOpen(false);
      // Recharger la liste des matériels
      fetchMaterials();
    } catch (err: any) {
      setAddMaterialError(err.message);
    } finally {
      setAddingMaterial(false);
    }
  };

  return (
    <main className="container mx-auto p-6">
      <h2 className="text-3xl font-bold text-center mb-8">Nos Matériels</h2>

      <div className="flex justify-end mb-6">
        <Button onClick={() => setIsAddMaterialDialogOpen(true)}>
          Ajouter un Matériel
        </Button>
      </div>

      {loading && <p className="text-center">Chargement des matériels...</p>}
      {error && <p className="text-center text-destructive">Erreur : {error}</p>}
      {!loading && !error && materiels.length === 0 && (
        <p className="text-center text-muted-foreground">Aucun matériel trouvé.</p>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {materiels.map((material) => (
          <ItemCard key={material.id} item={material} onUpdate={handleMaterielUpdate} />
        ))}
      </div>

      {/* Dialog pour ajouter un nouveau matériel */}
      <Dialog open={isAddMaterialDialogOpen} onOpenChange={setIsAddMaterialDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Ajouter un nouveau matériel</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Nom
              </Label>
              <Input
                id="name"
                value={newMaterialName}
                onChange={(e) => setNewMaterialName(e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">
                Description
              </Label>
              <Textarea
                id="description"
                value={newMaterialDescription}
                onChange={(e) => setNewMaterialDescription(e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="photo_url" className="text-right">
                URL Photo
              </Label>
              <Input
                id="photo_url"
                value={newMaterialPhotoUrl}
                onChange={(e) => setNewMaterialPhotoUrl(e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="quantity" className="text-right">
                Quantité
              </Label>
              <Input
                id="quantity"
                type="number"
                value={newMaterialQuantity !== undefined ? newMaterialQuantity : ''}
                onChange={(e) => setNewMaterialQuantity(parseInt(e.target.value, 10) || undefined)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="location" className="text-right">
                Emplacement
              </Label>
              <Input
                id="location"
                value={newMaterialLocation}
                onChange={(e) => setNewMaterialLocation(e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="state" className="text-right">
                État
              </Label>
              <Input
                id="state"
                value={newMaterialState}
                onChange={(e) => setNewMaterialState(e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="engin_id" className="text-right">
                Engin Associé
              </Label>
              <Select onValueChange={setNewMaterialEnginId} value={newMaterialEnginId || ''}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Sélectionner un engin" />
                </SelectTrigger>
                <SelectContent>
                  {engins.map((engin) => (
                    <SelectItem key={engin.id} value={engin.id}>
                      {engin.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="doc_url" className="text-right">
                URL Document
              </Label>
              <Input
                id="doc_url"
                value={newMaterialDocUrl}
                onChange={(e) => setNewMaterialDocUrl(e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="media_url" className="text-right">
                URL Média
              </Label>
              <Input
                id="media_url"
                value={newMaterialMediaUrl}
                onChange={(e) => setNewMaterialMediaUrl(e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="affectation" className="text-right">
                Affectation
              </Label>
              <Input
                id="affectation"
                value={newMaterialAffectation}
                onChange={(e) => setNewMaterialAffectation(e.target.value)}
                className="col-span-3"
              />
            </div>
            {addMaterialError && <p className="text-destructive text-center col-span-4">{addMaterialError}</p>}
          </div>
          <DialogFooter>
            <Button onClick={handleAddMaterial} disabled={addingMaterial}>
              {addingMaterial ? 'Ajout en cours...' : 'Ajouter le matériel'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
}
