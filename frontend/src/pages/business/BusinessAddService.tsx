import { useState, useEffect, useRef } from 'react';
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
  Clock,
  Search,
  Loader2,
} from 'lucide-react';
import { useAuth, useToast } from '../../App';
import providerService from '../../services/providerService';

// Leaflet imports
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icon
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

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
    lat: number;
    lng: number;
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
  travelRadius: number;
}

interface LocationSuggestion {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
  address: {
    city?: string;
    town?: string;
    village?: string;
    suburb?: string;
    neighbourhood?: string;
    road?: string;
    house_number?: string;
    postcode?: string;
  };
}

// Component to handle map clicks
const MapClickHandler = ({ onLocationSelect }: { onLocationSelect: (lat: number, lng: number) => void }) => {
  useMapEvents({
    click: (e) => {
      onLocationSelect(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
};

// Component to recenter map
const MapRecenter = ({ lat, lng }: { lat: number; lng: number }) => {
  const map = useMap();
  useEffect(() => {
    map.setView([lat, lng], 16);
  }, [lat, lng, map]);
  return null;
};

const BusinessAddService = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user, userData } = useAuth();
  const { showToast } = useToast();

  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [_imageFile, setImageFile] = useState<File | null>(null);
  
  // Location search state
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [locationSuggestions, setLocationSuggestions] = useState<LocationSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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
      lat: 52.2297, // Default: Warszawa
      lng: 21.0122,
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
    travelRadius: 10,
  });

  const [newService, setNewService] = useState<Omit<ServiceItem, 'id'>>({
    name: '',
    price: 0,
    duration: '30 min',
    description: '',
  });

  const [_newFeature, setNewFeature] = useState('');
  const [markerPosition, setMarkerPosition] = useState<[number, number]>([52.2297, 21.0122]);

  // Search location using Nominatim (OpenStreetMap)
  const searchLocation = async (query: string) => {
    if (!query || query.length < 3) {
      setLocationSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    setIsSearching(true);
    
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&countrycodes=pl&addressdetails=1&limit=5`,
        {
          headers: {
            'Accept-Language': 'pl',
          },
        }
      );
      
      const data: LocationSuggestion[] = await response.json();
      setLocationSuggestions(data);
      setShowSuggestions(true);
    } catch (error) {
      console.error('Błąd wyszukiwania:', error);
    } finally {
      setIsSearching(false);
    }
  };

  // Debounced search
  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    searchTimeoutRef.current = setTimeout(() => {
      searchLocation(value);
    }, 500);
  };

  // Select location from suggestions
  const selectLocation = (suggestion: LocationSuggestion) => {
    const lat = parseFloat(suggestion.lat);
    const lng = parseFloat(suggestion.lon);
    const addr = suggestion.address;
    
    setMarkerPosition([lat, lng]);
    setFormData(prev => ({
      ...prev,
      location: {
        city: addr.city || addr.town || addr.village || '',
        district: addr.suburb || addr.neighbourhood || '',
        address: `${addr.road || ''}${addr.house_number ? ' ' + addr.house_number : ''}`.trim(),
        postalCode: addr.postcode || '',
        lat,
        lng,
      },
    }));
    
    setShowSuggestions(false);
    setSearchQuery(suggestion.display_name.split(',')[0]);
  };

  // Reverse geocoding - get address from coordinates
  const reverseGeocode = async (lat: number, lng: number) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`,
        {
          headers: {
            'Accept-Language': 'pl',
          },
        }
      );
      
      const data = await response.json();
      const addr = data.address;
      
      setFormData(prev => ({
        ...prev,
        location: {
          city: addr.city || addr.town || addr.village || '',
          district: addr.suburb || addr.neighbourhood || '',
          address: `${addr.road || ''}${addr.house_number ? ' ' + addr.house_number : ''}`.trim(),
          postalCode: addr.postcode || '',
          lat,
          lng,
        },
      }));
    } catch (error) {
      console.error('Błąd reverse geocoding:', error);
    }
  };

  // Handle map click
  const handleMapClick = (lat: number, lng: number) => {
    setMarkerPosition([lat, lng]);
    reverseGeocode(lat, lng);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        showToast('Wybierz plik graficzny', 'error');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        showToast('Plik za duży (max 5MB)', 'error');
        return;
      }
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  const addService = () => {
    if (!newService.name || newService.price <= 0) {
      showToast('Podaj nazwę i cenę usługi', 'error');
      return;
    }
    const service: ServiceItem = {
      id: Date.now().toString(),
      ...newService,
    };
    setFormData(prev => ({
      ...prev,
      services: [...prev.services, service],
    }));
    setNewService({ name: '', price: 0, duration: '30 min', description: '' });
    showToast('Usługa dodana!', 'success');
  };

  const removeService = (id: string) => {
    setFormData(prev => ({
      ...prev,
      services: prev.services.filter(s => s.id !== id),
    }));
  };

  const addFeature = (feature: string) => {
    if (!feature.trim()) return;
    if (formData.features.includes(feature)) return;
    setFormData(prev => ({
      ...prev,
      features: [...prev.features, feature],
    }));
    setNewFeature('');
  };

  const removeFeature = (feature: string) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.filter(f => f !== feature),
    }));
  };

  const handleSubmit = async () => {
    if (!isAuthenticated) {
      showToast('Musisz być zalogowany', 'error');
      navigate('/auth?redirect=/biznes/dodaj-usluge');
      return;
    }

    if (!formData.businessName) {
      showToast('Podaj nazwę firmy', 'error');
      setCurrentStep(1);
      return;
    }

    if (!formData.category) {
      showToast('Wybierz kategorię', 'error');
      setCurrentStep(1);
      return;
    }

    if (!formData.location.city) {
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
      const ownerId = user?.id?.toString() || '';
      
      console.log('=== DEBUG SAVE ===');
      console.log('user:', user);
      console.log('ownerId:', ownerId);
      console.log('formData:', formData);
      
      if (!ownerId) {
        showToast('Błąd: brak ID użytkownika', 'error');
        setIsLoading(false);
        return;
      }
      
      // Sprawdź czy użytkownik ma już profil w Firebase
      const existingProviders = await providerService.getByOwner(ownerId);
      console.log('existingProviders:', existingProviders);
      const existingProvider = existingProviders[0];
      
      const providerData = {
        // Dane z formularza
        name: formData.businessName,
        profession: formData.profession,
        category: formData.category,
        description: formData.description,
        experience: formData.experience || '',
        location: formData.location,
        services: formData.services.map(s => ({
          ...s,
          id: s.id || `service_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          category: 'Usługi',
        })),
        features: formData.features,
        image: imagePreview || existingProvider?.image || 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400&h=400&fit=crop',
        workingHours: formData.workingHours,
        travelRadius: formData.travelRadius,
        hasTravel: formData.features.includes('Dojazd do klienta'),
        acceptsCard: formData.features.includes('Płatność kartą'),
        
        // Dane użytkownika
        ownerEmail: userData?.email || user?.email || '',
        ownerUsername: userData?.username || user?.username || '',
        ownerPhone: userData?.phone || user?.phone || '',
        ownerAvatar: userData?.avatar || user?.avatar || '',
        isVerified: userData?.isVerified || false,
      };

      if (existingProvider) {
        // Aktualizuj istniejący profil w Firebase
        console.log('Aktualizuję istniejący profil:', existingProvider.id);
        await providerService.update(existingProvider.id, providerData);
        showToast('🎉 Profil zaktualizowany!', 'success');
      } else {
        // Utwórz nowy profil w Firebase
        console.log('Tworzę nowy profil z ownerId:', ownerId);
        console.log('providerData:', providerData);
        const created = await providerService.create(providerData, ownerId);
        console.log('Utworzony provider:', created);
        showToast('🎉 Profil utworzony pomyślnie!', 'success');
      }

      navigate('/biznes/uslugi');
    } catch (error) {
      console.error('Błąd zapisywania:', error);
      showToast('Błąd podczas zapisywania', 'error');
    } finally {
      setIsLoading(false);
    }
  };

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
    'Klimatyzacja',
    'Płatność kartą',
    'Rezerwacja online',
  ];

  const steps = [
    { number: 1, title: 'Podstawowe info', icon: Store },
    { number: 2, title: 'Lokalizacja', icon: MapPin },
    { number: 3, title: 'Usługi i ceny', icon: DollarSign },
    { number: 4, title: 'Szczegóły', icon: FileText },
  ];

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-600 hover:text-emerald-600 mb-4 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Wróć
        </button>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Dodaj nową usługę</h1>
        <p className="text-gray-600">
          Stwórz profil swojej usługi i zacznij przyjmować klientów
        </p>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-between mb-8 bg-white rounded-2xl p-4 shadow-sm">
        {steps.map((step, index) => (
          <div key={step.number} className="flex items-center">
            <button
              onClick={() => setCurrentStep(step.number)}
              className={`flex items-center gap-3 px-4 py-2 rounded-xl transition-all ${
                currentStep === step.number
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white'
                  : currentStep > step.number
                  ? 'bg-green-100 text-green-600'
                  : 'bg-gray-100 text-gray-500'
              }`}
            >
              <step.icon className="w-5 h-5" />
              <span className="hidden sm:inline font-medium">{step.title}</span>
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
      <div className="bg-white rounded-2xl shadow-sm p-8">
        {/* Step 1: Basic Info */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <Store className="w-6 h-6 text-emerald-500" />
              Podstawowe informacje
            </h2>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nazwa firmy / salonu <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.businessName}
                onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                placeholder="np. Beauty Studio Anna"
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-emerald-500 focus:ring-0 focus:outline-none"
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
                        ? 'border-emerald-500 bg-emerald-50'
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
                onChange={(e) => setFormData({ ...formData, profession: e.target.value })}
                placeholder="np. Mistrz Fryzjerstwa"
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-emerald-500 focus:ring-0 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Zdjęcie profilowe
              </label>
              {!imagePreview ? (
                <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-emerald-500 hover:bg-emerald-50 transition-all">
                  <Upload className="w-10 h-10 mb-3 text-gray-400" />
                  <p className="text-sm text-gray-500">
                    <span className="font-semibold text-emerald-600">Kliknij aby wybrać</span>
                  </p>
                  <p className="text-xs text-gray-400">PNG, JPG (max. 5MB)</p>
                  <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                </label>
              ) : (
                <div className="relative inline-block">
                  <img src={imagePreview} alt="Podgląd" className="w-48 h-48 object-cover rounded-xl shadow-md" />
                  <button
                    type="button"
                    onClick={removeImage}
                    className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Step 2: Location with OpenStreetMap */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <MapPin className="w-6 h-6 text-emerald-500" />
              Lokalizacja
            </h2>

            {/* Location Search */}
            <div className="relative z-20">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Wyszukaj adres
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  placeholder="Wpisz adres, np. Marszałkowska 10, Warszawa"
                  className="w-full pl-10 pr-10 py-3 rounded-xl border-2 border-gray-200 focus:border-emerald-500 focus:ring-0 focus:outline-none"
                />
                {isSearching && (
                  <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-emerald-500 animate-spin" />
                )}
              </div>
              
              {/* Suggestions Dropdown - nachodzi na mapę */}
              {showSuggestions && locationSuggestions.length > 0 && (
                <div className="absolute z-50 w-full mt-1 bg-white border-2 border-emerald-300 rounded-xl shadow-2xl max-h-72 overflow-y-auto">
                  <div className="p-2 bg-emerald-50 border-b border-emerald-200 text-sm text-emerald-700 font-medium">
                    📍 Wybierz adres z listy:
                  </div>
                  {locationSuggestions.map((suggestion) => (
                    <button
                      key={suggestion.place_id}
                      onClick={() => selectLocation(suggestion)}
                      className="w-full px-4 py-3 text-left hover:bg-emerald-50 border-b border-gray-100 last:border-0 transition-colors"
                    >
                      <div className="font-medium text-gray-900">
                        {suggestion.display_name.split(',')[0]}
                      </div>
                      <div className="text-sm text-gray-500 truncate">
                        {suggestion.display_name}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* OpenStreetMap */}
            <div className="rounded-xl overflow-hidden border-2 border-gray-200 relative z-10" style={{ height: '300px' }}>
              <MapContainer
                center={markerPosition}
                zoom={13}
                style={{ height: '100%', width: '100%' }}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <Marker position={markerPosition} />
                <MapClickHandler onLocationSelect={handleMapClick} />
                <MapRecenter lat={markerPosition[0]} lng={markerPosition[1]} />
              </MapContainer>
            </div>
            
            <p className="text-sm text-gray-500 flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              Kliknij na mapę aby wybrać dokładną lokalizację
            </p>

            {/* Location Fields */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Miasto <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.location.city}
                  onChange={(e) => setFormData({
                    ...formData,
                    location: { ...formData.location, city: e.target.value }
                  })}
                  placeholder="np. Warszawa"
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-emerald-500 focus:ring-0 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Dzielnica
                </label>
                <input
                  type="text"
                  value={formData.location.district}
                  onChange={(e) => setFormData({
                    ...formData,
                    location: { ...formData.location, district: e.target.value }
                  })}
                  placeholder="np. Mokotów"
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-emerald-500 focus:ring-0 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ulica i numer
                </label>
                <input
                  type="text"
                  value={formData.location.address}
                  onChange={(e) => setFormData({
                    ...formData,
                    location: { ...formData.location, address: e.target.value }
                  })}
                  placeholder="np. ul. Marszałkowska 1"
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-emerald-500 focus:ring-0 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Kod pocztowy
                </label>
                <input
                  type="text"
                  value={formData.location.postalCode}
                  onChange={(e) => setFormData({
                    ...formData,
                    location: { ...formData.location, postalCode: e.target.value }
                  })}
                  placeholder="np. 00-001"
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-emerald-500 focus:ring-0 focus:outline-none"
                />
              </div>
            </div>

            {/* Travel Radius */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Maksymalny zasięg dojazdu: <span className="font-bold text-emerald-600">{formData.travelRadius} km</span>
              </label>
              <input
                type="range"
                min="1"
                max="50"
                value={formData.travelRadius}
                onChange={(e) => setFormData({ ...formData, travelRadius: parseInt(e.target.value) })}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-emerald-500"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>1 km</span>
                <span>25 km</span>
                <span>50 km</span>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Services */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <DollarSign className="w-6 h-6 text-emerald-500" />
              Usługi i ceny
            </h2>

            {/* Added Services */}
            {formData.services.length > 0 && (
              <div className="space-y-3 mb-6">
                <h3 className="font-medium text-gray-700">Dodane usługi ({formData.services.length})</h3>
                {formData.services.map((service) => (
                  <div key={service.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <div>
                      <div className="font-medium text-gray-900">{service.name}</div>
                      <div className="text-sm text-gray-500 flex items-center gap-3">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {service.duration}
                        </span>
                        <span className="font-semibold text-emerald-600">{service.price} zł</span>
                      </div>
                    </div>
                    <button
                      onClick={() => removeService(service.id)}
                      className="p-2 text-red-500 hover:bg-red-100 rounded-lg"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Add New Service */}
            <div className="p-6 bg-emerald-50 rounded-xl">
              <h3 className="font-bold mb-4 flex items-center gap-2">
                <Plus className="w-5 h-5" />
                Dodaj nową usługę
              </h3>
              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Nazwa usługi *</label>
                  <input
                    type="text"
                    value={newService.name}
                    onChange={(e) => setNewService({ ...newService, name: e.target.value })}
                    placeholder="np. Strzyżenie damskie"
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-emerald-500 focus:ring-0 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Cena (zł) *</label>
                  <input
                    type="number"
                    value={newService.price || ''}
                    onChange={(e) => setNewService({ ...newService, price: Number(e.target.value) })}
                    placeholder="np. 80"
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-emerald-500 focus:ring-0 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Czas trwania</label>
                  <select
                    value={newService.duration}
                    onChange={(e) => setNewService({ ...newService, duration: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-emerald-500 focus:ring-0 focus:outline-none"
                  >
                    {durations.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Opis (opcjonalnie)</label>
                  <input
                    type="text"
                    value={newService.description}
                    onChange={(e) => setNewService({ ...newService, description: e.target.value })}
                    placeholder="Krótki opis"
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-emerald-500 focus:ring-0 focus:outline-none"
                  />
                </div>
              </div>
              <button
                type="button"
                onClick={addService}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
              >
                <Plus className="w-5 h-5" />
                Dodaj usługę
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Details */}
        {currentStep === 4 && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <FileText className="w-6 h-6 text-emerald-500" />
              Dodatkowe informacje
            </h2>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Opis działalności
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Opisz swoją działalność..."
                rows={4}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-emerald-500 focus:ring-0 focus:outline-none resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <Award className="w-5 h-5" />
                Doświadczenie i kwalifikacje
              </label>
              <textarea
                value={formData.experience}
                onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                placeholder="np. 10 lat doświadczenia, certyfikaty..."
                rows={3}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-emerald-500 focus:ring-0 focus:outline-none resize-none"
              />
            </div>

            {/* Features */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Udogodnienia
              </label>
              <div className="flex flex-wrap gap-2 mb-4">
                {formData.features.map((feature) => (
                  <span
                    key={feature}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-sm"
                  >
                    {feature}
                    <button onClick={() => removeFeature(feature)} className="hover:text-red-500">×</button>
                  </span>
                ))}
              </div>
              <div className="flex flex-wrap gap-2 mb-4">
                {suggestedFeatures.filter(f => !formData.features.includes(f)).map((feature) => (
                  <button
                    key={feature}
                    type="button"
                    onClick={() => addFeature(feature)}
                    className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm hover:bg-gray-200"
                  >
                    + {feature}
                  </button>
                ))}
              </div>
            </div>

            {/* Summary */}
            <div className="mt-8 p-6 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl">
              <h3 className="font-bold text-lg mb-4">📋 Podsumowanie</h3>
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Nazwa:</span>{' '}
                  <strong>{formData.businessName || '-'}</strong>
                </div>
                <div>
                  <span className="text-gray-500">Kategoria:</span>{' '}
                  <strong>{categories.find(c => c.id === formData.category)?.name || '-'}</strong>
                </div>
                <div>
                  <span className="text-gray-500">Lokalizacja:</span>{' '}
                  <strong>{formData.location.city}{formData.location.district && `, ${formData.location.district}`}</strong>
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
            onClick={() => setCurrentStep(prev => Math.max(1, prev - 1))}
            disabled={currentStep === 1}
            className="px-6 py-2 border border-gray-300 rounded-xl font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            ← Wstecz
          </button>

          {currentStep < 4 ? (
            <button
              type="button"
              onClick={() => setCurrentStep(prev => Math.min(4, prev + 1))}
              className="px-6 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-semibold hover:shadow-lg"
            >
              Dalej →
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isLoading}
              className="px-6 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-semibold hover:shadow-lg disabled:opacity-50 flex items-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Zapisywanie...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Zapisz usługę
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default BusinessAddService;
