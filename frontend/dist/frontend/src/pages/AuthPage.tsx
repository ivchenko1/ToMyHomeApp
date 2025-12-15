import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Eye, EyeOff, User, Briefcase, ArrowLeft, Check, Loader2 } from 'lucide-react';
import { useAuth, useToast } from '../App';
import PhoneInput, { validatePhoneNumber } from '../components/PhoneInput';

// 🔥 Firebase imports
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  updateProfile
} from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../FireBase';

type AuthMode = 'select' | 'login' | 'register-client' | 'register-provider';

const AuthPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { isAuthenticated } = useAuth();
  const { showToast } = useToast();

  const [mode, setMode] = useState<AuthMode>('select');
  
  // Login form state
  const [loginData, setLoginData] = useState({
    email: '',
    password: '',
  });
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Register form state
  const [registerData, setRegisterData] = useState({
    email: '',
    username: '',
    phone: '',
    phoneCountryCode: '+48',
    password: '',
    confirmPassword: '',
    businessName: '',
    terms: false,
    accountType: 'client' as 'client' | 'provider',
  });
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Handle URL params
  useEffect(() => {
    const urlMode = searchParams.get('mode');
    const urlType = searchParams.get('type');

    if (urlMode === 'login') {
      setMode('login');
    } else if (urlMode === 'register') {
      if (urlType === 'provider') {
        setMode('register-provider');
        setRegisterData(prev => ({ ...prev, accountType: 'provider' }));
      } else {
        setMode('register-client');
        setRegisterData(prev => ({ ...prev, accountType: 'client' }));
      }
    }
  }, [searchParams]);

  // Redirect if already logged in
  useEffect(() => {
    if (isAuthenticated) {
      const redirect = searchParams.get('redirect');
      navigate(redirect || '/');
    }
  }, [isAuthenticated, navigate, searchParams]);

  // 🔥 Firebase Login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await signInWithEmailAndPassword(auth, loginData.email, loginData.password);
      
      showToast('Logowanie pomyślne! Witaj z powrotem!', 'success');
      const redirect = searchParams.get('redirect');
      navigate(redirect || '/');
    } catch (err: any) {
      console.error('Login error:', err);
      
      // Obsługa błędów Firebase
      let errorMessage = 'Nieprawidłowy email lub hasło';
      switch (err.code) {
        case 'auth/user-not-found':
          errorMessage = 'Nie znaleziono użytkownika z tym adresem email';
          break;
        case 'auth/wrong-password':
          errorMessage = 'Nieprawidłowe hasło';
          break;
        case 'auth/invalid-credential':
          errorMessage = 'Nieprawidłowy email lub hasło';
          break;
        case 'auth/too-many-requests':
          errorMessage = 'Zbyt wiele nieudanych prób. Spróbuj ponownie później';
          break;
        case 'auth/user-disabled':
          errorMessage = 'To konto zostało zablokowane';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Nieprawidłowy format adresu email';
          break;
      }
      
      setError(errorMessage);
      showToast('Błąd logowania', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // 🔥 Firebase Register
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!registerData.terms) {
      setError('Musisz zaakceptować regulamin!');
      return;
    }

    // Walidacja imienia i nazwiska (minimum 2 wyrazy)
    const nameParts = registerData.username.trim().split(/\s+/);
    if (nameParts.length < 2 || nameParts.some(part => part.length < 2)) {
      setError('Podaj pełne imię i nazwisko (np. Jan Kowalski)');
      return;
    }

    // Walidacja numeru telefonu
    const phoneValidation = validatePhoneNumber(registerData.phoneCountryCode, registerData.phone);
    if (!phoneValidation.valid) {
      setError(phoneValidation.message);
      return;
    }

    // Walidacja hasła
    if (registerData.password.length < 8) {
      setError('Hasło musi mieć co najmniej 8 znaków');
      return;
    }

    if (!/[A-Z]/.test(registerData.password)) {
      setError('Hasło musi zawierać co najmniej jedną wielką literę');
      return;
    }

    if (!/[a-z]/.test(registerData.password)) {
      setError('Hasło musi zawierać co najmniej jedną małą literę');
      return;
    }

    if (!/[0-9]/.test(registerData.password)) {
      setError('Hasło musi zawierać co najmniej jedną cyfrę');
      return;
    }

    if (registerData.password !== registerData.confirmPassword) {
      setError('Hasła nie są takie same');
      return;
    }

    setIsLoading(true);

    try {
      // 1. Tworzenie użytkownika w Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(
        auth, 
        registerData.email, 
        registerData.password
      );

      const user = userCredential.user;

      // 2. Aktualizacja profilu (displayName)
      await updateProfile(user, {
        displayName: registerData.username
      });

      // Formatuj numer telefonu z kodem kraju
      const phoneDigits = registerData.phone.replace(/\D/g, '');
      const formattedPhone = `${registerData.phoneCountryCode} ${phoneDigits}`;

      // 3. Zapisanie dodatkowych danych w Firestore
      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        username: registerData.username,
        email: registerData.email,
        phone: formattedPhone,
        accountType: registerData.accountType,
        businessName: registerData.businessName || null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        // Dodatkowe pola dla usługodawców
        ...(registerData.accountType === 'provider' && {
          isVerified: false,
          rating: 0,
          reviewsCount: 0,
          servicesCount: 0,
        })
      });

      showToast('Konto utworzone pomyślnie! Witamy w ToMyHomeApp!', 'success');
      
      // Redirect based on account type
      if (registerData.accountType === 'provider') {
        navigate('/biznes/dodaj-usluge');
      } else {
        navigate('/');
      }
    } catch (err: any) {
      console.error('Registration error:', err);
      
      // Obsługa błędów Firebase
      let errorMessage = 'Błąd podczas rejestracji';
      switch (err.code) {
        case 'auth/email-already-in-use':
          errorMessage = 'Ten adres email jest już zajęty';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Nieprawidłowy format adresu email';
          break;
        case 'auth/weak-password':
          errorMessage = 'Hasło jest zbyt słabe';
          break;
        case 'auth/operation-not-allowed':
          errorMessage = 'Rejestracja jest tymczasowo niedostępna';
          break;
      }
      
      setError(errorMessage);
      showToast('Błąd rejestracji', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // ==================== SELECTION SCREEN ====================
  if (mode === 'select') {
    return (
      <div className="min-h-screen py-12 px-6 flex items-center justify-center">
        <div className="max-w-lg w-full">
          <div className="text-center mb-8">
            <div className="flex justify-center gap-4 mb-6">
              <div className="text-5xl">🔍</div>
              <div className="text-5xl">💇</div>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-3">
              Witaj w ToMyHomeApp
            </h1>
            <p className="text-gray-600">
              Znajdź specjalistów beauty lub oferuj swoje usługi
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-8">
            {/* Login Button */}
            <button
              onClick={() => setMode('login')}
              className="w-full py-4 bg-gradient-to-r from-primary to-secondary text-white rounded-xl font-bold text-lg hover:shadow-lg transition-all mb-6"
            >
              ZALOGUJ SIĘ
            </button>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500">Nie masz konta? Zarejestruj się jako</span>
              </div>
            </div>

            {/* Register Options */}
            <div className="space-y-4">
              <button
                onClick={() => {
                  setMode('register-client');
                  setRegisterData(prev => ({ ...prev, accountType: 'client' }));
                }}
                className="w-full py-4 border-2 border-primary text-primary rounded-xl font-bold text-lg hover:bg-primary hover:text-white transition-all flex items-center justify-center gap-3"
              >
                <User className="w-6 h-6" />
                DLA KLIENTA
              </button>
              <p className="text-center text-sm text-gray-500">
                Szukasz fryzjera, kosmetyczki lub masażysty?
              </p>

              <button
                onClick={() => {
                  setMode('register-provider');
                  setRegisterData(prev => ({ ...prev, accountType: 'provider' }));
                }}
                className="w-full py-4 border-2 border-emerald-500 text-emerald-600 rounded-xl font-bold text-lg hover:bg-emerald-500 hover:text-white transition-all flex items-center justify-center gap-3"
              >
                <Briefcase className="w-6 h-6" />
                DLA USŁUGODAWCY
              </button>
              <p className="text-center text-sm text-gray-500">
                Oferujesz usługi beauty i chcesz zdobywać klientów?
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ==================== LOGIN SCREEN ====================
  if (mode === 'login') {
    return (
      <div className="min-h-screen py-12 px-6 flex items-center justify-center">
        <div className="max-w-md w-full">
          <button
            onClick={() => setMode('select')}
            className="flex items-center gap-2 text-gray-600 hover:text-primary mb-6 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Wróć
          </button>

          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Zaloguj się</h1>
              <p className="text-gray-600">Wpisz swoje dane logowania</p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm flex items-start gap-2">
                <span>⚠️</span>
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={loginData.email}
                  onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                  placeholder="twoj@email.com"
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-primary focus:ring-0 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hasło
                </label>
                <div className="relative">
                  <input
                    type={showLoginPassword ? 'text' : 'password'}
                    value={loginData.password}
                    onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                    placeholder="••••••••"
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-primary focus:ring-0 focus:outline-none"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showLoginPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div className="flex justify-end">
                <Link to="/reset-hasla" className="text-sm text-primary hover:underline">
                  Zapomniałeś hasła?
                </Link>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-4 bg-gradient-to-r from-primary to-secondary text-white rounded-xl font-bold text-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                    Logowanie...
                  </>
                ) : (
                  'ZALOGUJ SIĘ'
                )}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-gray-600">
                Nie masz konta?{' '}
                <button
                  onClick={() => setMode('select')}
                  className="text-primary font-semibold hover:underline"
                >
                  Zarejestruj się
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ==================== REGISTER SCREEN ====================
  const isProvider = mode === 'register-provider';

  return (
    <div className="min-h-screen py-12 px-6 flex items-center justify-center">
      <div className="max-w-md w-full">
        <button
          onClick={() => setMode('select')}
          className="flex items-center gap-2 text-gray-600 hover:text-primary mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Wróć
        </button>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${
              isProvider ? 'bg-emerald-100' : 'bg-primary/10'
            }`}>
              {isProvider ? (
                <Briefcase className="w-8 h-8 text-emerald-600" />
              ) : (
                <User className="w-8 h-8 text-primary" />
              )}
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {isProvider ? 'Rejestracja usługodawcy' : 'Rejestracja klienta'}
            </h1>
            <p className="text-gray-600">
              {isProvider 
                ? 'Dołącz i zacznij zdobywać klientów'
                : 'Załóż konto i rezerwuj usługi'}
            </p>
          </div>

          {/* Benefits */}
          <div className={`mb-6 p-4 rounded-xl ${isProvider ? 'bg-emerald-50' : 'bg-primary/5'}`}>
            <p className="font-semibold mb-2 text-sm">
              {isProvider ? '✨ Korzyści dla usługodawcy:' : '✨ Korzyści dla klienta:'}
            </p>
            <ul className="text-sm space-y-1">
              {isProvider ? (
                <>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-500" /> Własny profil i portfolio</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-500" /> Zarządzanie rezerwacjami online</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-500" /> Dostęp do nowych klientów</li>
                </>
              ) : (
                <>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-primary" /> Łatwe rezerwacje online</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-primary" /> Historia wizyt i ulubieni</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-primary" /> Powiadomienia i przypomnienia</li>
                </>
              )}
            </ul>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm flex items-start gap-2">
              <span>⚠️</span>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-4">
            {isProvider && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nazwa firmy / salonu
                </label>
                <input
                  type="text"
                  value={registerData.businessName}
                  onChange={(e) => setRegisterData({ ...registerData, businessName: e.target.value })}
                  placeholder="np. Beauty Studio Anna"
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-emerald-500 focus:ring-0 focus:outline-none"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Imię i nazwisko
              </label>
              <input
                type="text"
                value={registerData.username}
                onChange={(e) => setRegisterData({ ...registerData, username: e.target.value })}
                placeholder="Jan Kowalski"
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-primary focus:ring-0 focus:outline-none"
                required
              />
              <p className="text-xs text-gray-500 mt-1">Wpisz imię i nazwisko</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                value={registerData.email}
                onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                placeholder="twoj@email.com"
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-primary focus:ring-0 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Numer telefonu
              </label>
              <PhoneInput
                value={registerData.phone}
                countryCode={registerData.phoneCountryCode}
                onChange={(phone, countryCode) => setRegisterData({ 
                  ...registerData, 
                  phone, 
                  phoneCountryCode: countryCode 
                })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Hasło
              </label>
              <div className="relative">
                <input
                  type={showRegisterPassword ? 'text' : 'password'}
                  value={registerData.password}
                  onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                  placeholder="Wprowadź hasło"
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-primary focus:ring-0 focus:outline-none"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowRegisterPassword(!showRegisterPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                >
                  {showRegisterPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              <div className="mt-2 text-xs text-gray-500 space-y-1">
                <p className={registerData.password.length >= 8 ? 'text-green-600' : ''}>
                  {registerData.password.length >= 8 ? '✓' : '○'} Minimum 8 znaków
                </p>
                <p className={/[A-Z]/.test(registerData.password) ? 'text-green-600' : ''}>
                  {/[A-Z]/.test(registerData.password) ? '✓' : '○'} Co najmniej jedna wielka litera (A-Z)
                </p>
                <p className={/[a-z]/.test(registerData.password) ? 'text-green-600' : ''}>
                  {/[a-z]/.test(registerData.password) ? '✓' : '○'} Co najmniej jedna mała litera (a-z)
                </p>
                <p className={/[0-9]/.test(registerData.password) ? 'text-green-600' : ''}>
                  {/[0-9]/.test(registerData.password) ? '✓' : '○'} Co najmniej jedna cyfra (0-9)
                </p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Powtórz hasło
              </label>
              <input
                type="password"
                value={registerData.confirmPassword}
                onChange={(e) => setRegisterData({ ...registerData, confirmPassword: e.target.value })}
                placeholder="Powtórz hasło"
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-primary focus:ring-0 focus:outline-none"
                required
              />
              {registerData.confirmPassword && (
                <p className={`text-xs mt-1 ${registerData.password === registerData.confirmPassword ? 'text-green-600' : 'text-red-500'}`}>
                  {registerData.password === registerData.confirmPassword ? '✓ Hasła są zgodne' : '✗ Hasła nie są zgodne'}
                </p>
              )}
            </div>

            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                id="terms"
                checked={registerData.terms}
                onChange={(e) => setRegisterData({ ...registerData, terms: e.target.checked })}
                className="mt-1 w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary"
              />
              <label htmlFor="terms" className="text-sm text-gray-600">
                Akceptuję{' '}
                <Link to="/regulamin" className="text-primary hover:underline">
                  Regulamin
                </Link>{' '}
                oraz{' '}
                <Link to="/prywatnosc" className="text-primary hover:underline">
                  Politykę Prywatności
                </Link>
              </label>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-4 text-white rounded-xl font-bold text-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center ${
                isProvider
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-600'
                  : 'bg-gradient-to-r from-primary to-secondary'
              }`}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  Rejestracja...
                </>
              ) : (
                'ZAREJESTRUJ SIĘ'
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Masz już konto?{' '}
              <button
                onClick={() => setMode('login')}
                className="text-primary font-semibold hover:underline"
              >
                Zaloguj się
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;