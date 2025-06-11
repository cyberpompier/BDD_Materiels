import { useEffect, useState, useCallback } from 'react';
import { supabase, Materiel, Engin } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { ItemCard } from '@/components/item-card';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Définir les options d'affectation (identiques à ProfilePage pour la cohérence)
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
  "Autres"
];

export function MaterialsPage() {
  const [materials, setMaterials] = useState<Materiel[]>([]);
  const [engins, setEngins] = useState<Engin[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddMaterialDialogOpen, setIsAddMaterialDialogOpen] = useState(false);
  const [newMaterial, setNewMaterial] = useState({
    name: '',
    description: '',
    photo_url: '',
    quantite: 0,
    emplacement: '',
    etat: '',
    engin_id: '',
    doc: '',
    media: '',
    affectation: '', // NEW: Add affectation to initial state
  });
  const [selectedMaterial, setSelectedMaterial] = useState<Materiel | null>(null);

  // Search and filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [filterEngin, setFilterEngin] = useState('');
  const [filterEmplacement, setFilterEmplacement] = useState('');

  const fetchEngins = useCallback(async () => {
    try {
      const { data, error: enginError } = await supabase
        .from('engins')
        .select('id, name');
      if (enginError) throw enginError;
      setEngins(data);
    } catch (err: any) {
      toast.error(`Erreur lors du chargement des engins : ${err.message}`);
    }
  }, []);

  const fetchMaterials = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      let query = supabase
        .from('materiels')
        .select(`
          *,
          engins (
            name
          )
        `);

      if (searchTerm) {
        query = query.ilike('name', `%${searchTerm}%`);
      }
      if (filterEngin && filterEngin !== 'all_engins') {
        query = query.eq('engin_id', filterEngin);
      }
      if (filterEmplacement && filterEmplacement !== 'all_emplacements') {
        query = query.ilike('emplacement', `%${filterEmplacement}%`);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) {
        throw fetchError;
      }

      const formattedData: Materiel[] = data.map((item: any) => ({
        ...item,
        engin_name: item.engins ? item.engins.name : 'N/A',
      }));

      setMaterials(formattedData);
    } catch (err: any) {
      setError(err.message);
      toast.error(`Erreur lors du chargement des matériels : ${err.message}`);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, filterEngin, filterEmplacement]);

  useEffect(() => {
    fetchEngins();
    fetchMaterials();
  }, [fetchEngins, fetchMaterials]);

  const handleNewMaterialChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setNewMaterial((prev) => ({
      ...prev,
      [id]: id === 'quantite' ? Number(value) : value,
    }));
  };

  const handleNewMaterialSelectChange = (id: string, value: string) => {
    setNewMaterial((prev) => ({
      ...prev,
      [id]: value === 'null-engin' ? null : value, // Convert 'null-engin' back to null for engin_id
    }));
  };

  const handleAddMaterial = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error("Utilisateur non authentifié.");
      }

      const { error: insertError } = await supabase
        .from('materiels')
        .insert({
          user_id: user.id,
          name: newMaterial.name,
          description: newMaterial.description,
          photo_url: newMaterial.photo_url,
          quantite: newMaterial.quantite,
          emplacement: newMaterial.emplacement,
          etat: newMaterial.etat,
          engin_id: newMaterial.engin_id || null,
          doc: newMaterial.doc || null,
          media: newMaterial.media || null,
          affectation: newMaterial.affectation, // NEW: Include affectation
        });

      if (insertError) {
        throw insertError;
      }

      toast.success('Matériel ajouté avec succès !');
      setIsAddMaterialDialogOpen(false);
      setNewMaterial({
        name: '',
        description: '',
        photo_url: '',
        quantite: 0,
        emplacement: '',
        etat: '',
        engin_id: '',
        doc: '',
        media: '',
        affectation: '',
      });
      fetchMaterials(); // Refresh the list
    } catch (err: any) {
      toast.error(`Erreur lors de l'ajout du matériel : ${err.message}`);
    }
  };

  const handleMaterialClick = (material: Materiel) => {
    setSelectedMaterial(material);
  };

  const handleBackToList = () => {
    setSelectedMaterial(null);
  };

  const uniqueEmplacements = Array.from(new Set(materials.map(m => m.emplacement))).filter(Boolean);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-background text-foreground">Chargement des matériels...</div>;
  }

  if (error) {
    return <div className="min-h-screen flex items-center justify-center bg-background text-destructive">Erreur : {error}</div>;
  }

  return (
    <main className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Matériels</h1>
        <Dialog open={isAddMaterialDialogOpen} onOpenChange={setIsAddMaterialDialogOpen}>
          <DialogTrigger asChild>
            <Button>Ajouter un matériel</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px] md:max-w-[600px] lg:max-w-[800px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Ajouter un nouveau matériel</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddMaterial} className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">Nom</Label>
                <Input id="name" value={newMaterial.name} onChange={handleNewMaterialChange} className="col-span-3" required />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="description" className="text-right">Description</Label>
                <Textarea id="description" value={newMaterial.description} onChange={handleNewMaterialChange} className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="photo_url" className="text-right">URL Photo</Label>
                <Input id="photo_url" type="url" value={newMaterial.photo_url} onChange={handleNewMaterialChange} className="col-span-3" placeholder="https://images.pexels.com/..." />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="quantite" className="text-right">Quantité</Label>
                <Input id="quantite" type="number" value={newMaterial.quantite} onChange={handleNewMaterialChange} className="col-span-3" required />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="emplacement" className="text-right">Emplacement</Label>
                <Input id="emplacement" value={newMaterial.emplacement} onChange={handleNewMaterialChange} className="col-span-3" required />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="etat" className="text-right">État</Label>
                <Input id="etat" value={newMaterial.etat} onChange={handleNewMaterialChange} className="col-span-3" required />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="engin_id" className="text-right">Engin Associé</Label>
                <Select
                  onValueChange={(value) => handleNewMaterialSelectChange('engin_id', value)}
                  value={newMaterial.engin_id || 'null-engin'} // Use 'null-engin' as default for Select
                >
                  <SelectTrigger id="engin_id" className="col-span-3">
                    <SelectValue placeholder="Sélectionner un engin" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="null-engin">Aucun engin</SelectItem> {/* Changed value to 'null-engin' */}
                    {engins.map((engin) => (
                      <SelectItem key={engin.id} value={engin.id}>
                        {engin.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="doc" className="text-right">URL Document</Label>
                <Input id="doc" type="url" value={newMaterial.doc} onChange={handleNewMaterialChange} className="col-span-3" placeholder="https://example.com/document.pdf" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="media" className="text-right">URL Média</Label>
                <Input id="media" type="url" value={newMaterial.media} onChange={handleNewMaterialChange} className="col-span-3" placeholder="https://example.com/video.mp4" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="affectation" className="text-right">Affectation</Label>
                <Select
                  onValueChange={(value) => handleNewMaterialSelectChange('affectation', value)}
                  value={newMaterial.affectation}
                >
                  <SelectTrigger id="affectation" className="col-span-3">
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
              <DialogFooter>
                <Button type="submit">Ajouter</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {selectedMaterial ? (
        <Card className="w-full max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle className="text-2xl flex justify-between items-center">
              {selectedMaterial.name}
              <Button onClick={handleBackToList} variant="outline">Retour à la liste</Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {selectedMaterial.photo_url && (
              <div className="md:col-span-2">
                <img src={selectedMaterial.photo_url} alt={selectedMaterial.name} className="w-full h-64 object-cover rounded-md" />
              </div>
            )}
            <div>
              <h3 className="font-semibold">Description:</h3>
              <p>{selectedMaterial.description || 'N/A'}</p>
            </div>
            <div>
              <h3 className="font-semibold">Quantité:</h3>
              <p>{selectedMaterial.quantite}</p>
            </div>
            <div>
              <h3 className="font-semibold">Emplacement:</h3>
              <p>{selectedMaterial.emplacement}</p>
            </div>
            <div>
              <h3 className="font-semibold">État:</h3>
              <p>{selectedMaterial.etat}</p>
            </div>
            <div>
              <h3 className="font-semibold">Engin Associé:</h3>
              <p>{selectedMaterial.engin_name || 'Aucun'}</p>
            </div>
            <div>
              <h3 className="font-semibold">Affectation:</h3>
              <p>{selectedMaterial.affectation || 'N/A'}</p>
            </div>
            {selectedMaterial.doc && (
              <div>
                <h3 className="font-semibold">Document:</h3>
                <a href={selectedMaterial.doc} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">Voir le document</a>
              </div>
            )}
            {selectedMaterial.media && (
              <div>
                <h3 className="font-semibold">Média:</h3>
                <a href={selectedMaterial.media} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">Voir le média</a>
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="mb-6 flex flex-col md:flex-row gap-4">
            <Input
              type="text"
              placeholder="Rechercher par nom..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-grow"
            />
            <Select
              onValueChange={(value) => setFilterEngin(value)}
              value={filterEngin}
            >
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="Filtrer par engin" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all_engins">Tous les engins</SelectItem>
                {engins.map((engin) => (
                  <SelectItem key={engin.id} value={engin.id}>
                    {engin.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              onValueChange={(value) => setFilterEmplacement(value)}
              value={filterEmplacement}
            >
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="Filtrer par emplacement" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all_emplacements">Tous les emplacements</SelectItem>
                {uniqueEmplacements.map((emplacement) => (
                  <SelectItem key={emplacement} value={emplacement}>
                    {emplacement}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {materials.length === 0 ? (
            <p className="text-center text-muted-foreground">Aucun matériel trouvé.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {materials.map((material) => (
                <ItemCard
                  key={material.id}
                  item={material} // Correction: Passer l'objet material complet comme prop 'item'
                  onClick={() => handleMaterialClick(material)}
                />
              ))}
            </div>
          )}
        </>
      )}
    </main>
  );
}
