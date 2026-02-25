import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Plus,
  Edit2,
  Trash2,
  Eye,
  Clock,
  ToggleLeft,
  ToggleRight,
  Search,
  Filter,
  X,
  Loader2,
  Save,
} from 'lucide-react';
import { useAuth, useToast } from '../../App';
import providerService, { ServiceItem } from '../../services/providerService';

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
  id: string;
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
  const [providerId, setProviderId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modal edycji
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [editForm, setEditForm] = useState({
    name: '',
    description: '',
    price: 0,
    duration: '30 min',
    category: '',
  });
  const [isSaving, setIsSaving] = useState(false);

  const durationOptions = [
    '15 min', '30 min', '45 min', '1 godz', '1.5 godz', '2 godz', '2.5 godz', '3 godz', '4 godz'
  ];

  useEffect(() => {
    loadProfile();
  }, [user]);

  const loadProfile = async () => {
    if (!user?.id) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    
    try {
      // Pobierz profil z Firebase przez ownerId
      const providers = await providerService.getByOwner(user.id.toString());
      
      if (providers.length > 0) {
        const provider = providers[0];
        
        // Mapuj usługi z Firebase na format lokalny
        const services: Service[] = provider.services.map((s: ServiceItem) => ({
          id: s.id,
          name: s.name,
          description: s.description || '',
          price: s.price || 0,
          duration: s.duration || '30 min',
          isActive: s.isActive !== false, // domyślnie aktywne, chyba że explicit false
          category: s.category || 'Inne',
        }));
        
        setProviderId(provider.id);
        setProfile({
          id: provider.id,
          name: provider.name,
          profession: provider.profession || '',
          location: provider.locationString || '',
          image: provider.image || '',
          services: services,
          isActive: provider.isActive,
        });
      }
    } catch (error) {
      console.error('Błąd ładowania profilu z Firebase:', error);
      showToast('Błąd ładowania danych', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleServiceActive = async (serviceId: string) => {
    if (!profile || !providerId) return;
    
    const updatedServices = profile.services.map(s => 
      s.id === serviceId ? { ...s, isActive: !s.isActive } : s
    );
    
    setProfile({ ...profile, services: updatedServices });
    
    // Aktualizuj w Firebase
    try {
      await providerService.update(providerId, {
        services: updatedServices.map(s => ({
          id: s.id,
          name: s.name,
          description: s.description,
          price: s.price,
          duration: s.duration,
          category: s.category,
          isActive: s.isActive, // ← Zapisujemy status aktywności
        })),
      });
      showToast(updatedServices.find(s => s.id === serviceId)?.isActive 
        ? 'Usługa włączona' 
        : 'Usługa wyłączona', 'success');
    } catch (error) {
      console.error('Błąd aktualizacji:', error);
      showToast('Błąd aktualizacji', 'error');
      // Przywróć poprzedni stan
      loadProfile();
    }
  };

  const deleteService = async (serviceId: string) => {
    if (!profile || !providerId) return;
    
    const updatedServices = profile.services.filter(s => s.id !== serviceId);
    setProfile({ ...profile, services: updatedServices });
    
    // Usuń z Firebase
    try {
      await providerService.removeService(providerId, serviceId);
      showToast('Usługa usunięta', 'info');
    } catch (error) {
      console.error('Błąd usuwania:', error);
      showToast('Błąd usuwania usługi', 'error');
      // Przywróć poprzedni stan
      loadProfile();
    }
  };

  // Otwórz modal edycji
  const openEditModal = (service: Service) => {
    setEditingService(service);
    setEditForm({
      name: service.name,
      description: service.description,
      price: service.price,
      duration: service.duration,
      category: service.category,
    });
    setShowEditModal(true);
  };

  // Zapisz edytowaną usługę
  const handleSaveEdit = async () => {
    if (!profile || !providerId || !editingService) return;
    
    if (!editForm.name.trim()) {
      showToast('Nazwa usługi jest wymagana', 'error');
      return;
    }
    
    if (editForm.price <= 0) {
      showToast('Cena musi być większa od 0', 'error');
      return;
    }
    
    setIsSaving(true);
    
    try {
      const updatedServices = profile.services.map(s => 
        s.id === editingService.id 
          ? { 
              ...s, 
              name: editForm.name.trim(),
              description: editForm.description.trim(),
              price: editForm.price,
              duration: editForm.duration,
              category: editForm.category,
            } 
          : s
      );
      
      // Aktualizuj w Firebase
      await providerService.update(providerId, {
        services: updatedServices.map(s => ({
          id: s.id,
          name: s.name,
          description: s.description,
          price: s.price,
          duration: s.duration,
          category: s.category,
          isActive: s.isActive,
        })),
      });
      
      setProfile({ ...profile, services: updatedServices });
      showToast('Usługa zaktualizowana! ✅', 'success');
      setShowEditModal(false);
      setEditingService(null);
    } catch (error) {
      console.error('Błąd aktualizacji:', error);
      showToast('Błąd zapisywania zmian', 'error');
    } finally {
      setIsSaving(false);
    }
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
                    <div className="text-gray-900 font-semibold">
                      {service.price} zł
                    </div>
                    <div className="flex items-center gap-1 text-sm text-gray-500">
                      <Clock className="w-3 h-3" />
                      {service.duration}
                    </div>
                  </div>

                  {/* Przyciski akcji */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openEditModal(service)}
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

      {/* Modal edycji usługi */}
      {showEditModal && editingService && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-900">Edytuj usługę</h3>
                <button 
                  onClick={() => setShowEditModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-5">
              {/* Nazwa */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nazwa usługi *
                </label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="np. Strzyżenie damskie"
                />
              </div>

              {/* Opis */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Opis
                </label>
                <textarea
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 resize-none"
                  placeholder="Krótki opis usługi..."
                />
              </div>

              {/* Cena i czas */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cena (zł) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={editForm.price}
                    onChange={(e) => setEditForm({ ...editForm, price: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Czas trwania
                  </label>
                  <select
                    value={editForm.duration}
                    onChange={(e) => setEditForm({ ...editForm, duration: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  >
                    {durationOptions.map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Kategoria */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Kategoria
                </label>
                <input
                  type="text"
                  value={editForm.category}
                  onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="np. Fryzjer, Manicure"
                />
              </div>
            </div>

            {/* Przyciski */}
            <div className="p-6 border-t border-gray-100 flex gap-3">
              <button
                onClick={() => setShowEditModal(false)}
                className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
              >
                Anuluj
              </button>
              <button
                onClick={handleSaveEdit}
                disabled={isSaving}
                className="flex-1 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isSaving ? (
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
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BusinessServices;
