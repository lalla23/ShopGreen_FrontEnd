
/**import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/Header';
import Home from './pages/Home';
import Favorites from './pages/Favorites';
import Ecommerce from './pages/Ecommerce';
import Profile from './pages/Profile';
import Login from './pages/Login';
import Settings from './pages/Settings';
import Notifications from './pages/Notifications';
import { UserRole, Seller } from './types';
import {fetchSellers} from './services/ecommerceService';

function App() {
  const [userRole, setUserRole] = useState<UserRole>(UserRole.ANONYMOUS);
  const [userName, setUserName] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<string[]>([]);

  // Global State for Sellers (Dynamic creation)
  const [sellers, setSellers] = useState<Seller[]>([]);

  // Settings State (RF7)
  const [language, setLanguage] = useState<'it' | 'en' | 'de'>('it');
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [emailNotifications, setEmailNotifications] = useState(true);

  // Apply Theme Effect (RF7.2)
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const handleLoginSuccess = (user: { role: UserRole; name: string }) => {
    setUserRole(user.role);
    setUserName(user.name);
  };

  useEffect(() => {
    const loadSellers = async () => {
      try {
        const data = await fetchSellers(); // Chiamata senza parametri per caricarli tutti
        setSellers(data);
      } catch (error) {
        console.error("Errore durante il caricamento degli shop:", error);
      }
    };

    loadSellers();
  }, []);

  const handleLogout = () => {
    setUserRole(UserRole.ANONYMOUS);
    setUserName(null);
  };

  const handleUpdateProfile = (data: { username?: string; password?: string }) => {
    if (data.username) {
      setUserName(data.username);
    }
    if (data.password) {
      console.log('Password updated successfully (simulated)');
    }
  };

  // Create or Update Seller Profile
  const handleSaveSellerProfile = (sellerData: Seller) => {
    setSellers(prev => {
      const exists = prev.find(s => s.username === sellerData.username);
      if (exists) {
        return prev.map(s => s.username === sellerData.username ? sellerData : s);
      } else {
        return [...prev, sellerData];
      }
    });
  };

  const toggleFavorite = (id: string) => {
    if (favorites.includes(id)) {
      setFavorites(prev => prev.filter(fid => fid !== id));
    } else {
      setFavorites(prev => [...prev, id]);
    }
  };

  return (
    <Router>
      <div className="min-h-screen flex flex-col font-sans text-gray-900 bg-white dark:bg-gray-900 dark:text-gray-100 transition-colors duration-300">
        <Header 
          userRole={userRole} 
          userName={userName} 
          onLoginClick={() => }
          onLogoutClick={handleLogout}
        />
        
        <main className="flex-1 relative">
          <Routes>
            <Route 
              path="/" 
              element={<Home userRole={userRole} favorites={favorites} toggleFavorite={toggleFavorite} userName={userName} />} 
            />
            <Route 
              path="/login" 
              element={<Login onLoginSuccess={handleLoginSuccess} />} 
            />
            <Route 
              path="/preferiti" 
              element={
                userRole !== UserRole.ANONYMOUS 
                  ? <Favorites favorites={favorites} removeFavorite={toggleFavorite} /> 
                  : <Navigate to="/login" />
              } 
            />
            <Route path="/ecommerce" element={<Ecommerce sellers={sellers} />} />
            
            <Route 
              path="/notifiche" 
              element={
                userRole !== UserRole.ANONYMOUS 
                  ? <Notifications userRole={userRole} />
                  : <Navigate to="/login" />
              } 
            />

            <Route 
              path="/profilo" 
              element={
                userRole !== UserRole.ANONYMOUS 
                  ? <Profile 
                      userRole={userRole} 
                      currentUserName={userName} 
                      onUpdateProfile={handleUpdateProfile}
                      sellers={sellers}
                      onSaveSellerProfile={handleSaveSellerProfile}
                    />
                  : <Navigate to="/login" />
              } 
            />
            
            <Route 
              path="/impostazioni" 
              element={
                userRole !== UserRole.ANONYMOUS 
                  ? <Settings 
                      language={language}
                      setLanguage={setLanguage}
                      theme={theme}
                      setTheme={setTheme}
                      emailNotifications={emailNotifications}
                      setEmailNotifications={setEmailNotifications}
                    />
                  : <Navigate to="/login" />
              } 
            />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;**/

import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/Header';
import Home from './pages/Home';
import Favorites from './pages/Favorites';
import Ecommerce from './pages/Ecommerce';
import Profile from './pages/Profile';
import Login from './pages/Login';
import Settings from './pages/Settings';
import Notifications from './pages/Notifications';
import { UserRole, Seller } from './types';
import { fetchSellers } from './services/ecommerceService';

// --- IMPORTIAMO I SERVIZI PREFERITI ---
import { getPreferiti, addPreferito, deletePreferito } from './services/preferitiService';

