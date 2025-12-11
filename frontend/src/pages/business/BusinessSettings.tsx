import { useState } from 'react';
import {
  User,
  Mail,
  Lock,
  Bell,
  CreditCard,
  Shield,
  Trash2,
  Save,
  Eye,
  EyeOff,
  Check,
  AlertTriangle,
  Phone,
  Smartphone,
} from 'lucide-react';
import { useAuth, useToast } from '../../App';
import PhoneInput, { validatePhoneNumber } from '../../components/PhoneInput';

const BusinessSettings = () => {
  const { user, login, logout } = useAuth();
  const { showToast } = useToast();

  // Parsuj numer telefonu żeby wyciągnąć kod kraju
  const parsePhoneNumber = (phone: string | undefined) => {
    if (!phone) return { countryCode: '+48', number: '' };
    const match = phone.match(/^(\+\d{1,3})\s?(.*)$/);
    if (match) {
      return { countryCode: match[1], number: match[2] };
    }
    return { countryCode: '+48', number: phone };
  };

  const parsedPhone = parsePhoneNumber(user?.phone);

  // Profile settings
  const [profileData, setProfileData] = useState({
    username: user?.username || '',
    email: user?.email || '',
    phone: parsedPhone.number,
    phoneCountryCode: parsedPhone.countryCode,
    businessName: user?.businessName || '',
  });

  // Password settings
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  // Notification settings
  const [notifications, setNotifications] = useState({
    emailBookings: true,
    emailMessages: true,
    emailMarketing: false,
    smsBookings: true,
    smsReminders: true,
    pushNotifications: true,
  });

  // Privacy settings
  const [privacy, setPrivacy] = useState({
    profileVisible: true,
    showPhone: false,
    showEmail: false,
  });

  const [activeTab, setActiveTab] = useState<'profile' | 'password' | 'notifications' | 'privacy' | 'billing' | 'danger'>('profile');
  const [isLoading, setIsLoading] = useState(false);

  const handleSaveProfile = async () => {
    setIsLoading(true);
    
    // Walidacja imienia i nazwiska (minimum 2 wyrazy)
    const nameParts = profileData.username.trim().split(/\s+/);
    if (nameParts.length < 2 || nameParts.some(part => part.length < 2)) {
      showToast('Podaj pełne imię i nazwisko (np. Jan Kowalski)', 'error');
      setIsLoading(false);
      return;
    }

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(profileData.email)) {
      showToast('Nieprawidłowy adres email', 'error');
      setIsLoading(false);
      return;
    }

    // Walidacja numeru telefonu z kodem kraju
    if (profileData.phone) {
      const phoneValidation = validatePhoneNumber(profileData.phoneCountryCode, profileData.phone);
      if (!phoneValidation.valid) {
        showToast(phoneValidation.message, 'error');
        setIsLoading(false);
        return;
      }
    }

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));

    // Formatuj numer telefonu z kodem kraju
    const phoneDigits = profileData.phone.replace(/\D/g, '');
    const formattedPhone = `${profileData.phoneCountryCode} ${phoneDigits}`;

    // Update user in session
    const updatedUser = {
      ...user!,
      username: profileData.username,
      email: profileData.email,
      phone: formattedPhone,
      businessName: profileData.businessName,
    };
    login(updatedUser);

    showToast('Profil zaktualizowany pomyślnie', 'success');
    setIsLoading(false);
  };

  const handleChangePassword = async () => {
    if (!passwordData.currentPassword) {
      showToast('Podaj aktualne hasło', 'error');
      return;
    }

    if (passwordData.newPassword.length < 8) {
      showToast('Nowe hasło musi mieć minimum 8 znaków', 'error');
      return;
    }

    if (!/[A-Z]/.test(passwordData.newPassword)) {
      showToast('Hasło musi zawierać co najmniej jedną wielką literę', 'error');
      return;
    }

    if (!/[a-z]/.test(passwordData.newPassword)) {
      showToast('Hasło musi zawierać co najmniej jedną małą literę', 'error');
      return;
    }

    if (!/[0-9]/.test(passwordData.newPassword)) {
      showToast('Hasło musi zawierać co najmniej jedną cyfrę', 'error');
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      showToast('Hasła nie są takie same', 'error');
      return;
    }

    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500));

    showToast('Hasło zostało zmienione', 'success');
    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    setIsLoading(false);
  };

  const handleSaveNotifications = async () => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    showToast('Ustawienia powiadomień zapisane', 'success');
    setIsLoading(false);
  };

  const handleSavePrivacy = async () => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    showToast('Ustawienia prywatności zapisane', 'success');
    setIsLoading(false);
  };

  const handleDeleteAccount = () => {
    const password = window.prompt('Aby usunąć konto, wpisz swoje hasło:');
    if (password === null) return; // Anulowano
    
    if (!password || password.length < 8) {
      showToast('Nieprawidłowe hasło', 'error');
      return;
    }
    
    if (window.confirm('UWAGA: Czy na pewno chcesz usunąć swoje konto? Wszystkie Twoje dane, usługi i rezerwacje zostaną trwale usunięte. Ta operacja jest nieodwracalna!')) {
      logout();
      showToast('Konto zostało usunięte', 'info');
    }
  };

  const tabs = [
    { id: 'profile', label: 'Profil', icon: User },
    { id: 'password', label: 'Hasło', icon: Lock },
    { id: 'notifications', label: 'Powiadomienia', icon: Bell },
    { id: 'privacy', label: 'Prywatność', icon: Shield },
    { id: 'billing', label: 'Płatności', icon: CreditCard },
    { id: 'danger', label: 'Strefa zagrożenia', icon: AlertTriangle },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Ustawienia</h1>
        <p className="text-gray-600">Zarządzaj swoim kontem i preferencjami</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar */}
        <div className="lg:w-64 flex-shrink-0">
          <div className="bg-white rounded-xl shadow-sm p-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                  activeTab === tab.id
                    ? 'bg-emerald-50 text-emerald-700'
                    : 'text-gray-600 hover:bg-gray-50'
                } ${tab.id === 'danger' ? 'text-red-600 hover:bg-red-50' : ''}`}
              >
                <tab.icon className={`w-5 h-5 ${tab.id === 'danger' && activeTab !== 'danger' ? 'text-red-500' : ''}`} />
                <span className="font-medium">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1">
          <div className="bg-white rounded-xl shadow-sm p-6">
            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-bold text-gray-900 mb-1">Informacje o profilu</h2>
                  <p className="text-sm text-gray-500">Zaktualizuj swoje dane osobowe</p>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Imię i nazwisko
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        value={profileData.username}
                        onChange={(e) => setProfileData({ ...profileData, username: e.target.value })}
                        placeholder="Jan Kowalski"
                        className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-gray-200 focus:border-emerald-500 focus:ring-0 focus:outline-none"
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Wpisz imię i nazwisko</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nazwa firmy
                    </label>
                    <input
                      type="text"
                      value={profileData.businessName}
                      onChange={(e) => setProfileData({ ...profileData, businessName: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-emerald-500 focus:ring-0 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Adres email
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="email"
                        value={profileData.email}
                        onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                        className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-gray-200 focus:border-emerald-500 focus:ring-0 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Numer telefonu
                    </label>
                    <PhoneInput
                      value={profileData.phone}
                      countryCode={profileData.phoneCountryCode}
                      onChange={(phone, countryCode) => setProfileData({ 
                        ...profileData, 
                        phone, 
                        phoneCountryCode: countryCode 
                      })}
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-4 border-t">
                  <button
                    onClick={handleSaveProfile}
                    disabled={isLoading}
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50"
                  >
                    <Save className="w-5 h-5" />
                    {isLoading ? 'Zapisywanie...' : 'Zapisz zmiany'}
                  </button>
                </div>
              </div>
            )}

            {/* Password Tab */}
            {activeTab === 'password' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-bold text-gray-900 mb-1">Zmiana hasła</h2>
                  <p className="text-sm text-gray-500">Upewnij się, że używasz silnego hasła</p>
                </div>

                <div className="max-w-md space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Aktualne hasło
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type={showPasswords.current ? 'text' : 'password'}
                        value={passwordData.currentPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                        className="w-full pl-10 pr-12 py-3 rounded-xl border-2 border-gray-200 focus:border-emerald-500 focus:ring-0 focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                      >
                        {showPasswords.current ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nowe hasło
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type={showPasswords.new ? 'text' : 'password'}
                        value={passwordData.newPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                        className="w-full pl-10 pr-12 py-3 rounded-xl border-2 border-gray-200 focus:border-emerald-500 focus:ring-0 focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                      >
                        {showPasswords.new ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                    <div className="mt-2 text-xs text-gray-500 space-y-1">
                      <p className={passwordData.newPassword.length >= 8 ? 'text-green-600' : ''}>
                        {passwordData.newPassword.length >= 8 ? '✓' : '○'} Minimum 8 znaków
                      </p>
                      <p className={/[A-Z]/.test(passwordData.newPassword) ? 'text-green-600' : ''}>
                        {/[A-Z]/.test(passwordData.newPassword) ? '✓' : '○'} Co najmniej jedna wielka litera (A-Z)
                      </p>
                      <p className={/[a-z]/.test(passwordData.newPassword) ? 'text-green-600' : ''}>
                        {/[a-z]/.test(passwordData.newPassword) ? '✓' : '○'} Co najmniej jedna mała litera (a-z)
                      </p>
                      <p className={/[0-9]/.test(passwordData.newPassword) ? 'text-green-600' : ''}>
                        {/[0-9]/.test(passwordData.newPassword) ? '✓' : '○'} Co najmniej jedna cyfra (0-9)
                      </p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Potwierdź nowe hasło
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type={showPasswords.confirm ? 'text' : 'password'}
                        value={passwordData.confirmPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                        className="w-full pl-10 pr-12 py-3 rounded-xl border-2 border-gray-200 focus:border-emerald-500 focus:ring-0 focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                      >
                        {showPasswords.confirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                    {passwordData.confirmPassword && (
                      <p className={`text-xs mt-1 ${passwordData.newPassword === passwordData.confirmPassword ? 'text-green-600' : 'text-red-500'}`}>
                        {passwordData.newPassword === passwordData.confirmPassword ? '✓ Hasła są zgodne' : '✗ Hasła nie są zgodne'}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex justify-end pt-4 border-t">
                  <button
                    onClick={handleChangePassword}
                    disabled={isLoading}
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50"
                  >
                    <Lock className="w-5 h-5" />
                    {isLoading ? 'Zapisywanie...' : 'Zmień hasło'}
                  </button>
                </div>
              </div>
            )}

            {/* Notifications Tab */}
            {activeTab === 'notifications' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-bold text-gray-900 mb-1">Powiadomienia</h2>
                  <p className="text-sm text-gray-500">Wybierz jak chcesz otrzymywać powiadomienia</p>
                </div>

                <div className="space-y-6">
                  {/* Email Notifications */}
                  <div>
                    <h3 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                      <Mail className="w-5 h-5 text-gray-400" />
                      Powiadomienia email
                    </h3>
                    <div className="space-y-3">
                      {[
                        { key: 'emailBookings', label: 'Nowe rezerwacje', desc: 'Otrzymuj email gdy ktoś zarezerwuje wizytę' },
                        { key: 'emailMessages', label: 'Nowe wiadomości', desc: 'Otrzymuj email gdy dostaniesz wiadomość' },
                        { key: 'emailMarketing', label: 'Nowości i promocje', desc: 'Informacje o nowościach w ToMyHomeApp' },
                      ].map((item) => (
                        <label key={item.key} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100">
                          <div>
                            <p className="font-medium text-gray-900">{item.label}</p>
                            <p className="text-sm text-gray-500">{item.desc}</p>
                          </div>
                          <input
                            type="checkbox"
                            checked={notifications[item.key as keyof typeof notifications]}
                            onChange={(e) => setNotifications({ ...notifications, [item.key]: e.target.checked })}
                            className="w-5 h-5 rounded text-emerald-500 focus:ring-emerald-500"
                          />
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* SMS Notifications */}
                  <div>
                    <h3 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                      <Phone className="w-5 h-5 text-gray-400" />
                      Powiadomienia SMS
                    </h3>
                    <div className="space-y-3">
                      {[
                        { key: 'smsBookings', label: 'Nowe rezerwacje', desc: 'SMS gdy ktoś zarezerwuje wizytę' },
                        { key: 'smsReminders', label: 'Przypomnienia', desc: 'SMS przypominający o nadchodzącej wizycie' },
                      ].map((item) => (
                        <label key={item.key} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100">
                          <div>
                            <p className="font-medium text-gray-900">{item.label}</p>
                            <p className="text-sm text-gray-500">{item.desc}</p>
                          </div>
                          <input
                            type="checkbox"
                            checked={notifications[item.key as keyof typeof notifications]}
                            onChange={(e) => setNotifications({ ...notifications, [item.key]: e.target.checked })}
                            className="w-5 h-5 rounded text-emerald-500 focus:ring-emerald-500"
                          />
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Push Notifications */}
                  <div>
                    <h3 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                      <Bell className="w-5 h-5 text-gray-400" />
                      Powiadomienia push
                    </h3>
                    <label className="flex items-center justify-between p-4 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100">
                      <div>
                        <p className="font-medium text-gray-900">Powiadomienia w przeglądarce</p>
                        <p className="text-sm text-gray-500">Otrzymuj powiadomienia w czasie rzeczywistym</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={notifications.pushNotifications}
                        onChange={(e) => setNotifications({ ...notifications, pushNotifications: e.target.checked })}
                        className="w-5 h-5 rounded text-emerald-500 focus:ring-emerald-500"
                      />
                    </label>
                  </div>
                </div>

                <div className="flex justify-end pt-4 border-t">
                  <button
                    onClick={handleSaveNotifications}
                    disabled={isLoading}
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50"
                  >
                    <Save className="w-5 h-5" />
                    {isLoading ? 'Zapisywanie...' : 'Zapisz ustawienia'}
                  </button>
                </div>
              </div>
            )}

            {/* Privacy Tab */}
            {activeTab === 'privacy' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-bold text-gray-900 mb-1">Prywatność</h2>
                  <p className="text-sm text-gray-500">Kontroluj widoczność swoich danych</p>
                </div>

                <div className="space-y-4">
                  <label className="flex items-center justify-between p-4 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100">
                    <div>
                      <p className="font-medium text-gray-900">Profil widoczny publicznie</p>
                      <p className="text-sm text-gray-500">Pozwól klientom znaleźć Twój profil w wyszukiwarce</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={privacy.profileVisible}
                      onChange={(e) => setPrivacy({ ...privacy, profileVisible: e.target.checked })}
                      className="w-5 h-5 rounded text-emerald-500 focus:ring-emerald-500"
                    />
                  </label>

                  <label className="flex items-center justify-between p-4 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100">
                    <div>
                      <p className="font-medium text-gray-900">Pokaż numer telefonu</p>
                      <p className="text-sm text-gray-500">Wyświetlaj numer telefonu na profilu publicznym</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={privacy.showPhone}
                      onChange={(e) => setPrivacy({ ...privacy, showPhone: e.target.checked })}
                      className="w-5 h-5 rounded text-emerald-500 focus:ring-emerald-500"
                    />
                  </label>

                  <label className="flex items-center justify-between p-4 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100">
                    <div>
                      <p className="font-medium text-gray-900">Pokaż adres email</p>
                      <p className="text-sm text-gray-500">Wyświetlaj adres email na profilu publicznym</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={privacy.showEmail}
                      onChange={(e) => setPrivacy({ ...privacy, showEmail: e.target.checked })}
                      className="w-5 h-5 rounded text-emerald-500 focus:ring-emerald-500"
                    />
                  </label>
                </div>

                <div className="flex justify-end pt-4 border-t">
                  <button
                    onClick={handleSavePrivacy}
                    disabled={isLoading}
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50"
                  >
                    <Save className="w-5 h-5" />
                    {isLoading ? 'Zapisywanie...' : 'Zapisz ustawienia'}
                  </button>
                </div>
              </div>
            )}

            {/* Billing Tab */}
            {activeTab === 'billing' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-bold text-gray-900 mb-1">Płatności i subskrypcja</h2>
                  <p className="text-sm text-gray-500">Zarządzaj swoim planem i metodami płatności</p>
                </div>

                {/* Current Plan */}
                <div className="p-6 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl border border-emerald-200">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-sm text-emerald-600 font-medium">Aktualny plan</p>
                      <h3 className="text-2xl font-bold text-gray-900">Darmowy</h3>
                    </div>
                    <div className="px-3 py-1 bg-emerald-500 text-white rounded-full text-sm font-medium">
                      Aktywny
                    </div>
                  </div>
                  <ul className="space-y-2 text-sm text-gray-600 mb-4">
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-500" />
                      Do 10 rezerwacji miesięcznie
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-500" />
                      Podstawowy profil
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-500" />
                      Wiadomości z klientami
                    </li>
                  </ul>
                  <button className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all">
                    Przejdź na Premium
                  </button>
                </div>

                {/* Payment Methods */}
                <div>
                  <h3 className="font-medium text-gray-900 mb-3">Metody płatności</h3>
                  <div className="p-4 bg-gray-50 rounded-xl text-center">
                    <CreditCard className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                    <p className="text-gray-500">Brak dodanych metod płatności</p>
                    <button className="mt-3 text-emerald-600 font-medium hover:underline">
                      + Dodaj kartę
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Danger Zone Tab */}
            {activeTab === 'danger' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-bold text-red-600 mb-1">Strefa zagrożenia</h2>
                  <p className="text-sm text-gray-500">Nieodwracalne akcje dotyczące Twojego konta</p>
                </div>

                <div className="p-6 border-2 border-red-200 rounded-xl bg-red-50">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-red-100 rounded-xl">
                      <Trash2 className="w-6 h-6 text-red-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-red-900">Usuń konto</h3>
                      <p className="text-sm text-red-700 mt-1">
                        Po usunięciu konta wszystkie Twoje dane, rezerwacje i historia zostaną trwale usunięte.
                        Ta operacja jest nieodwracalna.
                      </p>
                      <button
                        onClick={handleDeleteAccount}
                        className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors"
                      >
                        Usuń moje konto
                      </button>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
                  <div className="flex gap-3">
                    <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-yellow-800">Przed usunięciem konta</p>
                      <ul className="text-sm text-yellow-700 mt-1 space-y-1">
                        <li>• Upewnij się, że nie masz aktywnych rezerwacji</li>
                        <li>• Poinformuj swoich klientów o zamknięciu działalności</li>
                        <li>• Pobierz kopię swoich danych jeśli potrzebujesz</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BusinessSettings;
