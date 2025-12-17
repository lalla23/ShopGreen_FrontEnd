import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MOCK_NOTIFICATIONS } from '../constants';
import { Notification, NotificationType, UserRole } from '../types';
import { Bell, CheckCircle, Info, Ticket, FileText, ChevronRight, XCircle, ArrowLeft, AlertCircle } from 'lucide-react';

interface NotificationsProps {
  userRole: UserRole;
}

const Notifications: React.FC<NotificationsProps> = ({ userRole }) => {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [localNotifications, setLocalNotifications] = useState(MOCK_NOTIFICATIONS);
  const navigate = useNavigate();

  // Filter logic:
  // Operators see SYSTEM and REPORT
  // Users see SYSTEM and PROMO
  const filteredNotifications = localNotifications.filter(n => {
    if (n.type === NotificationType.SYSTEM) return true;
    if (userRole === UserRole.OPERATOR) return n.type === NotificationType.REPORT;
    return n.type === NotificationType.PROMO;
  });

  const selectedNotification = filteredNotifications.find(n => n.id === selectedId);

  const markAsRead = (id: string) => {
    setLocalNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const handleSelect = (n: Notification) => {
    setSelectedId(n.id);
    if (!n.read) markAsRead(n.id);
  };

  const handleOperatorAction = (notification: Notification, action: 'approve' | 'reject') => {
    if (action === 'approve') {
        // Navigate to Home map with state to open AddShopModal pre-filled
        navigate('/', { 
            state: { 
                action: 'create_shop_from_report', 
                data: {
                    name: notification.shopName,
                    ownerId: notification.reporterId
                }
            } 
        });
    } else {
        alert(`Segnalazione Respinta. L'utente riceverà una notifica.`);
        // In a real app, this would update backend status
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 h-[calc(100vh-64px)] flex flex-col md:flex-row gap-6">
      
      {/* LEFT COLUMN: Notification List */}
      <div className={`w-full md:w-1/3 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden flex flex-col ${selectedId ? 'hidden md:flex' : 'flex'}`}>
         <div className="p-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
               <Bell className="w-5 h-5 text-green-600" /> 
               {userRole === UserRole.OPERATOR ? 'Segnalazioni & Avvisi' : 'Promozioni & Avvisi'}
            </h2>
         </div>
         
         <div className="overflow-y-auto flex-1 p-2 space-y-2">
            {filteredNotifications.length === 0 ? (
               <div className="text-center py-10 text-gray-400">Nessuna notifica presente.</div>
            ) : (
               filteredNotifications.map(notification => (
                 <button
                   key={notification.id}
                   onClick={() => handleSelect(notification)}
                   className={`w-full text-left p-4 rounded-xl transition-all border border-transparent
                     ${selectedId === notification.id 
                       ? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800 ring-1 ring-green-300' 
                       : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'
                     }
                     ${!notification.read ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''}
                   `}
                 >
                   <div className="flex justify-between items-start mb-1">
                      <div className="flex items-center gap-2">
                         {notification.type === NotificationType.PROMO && <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded text-[10px] font-bold uppercase">Promo</span>}
                         {notification.type === NotificationType.REPORT && <span className="bg-orange-100 text-orange-700 px-2 py-0.5 rounded text-[10px] font-bold uppercase">Report</span>}
                         {notification.type === NotificationType.SYSTEM && <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded text-[10px] font-bold uppercase">Info</span>}
                         
                         {!notification.read && <span className="w-2 h-2 rounded-full bg-blue-500"></span>}
                      </div>
                      <span className="text-xs text-gray-400">{notification.date}</span>
                   </div>
                   <h3 className={`text-sm font-bold text-gray-900 dark:text-white mb-1 line-clamp-1 ${!notification.read ? 'text-black' : ''}`}>
                      {notification.title}
                   </h3>
                   <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 leading-relaxed">
                      {notification.previewText}
                   </p>
                 </button>
               ))
            )}
         </div>
      </div>

      {/* RIGHT COLUMN: Detail View */}
      <div className={`w-full md:w-2/3 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden flex flex-col ${!selectedId ? 'hidden md:flex' : 'flex'}`}>
         
         {selectedNotification ? (
            <>
              {/* Detail Header with Back Button (Mobile) */}
              <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex items-center gap-3 md:hidden">
                 <button onClick={() => setSelectedId(null)} className="p-2 hover:bg-gray-100 rounded-full">
                    <ArrowLeft className="w-5 h-5 text-gray-600" />
                 </button>
                 <span className="font-bold text-gray-900">Torna alla lista</span>
              </div>

              <div className="flex-1 overflow-y-auto p-6 md:p-10 animate-in fade-in slide-in-from-bottom-4 duration-300">
                 
                 {/* Type Badge */}
                 <div className="mb-6 flex items-center justify-between">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest flex items-center gap-2
                      ${selectedNotification.type === NotificationType.PROMO ? 'bg-purple-100 text-purple-700' : 
                        selectedNotification.type === NotificationType.REPORT ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-700'}
                    `}>
                       {selectedNotification.type === NotificationType.PROMO && <Ticket className="w-4 h-4"/>}
                       {selectedNotification.type === NotificationType.REPORT && <FileText className="w-4 h-4"/>}
                       {selectedNotification.type === NotificationType.SYSTEM && <Info className="w-4 h-4"/>}
                       {selectedNotification.type}
                    </span>
                    <span className="text-sm text-gray-400 font-medium">{selectedNotification.date}</span>
                 </div>

                 <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
                    {selectedNotification.title}
                 </h1>

                 {/* PROMO SPECIFIC: Image */}
                 {selectedNotification.type === NotificationType.PROMO && selectedNotification.imageUrl && (
                    <div className="mb-8 rounded-2xl overflow-hidden shadow-lg border border-gray-100 h-64 w-full">
                       <img src={selectedNotification.imageUrl} alt="Promo" className="w-full h-full object-cover" />
                    </div>
                 )}

                 {/* REPORT SPECIFIC: Shop Details Box */}
                 {selectedNotification.type === NotificationType.REPORT && (
                    <div className="bg-orange-50 border border-orange-100 rounded-xl p-6 mb-8">
                       <h3 className="text-orange-900 font-bold mb-4 flex items-center gap-2">
                          <AlertCircle className="w-5 h-5" /> Dati Segnalazione
                       </h3>
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          <div className="bg-white p-3 rounded-lg border border-orange-100">
                             <span className="block text-xs text-gray-500 uppercase font-bold">Nome Attività</span>
                             <span className="text-gray-900 font-medium">{selectedNotification.shopName}</span>
                          </div>
                          <div className="bg-white p-3 rounded-lg border border-orange-100">
                             <span className="block text-xs text-gray-500 uppercase font-bold">Licenza Commerciale</span>
                             <span className="text-gray-900 font-medium">{selectedNotification.licenseId}</span>
                          </div>
                          {selectedNotification.reporterId && (
                            <div className="bg-white p-3 rounded-lg border border-orange-100 col-span-2">
                                <span className="block text-xs text-gray-500 uppercase font-bold">Utente Segnalante</span>
                                <span className="text-gray-900 font-medium">{selectedNotification.reporterId}</span>
                            </div>
                          )}
                       </div>
                    </div>
                 )}

                 <div className="prose dark:prose-invert max-w-none text-gray-600 dark:text-gray-300 leading-loose text-lg">
                    {selectedNotification.fullDescription}
                 </div>

                 {/* ACTION BUTTONS */}
                 <div className="mt-10 pt-8 border-t border-gray-100 dark:border-gray-700">
                    
                    {/* Actions for User (Promo) */}
                    {selectedNotification.type === NotificationType.PROMO && (
                       <button className="w-full md:w-auto bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-xl font-bold shadow-lg transition-transform hover:scale-105 flex items-center justify-center gap-2">
                          <Ticket className="w-5 h-5" /> Usa Coupon in Negozio
                       </button>
                    )}

                    {/* Actions for Operator (Report) */}
                    {selectedNotification.type === NotificationType.REPORT && (
                       <div className="flex flex-col md:flex-row gap-4">
                          <button 
                            onClick={() => handleOperatorAction(selectedNotification, 'approve')}
                            className="flex-1 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-bold shadow-md flex items-center justify-center gap-2 transition-colors"
                          >
                             <CheckCircle className="w-5 h-5" /> Conferma Licenza
                          </button>
                          <button 
                             onClick={() => handleOperatorAction(selectedNotification, 'reject')}
                             className="flex-1 bg-white border border-red-200 text-red-600 hover:bg-red-50 px-6 py-3 rounded-xl font-bold shadow-sm flex items-center justify-center gap-2 transition-colors"
                          >
                             <XCircle className="w-5 h-5" /> Respingi
                          </button>
                       </div>
                    )}
                 </div>

              </div>
            </>
         ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-400 bg-gray-50/30">
               <Bell className="w-16 h-16 mb-4 opacity-20" />
               <p className="text-lg font-medium">Seleziona una notifica per leggere i dettagli</p>
            </div>
         )}
      </div>
    </div>
  );
};

export default Notifications;