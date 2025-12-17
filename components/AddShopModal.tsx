import React, { useState, useEffect, useRef } from 'react';
import { Shop, ShopCategory, ShopStatus, UserRole, Coordinates } from '../types';
import { X, Camera, Image as ImageIcon, Trash2, Clock, MapPin, Globe, Layout, Type, UserPlus, Crosshair, CheckSquare, Square } from 'lucide-react';

interface AddShopModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (shop: Shop) => void;
  userRole: UserRole;
  currentMapCenter: Coordinates;
  existingShops: Shop[]; // Added to access existing data
  initialData?: {
    name?: string;
    ownerId?: string;
  };
}

const DAYS = ['Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato', 'Domenica'];

const AddShopModal: React.FC<AddShopModalProps> = ({ isOpen, onClose, onSubmit, userRole, currentMapCenter, existingShops, initialData }) => {
  const [activeTab, setActiveTab] = useState<'report' | 'claim'>('report');
  
  // Claim Specific State
  const [isAlreadyPresent, setIsAlreadyPresent] = useState(false);

  // Basic Info
  const [name, setName] = useState('');
  const [category, setCategory] = useState<ShopCategory>(ShopCategory.OTHER);
  const [address, setAddress] = useState('');
  const [ownerId, setOwnerId] = useState(''); // New State for Owner Association
  
  // Links
  const [website, setWebsite] = useState('');
  const [googleMapsLink, setGoogleMapsLink] = useState('');
  const [iosMapsLink, setIosMapsLink] = useState('');

  // Image Upload State
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Hours State Management
  const [weeklyHours, setWeeklyHours] = useState(
    DAYS.map(day => ({ day, time: '', isClosed: false }))
  );

  // Coordinates - Managed as strings initially to allow easier typing of decimals
  const [lat, setLat] = useState<string | number>(currentMapCenter.lat);
  const [lng, setLng] = useState<string | number>(currentMapCenter.lng);

  useEffect(() => {
    if (isOpen) {
      if (!isAlreadyPresent) {
        setLat(currentMapCenter.lat);
        setLng(currentMapCenter.lng);
      }
      
      // Pre-fill data if coming from a Report Notification
      if (initialData) {
        if (initialData.name) setName(initialData.name);
        if (initialData.ownerId) setOwnerId(initialData.ownerId);
      }
    }
  }, [isOpen, currentMapCenter, initialData]);

  // Reset isAlreadyPresent when switching tabs
  useEffect(() => {
    if (activeTab === 'report') {
        setIsAlreadyPresent(false);
        // Clear fields if switching back
        if (!initialData) {
            setName('');
            setAddress('');
        }
    }
  }, [activeTab, initialData]);

  if (!isOpen) return null;

  const handleExistingShopSelect = (shopId: string) => {
    const shop = existingShops.find(s => s.id === shopId);
    if (shop) {
        setName(shop.name);
        setCategory(shop.category);
        setAddress(shop.address);
        setLat(shop.coordinates.lat);
        setLng(shop.coordinates.lng);
        setWebsite(shop.website || '');
        setGoogleMapsLink(shop.googleMapsLink || '');
        setIosMapsLink(shop.iosMapsLink || '');
        // Note: We don't overwrite the image/license upload usually, as the claimer provides their proof
    } else {
        setName('');
    }
  };

  const handleHourChange = (index: number, value: string) => {
    const newHours = [...weeklyHours];
    newHours[index].time = value;
    setWeeklyHours(newHours);
  };

  const handleClosedToggle = (index: number) => {
    const newHours = [...weeklyHours];
    newHours[index].isClosed = !newHours[index].isClosed;
    if (newHours[index].isClosed) {
        newHours[index].time = '';
    }
    setWeeklyHours(newHours);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const removeImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPreviewImage(null);
    if (fileInputRef.current) {
        fileInputRef.current.value = '';
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const formattedHours = weeklyHours.map(h => {
        if (h.isClosed) return `${h.day}: Chiuso`;
        return `${h.day}: ${h.time || 'Orario non specificato'}`;
    }).join('\n');

    const newShop: Shop = {
      id: Date.now().toString(),
      name: name,
      address: address,
      description: activeTab === 'claim' ? 'Richiesta di reclamo attività esistente' : 'Nuova attività inserita',
      hours: formattedHours,
      category: category,
      coordinates: { lat: Number(lat), lng: Number(lng) },
      // Important: New shops created this way are UNVERIFIED (Gray) until approved by feedback
      status: ShopStatus.UNVERIFIED, 
      sustainabilityScore: 0,
      website: website,
      googleMapsLink: googleMapsLink,
      iosMapsLink: iosMapsLink,
      imageUrl: previewImage || '',
      votes: {},
      reviews: [],
      ownerId: ownerId.trim() !== '' ? ownerId.trim() : undefined
    };

    onSubmit(newShop);
    handleClose();
  };

  const handleClose = () => {
    setName('');
    setAddress('');
    setCategory(ShopCategory.OTHER);
    setWebsite('');
    setGoogleMapsLink('');
    setIosMapsLink('');
    setPreviewImage(null);
    setOwnerId('');
    setIsAlreadyPresent(false);
    setWeeklyHours(DAYS.map(day => ({ day, time: '', isClosed: false })));
    onClose();
  };

  // Render Logic for Image Uploaders (Standard vs License)
  const renderImageUpload = (label: string, isLicense = false) => (
    <div className="space-y-2">
        <label className="text-gray-600 font-bold text-sm ml-4">{label}</label>
        <input type="file" accept="image/*" ref={fileInputRef} onChange={handleImageUpload} className="hidden" />
        
        {!previewImage ? (
            <div onClick={triggerFileInput} className={`w-full ${isLicense ? 'h-32' : 'h-48'} bg-gray-100 rounded-[20px] border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-500 cursor-pointer hover:bg-gray-200 transition-all group`}>
                <div className="bg-white p-3 rounded-full shadow-sm mb-2 group-hover:scale-110 transition-transform">
                    <Camera className="w-6 h-6 text-gray-400" />
                </div>
                <span className="font-medium text-sm">Clicca per caricare una foto</span>
            </div>
        ) : (
            <div className={`relative w-full ${isLicense ? 'h-32' : 'h-56'} rounded-[20px] overflow-hidden shadow-md group`}>
                <img src={previewImage} alt="Preview" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                    <button type="button" onClick={triggerFileInput} className="p-2 bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-white/40 transition-colors">
                        <ImageIcon className="w-5 h-5" />
                    </button>
                    <button type="button" onClick={removeImage} className="p-2 bg-red-500/80 backdrop-blur-md rounded-full text-white hover:bg-red-600/90 transition-colors">
                        <Trash2 className="w-5 h-5" />
                    </button>
                </div>
            </div>
        )}
    </div>
  );

  return (
    <div className="fixed inset-0 z-[3000] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-[30px] shadow-2xl w-full max-w-2xl h-[90vh] flex flex-col overflow-hidden relative border border-gray-100 animate-in fade-in zoom-in duration-300">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-white sticky top-0 z-10">
            <h2 className="text-xl font-bold text-gray-800">
                {initialData ? 'Crea Nuova Attività (Da Segnalazione)' : 'Nuova Segnalazione'}
            </h2>
            <button onClick={handleClose} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors">
                <X className="w-5 h-5 text-gray-500" />
            </button>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
            
            {/* Tabs (Hidden if pre-filled from report) */}
            {!initialData && (
                <div className="flex bg-gray-100 rounded-full p-1 mb-6">
                    <button 
                    onClick={() => setActiveTab('report')}
                    className={`flex-1 py-2.5 text-center rounded-full font-bold text-sm transition-all duration-300
                        ${activeTab === 'report' ? 'bg-[#7dad57] text-white shadow-md' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                    Segnala nuova attività
                    </button>
                    <button 
                    onClick={() => setActiveTab('claim')}
                    className={`flex-1 py-2.5 text-center rounded-full font-bold text-sm transition-all duration-300
                        ${activeTab === 'claim' ? 'bg-[#7dad57] text-white shadow-md' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                    Segnala propria attività
                    </button>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
                
                {/* Image Section */}
                {renderImageUpload(activeTab === 'claim' ? 'Carica Licenza Commerciale' : 'Foto del Negozio', activeTab === 'claim')}

                {/* --- CLAIM TAB SPECIFIC: CHECKBOX --- */}
                {activeTab === 'claim' && (
                  <div className="bg-green-50 p-4 rounded-2xl border border-green-100">
                    <button 
                      type="button"
                      onClick={() => setIsAlreadyPresent(!isAlreadyPresent)}
                      className="flex items-center gap-3 w-full text-left"
                    >
                       {isAlreadyPresent ? (
                          <CheckSquare className="w-6 h-6 text-green-600" />
                       ) : (
                          <Square className="w-6 h-6 text-gray-400" />
                       )}
                       <div>
                          <p className="font-bold text-gray-800 text-sm">L'attività è già presente nel sistema?</p>
                          <p className="text-xs text-gray-500">Seleziona questa opzione per collegare la licenza ad un segnaposto esistente.</p>
                       </div>
                    </button>
                  </div>
                )}

                {/* Common Fields */}
                <div className="space-y-4">
                    
                    {/* Name: Text or Select based on isAlreadyPresent */}
                    <div className="space-y-1">
                        <div className="flex items-center gap-2 ml-4 mb-1">
                           <Type className="w-4 h-4 text-gray-400" />
                           <label className="text-gray-600 font-bold text-sm">Nome Attività</label>
                        </div>
                        
                        {activeTab === 'claim' && isAlreadyPresent ? (
                            <div className="relative">
                                <select 
                                    value={name} // We use name as value here, or we could track ID separateley
                                    onChange={(e) => {
                                        // Find ID based on Name selection (simplified for UI, ideally use ID as value)
                                        const selectedId = existingShops.find(s => s.name === e.target.value)?.id;
                                        if (selectedId) handleExistingShopSelect(selectedId);
                                    }}
                                    className="w-full bg-green-50 text-gray-800 font-medium px-5 py-3 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#7dad57] transition-all appearance-none cursor-pointer border border-green-200"
                                >
                                    <option value="">-- Seleziona Attività --</option>
                                    {existingShops.map(s => (
                                        <option key={s.id} value={s.name}>{s.name}</option>
                                    ))}
                                </select>
                                <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-green-600">
                                    <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"/></svg>
                                </div>
                            </div>
                        ) : (
                            <input 
                              type="text" 
                              required
                              placeholder="Es. EcoMarket Trento"
                              value={name}
                              onChange={(e) => setName(e.target.value)}
                              className="w-full bg-gray-100 text-gray-800 placeholder-gray-400 px-5 py-3 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#7dad57] transition-all"
                            />
                        )}
                    </div>

                    {/* Operator Only: Owner Association (Visible if pre-filled) */}
                    {(userRole === UserRole.OPERATOR || initialData) && (
                        <div className="bg-orange-50 p-4 rounded-2xl border border-orange-100 space-y-2">
                             <div className="flex items-center gap-2 mb-1">
                                <UserPlus className="w-4 h-4 text-orange-500" />
                                <label className="text-orange-900 font-bold text-sm">Associa a Utente (Proprietario)</label>
                             </div>
                             <input 
                                type="text" 
                                placeholder="Username o ID Utente"
                                value={ownerId}
                                onChange={(e) => setOwnerId(e.target.value)}
                                className="w-full bg-white border border-orange-200 text-gray-800 px-4 py-2 rounded-xl focus:outline-none focus:border-orange-500 text-sm"
                             />
                             <p className="text-[10px] text-orange-700">
                                Questo utente riceverà i permessi per gestire la scheda del negozio.
                             </p>
                        </div>
                    )}

                    {/* Category */}
                    <div className="space-y-1">
                        <div className="flex items-center gap-2 ml-4 mb-1">
                           <Layout className="w-4 h-4 text-gray-400" />
                           <label className="text-gray-600 font-bold text-sm">Categoria</label>
                        </div>
                        <div className="relative">
                            <select 
                                value={category}
                                onChange={(e) => setCategory(e.target.value as ShopCategory)}
                                className="w-full bg-gray-100 text-gray-800 px-5 py-3 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#7dad57] transition-all appearance-none cursor-pointer"
                            >
                                {Object.values(ShopCategory).map(cat => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>
                            <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-gray-500">
                                <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"/></svg>
                            </div>
                        </div>
                    </div>

                    {/* Address */}
                    <div className="space-y-1">
                        <div className="flex items-center gap-2 ml-4 mb-1">
                           <MapPin className="w-4 h-4 text-gray-400" />
                           <label className="text-gray-600 font-bold text-sm">Indirizzo</label>
                        </div>
                        <input 
                          type="text"
                          required
                          placeholder="Es. Via Roma 10"
                          value={address}
                          onChange={(e) => setAddress(e.target.value)} 
                          className="w-full bg-gray-100 text-gray-800 placeholder-gray-400 px-5 py-3 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#7dad57] transition-all"
                        />
                    </div>

                    {/* Coordinates */}
                    <div className="space-y-1">
                        <div className="flex items-center gap-2 ml-4 mb-1">
                           <Crosshair className="w-4 h-4 text-gray-400" />
                           <label className="text-gray-600 font-bold text-sm">Coordinate (Lat / Lng)</label>
                        </div>
                        <div className="flex gap-3">
                            <div className="flex-1">
                                <input 
                                  type="number"
                                  step="any"
                                  placeholder="Latitudine"
                                  value={lat}
                                  onChange={(e) => setLat(e.target.value)} 
                                  className="w-full bg-gray-100 text-gray-800 placeholder-gray-400 px-5 py-3 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#7dad57] transition-all"
                                />
                            </div>
                            <div className="flex-1">
                                <input 
                                  type="number"
                                  step="any"
                                  placeholder="Longitudine"
                                  value={lng}
                                  onChange={(e) => setLng(e.target.value)} 
                                  className="w-full bg-gray-100 text-gray-800 placeholder-gray-400 px-5 py-3 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#7dad57] transition-all"
                                />
                            </div>
                        </div>
                        <p className="text-[10px] text-gray-400 ml-4">
                            Modifica manualmente le coordinate per posizionare il marker con precisione.
                        </p>
                    </div>

                    {/* Hours - Full Week */}
                    <div className="bg-gray-50 rounded-[20px] p-5 border border-gray-100">
                        <div className="flex items-center gap-2 mb-3">
                           <Clock className="w-4 h-4 text-gray-400" />
                           <label className="text-gray-600 font-bold text-sm">Orari di Apertura</label>
                        </div>
                        
                        <div className="space-y-2">
                            {weeklyHours.map((item, index) => (
                                <div key={item.day} className="flex items-center gap-3">
                                    <span className="w-24 font-bold text-gray-700 text-sm">{item.day}</span>
                                    <input 
                                      type="text" 
                                      placeholder={item.isClosed ? "Chiuso" : "Es. 09:00 - 18:00"}
                                      disabled={item.isClosed}
                                      value={item.time}
                                      onChange={(e) => handleHourChange(index, e.target.value)}
                                      className={`flex-1 bg-white border border-gray-200 rounded-xl px-4 py-2 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:border-[#7dad57] transition-all ${item.isClosed ? 'bg-gray-100 text-gray-400' : ''}`}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => handleClosedToggle(index)}
                                        className={`px-3 py-2 rounded-xl text-xs font-bold transition-colors border
                                          ${item.isClosed 
                                            ? 'bg-gray-800 text-white border-gray-800' 
                                            : 'bg-white text-gray-400 border-gray-200 hover:border-gray-400'}`}
                                    >
                                        Chiuso
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Links */}
                    <div className="space-y-1">
                        <div className="flex items-center gap-2 ml-4 mb-1">
                           <Globe className="w-4 h-4 text-gray-400" />
                           <label className="text-gray-600 font-bold text-sm">Link Utili</label>
                        </div>
                        <div className="grid grid-cols-1 gap-3">
                            <input 
                                type="url" 
                                placeholder="Sito Web"
                                value={website}
                                onChange={(e) => setWebsite(e.target.value)}
                                className="w-full bg-gray-100 text-gray-800 px-5 py-3 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-[#7dad57]"
                            />
                            
                            <input 
                                type="url" 
                                placeholder="Link Google Maps"
                                value={googleMapsLink}
                                onChange={(e) => setGoogleMapsLink(e.target.value)}
                                className="w-full bg-gray-100 text-gray-800 px-5 py-3 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-[#7dad57]"
                            />
                            <input 
                                type="url" 
                                placeholder="Link Apple Maps"
                                value={iosMapsLink}
                                onChange={(e) => setIosMapsLink(e.target.value)}
                                className="w-full bg-gray-100 text-gray-800 px-5 py-3 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-[#7dad57]"
                            />
                        </div>
                    </div>
                </div>

                {/* Submit Button */}
                <div className="pt-4 pb-2">
                    <button 
                      type="submit" 
                      className="w-full bg-[#d9e8cd] hover:bg-[#c4dbb3] text-black font-bold text-lg py-4 rounded-2xl shadow-sm transition-all transform active:scale-95"
                    >
                      {initialData ? 'Crea Scheda Attività' : (activeTab === 'report' ? 'Invia Segnalazione' : 'Segnala propria attività')}
                    </button>
                </div>
            </form>
        </div>
      </div>
    </div>
  );
};

export default AddShopModal;