import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Star, MapPin, Check, Filter, Loader2 } from 'lucide-react';
import { useToast } from '../App';
import providerService, { Provider } from '../services/providerService';

// Mapowanie kategorii URL na nazwy kategorii w danych
const categoryMapping: { [key: string]: string[] } = {
  'fryzjer': ['fryzjer', 'fryzjerstwo', 'hair'],
  'pedicure': ['pedicure', 'pediküre'],
  'paznokcie': ['paznokcie', 'manicure', 'nails', 'stylizacja paznokci'],
  'masaz': ['masaż', 'masaz', 'massage'],
  'makijaz': ['makijaż', 'makijaz', 'makeup', 'wizaż'],
  'pielegnacja-twarzy': ['pielęgnacja twarzy', 'kosmetyka', 'facial'],
  'depilacja': ['depilacja', 'wax', 'waxing'],
  'barber': ['barber', 'fryzjer męski', 'barbershop'],
  'tatuaz': ['tatuaż', 'tatuaz', 'tattoo'],
};

const ProvidersPage = () => {
  const { category } = useParams();
  const { showToast } = useToast();
  
  // Stan danych
  const [providers, setProviders] = useState<Provider[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  
  // Filtry
  const [activeQuickFilters, setActiveQuickFilters] = useState<string[]>([]);
  const [locationFilter, setLocationFilter] = useState('');
  const [minRating, setMinRating] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState('rating');

  // Pobierz usługodawców z Firebase
  const fetchProviders = async (append = false) => {
    if (append) {
      setIsLoadingMore(true);
    } else {
      setIsLoading(true);
    }

    try {
      // Pobierz z Firebase przez providerService
      let allProviders = await providerService.getAll();

      // Filtruj po kategorii jeśli podana
      if (category) {
        const categoryNames = categoryMapping[category] || [category];
        allProviders = allProviders.filter((p) => {
          if (!p.category) return false;
          const providerCategory = p.category.toLowerCase();
          return categoryNames.some(cat => providerCategory.includes(cat.toLowerCase()));
        });
      }

      // Sortowanie
      if (sortBy === 'rating') {
        allProviders.sort((a, b) => b.rating - a.rating);
      } else if (sortBy === 'price-asc') {
        allProviders.sort((a, b) => a.priceFrom - b.priceFrom);
      } else if (sortBy === 'price-desc') {
        allProviders.sort((a, b) => b.priceFrom - a.priceFrom);
      }

      // Filtrowanie po quickFilters
      if (activeQuickFilters.includes('available-today')) {
        allProviders = allProviders.filter((p) => p.isAvailableToday);
      }
      
      if (activeQuickFilters.includes('with-travel')) {
        allProviders = allProviders.filter((p) => p.hasTravel);
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

  // Efekt do pobierania danych przy zmianie filtrów
  useEffect(() => {
    fetchProviders();
  }, [category, locationFilter, minRating, sortBy, activeQuickFilters]);

  const filters = {
    locations: ['Wszystkie dzielnice', 'Centrum', 'Mokotów', 'Wola', 'Praga', 'Ursynów'],
    specializations: [
      'Wszystkie',
      'Fryzjer damski',
      'Fryzjer męski',
      'Fryzjer dziecięcy',
      'Koloryzacja',
      'Fryzury ślubne',
    ],
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
    setLocationFilter('');
    setMinRating(null);
    showToast('Filtry wyczyszczone', 'info');
  };

  const categoryName = category
    ? category.charAt(0).toUpperCase() + category.slice(1)
    : 'Wszystkie usługi';

  // Funkcja do ładowania więcej (gdyby API wspierał paginację)
  const loadMore = () => {
    if (!isLoadingMore && hasMore) {
      fetchProviders(true);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      {/* Breadcrumb */}
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

      {/* Page Header */}
      <div className="text-center mb-10">
        <span className="inline-block bg-primary/10 text-primary px-4 py-1 rounded-full text-sm font-semibold mb-4">
          {categoryName.toUpperCase()}
        </span>
        <h1 className="text-3xl lg:text-4xl font-bold mb-4">Wybierz swojego specjalistę</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Znajdź idealnego specjalistę w Twojej okolicy. Sprawdź opinie, ceny i dostępne terminy.
        </p>
      </div>

      {/* Filters Section */}
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

        {/* Filter Grid */}
        <div className="grid md:grid-cols-4 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">Lokalizacja</label>
            <select 
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value === 'Wszystkie dzielnice' ? '' : e.target.value)}
              className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:border-primary focus:ring-0"
            >
              {filters.locations.map((loc) => (
                <option key={loc} value={loc}>
                  {loc}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">Specjalizacja</label>
            <select className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:border-primary focus:ring-0">
              {filters.specializations.map((spec) => (
                <option key={spec} value={spec.toLowerCase()}>
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
              {filters.ratings.map((rating) => (
                <option key={rating.label} value={rating.value ?? ''}>
                  {rating.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">Zakres cen</label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                placeholder="Od"
                defaultValue={50}
                className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-xl focus:border-primary focus:ring-0"
              />
              <span>-</span>
              <input
                type="number"
                placeholder="Do"
                defaultValue={200}
                className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-xl focus:border-primary focus:ring-0"
              />
            </div>
          </div>
        </div>

        {/* Quick Filters */}
        <div className="flex flex-wrap gap-2">
          {quickFilters.map((filter) => (
            <button
              key={filter.id}
              onClick={() => toggleQuickFilter(filter.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
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

      {/* Results Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="text-gray-600">
          {isLoading ? (
            <span className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              Ładowanie...
            </span>
          ) : (
            <>
              Znaleziono <strong className="text-gray-900">{totalCount} specjalistów</strong> w
              Twojej okolicy
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
            <option value="distance">Najbliżej</option>
          </select>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="w-12 h-12 animate-spin text-primary mb-4" />
          <p className="text-gray-500">Ładowanie specjalistów...</p>
        </div>
      )}

      {/* Empty State */}
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

      {/* Providers Grid */}
      {!isLoading && providers.length > 0 && (
        <div className="grid gap-6">
          {providers.map((provider) => (
            <div
              key={provider.id}
              className="card card-hover p-6 grid md:grid-cols-[200px,1fr,200px] gap-6"
            >
              {/* Provider Image */}
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

              {/* Provider Info */}
              <div>
                <div className="mb-3">
                  <h3 className="text-xl font-bold text-gray-900">{provider.name}</h3>
                  <p className="text-gray-500">{provider.profession}</p>
                </div>

                {/* Rating */}
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

                {/* Location */}
                <div className="flex items-center gap-2 text-gray-500 mb-4">
                  <MapPin className="w-4 h-4" />
                  <span>{provider.locationString}</span>
                </div>

                {/* Services */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {provider.serviceNames.slice(0, 4).map((serviceName, idx) => (
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

                {/* Description */}
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">{provider.description}</p>

                {/* Features */}
                <div className="flex flex-wrap gap-4">
                  {provider.features.slice(0, 3).map((feature) => (
                    <span key={feature} className="flex items-center gap-1 text-sm text-gray-600">
                      <Check className="w-4 h-4 text-green-500" />
                      {feature}
                    </span>
                  ))}
                </div>
              </div>

              {/* Actions */}
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

      {/* Load More Button */}
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

      {/* End of results message */}
      {!isLoading && !hasMore && providers.length > 0 && (
        <div className="text-center mt-10 py-6 border-t border-gray-200">
          <p className="text-gray-500">
            To wszyscy dostępni specjaliści ({totalCount})
          </p>
        </div>
      )}

      {/* Map Toggle Button */}
      <button className="fixed bottom-6 right-6 btn btn-primary shadow-xl">
        <MapPin className="w-5 h-5" />
        <span>Pokaż na mapie</span>
      </button>
    </div>
  );
};

export default ProvidersPage;
