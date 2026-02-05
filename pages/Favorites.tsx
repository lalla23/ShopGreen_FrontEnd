import React, { useEffect, useState } from 'react';
import { Shop, ShopStatus } from '../types';
import { Trash2, ExternalLink, Loader2, MapPin, Navigation } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { getPreferiti, deletePreferito } from '../services/preferitiService';

interface FavoritesProps {
  currentUserId: string | null;
  // Funzione per notificare App.tsx che un preferito è stato rimosso
  onRemoveUpdate: (id: string) => void; 
}

const Favorites: React.FC<FavoritesProps> = ({ currentUserId, onRemoveUpdate }) => {
  const [favoriteShops, setFavoriteShops] = useState<Shop[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  // Caricamento dei preferiti dal Backend
  useEffect(() => {
    const fetchFavorites = async () => {
      if (!currentUserId) return;
      
      setIsLoading(true);
      try {
        const shops = await getPreferiti(currentUserId);
        setFavoriteShops(shops);
      } catch (err: any) {
        setError(err.message || "Errore nel caricamento dei preferiti");
      } finally {
        setIsLoading(false);
      }
    };

    fetchFavorites();
  }, [currentUserId]);

  // Gestione Rimozione
  const handleRemove = async (e: React.MouseEvent, shopId: string) => {
    e.stopPropagation(); // Evita il click sulla card
    if (!currentUserId) return;

    if (!window.confirm("Vuoi rimuovere questa attività dai preferiti?")) return;

    try {
      await deletePreferito(currentUserId, shopId);
      setFavoriteShops(prev => prev.filter(s => s.id !== shopId));
      onRemoveUpdate(shopId);
    } catch (err) {
      alert("Impossibile rimuovere il preferito al momento.");
    }
  };

  // Click sulla Card -> Vai alla Mappa
  const handleCardClick = (shop: Shop) => {
    navigate('/', { 
      state: { 
        focusShopId: shop.id,
        center: shop.coordinates 
      } 
    });
  };

  // Helper per visualizzare lo stato (Colore e Testo)
  const getStatusInfo = (status: ShopStatus) => {
    switch (status) {
      case ShopStatus.OPEN: 
        return { color: 'bg-green-500', text: 'text-green-700', label: 'Aperto' };
      case ShopStatus.OPENING_SOON: 
        return { color: 'bg-yellow-500', text: 'text-yellow-700', label: 'Apre a breve' };
      case ShopStatus.CLOSED: 
        return { color: 'bg-red-500', text: 'text-red-700', label: 'Chiuso' };
      default: 
        return { color: 'bg-gray-400', text: 'text-gray-500', label: 'Non verificato' };
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-10 h-10 text-green-600 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-20">
        <p className="text-red-500 text-lg mb-4">{error}</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
        I tuoi Preferiti 
        <span className="text-sm font-bold text-green-700 bg-green-100 px-3 py-1 rounded-full border border-green-200">
          {favoriteShops.length}
        </span>
      </h1>
      <p className="text-gray-500 mb-8">Gestisci le tue attività salvate per accedervi velocemente.</p>

      {favoriteShops.length === 0 ? (
        <div className="text-center py-20 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
          <div className="bg-white p-4 rounded-full inline-block mb-4 shadow-sm">
             <Navigation className="w-8 h-8 text-green-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">La tua lista è vuota</h3>
          <p className="text-gray-500 text-lg mb-6 max-w-md mx-auto">Non hai ancora salvato nessuna attività.</p>
          <Link to="/" className="inline-flex items-center gap-2 bg-green-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-green-700 transition-all shadow-lg hover:shadow-xl active:scale-95">
            <Navigation className="w-5 h-5" /> Esplora la mappa
          </Link>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {favoriteShops.map((shop) => {
            const statusInfo = getStatusInfo(shop.status);

            return (
              <div 
                key={shop.id} 
                onClick={() => handleCardClick(shop)}
                className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-xl hover:border-green-300 transition-all cursor-pointer group flex flex-col h-full"
              >
               {/* Box colorato al posto dell'immagine */}
          <div className={`h-40 w-full relative overflow-hidden flex items-center justify-center ${
              shop.status==ShopStatus.UNVERIFIED ? 'bg-gray-100' : 'bg-emerald-100'
            }`}>
          
              {/* Icona decorativa al centro (verde se sostenibile, grigia se standard) */}
          <Navigation className={`w-16 h-16 ${
              shop.status==ShopStatus.UNVERIFIED ? 'text-gray-300' : 'text-emerald-200' 
            }`} 
          />

          {/* Pulsante Rimuovi */}
          <div className="absolute top-3 right-3">
            <button 
              onClick={(e) => handleRemove(e, shop.id)}
              className="bg-white/90 backdrop-blur-sm text-gray-400 hover:text-red-500 p-2 rounded-full hover:bg-red-50 transition-colors shadow-sm border border-gray-100"
              title="Rimuovi dai preferiti"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        </div>

                <div className="p-5 flex flex-col flex-1">
                  <div className="mb-auto">
                    {/* CATEGORIA DINAMICA DAL DB */}
                    <span className="text-xs font-bold tracking-wider text-green-600 uppercase mb-2 inline-block bg-green-50 px-2 py-1 rounded-md capitalize">
                      {shop.categories?.[0] || 'Altro'}
                    </span>
                    
                    <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-green-700 transition-colors line-clamp-1">
                      {shop.name}
                    </h3>
                    
                    {shop.description && (
                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">{shop.description}</p>
                    )}
                  </div>
                  
                  {/* STATO (Aperto/Chiuso) collegato al DB, SENZA ORARI */}
                  <div className="mt-4 mb-4 flex items-center gap-2">
                      <div className={`w-2.5 h-2.5 rounded-full ${statusInfo.color}`}></div>
                      <span className={`text-sm font-medium ${statusInfo.text}`}>
                        {statusInfo.label}
                      </span>
                  </div>

                  {/* Pulsanti */}
                  <div className="flex gap-2 mt-auto pt-4 border-t border-gray-100">
                    <a 
                      href={`https://www.google.com/maps?q=${shop.coordinates.lat},${shop.coordinates.lng}`}
                      target="_blank"
                      rel="noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="flex-1 text-center bg-gray-50 border border-gray-200 text-gray-700 py-2.5 rounded-xl font-bold text-xs hover:bg-gray-100 transition-colors flex items-center justify-center gap-2"
                    >
                      <MapPin className="w-3 h-3" /> Google Maps
                    </a>
                    {shop.website && (
                        <a 
                          href={shop.website} 
                          target="_blank" 
                          rel="noreferrer" 
                          onClick={(e) => e.stopPropagation()}
                          className="flex items-center justify-center w-12 bg-gray-50 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-100 hover:text-green-600 transition-colors"
                          title="Visita Sito Web"
                        >
                          <ExternalLink className="w-4 h-4"/>
                        </a>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Favorites;