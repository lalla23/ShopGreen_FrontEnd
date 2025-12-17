import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Leaf, User, LogOut, Bell, Settings, Edit } from 'lucide-react';
import { UserRole } from '../types';

interface HeaderProps {
  userRole: UserRole;
  userName: string | null;
  onLoginClick: () => void;
  onLogoutClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ userRole, userName, onLoginClick, onLogoutClick }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [showUserMenu, setShowUserMenu] = useState(false);
  
  // Refs for closing dropdowns when clicking outside
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Mock Notification count (could be passed as prop or context in real app)
  const unreadCount = 2;

  const getLinkClass = (path: string) => {
    const base = "font-medium text-lg px-3 py-2 rounded-md transition-colors";
    return location.pathname === path 
      ? `${base} text-green-800 bg-green-50` 
      : `${base} text-gray-700 hover:text-green-600 hover:bg-gray-50 dark:text-gray-200 dark:hover:text-green-400 dark:hover:bg-gray-800`;
  };

  const handleLogout = () => {
    setShowUserMenu(false);
    onLogoutClick();
    navigate('/');
  };

  return (
    <header className="bg-white dark:bg-gray-800 shadow-md z-[2000] sticky top-0 h-16 flex items-center justify-between px-4 md:px-8 transition-colors duration-300">
      {/* Logo & Brand */}
      <Link to="/" className="flex items-center gap-2">
        <div className="bg-green-600 p-1.5 rounded-lg">
          <Leaf className="text-white w-6 h-6" />
        </div>
        <span className="text-2xl font-bold text-green-900 dark:text-green-100 tracking-tight">ShopGreen</span>
      </Link>

      {/* Navigation */}
      <nav className="hidden md:flex items-center gap-6">
        <Link to="/" className={getLinkClass('/')}>Home</Link>
        {userRole !== UserRole.ANONYMOUS && (
           <Link to="/preferiti" className={getLinkClass('/preferiti')}>Preferiti</Link>
        )}
        <Link to="/ecommerce" className={getLinkClass('/ecommerce')}>E-Commerce</Link>
      </nav>

      {/* Right Section: Notifications & Auth */}
      <div className="flex items-center gap-4">
        
        {/* Notifications (Avvisi) - Direct Link to Page */}
        {userRole !== UserRole.ANONYMOUS && (
          <Link 
            to="/notifiche"
            className={`p-2 relative rounded-full transition-colors ${location.pathname === '/notifiche' ? 'bg-green-100 text-green-800' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 hover:text-green-700'}`}
            title="Centro Notifiche"
          >
            <Bell className="w-6 h-6" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white dark:border-gray-800 animate-pulse"></span>
            )}
          </Link>
        )}

        {/* Auth Buttons */}
        {userRole === UserRole.ANONYMOUS ? (
          <Link 
            to="/login"
            className="flex items-center gap-2 bg-gray-900 dark:bg-green-600 text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-gray-800 dark:hover:bg-green-700 transition-colors shadow-sm"
          >
            Accedi / Registrati
            <User className="w-4 h-4" />
          </Link>
        ) : (
          <div className="relative pl-2 border-l border-gray-200 dark:border-gray-700" ref={userMenuRef}>
             <button 
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-3 hover:opacity-80 transition-opacity focus:outline-none"
             >
                <div className="hidden sm:flex flex-col items-end mr-2 text-right">
                    <span className="text-sm font-bold text-gray-900 dark:text-gray-100">{userName}</span>
                    <span className="text-xs text-green-600 dark:text-green-400 font-medium capitalize">
                      {userRole === UserRole.OPERATOR ? 'Operatore' : 'Utente'}
                    </span>
                </div>
                <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-900/50 hover:text-green-800 transition-colors">
                  <User className="w-6 h-6" />
                </div>
             </button>

             {/* User Dropdown Menu */}
             {showUserMenu && (
               <div className="absolute right-0 mt-3 w-56 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 ring-1 ring-black ring-opacity-5">
                 <div className="py-2">
                   <Link 
                     to="/profilo" 
                     onClick={() => setShowUserMenu(false)}
                     className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 dark:text-gray-200 hover:bg-green-50 dark:hover:bg-gray-700 hover:text-green-700 transition-colors"
                   >
                     <Edit className="w-4 h-4" />
                     Modifica Profilo
                   </Link>
                   <Link 
                     to="/impostazioni"
                     onClick={() => setShowUserMenu(false)}
                     className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 dark:text-gray-200 hover:bg-green-50 dark:hover:bg-gray-700 hover:text-green-700 transition-colors"
                   >
                     <Settings className="w-4 h-4" />
                     Impostazioni
                   </Link>
                   <div className="border-t border-gray-100 dark:border-gray-700 my-1"></div>
                   <button 
                     onClick={handleLogout}
                     className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                   >
                     <LogOut className="w-4 h-4" />
                     Logout
                   </button>
                 </div>
               </div>
             )}
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;