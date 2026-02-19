import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Globe, Moon, Sun, Bell, FileText, Shield, ChevronRight, Check } from 'lucide-react';
import GuidelinesModal from '../components/GuidelinesModal';

interface SettingsProps {
  language: 'it' | 'en' | 'de';
  setLanguage: (lang: 'it' | 'en' | 'de') => void;
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
  emailNotifications: boolean;
  setEmailNotifications: (enabled: boolean) => void;
}

const Settings: React.FC<SettingsProps> = ({
  language, setLanguage,
  theme, setTheme,
  emailNotifications, setEmailNotifications
}) => {
  const [activeDoc, setActiveDoc] = useState<'privacy' | 'guidelines' | null>(null);


  const location = useLocation();
  useEffect(() => {
    if (location.state && location.state.openDoc) {
      setActiveDoc(location.state.openDoc);
      window.history.replaceState({}, document.title);
    }
  }, [location]);
  const renderDocContent = () => {
    if (!activeDoc) return null;

    return (
      <div className="fixed inset-0 z-[3000] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-y-auto animate-in fade-in zoom-in duration-200">
          <div className="p-6">
            <div className="flex justify-between items-center mb-6 border-b dark:border-gray-700 pb-4">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {activeDoc === 'privacy' ? 'Informativa sulla Privacy' : 'Linee Guida Sostenibilità'}
              </h2>
              <button onClick={() => setActiveDoc(null)} className="text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white">Chiudi</button>
            </div>

            <div className="prose dark:prose-invert max-w-none text-gray-700 dark:text-gray-300">
              {activeDoc === 'privacy' ? (
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
                onClick={() => setActiveDoc(null)}
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

  return (
    <div className="max-w-2xl mx-auto p-4 md:p-8">
      <GuidelinesModal
        isOpen={!!activeDoc}
        onClose={() => setActiveDoc(null)}
        type={activeDoc || 'guidelines'}
      />

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Impostazioni</h1>
        <p className="text-gray-500 dark:text-gray-400">Gestisci le tue preferenze e visualizza le informazioni legali.</p>
      </div>

      <div className="space-y-6">

        <section className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="p-4 md:p-6 border-b border-gray-100 dark:border-gray-700">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Globe className="w-5 h-5 text-blue-500" /> Lingua dell'interfaccia
            </h2>
          </div>
          <div className="p-4 md:p-6">
            <div className="grid grid-cols-3 gap-3">
              {[
                { code: 'it', label: 'Italiano', flag: '🇮🇹' },
                { code: 'en', label: 'English', flag: '🇬🇧' },
                { code: 'de', label: 'Deutsch', flag: '🇩🇪' }
              ].map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => setLanguage(lang.code as any)}
                  className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all
                    ${language === lang.code
                      ? 'border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400'
                      : 'border-gray-100 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 text-gray-600 dark:text-gray-300'}`}
                >
                  <span className="text-2xl mb-2">{lang.flag}</span>
                  <span className="font-semibold">{lang.label}</span>
                  {language === lang.code && <div className="absolute top-2 right-2 text-green-500"><Check className="w-4 h-4" /></div>}
                </button>
              ))}
            </div>
          </div>
        </section>
        <section className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="p-4 md:p-6 border-b border-gray-100 dark:border-gray-700">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
              {theme === 'light' ? <Sun className="w-5 h-5 text-orange-500" /> : <Moon className="w-5 h-5 text-purple-500" />}
              Tema Visualizzazione
            </h2>
          </div>
          <div className="p-4 md:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Modalità Scura</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Riduci l'affaticamento degli occhi in ambienti poco illuminati.</p>
              </div>
              <button
                onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
                className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2
                  ${theme === 'dark' ? 'bg-green-600' : 'bg-gray-200'}`}
              >
                <span className={`inline-block h-6 w-6 transform rounded-full bg-white shadow transition-transform
                  ${theme === 'dark' ? 'translate-x-7' : 'translate-x-1'}`}
                />
              </button>
            </div>
          </div>
        </section>

        <section className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="p-4 md:p-6 border-b border-gray-100 dark:border-gray-700">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Bell className="w-5 h-5 text-red-500" /> Notifiche
            </h2>
          </div>
          <div className="p-4 md:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Email di aggiornamento</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Ricevi novità su nuovi negozi e promozioni sostenibili.</p>
              </div>
              <button
                onClick={() => setEmailNotifications(!emailNotifications)}
                className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2
                  ${emailNotifications ? 'bg-green-600' : 'bg-gray-200'}`}
              >
                <span className={`inline-block h-6 w-6 transform rounded-full bg-white shadow transition-transform
                  ${emailNotifications ? 'translate-x-7' : 'translate-x-1'}`}
                />
              </button>
            </div>
          </div>
        </section>


        <section className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="p-4 md:p-6 border-b border-gray-100 dark:border-gray-700">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-gray-500" /> Documentazione
            </h2>
          </div>
          <div className="divide-y divide-gray-100 dark:divide-gray-700">
            <button
              onClick={() => setActiveDoc('privacy')}
              className="w-full flex items-center justify-between p-4 md:p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors text-left"
            >
              <div className="flex items-center gap-3">
                <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-lg text-blue-600 dark:text-blue-400">
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">Informativa sulla Privacy</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Come gestiamo i tuoi dati</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </button>

            <button
              onClick={() => setActiveDoc('guidelines')}
              className="w-full flex items-center justify-between p-4 md:p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors text-left"
            >
              <div className="flex items-center gap-3">
                <div className="bg-green-100 dark:bg-green-900/30 p-2 rounded-lg text-green-600 dark:text-green-400">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">Linee Guida Sostenibilità</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">I criteri per le attività ShopGreen</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </button>
          </div>
        </section>

      </div>
    </div>
  );
};

export default Settings;