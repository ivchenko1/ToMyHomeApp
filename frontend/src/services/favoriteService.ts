/**
 * favoriteService - Zarządzanie ulubionymi usługodawcami
 */

import { db } from '../firebase';
import { 
  collection, 
  doc, 
  setDoc, 
  deleteDoc, 
  getDocs, 
  query, 
  where,
  getDoc 
} from 'firebase/firestore';

const COLLECTION = 'favorites';

export interface Favorite {
  id: string;
  userId: string;
  providerId: string;
  providerName: string;
  providerImage: string;
  providerProfession: string;
  addedAt: string;
}

const favoriteService = {
  /**
   * Dodaj do ulubionych
   */
  async add(userId: string, provider: {
    id: string;
    name: string;
    image: string;
    profession: string;
  }): Promise<void> {
    const favoriteId = `${userId}_${provider.id}`;
    
    await setDoc(doc(db, COLLECTION, favoriteId), {
      userId,
      providerId: provider.id,
      providerName: provider.name,
      providerImage: provider.image,
      providerProfession: provider.profession,
      addedAt: new Date().toISOString(),
    });
  },

  /**
   * Usuń z ulubionych
   */
  async remove(userId: string, providerId: string): Promise<void> {
    const favoriteId = `${userId}_${providerId}`;
    await deleteDoc(doc(db, COLLECTION, favoriteId));
  },

  /**
   * Sprawdź czy jest w ulubionych
   */
  async isFavorite(userId: string, providerId: string): Promise<boolean> {
    const favoriteId = `${userId}_${providerId}`;
    const docRef = doc(db, COLLECTION, favoriteId);
    const docSnap = await getDoc(docRef);
    return docSnap.exists();
  },

  /**
   * Pobierz wszystkie ulubione użytkownika
   */
  async getByUser(userId: string): Promise<Favorite[]> {
    const q = query(collection(db, COLLECTION), where('userId', '==', userId));
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as Favorite[];
  },

  /**
   * Toggle - dodaj lub usuń z ulubionych
   */
  async toggle(userId: string, provider: {
    id: string;
    name: string;
    image: string;
    profession: string;
  }): Promise<boolean> {
    const isFav = await this.isFavorite(userId, provider.id);
    
    if (isFav) {
      await this.remove(userId, provider.id);
      return false;
    } else {
      await this.add(userId, provider);
      return true;
    }
  },
};

export default favoriteService;
