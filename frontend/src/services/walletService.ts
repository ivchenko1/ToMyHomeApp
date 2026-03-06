import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc,
  increment,
  onSnapshot,
} from 'firebase/firestore';
import { db } from '../firebase';

export interface ProviderWallet {
  providerId: string;
  providerName: string;
  
  balance: number;           
  pendingBalance: number;    
  
  totalEarned: number;       
  totalWithdrawn: number;    
  
  bankAccount?: {
    bankName: string;
    accountNumber: string;  
    accountHolder: string;  
  };
  
  createdAt: string;
  updatedAt: string;
}

export interface WalletTransaction {
  id: string;
  providerId: string;
  type: 'earning' | 'withdrawal' | 'refund' | 'adjustment';
  amount: number;
  description: string;
  
  bookingId?: string;
  withdrawalId?: string;
  
  status: 'pending' | 'completed' | 'failed';
  
  createdAt: string;
  completedAt?: string;
}

const WALLETS_COLLECTION = 'providerWallets';

export const walletService = {
  async getOrCreate(providerId: string, providerName: string): Promise<ProviderWallet> {
    try {
      const docRef = doc(db, WALLETS_COLLECTION, providerId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return docSnap.data() as ProviderWallet;
      }
      

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

  async addEarning(providerId: string, amount: number, _bookingId: string): Promise<void> {
    try {
      const docRef = doc(db, WALLETS_COLLECTION, providerId);
      let wallet = await this.get(providerId);
      
      if (!wallet) {
        const providerDoc = await getDoc(doc(db, 'providers', providerId));
        const providerName = providerDoc.exists() ? providerDoc.data()?.name || 'Usługodawca' : 'Usługodawca';
        
        wallet = await this.getOrCreate(providerId, providerName);
      }
      
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

  maskAccountNumber(accountNumber: string): string {
    if (!accountNumber || accountNumber.length < 8) return accountNumber;
    const visible = accountNumber.slice(-4);
    return `**** **** **** ${visible}`;
  },
};

export default walletService;
