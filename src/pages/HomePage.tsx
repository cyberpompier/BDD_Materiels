import { useEffect, useState } from 'react';
import { supabase, GalleryItem } from '../lib/supabase';
import { ItemCard } from '../components/item-card';
import { Button } from '../components/ui/button';
import { Link } from 'react-router-dom';

export function HomePage() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchItems = async () => {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        setItems([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const { data, error } = await supabase.from('items').select('*');
        if (error) {
          throw error;
        }
        setItems(data || []);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchItems();
  }, []);

  return (
    <>
      {/* Hero Section */}
      <section
        className="relative flex items-center justify-center h-[60vh] md:h-[70vh] bg-cover bg-center text-white"
        style={{
          backgroundImage: `url('https://sapeurs-pompiers35.fr/content/uploads/2021/02/photo-pompier-affiche-femme-1-scaled.jpg')`,
          backgroundAttachment: 'fixed',
        }}
      >
        <div className="absolute inset-0 bg-black opacity-60"></div>
        <div className="relative z-10 text-center p-8 bg-black bg-opacity-30 rounded-lg shadow-2xl max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-extrabold mb-4 leading-tight">
            Gérez Efficacement Vos Ressources de Sapeurs-Pompiers
          </h1>
          <p className="text-lg md:text-xl font-medium mb-8">
            Un système intégré pour le suivi des véhicules, des matériels et du personnel.
          </p>
          <Button asChild size="lg" className="bg-red-600 hover:bg-red-700 text-white text-lg px-8 py-3 rounded-full shadow-lg transition-all duration-300 ease-in-out transform hover:scale-105">
            <Link to="/vehicules">Explorer les Véhicules</Link>
          </Button>
        </div>
      </section>

      {/* Existing Gallery Section */}
      <main className="container mx-auto p-6 mt-12">
        <h2 className="text-3xl font-bold text-center mb-8">Notre Galerie d'Équipements</h2>
        {loading && <p className="text-center">Chargement des éléments...</p>}
        {error && <p className="text-center text-destructive">Erreur : {error}</p>}
        {!loading && !error && items.length === 0 && (
          <p className="text-center text-muted-foreground">Aucun élément trouvé. Ajoutez des données à votre table 'items' dans Supabase !</p>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {items.map((item) => (
            <ItemCard key={item.id} item={item} />
          ))}
        </div>
      </main>
    </>
  );
}
