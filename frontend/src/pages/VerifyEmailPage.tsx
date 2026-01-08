import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Mail, RefreshCw, CheckCircle, ArrowLeft, Loader2 } from 'lucide-react';
import { sendEmailVerification, signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';
import { useToast } from '../App';

const VerifyEmailPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { showToast } = useToast();
  
  const email = searchParams.get('email') || '';
  const [resending, setResending] = useState(false);
  const [checking, setChecking] = useState(false);
  const [countdown, setCountdown] = useState(0);

  // Countdown dla przycisku "Wyślij ponownie"
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  // Wyślij ponownie email weryfikacyjny
  const resendEmail = async () => {
    if (countdown > 0) return;
    
    const password = sessionStorage.getItem('temp_password');
    if (!password) {
      showToast('Zaloguj się ponownie aby wysłać email weryfikacyjny', 'error');
      navigate('/auth?mode=login');
      return;
    }

    setResending(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      await sendEmailVerification(userCredential.user, {
        url: window.location.origin + '/#/auth?mode=login&verified=true',
        handleCodeInApp: false,
      });
      await auth.signOut();
      
      showToast('Email weryfikacyjny wysłany ponownie!', 'success');
      setCountdown(60); // Blokuj na 60 sekund
    } catch (error: any) {
      console.error('Resend error:', error);
      if (error.code === 'auth/too-many-requests') {
        showToast('Zbyt wiele prób. Poczekaj chwilę.', 'error');
        setCountdown(120);
      } else {
        showToast('Nie udało się wysłać emaila', 'error');
      }
    } finally {
      setResending(false);
    }
  };

  // Sprawdź czy email został zweryfikowany
  const checkVerification = async () => {
    const password = sessionStorage.getItem('temp_password');
    if (!password) {
      showToast('Zaloguj się ponownie', 'info');
      navigate('/auth?mode=login');
      return;
    }

    setChecking(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      // Odśwież dane użytkownika
      await userCredential.user.reload();
      
      if (userCredential.user.emailVerified) {
        sessionStorage.removeItem('temp_password');
        showToast('Email zweryfikowany! Witamy!', 'success');
        navigate('/');
      } else {
        await auth.signOut();
        showToast('Email jeszcze nie został zweryfikowany. Sprawdź skrzynkę.', 'info');
      }
    } catch (error) {
      console.error('Check verification error:', error);
      showToast('Błąd sprawdzania. Spróbuj się zalogować.', 'error');
      navigate('/auth?mode=login');
    } finally {
      setChecking(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        {/* Logo / Powrót */}
        <button
          onClick={() => navigate('/auth?mode=login')}
          className="flex items-center gap-2 text-gray-600 hover:text-primary mb-8 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Powrót do logowania
        </button>

        {/* Główna karta */}
        <div className="bg-white rounded-3xl shadow-xl p-8 text-center">
          {/* Ikona */}
          <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Mail className="w-10 h-10 text-emerald-600" />
          </div>

          {/* Nagłówek */}
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Sprawdź swoją skrzynkę
          </h1>
          <p className="text-gray-600 mb-6">
            Wysłaliśmy link weryfikacyjny na adres:
          </p>

          {/* Email */}
          <div className="bg-gray-50 rounded-xl py-3 px-4 mb-6">
            <p className="font-semibold text-gray-900">{email}</p>
          </div>

          {/* Instrukcje */}
          <div className="text-left bg-emerald-50 rounded-xl p-4 mb-6">
            <p className="text-sm text-emerald-800 mb-2 font-medium">Co dalej?</p>
            <ol className="text-sm text-emerald-700 space-y-1 list-decimal list-inside">
              <li>Otwórz skrzynkę email</li>
              <li>Znajdź wiadomość od ToMyHomeApp</li>
              <li>Kliknij link weryfikacyjny</li>
              <li>Wróć tutaj i kliknij "Sprawdź weryfikację"</li>
            </ol>
          </div>

          {/* Przyciski */}
          <div className="space-y-3">
            <button
              onClick={checkVerification}
              disabled={checking}
              className="w-full py-3 bg-emerald-500 text-white rounded-xl font-semibold hover:bg-emerald-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {checking ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Sprawdzanie...
                </>
              ) : (
                <>
                  <CheckCircle className="w-5 h-5" />
                  Sprawdź weryfikację
                </>
              )}
            </button>

            <button
              onClick={resendEmail}
              disabled={resending || countdown > 0}
              className="w-full py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {resending ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Wysyłanie...
                </>
              ) : countdown > 0 ? (
                <>
                  <RefreshCw className="w-5 h-5" />
                  Wyślij ponownie ({countdown}s)
                </>
              ) : (
                <>
                  <RefreshCw className="w-5 h-5" />
                  Wyślij ponownie
                </>
              )}
            </button>
          </div>

          {/* Podpowiedź */}
          <p className="text-xs text-gray-500 mt-6">
            Nie widzisz maila? Sprawdź folder SPAM lub poczekaj chwilę.
          </p>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmailPage;
