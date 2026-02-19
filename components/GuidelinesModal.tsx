import React from 'react';

interface GuidelinesModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'privacy' | 'guidelines';
}

const GuidelinesModal: React.FC<GuidelinesModalProps> = ({ isOpen, onClose, type }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[3000] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <div 
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-y-auto animate-in fade-in zoom-in duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="flex justify-between items-center mb-6 border-b dark:border-gray-700 pb-4">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {type === 'privacy' ? 'Informativa sulla Privacy' : 'Linee Guida Sostenibilità'}
            </h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white">Chiudi</button>
          </div>
          
          <div className="prose dark:prose-invert max-w-none text-gray-700 dark:text-gray-300">
            {type === 'privacy' ? (
              <>
                <p>Ultimo aggiornamento: Dicembre 2025</p>
                <h3>1. Raccolta Dati</h3>
                <p>Raccogliamo solo i dati necessari per il funzionamento del servizio (username, preferenze, liste preferiti).</p>
                <h3>2. Utilizzo</h3>
                <p>I dati vengono utilizzati per personalizzare l'esperienza utente e garantire la sicurezza dell'account.</p>
                <h3>3. Condivisione</h3>
                <p>Non condividiamo i tuoi dati con terze parti senza il tuo esplicito consenso.</p>
              </>
            ) : (
              <>
                <p className="mb-4">
                  Un’attività commerciale si definisce sostenibile secondo le politiche ambientali di ShopGreen se si occupa (nella sua totalità/nella totalità di un suo reparto) della vendita di prodotti che rientrino in almeno una delle categorie sottostanti:
                </p>
                <ul className="list-disc pl-5 space-y-2 mb-4">
                  <li>Prodotti sfusi e relativi contenitori riutilizzabili</li>
                  <li>Prodotti “a km 0”</li>
                  <li>Prodotti il cui smaltimento ha un impatto ambientale ridotto</li>
                  <li>Prodotti vegani</li>
                  <li>Prodotti creati con materiali di scarto o riciclati (questo prevede che il recupero sia già stato effettuato e non sia solo a carico dell’utente)</li>
                  <li>Prodotti usati</li>
                </ul>
                <p>
                  Il negozio sostenibile si impegna a ridurre al minimo l’uso di imballaggi superflui e ad adottare soluzioni a basso impatto ambientale, equosolidali, ecocompatibili ed ecologiche prediligendo soluzioni di economia circolare degli oggetti e/o dei materiali di cui sono composti, che mostra l’impegno sostenuto.
                </p>
              </>
            )}
          </div>
          
          <div className="mt-8 pt-4 border-t dark:border-gray-700 flex justify-end">
            <button 
              onClick={onClose}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
            >
              Ho capito
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GuidelinesModal;
