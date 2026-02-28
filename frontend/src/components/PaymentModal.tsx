import { useState, useEffect } from 'react';
import { X, Shield, CheckCircle, Loader2, Smartphone, CreditCard, Building2, Calendar, Clock } from 'lucide-react';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  amount: number;
  serviceName: string;
  providerName: string;
  bookingDate?: string;
  bookingTime?: string;
}

type PaymentMethod = 'blik' | 'card' | 'transfer' | null;
type PaymentStep = 'select' | 'blik' | 'processing' | 'success';

const PaymentModal = ({ 
  isOpen, 
  onClose, 
  onSuccess, 
  amount, 
  serviceName, 
  providerName,
  bookingDate,
  bookingTime 
}: PaymentModalProps) => {
  const [step, setStep] = useState<PaymentStep>('select');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(null);
  const [blikCode, setBlikCode] = useState('');
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(0);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setStep('select');
      setPaymentMethod(null);
      setBlikCode('');
      setError('');
      setCountdown(0);
    }
  }, [isOpen]);

  // Countdown for processing
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0 && step === 'processing') {
      setStep('success');
    }
  }, [countdown, step]);

  const handleBlikSubmit = () => {
    // Walidacja kodu BLIK (6 cyfr)
    if (!/^\d{6}$/.test(blikCode)) {
      setError('Kod BLIK musi składać się z 6 cyfr');
      return;
    }
    
    setError('');
    setStep('processing');
    setCountdown(3); // 3 sekundy animacji
  };

  const handleSuccess = () => {
    onSuccess();
    onClose();
  };

  const formatAmount = (amt: number) => {
    return amt.toFixed(2).replace('.', ',') + ' zł';
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={step !== 'processing' ? onClose : undefined}
      />
      
      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              <span className="font-semibold">Bezpieczna płatność</span>
            </div>
            {step !== 'processing' && step !== 'success' && (
              <button onClick={onClose} className="p-1 hover:bg-white/20 rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* === STEP: SELECT PAYMENT METHOD === */}
          {step === 'select' && (
            <>
              {/* Order summary */}
              <div className="bg-gray-50 rounded-xl p-4 mb-6">
                <p className="text-sm text-gray-500 mb-1">Płacisz za:</p>
                <p className="font-semibold text-gray-900">{serviceName}</p>
                <p className="text-sm text-gray-600 mb-3">{providerName}</p>
                
                {/* Szczegóły rezerwacji */}
                {(bookingDate || bookingTime) && (
                  <div className="border-t border-gray-200 pt-3 mb-3 space-y-2">
                    {bookingDate && (
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-600">Data:</span>
                        <span className="font-medium text-gray-900">{bookingDate}</span>
                      </div>
                    )}
                    {bookingTime && (
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-600">Godzina:</span>
                        <span className="font-medium text-gray-900">{bookingTime}</span>
                      </div>
                    )}
                  </div>
                )}
                
                <div className="pt-3 border-t border-gray-200">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Do zapłaty:</span>
                    <span className="text-2xl font-bold text-gray-900">{formatAmount(amount)}</span>
                  </div>
                </div>
              </div>

              {/* Payment methods */}
              <p className="text-sm font-medium text-gray-700 mb-3">Wybierz metodę płatności:</p>
              <div className="space-y-2">
                <button
                  onClick={() => { setPaymentMethod('blik'); setStep('blik'); }}
                  className="w-full flex items-center gap-4 p-4 border-2 border-gray-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all"
                >
                  <div className="w-12 h-12 bg-black rounded-xl flex items-center justify-center">
                    <span className="text-white font-bold text-sm">BLIK</span>
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-gray-900">BLIK</p>
                    <p className="text-sm text-gray-500">Szybka płatność kodem z aplikacji bankowej</p>
                  </div>
                </button>

                <button
                  onClick={() => { setPaymentMethod('card'); setStep('blik'); }}
                  className="w-full flex items-center gap-4 p-4 border-2 border-gray-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all"
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl flex items-center justify-center">
                    <CreditCard className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-gray-900">Karta płatnicza</p>
                    <p className="text-sm text-gray-500">Visa, Mastercard, Maestro</p>
                  </div>
                </button>

                <button
                  onClick={() => { setPaymentMethod('transfer'); setStep('blik'); }}
                  className="w-full flex items-center gap-4 p-4 border-2 border-gray-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all"
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                    <Building2 className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-gray-900">Przelew online</p>
                    <p className="text-sm text-gray-500">Szybki przelew z Twojego banku</p>
                  </div>
                </button>
              </div>

              {/* Security badge */}
              <div className="mt-6 flex items-center justify-center gap-2 text-sm text-gray-500">
                <Shield className="w-4 h-4" />
                <span>Płatność zabezpieczona certyfikatem SSL</span>
              </div>
            </>
          )}

          {/* === STEP: BLIK CODE INPUT === */}
          {step === 'blik' && (
            <>
              <button 
                onClick={() => setStep('select')}
                className="text-sm text-blue-600 hover:text-blue-800 mb-4 flex items-center gap-1"
              >
                ← Zmień metodę płatności
              </button>

              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-black rounded-2xl flex items-center justify-center mx-auto mb-4">
                  {paymentMethod === 'blik' && <span className="text-white font-bold">BLIK</span>}
                  {paymentMethod === 'card' && <CreditCard className="w-8 h-8 text-white" />}
                  {paymentMethod === 'transfer' && <Building2 className="w-8 h-8 text-white" />}
                </div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {paymentMethod === 'blik' && 'Wpisz kod BLIK'}
                  {paymentMethod === 'card' && 'Wpisz kod autoryzacyjny'}
                  {paymentMethod === 'transfer' && 'Wpisz kod autoryzacyjny'}
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  {paymentMethod === 'blik' && 'Znajdziesz go w aplikacji mobilnej swojego banku'}
                  {paymentMethod === 'card' && 'Kod SMS z banku lub z aplikacji'}
                  {paymentMethod === 'transfer' && 'Kod z aplikacji bankowej'}
                </p>
              </div>

              {/* Amount reminder */}
              <div className="bg-gray-50 rounded-xl p-3 mb-4 text-center">
                <span className="text-gray-600">Kwota: </span>
                <span className="font-bold text-gray-900">{formatAmount(amount)}</span>
              </div>

              {/* Code input */}
              <div className="mb-4">
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={blikCode}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '');
                    setBlikCode(value);
                    setError('');
                  }}
                  placeholder="______"
                  className="w-full text-center text-3xl font-mono tracking-[0.5em] py-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-0 focus:outline-none"
                  autoFocus
                />
                {error && (
                  <p className="text-red-500 text-sm text-center mt-2">{error}</p>
                )}
              </div>

              {/* Timer info */}
              <div className="flex items-center justify-center gap-2 text-sm text-gray-500 mb-4">
                <Smartphone className="w-4 h-4" />
                <span>Kod ważny przez 2 minuty</span>
              </div>

              {/* Submit button */}
              <button
                onClick={handleBlikSubmit}
                disabled={blikCode.length !== 6}
                className="w-full py-4 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                Zapłać {formatAmount(amount)}
              </button>
            </>
          )}

          {/* === STEP: PROCESSING === */}
          {step === 'processing' && (
            <div className="text-center py-8">
              <div className="relative w-20 h-20 mx-auto mb-6">
                <div className="absolute inset-0 border-4 border-blue-200 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <Loader2 className="w-8 h-8 text-blue-600 animate-pulse" />
                </div>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Przetwarzanie płatności</h3>
              <p className="text-gray-500 mb-4">Proszę czekać, nie zamykaj tego okna...</p>
              <div className="bg-gray-100 rounded-full h-2 w-48 mx-auto overflow-hidden">
                <div 
                  className="bg-blue-600 h-full transition-all duration-1000 ease-linear"
                  style={{ width: `${((3 - countdown) / 3) * 100}%` }}
                />
              </div>
              <p className="text-sm text-gray-400 mt-2">Weryfikacja transakcji...</p>
            </div>
          )}

          {/* === STEP: SUCCESS === */}
          {step === 'success' && (
            <div className="text-center py-8">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
                <CheckCircle className="w-12 h-12 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Płatność zakończona!</h3>
              <p className="text-gray-500 mb-2">Transakcja przebiegła pomyślnie</p>
              
              <div className="bg-green-50 border border-green-200 rounded-xl p-4 my-6 text-left">
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Kwota:</span>
                  <span className="font-semibold text-gray-900">{formatAmount(amount)}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Usługa:</span>
                  <span className="font-semibold text-gray-900">{serviceName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Nr transakcji:</span>
                  <span className="font-mono text-sm text-gray-700">TXN{Date.now()}</span>
                </div>
              </div>

              <p className="text-sm text-gray-500 mb-6">
                Potwierdzenie zostało wysłane na Twój adres email.
              </p>

              <button
                onClick={handleSuccess}
                className="w-full py-4 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition-colors"
              >
                Gotowe
              </button>
            </div>
          )}
        </div>

        {/* Footer - Przelewy24 style */}
        {step !== 'success' && (
          <div className="bg-gray-50 px-6 py-3 flex items-center justify-center gap-4 border-t">
            <span className="text-xs text-gray-400">Płatność obsługiwana przez</span>
            <div className="flex items-center gap-2">
              <div className="bg-emerald-600 text-white text-xs font-bold px-2 py-1 rounded">P365</div>
              <span className="text-xs font-semibold text-gray-600">Przelewy365</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentModal;
