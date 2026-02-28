/**
 * Withdrawal Service - zarządzanie wypłatami usługodawcy
 * 
 * ARCHITEKTURA PRZYGOTOWANA POD PRAWDZIWĄ INTEGRACJĘ:
 * - Stripe Connect
 * - PayU
 * - Przelewy24
 * - Bezpośredni przelew bankowy
 * 
 * AKTUALNIE: Działa fikcyjnie (symulacja)
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
import { walletService } from './walletService';
import { notificationService } from './notificationService';

// ============================================
// TYPY
// ============================================

export type WithdrawalStatus = 
  | 'pending'      // Oczekuje na przetworzenie
  | 'processing'   // W trakcie przetwarzania przez system płatności
  | 'completed'    // Zrealizowana
  | 'failed'       // Błąd podczas przetwarzania
  | 'cancelled';   // Anulowana przez usługodawcę

export type PaymentProvider = 
  | 'manual'       // Ręczny przelew (placeholder)
  | 'stripe'       // Stripe Connect
  | 'payu'         // PayU
  | 'p24';         // Przelewy24

export interface WithdrawalRequest {
  id: string;
  
  // Usługodawca
  providerId: string;
  providerName: string;
  
  // Kwota
  amount: number;
  currency: string;  // PLN
  
  // Dane bankowe (kopia z momentu złożenia)
  bankAccount: {
    bankName: string;
    accountNumber: string;
    accountHolder: string;
  };
  
  // Status
  status: WithdrawalStatus;
  
  // Integracja z systemem płatności (przygotowane pod prawdziwą integrację)
  paymentProvider: PaymentProvider;
  externalTransactionId?: string;  // ID transakcji od providera (Stripe, PayU, etc.)
  externalStatus?: string;         // Status od providera
  
  // Błędy
  errorMessage?: string;
  
  // Daty
  requestedAt: string;
  processedAt?: string;
  completedAt?: string;
  cancelledAt?: string;
}

// ============================================
// KONFIGURACJA
// ============================================

const WITHDRAWALS_COLLECTION = 'withdrawalRequests';
const MIN_WITHDRAWAL_AMOUNT = 50;  // Minimalna kwota wypłaty w PLN

// Symulowane opóźnienie przetwarzania (ms) - w produkcji to webhook od providera
const SIMULATED_PROCESSING_DELAY = 2000;

// ============================================
// HELPERS
// ============================================

const generateId = (): string => {
  return 'WD' + Date.now().toString(36).toUpperCase() + Math.random().toString(36).substr(2, 5).toUpperCase();
};

const generateFakeTransactionId = (): string => {
  return 'TXN_' + Date.now().toString() + '_' + Math.random().toString(36).substr(2, 8).toUpperCase();
};

// ============================================
// PUBLIC API
// ============================================

export const withdrawalService = {
  /**
   * Utwórz i przetwórz wypłatę
   * 
   * W PRODUKCJI: Tu byłoby wywołanie API do Stripe Connect / PayU
   * AKTUALNIE: Symulacja - od razu oznacza jako completed
   */
  async create(data: {
    providerId: string;
    providerName: string;
    amount: number;
    bankAccount: {
      bankName: string;
      accountNumber: string;
      accountHolder: string;
    };
  }): Promise<WithdrawalRequest> {
    // Walidacja
    const wallet = await walletService.get(data.providerId);
    if (!wallet) {
      throw new Error('WALLET_NOT_FOUND');
    }
    
    if (wallet.balance < data.amount) {
      throw new Error('INSUFFICIENT_BALANCE');
    }
    
    if (data.amount < MIN_WITHDRAWAL_AMOUNT) {
      throw new Error('MIN_AMOUNT_NOT_MET');
    }
    
    const id = generateId();
    const now = new Date().toISOString();
    
    // Utwórz wniosek ze statusem 'processing'
    const withdrawal: WithdrawalRequest = {
      id,
      providerId: data.providerId,
      providerName: data.providerName,
      amount: data.amount,
      currency: 'PLN',
      bankAccount: data.bankAccount,
      status: 'processing',
      paymentProvider: 'manual',  // W produkcji: 'stripe', 'payu', etc.
      requestedAt: now,
      processedAt: now,
    };
    
    // Zapisz do bazy
    await setDoc(doc(db, WITHDRAWALS_COLLECTION, id), withdrawal);
    console.log('Withdrawal request created:', id);
    
    // Odejmij środki z portfela OD RAZU
    await walletService.deductBalance(data.providerId, data.amount);
    
    // ============================================
    // SYMULACJA PRZETWARZANIA
    // W PRODUKCJI: Tu byłoby wywołanie API do providera płatności
    // i oczekiwanie na webhook z potwierdzeniem
    // ============================================
    
    setTimeout(async () => {
      try {
        await this.markAsCompleted(id);
      } catch (error) {
        console.error('Error completing withdrawal:', error);
      }
    }, SIMULATED_PROCESSING_DELAY);
    
    return withdrawal;
  },

  /**
   * Oznacz wypłatę jako zakończoną
   * 
   * W PRODUKCJI: Wywoływane przez webhook od providera płatności
   * AKTUALNIE: Wywoływane automatycznie po symulowanym opóźnieniu
   */
  async markAsCompleted(withdrawalId: string, externalTransactionId?: string): Promise<void> {
    const withdrawal = await this.getById(withdrawalId);
    if (!withdrawal) return;
    
    const now = new Date().toISOString();
    
    await updateDoc(doc(db, WITHDRAWALS_COLLECTION, withdrawalId), {
      status: 'completed',
      completedAt: now,
      externalTransactionId: externalTransactionId || generateFakeTransactionId(),
      externalStatus: 'SUCCESS',
    });
    
    // Powiadomienie
    await notificationService.create({
      userId: withdrawal.providerId,
      type: 'withdrawal_completed',
      title: 'Wypłata zrealizowana! 🎉',
      message: `${withdrawal.amount} zł zostało przelane na Twoje konto ${withdrawal.bankAccount.bankName}.`,
      data: { withdrawalId },
    });
    
    console.log('Withdrawal completed:', withdrawalId);
  },

  /**
   * Oznacz wypłatę jako nieudaną
   * 
   * W PRODUKCJI: Wywoływane przez webhook gdy przelew się nie powiódł
   */
  async markAsFailed(withdrawalId: string, errorMessage: string): Promise<void> {
    const withdrawal = await this.getById(withdrawalId);
    if (!withdrawal) return;
    
    // Zwróć środki do portfela
    await walletService.addToBalance(withdrawal.providerId, withdrawal.amount);
    
    await updateDoc(doc(db, WITHDRAWALS_COLLECTION, withdrawalId), {
      status: 'failed',
      errorMessage,
      externalStatus: 'FAILED',
    });
    
    // Powiadomienie
    await notificationService.create({
      userId: withdrawal.providerId,
      type: 'withdrawal_failed',
      title: 'Wypłata nieudana ❌',
      message: `Wypłata ${withdrawal.amount} zł nie powiodła się. Środki zostały zwrócone na Twoje konto.`,
      data: { withdrawalId, error: errorMessage },
    });
    
    console.log('Withdrawal failed:', withdrawalId, errorMessage);
  },

  /**
   * Anuluj wypłatę (tylko jeśli status = 'pending' lub 'processing')
   */
  async cancel(withdrawalId: string): Promise<WithdrawalRequest | null> {
    const withdrawal = await this.getById(withdrawalId);
    if (!withdrawal) {
      throw new Error('WITHDRAWAL_NOT_FOUND');
    }
    
    if (withdrawal.status !== 'pending' && withdrawal.status !== 'processing') {
      throw new Error('CANNOT_CANCEL');
    }
    
    const now = new Date().toISOString();
    
    // Zwróć środki do portfela
    await walletService.addToBalance(withdrawal.providerId, withdrawal.amount);
    
    const updates = {
      status: 'cancelled' as WithdrawalStatus,
      cancelledAt: now,
    };
    
    await updateDoc(doc(db, WITHDRAWALS_COLLECTION, withdrawalId), updates);
    
    console.log('Withdrawal cancelled:', withdrawalId);
    return { ...withdrawal, ...updates };
  },

  /**
   * Pobierz wypłatę po ID
   */
  async getById(id: string): Promise<WithdrawalRequest | null> {
    try {
      const docRef = doc(db, WITHDRAWALS_COLLECTION, id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return docSnap.data() as WithdrawalRequest;
      }
      return null;
    } catch (error) {
      console.error('Withdrawal getById error:', error);
      return null;
    }
  },

  /**
   * Pobierz wszystkie wypłaty usługodawcy
   */
  async getByProvider(providerId: string): Promise<WithdrawalRequest[]> {
    try {
      const q = query(
        collection(db, WITHDRAWALS_COLLECTION),
        where('providerId', '==', providerId)
      );
      const snapshot = await getDocs(q);
      const withdrawals = snapshot.docs.map(doc => doc.data() as WithdrawalRequest);
      return withdrawals.sort((a, b) => 
        new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime()
      );
    } catch (error) {
      console.error('Withdrawal getByProvider error:', error);
      return [];
    }
  },

  /**
   * Subskrybuj zmiany wypłat usługodawcy (real-time)
   */
  subscribeToProviderWithdrawals(
    providerId: string,
    callback: (withdrawals: WithdrawalRequest[]) => void
  ): () => void {
    const q = query(
      collection(db, WITHDRAWALS_COLLECTION),
      where('providerId', '==', providerId)
    );
    
    return onSnapshot(q, (snapshot) => {
      const withdrawals = snapshot.docs.map(doc => doc.data() as WithdrawalRequest);
      withdrawals.sort((a, b) => 
        new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime()
      );
      callback(withdrawals);
    });
  },

  /**
   * Formatuj status po polsku
   */
  getStatusLabel(status: WithdrawalStatus): string {
    switch (status) {
      case 'pending': return 'Oczekuje';
      case 'processing': return 'Przetwarzanie';
      case 'completed': return 'Zrealizowana';
      case 'failed': return 'Nieudana';
      case 'cancelled': return 'Anulowana';
      default: return status;
    }
  },

  /**
   * Pobierz kolor statusu
   */
  getStatusColor(status: WithdrawalStatus): string {
    switch (status) {
      case 'pending': return 'yellow';
      case 'processing': return 'blue';
      case 'completed': return 'green';
      case 'failed': return 'red';
      case 'cancelled': return 'gray';
      default: return 'gray';
    }
  },
};

export default withdrawalService;
