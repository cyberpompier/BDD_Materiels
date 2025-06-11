import { useEffect, useState } from 'react';
import './App.css';
import { MainNav } from './components/main-nav';
import { supabase } from './lib/supabase';
import { Toaster } from './components/ui/sonner';
import { AuthForm } from './components/auth-form';
import { Session } from '@supabase/supabase-js';
import { Routes, Route } from 'react-router-dom';
import { VehiclesPage } from './pages/VehiclesPage';
import { MaterialsPage } from './pages/MaterialsPage';
import { PersonnelPage } from './pages/PersonnelPage';
import { LandingPage } from './pages/LandingPage';
import { HomePage } from './pages/HomePage';
import { ProfilePage } from './pages/ProfilePage'; // Importez ProfilePage

function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [loadingSession, setLoadingSession] = useState(true);
  const [showLandingPage, setShowLandingPage] = useState(true);

  useEffect(() => {
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
  }, [showLandingPage]);

  if (showLandingPage) {
    return <LandingPage onFinish={() => setShowLandingPage(false)} />;
  }

  if (loadingSession) {
    return <div className="min-h-screen flex items-center justify-center bg-background text-foreground">Chargement de la session...</div>;
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Toaster />
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
            <Route path="/profile" element={<ProfilePage />} />
          </Routes>
        </>
      )}
    </div>
  );
}

export default App;
