import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { GalleryItem, Materiel, Engin } from '@/lib/supabase';

interface ItemCardProps {
  item: GalleryItem | Materiel | Engin;
  onClick?: (item: GalleryItem | Materiel | Engin) => void; // Rendre la carte cliquable
}

export function ItemCard({ item, onClick }: ItemCardProps) {
  // Déterminer l'URL de l'image en fonction du type d'élément
  const imageUrl = 'image_url' in item ? item.image_url : item.photo_url;

  const handleClick = () => {
    if (onClick) {
      onClick(item);
    }
  };

  return (
    <Card
      className={`w-full max-w-sm mx-auto overflow-hidden shadow-lg transition-transform duration-300 hover:scale-105 ${onClick ? 'cursor-pointer' : ''}`}
      onClick={handleClick}
    >
      <CardHeader className="p-0">
        <img
          src={imageUrl}
          alt={item.name}
          className="w-full h-48 object-cover"
          onError={(e) => {
            e.currentTarget.src = 'https://images.pexels.com/photos/1072179/pexels-photo-1072179.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2'; // Fallback image
          }}
        />
      </CardHeader>
      <CardContent className="p-4">
        <CardTitle className="text-xl font-semibold mb-2">{item.name}</CardTitle>
        <CardDescription className="text-sm text-muted-foreground">
          {item.description}
        </CardDescription>
        {'quantite' in item && (
          <p className="text-sm text-muted-foreground mt-1">Quantité: {item.quantite}</p>
        )}
        {'emplacement' in item && (
          <p className="text-sm text-muted-foreground mt-1">Emplacement: {item.emplacement}</p>
        )}
        {'etat' in item && (
          <p className="text-sm text-muted-foreground mt-1">État: {item.etat}</p>
        )}
        {'engin_name' in item && item.engin_name && (
          <p className="text-sm text-muted-foreground mt-1">Affecté à: {item.engin_name}</p>
        )}
        {'cs_affectation' in item && (
          <p className="text-sm text-muted-foreground mt-1">Affectation: {item.cs_affectation}</p>
        )}
      </CardContent>
    </Card>
  );
}