function App() {
  const [userRole, setUserRole] = useState<UserRole>(UserRole.ANONYMOUS);
  const [userName, setUserName] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null); // Nuovo stato per l'ID utente

  // Global State for Sellers
  const [sellers, setSellers] = useState<Seller[]>([]);

  // Settings State
  const [language, setLanguage] = useState<'it' | 'en' | 'de'>('it');
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [emailNotifications, setEmailNotifications] = useState(true);

  // Favorites State (Array di ID)
  const [favorites, setFavorites] = useState<string[]>([]);

  // Apply Theme Effect
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // --- CARICAMENTO INIZIALE DATI (SESSIONE PERSISTENTE) ---
  useEffect(() => {
    const storedUserId = localStorage.getItem('userId');
    const storedRole = localStorage.getItem('role') as UserRole;
    const storedName = localStorage.getItem('username'); // Assumi di salvarlo al login

    if (storedUserId && storedRole && storedRole !== 'anonimo') {
      setUserId(storedUserId);
      setUserRole(storedRole);
      if (storedName) setUserName(storedName);
      
      // Carichiamo i preferiti dal DB
      loadFavorites(storedUserId);
    }
    
    // Carichiamo sempre i venditori
    loadSellers();
  }, []);

  const loadSellers = async () => {
    try {
      const data = await fetchSellers();
      setSellers(data);
    } catch (error) {
      console.error("Errore caricamento shop:", error);
    }
  };

  const loadFavorites = async (id: string) => {
    try {
      const shops = await getPreferiti(id);
      // Salviamo solo gli ID per controlli veloci (includes)
      setFavorites(shops.map(s => s.id));
    } catch (error) {
      console.error("Errore caricamento preferiti:", error);
    }
  };

  const handleLoginSuccess = (user: { role: UserRole; name: string; id: string }) => {
    setUserRole(user.role);
    setUserName(user.name);
    setUserId(user.id);
    // Appena loggato, carica i suoi preferiti
    loadFavorites(user.id);
  };

  const handleLogout = () => {
    setUserRole(UserRole.ANONYMOUS);
    setUserName(null);
    setUserId(null);
    setFavorites([]); // Pulisci i preferiti locali
    localStorage.clear(); // Pulisci sessione
  };

  // --- LOGICA AGGIUNTA/RIMOZIONE PREFERITI ---
  const handleToggleFavorite = async (shopId: string) => {
    if (!userId || userRole === UserRole.ANONYMOUS) {
      alert("Devi effettuare il login per gestire i preferiti.");
      return;
    }

    const isAlreadyFavorite = favorites.includes(shopId);

    // Aggiornamento Ottimistico (UI subito, poi DB)
    if (isAlreadyFavorite) {
        setFavorites(prev => prev.filter(id => id !== shopId));
    } else {
        setFavorites(prev => [...prev, shopId]);
    }

    try {
      if (isAlreadyFavorite) {
        await deletePreferito(userId, shopId);
      } else {
        await addPreferito(userId, shopId);
      }
    } catch (error) {
      console.error(error);
      alert("Errore di connessione: impossibile aggiornare i preferiti.");
      // Rollback in caso di errore
      if (isAlreadyFavorite) {
          setFavorites(prev => [...prev, shopId]);
      } else {
          setFavorites(prev => prev.filter(id => id !== shopId));
      }
    }
  };

  const handleRemoveFavoriteFromList = (id: string) => {
      // Usato dalla pagina Preferiti per aggiornare lo stato globale
      setFavorites(prev => prev.filter(favId => favId !== id));
  };


  // Profile & Seller Updates (Legacy logic preserved)
  const handleUpdateProfile = (data: { username?: string; password?: string }) => {
    if (data.username) setUserName(data.username);
  };

  const handleSaveSellerProfile = (sellerData: Seller) => {
    setSellers(prev => {
      const exists = prev.find(s => s.username === sellerData.username);
      return exists ? prev.map(s => s.username === sellerData.username ? sellerData : s) : [...prev, sellerData];
    });
  };

  return (
    <Router>
      <div className="min-h-screen flex flex-col font-sans text-gray-900 bg-white dark:bg-gray-900 dark:text-gray-100 transition-colors duration-300">
        <Header 
          userRole={userRole} 
          userName={userName} 
          onLoginClick={() => {}}
          onLogoutClick={handleLogout}
        />
        
        <main className="flex-1 relative">
          <Routes>
            <Route 
              path="/" 
              element={
                <Home 
                  userRole={userRole} 
                  favorites={favorites} 
                  toggleFavorite={handleToggleFavorite} 
                  userName={userId} 
                />
              } 
            />
            
            <Route 
              path="/login" 
              element={<Login onLoginSuccess={handleLoginSuccess} />} 
            />
            
            <Route 
              path="/preferiti" 
              element={
                userRole !== UserRole.ANONYMOUS 
                  ? <Favorites 
                      currentUserId={userId} 
                      onRemoveUpdate={handleRemoveFavoriteFromList} 
                    /> 
                  : <Navigate to="/login" />
              } 
            />
            
            <Route path="/ecommerce" element={<Ecommerce sellers={sellers} />} />
            
            <Route 
              path="/notifiche" 
              element={
                userRole !== UserRole.ANONYMOUS 
                  ? <Notifications userRole={userRole} />
                  : <Navigate to="/login" />
              } 
            />

            <Route 
              path="/profilo" 
              element={
                userRole !== UserRole.ANONYMOUS 
                  ? <Profile 
                      userRole={userRole} 
                      currentUserName={userName} 
                      onUpdateProfile={handleUpdateProfile}
                      sellers={sellers}
                      onSaveSellerProfile={handleSaveSellerProfile}
                    />
                  : <Navigate to="/login" />
              } 
            />
            
            {/* ROTTA IMPOSTAZIONI AGGIORNATA PER SUPPORTARE IL NAVIGATE */}
            <Route 
              path="/impostazioni" 
              element={
                userRole !== UserRole.ANONYMOUS 
                  ? <Settings 
                      language={language} setLanguage={setLanguage}
                      theme={theme} setTheme={setTheme}
                      emailNotifications={emailNotifications} setEmailNotifications={setEmailNotifications}
                    />
                  : <Navigate to="/login" />
              } 
            />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
