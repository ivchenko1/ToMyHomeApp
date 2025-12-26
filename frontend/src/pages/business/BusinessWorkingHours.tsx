import { useState, useEffect } from 'react';
import { Clock, Save, Loader2, AlertCircle } from 'lucide-react';
import { useAuth, useToast } from '../../App';
import providerService, { Provider, WorkingHours } from '../../services/providerService';

const BusinessWorkingHours = () => {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [provider, setProvider] = useState<Provider | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [workingHours, setWorkingHours] = useState<WorkingHours>({
    monday: { from: '09:00', to: '18:00', enabled: true },
    tuesday: { from: '09:00', to: '18:00', enabled: true },
    wednesday: { from: '09:00', to: '18:00', enabled: true },
    thursday: { from: '09:00', to: '18:00', enabled: true },
    friday: { from: '09:00', to: '18:00', enabled: true },
    saturday: { from: '10:00', to: '15:00', enabled: true },
    sunday: { from: '00:00', to: '00:00', enabled: false },
  });

  const dayNames: { [key: string]: string } = {
    monday: 'Poniedziałek',
    tuesday: 'Wtorek',
    wednesday: 'Środa',
    thursday: 'Czwartek',
    friday: 'Piątek',
    saturday: 'Sobota',
    sunday: 'Niedziela',
  };

  // Generuj opcje godzin
  const timeOptions: string[] = [];
  for (let h = 0; h < 24; h++) {
    for (let m = 0; m < 60; m += 30) {
      const time = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
      timeOptions.push(time);
    }
  }

  // Załaduj dane providera
  useEffect(() => {
    const loadProvider = async () => {
      if (!user?.id) {
        setIsLoading(false);
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
        showToast('Błąd ładowania danych', 'error');
      } finally {
        setIsLoading(false);
      }
    };

    loadProvider();
  }, [user?.id]);

  const updateWorkingHours = (day: keyof WorkingHours, field: 'from' | 'to' | 'enabled', value: string | boolean) => {
    setWorkingHours(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        [field]: value,
      },
    }));
  };

  const handleSave = async () => {
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
          showToast(`${dayNames[day]}: Godzina otwarcia musi być wcześniejsza niż zamknięcia`, 'error');
          return;
        }
      }
    }

    setIsSaving(true);
    try {
      await providerService.update(provider.id, { workingHours });
      setProvider({ ...provider, workingHours });
      showToast('Godziny pracy zostały zapisane!', 'success');
    } catch (error) {
      console.error('Error saving working hours:', error);
      showToast('Błąd zapisu godzin pracy', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const applyPreset = (preset: 'standard' | 'extended' | 'fullWeek') => {
    const presets: { [key: string]: WorkingHours } = {
      standard: {
        monday: { from: '09:00', to: '17:00', enabled: true },
        tuesday: { from: '09:00', to: '17:00', enabled: true },
        wednesday: { from: '09:00', to: '17:00', enabled: true },
        thursday: { from: '09:00', to: '17:00', enabled: true },
        friday: { from: '09:00', to: '17:00', enabled: true },
        saturday: { from: '00:00', to: '00:00', enabled: false },
        sunday: { from: '00:00', to: '00:00', enabled: false },
      },
      extended: {
        monday: { from: '08:00', to: '20:00', enabled: true },
        tuesday: { from: '08:00', to: '20:00', enabled: true },
        wednesday: { from: '08:00', to: '20:00', enabled: true },
        thursday: { from: '08:00', to: '20:00', enabled: true },
        friday: { from: '08:00', to: '20:00', enabled: true },
        saturday: { from: '09:00', to: '15:00', enabled: true },
        sunday: { from: '00:00', to: '00:00', enabled: false },
      },
      fullWeek: {
        monday: { from: '10:00', to: '18:00', enabled: true },
        tuesday: { from: '10:00', to: '18:00', enabled: true },
        wednesday: { from: '10:00', to: '18:00', enabled: true },
        thursday: { from: '10:00', to: '18:00', enabled: true },
        friday: { from: '10:00', to: '18:00', enabled: true },
        saturday: { from: '10:00', to: '16:00', enabled: true },
        sunday: { from: '10:00', to: '14:00', enabled: true },
      },
    };
    setWorkingHours(presets[preset]);
    showToast('Szablon zastosowany', 'info');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <Clock className="w-7 h-7 text-primary" />
            Godziny pracy
          </h1>
          <p className="text-gray-600 mt-1">
            Ustaw godziny, w których przyjmujesz klientów. Będą widoczne przy rezerwacji.
          </p>
        </div>
      </div>

      {!provider ? (
        <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-6">
          <div className="flex items-start gap-4">
            <AlertCircle className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-yellow-800">Brak profilu usługodawcy</h3>
              <p className="text-yellow-700 mt-1">
                Aby ustawić godziny pracy, najpierw utwórz swój profil usługodawcy.
              </p>
              <a
                href="/biznes/dodaj-usluge"
                className="inline-block mt-4 px-6 py-2 bg-yellow-600 text-white rounded-xl font-medium hover:bg-yellow-700 transition-colors"
              >
                Utwórz profil
              </a>
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* Quick presets */}
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Szybkie szablony</h3>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => applyPreset('standard')}
                className="px-5 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
              >
                📅 Standardowe (Pn-Pt 9-17)
              </button>
              <button
                onClick={() => applyPreset('extended')}
                className="px-5 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
              >
                🕐 Rozszerzone (8-20 + Sob)
              </button>
              <button
                onClick={() => applyPreset('fullWeek')}
                className="px-5 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
              >
                🗓️ Cały tydzień
              </button>
            </div>
          </div>

          {/* Working hours editor */}
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h3 className="font-semibold text-gray-900 mb-6">Dostosuj godziny dla każdego dnia</h3>
            
            <div className="space-y-4">
              {(Object.keys(workingHours) as (keyof WorkingHours)[]).map((day) => (
                <div
                  key={day}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    workingHours[day].enabled
                      ? 'border-emerald-200 bg-emerald-50/50'
                      : 'border-gray-200 bg-gray-50'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      {/* Toggle */}
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={workingHours[day].enabled}
                          onChange={(e) => updateWorkingHours(day, 'enabled', e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-12 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                      </label>
                      
                      {/* Day name */}
                      <span className={`font-semibold text-lg min-w-[120px] ${workingHours[day].enabled ? 'text-gray-900' : 'text-gray-400'}`}>
                        {dayNames[day]}
                      </span>
                    </div>

                    {/* Time selectors */}
                    {workingHours[day].enabled ? (
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-500">od</span>
                          <select
                            value={workingHours[day].from}
                            onChange={(e) => updateWorkingHours(day, 'from', e.target.value)}
                            className="px-4 py-2 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-0 font-medium"
                          >
                            {timeOptions.map((time) => (
                              <option key={`from-${time}`} value={time}>
                                {time}
                              </option>
                            ))}
                          </select>
                        </div>
                        <span className="text-gray-400 text-xl">→</span>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-500">do</span>
                          <select
                            value={workingHours[day].to}
                            onChange={(e) => updateWorkingHours(day, 'to', e.target.value)}
                            className="px-4 py-2 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-0 font-medium"
                          >
                            {timeOptions.map((time) => (
                              <option key={`to-${time}`} value={time}>
                                {time}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    ) : (
                      <span className="text-gray-400 font-medium px-4 py-2 bg-gray-100 rounded-xl">
                        🚫 Zamknięte
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Save button */}
          <div className="flex justify-end">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Zapisywanie...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Zapisz godziny pracy
                </>
              )}
            </button>
          </div>

          {/* Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <p className="text-blue-700 text-sm">
              💡 <strong>Wskazówka:</strong> Klienci będą mogli rezerwować wizyty tylko w godzinach, które tutaj ustawisz. 
              Dni oznaczone jako "Zamknięte" nie będą dostępne do rezerwacji.
            </p>
          </div>
        </>
      )}
    </div>
  );
};

export default BusinessWorkingHours;
