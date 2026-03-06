import { 
  collection, 
  doc, 
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


export type NotificationType = 
  | 'booking_request'      
  | 'booking_confirmed'    
  | 'booking_cancelled'    
  | 'booking_completed'    
  | 'booking_reminder'     
  | 'new_message'          
  | 'new_review'           
  | 'system'               
  | 'withdrawal_completed' 
  | 'withdrawal_failed';

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

const NOTIFICATIONS_COLLECTION = 'notifications';

const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
};

export const notificationService = {

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

      window.dispatchEvent(new CustomEvent('newNotification', { detail: notification }));
      
      return notification;
    } catch (error) {
      console.error('Notification create error:', error);
      throw error;
    }
  },

  async getByUser(userId: string): Promise<Notification[]> {
    try {
      const q = query(
        collection(db, NOTIFICATIONS_COLLECTION),
        where('userId', '==', userId)
      );
      const snapshot = await getDocs(q);
      const notifications = snapshot.docs.map(doc => doc.data() as Notification);
      return notifications.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } catch (error) {
      console.error('Notification getByUser error:', error);
      return [];
    }
  },

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
      return notifications.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } catch (error) {
      console.error('Notification getUnreadByUser error:', error);
      return [];
    }
  },

  async countUnread(userId: string): Promise<number> {
    try {
      const unread = await this.getUnreadByUser(userId);
      return unread.length;
    } catch (error) {
      console.error('Notification countUnread error:', error);
      return 0;
    }
  },

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

  async delete(notificationId: string): Promise<void> {
    try {
      await deleteDoc(doc(db, NOTIFICATIONS_COLLECTION, notificationId));
    } catch (error) {
      console.error('Notification delete error:', error);
      throw error;
    }
  },

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
      withdrawal_completed: '✅',
      withdrawal_failed: '❌'
    };
    return icons[type] || '🔔';
  },

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
      withdrawal_completed: 'bg-green-100 text-green-600',
      withdrawal_failed: 'bg-red-100 text-red-600'
    };
    return colors[type] || 'bg-gray-100 text-gray-600';
  },
};

export default notificationService;
