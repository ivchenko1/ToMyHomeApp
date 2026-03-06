import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Star, MapPin, Check, Filter, Loader2, Navigation } from 'lucide-react';
import { useToast } from '../App';
import providerService, { Provider } from '../services/providerService';

const categoryMapping: { [key: string]: string[] } = {
  'fryzjer': ['fryzjer', 'fryzjerstwo', 'hair'],
  'pedicure': ['pedicure', 'pediküre'],
  'paznokcie': ['paznokcie', 'manicure', 'nails', 'stylizacja paznokci'],
  'masaz': ['masaż', 'masaz', 'massage'],
  'makijaz': ['makijaż', 'makijaz', 'makeup', 'wizaż'],
  'pielegnacja-twarzy': ['pielęgnacja twarzy', 'kosmetyka', 'facial', 'twarz'],
  'twarz': ['twarz', 'pielęgnacja twarzy', 'kosmetyka', 'facial', 'kosmetyka / twarz'],
  'depilacja': ['depilacja', 'wax', 'waxing'],
  'barber': ['barber', 'fryzjer męski', 'barbershop'],
  'tatuaz': ['tatuaż', 'tatuaz', 'tattoo', 'tatuaze'],
  'tatuaze': ['tatuaż', 'tatuaz', 'tattoo', 'tatuaze'],
  'kosmetyka': ['kosmetyka', 'kosmetyczka', 'beauty', 'twarz', 'pielęgnacja twarzy', 'kosmetyka / twarz'],
  'brwi-rzesy': ['brwi', 'rzęsy', 'lashes', 'brows'],
  'inne': ['inne', 'other'],
};

const polishCities = [
  'Wszystkie miasta',
  'Warszawa',
  'Kraków',
  'Łódź',
  'Wrocław',
  'Poznań',
  'Gdańsk',
  'Szczecin',
  'Bydgoszcz',
  'Lublin',
  'Białystok',
  'Katowice',
  'Gdynia',
  'Częstochowa',
  'Radom',
  'Sosnowiec',
  'Toruń',
  'Kielce',
  'Rzeszów',
  'Gliwice',
  'Zabrze',
  'Olsztyn',
  'Bielsko-Biała',
  'Bytom',
  'Zielona Góra',
  'Rybnik',
  'Ruda Śląska',
  'Opole',
  'Tychy',
  'Gorzów Wielkopolski',
  'Płock',
  'Dąbrowa Górnicza',
  'Elbląg',
  'Wałbrzych',
  'Włocławek',
  'Tarnów',
  'Chorzów',
  'Koszalin',
];

const specializations = [
  'Wszystkie specjalizacje',
  'Fryzjer',
  'Barber',
  'Kosmetyka',
  'Paznokcie / Manicure',
  'Pedicure',
  'Masaż',
  'Makijaż',
  'Pielęgnacja twarzy',
  'Depilacja',
  'Brwi i rzęsy',
  'Tatuaż',
  'Inne usługi',
];

const specializationToCategory: { [key: string]: string[] } = {
  'Fryzjer': ['fryzjer', 'fryzjerstwo', 'hair'],
  'Barber': ['barber', 'fryzjer męski', 'barbershop'],
  'Kosmetyka': ['kosmetyka', 'kosmetyczka', 'beauty', 'twarz', 'pielęgnacja twarzy'],
  'Paznokcie / Manicure': ['paznokcie', 'manicure', 'nails', 'stylizacja paznokci'],
  'Pedicure': ['pedicure', 'pediküre'],
  'Masaż': ['masaż', 'masaz', 'massage'],
  'Makijaż': ['makijaż', 'makijaz', 'makeup', 'wizaż'],
  'Pielęgnacja twarzy': ['pielęgnacja twarzy', 'kosmetyka', 'facial', 'twarz'],
  'Depilacja': ['depilacja', 'wax', 'waxing'],
  'Brwi i rzęsy': ['brwi', 'rzęsy', 'lashes', 'brows'],
  'Tatuaż': ['tatuaż', 'tatuaz', 'tattoo'],
  'Inne usługi': ['inne', 'other'],
};

