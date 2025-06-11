import { useEffect, useState } from 'react';
import './App.css';
import { MainNav } from './components/main-nav';
import { supabase, GalleryItem } from './lib/supabase'; // Utiliser GalleryItem
import { Toaster } from './components/ui/sonner';
import { AuthForm } from './components/auth-form';
import { Session } from '@supabase/supabase-js';
import { Routes, Route } from 'react-router-dom';
import { VehiclesPage } from './pages/VehiclesPage';
import { MaterialsPage } from './pages/MaterialsPage';
import { PersonnelPage } from './pages/PersonnelPage';
import { LandingPage } from './pages/LandingPage';
import { ItemCard } from './components/item-card'; // Importez ItemCard ici
import { ProfilePage } from './pages/ProfilePage'; // Importez ProfilePage

function HomePage() {
  const [items, setItems] = useState<GalleryItem[]>([]); // Utiliser GalleryItem
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // Session est gérée au niveau de App.tsx, pas besoin ici

  useEffect(() => {
    const fetchItems = async () => {
      // Récupérer la session pour vérifier l'authentification
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        setItems([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      try {
        // Récupérer les données de la table 'items'
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
  }, []); // Dépendance vide pour ne s'exécuter qu'une fois au montage

  return (
    <main className="container mx-auto p-6">
      <h2 className="text-3xl font-bold text-center mb-8">Notre Galerie</h2>
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
  );
}

function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [loadingSession, setLoadingSession] = useState(true);
  const [showLandingPage, setShowLandingPage] = useState(true); // Nouvelle état pour la landing page

  useEffect(() => {
    // Ne charger la session qu'après la fin de la landing page
    if (!showLandingPage) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        setSession(session);
        setLoadingSession(false);
      });

      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange((_event, session) => {
        setSession(session);
        setLoadingSession(false);
      });

      return () => subscription.unsubscribe();
    }
  }, [showLandingPage]); // Dépend de showLandingPage

  if (showLandingPage) {
    return <LandingPage onFinish={() => setShowLandingPage(false)} />;
  }

  if (loadingSession) {
    return <div className="min-h-screen flex items-center justify-center bg-background text-foreground">Chargement de la session...</div>;
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Toaster /> {/* Le Toaster est rendu une seule fois ici */}
      {!session ? (
        <AuthForm />
      ) : (
        <>
          <MainNav session={session} />
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/vehicules" element={<VehiclesPage />} />
            <Route path="/materiels" element={<MaterialsPage />} />
            <Route path="/personnel" element={<PersonnelPage />} />
            <Route path="/profile" element={<ProfilePage />} /> {/* Nouvelle route pour le profil */}
          </Routes>
        </>
      )}
    </div>
  );
}

export default App;
