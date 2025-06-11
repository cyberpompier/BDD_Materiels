import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch'; // Import the Switch component
import { GalleryItem, Materiel, Engin, supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';

interface ItemCardProps {
  item: GalleryItem | Materiel | Engin;
  onClick?: (item: GalleryItem | Materiel | Engin) => void;
  onUpdate?: (id: string, updatedFields: { comment?: string; quantite_reelle?: number; is_controlled?: boolean }) => void;
}

export function ItemCard({ item, onClick, onUpdate }: ItemCardProps) {
  const [isSelected, setIsSelected] = useState(false);
  const [comment, setComment] = useState('comment' in item && item.comment !== null ? item.comment : '');
  const [realQuantity, setRealQuantity] = useState<number | undefined>('quantite_reelle' in item ? item.quantite_reelle : undefined);
  const [isControlled, setIsControlled] = useState<boolean>('is_controlled' in item ? item.is_controlled || false : false); // New state for switch

  // Utiliser useEffect pour synchroniser l'état local avec les changements de la prop 'item'
  useEffect(() => {
    console.log('ItemCard: useEffect triggered for item change', item.id);
    setComment('comment' in item && item.comment !== null ? item.comment : '');
    setRealQuantity('quantite_reelle' in item ? item.quantite_reelle : undefined);
    setIsControlled('is_controlled' in item ? item.is_controlled || false : false); // Synchronize isControlled
  }, [item]);

  const imageUrl = 'image_url' in item ? item.image_url : item.photo_url;

  const handleSave = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Empêche la propagation de l'événement de clic
    console.log('ItemCard: handleSave function called.');
    const materielItem = item as Materiel;

    console.log('ItemCard: Tentative de sauvegarde pour l\'ID:', materielItem.id);
    console.log('ItemCard: Nouveau commentaire:', comment);
    console.log('ItemCard: Nouvelle quantité réelle:', realQuantity);

    try {
      const { data, error } = await supabase
        .from('materiels')
        .update({
          comment: comment,
          quantite_reelle: realQuantity,
        })
        .eq('id', materielItem.id);

      if (error) {
        console.error('ItemCard: Erreur Supabase lors de la sauvegarde du matériel:', error.message);
        console.error('ItemCard: Détails de l\'erreur:', error);
      } else {
        console.log('ItemCard: Matériel mis à jour avec succès!', data);
        setIsSelected(false); // Revenir à l'état non sélectionné après la sauvegarde
        console.log('ItemCard: isSelected set to false after save. Current value:', isSelected);

        // Appeler la fonction onUpdate du parent pour synchroniser l'état
        if (onUpdate && materielItem.id) {
          onUpdate(materielItem.id, { comment: comment, quantite_reelle: realQuantity });
        }
      }
    } catch (err: any) {
      console.error('ItemCard: Erreur inattendue lors de la sauvegarde:', err);
    }
  };

  const handleClick = () => {
    console.log('ItemCard: handleClick called for item:', item.id);
    // Vérifier la présence de quantite_reelle pour déterminer si c'est un Materiel
    if ('quantite_reelle' in item) {
      setIsSelected(!isSelected); // Basculer l'état de sélection pour les matériels
      console.log('ItemCard: isSelected toggled to', !isSelected);
    }
    if (onClick) {
      onClick(item); // Appeler le onClick parent si défini
    }
  };

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    setRealQuantity(isNaN(value) ? undefined : value);
    console.log('ItemCard: Real Quantity changed to', value);
  };

  const handleControlledChange = async (checked: boolean) => {
    setIsControlled(checked);
    console.log('ItemCard: isControlled changed to', checked);

    const materielItem = item as Materiel;
    try {
      const { data, error } = await supabase
        .from('materiels')
        .update({ is_controlled: checked })
        .eq('id', materielItem.id);

      if (error) {
        console.error('ItemCard: Erreur Supabase lors de la mise à jour du statut contrôlé:', error.message);
      } else {
        console.log('ItemCard: Statut contrôlé mis à jour avec succès!', data);
        if (onUpdate && materielItem.id) {
          onUpdate(materielItem.id, { is_controlled: checked });
        }
      }
    } catch (err: any) {
      console.error('ItemCard: Erreur inattendue lors de la mise à jour du statut contrôlé:', err);
    }
  };

  // Vérifier la présence de quantite_reelle pour déterminer si c'est un Materiel
  const isMateriel = (item as Materiel).quantite_reelle !== undefined;

  if (isMateriel) {
    const materielItem = item as Materiel;
    const hasComment = materielItem.comment && materielItem.comment.trim() !== '';
    // Nouvelle condition : quantité réelle < quantité nominale
    const isQuantityBelowNominal = materielItem.quantite_reelle !== undefined &&
                                   materielItem.quantite_nominale !== undefined &&
                                   materielItem.quantite_reelle < materielItem.quantite_nominale;

    return (
      <Card
        className={cn(
          `w-full max-w-full mx-auto overflow-hidden shadow-lg transition-transform duration-300 hover:scale-105 flex items-center pt-16 px-4 pb-4 relative`, // Adjusted padding-top to pt-16
          onClick || isMateriel ? 'cursor-pointer' : '',
          isSelected ? 'border-2 border-blue-500 bg-blue-50' : '',
          hasComment && !isSelected ? 'bg-orange-100' : '', // Orange pâle pour le commentaire
          isQuantityBelowNominal && !isSelected ? 'bg-red-100 text-red-800' : '' // Rouge pâle pour quantité inférieure à la nominale
        )}
        onClick={handleClick}
      >
        <div className="absolute top-4 left-4 z-10 flex items-center space-x-2"> {/* Adjusted top and left to top-4 left-4 */}
          <Switch
            id={`controlled-switch-${materielItem.id}`}
            checked={isControlled}
            onCheckedChange={handleControlledChange}
            onClick={(e) => e.stopPropagation()} // Prevent card click when interacting with switch
            className="data-[state=checked]:bg-green-500" // Make switch green when checked
          />
          <label htmlFor={`controlled-switch-${materielItem.id}`} className="text-xs font-medium text-gray-700">
            Contrôlé
          </label>
        </div>
        <div className="flex-shrink-0 mr-4">
          <img
            src={imageUrl}
            alt={materielItem.name}
            className="w-16 h-16 object-cover rounded-full"
            onError={(e) => {
              e.currentTarget.src = 'https://images.pexels.com/photos/4033148/pexels-photo-4033148.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2';
            }}
          />
        </div>
        <div className="flex-grow text-left">
          <CardTitle className="text-lg font-bold mb-1">{materielItem.name}</CardTitle>
          <CardDescription className="text-sm text-muted-foreground">
            {materielItem.description}
          </CardDescription>
          <p className="text-sm text-muted-foreground mt-1">Emplacement: {materielItem.emplacement}</p>
          {isSelected && (
            <div className="mt-2 space-y-2">
              <label htmlFor={`real-quantity-${materielItem.id}`} className="sr-only">Quantité Réelle</label>
              <Input
                id={`real-quantity-${materielItem.id}`}
                type="number"
                placeholder="Quantité Réelle"
                value={realQuantity !== undefined ? realQuantity : ''}
                onChange={handleQuantityChange}
                onClick={(e) => e.stopPropagation()}
                className="w-full text-sm"
              />
              <label htmlFor={`comment-${materielItem.id}`} className="sr-only">Commentaire</label>
              <Textarea
                id={`comment-${materielItem.id}`}
                placeholder="Ajouter un commentaire..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                onClick={(e) => e.stopPropagation()}
                className="w-full text-sm"
              />
              <Button onClick={handleSave} className="mt-2 w-full bg-green-500 text-white hover:bg-green-600">
                Valider
              </Button>
            </div>
          )}
          {!isSelected && (
            <>
              <p className="text-sm text-muted-foreground mt-1">Quantité Nominale: {materielItem.quantite_nominale}</p>
              <p className="text-sm text-muted-foreground mt-1">Quantité Réelle: {materielItem.quantite_reelle}</p>
              {materielItem.comment && (
                <p className="text-sm text-muted-foreground mt-1">Commentaire: {materielItem.comment}</p>
              )}
            </>
          )}
        </div>
      </Card>
    );
  }

  // Rendu original pour les autres types d'éléments (Engin, GalleryItem)
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
            e.currentTarget.src = 'https://images.pexels.com/photos/1072179/pexels-photo-1072179.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2';
          }}
        />
      </CardHeader>
      <CardContent className="p-4">
        <CardTitle className="text-xl font-semibold mb-2">{item.name}</CardTitle>
        <CardDescription className="text-sm text-muted-foreground">
          {item.description}
        </CardDescription>
        {'quantite_reelle' in item && (
          <p className="text-sm text-muted-foreground mt-1">Quantité Réelle: {item.quantite_reelle}</p>
        )}
        {'quantite_nominale' in item && (
          <p className="text-sm text-muted-foreground mt-1">Quantité Nominale: {item.quantite_nominale}</p>
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
