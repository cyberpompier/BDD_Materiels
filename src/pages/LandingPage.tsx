import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface LandingPageProps {
  onFinish: () => void;
}

export function LandingPage({ onFinish }: LandingPageProps) {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      onFinish(); // Notify App.tsx that landing page is done
      navigate('/'); // Navigate to the home page
    }, 10000); // 5 seconds

    return () => clearTimeout(timer); // Clean up the timer
  }, [onFinish, navigate]);

  return (
    <div
      className="relative flex items-center justify-center min-h-screen bg-cover bg-center text-white"
      style={{
        backgroundImage: `url('https://f.hellowork.com/obs-static-images/seo/ObsJob/sapeur-pompier.jpg')`,
        backgroundAttachment: 'fixed',
      }}
    >
      <div className="absolute inset-0 bg-black opacity-60"></div> {/* Overlay for better text readability */}
      <div className="relative z-10 text-center p-8 bg-black bg-opacity-40 rounded-lg shadow-lg">
        <h1 className="text-5xl md:text-7xl font-extrabold mb-4 animate-fade-in-up">
          Bienvenue aux Sapeurs-Pompiers
        </h1>
        <p className="text-xl md:text-2xl font-medium animate-fade-in-up animation-delay-200">
          Votre portail de gestion des ressources
        </p>
        <div className="mt-8 text-lg animate-pulse">
          Chargement...
        </div>
      </div>
      <style>{`
        @keyframes fadeInOut {
          0% { opacity: 0; transform: translateY(20px); }
          10% { opacity: 1; transform: translateY(0); }
          90% { opacity: 1; transform: translateY(0); }
          100% { opacity: 0; transform: translateY(-20px); }
        }

        .animate-fade-in-up {
          animation: fadeInOut 5s ease-out forwards;
        }

        .animation-delay-200 {
          animation-delay: 0.2s;
        }
      `}</style>
    </div>
  );
}
