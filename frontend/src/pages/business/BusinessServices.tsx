import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Plus,
  Edit2,
  Trash2,
  Eye,
  Clock,
  DollarSign,
  ToggleLeft,
  ToggleRight,
  Search,
  Filter,
} from 'lucide-react';
import { useAuth, useToast } from '../../App';
import { LocalProvider, ServiceData } from '../../types';

interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: string;
  isActive: boolean;
  category: string;
}

interface ProviderProfile {
  id: number;
  name: string;
  profession: string;
  location: string;
  image: string;
  services: Service[];
  isActive: boolean;
}

const BusinessServices = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [profile, setProfile] = useState<ProviderProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = (): void => {
    setIsLoading(true);

    // Load from localStorage (demo mode)
    const localProviders: LocalProvider[] = JSON.parse(localStorage.getItem('localProviders') || '[]');

    if (localProviders.length > 0) {
      // Get the last added provider (for demo)
      const provider = localProviders[localProviders.length - 1];

      // Parse services if stored as JSON string
      let services: Service[] = [];
      if (provider.servicesData) {
        services = provider.servicesData.map((s: ServiceData): Service => ({
          id: s.id || `service-${provider.servicesData?.indexOf(s) || 0}`,
          name: s.name,
          description: s.description || '',
          price: s.price || 0,
          duration: s.duration || '30 min',
          isActive: s.isActive !== false,
          category: s.category || 'Inne',
        }));
      } else if (provider.services && Array.isArray(provider.services)) {
        services = provider.services.map((serviceName: string, index: number): Service => ({
          id: `service-${index}`,
          name: serviceName,
          description: '',
          price: 0,
          duration: '30 min',
          isActive: true,
          category: 'Inne',
        }));
      }
      
      setProfile({
        id: provider.id,
        name: provider.name,
        profession: provider.profession || '',
        location: provider.location || '',
        image: provider.image || '',
        services: services,
        isActive: true,
      });
    }
    
    setIsLoading(false);
  };

  const toggleServiceActive = (serviceId: string): void => {
    if (!profile) return;

    const updatedServices = profile.services.map(s =>
      s.id === serviceId ? { ...s, isActive: !s.isActive } : s
    );

    setProfile({ ...profile, services: updatedServices });

    // Update localStorage
    const localProviders: LocalProvider[] = JSON.parse(localStorage.getItem('localProviders') || '[]');
    if (localProviders.length > 0) {
      localProviders[localProviders.length - 1].servicesData = updatedServices;
      localStorage.setItem('localProviders', JSON.stringify(localProviders));
    }

    showToast('Status usługi zmieniony', 'success');
  };

  const deleteService = (serviceId: string): void => {
    if (!profile) return;

    const updatedServices = profile.services.filter(s => s.id !== serviceId);
    setProfile({ ...profile, services: updatedServices });

    // Update localStorage
    const localProviders: LocalProvider[] = JSON.parse(localStorage.getItem('localProviders') || '[]');
    if (localProviders.length > 0) {
      localProviders[localProviders.length - 1].servicesData = updatedServices;
      localStorage.setItem('localProviders', JSON.stringify(localProviders));
    }

    showToast('Usługa usunięta', 'info');
  };

  const filteredServices = profile?.services.filter(s =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  // Empty state - no profile
  if (!profile) {
    return (
      <div className="max-w-2xl mx-auto text-center py-16">
        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Plus className="w-10 h-10 text-gray-400" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Nie masz jeszcze usług
        </h1>
        <p className="text-gray-600 mb-8">
          Dodaj swoją pierwszą usługę, aby klienci mogli ją znaleźć i zarezerwować.
        </p>
        <Link
          to="/biznes/dodaj-usluge"
          className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
        >
          <Plus className="w-5 h-5" />
          Dodaj pierwszą usługę
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Moje usługi</h1>
          <p className="text-gray-600">
            Zarządzaj swoimi usługami i cenami
          </p>
        </div>
        <Link
          to="/biznes/dodaj-usluge"
          className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
        >
          <Plus className="w-5 h-5" />
          Dodaj usługę
        </Link>
      </div>

      {/* Profile Card */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-start gap-4">
          <img
            src={profile.image || 'https://via.placeholder.com/80'}
            alt={profile.name}
            className="w-20 h-20 rounded-xl object-cover"
          />
          <div className="flex-1">
            <h2 className="text-xl font-bold text-gray-900">{profile.name}</h2>
            <p className="text-gray-500">{profile.profession}</p>
            <p className="text-sm text-gray-400 mt-1">{profile.location}</p>
          </div>
          <Link
            to={`/uslugodawcy/profil/${profile.id}`}
            target="_blank"
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
          >
            <Eye className="w-4 h-4" />
            Podgląd profilu
          </Link>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="bg-white rounded-xl shadow-sm p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Szukaj usługi..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <Filter className="w-5 h-5" />
            Filtruj
          </button>
        </div>
      </div>

      {/* Services List */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-900">
            Wszystkie usługi ({filteredServices.length})
          </h3>
        </div>
        
        {filteredServices.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            {searchQuery ? 'Nie znaleziono usług' : 'Brak usług'}
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredServices.map((service) => (
              <div
                key={service.id}
                className={`p-4 flex items-center justify-between hover:bg-gray-50 transition-colors ${
                  !service.isActive ? 'opacity-60' : ''
                }`}
              >
                <div className="flex items-center gap-4 flex-1">
                  <button
                    onClick={() => toggleServiceActive(service.id)}
                    className={`p-1 rounded transition-colors ${
                      service.isActive ? 'text-emerald-500' : 'text-gray-400'
                    }`}
                    title={service.isActive ? 'Aktywna' : 'Nieaktywna'}
                  >
                    {service.isActive ? (
                      <ToggleRight className="w-8 h-8" />
                    ) : (
                      <ToggleLeft className="w-8 h-8" />
                    )}
                  </button>
                  
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{service.name}</h4>
                    <p className="text-sm text-gray-500 line-clamp-1">
                      {service.description || 'Brak opisu'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right mr-4">
                    <div className="flex items-center gap-1 text-gray-900 font-semibold">
                      <DollarSign className="w-4 h-4" />
                      {service.price} zł
                    </div>
                    <div className="flex items-center gap-1 text-sm text-gray-500">
                      <Clock className="w-3 h-3" />
                      {service.duration}
                    </div>
                  </div>

                  {/* Przyciski akcji - zawsze widoczne */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        showToast('Funkcja edycji w przygotowaniu', 'info');
                      }}
                      className="p-2 text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                      title="Edytuj"
                    >
                      <Edit2 className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => {
                        if (window.confirm('Czy na pewno chcesz usunąć tę usługę?')) {
                          deleteService(service.id);
                        }
                      }}
                      className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Usuń"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BusinessServices;
