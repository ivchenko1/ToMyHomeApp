import { Routes, Route } from 'react-router-dom';
import { useState, useEffect, createContext, useContext } from 'react';

// 🔥 Firebase imports
import { onAuthStateChanged, signOut, User as FirebaseUser } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from './firebase';

// Client Pages
import HomePage from './pages/HomePage';
import AuthPage from './pages/AuthPage';
import ProfilePage from './pages/ProfilePage';
import ProvidersPage from './pages/ProvidersPage';
import ProviderDetailPage from './pages/ProviderDetailPage';
import MessagesPage from './pages/MessagesPage';
import NotificationsPage from './pages/NotificationsPage';
import ContactPage from './pages/ContactPage';

// Business Pages
import BusinessLayout from './components/business/BusinessLayout';
import BusinessDashboard from './pages/business/BusinessDashboard';
import BusinessServices from './pages/business/BusinessServices';
import BusinessAddService from './pages/business/BusinessAddService';
import BusinessCalendar from './pages/business/BusinessCalendar';
import BusinessStatistics from './pages/business/BusinessStatistics';
import BusinessMessages from './pages/business/BusinessMessages';
import BusinessSettings from './pages/business/BusinessSettings';

// Shared Components
import Header from './components/Header';
import Footer from './components/Footer';
import Toast from './components/Toast';
import AnimatedBackground from './components/AnimatedBackground';

import { User, ToastMessage } from './types';

// ==================== TYPES ====================
interface UserData {
  uid: string;
  username: string;
  email: string;
  phone: string;
  accountType: 'client' | 'provider';
  businessName?: string;
  avatar?: string;
  createdAt: string;
  updatedAt?: string;
  isVerified?: boolean;
  rating?: number;
  reviewsCount?: number;
}

// ==================== AUTH CONTEXT ====================
interface AuthContextType {
  user: User | null;
  userData: UserData | null;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  login: (user: User) => void;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  userData: null,
  firebaseUser: null,
  loading: true,
  login: () => {},
  logout: async () => {},
  isAuthenticated: false,
});

// ==================== TOAST CONTEXT ====================
interface ToastContextType {
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
}

export const ToastContext = createContext<ToastContextType>({
  showToast: () => {},
});

export const useAuth = () => useContext(AuthContext);
export const useToast = () => useContext(ToastContext);

// ==================== CLIENT LAYOUT ====================
const ClientLayout = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <AnimatedBackground />
      <Header />
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/profil" element={<ProfilePage />} />
          <Route path="/uslugodawcy/profil/:id" element={<ProviderDetailPage />} />
          <Route path="/uslugodawcy/:category" element={<ProvidersPage />} />
          <Route path="/uslugodawcy" element={<ProvidersPage />} />
          <Route path="/wiadomosci" element={<MessagesPage />} />
          <Route path="/powiadomienia" element={<NotificationsPage />} />
          <Route path="/kontakt" element={<ContactPage />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
};

// ==================== LOADING SCREEN ====================
const LoadingScreen = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="text-center">
      <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
      <p className="text-gray-500">Ładowanie...</p>
    </div>
  </div>
);

// ==================== MAIN APP ====================
function App() {
  // Firebase user state
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  // Legacy user state (для совместимости с существующим кодом)
  const [user, setUser] = useState<User | null>(null);

  // Toast state
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // 🔥 Firebase Auth State Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setFirebaseUser(currentUser);

      if (currentUser) {
        try {
          // Pobierz dane użytkownika z Firestore
          const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
          
          if (userDoc.exists()) {
            const firestoreData = userDoc.data() as UserData;
            setUserData(firestoreData);

            // Konwertuj na format User (dla kompatybilności)
            const legacyUser: User = {
              id: currentUser.uid,
              email: currentUser.email || firestoreData.email,
              username: firestoreData.username || currentUser.displayName || '',
              phone: firestoreData.phone || '',
              accountType: firestoreData.accountType || 'client',
              businessName: firestoreData.businessName,
              avatar: firestoreData.avatar || currentUser.photoURL || undefined,
            };
            setUser(legacyUser);
          } else {
            // Użytkownik w Auth ale bez dokumentu Firestore
            // Utwórz podstawowy obiekt user
            const basicUser: User = {
              id: currentUser.uid,
              email: currentUser.email || '',
              username: currentUser.displayName || '',
              phone: '',
              accountType: 'client',
            };
            setUser(basicUser);
            setUserData(null);
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
          setUserData(null);
        }
      } else {
        // Użytkownik wylogowany
        setUser(null);
        setUserData(null);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Legacy login function (для совместимости)
  const login = (userData: User) => {
    setUser(userData);
  };

  // 🔥 Firebase logout
  const logout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      setUserData(null);
      setFirebaseUser(null);
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  };

  // Toast functions
  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3000);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // Pokaż loading screen podczas sprawdzania autoryzacji
  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <AuthContext.Provider value={{ 
      user, 
      userData,
      firebaseUser,
      loading,
      login, 
      logout, 
      isAuthenticated: !!firebaseUser 
    }}>
      <ToastContext.Provider value={{ showToast }}>
        <Routes>
          {/* Business Panel Routes */}
          <Route path="/biznes" element={<BusinessLayout />}>
            <Route index element={<BusinessDashboard />} />
            <Route path="uslugi" element={<BusinessServices />} />
            <Route path="dodaj-usluge" element={<BusinessAddService />} />
            <Route path="kalendarz" element={<BusinessCalendar />} />
            <Route path="wiadomosci" element={<BusinessMessages />} />
            <Route path="statystyki" element={<BusinessStatistics />} />
            <Route path="profil" element={<BusinessSettings />} />
            <Route path="ustawienia" element={<BusinessSettings />} />
            <Route path="pomoc" element={<BusinessDashboard />} />
          </Route>
          
          {/* Client Routes */}
          <Route path="/*" element={<ClientLayout />} />
        </Routes>
        
        {/* Toast notifications */}
        <div className="fixed bottom-8 right-8 z-50 flex flex-col gap-3">
          {toasts.map(toast => (
            <Toast
              key={toast.id}
              message={toast.message}
              type={toast.type}
              onClose={() => removeToast(toast.id)}
            />
          ))}
        </div>
      </ToastContext.Provider>
    </AuthContext.Provider>
  );
}

export default App;