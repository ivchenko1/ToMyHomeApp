import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  Trash2,
  MapPin,
  DollarSign,
  FileText,
  Award,
  Save,
  ArrowLeft,
  Store,
  Upload,
  X,
} from 'lucide-react';
import { useAuth, useToast } from '../App';

interface ServiceItem {
  id: string;
  name: string;
  price: number;
  duration: string;
  description: string;
}

interface ProviderFormData {
  businessName: string;
  profession: string;
  description: string;
  experience: string;
  location: {
    city: string;
    district: string;
    address: string;
    postalCode: string;
  };
  services: ServiceItem[];
  features: string[];
  workingHours: {
    monday: { from: string; to: string; enabled: boolean };
    tuesday: { from: string; to: string; enabled: boolean };
    wednesday: { from: string; to: string; enabled: boolean };
    thursday: { from: string; to: string; enabled: boolean };
    friday: { from: string; to: string; enabled: boolean };
    saturday: { from: string; to: string; enabled: boolean };
    sunday: { from: string; to: string; enabled: boolean };
  };
  image: string;
  category: string;
}

const CreateProviderPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { showToast } = useToast();

  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);

  const [formData, setFormData] = useState<ProviderFormData>({
    businessName: '',
    profession: '',
    description: '',
    experience: '',
    location: {
      city: '',
      district: '',
      address: '',
      postalCode: '',
    },
    services: [],
    features: [],
    workingHours: {
      monday: { from: '09:00', to: '17:00', enabled: true },
      tuesday: { from: '09:00', to: '17:00', enabled: true },
      wednesday: { from: '09:00', to: '17:00', enabled: true },
      thursday: { from: '09:00', to: '17:00', enabled: true },
      friday: { from: '09:00', to: '17:00', enabled: true },
      saturday: { from: '10:00', to: '14:00', enabled: true },
      sunday: { from: '10:00', to: '14:00', enabled: false },
    },
    image: '',
    category: '',
  });

  // Nowa usługa - formularz
  const [newService, setNewService] = useState<Omit<ServiceItem, 'id'>>({
    name: '',
    price: 0,
    duration: '30 min',
    description: '',
  });

  // Nowa cecha
  const [newFeature, setNewFeature] = useState('');

  const categories = [
    { id: 'fryzjer', name: 'Fryzjer / Barber', icon: '✂️' },
    { id: 'paznokcie', name: 'Paznokcie / Manicure', icon: '💅' },
    { id: 'masaz', name: 'Masaż', icon: '💆' },
    { id: 'makijaz', name: 'Makijaż', icon: '💄' },
    { id: 'tatuaze', name: 'Tatuaże', icon: '🖊️' },
    { id: 'kosmetyka', name: 'Kosmetyka / Twarz', icon: '💧' },
    { id: 'inne', name: 'Inne usługi', icon: '✨' },
  ];

  const durations = ['15 min', '30 min', '45 min', '1h', '1h 30min', '2h', '2h 30min', '3h'];

  const suggestedFeatures = [
    'Dojazd do klienta',
    'Produkty premium',
    'Konsultacja gratis',
    'Parking',
    'WiFi',
    'Kawa/Herbata',
    'Klimatyzacja',
    'Dostępność dla niepełnosprawnych',
    'Płatność kartą',
    'Rezerwacja online',
  ];

  // Obsługa wyboru zdjęcia z urządzenia
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Sprawdź typ pliku
      if (!file.type.startsWith('image/')) {
        showToast('Wybierz plik graficzny (jpg, png, gif...)', 'error');
        return;
      }
      
      // Sprawdź rozmiar (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        showToast('Plik jest za duży (max 5MB)', 'error');
        return;
      }

      setImageFile(file);
      
      // Stwórz podgląd
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Usuń wybrane zdjęcie
  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  // Dodaj usługę
  const addService = () => {
    if (!newService.name || newService.price <= 0) {
      showToast('Podaj nazwę i cenę usługi', 'error');
      return;
    }

    const service: ServiceItem = {
      id: Date.now().toString(),
      ...newService,
    };

    setFormData((prev) => ({
      ...prev,
      services: [...prev.services, service],
    }));

    setNewService({ name: '', price: 0, duration: '30 min', description: '' });
    showToast('Usługa dodana!', 'success');
  };

  // Usuń usługę
  const removeService = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      services: prev.services.filter((s) => s.id !== id),
    }));
    showToast('Usługa usunięta', 'info');
  };

  // Edytuj usługę
  const updateService = (id: string, field: keyof ServiceItem, value: string | number) => {
    setFormData((prev) => ({
      ...prev,
      services: prev.services.map((s) =>
        s.id === id ? { ...s, [field]: value } : s
      ),
    }));
  };

  // Dodaj cechę
  const addFeature = (feature: string) => {
    if (!feature.trim()) return;
    if (formData.features.includes(feature)) {
      showToast('Ta cecha już istnieje', 'error');
      return;
    }

    setFormData((prev) => ({
      ...prev,
      features: [...prev.features, feature],
    }));
    setNewFeature('');
  };

  // Usuń cechę
  const removeFeature = (feature: string) => {
    setFormData((prev) => ({
      ...prev,
      features: prev.features.filter((f) => f !== feature),
    }));
  };

  // Toggle dzień pracy
  const toggleWorkingDay = (day: keyof typeof formData.workingHours) => {
    setFormData((prev) => ({
      ...prev,
      workingHours: {
        ...prev.workingHours,
        [day]: {
          ...prev.workingHours[day],
          enabled: !prev.workingHours[day].enabled,
        },
      },
    }));
  };

  // Zapisz formularz
  const handleSubmit = async () => {
    if (!isAuthenticated) {
      showToast('Musisz być zalogowany', 'error');
      navigate('/auth');
      return;
    }

    // Walidacja
    if (!formData.businessName) {
      showToast('Podaj nazwę firmy/salonu', 'error');
      setCurrentStep(1);
      return;
    }

    if (!formData.category) {
      showToast('Wybierz kategorię', 'error');
      setCurrentStep(1);
      return;
    }

    if (!formData.location.city || !formData.location.address) {
      showToast('Podaj lokalizację', 'error');
      setCurrentStep(2);
      return;
    }

    if (formData.services.length === 0) {
      showToast('Dodaj przynajmniej jedną usługę', 'error');
      setCurrentStep(3);
      return;
    }

    setIsLoading(true);

    try {
      const API_URL = '';
      const token = localStorage.getItem('token');

      // Przygotuj dane do wysłania
      const requestData = {
        businessName: formData.businessName,
        profession: formData.profession,
        category: formData.category,
        description: formData.description,
        experience: formData.experience,
        location: {
          city: formData.location.city,
          district: formData.location.district,
          address: formData.location.address,
          postalCode: formData.location.postalCode,
        },
        services: formData.services.map(s => ({
          id: s.id,
          name: s.name,
          price: s.price,
          duration: s.duration,
          description: s.description,
          isActive: true,
        })),
        features: formData.features,
        image: imagePreview || formData.image, // Base64 image lub URL
        workingHours: formData.workingHours,
      };

      const response = await fetch(`${API_URL}/api/providers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(requestData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Błąd podczas tworzenia profilu');
      }

      const createdProvider = await response.json();
      console.log('Utworzono profil:', createdProvider);

      showToast('🎉 Twój profil usługodawcy został utworzony!', 'success');
      navigate('/moj-sklep');
    } catch (error) {
      console.error('Błąd:', error);
      
      // Jeśli API nie działa, zapisz lokalnie (demo mode)
      const existingProviders = JSON.parse(localStorage.getItem('localProviders') || '[]');
      const newProvider = {
        id: Date.now(),
        name: formData.businessName,
        profession: formData.profession,
        category: formData.category,
        description: formData.description,
        location: `${formData.location.city}, ${formData.location.district}`,
        services: formData.services.map(s => s.name),
        features: formData.features,
        priceFrom: Math.min(...formData.services.map(s => s.price)),
        image: imagePreview || 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400&h=400&fit=crop',
        isPremium: false,
        isAvailableToday: true,
        rating: 0,
        reviewsCount: 0,
        distance: '0 km',
        createdAt: new Date().toISOString(),
      };
      
      existingProviders.push(newProvider);
      localStorage.setItem('localProviders', JSON.stringify(existingProviders));
      
      showToast('🎉 Profil utworzony lokalnie (tryb demo)', 'success');
      navigate('/moj-sklep');
    } finally {
      setIsLoading(false);
    }
  };

  const steps = [
    { number: 1, title: 'Podstawowe info', icon: Store },
    { number: 2, title: 'Lokalizacja', icon: MapPin },
    { number: 3, title: 'Usługi i ceny', icon: DollarSign },
    { number: 4, title: 'Szczegóły', icon: FileText },
  ];

  const dayNames: Record<string, string> = {
    monday: 'Poniedziałek',
    tuesday: 'Wtorek',
    wednesday: 'Środa',
    thursday: 'Czwartek',
    friday: 'Piątek',
    saturday: 'Sobota',
    sunday: 'Niedziela',
  };

  return (
    <div className="min-h-screen py-8 px-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-600 hover:text-primary mb-4 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Wróć
          </button>
          <h1 className="text-3xl font-bold mb-2">Dodaj swoją usługę</h1>
          <p className="text-gray-600">
            Stwórz profil swojego salonu lub firmy i zacznij przyjmować klientów
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-between mb-8 bg-white rounded-2xl p-4 shadow-md">
          {steps.map((step, index) => (
            <div key={step.number} className="flex items-center">
              <button
                onClick={() => setCurrentStep(step.number)}
                className={`flex items-center gap-3 px-4 py-2 rounded-xl transition-all ${
                  currentStep === step.number
                    ? 'bg-primary text-white'
                    : currentStep > step.number
                    ? 'bg-green-100 text-green-600'
                    : 'bg-gray-100 text-gray-500'
                }`}
              >
                <step.icon className="w-5 h-5" />
                <span className="hidden sm:inline font-medium">{step.title}</span>
                <span className="sm:hidden font-medium">{step.number}</span>
              </button>
              {index < steps.length - 1 && (
                <div
                  className={`w-8 lg:w-16 h-1 mx-2 rounded ${
                    currentStep > step.number ? 'bg-green-400' : 'bg-gray-200'
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Form Content */}
        <div className="card p-8">
          {/* Step 1: Podstawowe informacje */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <Store className="w-6 h-6 text-primary" />
                Podstawowe informacje
              </h2>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nazwa firmy / salonu <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.businessName}
                  onChange={(e) =>
                    setFormData({ ...formData, businessName: e.target.value })
                  }
                  placeholder="np. Barber Shop Jan Kowalski"
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-primary focus:ring-0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Kategoria <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setFormData({ ...formData, category: cat.id })}
                      className={`p-4 rounded-xl border-2 text-center transition-all ${
                        formData.category === cat.id
                          ? 'border-primary bg-primary/5'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <span className="text-2xl mb-2 block">{cat.icon}</span>
                      <span className="text-sm font-medium">{cat.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tytuł zawodowy
                </label>
                <input
                  type="text"
                  value={formData.profession}
                  onChange={(e) =>
                    setFormData({ ...formData, profession: e.target.value })
                  }
                  placeholder="np. Mistrz Fryzjerstwa, Barber Master"
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-primary focus:ring-0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Zdjęcie profilowe
                </label>
                
                {!imagePreview ? (
                  <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-primary hover:bg-primary/5 transition-all">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Upload className="w-10 h-10 mb-3 text-gray-400" />
                      <p className="mb-2 text-sm text-gray-500">
                        <span className="font-semibold text-primary">Kliknij aby wybrać</span> lub przeciągnij plik
                      </p>
                      <p className="text-xs text-gray-400">PNG, JPG, GIF (max. 5MB)</p>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </label>
                ) : (
                  <div className="relative inline-block">
                    <img
                      src={imagePreview}
                      alt="Podgląd"
                      className="w-48 h-48 object-cover rounded-xl shadow-md"
                    />
                    <button
                      type="button"
                      onClick={removeImage}
                      className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors shadow-md"
                    >
                      <X className="w-4 h-4" />
                    </button>
                    <p className="mt-2 text-xs text-gray-500">
                      {imageFile?.name} ({(imageFile?.size ? imageFile.size / 1024 : 0).toFixed(1)} KB)
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 2: Lokalizacja */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <MapPin className="w-6 h-6 text-primary" />
                Lokalizacja
              </h2>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Miasto <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.location.city}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        location: { ...formData.location, city: e.target.value },
                      })
                    }
                    placeholder="np. Warszawa"
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-primary focus:ring-0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Dzielnica
                  </label>
                  <input
                    type="text"
                    value={formData.location.district}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        location: { ...formData.location, district: e.target.value },
                      })
                    }
                    placeholder="np. Mokotów"
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-primary focus:ring-0"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Adres <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.location.address}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      location: { ...formData.location, address: e.target.value },
                    })
                  }
                  placeholder="np. ul. Marszałkowska 1/2"
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-primary focus:ring-0"
                />
              </div>

              <div className="w-1/3">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Kod pocztowy
                </label>
                <input
                  type="text"
                  value={formData.location.postalCode}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      location: { ...formData.location, postalCode: e.target.value },
                    })
                  }
                  placeholder="00-000"
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-primary focus:ring-0"
                />
              </div>

              {/* Godziny pracy */}
              <div className="mt-8">
                <h3 className="font-semibold mb-4">Godziny pracy</h3>
                <div className="space-y-3">
                  {Object.entries(formData.workingHours).map(([day, hours]) => (
                    <div
                      key={day}
                      className={`flex items-center gap-4 p-3 rounded-xl ${
                        hours.enabled ? 'bg-gray-50' : 'bg-gray-100 opacity-60'
                      }`}
                    >
                      <label className="flex items-center gap-2 w-36">
                        <input
                          type="checkbox"
                          checked={hours.enabled}
                          onChange={() =>
                            toggleWorkingDay(day as keyof typeof formData.workingHours)
                          }
                          className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                        />
                        <span className="font-medium">{dayNames[day]}</span>
                      </label>
                      {hours.enabled && (
                        <div className="flex items-center gap-2">
                          <input
                            type="time"
                            value={hours.from}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                workingHours: {
                                  ...formData.workingHours,
                                  [day]: { ...hours, from: e.target.value },
                                },
                              })
                            }
                            className="px-3 py-2 rounded-lg border border-gray-200"
                          />
                          <span>-</span>
                          <input
                            type="time"
                            value={hours.to}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                workingHours: {
                                  ...formData.workingHours,
                                  [day]: { ...hours, to: e.target.value },
                                },
                              })
                            }
                            className="px-3 py-2 rounded-lg border border-gray-200"
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Usługi i ceny */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <DollarSign className="w-6 h-6 text-primary" />
                Usługi i cennik
              </h2>

              {/* Lista dodanych usług */}
              {formData.services.length > 0 && (
                <div className="space-y-3 mb-6">
                  <h3 className="font-semibold text-gray-700">
                    Twoje usługi ({formData.services.length})
                  </h3>
                  {formData.services.map((service) => (
                    <div
                      key={service.id}
                      className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl"
                    >
                      <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-3">
                        <input
                          type="text"
                          value={service.name}
                          onChange={(e) =>
                            updateService(service.id, 'name', e.target.value)
                          }
                          className="px-3 py-2 rounded-lg border border-gray-200 font-medium"
                          placeholder="Nazwa usługi"
                        />
                        <div className="relative">
                          <input
                            type="number"
                            value={service.price}
                            onChange={(e) =>
                              updateService(service.id, 'price', Number(e.target.value))
                            }
                            className="w-full px-3 py-2 rounded-lg border border-gray-200 pr-10"
                          />
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
                            zł
                          </span>
                        </div>
                        <select
                          value={service.duration}
                          onChange={(e) =>
                            updateService(service.id, 'duration', e.target.value)
                          }
                          className="px-3 py-2 rounded-lg border border-gray-200"
                        >
                          {durations.map((d) => (
                            <option key={d} value={d}>
                              {d}
                            </option>
                          ))}
                        </select>
                        <input
                          type="text"
                          value={service.description}
                          onChange={(e) =>
                            updateService(service.id, 'description', e.target.value)
                          }
                          className="px-3 py-2 rounded-lg border border-gray-200"
                          placeholder="Krótki opis"
                        />
                      </div>
                      <button
                        onClick={() => removeService(service.id)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Formularz nowej usługi */}
              <div className="p-6 border-2 border-dashed border-gray-200 rounded-xl">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <Plus className="w-5 h-5" />
                  Dodaj nową usługę
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">
                      Nazwa usługi *
                    </label>
                    <input
                      type="text"
                      value={newService.name}
                      onChange={(e) =>
                        setNewService({ ...newService, name: e.target.value })
                      }
                      placeholder="np. Strzyżenie męskie"
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-primary focus:ring-0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Cena (zł) *</label>
                    <input
                      type="number"
                      value={newService.price || ''}
                      onChange={(e) =>
                        setNewService({ ...newService, price: Number(e.target.value) })
                      }
                      placeholder="np. 50"
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-primary focus:ring-0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Czas trwania</label>
                    <select
                      value={newService.duration}
                      onChange={(e) =>
                        setNewService({ ...newService, duration: e.target.value })
                      }
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-primary focus:ring-0"
                    >
                      {durations.map((d) => (
                        <option key={d} value={d}>
                          {d}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Opis (opcjonalnie)</label>
                    <input
                      type="text"
                      value={newService.description}
                      onChange={(e) =>
                        setNewService({ ...newService, description: e.target.value })
                      }
                      placeholder="Krótki opis usługi"
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-primary focus:ring-0"
                    />
                  </div>
                </div>
                <button
                  type="button"
                  onClick={addService}
                  className="btn btn-primary"
                >
                  <Plus className="w-5 h-5" />
                  Dodaj usługę
                </button>
              </div>
            </div>
          )}

          {/* Step 4: Szczegóły */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <FileText className="w-6 h-6 text-primary" />
                Dodatkowe informacje
              </h2>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Opis działalności
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Opisz swoją działalność, specjalizację, co wyróżnia Cię od konkurencji..."
                  rows={4}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-primary focus:ring-0 resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <Award className="w-5 h-5" />
                  Doświadczenie i kwalifikacje
                </label>
                <textarea
                  value={formData.experience}
                  onChange={(e) =>
                    setFormData({ ...formData, experience: e.target.value })
                  }
                  placeholder="np. 10 lat doświadczenia, certyfikat XYZ, szkolenia u..."
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-primary focus:ring-0 resize-none"
                />
              </div>

              {/* Cechy / Udogodnienia */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Udogodnienia i cechy
                </label>

                {/* Wybrane cechy */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {formData.features.map((feature) => (
                    <span
                      key={feature}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary rounded-full text-sm"
                    >
                      {feature}
                      <button
                        onClick={() => removeFeature(feature)}
                        className="hover:text-red-500"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>

                {/* Sugerowane cechy */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {suggestedFeatures
                    .filter((f) => !formData.features.includes(f))
                    .map((feature) => (
                      <button
                        key={feature}
                        type="button"
                        onClick={() => addFeature(feature)}
                        className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm hover:bg-gray-200 transition-colors"
                      >
                        + {feature}
                      </button>
                    ))}
                </div>

                {/* Własna cecha */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newFeature}
                    onChange={(e) => setNewFeature(e.target.value)}
                    placeholder="Dodaj własną cechę..."
                    className="flex-1 px-4 py-2 rounded-xl border-2 border-gray-200 focus:border-primary focus:ring-0"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addFeature(newFeature);
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => addFeature(newFeature)}
                    className="btn btn-ghost"
                  >
                    Dodaj
                  </button>
                </div>
              </div>

              {/* Podsumowanie */}
              <div className="mt-8 p-6 bg-gradient-to-r from-primary/5 to-secondary/5 rounded-xl">
                <h3 className="font-bold text-lg mb-4">📋 Podsumowanie</h3>
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Nazwa:</span>{' '}
                    <strong>{formData.businessName || '-'}</strong>
                  </div>
                  <div>
                    <span className="text-gray-500">Kategoria:</span>{' '}
                    <strong>
                      {categories.find((c) => c.id === formData.category)?.name || '-'}
                    </strong>
                  </div>
                  <div>
                    <span className="text-gray-500">Lokalizacja:</span>{' '}
                    <strong>
                      {formData.location.city}
                      {formData.location.district && `, ${formData.location.district}`}
                    </strong>
                  </div>
                  <div>
                    <span className="text-gray-500">Liczba usług:</span>{' '}
                    <strong>{formData.services.length}</strong>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8 pt-6 border-t border-gray-100">
            <button
              type="button"
              onClick={() => setCurrentStep((prev) => Math.max(1, prev - 1))}
              disabled={currentStep === 1}
              className="btn btn-ghost disabled:opacity-50"
            >
              ← Wstecz
            </button>

            {currentStep < 4 ? (
              <button
                type="button"
                onClick={() => setCurrentStep((prev) => Math.min(4, prev + 1))}
                className="btn btn-primary"
              >
                Dalej →
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isLoading}
                className="btn btn-primary disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <span className="animate-spin">⏳</span>
                    Zapisywanie...
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    Utwórz profil
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateProviderPage;
