/**
 * Wallet Service - zarządzanie portfelem usługodawcy
 * Przechowuje saldo, historię transakcji i statystyki finansowe
 */

import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc,
  increment,
  onSnapshot,
  Timestamp,
} from 'firebase/firestore';
import { db } from '../firebase';

// ============================================
// TYPY
// ============================================

export interface ProviderWallet {
  providerId: string;
  providerName: string;
  
  // Saldo
  balance: number;           // Dostępne do wypłaty
  pendingBalance: number;    // Oczekujące (jeszcze nie rozliczone)
  
  // Statystyki
  totalEarned: number;       // Suma wszystkich zarobków
  totalWithdrawn: number;    // Suma wszystkich wypłat
  
  // Dane bankowe (opcjonalne)
  bankAccount?: {
    bankName: string;
    accountNumber: string;   // Numer konta (zamaskowany w UI)
    accountHolder: string;   // Imię i nazwisko właściciela
  };
  
  // Daty
  createdAt: string;
  updatedAt: string;
}

export interface WalletTransaction {
  id: string;
  providerId: string;
  type: 'earning' | 'withdrawal' | 'refund' | 'adjustment';
  amount: number;
  description: string;
  
  // Referencje
  bookingId?: string;
  withdrawalId?: string;
  
  // Status
  status: 'pending' | 'completed' | 'failed';
  
  // Daty
  createdAt: string;
  completedAt?: string;
}

// ============================================
// HELPERS
// ============================================

const WALLETS_COLLECTION = 'providerWallets';

// ============================================
// PUBLIC API
// ============================================

