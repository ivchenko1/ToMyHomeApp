/**
 * Booking Service - zarządzanie rezerwacjami
 * Używa Firebase Firestore
 */

import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc,
  query, 
  where,
  onSnapshot,
} from 'firebase/firestore';
import { db } from '../firebase';
import { notificationService } from './notificationService';

// ============================================
// TYPY
// ============================================

export type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed';

export interface Booking {
  id: string;
  
  // Klient
  clientId: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  
  // Usługodawca
  providerId: string;
  providerName: string;
  providerImage: string;
  
  // Usługa
  serviceId: string;
  serviceName: string;
  servicePrice: number;
  serviceDuration: string;
  
  // Termin
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  
  // Status
  status: BookingStatus;
  
  // Notatki
  clientNote?: string;
  providerNote?: string;
  
  // Daty
  createdAt: string;
  updatedAt: string;
  confirmedAt?: string;
  completedAt?: string;
  cancelledAt?: string;
}

// ============================================
// HELPERS
// ============================================

const BOOKINGS_COLLECTION = 'bookings';

const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
};

// ============================================
// PUBLIC API
// ============================================

export const bookingService = {
  /**
   * Utwórz nową rezerwację (status: pending)
   * Sprawdza czy termin jest wolny przed utworzeniem
   */
  async create(data: {
    clientId: string;
    clientName: string;
    clientEmail: string;
    clientPhone: string;
    providerId: string;
    providerName: string;
    providerImage: string;
    serviceId: string;
    serviceName: string;
    servicePrice: number;
    serviceDuration: string;
    date: string;
    time: string;
    clientNote?: string;
  }): Promise<Booking> {
    // Sprawdź czy termin jest wolny PRZED utworzeniem rezerwacji
    const isAvailable = await this.isTimeSlotAvailable(data.providerId, data.date, data.time);
    if (!isAvailable) {
      throw new Error('SLOT_TAKEN');
    }
    
    const id = generateId();
    const now = new Date().toISOString();
    
    const booking: Booking = {
      id,
      ...data,
      status: 'pending',
      createdAt: now,
      updatedAt: now,
    };
    
    try {
      await setDoc(doc(db, BOOKINGS_COLLECTION, id), booking);
      console.log('Booking created:', booking);
      
      // Wyślij powiadomienie do usługodawcy
      await notificationService.create({
        userId: data.providerId,
        type: 'booking_request',
        title: 'Nowa prośba o rezerwację',
        message: `${data.clientName} chce zarezerwować ${data.serviceName} na ${data.date} o ${data.time}`,
        data: { bookingId: id },
      });
      
      return booking;
    } catch (error) {
      console.error('Booking create error:', error);
      throw error;
    }
  },

  /**
   * Pobierz rezerwację po ID
   */
  async getById(id: string): Promise<Booking | null> {
    try {
      const docRef = doc(db, BOOKINGS_COLLECTION, id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return docSnap.data() as Booking;
      }
      return null;
    } catch (error) {
      console.error('Booking getById error:', error);
      return null;
    }
  },

  /**
   * Pobierz rezerwacje klienta
   */
  async getByClient(clientId: string): Promise<Booking[]> {
    try {
      const q = query(
        collection(db, BOOKINGS_COLLECTION),
        where('clientId', '==', clientId)
      );
      const snapshot = await getDocs(q);
      const bookings = snapshot.docs.map(doc => doc.data() as Booking);
      // Sort in JS instead of Firestore to avoid index requirement
      return bookings.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } catch (error) {
      console.error('Booking getByClient error:', error);
      return [];
    }
  },

  /**
   * Pobierz rezerwacje usługodawcy
   */
  async getByProvider(providerId: string): Promise<Booking[]> {
    try {
      const q = query(
        collection(db, BOOKINGS_COLLECTION),
        where('providerId', '==', providerId)
      );
      const snapshot = await getDocs(q);
      const bookings = snapshot.docs.map(doc => doc.data() as Booking);
      // Sort in JS instead of Firestore to avoid index requirement
      return bookings.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } catch (error) {
      console.error('Booking getByProvider error:', error);
      return [];
    }
  },

  /**
   * Pobierz rezerwacje usługodawcy na dany dzień
   */
  async getByProviderAndDate(providerId: string, date: string): Promise<Booking[]> {
    try {
      const q = query(
        collection(db, BOOKINGS_COLLECTION),
        where('providerId', '==', providerId),
        where('date', '==', date)
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => doc.data() as Booking);
    } catch (error) {
      console.error('Booking getByProviderAndDate error:', error);
      return [];
    }
  },

  /**
   * Potwierdź rezerwację (usługodawca)
   */
  async confirm(bookingId: string): Promise<Booking | null> {
    try {
      const booking = await this.getById(bookingId);
      if (!booking) return null;
      
      const now = new Date().toISOString();
      const updates = {
        status: 'confirmed' as BookingStatus,
        updatedAt: now,
        confirmedAt: now,
      };
      
      await updateDoc(doc(db, BOOKINGS_COLLECTION, bookingId), updates);
      
      // Wyślij powiadomienie do klienta
      await notificationService.create({
        userId: booking.clientId,
        type: 'booking_confirmed',
        title: 'Rezerwacja potwierdzona! ✅',
        message: `${booking.providerName} potwierdził Twoją rezerwację na ${booking.date} o ${booking.time}`,
        data: { bookingId },
      });
      
      return { ...booking, ...updates };
    } catch (error) {
      console.error('Booking confirm error:', error);
      throw error;
    }
  },

  /**
   * Anuluj rezerwację
   */
  async cancel(bookingId: string, cancelledBy: 'client' | 'provider'): Promise<Booking | null> {
    try {
      const booking = await this.getById(bookingId);
      if (!booking) return null;
      
      const now = new Date().toISOString();
      const updates = {
        status: 'cancelled' as BookingStatus,
        updatedAt: now,
        cancelledAt: now,
      };
      
      await updateDoc(doc(db, BOOKINGS_COLLECTION, bookingId), updates);
      
      // Wyślij powiadomienie
      const targetUserId = cancelledBy === 'client' ? booking.providerId : booking.clientId;
      const cancellerName = cancelledBy === 'client' ? booking.clientName : booking.providerName;
      
      await notificationService.create({
        userId: targetUserId,
        type: 'booking_cancelled',
        title: 'Rezerwacja anulowana ❌',
        message: `${cancellerName} anulował rezerwację na ${booking.date} o ${booking.time}`,
        data: { bookingId },
      });
      
      return { ...booking, ...updates };
    } catch (error) {
      console.error('Booking cancel error:', error);
      throw error;
    }
  },

  /**
   * Oznacz jako zakończoną
   */
  async complete(bookingId: string): Promise<Booking | null> {
    try {
      const booking = await this.getById(bookingId);
      if (!booking) return null;
      
      const now = new Date().toISOString();
      const updates = {
        status: 'completed' as BookingStatus,
        updatedAt: now,
        completedAt: now,
      };
      
      await updateDoc(doc(db, BOOKINGS_COLLECTION, bookingId), updates);
      
      // Wyślij powiadomienie do klienta o zakończeniu i prośbę o opinię
      await notificationService.create({
        userId: booking.clientId,
        type: 'booking_completed',
        title: 'Usługa zakończona! 🎉',
        message: `Jak oceniasz usługę ${booking.serviceName} u ${booking.providerName}? Zostaw opinię!`,
        data: { bookingId, providerId: booking.providerId },
      });
      
      return { ...booking, ...updates };
    } catch (error) {
      console.error('Booking complete error:', error);
      throw error;
    }
  },

  /**
   * Sprawdź czy termin jest wolny
   */
  async isTimeSlotAvailable(providerId: string, date: string, time: string): Promise<boolean> {
    try {
      const bookings = await this.getByProviderAndDate(providerId, date);
      const conflicting = bookings.find(
        b => b.time === time && (b.status === 'pending' || b.status === 'confirmed')
      );
      return !conflicting;
    } catch (error) {
      console.error('isTimeSlotAvailable error:', error);
      return false;
    }
  },

  /**
   * Pobierz zajęte sloty dla usługodawcy na dany dzień
   */
  async getBookedSlots(providerId: string, date: string): Promise<string[]> {
    try {
      const bookings = await this.getByProviderAndDate(providerId, date);
      return bookings
        .filter(b => b.status === 'pending' || b.status === 'confirmed')
        .map(b => b.time);
    } catch (error) {
      console.error('getBookedSlots error:', error);
      return [];
    }
  },

  /**
   * Pobierz statystyki usługodawcy
   */
  async getProviderStats(providerId: string): Promise<{
    totalBookings: number;
    completedBookings: number;
    pendingBookings: number;
    cancelledBookings: number;
    totalRevenue: number;
    thisMonthRevenue: number;
    thisMonthBookings: number;
  }> {
    try {
      const bookings = await this.getByProvider(providerId);
      
      const now = new Date();
      const thisMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
      
      const completed = bookings.filter(b => b.status === 'completed');
      const pending = bookings.filter(b => b.status === 'pending');
      const cancelled = bookings.filter(b => b.status === 'cancelled');
      
      const thisMonthBookings = bookings.filter(b => b.date.startsWith(thisMonth));
      const thisMonthCompleted = thisMonthBookings.filter(b => b.status === 'completed');
      
      return {
        totalBookings: bookings.length,
        completedBookings: completed.length,
        pendingBookings: pending.length,
        cancelledBookings: cancelled.length,
        totalRevenue: completed.reduce((sum, b) => sum + b.servicePrice, 0),
        thisMonthRevenue: thisMonthCompleted.reduce((sum, b) => sum + b.servicePrice, 0),
        thisMonthBookings: thisMonthBookings.length,
      };
    } catch (error) {
      console.error('getProviderStats error:', error);
      return {
        totalBookings: 0,
        completedBookings: 0,
        pendingBookings: 0,
        cancelledBookings: 0,
        totalRevenue: 0,
        thisMonthRevenue: 0,
        thisMonthBookings: 0,
      };
    }
  },

  /**
   * Nasłuchuj na zmiany rezerwacji usługodawcy (real-time)
   */
  subscribeToProviderBookings(
    providerId: string, 
    callback: (bookings: Booking[]) => void
  ): () => void {
    const q = query(
      collection(db, BOOKINGS_COLLECTION),
      where('providerId', '==', providerId)
    );
    
    return onSnapshot(q, (snapshot) => {
      const bookings = snapshot.docs.map(doc => doc.data() as Booking);
      bookings.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      callback(bookings);
    });
  },

  /**
   * Aktualizuj status rezerwacji
   */
  async updateStatus(bookingId: string, status: BookingStatus): Promise<void> {
    try {
      const bookingRef = doc(db, BOOKINGS_COLLECTION, bookingId);
      await updateDoc(bookingRef, { 
        status,
        updatedAt: new Date().toISOString()
      });
      console.log(`Booking ${bookingId} status updated to ${status}`);
    } catch (error) {
      console.error('Error updating booking status:', error);
      throw error;
    }
  },

  /**
   * Nasłuchuj na zmiany rezerwacji klienta (real-time)
   */
  subscribeToClientBookings(
    clientId: string, 
    callback: (bookings: Booking[]) => void
  ): () => void {
    const q = query(
      collection(db, BOOKINGS_COLLECTION),
      where('clientId', '==', clientId)
    );
    
    return onSnapshot(q, (snapshot) => {
      const bookings = snapshot.docs.map(doc => doc.data() as Booking);
      bookings.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      callback(bookings);
    });
  },
};

export default bookingService;
