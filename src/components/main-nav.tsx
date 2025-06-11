import { Moon, Sun, Menu } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { supabase } from '@/lib/supabase';
import { Session } from '@supabase/supabase-js';
import { NavLink } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useState } from 'react';

interface MainNavProps {
  session: Session | null;
}

export function MainNav({ session }: MainNavProps) {
  const { setTheme } = useTheme();
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const NavLinks = () => (
    <>
      <NavLink
        to="/"
        className={({ isActive }) =>
          cn(
            'transition-colors hover:text-primary',
            isActive ? 'text-primary font-semibold' : 'text-muted-foreground'
          )
        }
        onClick={() => setIsSheetOpen(false)}
      >
        Accueil
      </NavLink>
      <NavLink
        to="/vehicules"
        className={({ isActive }) =>
          cn(
            'transition-colors hover:text-primary',
            isActive ? 'text-primary font-semibold' : 'text-muted-foreground'
          )
        }
        onClick={() => setIsSheetOpen(false)}
      >
        Véhicules
      </NavLink>
      <NavLink
        to="/materiels"
        className={({ isActive }) =>
          cn(
            'transition-colors hover:text-primary',
            isActive ? 'text-primary font-semibold' : 'text-muted-foreground'
          )
        }
        onClick={() => setIsSheetOpen(false)}
      >
        Matériels
      </NavLink>
      <NavLink
        to="/personnel"
        className={({ isActive }) =>
          cn(
            'transition-colors hover:text-primary',
            isActive ? 'text-primary font-semibold' : 'text-muted-foreground'
          )
        }
        onClick={() => setIsSheetOpen(false)}
      >
        Personnel
      </NavLink>
      {session && ( // Afficher le lien de profil uniquement si l'utilisateur est connecté
        <NavLink
          to="/profile"
          className={({ isActive }) =>
            cn(
              'transition-colors hover:text-primary',
              isActive ? 'text-primary font-semibold' : 'text-muted-foreground'
            )
          }
          onClick={() => setIsSheetOpen(false)}
        >
          Profil
        </NavLink>
      )}
    </>
  );

  return (
    <nav className="flex items-center justify-between p-4 border-b bg-card text-card-foreground">
      {/* Removed h1 "Ma Galerie" */}
      <div className="flex items-center space-x-4">
        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-4">
          <NavLinks />
        </div>

        {/* Mobile Navigation Toggle */}
        <div className="md:hidden">
          <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon">
                <Menu className="h-[1.2rem] w-[1.2rem]" />
                <span className="sr-only">Ouvrir le menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[250px] sm:w-[300px]">
              <SheetHeader>
                <SheetTitle>Navigation</SheetTitle>
              </SheetHeader>
              <div className="flex flex-col space-y-4 mt-6">
                <NavLinks />
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {session && (
          <Button variant="ghost" onClick={handleLogout}>
            Déconnexion
          </Button>
        )}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon">
              <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">Toggle theme</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setTheme('light')}>
              Clair
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTheme('dark')}>
              Sombre
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTheme('system')}>
              Système
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </nav>
  );
}