const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

const ProvidersPage = () => {
  const { category } = useParams();
  const { showToast } = useToast();
  
  const [providers, setProviders] = useState<Provider[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  
  const [activeQuickFilters, setActiveQuickFilters] = useState<string[]>([]);
  const [cityFilter, setCityFilter] = useState('Wszystkie miasta');
  const [specializationFilter, setSpecializationFilter] = useState('Wszystkie specjalizacje');
  const [minRating, setMinRating] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState('rating');
  
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);

  const getUserLocation = () => {
    if (!navigator.geolocation) {
      showToast('Twoja przeglądarka nie wspiera geolokalizacji', 'error');
      return;
    }

    setIsLoadingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
        setIsLoadingLocation(false);
        showToast('Lokalizacja pobrana!', 'success');
      },
      (error) => {
        console.error('Błąd geolokalizacji:', error);
        setIsLoadingLocation(false);
        switch(error.code) {
          case error.PERMISSION_DENIED:
            showToast('Brak zgody na lokalizację. Włącz w ustawieniach przeglądarki.', 'error');
            break;
          case error.POSITION_UNAVAILABLE:
            showToast('Nie można ustalić lokalizacji', 'error');
            break;
          case error.TIMEOUT:
            showToast('Przekroczono czas oczekiwania na lokalizację', 'error');
            break;
          default:
            showToast('Błąd pobierania lokalizacji', 'error');
        }
        setSortBy('rating');
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  useEffect(() => {
    if (sortBy === 'distance' && !userLocation) {
      getUserLocation();
    }
  }, [sortBy]);

  const fetchProviders = async (append = false) => {
    if (append) {
      setIsLoadingMore(true);
    } else {
      setIsLoading(true);
    }

    try {
      let allProviders = await providerService.getAll();

      if (category) {
        const categoryNames = categoryMapping[category] || [category];
        console.log('🔍 Filtrowanie po kategorii:', category);
        console.log('🔍 Szukane nazwy:', categoryNames);
        console.log('🔍 Wszystkie kategorie providerów:', allProviders.map(p => p.category));
        
        allProviders = allProviders.filter((p) => {
          if (!p.category) return false;
          const providerCategory = p.category.toLowerCase();
          const matches = categoryNames.some(cat => providerCategory.includes(cat.toLowerCase()));
          console.log(`🔍 Provider "${p.name}" kategoria "${p.category}" -> matches: ${matches}`);
          return matches;
        });
        
        console.log('🔍 Po filtrowaniu:', allProviders.length, 'wyników');
      }

      if (specializationFilter && specializationFilter !== 'Wszystkie specjalizacje') {
        const specCategories = specializationToCategory[specializationFilter] || [];
        if (specCategories.length > 0) {
          allProviders = allProviders.filter((p) => {
            if (!p.category) return false;
            const providerCategory = p.category.toLowerCase();
            return specCategories.some(cat => providerCategory.includes(cat.toLowerCase()));
          });
        }
      }

      if (cityFilter && cityFilter !== 'Wszystkie miasta') {
        allProviders = allProviders.filter((p) => {
          const location = p.locationString?.toLowerCase() || '';
          const city = p.location?.city?.toLowerCase() || '';
          return location.includes(cityFilter.toLowerCase()) || city.includes(cityFilter.toLowerCase());
        });
      }

      if (minRating) {
        allProviders = allProviders.filter((p) => p.rating >= minRating);
      }

      if (activeQuickFilters.includes('available-today')) {
        allProviders = allProviders.filter((p) => p.isAvailableToday);
      }
      
      if (activeQuickFilters.includes('with-travel')) {
        allProviders = allProviders.filter((p) => p.hasTravel);
      }

      if (sortBy === 'rating') {
        allProviders.sort((a, b) => b.rating - a.rating);
      } else if (sortBy === 'price-asc') {
        allProviders.sort((a, b) => a.priceFrom - b.priceFrom);
      } else if (sortBy === 'price-desc') {
        allProviders.sort((a, b) => b.priceFrom - a.priceFrom);
      } else if (sortBy === 'distance' && userLocation) {
        allProviders = allProviders.map(p => {
          let distance = Infinity;
          if (p.location?.lat && p.location?.lng) {
            distance = calculateDistance(
              userLocation.lat, 
              userLocation.lng, 
              p.location.lat, 
              p.location.lng
            );
          }
          return { ...p, _distance: distance };
        }).sort((a: any, b: any) => a._distance - b._distance);
      }

      setProviders(allProviders);
      setTotalCount(allProviders.length);
      setHasMore(false);
    } catch (error) {
      console.error('Błąd pobierania usługodawców:', error);
      showToast('Błąd ładowania danych', 'error');
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  };

  useEffect(() => {
    fetchProviders();
  }, [category, cityFilter, specializationFilter, minRating, sortBy, activeQuickFilters, userLocation]);

  const filters = {
    ratings: [
      { label: 'Wszystkie oceny', value: null },
      { label: '⭐⭐⭐⭐⭐ 5.0', value: 5 },
      { label: '⭐⭐⭐⭐⭐ 4.5+', value: 4.5 },
      { label: '⭐⭐⭐⭐ 4.0+', value: 4 },
      { label: '⭐⭐⭐ 3.5+', value: 3.5 },
    ],
  };

  const quickFilters = [
    { id: 'available-today', label: 'Dostępny dziś' },
    { id: 'with-travel', label: 'Z dojazdem' },
    { id: 'recommended', label: 'Polecany' },
    { id: 'discount', label: 'Nowi użytkownicy -20%' },
    { id: 'weekend', label: 'Weekend' },
  ];

  const toggleQuickFilter = (filterId: string) => {
    setActiveQuickFilters((prev) =>
      prev.includes(filterId) ? prev.filter((f) => f !== filterId) : [...prev, filterId]
    );
  };

  const clearAllFilters = () => {
    setActiveQuickFilters([]);
    setCityFilter('Wszystkie miasta');
    setSpecializationFilter('Wszystkie specjalizacje');
    setMinRating(null);
    setSortBy('rating');
    showToast('Filtry wyczyszczone', 'info');
  };

  const categoryName = category
    ? category.charAt(0).toUpperCase() + category.slice(1)
    : 'Wszystkie usługi';

  const loadMore = () => {
    if (!isLoadingMore && hasMore) {
      fetchProviders(true);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link to="/" className="hover:text-primary transition-colors">
          Strona główna
        </Link>
        <span>/</span>
        <Link to="/uslugodawcy" className="hover:text-primary transition-colors">
          Usługi
        </Link>
        {category && (
          <>
            <span>/</span>
            <span className="text-gray-900">{categoryName}</span>
          </>
        )}
      </nav>

      <div className="text-center mb-10">
        <span className="inline-block bg-primary/10 text-primary px-4 py-1 rounded-full text-sm font-semibold mb-4">
          {categoryName.toUpperCase()}
        </span>
        <h1 className="text-3xl lg:text-4xl font-bold mb-4">Wybierz swojego specjalistę</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Znajdź idealnego specjalistę w Twojej okolicy. Sprawdź opinie, ceny i dostępne terminy.
        </p>
      </div>

      <section className="card p-6 mb-8">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-bold flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filtry wyszukiwania
          </h3>
          <button
            onClick={clearAllFilters}
            className="text-sm text-primary hover:underline"
          >
            Wyczyść filtry
          </button>
        </div>

        <div className="grid md:grid-cols-4 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">Miasto</label>
            <select 
              value={cityFilter}
              onChange={(e) => setCityFilter(e.target.value)}
              className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:border-primary focus:ring-0"
            >
              {polishCities.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">Specjalizacja</label>
            <select 
              value={specializationFilter}
              onChange={(e) => setSpecializationFilter(e.target.value)}
              className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:border-primary focus:ring-0"
            >
              {specializations.map((spec) => (
                <option key={spec} value={spec}>
                  {spec}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">Ocena</label>
            <select 
              value={minRating ?? ''}
              onChange={(e) => setMinRating(e.target.value ? parseFloat(e.target.value) : null)}
              className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:border-primary focus:ring-0"
            >
              {filters.ratings.map((r) => (
                <option key={r.label} value={r.value ?? ''}>
                  {r.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">Twoja lokalizacja</label>
            <button
              onClick={getUserLocation}
              disabled={isLoadingLocation}
              className={`w-full px-4 py-2.5 border-2 rounded-xl flex items-center justify-center gap-2 transition-colors ${
                userLocation 
                  ? 'border-green-500 bg-green-50 text-green-700' 
                  : 'border-gray-200 hover:border-primary hover:text-primary'
              }`}
            >
              {isLoadingLocation ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Pobieranie...
                </>
              ) : userLocation ? (
                <>
                  <Navigation className="w-4 h-4" />
                  Lokalizacja pobrana
                </>
              ) : (
                <>
                  <Navigation className="w-4 h-4" />
                  Pobierz lokalizację
                </>
              )}
            </button>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {quickFilters.map((filter) => (
            <button
              key={filter.id}
              onClick={() => toggleQuickFilter(filter.id)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                activeQuickFilters.includes(filter.id)
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </section>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="text-gray-600">
          {isLoading ? (
            <span className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              Ładowanie...
            </span>
          ) : (
            <>
              Znaleziono <strong className="text-gray-900">{totalCount} specjalistów</strong>
              {cityFilter !== 'Wszystkie miasta' && ` w mieście ${cityFilter}`}
            </>
          )}
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-500">Sortuj:</span>
          <select 
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-2 border-2 border-gray-200 rounded-xl focus:border-primary focus:ring-0 text-sm"
          >
            <option value="rating">Najwyżej oceniane</option>
            <option value="recommended">Polecane</option>
            <option value="price-asc">Cena: od najniższej</option>
            <option value="price-desc">Cena: od najwyższej</option>
            <option value="distance">Najbliżej mnie</option>
          </select>
        </div>
      </div>

      {sortBy === 'distance' && !userLocation && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6 flex items-center gap-3">
          <Navigation className="w-5 h-5 text-yellow-600" />
          <p className="text-yellow-700 text-sm">
            Aby sortować po odległości, kliknij "Pobierz lokalizację" lub zezwól przeglądarce na dostęp do lokalizacji.
          </p>
        </div>
      )}

      {isLoading && (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="w-12 h-12 animate-spin text-primary mb-4" />
          <p className="text-gray-500">Ładowanie specjalistów...</p>
        </div>
      )}

      {!isLoading && providers.length === 0 && (
        <div className="text-center py-20">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-xl font-bold mb-2">Brak wyników</h3>
          <p className="text-gray-500 mb-4">
            Nie znaleziono specjalistów spełniających kryteria wyszukiwania.
          </p>
          <button onClick={clearAllFilters} className="btn btn-primary">
            Wyczyść filtry
          </button>
        </div>
      )}

      {!isLoading && providers.length > 0 && (
        <div className="grid gap-6">
          {providers.map((provider: any) => (
            <div
              key={provider.id}
              className="card card-hover p-6 grid md:grid-cols-[200px,1fr,200px] gap-6"
            >
              <div className="relative">
                <img
                  src={provider.image}
                  alt={provider.name}
                  className="w-full h-48 md:h-full object-cover rounded-xl"
                />
                {provider.isPremium && (
                  <div className="absolute top-3 left-3 bg-gradient-to-r from-amber-400 to-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                    ⭐ Premium
                  </div>
                )}
              </div>

              <div>
                <div className="mb-3">
                  <h3 className="text-xl font-bold text-gray-900">{provider.name}</h3>
                  <p className="text-gray-500">{provider.profession}</p>
                </div>

                <div className="flex items-center gap-2 mb-3">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < Math.floor(provider.rating)
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="font-bold text-gray-900">{provider.rating}</span>
                  <span className="text-gray-500">({provider.reviewsCount} opinii)</span>
                </div>

                <div className="flex items-center gap-2 text-gray-500 mb-4">
                  <MapPin className="w-4 h-4" />
                  <span>{provider.locationString}</span>
                  {sortBy === 'distance' && provider._distance && provider._distance !== Infinity && (
                    <span className="ml-2 px-2 py-0.5 bg-primary/10 text-primary rounded-full text-xs font-medium">
                      {provider._distance < 1 
                        ? `${Math.round(provider._distance * 1000)} m` 
                        : `${provider._distance.toFixed(1)} km`}
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap gap-2 mb-4">
                  {provider.serviceNames.slice(0, 4).map((serviceName: string, idx: number) => (
                    <span
                      key={idx}
                      className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm"
                    >
                      {serviceName}
                    </span>
                  ))}
                  {provider.serviceNames.length > 4 && (
                    <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm">
                      +{provider.serviceNames.length - 4}
                    </span>
                  )}
                </div>

                <p className="text-gray-600 text-sm mb-4 line-clamp-2">{provider.description}</p>

                <div className="flex flex-wrap gap-4">
                  {provider.features.slice(0, 3).map((feature: string) => (
                    <span key={feature} className="flex items-center gap-1 text-sm text-gray-600">
                      <Check className="w-4 h-4 text-green-500" />
                      {feature}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex flex-col justify-between">
                <div>
                  <div
                    className={`flex items-center gap-2 text-sm mb-4 ${
                      provider.isAvailableToday ? 'text-green-600' : 'text-orange-500'
                    }`}
                  >
                    <span
                      className={`w-2 h-2 rounded-full ${
                        provider.isAvailableToday ? 'bg-green-500' : 'bg-orange-500'
                      }`}
                    />
                    {provider.isAvailableToday ? 'Dostępna dziś' : 'Zajęta dziś'}
                  </div>

                  <div className="mb-4">
                    <div className="text-sm text-gray-500">Od</div>
                    <div className="text-3xl font-bold text-gray-900">
                      {provider.priceFrom}{' '}
                      <span className="text-base font-normal text-gray-500">zł</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Link
                    to={`/uslugodawcy/profil/${provider.id}`}
                    className="w-full btn btn-primary justify-center"
                  >
                    Zarezerwuj
                  </Link>
                  <Link
                    to={`/uslugodawcy/profil/${provider.id}`}
                    className="w-full btn btn-ghost justify-center"
                  >
                    Zobacz profil
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {!isLoading && hasMore && providers.length > 0 && (
        <div className="flex justify-center mt-10">
          <button
            onClick={loadMore}
            disabled={isLoadingMore}
            className="btn btn-ghost px-8 py-3 text-lg"
          >
            {isLoadingMore ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
                Ładowanie...
              </>
            ) : (
              'Załaduj więcej'
            )}
          </button>
        </div>
      )}

      {!isLoading && !hasMore && providers.length > 0 && (
        <div className="text-center mt-10 py-6 border-t border-gray-200">
          <p className="text-gray-500">
            To wszyscy dostępni specjaliści ({totalCount})
          </p>
        </div>
      )}

      <button className="fixed bottom-6 right-6 btn btn-primary shadow-xl">
        <MapPin className="w-5 h-5" />
        <span>Pokaż na mapie</span>
      </button>
    </div>
  );
};

export default ProvidersPage;
