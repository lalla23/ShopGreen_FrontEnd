import { Notification, NotificationType, Shop } from '../types';
import { getNegozi } from './negoziService';

//questa funzione trasforma un negozio non verificato dall'operatore in una notifica
const mapShopToNotification = (shop: Shop): Notification => {
  return {
    id: shop.id,
    title: "Nuova Attività in attesa di verifica",
    previewText: `${shop.name} - ${shop.categories}`,
    fullDescription: `L'utente ha segnalato questa nuova attività: "${shop.name}". Controlla i dati e approva.`,
    date: "In attesa", 
    read: false,
    type: NotificationType.REPORT,
    shopName: shop.name,
    reporterId: shop.ownerId || "Anonimo",
    licenseId: shop.imageUrl ? "Foto/Licenza presente" : "Mancante",
    imageUrl: shop.imageUrl
  };
};

export const getNotifications = async (): Promise<Notification[]> => {
  try {
    //chiedo solo i negozi con verificatoDaOperatore = false
    const unverifiedShops = await getNegozi(undefined, undefined, false);

    //trasformo i negozi in notifiche
    return unverifiedShops.map(mapShopToNotification);

  } catch (error) {
    console.error("Errore nella visualizzazione delle segnalazioni", error);
    return [];
  }
};

export const markNotificationAsRead = async (id: string): Promise<void> => {
    return; 
};