import React from 'react';
import { MOCK_SHOPS } from '../constants';
import { Shop, ShopStatus } from '../types';
import { Trash2, MapPin, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';

interface FavoritesProps {
  favorites: string[];
  removeFavorite: (id: string) => void;
}

const Favorites: React.FC<FavoritesProps> = ({ favorites, removeFavorite }) => {
  const favoriteShops = MOCK_SHOPS.filter(shop => favorites.includes(shop.id));

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6 flex items-center gap-3">
        I tuoi Preferiti <span className="text-base font-normal text-gray-500 bg-gray-100 px-3 py-1 rounded-full">{favoriteShops.length}</span>
      </h1>

      {favoriteShops.length === 0 ? (
        <div className="text-center py-20 bg-gray-50 rounded-xl border border-dashed border-gray-300">
          <p className="text-gray-500 text-lg mb-4">Non hai ancora salvato nessuna attività.</p>
          <Link to="/" className="inline-block bg-green-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors">
            Esplora la mappa
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {favoriteShops.map((shop) => (
            <div key={shop.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
              <div className="p-5">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <span className="text-xs font-bold tracking-wider text-green-700 uppercase mb-1 block">{shop.category}</span>
                    <h3 className="text-xl font-bold text-gray-900">{shop.name}</h3>
                  </div>
                  <button 
                    onClick={() => removeFavorite(shop.id)}
                    className="text-gray-400 hover:text-red-500 p-1 rounded-full hover:bg-red-50 transition-colors"
                    title="Rimuovi dai preferiti"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
                
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">{shop.description}</p>
                
                <div className="space-y-2 text-sm text-gray-500 mb-4">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    <span className="truncate">{shop.address}</span>
                  </div>
                  <div className="flex items-center gap-2">
                     <div className={`w-2 h-2 rounded-full ${shop.status === ShopStatus.OPEN ? 'bg-green-500' : 'bg-red-500'}`}></div>
                     <span>{shop.hours}</span>
                  </div>
                </div>

                <div className="flex gap-2 mt-4 pt-4 border-t border-gray-100">
                   <a 
                     href={`https://maps.google.com/?q=${shop.coordinates.lat},${shop.coordinates.lng}`} 
                     target="_blank"
                     rel="noreferrer"
                     className="flex-1 text-center bg-gray-100 text-gray-700 py-2 rounded font-medium text-sm hover:bg-gray-200 transition-colors"
                   >
                     Mappa
                   </a>
                   {shop.website && (
                      <a href={shop.website} target="_blank" rel="noreferrer" className="flex items-center justify-center w-10 bg-gray-100 text-gray-700 rounded hover:bg-gray-200">
                        <ExternalLink className="w-4 h-4"/>
                      </a>
                   )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Favorites;
