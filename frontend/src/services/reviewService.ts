/**
 * Review Service - zarządzanie opiniami
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
  orderBy,
} from 'firebase/firestore';
import { db } from '../firebase';
import { notificationService } from './notificationService';

// ============================================
// TYPY
// ============================================

export interface Review {
  id: string;
  
  // Powiązania
  bookingId: string;
  providerId: string;
  clientId: string;
  
  // Dane klienta
  clientName: string;
  clientAvatar?: string;
  
  // Ocena
  rating: number; // 1-5
  comment: string;
  
  // Usługa
  serviceName: string;
  
  // Daty
  createdAt: string;
  
  // Odpowiedź usługodawcy
  providerResponse?: string;
  providerResponseAt?: string;
}

// ============================================
// HELPERS
// ============================================

const REVIEWS_COLLECTION = 'reviews';

const generateId = (): string => {
  return `review_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// ============================================
// SERVICE
// ============================================

const reviewService = {
  /**
   * Dodaj nową opinię
   */
  async create(data: {
    bookingId: string;
    providerId: string;
    clientId: string;
    clientName: string;
    clientAvatar?: string;
    rating: number;
    comment: string;
    serviceName: string;
  }): Promise<Review> {
    const id = generateId();
    const now = new Date().toISOString();
    
    const review: Review = {
      id,
      bookingId: data.bookingId,
      providerId: data.providerId,
      clientId: data.clientId,
      clientName: data.clientName,
      clientAvatar: data.clientAvatar || '', // Firebase nie akceptuje undefined
      rating: data.rating,
      comment: data.comment,
      serviceName: data.serviceName,
      createdAt: now,
    };
    
    await setDoc(doc(db, REVIEWS_COLLECTION, id), review);
    
    // Aktualizuj średnią ocenę providera
    await this.updateProviderRating(data.providerId);
    
    // Wyślij powiadomienie do usługodawcy o nowej opinii
    try {
      // Pobierz ownerId z providera
      let ownerUserId = data.providerId;
      const providerDoc = await getDoc(doc(db, 'providers', data.providerId));
      if (providerDoc.exists()) {
        ownerUserId = providerDoc.data().ownerId || data.providerId;
      }
      
      const starEmoji = data.rating >= 4 ? '⭐' : data.rating >= 3 ? '✨' : '';
      await notificationService.create({
        userId: ownerUserId,
        type: 'new_review',
        title: `Nowa opinia ${starEmoji}`,
        message: `${data.clientName} wystawił(a) ocenę ${data.rating}/5 za ${data.serviceName}`,
        data: { reviewId: id, providerId: data.providerId, rating: data.rating },
      });
    } catch (notifError) {
      console.warn('Could not send review notification:', notifError);
    }
    
    console.log('Review created:', id);
    return review;
  },

  /**
   * Pobierz opinię po ID
   */
  async getById(id: string): Promise<Review | null> {
    const docRef = doc(db, REVIEWS_COLLECTION, id);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return docSnap.data() as Review;
    }
    return null;
  },

  /**
   * Pobierz opinie dla providera
   */
  async getByProvider(providerId: string): Promise<Review[]> {
    try {
      const q = query(
        collection(db, REVIEWS_COLLECTION),
        where('providerId', '==', providerId),
        orderBy('createdAt', 'desc')
      );
      
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => doc.data() as Review);
    } catch (error) {
      console.error('Review getByProvider error:', error);
      // Fallback bez orderBy jeśli brak indeksu
      const q = query(
        collection(db, REVIEWS_COLLECTION),
        where('providerId', '==', providerId)
      );
      const snapshot = await getDocs(q);
      const reviews = snapshot.docs.map(doc => doc.data() as Review);
      return reviews.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
  },

  /**
   * Pobierz opinie klienta
   */
  async getByClient(clientId: string): Promise<Review[]> {
    const q = query(
      collection(db, REVIEWS_COLLECTION),
      where('clientId', '==', clientId)
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => doc.data() as Review);
  },

  /**
   * Sprawdź czy klient już wystawił opinię dla danej rezerwacji
   */
  async hasReviewForBooking(bookingId: string): Promise<boolean> {
    const q = query(
      collection(db, REVIEWS_COLLECTION),
      where('bookingId', '==', bookingId)
    );
    
    const snapshot = await getDocs(q);
    return !snapshot.empty;
  },

  /**
   * Aktualizuj średnią ocenę providera
   */
  async updateProviderRating(providerId: string): Promise<void> {
    const reviews = await this.getByProvider(providerId);
    
    if (reviews.length === 0) return;
    
    const totalRating = reviews.reduce((sum, r) => sum + r.rating, 0);
    const averageRating = Math.round((totalRating / reviews.length) * 10) / 10; // Zaokrąglenie do 1 miejsca po przecinku
    
    // Aktualizuj providera
    const providerRef = doc(db, 'providers', providerId);
    await updateDoc(providerRef, {
      rating: averageRating,
      reviewsCount: reviews.length,
    });
    
    console.log(`Provider ${providerId} rating updated: ${averageRating} (${reviews.length} reviews)`);
  },

  /**
   * Dodaj odpowiedź usługodawcy
   */
  async addProviderResponse(reviewId: string, response: string): Promise<void> {
    const reviewRef = doc(db, REVIEWS_COLLECTION, reviewId);
    await updateDoc(reviewRef, {
      providerResponse: response,
      providerResponseAt: new Date().toISOString(),
    });
  },

  /**
   * Pobierz statystyki ocen dla providera
   */
  async getProviderStats(providerId: string): Promise<{
    average: number;
    count: number;
    distribution: { stars: number; count: number }[];
  }> {
    const reviews = await this.getByProvider(providerId);
    
    if (reviews.length === 0) {
      return {
        average: 0,
        count: 0,
        distribution: [
          { stars: 5, count: 0 },
          { stars: 4, count: 0 },
          { stars: 3, count: 0 },
          { stars: 2, count: 0 },
          { stars: 1, count: 0 },
        ],
      };
    }
    
    const totalRating = reviews.reduce((sum, r) => sum + r.rating, 0);
    const average = Math.round((totalRating / reviews.length) * 10) / 10;
    
    const distribution = [5, 4, 3, 2, 1].map(stars => ({
      stars,
      count: reviews.filter(r => r.rating === stars).length,
    }));
    
    return {
      average,
      count: reviews.length,
      distribution,
    };
  },

  /**
   * Zgłoś opinię do moderacji
   */
  async reportReview(data: {
    reviewId: string;
    reporterId: string;
    reporterName: string;
    reason: string;
    reviewContent: string;
    reviewAuthor: string;
    providerId: string;
    providerName: string;
  }): Promise<void> {
    const reportId = `report_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const now = new Date().toISOString();
    
    const report = {
      id: reportId,
      type: 'review',
      reviewId: data.reviewId,
      reporterId: data.reporterId,
      reporterName: data.reporterName,
      reason: data.reason,
      reviewContent: data.reviewContent,
      reviewAuthor: data.reviewAuthor,
      providerId: data.providerId,
      providerName: data.providerName,
      status: 'pending', // pending, reviewed, dismissed, action_taken
      createdAt: now,
    };
    
    await setDoc(doc(db, 'reports', reportId), report);
    console.log('Review reported:', reportId);
  },

  /**
   * Pobierz wszystkie zgłoszenia (dla admina)
   */
  async getReports(): Promise<any[]> {
    try {
      const snapshot = await getDocs(collection(db, 'reports'));
      const reports = snapshot.docs.map(doc => doc.data());
      return reports.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } catch (error) {
      console.error('getReports error:', error);
      return [];
    }
  },

  /**
   * Zaktualizuj status zgłoszenia
   */
  async updateReportStatus(reportId: string, status: string, adminNote?: string): Promise<void> {
    const reportRef = doc(db, 'reports', reportId);
    await updateDoc(reportRef, {
      status,
      adminNote: adminNote || '',
      reviewedAt: new Date().toISOString(),
    });
  },

  /**
   * Usuń opinię (przez admina)
   */
  async deleteReview(reviewId: string): Promise<void> {
    const reviewDoc = await getDoc(doc(db, REVIEWS_COLLECTION, reviewId));
    if (reviewDoc.exists()) {
      const review = reviewDoc.data() as Review;
      
      // Usuń opinię
      await updateDoc(doc(db, REVIEWS_COLLECTION, reviewId), {
        deleted: true,
        deletedAt: new Date().toISOString(),
      });
      
      // Aktualizuj średnią ocenę providera
      await this.updateProviderRating(review.providerId);
    }
  },
};

export default reviewService;
