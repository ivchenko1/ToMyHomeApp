import { useState } from 'react';
import {
  Settings,
  Globe,
  DollarSign,
  Bell,
  Shield,
  Database,
  Save,
  RefreshCw,
  AlertTriangle,
  Lock,
  Crown,
} from 'lucide-react';
import { useToast } from '../../App';
import { useAdminRole } from '../../components/admin/AdminLayout';

const AdminSettings = () => {
  const { showToast } = useToast();
  const { isSuperAdmin } = useAdminRole();
  const [activeTab, setActiveTab] = useState('general');
  const [isSaving, setIsSaving] = useState(false);

  // General settings
  const [generalSettings, setGeneralSettings] = useState({
    siteName: 'ToMyHomeApp',
    siteDescription: 'Profesjonalne usługi beauty i wellness w zaciszu Twojego domu',
    contactEmail: 'kontakt@tomyhomeapp.pl',
    contactPhone: '+48 123 456 789',
    maintenanceMode: false,
  });

  // Commission settings
  const [commissionSettings, setCommissionSettings] = useState({
    platformCommission: 10, // procent
    minWithdrawal: 50, // zł
    payoutDelay: 7, // dni
  });

  // Notification settings
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    bookingReminders: true,
    marketingEmails: false,
    providerAlerts: true,
  });

  // Security settings
  const [securitySettings, setSecuritySettings] = useState({
    requireEmailVerification: false,
    requirePhoneVerification: false,
    autoVerifyProviders: false,
    maxLoginAttempts: 5,
  });

  const tabs = [
    { id: 'general', label: 'Ogólne', icon: Globe, superAdminOnly: false },
    { id: 'commission', label: 'Prowizje', icon: DollarSign, superAdminOnly: true },
    { id: 'notifications', label: 'Powiadomienia', icon: Bell, superAdminOnly: false },
    { id: 'security', label: 'Bezpieczeństwo', icon: Shield, superAdminOnly: true },
    { id: 'maintenance', label: 'Konserwacja', icon: Database, superAdminOnly: true },
  ];

  const handleSave = async () => {
    setIsSaving(true);
    // Symulacja zapisu - w prawdziwej aplikacji zapisywałoby do Firestore
    await new Promise((resolve) => setTimeout(resolve, 1000));
    showToast('Ustawienia zapisane', 'success');
    setIsSaving(false);
  };

  const isTabLocked = (tab: typeof tabs[0]) => {
    return tab.superAdminOnly && !isSuperAdmin;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Ustawienia</h1>
          <p className="text-gray-500">Konfiguracja platformy</p>
        </div>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white font-medium rounded-xl hover:bg-red-700 transition-colors disabled:opacity-50"
        >
          {isSaving ? (
            <RefreshCw className="w-5 h-5 animate-spin" />
          ) : (
            <Save className="w-5 h-5" />
          )}
          Zapisz zmiany
        </button>
      </div>

      {/* Super Admin Notice */}
      {!isSuperAdmin && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center gap-4">
          <div className="p-2 bg-amber-100 rounded-lg">
            <Crown className="w-6 h-6 text-amber-600" />
          </div>
          <div>
            <h4 className="font-semibold text-amber-800">Ograniczone uprawnienia</h4>
            <p className="text-sm text-amber-600">
              Niektóre ustawienia są dostępne tylko dla Super Adminów
            </p>
          </div>
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Tabs */}
        <div className="lg:w-64 bg-white rounded-2xl shadow-sm p-4">
          <nav className="space-y-1">
            {tabs.map((tab) => {
              const locked = isTabLocked(tab);
              return (
                <button
                  key={tab.id}
                  onClick={() => !locked && setActiveTab(tab.id)}
                  disabled={locked}
                  className={`w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl transition-colors ${
                    locked
                      ? 'text-gray-400 cursor-not-allowed'
                      : activeTab === tab.id
                      ? 'bg-red-50 text-red-600'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <tab.icon className="w-5 h-5" />
                    <span className="font-medium">{tab.label}</span>
                  </div>
                  {locked && <Lock className="w-4 h-4" />}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1 bg-white rounded-2xl shadow-sm p-6">
          {/* General Settings */}
          {activeTab === 'general' && (
            <div className="space-y-6">
              <h2 className="text-lg font-bold text-gray-900">Ustawienia ogólne</h2>
              
              <div className="grid gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nazwa strony
                  </label>
                  <input
                    type="text"
                    value={generalSettings.siteName}
                    onChange={(e) => setGeneralSettings({ ...generalSettings, siteName: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-red-500 focus:ring-0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Opis strony
                  </label>
                  <textarea
                    value={generalSettings.siteDescription}
                    onChange={(e) => setGeneralSettings({ ...generalSettings, siteDescription: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-red-500 focus:ring-0 resize-none"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email kontaktowy
                    </label>
                    <input
                      type="email"
                      value={generalSettings.contactEmail}
                      onChange={(e) => setGeneralSettings({ ...generalSettings, contactEmail: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-red-500 focus:ring-0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Telefon kontaktowy
                    </label>
                    <input
                      type="tel"
                      value={generalSettings.contactPhone}
                      onChange={(e) => setGeneralSettings({ ...generalSettings, contactPhone: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-red-500 focus:ring-0"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Commission Settings - Super Admin Only */}
          {activeTab === 'commission' && isSuperAdmin && (
            <div className="space-y-6">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-gray-900">Ustawienia prowizji</h2>
                <span className="px-2 py-1 text-xs font-medium rounded-full bg-amber-100 text-amber-700">
                  Super Admin
                </span>
              </div>
              
              <div className="grid gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Prowizja platformy (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={commissionSettings.platformCommission}
                    onChange={(e) => setCommissionSettings({ ...commissionSettings, platformCommission: Number(e.target.value) })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-red-500 focus:ring-0"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Procent pobierany od każdej transakcji
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Minimalna kwota wypłaty (zł)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={commissionSettings.minWithdrawal}
                    onChange={(e) => setCommissionSettings({ ...commissionSettings, minWithdrawal: Number(e.target.value) })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-red-500 focus:ring-0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Opóźnienie wypłaty (dni)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={commissionSettings.payoutDelay}
                    onChange={(e) => setCommissionSettings({ ...commissionSettings, payoutDelay: Number(e.target.value) })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-red-500 focus:ring-0"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Liczba dni po zakończeniu usługi, po których można wypłacić środki
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Notification Settings */}
          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <h2 className="text-lg font-bold text-gray-900">Ustawienia powiadomień</h2>
              
              <div className="space-y-4">
                {[
                  { key: 'emailNotifications', label: 'Powiadomienia email', desc: 'Wysyłaj powiadomienia email do użytkowników' },
                  { key: 'bookingReminders', label: 'Przypomnienia o rezerwacjach', desc: 'Przypominaj o nadchodzących wizytach' },
                  { key: 'marketingEmails', label: 'Emaile marketingowe', desc: 'Wysyłaj newslettery i promocje' },
                  { key: 'providerAlerts', label: 'Alerty dla usługodawców', desc: 'Powiadamiaj o nowych rezerwacjach i wiadomościach' },
                ].map((setting) => (
                  <label
                    key={setting.key}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors"
                  >
                    <div>
                      <p className="font-medium text-gray-900">{setting.label}</p>
                      <p className="text-sm text-gray-500">{setting.desc}</p>
                    </div>
                    <div className="relative">
                      <input
                        type="checkbox"
                        checked={notificationSettings[setting.key as keyof typeof notificationSettings]}
                        onChange={(e) =>
                          setNotificationSettings({
                            ...notificationSettings,
                            [setting.key]: e.target.checked,
                          })
                        }
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-300 peer-checked:bg-red-600 rounded-full transition-colors"></div>
                      <div className="absolute left-0.5 top-0.5 w-5 h-5 bg-white rounded-full shadow peer-checked:translate-x-5 transition-transform"></div>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Security Settings - Super Admin Only */}
          {activeTab === 'security' && isSuperAdmin && (
            <div className="space-y-6">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-gray-900">Ustawienia bezpieczeństwa</h2>
                <span className="px-2 py-1 text-xs font-medium rounded-full bg-amber-100 text-amber-700">
                  Super Admin
                </span>
              </div>
              
              <div className="space-y-4">
                {[
                  { key: 'requireEmailVerification', label: 'Wymagaj weryfikacji email', desc: 'Użytkownicy muszą potwierdzić email przed aktywacją konta' },
                  { key: 'requirePhoneVerification', label: 'Wymagaj weryfikacji telefonu', desc: 'Użytkownicy muszą potwierdzić numer telefonu SMS-em' },
                  { key: 'autoVerifyProviders', label: 'Auto-weryfikacja usługodawców', desc: 'Automatycznie zatwierdzaj nowych usługodawców (niezalecane)' },
                ].map((setting) => (
                  <label
                    key={setting.key}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors"
                  >
                    <div>
                      <p className="font-medium text-gray-900">{setting.label}</p>
                      <p className="text-sm text-gray-500">{setting.desc}</p>
                    </div>
                    <div className="relative">
                      <input
                        type="checkbox"
                        checked={securitySettings[setting.key as keyof typeof securitySettings] as boolean}
                        onChange={(e) =>
                          setSecuritySettings({
                            ...securitySettings,
                            [setting.key]: e.target.checked,
                          })
                        }
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-300 peer-checked:bg-red-600 rounded-full transition-colors"></div>
                      <div className="absolute left-0.5 top-0.5 w-5 h-5 bg-white rounded-full shadow peer-checked:translate-x-5 transition-transform"></div>
                    </div>
                  </label>
                ))}

                <div className="p-4 bg-gray-50 rounded-xl">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Maksymalna liczba prób logowania
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={securitySettings.maxLoginAttempts}
                    onChange={(e) => setSecuritySettings({ ...securitySettings, maxLoginAttempts: Number(e.target.value) })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-red-500 focus:ring-0"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Po przekroczeniu konto zostanie tymczasowo zablokowane
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Maintenance Settings - Super Admin Only */}
          {activeTab === 'maintenance' && isSuperAdmin && (
            <div className="space-y-6">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-gray-900">Tryb konserwacji</h2>
                <span className="px-2 py-1 text-xs font-medium rounded-full bg-amber-100 text-amber-700">
                  Super Admin
                </span>
              </div>
              
              <div className="p-6 bg-amber-50 border border-amber-200 rounded-xl">
                <div className="flex items-start gap-4">
                  <AlertTriangle className="w-6 h-6 text-amber-600 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold text-amber-800">Uwaga</h3>
                    <p className="text-amber-700 mb-4">
                      Włączenie trybu konserwacji spowoduje, że strona będzie niedostępna dla wszystkich użytkowników
                      oprócz administratorów.
                    </p>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <div className="relative">
                        <input
                          type="checkbox"
                          checked={generalSettings.maintenanceMode}
                          onChange={(e) =>
                            setGeneralSettings({
                              ...generalSettings,
                              maintenanceMode: e.target.checked,
                            })
                          }
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-300 peer-checked:bg-red-600 rounded-full transition-colors"></div>
                        <div className="absolute left-0.5 top-0.5 w-5 h-5 bg-white rounded-full shadow peer-checked:translate-x-5 transition-transform"></div>
                      </div>
                      <span className="font-medium text-gray-900">
                        {generalSettings.maintenanceMode ? 'Tryb konserwacji WŁĄCZONY' : 'Tryb konserwacji wyłączony'}
                      </span>
                    </label>
                  </div>
                </div>
              </div>

              <div className="p-6 bg-gray-50 rounded-xl">
                <h3 className="font-semibold text-gray-900 mb-4">Akcje bazy danych</h3>
                <div className="space-y-3">
                  <button className="w-full py-3 px-4 bg-white border border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors text-left flex items-center gap-3">
                    <Database className="w-5 h-5 text-gray-400" />
                    Eksportuj dane (JSON)
                  </button>
                  <button className="w-full py-3 px-4 bg-white border border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors text-left flex items-center gap-3">
                    <RefreshCw className="w-5 h-5 text-gray-400" />
                    Wyczyść cache
                  </button>
                  <button className="w-full py-3 px-4 bg-red-50 border border-red-200 text-red-700 font-medium rounded-xl hover:bg-red-100 transition-colors text-left flex items-center gap-3">
                    <AlertTriangle className="w-5 h-5 text-red-500" />
                    Resetuj bazę danych (NIEBEZPIECZNE)
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Locked Tab Message */}
          {((activeTab === 'commission' || activeTab === 'security' || activeTab === 'maintenance') && !isSuperAdmin) && (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Lock className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Brak dostępu</h3>
              <p className="text-gray-500">
                Te ustawienia są dostępne tylko dla Super Adminów
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;
