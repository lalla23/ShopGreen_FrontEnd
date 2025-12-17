import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { MapContainer, TileLayer, useMapEvents, useMap } from 'react-leaflet';
import { Search, Plus } from 'lucide-react';
import { Shop, ShopCategory, ShopStatus, UserRole } from '../types';
import { MOCK_SHOPS, TRENTO_CENTER } from '../constants';
import CustomMarker from '../components/CustomMarker';
import AddShopModal from '../components/AddShopModal';
import EditShopModal from '../components/EditShopModal';
import { useLocation, useNavigate } from 'react-router-dom';

// Helper to track map center for the "Add Shop" modal
const MapController: React.FC<{ onMove: (center: { lat: number; lng: number }) => void }> = ({ onMove }) => {
  const map = useMapEvents({
    moveend: () => {
      onMove(map.getCenter());
    },
  });
  return null;
};

// Fix for map rendering issues (grey tiles)
const MapInvalidator = () => {
  const map = useMap();
  useEffect(() => {
    // Small timeout to ensure container is fully rendered by DOM before invalidating size
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 200);
    return () => clearTimeout(timer);
  }, [map]);
  return null;
};

interface HomeProps {
  userRole: UserRole;
  favorites: string[];
  toggleFavorite: (id: string) => void;
  // We need to know WHO is voting now
  userName?: string | null; 
}