export const walletService = {
  /**
   * Pobierz portfel usługodawcy (lub utwórz jeśli nie istnieje)
   */
  async getOrCreate(providerId: string, providerName: string): Promise<ProviderWallet> {
    try {
      const docRef = doc(db, WALLETS_COLLECTION, providerId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return docSnap.data() as ProviderWallet;
      }
      
      // Utwórz nowy portfel
      const now = new Date().toISOString();
      const newWallet: ProviderWallet = {
        providerId,
        providerName,
        balance: 0,
        pendingBalance: 0,
        totalEarned: 0,
        totalWithdrawn: 0,
        createdAt: now,
        updatedAt: now,
      };
      
      await setDoc(docRef, newWallet);
      console.log('Wallet created for provider:', providerId);
      return newWallet;
    } catch (error) {
      console.error('Wallet getOrCreate error:', error);
      throw error;
    }
  },

  /**
   * Pobierz portfel usługodawcy
   */
  async get(providerId: string): Promise<ProviderWallet | null> {
    try {
      const docRef = doc(db, WALLETS_COLLECTION, providerId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return docSnap.data() as ProviderWallet;
      }
      return null;
    } catch (error) {
      console.error('Wallet get error:', error);
      return null;
    }
  },

  /**
   * Dodaj zarobek do portfela (po zakończeniu rezerwacji)
   */
  async addEarning(providerId: string, amount: number, bookingId: string): Promise<void> {
    try {
      const docRef = doc(db, WALLETS_COLLECTION, providerId);
      const wallet = await this.get(providerId);
      
      if (!wallet) {
        throw new Error('Wallet not found');
      }
      
      // Najpierw dodaj do pendingBalance (oczekujące na rozliczenie)
      await updateDoc(docRef, {
        pendingBalance: increment(amount),
        totalEarned: increment(amount),
        updatedAt: new Date().toISOString(),
      });
      
      console.log(`Added ${amount} PLN to pending balance for provider ${providerId}`);
    } catch (error) {
      console.error('Wallet addEarning error:', error);
      throw error;
    }
  },

  /**
   * Przenieś środki z pendingBalance do balance (rozliczenie)
   * Typowo wykonywane po X dniach od zakończenia usługi
   */
  async settlePending(providerId: string, amount: number): Promise<void> {
    try {
      const docRef = doc(db, WALLETS_COLLECTION, providerId);
      const wallet = await this.get(providerId);
      
      if (!wallet) {
        throw new Error('Wallet not found');
      }
      
      if (wallet.pendingBalance < amount) {
        throw new Error('Insufficient pending balance');
      }
      
      await updateDoc(docRef, {
        pendingBalance: increment(-amount),
        balance: increment(amount),
        updatedAt: new Date().toISOString(),
      });
      
      console.log(`Settled ${amount} PLN for provider ${providerId}`);
    } catch (error) {
      console.error('Wallet settlePending error:', error);
      throw error;
    }
  },

  /**
   * Rozlicz wszystkie oczekujące środki (dla uproszczenia demo)
   */
  async settleAllPending(providerId: string): Promise<void> {
    try {
      const wallet = await this.get(providerId);
      if (!wallet || wallet.pendingBalance <= 0) return;
      
      const docRef = doc(db, WALLETS_COLLECTION, providerId);
      
      await updateDoc(docRef, {
        balance: increment(wallet.pendingBalance),
        pendingBalance: 0,
        updatedAt: new Date().toISOString(),
      });
      
      console.log(`Settled all pending (${wallet.pendingBalance} PLN) for provider ${providerId}`);
    } catch (error) {
      console.error('Wallet settleAllPending error:', error);
      throw error;
    }
  },

  /**
   * Dodaj kwotę bezpośrednio do balance (np. przy zwrocie)
   */
  async addToBalance(providerId: string, amount: number): Promise<void> {
    try {
      const docRef = doc(db, WALLETS_COLLECTION, providerId);
      
      await updateDoc(docRef, {
        balance: increment(amount),
        updatedAt: new Date().toISOString(),
      });
      
      console.log(`Added ${amount} PLN to balance for provider ${providerId}`);
    } catch (error) {
      console.error('Wallet addToBalance error:', error);
      throw error;
    }
  },

  /**
   * Odejmij kwotę po wypłacie
   */
  async deductBalance(providerId: string, amount: number): Promise<void> {
    try {
      const docRef = doc(db, WALLETS_COLLECTION, providerId);
      const wallet = await this.get(providerId);
      
      if (!wallet) {
        throw new Error('Wallet not found');
      }
      
      if (wallet.balance < amount) {
        throw new Error('Insufficient balance');
      }
      
      await updateDoc(docRef, {
        balance: increment(-amount),
        totalWithdrawn: increment(amount),
        updatedAt: new Date().toISOString(),
      });
      
      console.log(`Deducted ${amount} PLN from balance for provider ${providerId}`);
    } catch (error) {
      console.error('Wallet deductBalance error:', error);
      throw error;
    }
  },

  /**
   * Zaktualizuj dane bankowe
   */
  async updateBankAccount(providerId: string, bankData: {
    bankName: string;
    accountNumber: string;
    accountHolder: string;
  }): Promise<void> {
    try {
      const docRef = doc(db, WALLETS_COLLECTION, providerId);
      
      await updateDoc(docRef, {
        bankAccount: bankData,
        updatedAt: new Date().toISOString(),
      });
      
      console.log('Bank account updated for provider:', providerId);
    } catch (error) {
      console.error('Wallet updateBankAccount error:', error);
      throw error;
    }
  },

  /**
   * Subskrybuj zmiany portfela (real-time)
   */
  subscribeToWallet(
    providerId: string,
    callback: (wallet: ProviderWallet | null) => void
  ): () => void {
    const docRef = doc(db, WALLETS_COLLECTION, providerId);
    
    return onSnapshot(docRef, (doc) => {
      if (doc.exists()) {
        callback(doc.data() as ProviderWallet);
      } else {
        callback(null);
      }
    });
  },

  /**
   * Formatuj numer konta (zamaskuj)
   */
  maskAccountNumber(accountNumber: string): string {
    if (!accountNumber || accountNumber.length < 8) return accountNumber;
    const visible = accountNumber.slice(-4);
    return `**** **** **** ${visible}`;
  },
};

export default walletService;
