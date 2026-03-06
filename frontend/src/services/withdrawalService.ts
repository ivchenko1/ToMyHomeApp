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

export type WithdrawalStatus = 
  | 'pending'
  | 'processing' 
  | 'completed'
  | 'failed'
  | 'cancelled';
export type PaymentProvider = 
  | 'manual'
  | 'stripe'
  | 'payu'
  | 'p24';

export interface WithdrawalRequest {
  id: string;
  
  providerId: string;
  providerName: string;
  
  amount: number;
  currency: string;

  bankAccount: {
    bankName: string;
    accountNumber: string;
    accountHolder: string;
  };

  status: WithdrawalStatus;

  paymentProvider: PaymentProvider;
  externalTransactionId?: string;
  externalStatus?: string;

  errorMessage?: string;

  requestedAt: string;
  processedAt?: string;
  completedAt?: string;
  cancelledAt?: string;
}

const WITHDRAWALS_COLLECTION = 'withdrawalRequests';
const MIN_WITHDRAWAL_AMOUNT = 50;

const SIMULATED_PROCESSING_DELAY = 2000;

const generateId = (): string => {
  return 'WD' + Date.now().toString(36).toUpperCase() + Math.random().toString(36).substr(2, 5).toUpperCase();
};

const generateFakeTransactionId = (): string => {
  return 'TXN_' + Date.now().toString() + '_' + Math.random().toString(36).substr(2, 8).toUpperCase();
};

export const withdrawalService = {
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
    
    const withdrawal: WithdrawalRequest = {
      id,
      providerId: data.providerId,
      providerName: data.providerName,
      amount: data.amount,
      currency: 'PLN',
      bankAccount: data.bankAccount,
      status: 'processing',
      paymentProvider: 'manual',
      requestedAt: now,
      processedAt: now,
    };

    await setDoc(doc(db, WITHDRAWALS_COLLECTION, id), withdrawal);
    console.log('Withdrawal request created:', id);

    await walletService.deductBalance(data.providerId, data.amount);

    setTimeout(async () => {
      try {
        await this.markAsCompleted(id);
      } catch (error) {
        console.error('Error completing withdrawal:', error);
      }
    }, SIMULATED_PROCESSING_DELAY);
    
    return withdrawal;
  },

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
    
    await notificationService.create({
      userId: withdrawal.providerId,
      type: 'withdrawal_completed',
      title: 'Wypłata zrealizowana! 🎉',
      message: `${withdrawal.amount} zł zostało przelane na Twoje konto ${withdrawal.bankAccount.bankName}.`,
      data: { withdrawalId },
    });
    
    console.log('Withdrawal completed:', withdrawalId);
  },

  async markAsFailed(withdrawalId: string, errorMessage: string): Promise<void> {
    const withdrawal = await this.getById(withdrawalId);
    if (!withdrawal) return;
    
    await walletService.addToBalance(withdrawal.providerId, withdrawal.amount);
    
    await updateDoc(doc(db, WITHDRAWALS_COLLECTION, withdrawalId), {
      status: 'failed',
      errorMessage,
      externalStatus: 'FAILED',
    });
    
    await notificationService.create({
      userId: withdrawal.providerId,
      type: 'withdrawal_failed',
      title: 'Wypłata nieudana ❌',
      message: `Wypłata ${withdrawal.amount} zł nie powiodła się. Środki zostały zwrócone na Twoje konto.`,
      data: { withdrawalId, error: errorMessage },
    });
    
    console.log('Withdrawal failed:', withdrawalId, errorMessage);
  },

  async cancel(withdrawalId: string): Promise<WithdrawalRequest | null> {
    const withdrawal = await this.getById(withdrawalId);
    if (!withdrawal) {
      throw new Error('WITHDRAWAL_NOT_FOUND');
    }
    
    if (withdrawal.status !== 'pending' && withdrawal.status !== 'processing') {
      throw new Error('CANNOT_CANCEL');
    }
    
    const now = new Date().toISOString();
    
    await walletService.addToBalance(withdrawal.providerId, withdrawal.amount);
    
    const updates = {
      status: 'cancelled' as WithdrawalStatus,
      cancelledAt: now,
    };
    
    await updateDoc(doc(db, WITHDRAWALS_COLLECTION, withdrawalId), updates);
    
    console.log('Withdrawal cancelled:', withdrawalId);
    return { ...withdrawal, ...updates };
  },

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