const Home: React.FC<HomeProps> = ({ userRole, favorites, toggleFavorite }) => {
  const [activeCategory, setActiveCategory] = useState<ShopCategory>(ShopCategory.ALL);
  const [searchQuery, setSearchQuery] = useState('');
  const [mapCenter, setMapCenter] = useState(TRENTO_CENTER);
  
  // Need to get userName from auth service conceptually, but in this mock structure 
  // we can infer it or we should have passed it from App. For now, assuming "Mario Rossi" or similar if logged in.
  const mockCurrentUserId = userRole === UserRole.ANONYMOUS ? null : (userRole === UserRole.OPERATOR ? 'Operator1' : 'Mario Rossi');

  // Local state for shops
  const [shops, setShops] = useState<Shop[]>(MOCK_SHOPS);
  
  // Modal State
  const [isAddModalOpen, setAddModalOpen] = useState(false);
  const [addModalInitialData, setAddModalInitialData] = useState<{name?: string, ownerId?: string} | undefined>(undefined);
  
  // Edit Modal State (RF11)
  const [editingShop, setEditingShop] = useState<Shop | null>(null);

  const location = useLocation();
  const navigate = useNavigate();

  // Handle navigation from Notification (Report Approval)
  useEffect(() => {
    if (location.state && location.state.action === 'create_shop_from_report') {
        const { data } = location.state;
        setAddModalInitialData({
            name: data.name,
            ownerId: data.ownerId
        });
        setAddModalOpen(true);
        // Clear state to avoid reopening on refresh
        window.history.replaceState({}, document.title);
    }
  }, [location]);


  // Handle creating a new shop (RF8)
  const handleAddShop = (newShop: Shop) => {
    setShops(prev => [...prev, newShop]);
    setAddModalOpen(false);
    setAddModalInitialData(undefined);
    
    // Different message if created by Operator vs User
    if (newShop.ownerId) {
       alert(`Attività "${newShop.name}" creata e associata a "${newShop.ownerId}".\nStato: Non Verificato (Grigio).`);
    } else {
       alert(`Attività "${newShop.name}" inserita con successo!\nStato: Non Verificato (Grigio).\nIn attesa di 8 feedback positivi per diventare verde.`);
    }
  };

  // Handle updating an existing shop (RF11)
  const handleUpdateShop = (updatedShop: Shop) => {
     setShops(prev => prev.map(s => s.id === updatedShop.id ? updatedShop : s));
     setEditingShop(null); // Close modal
  };

  // RF17: Handle Verification/Feedback
  const handleVerify = (id: string, isPositive: boolean) => {
     if (!mockCurrentUserId) return;

     setShops(prev => prev.map(shop => {
        if (shop.id === id) {
           // Prevent double voting logic is handled in UI (disabled buttons), but good to check here too
           if (shop.votes[mockCurrentUserId]) return shop;

           const voteType = isPositive ? 'up' : 'down';
           const scoreChange = isPositive ? 1 : -1;
           const newScore = shop.sustainabilityScore + scoreChange;
           
           // Copy votes and add new one
           const newVotes = { ...shop.votes, [mockCurrentUserId]: voteType as 'up' | 'down' };

           // Check logic: 8 positives = verified (green)
           let newStatus = shop.status;
           if (newScore >= 8 && shop.status === ShopStatus.UNVERIFIED) {
              newStatus = ShopStatus.OPEN;
           } else if (newScore <= -8) {
              newStatus = ShopStatus.CLOSED; 
           }
           
           return { 
             ...shop, 
             sustainabilityScore: newScore, 
             status: newStatus,
             votes: newVotes
           };
        }
        return shop;
     }));
  };

  const handleAddReview = (id: string, comment: string) => {
    if (!mockCurrentUserId) return;
    
    setShops(prev => prev.map(shop => {
      if (shop.id === id) {
        const newReview = {
          id: Date.now().toString(),
          user: mockCurrentUserId,
          comment: comment,
          date: new Date().toISOString().split('T')[0]
        };
        return { ...shop, reviews: [...shop.reviews, newReview] };
      }
      return shop;
    }));
  };

  const filteredShops = useMemo(() => {
    return shops.filter(shop => {
      const matchesCategory = activeCategory === ShopCategory.ALL || shop.category === activeCategory;
      const matchesSearch = shop.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            shop.address.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [shops, activeCategory, searchQuery]);

  const categories = [
    { label: 'Tutte', value: ShopCategory.ALL },
    { label: 'Vestiti', value: ShopCategory.CLOTHING },
    { label: 'Alimenti', value: ShopCategory.FOOD },
    { label: 'Cura casa/persona', value: ShopCategory.HOME_CARE },
  ];

  // Stabilize the callback to prevent infinite loops if MapController re-renders
  const handleMapMove = useCallback((center: { lat: number; lng: number }) => {
    setMapCenter(center);
  }, []);

  return (
    <div className="relative w-full h-[calc(100vh-64px)] overflow-hidden bg-gray-100">
      
      {/* Floating Search & Filter Bar */}
      <div className="absolute top-4 left-4 right-4 z-[400] flex flex-col gap-3 pointer-events-none">
        
        {/* Search Input */}
        <div className="w-full max-w-2xl pointer-events-auto shadow-lg">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 sm:text-sm transition-shadow"
              placeholder="Cerca negozio, via o prodotto..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap gap-2 pointer-events-auto">
          {categories.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setActiveCategory(cat.value)}
              className={`
                px-4 py-1.5 rounded-full text-sm font-semibold shadow-md transition-all transform hover:scale-105
                ${activeCategory === cat.value 
                  ? 'bg-green-700 text-white ring-2 ring-green-800' 
                  : 'bg-white text-gray-700 hover:bg-green-50'}
              `}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Map */}
      <MapContainer 
        center={[TRENTO_CENTER.lat, TRENTO_CENTER.lng]} 
        zoom={14} 
        scrollWheelZoom={true} 
        className="w-full h-full"
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {/* Fix for grey tiles */}
        <MapInvalidator />
        
        {/* Logic to track map movement */}
        <MapController onMove={handleMapMove} />

        {/* Markers */}
        {filteredShops.map(shop => (
          <CustomMarker 
            key={shop.id} 
            shop={shop} 
            userRole={userRole}
            userName={mockCurrentUserId}
            isFavorite={favorites.includes(shop.id)}
            onToggleFavorite={toggleFavorite}
            onVerify={handleVerify}
            onAddReview={handleAddReview}
            // RF11: Pass edit handler
            onEditClick={(s) => setEditingShop(s)}
            // Logic for auto-opening popup: if only 1 result is found in filtered list
            forceOpen={filteredShops.length === 1}
          />
        ))}

      </MapContainer>

      {/* "Segnala Attività" Floating Action Button (Moved out of legend) */}
      {userRole !== UserRole.ANONYMOUS && (
        <div className="absolute bottom-6 right-6 z-[400] pointer-events-auto">
          <button 
            onClick={() => {
                setAddModalInitialData(undefined);
                setAddModalOpen(true);
            }}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-5 py-3 rounded-full shadow-xl font-bold transition-all hover:scale-105"
          >
            <Plus className="w-5 h-5" />
            Segnala nuova attività
          </button>
        </div>
      )}

      {/* Add Shop Modal */}
      <AddShopModal 
        isOpen={isAddModalOpen} 
        onClose={() => {
            setAddModalOpen(false);
            setAddModalInitialData(undefined);
        }}
        onSubmit={handleAddShop}
        userRole={userRole}
        currentMapCenter={mapCenter}
        existingShops={shops}
        initialData={addModalInitialData}
      />

      {/* Edit Shop Modal (RF11) */}
      <EditShopModal
        shop={editingShop}
        isOpen={!!editingShop}
        onClose={() => setEditingShop(null)}
        onUpdate={handleUpdateShop}
        userRole={userRole}
      />

    </div>
  );
};

export default Home;