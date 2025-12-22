/**
 * Notification Service - zarządzanie powiadomieniami
 * Używa Firebase Firestore z real-time updates
 */

import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc,
  deleteDoc,
  query, 
  where,
  onSnapshot,
  writeBatch,
} from 'firebase/firestore';
import { db } from '../firebase';

// ============================================
// TYPY
// ============================================

export type NotificationType = 
  | 'booking_request'      // Nowa prośba o rezerwację
  | 'booking_confirmed'    // Rezerwacja potwierdzona
  | 'booking_cancelled'    // Rezerwacja anulowana
  | 'booking_completed'    // Usługa zakończona
  | 'booking_reminder'     // Przypomnienie o wizycie
  | 'new_message'          // Nowa wiadomość
  | 'new_review'           // Nowa opinia
  | 'system';              // Powiadomienie systemowe

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, any>;
  read: boolean;
  createdAt: string;
}

// ============================================
// HELPERS
// ============================================

const NOTIFICATIONS_COLLECTION = 'notifications';

const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
};

// ============================================
// PUBLIC API
// ============================================

export const notificationService = {
  /**
   * Utwórz nowe powiadomienie
   */
  async create(data: {
    userId: string;
    type: NotificationType;
    title: string;
    message: string;
    data?: Record<string, any>;
  }): Promise<Notification> {
    const id = generateId();
    const now = new Date().toISOString();
    
    const notification: Notification = {
      id,
      userId: data.userId,
      type: data.type,
      title: data.title,
      message: data.message,
      data: data.data,
      read: false,
      createdAt: now,
    };
    
    try {
      await setDoc(doc(db, NOTIFICATIONS_COLLECTION, id), notification);
      console.log('Notification created:', notification);
      
      // Dispatch event dla real-time UI updates
      window.dispatchEvent(new CustomEvent('newNotification', { detail: notification }));
      
      return notification;
    } catch (error) {
      console.error('Notification create error:', error);
      throw error;
    }
  },

  /**
   * Pobierz powiadomienia użytkownika
   */
  async getByUser(userId: string): Promise<Notification[]> {
    try {
      const q = query(
        collection(db, NOTIFICATIONS_COLLECTION),
        where('userId', '==', userId)
      );
      const snapshot = await getDocs(q);
      const notifications = snapshot.docs.map(doc => doc.data() as Notification);
      // Sort in JS to avoid index requirement
      return notifications.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } catch (error) {
      console.error('Notification getByUser error:', error);
      return [];
    }
  },

  /**
   * Pobierz nieprzeczytane powiadomienia
   */
  async getUnreadByUser(userId: string): Promise<Notification[]> {
    try {
      const q = query(
        collection(db, NOTIFICATIONS_COLLECTION),
        where('userId', '==', userId)
      );
      const snapshot = await getDocs(q);
      const notifications = snapshot.docs
        .map(doc => doc.data() as Notification)
        .filter(n => !n.read);
      // Sort in JS to avoid index requirement
      return notifications.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } catch (error) {
      console.error('Notification getUnreadByUser error:', error);
      return [];
    }
  },

  /**
   * Policz nieprzeczytane powiadomienia
   */
  async countUnread(userId: string): Promise<number> {
    try {
      const unread = await this.getUnreadByUser(userId);
      return unread.length;
    } catch (error) {
      console.error('Notification countUnread error:', error);
      return 0;
    }
  },

  /**
   * Oznacz powiadomienie jako przeczytane
   */
  async markAsRead(notificationId: string): Promise<void> {
    try {
      await updateDoc(doc(db, NOTIFICATIONS_COLLECTION, notificationId), {
        read: true,
      });
    } catch (error) {
      console.error('Notification markAsRead error:', error);
      throw error;
    }
  },

  /**
   * Oznacz wszystkie powiadomienia użytkownika jako przeczytane
   */
  async markAllAsRead(userId: string): Promise<void> {
    try {
      const unread = await this.getUnreadByUser(userId);
      
      if (unread.length === 0) return;
      
      const batch = writeBatch(db);
      unread.forEach(notification => {
        const ref = doc(db, NOTIFICATIONS_COLLECTION, notification.id);
        batch.update(ref, { read: true });
      });
      
      await batch.commit();
    } catch (error) {
      console.error('Notification markAllAsRead error:', error);
      throw error;
    }
  },

  /**
   * Usuń powiadomienie
   */
  async delete(notificationId: string): Promise<void> {
    try {
      await deleteDoc(doc(db, NOTIFICATIONS_COLLECTION, notificationId));
    } catch (error) {
      console.error('Notification delete error:', error);
      throw error;
    }
  },

  /**
   * Usuń wszystkie powiadomienia użytkownika
   */
  async deleteAllByUser(userId: string): Promise<void> {
    try {
      const notifications = await this.getByUser(userId);
      
      if (notifications.length === 0) return;
      
      const batch = writeBatch(db);
      notifications.forEach(notification => {
        const ref = doc(db, NOTIFICATIONS_COLLECTION, notification.id);
        batch.delete(ref);
      });
      
      await batch.commit();
    } catch (error) {
      console.error('Notification deleteAllByUser error:', error);
      throw error;
    }
  },

  /**
   * Nasłuchuj na powiadomienia użytkownika (real-time)
   */
  subscribe(
    userId: string, 
    callback: (notifications: Notification[]) => void
  ): () => void {
    const q = query(
      collection(db, NOTIFICATIONS_COLLECTION),
      where('userId', '==', userId)
    );
    
    return onSnapshot(q, (snapshot) => {
      const notifications = snapshot.docs.map(doc => doc.data() as Notification);
      notifications.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      callback(notifications);
    });
  },

  /**
   * Pobierz ikonę dla typu powiadomienia
   */
  getIcon(type: NotificationType): string {
    const icons: Record<NotificationType, string> = {
      booking_request: '📅',
      booking_confirmed: '✅',
      booking_cancelled: '❌',
      booking_completed: '🎉',
      booking_reminder: '⏰',
      new_message: '💬',
      new_review: '⭐',
      system: '🔔',
    };
    return icons[type] || '🔔';
  },

  /**
   * Pobierz kolor dla typu powiadomienia
   */
  getColor(type: NotificationType): string {
    const colors: Record<NotificationType, string> = {
      booking_request: 'bg-blue-100 text-blue-600',
      booking_confirmed: 'bg-green-100 text-green-600',
      booking_cancelled: 'bg-red-100 text-red-600',
      booking_completed: 'bg-purple-100 text-purple-600',
      booking_reminder: 'bg-yellow-100 text-yellow-600',
      new_message: 'bg-indigo-100 text-indigo-600',
      new_review: 'bg-orange-100 text-orange-600',
      system: 'bg-gray-100 text-gray-600',
    };
    return colors[type] || 'bg-gray-100 text-gray-600';
  },
};

export default notificationService;
