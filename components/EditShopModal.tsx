import React, { useState, useEffect } from 'react';
import { Shop, ShopCategory, UserRole } from '../types';
import { X, Save, UserPlus, AlertTriangle, Loader2 } from 'lucide-react';

interface EditShopModalProps {
  shop: Shop | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (updatedShop: Shop) => void;
  userRole: UserRole;
}

const EditShopModal: React.FC<EditShopModalProps> = ({ shop, isOpen, onClose, onUpdate, userRole }) => {
  const [formData, setFormData] = useState<Partial<Shop>>({});
  const [newOwner, setNewOwner] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (shop) {
      setFormData({ ...shop });
      setNewOwner(shop.ownerId || '');
      setError(null);
    }
  }, [shop, isOpen]);

  if (!isOpen || !shop || userRole !== UserRole.OPERATOR) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSaving(true);

    // Eccezione 2: Validazione Dati
    if (!formData.name || !formData.address) {
       setError("Nome e Indirizzo sono obbligatori.");
       setIsSaving(false);
       return;
    }

    // Simulazione ritardo di rete e possibile errore database (Eccezione 1)
    setTimeout(() => {
       // Simuliamo un errore random (10% di probabilità)
       const randomError = Math.random() < 0.1;
       
       if (randomError) {
         setError("Errore di connessione al database. Riprova più tardi.");
         setIsSaving(false);
       } else {
         const updatedShop = {
           ...shop,
           ...formData,
           ownerId: newOwner.trim() !== '' ? newOwner.trim() : undefined
         };
         
         onUpdate(updatedShop as Shop);
         
         if (newOwner.trim() && newOwner !== shop.ownerId) {
            alert(`Permessi aggiornati: L'utente "${newOwner}" è ora associato come gestore di "${updatedShop.name}".`);
         }
         
         setIsSaving(false);
         onClose();
       }
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-[3000] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="sticky top-0 bg-white px-6 py-4 border-b border-gray-100 flex justify-between items-center z-10">
          <div className="flex items-center gap-2">
            <div className="bg-orange-100 p-2 rounded-lg">
               <UserPlus className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Modifica Attività</h2>
              <p className="text-xs text-gray-500">Area Operatore</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mx-6 mt-4 p-3 bg-red-50 text-red-700 rounded-lg flex items-center gap-2 text-sm border border-red-200">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">Nome Attività</label>
              <input 
                type="text" 
                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 outline-none"
                value={formData.name || ''}
                onChange={e => setFormData({...formData, name: e.target.value})}
              />
            </div>
            <div className="space-y-1">
               <label className="text-sm font-medium text-gray-700">Categoria</label>
               <select 
                  className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 outline-none bg-white"
                  value={formData.category}
                  onChange={e => setFormData({...formData, category: e.target.value as ShopCategory})}
               >
                  {Object.values(ShopCategory).map(cat => (
                     <option key={cat} value={cat}>{cat}</option>
                  ))}
               </select>
            </div>
          </div>

          <div className="space-y-1">
             <label className="text-sm font-medium text-gray-700">Indirizzo</label>
             <input 
               type="text" 
               className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 outline-none"
               value={formData.address || ''}
               onChange={e => setFormData({...formData, address: e.target.value})}
             />
          </div>

          <div className="space-y-1">
             <label className="text-sm font-medium text-gray-700">Orari</label>
             <input 
               type="text" 
               className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 outline-none"
               value={formData.hours || ''}
               onChange={e => setFormData({...formData, hours: e.target.value})}
             />
          </div>

          <div className="space-y-1">
             <label className="text-sm font-medium text-gray-700">Descrizione</label>
             <textarea 
               rows={3}
               className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 outline-none"
               value={formData.description || ''}
               onChange={e => setFormData({...formData, description: e.target.value})}
             />
          </div>

          {/* Associazione Venditore */}
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
             <h3 className="font-bold text-blue-900 text-sm mb-3 flex items-center gap-2">
               <UserPlus className="w-4 h-4"/> Gestione Venditore
             </h3>
             <div className="space-y-1">
                <label className="text-xs font-semibold text-blue-800">Associa Username Utente</label>
                <div className="flex gap-2">
                   <input 
                     type="text" 
                     placeholder="Es. mario.rossi"
                     className="flex-1 border border-blue-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                     value={newOwner}
                     onChange={e => setNewOwner(e.target.value)}
                   />
                </div>
                <p className="text-[10px] text-blue-600 mt-1">
                   Inserendo uno username, il sistema cambierà i permessi di quell'utente permettendogli di gestire questa attività.
                </p>
             </div>
          </div>

          {/* Links */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-gray-100">
             <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500">Sito Web</label>
                <input 
                   type="url" 
                   className="w-full border rounded-lg px-3 py-2 text-sm"
                   value={formData.website || ''}
                   onChange={e => setFormData({...formData, website: e.target.value})}
                />
             </div>
             <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500">Immagine URL</label>
                <input 
                   type="url" 
                   className="w-full border rounded-lg px-3 py-2 text-sm"
                   value={formData.imageUrl || ''}
                   onChange={e => setFormData({...formData, imageUrl: e.target.value})}
                />
             </div>
          </div>

          {/* Footer Actions */}
          <div className="flex gap-3 pt-4 border-t border-gray-100">
             <button 
               type="button" 
               onClick={onClose}
               disabled={isSaving}
               className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
             >
               Annulla
             </button>
             <button 
               type="submit" 
               disabled={isSaving}
               className="flex-1 px-4 py-2 bg-green-600 rounded-lg text-white font-medium hover:bg-green-700 transition-colors shadow-sm flex items-center justify-center gap-2 disabled:opacity-70"
             >
               {isSaving ? (
                 <>
                   <Loader2 className="w-4 h-4 animate-spin" /> Salvataggio...
                 </>
               ) : (
                 <>
                   <Save className="w-4 h-4" /> Salva Modifiche
                 </>
               )}
             </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default EditShopModal;