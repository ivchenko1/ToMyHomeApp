import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Mail, Loader2, CheckCircle } from 'lucide-react';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../firebase';
import { useToast } from '../App';

const ResetPasswordPage = () => {
  const { showToast } = useToast();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!email.trim()) {
      setError('Wpisz adres email');
      return;
    }

    // Prosta walidacja emaila
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Podaj prawidłowy adres email');
      return;
    }

    setIsLoading(true);

    try {
      await sendPasswordResetEmail(auth, email, {
        url: window.location.origin + '/#/auth?mode=login',
        handleCodeInApp: false,
      });
      
      setIsSent(true);
      showToast('Link do resetowania hasła został wysłany!', 'success');
    } catch (err: any) {
      console.error('Reset password error:', err);
      
      let errorMessage = 'Błąd wysyłania linku';
      switch (err.code) {
        case 'auth/user-not-found':
          errorMessage = 'Nie znaleziono konta z tym adresem email';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Nieprawidłowy adres email';
          break;
        case 'auth/too-many-requests':
          errorMessage = 'Zbyt wiele prób. Spróbuj ponownie za chwilę';
          break;
        default:
          errorMessage = 'Wystąpił błąd. Spróbuj ponownie';
      }
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen py-12 px-6 flex items-center justify-center">
      <div className="max-w-md w-full">
        <Link
          to="/auth?mode=login"
          className="flex items-center gap-2 text-gray-600 hover:text-primary mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Wróć do logowania
        </Link>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          {isSent ? (
            // Sukces - email wysłany
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-4">
                Sprawdź swoją skrzynkę
              </h1>
              <p className="text-gray-600 mb-6">
                Wysłaliśmy link do resetowania hasła na adres:
              </p>
              <p className="font-medium text-gray-900 mb-8 bg-gray-50 py-3 px-4 rounded-xl">
                {email}
              </p>
              <p className="text-sm text-gray-500 mb-6">
                Nie widzisz wiadomości? Sprawdź folder spam lub poczekaj kilka minut.
              </p>
              <div className="space-y-3">
                <button
                  onClick={() => {
                    setIsSent(false);
                    setEmail('');
                  }}
                  className="w-full py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
                >
                  Użyj innego adresu email
                </button>
                <Link
                  to="/auth?mode=login"
                  className="block w-full py-3 bg-gradient-to-r from-primary to-secondary text-white rounded-xl font-semibold text-center hover:shadow-lg transition-all"
                >
                  Wróć do logowania
                </Link>
              </div>
            </div>
          ) : (
            // Formularz
            <>
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Mail className="w-8 h-8 text-primary" />
                </div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  Zapomniałeś hasła?
                </h1>
                <p className="text-gray-600">
                  Wpisz adres email powiązany z Twoim kontem, a wyślemy Ci link do zresetowania hasła.
                </p>
              </div>

              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm flex items-start gap-2">
                  <span>⚠️</span>
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Adres email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="twoj@email.com"
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-primary focus:ring-0 focus:outline-none"
                    autoFocus
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-4 bg-gradient-to-r from-primary to-secondary text-white rounded-xl font-bold text-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin mr-2" />
                      Wysyłanie...
                    </>
                  ) : (
                    'WYŚLIJ LINK'
                  )}
                </button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-gray-600">
                  Pamiętasz hasło?{' '}
                  <Link
                    to="/auth?mode=login"
                    className="text-primary font-semibold hover:underline"
                  >
                    Zaloguj się
                  </Link>
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
