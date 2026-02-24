import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Wallet,
  ArrowDownCircle,
  ArrowUpCircle,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Building2,
  RefreshCw,
  Loader2,
  Info,
  Send,
  X,
  Eye,
  EyeOff,
} from 'lucide-react';
import { useAuth, useToast } from '../../App';
import providerService from '../../services/providerService';
import walletService, { ProviderWallet } from '../../services/walletService';
import withdrawalService, { WithdrawalRequest, WithdrawalStatus } from '../../services/withdrawalService';

const BusinessWallet = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  
  // Stan
  const [wallet, setWallet] = useState<ProviderWallet | null>(null);
  const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>([]);
  const [providerId, setProviderId] = useState<string | null>(null);
  const [providerName, setProviderName] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  
  // Modal wypłaty
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Modal danych bankowych
  const [showBankModal, setShowBankModal] = useState(false);
  const [bankData, setBankData] = useState({
    bankName: '',
    accountNumber: '',
    accountHolder: '',
  });
  const [showAccountNumber, setShowAccountNumber] = useState(false);

  // Ładowanie danych
  useEffect(() => {
    const loadData = async () => {
      if (!user?.id) {
        setIsLoading(false);
        return;
      }
      
      try {
        // Pobierz profil usługodawcy
        const providers = await providerService.getByOwner(user.id);
        if (providers.length === 0) {
          setIsLoading(false);
          return;
        }
        
        const provider = providers[0];
        setProviderId(provider.id);
        setProviderName(provider.name);
        
        // Pobierz lub utwórz portfel
        const walletData = await walletService.getOrCreate(provider.id, provider.name);
        setWallet(walletData);
        
        // Inicjalizuj dane bankowe z portfela
        if (walletData.bankAccount) {
          setBankData(walletData.bankAccount);
        }
        
        // Subskrybuj portfel
        const unsubWallet = walletService.subscribeToWallet(provider.id, (w) => {
          if (w) setWallet(w);
        });
        
        // Subskrybuj wypłaty
        const unsubWithdrawals = withdrawalService.subscribeToProviderWithdrawals(
          provider.id,
          (w) => setWithdrawals(w)
        );
        
        setIsLoading(false);
        
        return () => {
          unsubWallet();
          unsubWithdrawals();
        };
      } catch (error) {
        console.error('Error loading wallet:', error);
        setIsLoading(false);
      }
    };
    
    loadData();
  }, [user]);

  // Złóż wniosek o wypłatę
  const handleWithdrawSubmit = async () => {
    if (!providerId || !wallet) return;
    
    const amount = parseFloat(withdrawAmount);
    
    if (isNaN(amount) || amount <= 0) {
      showToast('Podaj prawidłową kwotę', 'error');
      return;
    }
    
    if (amount < 50) {
      showToast('Minimalna kwota wypłaty to 50 zł', 'error');
      return;
    }
    
    if (amount > wallet.balance) {
      showToast('Niewystarczające środki na koncie', 'error');
      return;
    }
    
    if (!wallet.bankAccount) {
      showToast('Najpierw dodaj dane bankowe', 'error');
      setShowWithdrawModal(false);
      setShowBankModal(true);
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      await withdrawalService.create({
        providerId,
        providerName,
        amount,
        bankAccount: wallet.bankAccount,
      });
      
      showToast('Wypłata w trakcie realizacji! 💸', 'success');
      setShowWithdrawModal(false);
      setWithdrawAmount('');
    } catch (error: any) {
      console.error('Withdrawal error:', error);
      if (error.message === 'INSUFFICIENT_BALANCE') {
        showToast('Niewystarczające środki', 'error');
      } else if (error.message === 'MIN_AMOUNT_NOT_MET') {
        showToast('Minimalna kwota to 50 zł', 'error');
      } else {
        showToast('Błąd składania wniosku', 'error');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Zapisz dane bankowe
  const handleSaveBankData = async () => {
    if (!providerId) return;
    
    if (!bankData.bankName || !bankData.accountNumber || !bankData.accountHolder) {
      showToast('Wypełnij wszystkie pola', 'error');
      return;
    }
    
    // Walidacja numeru konta (26 cyfr dla Polski)
    const cleanedNumber = bankData.accountNumber.replace(/\s/g, '');
    if (!/^\d{26}$/.test(cleanedNumber)) {
      showToast('Numer konta powinien mieć 26 cyfr', 'error');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      await walletService.updateBankAccount(providerId, {
        ...bankData,
        accountNumber: cleanedNumber,
      });
      showToast('Dane bankowe zapisane', 'success');
      setShowBankModal(false);
    } catch (error) {
      showToast('Błąd zapisywania danych', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Rozlicz środki (demo - natychmiast przenosi pending do balance)
  const handleSettleFunds = async () => {
    if (!providerId || !wallet || wallet.pendingBalance <= 0) return;
    
    try {
      await walletService.settleAllPending(providerId);
      showToast('Środki rozliczone i dostępne do wypłaty!', 'success');
    } catch (error) {
      showToast('Błąd rozliczania środków', 'error');
    }
  };

  // Status badge
  const StatusBadge = ({ status }: { status: WithdrawalStatus }) => {
    const color = withdrawalService.getStatusColor(status);
    const label = withdrawalService.getStatusLabel(status);
    
    const colorClasses: Record<string, string> = {
      yellow: 'bg-yellow-100 text-yellow-700',
      blue: 'bg-blue-100 text-blue-700',
      green: 'bg-green-100 text-green-700',
      red: 'bg-red-100 text-red-700',
      gray: 'bg-gray-100 text-gray-700',
    };
    
    const iconMap: Record<WithdrawalStatus, JSX.Element> = {
      pending: <Clock className="w-3 h-3" />,
      processing: <RefreshCw className="w-3 h-3 animate-spin" />,
      completed: <CheckCircle className="w-3 h-3" />,
      failed: <XCircle className="w-3 h-3" />,
      cancelled: <XCircle className="w-3 h-3" />,
    };
    
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${colorClasses[color]}`}>
        {iconMap[status]}
        {label}
      </span>
    );
  };

  // Loading
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-12 h-12 animate-spin text-emerald-500" />
      </div>
    );
  }

  // Brak profilu
  if (!providerId) {
    return (
      <div className="max-w-2xl mx-auto text-center py-16">
        <Wallet className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-gray-900 mb-2">Brak profilu usługodawcy</h2>
        <p className="text-gray-600 mb-6">
          Aby korzystać z portfela, najpierw utwórz profil usługodawcy.
        </p>
        <Link
          to="/biznes/dodaj-usluge"
          className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-500 text-white rounded-xl font-semibold hover:bg-emerald-600"
        >
          Utwórz profil
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Portfel 💰</h1>
        <p className="text-gray-600">Zarządzaj swoimi środkami i wypłatami</p>
      </div>

      {/* Karty salda */}
      <div className="grid sm:grid-cols-3 gap-4">
        {/* Dostępne środki */}
        <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <span className="text-emerald-100 text-sm font-medium">Dostępne do wypłaty</span>
            <Wallet className="w-6 h-6 text-emerald-200" />
          </div>
          <div className="text-3xl font-bold mb-4">
            {wallet?.balance.toFixed(2) || '0.00'} zł
          </div>
          <button
            onClick={() => setShowWithdrawModal(true)}
            disabled={!wallet || wallet.balance < 50}
            className="w-full py-2.5 bg-white/20 hover:bg-white/30 disabled:bg-white/10 disabled:cursor-not-allowed rounded-xl font-semibold transition-colors flex items-center justify-center gap-2"
          >
            <Send className="w-4 h-4" />
            Wypłać środki
          </button>
        </div>

        {/* Oczekujące */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <span className="text-gray-500 text-sm font-medium">Oczekujące</span>
            <Clock className="w-6 h-6 text-yellow-500" />
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-4">
            {wallet?.pendingBalance.toFixed(2) || '0.00'} zł
          </div>
          <button
            onClick={handleSettleFunds}
            disabled={!wallet || wallet.pendingBalance <= 0}
            className="w-full py-2.5 bg-yellow-50 text-yellow-700 hover:bg-yellow-100 disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed rounded-xl font-semibold transition-colors flex items-center justify-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Rozlicz teraz
          </button>
          <p className="text-xs text-gray-400 mt-2 text-center">
            Środki z zakończonych usług
          </p>
        </div>

        {/* Statystyki */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <span className="text-gray-500 text-sm font-medium">Łącznie zarobione</span>
            <ArrowDownCircle className="w-6 h-6 text-emerald-500" />
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-2">
            {wallet?.totalEarned.toFixed(2) || '0.00'} zł
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <ArrowUpCircle className="w-4 h-4 text-blue-500" />
            Wypłacono: {wallet?.totalWithdrawn.toFixed(2) || '0.00'} zł
          </div>
        </div>
      </div>

      {/* Info o danych bankowych */}
      {!wallet?.bankAccount && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-yellow-800 font-medium">Dodaj dane bankowe</p>
            <p className="text-yellow-700 text-sm mt-1">
              Aby móc wypłacać środki, musisz najpierw dodać swoje dane bankowe.
            </p>
            <button
              onClick={() => setShowBankModal(true)}
              className="mt-3 px-4 py-2 bg-yellow-600 text-white rounded-lg text-sm font-medium hover:bg-yellow-700"
            >
              Dodaj dane bankowe
            </button>
          </div>
        </div>
      )}

      {/* Dane bankowe - jeśli są */}
      {wallet?.bankAccount && (
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-900 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-gray-400" />
              Dane do wypłaty
            </h3>
            <button
              onClick={() => setShowBankModal(true)}
              className="text-sm text-emerald-600 hover:text-emerald-700 font-medium"
            >
              Edytuj
            </button>
          </div>
          <div className="grid sm:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-gray-500">Bank</span>
              <p className="font-medium text-gray-900">{wallet.bankAccount.bankName}</p>
            </div>
            <div>
              <span className="text-gray-500">Numer konta</span>
              <p className="font-medium text-gray-900 font-mono">
                {walletService.maskAccountNumber(wallet.bankAccount.accountNumber)}
              </p>
            </div>
            <div>
              <span className="text-gray-500">Właściciel</span>
              <p className="font-medium text-gray-900">{wallet.bankAccount.accountHolder}</p>
            </div>
          </div>
        </div>
      )}

      {/* Historia wypłat */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-5 border-b border-gray-100">
          <h3 className="font-bold text-gray-900">Historia wypłat</h3>
        </div>
        
        {withdrawals.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <Wallet className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>Brak historii wypłat</p>
            <p className="text-sm mt-1">Tutaj pojawią się Twoje wypłaty</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {withdrawals.map(withdrawal => (
              <div key={withdrawal.id} className="p-4 flex items-center justify-between hover:bg-gray-50">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    withdrawal.status === 'completed' ? 'bg-green-100' :
                    withdrawal.status === 'processing' ? 'bg-blue-100' :
                    withdrawal.status === 'failed' ? 'bg-red-100' :
                    'bg-gray-100'
                  }`}>
                    {withdrawal.status === 'completed' ? (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    ) : withdrawal.status === 'processing' ? (
                      <RefreshCw className="w-5 h-5 text-blue-600 animate-spin" />
                    ) : withdrawal.status === 'failed' ? (
                      <XCircle className="w-5 h-5 text-red-600" />
                    ) : (
                      <Clock className="w-5 h-5 text-gray-600" />
                    )}
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">
                      Wypłata #{withdrawal.id}
                    </div>
                    <div className="text-sm text-gray-500">
                      {new Date(withdrawal.requestedAt).toLocaleDateString('pl-PL', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-gray-900">
                    {withdrawal.amount.toFixed(2)} zł
                  </div>
                  <StatusBadge status={withdrawal.status} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ============================================ */}
      {/* MODAL: Wypłata środków */}
      {/* ============================================ */}
      {showWithdrawModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">Wypłać środki</h3>
              <button onClick={() => setShowWithdrawModal(false)}>
                <X className="w-6 h-6 text-gray-400 hover:text-gray-600" />
              </button>
            </div>
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Kwota do wypłaty
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  placeholder="0.00"
                  min="50"
                  max={wallet?.balance || 0}
                  className="w-full px-4 py-3 pr-12 border border-gray-200 rounded-xl text-lg font-bold focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">
                  zł
                </span>
              </div>
              <p className="text-sm text-gray-500 mt-2">
                Dostępne: <span className="font-medium">{wallet?.balance.toFixed(2)} zł</span>
                {' · '}Minimum: <span className="font-medium">50 zł</span>
              </p>
            </div>
            
            {/* Szybkie kwoty */}
            <div className="flex gap-2 mb-6">
              {[100, 200, 500].filter(amt => amt <= (wallet?.balance || 0)).map(amount => (
                <button
                  key={amount}
                  onClick={() => setWithdrawAmount(amount.toString())}
                  className="flex-1 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium transition-colors"
                >
                  {amount} zł
                </button>
              ))}
              {wallet && wallet.balance >= 50 && (
                <button
                  onClick={() => setWithdrawAmount(wallet.balance.toString())}
                  className="flex-1 py-2 bg-emerald-100 text-emerald-700 hover:bg-emerald-200 rounded-lg text-sm font-medium transition-colors"
                >
                  Wszystko
                </button>
              )}
            </div>
            
            {/* Dane do wypłaty */}
            {wallet?.bankAccount && (
              <div className="bg-gray-50 rounded-xl p-4 mb-6">
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                  <Building2 className="w-4 h-4" />
                  Wypłata na konto
                </div>
                <div className="font-medium text-gray-900">
                  {wallet.bankAccount.bankName}
                </div>
                <div className="text-sm text-gray-600 font-mono">
                  {walletService.maskAccountNumber(wallet.bankAccount.accountNumber)}
                </div>
              </div>
            )}
            
            <div className="flex gap-3">
              <button
                onClick={() => setShowWithdrawModal(false)}
                className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200"
              >
                Anuluj
              </button>
              <button
                onClick={handleWithdrawSubmit}
                disabled={isSubmitting || !withdrawAmount || parseFloat(withdrawAmount) < 50}
                className="flex-1 py-3 bg-emerald-500 text-white rounded-xl font-semibold hover:bg-emerald-600 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    Wypłać
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================ */}
      {/* MODAL: Dane bankowe */}
      {/* ============================================ */}
      {showBankModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">Dane bankowe</h3>
              <button onClick={() => setShowBankModal(false)}>
                <X className="w-6 h-6 text-gray-400 hover:text-gray-600" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nazwa banku
                </label>
                <input
                  type="text"
                  value={bankData.bankName}
                  onChange={(e) => setBankData({ ...bankData, bankName: e.target.value })}
                  placeholder="np. PKO BP, mBank, ING..."
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Numer konta (26 cyfr)
                </label>
                <div className="relative">
                  <input
                    type={showAccountNumber ? 'text' : 'password'}
                    value={bankData.accountNumber}
                    onChange={(e) => setBankData({ 
                      ...bankData, 
                      accountNumber: e.target.value.replace(/\D/g, '').slice(0, 26) 
                    })}
                    placeholder="00 0000 0000 0000 0000 0000 0000"
                    className="w-full px-4 py-3 pr-12 border border-gray-200 rounded-xl font-mono focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                  <button
                    type="button"
                    onClick={() => setShowAccountNumber(!showAccountNumber)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showAccountNumber ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {bankData.accountNumber.length}/26 cyfr
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Imię i nazwisko właściciela
                </label>
                <input
                  type="text"
                  value={bankData.accountHolder}
                  onChange={(e) => setBankData({ ...bankData, accountHolder: e.target.value })}
                  placeholder="Jan Kowalski"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>
            </div>
            
            <div className="bg-blue-50 rounded-xl p-4 mt-6 flex items-start gap-3">
              <Info className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-blue-700">
                Twoje dane bankowe są bezpieczne. W produkcji integracja z bramką płatności (Stripe Connect, PayU) automatycznie zweryfikuje konto.
              </p>
            </div>
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowBankModal(false)}
                className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200"
              >
                Anuluj
              </button>
              <button
                onClick={handleSaveBankData}
                disabled={isSubmitting || !bankData.bankName || !bankData.accountNumber || !bankData.accountHolder}
                className="flex-1 py-3 bg-emerald-500 text-white rounded-xl font-semibold hover:bg-emerald-600 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  'Zapisz'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BusinessWallet;
