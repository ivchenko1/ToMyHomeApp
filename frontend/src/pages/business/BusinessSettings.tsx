import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
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
  Clock,
  Loader2,
} from 'lucide-react';
import { useAuth, useToast } from '../../App';
import PhoneInput, { validatePhoneNumber } from '../../components/PhoneInput';
import providerService, { Provider, WorkingHours } from '../../services/providerService';

const BusinessSettings = () => {
  const { user, login, logout } = useAuth();
  const { showToast } = useToast();

  // Provider data
  const [provider, setProvider] = useState<Provider | null>(null);
  const [isLoadingProvider, setIsLoadingProvider] = useState(true);

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

  // Working hours
  const [workingHours, setWorkingHours] = useState<WorkingHours>({
    monday: { from: '09:00', to: '18:00', enabled: true },
    tuesday: { from: '09:00', to: '18:00', enabled: true },
    wednesday: { from: '09:00', to: '18:00', enabled: true },
    thursday: { from: '09:00', to: '18:00', enabled: true },
    friday: { from: '09:00', to: '18:00', enabled: true },
    saturday: { from: '10:00', to: '15:00', enabled: true },
    sunday: { from: '00:00', to: '00:00', enabled: false },
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

  const [activeTab, setActiveTab] = useState<'profile' | 'hours' | 'password' | 'notifications' | 'privacy' | 'billing' | 'danger'>('profile');
  const [isLoading, setIsLoading] = useState(false);

  // Load provider data
  useEffect(() => {
    const loadProvider = async () => {
      if (!user?.id) {
        setIsLoadingProvider(false);
        return;
      }

      try {
        const providers = await providerService.getByOwner(user.id);
        if (providers.length > 0) {
          const p = providers[0];
          setProvider(p);
          setWorkingHours(p.workingHours);
        }
      } catch (error) {
        console.error('Error loading provider:', error);
      } finally {
        setIsLoadingProvider(false);
      }
    };

    loadProvider();
  }, [user?.id]);

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

  const handleSaveWorkingHours = async () => {
    if (!provider) {
      showToast('Najpierw utwórz profil usługodawcy', 'error');
      return;
    }

    // Walidacja godzin
    for (const [day, hours] of Object.entries(workingHours)) {
      if (hours.enabled) {
        const fromHour = parseInt(hours.from.split(':')[0]);
        const toHour = parseInt(hours.to.split(':')[0]);
        if (fromHour >= toHour) {
          const dayNames: { [key: string]: string } = {
            monday: 'Poniedziałek',
            tuesday: 'Wtorek',
            wednesday: 'Środa',
            thursday: 'Czwartek',
            friday: 'Piątek',
            saturday: 'Sobota',
            sunday: 'Niedziela',
          };
          showToast(`${dayNames[day]}: Godzina otwarcia musi być wcześniejsza niż zamknięcia`, 'error');
          return;
        }
      }
    }

    setIsLoading(true);
    try {
      await providerService.update(provider.id, { workingHours });
      setProvider({ ...provider, workingHours });
      showToast('Godziny pracy zostały zapisane', 'success');
    } catch (error) {
      console.error('Error saving working hours:', error);
      showToast('Błąd zapisu godzin pracy', 'error');
    } finally {
      setIsLoading(false);
    }
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

  const updateWorkingHours = (day: keyof WorkingHours, field: 'from' | 'to' | 'enabled', value: string | boolean) => {
    setWorkingHours(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        [field]: value,
      },
    }));
  };

  // Generuj opcje godzin
  const timeOptions: string[] = [];
  for (let h = 0; h < 24; h++) {
    for (let m = 0; m < 60; m += 30) {
      const time = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
      timeOptions.push(time);
    }
  }

  const dayNames: { [key: string]: string } = {
    monday: 'Poniedziałek',
    tuesday: 'Wtorek',
    wednesday: 'Środa',
    thursday: 'Czwartek',
    friday: 'Piątek',
    saturday: 'Sobota',
    sunday: 'Niedziela',
  };

  const tabs = [
    { id: 'profile', label: 'Profil', icon: User },
    { id: 'hours', label: 'Godziny pracy', icon: Clock },
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
        <p className="text-gray-600">Zarządzaj ustawieniami swojego konta i profilu</p>
      </div>

      <div className="grid lg:grid-cols-[250px,1fr] gap-6">
        {/* Sidebar */}
        <div className="bg-white rounded-2xl shadow-sm p-4">
          <nav className="space-y-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-colors ${
                  activeTab === tab.id
                    ? 'bg-emerald-50 text-emerald-700 font-medium'
                    : 'text-gray-600 hover:bg-gray-50'
                } ${tab.id === 'danger' ? 'text-red-600 hover:bg-red-50' : ''}`}
              >
                <tab.icon className={`w-5 h-5 ${tab.id === 'danger' ? 'text-red-500' : ''}`} />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-bold text-gray-900 mb-1">Informacje profilowe</h2>
                <p className="text-sm text-gray-500">Zaktualizuj swoje dane osobowe</p>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Imię i nazwisko
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      value={profileData.username}
                      onChange={(e) => setProfileData({ ...profileData, username: e.target.value })}
                      className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-0"
                      placeholder="Jan Kowalski"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Adres email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="email"
                      value={profileData.email}
                      onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                      className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-0"
                      placeholder="jan@example.com"
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
                    onChange={(phone: string, code: string) => setProfileData({ ...profileData, phone, phoneCountryCode: code })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nazwa firmy (opcjonalnie)
                  </label>
                  <input
                    type="text"
                    value={profileData.businessName}
                    onChange={(e) => setProfileData({ ...profileData, businessName: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-0"
                    placeholder="Salon Urody Anna"
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

          {/* Working Hours Tab */}
          {activeTab === 'hours' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-bold text-gray-900 mb-1">Godziny pracy</h2>
                <p className="text-sm text-gray-500">Ustaw godziny, w których przyjmujesz klientów. Te godziny będą widoczne przy rezerwacji.</p>
              </div>

              {isLoadingProvider ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
                </div>
              ) : !provider ? (
                <div className="text-center py-12 bg-gray-50 rounded-xl">
                  <Clock className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Brak profilu usługodawcy</h3>
                  <p className="text-gray-500 mb-4">Najpierw utwórz profil usługodawcy, aby ustawić godziny pracy.</p>
                  <Link to="/biznes/dodaj-usluge" className="text-emerald-600 font-medium hover:underline">
                    Utwórz profil →
                  </Link>
                </div>
              ) : (
                <>
                  <div className="space-y-4">
                    {(Object.keys(workingHours) as (keyof WorkingHours)[]).map((day) => (
                      <div
                        key={day}
                        className={`p-4 rounded-xl border-2 transition-colors ${
                          workingHours[day].enabled
                            ? 'border-emerald-200 bg-emerald-50/50'
                            : 'border-gray-200 bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            {/* Toggle */}
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input
                                type="checkbox"
                                checked={workingHours[day].enabled}
                                onChange={(e) => updateWorkingHours(day, 'enabled', e.target.checked)}
                                className="sr-only peer"
                              />
                              <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                            </label>
                            
                            {/* Day name */}
                            <span className={`font-medium min-w-[100px] ${workingHours[day].enabled ? 'text-gray-900' : 'text-gray-400'}`}>
                              {dayNames[day]}
                            </span>
                          </div>

                          {/* Time selectors */}
                          {workingHours[day].enabled ? (
                            <div className="flex items-center gap-3">
                              <select
                                value={workingHours[day].from}
                                onChange={(e) => updateWorkingHours(day, 'from', e.target.value)}
                                className="px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-emerald-500 focus:ring-0 text-sm"
                              >
                                {timeOptions.map((time) => (
                                  <option key={`from-${time}`} value={time}>
                                    {time}
                                  </option>
                                ))}
                              </select>
                              <span className="text-gray-400">—</span>
                              <select
                                value={workingHours[day].to}
                                onChange={(e) => updateWorkingHours(day, 'to', e.target.value)}
                                className="px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-emerald-500 focus:ring-0 text-sm"
                              >
                                {timeOptions.map((time) => (
                                  <option key={`to-${time}`} value={time}>
                                    {time}
                                  </option>
                                ))}
                              </select>
                            </div>
                          ) : (
                            <span className="text-sm text-gray-400">Zamknięte</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Quick presets */}
                  <div className="pt-4 border-t">
                    <p className="text-sm font-medium text-gray-700 mb-3">Szybkie ustawienia:</p>
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => {
                          const standard: WorkingHours = {
                            monday: { from: '09:00', to: '17:00', enabled: true },
                            tuesday: { from: '09:00', to: '17:00', enabled: true },
                            wednesday: { from: '09:00', to: '17:00', enabled: true },
                            thursday: { from: '09:00', to: '17:00', enabled: true },
                            friday: { from: '09:00', to: '17:00', enabled: true },
                            saturday: { from: '00:00', to: '00:00', enabled: false },
                            sunday: { from: '00:00', to: '00:00', enabled: false },
                          };
                          setWorkingHours(standard);
                        }}
                        className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200 transition-colors"
                      >
                        Standardowe (Pn-Pt 9-17)
                      </button>
                      <button
                        onClick={() => {
                          const extended: WorkingHours = {
                            monday: { from: '08:00', to: '20:00', enabled: true },
                            tuesday: { from: '08:00', to: '20:00', enabled: true },
                            wednesday: { from: '08:00', to: '20:00', enabled: true },
                            thursday: { from: '08:00', to: '20:00', enabled: true },
                            friday: { from: '08:00', to: '20:00', enabled: true },
                            saturday: { from: '09:00', to: '15:00', enabled: true },
                            sunday: { from: '00:00', to: '00:00', enabled: false },
                          };
                          setWorkingHours(extended);
                        }}
                        className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200 transition-colors"
                      >
                        Rozszerzone (8-20 + Sob)
                      </button>
                      <button
                        onClick={() => {
                          const fullWeek: WorkingHours = {
                            monday: { from: '10:00', to: '18:00', enabled: true },
                            tuesday: { from: '10:00', to: '18:00', enabled: true },
                            wednesday: { from: '10:00', to: '18:00', enabled: true },
                            thursday: { from: '10:00', to: '18:00', enabled: true },
                            friday: { from: '10:00', to: '18:00', enabled: true },
                            saturday: { from: '10:00', to: '16:00', enabled: true },
                            sunday: { from: '10:00', to: '14:00', enabled: true },
                          };
                          setWorkingHours(fullWeek);
                        }}
                        className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200 transition-colors"
                      >
                        Cały tydzień
                      </button>
                    </div>
                  </div>

                  <div className="flex justify-end pt-4 border-t">
                    <button
                      onClick={handleSaveWorkingHours}
                      disabled={isLoading}
                      className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50"
                    >
                      <Save className="w-5 h-5" />
                      {isLoading ? 'Zapisywanie...' : 'Zapisz godziny pracy'}
                    </button>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Password Tab */}
          {activeTab === 'password' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-bold text-gray-900 mb-1">Zmiana hasła</h2>
                <p className="text-sm text-gray-500">Upewnij się, że używasz silnego hasła</p>
              </div>

              <div className="space-y-4 max-w-md">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Aktualne hasło
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type={showPasswords.current ? 'text' : 'password'}
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                      className="w-full pl-10 pr-12 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-0"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
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
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type={showPasswords.new ? 'text' : 'password'}
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                      className="w-full pl-10 pr-12 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-0"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPasswords.new ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Min. 8 znaków, wielka litera, mała litera, cyfra
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Potwierdź nowe hasło
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type={showPasswords.confirm ? 'text' : 'password'}
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                      className="w-full pl-10 pr-12 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-0"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPasswords.confirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t">
                <button
                  onClick={handleChangePassword}
                  disabled={isLoading}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50"
                >
                  <Lock className="w-5 h-5" />
                  {isLoading ? 'Zmienianie...' : 'Zmień hasło'}
                </button>
              </div>
            </div>
          )}

          {/* Notifications Tab */}
          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-bold text-gray-900 mb-1">Powiadomienia</h2>
                <p className="text-sm text-gray-500">Zarządzaj preferencjami powiadomień</p>
              </div>

              <div className="space-y-6">
                {/* Email Notifications - DISABLED */}
                <div className="opacity-50">
                  <h3 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                    <Mail className="w-5 h-5 text-gray-400" />
                    Powiadomienia email
                    <span className="text-xs bg-gray-200 text-gray-500 px-2 py-0.5 rounded-full">Wkrótce</span>
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl cursor-not-allowed">
                      <div>
                        <p className="font-medium text-gray-400">Nowe rezerwacje</p>
                        <p className="text-sm text-gray-400">Otrzymuj email gdy ktoś zarezerwuje wizytę</p>
                      </div>
                      <input
                        type="checkbox"
                        disabled
                        className="w-5 h-5 rounded text-gray-300 cursor-not-allowed"
                      />
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl cursor-not-allowed">
                      <div>
                        <p className="font-medium text-gray-400">Nowe wiadomości</p>
                        <p className="text-sm text-gray-400">Otrzymuj email gdy ktoś wyśle wiadomość</p>
                      </div>
                      <input
                        type="checkbox"
                        disabled
                        className="w-5 h-5 rounded text-gray-300 cursor-not-allowed"
                      />
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl cursor-not-allowed">
                      <div>
                        <p className="font-medium text-gray-400">Newsletter i promocje</p>
                        <p className="text-sm text-gray-400">Informacje o nowościach i promocjach</p>
                      </div>
                      <input
                        type="checkbox"
                        disabled
                        className="w-5 h-5 rounded text-gray-300 cursor-not-allowed"
                      />
                    </div>
                  </div>
                </div>

                {/* SMS Notifications - DISABLED */}
                <div className="opacity-50">
                  <h3 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                    <Phone className="w-5 h-5 text-gray-400" />
                    Powiadomienia SMS
                    <span className="text-xs bg-gray-200 text-gray-500 px-2 py-0.5 rounded-full">Wkrótce</span>
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl cursor-not-allowed">
                      <div>
                        <p className="font-medium text-gray-400">Nowe rezerwacje</p>
                        <p className="text-sm text-gray-400">Otrzymuj SMS gdy ktoś zarezerwuje wizytę</p>
                      </div>
                      <input
                        type="checkbox"
                        disabled
                        className="w-5 h-5 rounded text-gray-300 cursor-not-allowed"
                      />
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl cursor-not-allowed">
                      <div>
                        <p className="font-medium text-gray-400">Przypomnienia o wizytach</p>
                        <p className="text-sm text-gray-400">Otrzymuj SMS przed nadchodzącą wizytą</p>
                      </div>
                      <input
                        type="checkbox"
                        disabled
                        className="w-5 h-5 rounded text-gray-300 cursor-not-allowed"
                      />
                    </div>
                  </div>
                </div>

                {/* Push Notifications - ACTIVE */}
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
  );
};

export default BusinessSettings;
