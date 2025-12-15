// src/pages/ProfilePage.tsx
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Home,
  Gift,
  Heart,
  Wallet,
  Calendar,
  Settings,
  HelpCircle,
  LogOut,
  Camera,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Eye,
  EyeOff,
  Lock,
  Save,
  X,
} from 'lucide-react';
import { useAuth, useToast } from '../App';
import PhoneInput, { validatePhoneNumber } from '../components/PhoneInput';
import { 
  updateUserProfile, 
  uploadAvatar, 
  changePassword,
  deleteUserAccount 
} from '../services/userService';

type SectionType =
  | 'dashboard'
  | 'referral'
  | 'favorites'
  | 'wallet'
  | 'visits'
  | 'settings'
  | 'help';

const ProfilePage = () => {
  const navigate = useNavigate();
  const { user, userData, isAuthenticated, logout } = useAuth();
  const { showToast } = useToast();
  const [activeSection, setActiveSection] = useState<SectionType>('dashboard');
  const [currentMonth, setCurrentMonth] = useState(new Date());

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/auth');
    }
  }, [isAuthenticated, navigate]);

  const menuItems = [
    { id: 'dashboard', label: 'Panel Główny', icon: Home },
    { id: 'referral', label: 'Poleć znajomym', icon: Gift },
    { id: 'favorites', label: 'Ulubione', icon: Heart },
    { id: 'wallet', label: 'Portfel', icon: Wallet },
    { id: 'visits', label: 'Moje wizyty', icon: Calendar },
    { id: 'settings', label: 'Ustawienia', icon: Settings },
    { id: 'help', label: 'Pomoc', icon: HelpCircle },
  ];

  const handleLogout = async () => {
    if (window.confirm('Czy na pewno chcesz się wylogować?')) {
      try {
        await logout();
        showToast('Wylogowano pomyślnie', 'success');
        navigate('/');
      } catch (error) {
        showToast('Błąd wylogowania', 'error');
      }
    }
  };

  // Calendar functions
  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    const day = new Date(date.getFullYear(), date.getMonth(), 1).getDay();
    return day === 0 ? 6 : day - 1;
  };

  const monthNames = [
    'Styczeń', 'Luty', 'Marzec', 'Kwiecień', 'Maj', 'Czerwiec',
    'Lipiec', 'Sierpień', 'Wrzesień', 'Październik', 'Listopad', 'Grudzień',
  ];

  const renderCalendar = () => {
    const days = getDaysInMonth(currentMonth);
    const firstDay = getFirstDayOfMonth(currentMonth);
    const today = new Date();
    const dayNames = ['Pn', 'Wt', 'Śr', 'Cz', 'Pt', 'Sb', 'Nd'];

    return (
      <div className="bg-white rounded-xl border-2 border-gray-100 p-6">
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
          <button
            onClick={() =>
              setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))
            }
            className="p-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <div className="font-bold text-lg">
            {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
          </div>
          <button
            onClick={() =>
              setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))
            }
            className="p-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-7 gap-2 text-center">
          {dayNames.map((day) => (
            <div key={day} className="font-semibold text-gray-500 text-sm py-2">
              {day}
            </div>
          ))}
          {[...Array(firstDay)].map((_, i) => (
            <div key={`empty-${i}`} />
          ))}
          {[...Array(days)].map((_, i) => {
            const day = i + 1;
            const isToday =
              day === today.getDate() &&
              currentMonth.getMonth() === today.getMonth() &&
              currentMonth.getFullYear() === today.getFullYear();

            return (
              <div
                key={day}
                className={`py-3 rounded-lg cursor-pointer transition-all hover:scale-110 ${
                  isToday
                    ? 'bg-primary text-white font-bold'
                    : 'bg-gray-50 hover:bg-gray-100'
                }`}
              >
                {day}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return (
          <div>
            <div className="bg-gradient-to-r from-primary to-secondary text-white rounded-2xl p-8 mb-8">
              <h2 className="text-2xl font-bold mb-2">Witaj z powrotem, {user?.username || userData?.username}!</h2>
              <p className="opacity-90">
                Miło Cię widzieć. Oto Twój panel użytkownika gdzie możesz zarządzać swoim kontem i
                rezerwacjami.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <div className="card p-6 text-center">
                <div className="text-4xl font-bold text-gray-900 mb-2">0</div>
                <div className="text-gray-500">Nadchodzących wizyt</div>
              </div>
              <div className="card p-6 text-center">
                <div className="text-4xl font-bold text-gray-900 mb-2">0</div>
                <div className="text-gray-500">Ulubionych miejsc</div>
              </div>
              <div className="card p-6 text-center">
                <div className="text-4xl font-bold text-gray-900 mb-2">0 zł</div>
                <div className="text-gray-500">W portfelu</div>
              </div>
            </div>
          </div>
        );

      case 'referral':
        return (
          <div>
            <div className="bg-gradient-to-r from-primary to-secondary text-white rounded-2xl p-8 mb-8">
              <h2 className="text-2xl font-bold mb-4">Zapraszaj i zarabiaj!</h2>
              <p className="text-lg opacity-95">
                Każdy polecony znajomy to <strong>50 zł</strong> na Twoje konto!
              </p>
            </div>

            <div className="bg-gray-50 rounded-xl p-8">
              <h3 className="font-bold text-lg mb-4">Twój unikalny link:</h3>
              <div className="flex gap-4">
                <input
                  type="text"
                  readOnly
                  value={`https://tomyhomeapp.pl/ref/${user?.id || 'user'}`}
                  className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl bg-white"
                />
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(
                      `https://tomyhomeapp.pl/ref/${user?.id || 'user'}`
                    );
                    showToast('Link skopiowany!', 'success');
                  }}
                  className="btn btn-primary"
                >
                  Kopiuj
                </button>
              </div>
            </div>
          </div>
        );

      case 'favorites':
        return (
          <div className="text-center py-16">
            <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Nie masz jeszcze ulubionych miejsc.</p>
          </div>
        );

      case 'wallet':
        return (
          <div className="bg-gradient-to-r from-emerald-500 to-green-400 text-white rounded-2xl p-8">
            <h2 className="text-xl mb-2">Dostępne środki</h2>
            <div className="text-5xl font-bold mb-6">0.00 zł</div>
            <button
              onClick={() => showToast('Funkcja w budowie', 'info')}
              className="btn bg-white text-emerald-600 font-bold"
            >
              Doładuj
            </button>
          </div>
        );

      case 'visits':
        return (
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <h3 className="font-bold text-lg mb-4">Kalendarz wizyt</h3>
              {renderCalendar()}
            </div>
            <div>
              <h3 className="font-bold text-lg mb-4">Nadchodzące wizyty</h3>
              <p className="text-gray-500">Brak nadchodzących wizyt.</p>
            </div>
          </div>
        );

      case 'settings':
        return (
          <SettingsSection />
        );

      case 'help':
        return (
          <div className="card p-8">
            <h3 className="text-xl font-bold mb-4">Centrum Pomocy</h3>
            <p className="text-gray-600 mb-4">
              Masz pytania? Skontaktuj się z nami!
            </p>
            <p className="text-primary font-semibold">pomoc@tomyhomeapp.pl</p>
          </div>
        );

      default:
        return null;
    }
  };

  // ==================== SETTINGS SECTION ====================
  const SettingsSection = () => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    
    // Parsuj numer telefonu
    const parsePhoneNumber = (phone: string | undefined) => {
      if (!phone) return { countryCode: '+48', number: '' };
      const match = phone.match(/^(\+\d{1,3})\s?(.*)$/);
      if (match) {
        return { countryCode: match[1], number: match[2] };
      }
      return { countryCode: '+48', number: phone };
    };

    const parsedPhone = parsePhoneNumber(userData?.phone || user?.phone);
    
    // Form state
    const [formData, setFormData] = useState({
      username: userData?.username || user?.username || '',
      phone: parsedPhone.number,
      phoneCountryCode: parsedPhone.countryCode,
      businessName: userData?.businessName || '',
    });
    
    const [avatarUrl, setAvatarUrl] = useState(userData?.avatar || user?.avatar || '');
    const [saving, setSaving] = useState(false);
    const [uploadingAvatar, setUploadingAvatar] = useState(false);
    
    // Password change state
    const [showPasswordForm, setShowPasswordForm] = useState(false);
    const [passwordData, setPasswordData] = useState({
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    });
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [changingPassword, setChangingPassword] = useState(false);

    // Handle avatar upload
    const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file || !user?.id) return;

      setUploadingAvatar(true);
      try {
        const newAvatarUrl = await uploadAvatar(user.id, file);
        setAvatarUrl(newAvatarUrl);
        showToast('Zdjęcie zostało zmienione!', 'success');
      } catch (error: any) {
        showToast(error.message || 'Błąd przesyłania zdjęcia', 'error');
      } finally {
        setUploadingAvatar(false);
      }
    };

    // Handle profile form submit
    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      
      // Walidacja imienia i nazwiska
      const nameParts = formData.username.trim().split(/\s+/);
      if (nameParts.length < 2 || nameParts.some((part: string) => part.length < 2)) {
        showToast('Podaj pełne imię i nazwisko (np. Jan Kowalski)', 'error');
        return;
      }
      
      // Walidacja telefonu
      const phoneValidation = validatePhoneNumber(formData.phoneCountryCode, formData.phone);
      if (!phoneValidation.valid) {
        showToast(phoneValidation.message, 'error');
        return;
      }

      if (!user?.id) return;

      setSaving(true);
      try {
        const formattedPhone = `${formData.phoneCountryCode} ${formData.phone.replace(/\D/g, '')}`;
        
        // Przygotuj dane do aktualizacji (bez pustych wartości)
        const updateData: Record<string, string> = {
          username: formData.username,
          phone: formattedPhone,
        };
        
        // Dodaj businessName tylko jeśli nie jest pusty
        if (formData.businessName && formData.businessName.trim()) {
          updateData.businessName = formData.businessName.trim();
        }
        
        await updateUserProfile(user.id, updateData);
        
        showToast('Zmiany zostały zapisane!', 'success');
      } catch (error: any) {
        showToast(error.message || 'Błąd zapisywania zmian', 'error');
      } finally {
        setSaving(false);
      }
    };

    // Handle password change
    const handlePasswordChange = async (e: React.FormEvent) => {
      e.preventDefault();

      if (passwordData.newPassword !== passwordData.confirmPassword) {
        showToast('Hasła nie są zgodne', 'error');
        return;
      }

      if (passwordData.newPassword.length < 8) {
        showToast('Hasło musi mieć co najmniej 8 znaków', 'error');
        return;
      }

      setChangingPassword(true);
      try {
        await changePassword(passwordData.currentPassword, passwordData.newPassword);
        showToast('Hasło zostało zmienione!', 'success');
        setShowPasswordForm(false);
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      } catch (error: any) {
        showToast(error.message || 'Błąd zmiany hasła', 'error');
      } finally {
        setChangingPassword(false);
      }
    };

    // Handle account deletion
    const handleDeleteAccount = async () => {
      const password = window.prompt('Aby usunąć konto, wpisz swoje hasło:');
      if (password === null) return;
      
      if (!password || password.length < 8) {
        showToast('Nieprawidłowe hasło', 'error');
        return;
      }
      
      if (!window.confirm('UWAGA: Czy na pewno chcesz usunąć swoje konto? Ta operacja jest nieodwracalna!')) {
        return;
      }

      try {
        await deleteUserAccount(password);
        showToast('Konto zostało usunięte', 'info');
        navigate('/');
      } catch (error: any) {
        showToast(error.message || 'Błąd usuwania konta', 'error');
      }
    };

    return (
      <div className="max-w-2xl space-y-6">
        {/* Avatar */}
        <div className="card p-8">
          <h3 className="font-bold text-lg mb-6">Zdjęcie profilowe</h3>
          <div className="flex items-center gap-6">
            <div className="relative">
              <div className="w-24 h-24 rounded-full overflow-hidden bg-gradient-to-r from-primary to-secondary flex items-center justify-center text-white text-3xl">
                {uploadingAvatar ? (
                  <Loader2 className="w-8 h-8 animate-spin" />
                ) : avatarUrl ? (
                  <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  '👤'
                )}
              </div>
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingAvatar}
                className="absolute bottom-0 right-0 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-100 transition-colors disabled:opacity-50"
              >
                <Camera className="w-4 h-4 text-gray-600" />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
              />
            </div>
            <div>
              <p className="text-gray-600 text-sm">
                Kliknij ikonę aparatu aby zmienić zdjęcie.
              </p>
              <p className="text-gray-400 text-xs mt-1">
                Max 5MB, formaty: JPG, PNG, GIF
              </p>
            </div>
          </div>
        </div>

        {/* Dane osobowe */}
        <div className="card p-8">
          <h3 className="font-bold text-lg mb-6">Dane osobowe</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-gray-500 mb-2">Imię i Nazwisko</label>
              <input
                type="text"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                placeholder="Jan Kowalski"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary focus:ring-0 focus:outline-none"
              />
              <p className="text-xs text-gray-500 mt-1">Wpisz imię i nazwisko</p>
            </div>
            
            <div>
              <label className="block text-sm text-gray-500 mb-2">Email</label>
              <input
                type="email"
                value={userData?.email || user?.email || ''}
                readOnly
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl bg-gray-50 text-gray-500"
              />
              <p className="text-xs text-gray-400 mt-1">Email nie może być zmieniony</p>
            </div>
            
            <div>
              <label className="block text-sm text-gray-500 mb-2">Telefon</label>
              <PhoneInput
                value={formData.phone}
                countryCode={formData.phoneCountryCode}
                onChange={(phone, code) => {
                  setFormData({ ...formData, phone, phoneCountryCode: code });
                }}
              />
            </div>

            {(userData?.accountType === 'provider' || user?.accountType === 'provider') && (
              <div>
                <label className="block text-sm text-gray-500 mb-2">Nazwa firmy / salonu</label>
                <input
                  type="text"
                  value={formData.businessName}
                  onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                  placeholder="np. Beauty Studio Anna"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary focus:ring-0 focus:outline-none"
                />
              </div>
            )}

            <button
              type="submit"
              disabled={saving}
              className="btn btn-primary mt-4 flex items-center gap-2"
            >
              {saving ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Zapisywanie...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Zapisz zmiany
                </>
              )}
            </button>
          </form>
        </div>

        {/* Zmiana hasła */}
        <div className="card p-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-lg">Zmiana hasła</h3>
            <button
              onClick={() => setShowPasswordForm(!showPasswordForm)}
              className="text-primary hover:underline text-sm font-medium"
            >
              {showPasswordForm ? 'Anuluj' : 'Zmień hasło'}
            </button>
          </div>

          {showPasswordForm ? (
            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-500 mb-2">Obecne hasło</label>
                <div className="relative">
                  <input
                    type={showCurrentPassword ? 'text' : 'password'}
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                    placeholder="••••••••"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary focus:ring-0 focus:outline-none"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showCurrentPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-500 mb-2">Nowe hasło</label>
                <div className="relative">
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                    placeholder="••••••••"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary focus:ring-0 focus:outline-none"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                <div className="mt-2 text-xs text-gray-500 space-y-1">
                  <p className={passwordData.newPassword.length >= 8 ? 'text-green-600' : ''}>
                    {passwordData.newPassword.length >= 8 ? '✓' : '○'} Minimum 8 znaków
                  </p>
                  <p className={/[A-Z]/.test(passwordData.newPassword) ? 'text-green-600' : ''}>
                    {/[A-Z]/.test(passwordData.newPassword) ? '✓' : '○'} Wielka litera
                  </p>
                  <p className={/[a-z]/.test(passwordData.newPassword) ? 'text-green-600' : ''}>
                    {/[a-z]/.test(passwordData.newPassword) ? '✓' : '○'} Mała litera
                  </p>
                  <p className={/[0-9]/.test(passwordData.newPassword) ? 'text-green-600' : ''}>
                    {/[0-9]/.test(passwordData.newPassword) ? '✓' : '○'} Cyfra
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-500 mb-2">Potwierdź nowe hasło</label>
                <input
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary focus:ring-0 focus:outline-none"
                  required
                />
                {passwordData.confirmPassword && (
                  <p className={`text-xs mt-1 ${passwordData.newPassword === passwordData.confirmPassword ? 'text-green-600' : 'text-red-500'}`}>
                    {passwordData.newPassword === passwordData.confirmPassword ? '✓ Hasła są zgodne' : '✗ Hasła nie są zgodne'}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={changingPassword}
                className="btn btn-primary flex items-center gap-2"
              >
                {changingPassword ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Zmieniam...
                  </>
                ) : (
                  <>
                    <Lock className="w-5 h-5" />
                    Zmień hasło
                  </>
                )}
              </button>
            </form>
          ) : (
            <p className="text-gray-500 text-sm">
              Zalecamy regularną zmianę hasła dla bezpieczeństwa konta.
            </p>
          )}
        </div>

        {/* Strefa zagrożenia */}
        <div className="card p-8 border-2 border-red-200 bg-red-50">
          <h3 className="font-bold text-lg text-red-600 mb-4">Strefa zagrożenia</h3>
          <p className="text-gray-600 mb-4">
            Po usunięciu konta wszystkie Twoje dane, rezerwacje i historia zostaną trwale usunięte. 
            Ta operacja jest nieodwracalna.
          </p>
          <button
            onClick={handleDeleteAccount}
            className="px-4 py-2 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition-colors"
          >
            Usuń moje konto
          </button>
        </div>
      </div>
    );
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      {/* Mobile Navigation */}
      <div className="lg:hidden mb-6 overflow-x-auto">
        <div className="flex gap-2 pb-2 min-w-max">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveSection(item.id as SectionType)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl whitespace-nowrap transition-all ${
                activeSection === item.id
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <item.icon className="w-4 h-4" />
              <span className="text-sm font-medium">{item.label}</span>
            </button>
          ))}
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 rounded-xl whitespace-nowrap bg-red-50 text-red-600 hover:bg-red-100 transition-all"
          >
            <LogOut className="w-4 h-4" />
            <span className="text-sm font-medium">Wyloguj</span>
          </button>
        </div>
      </div>

      <div className="flex gap-8">
        {/* Sidebar - tylko desktop */}
        <aside className="w-72 shrink-0 hidden lg:block">
          <div className="card p-6 sticky top-24">
            {/* Profile Section */}
            <div className="text-center mb-6 pb-6 border-b border-gray-100">
              <div className="relative inline-block">
                <div className="w-20 h-20 rounded-full overflow-hidden bg-gradient-to-r from-primary to-secondary flex items-center justify-center text-white text-3xl">
                  {userData?.avatar || user?.avatar ? (
                    <img 
                      src={userData?.avatar || user?.avatar} 
                      alt="Avatar" 
                      className="w-full h-full object-cover" 
                    />
                  ) : (
                    '👤'
                  )}
                </div>
              </div>
              <div className="font-bold text-lg mt-3">{userData?.username || user?.username}</div>
              <div className="text-gray-500 text-sm">{userData?.phone || user?.phone}</div>
              {(userData?.accountType === 'provider' || user?.accountType === 'provider') && (
                <span className="inline-block mt-2 px-3 py-1 bg-emerald-100 text-emerald-700 text-xs font-medium rounded-full">
                  Usługodawca
                </span>
              )}
            </div>

            {/* Menu */}
            <nav className="space-y-1">
              {menuItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveSection(item.id as SectionType)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                    activeSection === item.id
                      ? 'bg-primary text-white'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </button>
              ))}
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 transition-all"
              >
                <LogOut className="w-5 h-5" />
                <span className="font-medium">Wyloguj</span>
              </button>
            </nav>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 min-w-0">
          <div className="mb-6">
            <h1 className="text-2xl font-bold">
              {menuItems.find((m) => m.id === activeSection)?.label || 'Panel Główny'}
            </h1>
            <p className="text-gray-500">
              {activeSection === 'dashboard' && 'Przegląd Twojej aktywności'}
              {activeSection === 'referral' && 'Zapraszaj znajomych i zarabiaj'}
              {activeSection === 'favorites' && 'Twoje ulubione miejsca i usługi'}
              {activeSection === 'wallet' && 'Zarządzaj swoimi środkami'}
              {activeSection === 'visits' && 'Kalendarz i historia rezerwacji'}
              {activeSection === 'settings' && 'Personalizuj swoje konto'}
              {activeSection === 'help' && 'FAQ i Kontakt'}
            </p>
          </div>

          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default ProfilePage;