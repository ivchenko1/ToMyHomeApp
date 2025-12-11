import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Store,
  Plus,
  Edit2,
  Trash2,
  Eye,
  Settings,
  Calendar,
  DollarSign,
  Users,
  Star,
  TrendingUp,
  MapPin,
  Clock,
  Save,
  X,
} from 'lucide-react';
import { useAuth, useToast } from '../App';

interface ServiceItem {
  id: string;
  name: string;
  price: number;
  duration: string;
  description: string;
  isActive: boolean;
}

interface ShopData {
  id: number;
  businessName: string;
  profession: string;
  category: string;
  description: string;
  location: string;
  image: string;
  rating: number;
  reviewsCount: number;
  services: ServiceItem[];
  features: string[];
  isActive: boolean;
  stats: {
    totalBookings: number;
    monthlyEarnings: number;
    newClients: number;
    avgRating: number;
  };
}

const MyShopPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<'overview' | 'services' | 'settings'>('overview');
  const [isEditing, setIsEditing] = useState(false);
  const [editingService, setEditingService] = useState<string | null>(null);

  // Przykładowe dane sklepu (normalnie z API)
  const [shopData, setShopData] = useState<ShopData>({
    id: 1,
    businessName: 'Barber Shop Premium',
    profession: 'Barber Master',
    category: 'fryzjer',
    description: 'Profesjonalny salon barberski z 10-letnim doświadczeniem. Specjalizujemy się w klasycznych strzyżeniach męskich i pielęgnacji brody.',
    location: 'Warszawa, Mokotów, ul. Puławska 123',
    image: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=400',
    rating: 4.9,
    reviewsCount: 127,
    isActive: true,
    services: [
      { id: '1', name: 'Strzyżenie męskie', price: 50, duration: '30 min', description: 'Klasyczne strzyżenie', isActive: true },
      { id: '2', name: 'Strzyżenie + broda', price: 80, duration: '45 min', description: 'Kompletna stylizacja', isActive: true },
      { id: '3', name: 'Golenie brzytwą', price: 40, duration: '20 min', description: 'Tradycyjne golenie', isActive: true },
      { id: '4', name: 'Modelowanie brody', price: 35, duration: '20 min', description: 'Stylizacja brody', isActive: true },
    ],
    features: ['Dojazd do klienta', 'Produkty premium', 'Kawa gratis', 'Płatność kartą'],
    stats: {
      totalBookings: 234,
      monthlyEarnings: 12500,
      newClients: 28,
      avgRating: 4.9,
    },
  });

  // Nowa usługa
  const [newService, setNewService] = useState({
    name: '',
    price: 0,
    duration: '30 min',
    description: '',
  });

  const [showAddService, setShowAddService] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/auth');
    }
  }, [isAuthenticated, navigate]);

  const durations = ['15 min', '30 min', '45 min', '1h', '1h 30min', '2h'];

  // Dodaj usługę
  const handleAddService = () => {
    if (!newService.name || newService.price <= 0) {
      showToast('Podaj nazwę i cenę usługi', 'error');
      return;
    }

    const service: ServiceItem = {
      id: Date.now().toString(),
      ...newService,
      isActive: true,
    };

    setShopData((prev) => ({
      ...prev,
      services: [...prev.services, service],
    }));

    setNewService({ name: '', price: 0, duration: '30 min', description: '' });
    setShowAddService(false);
    showToast('✅ Usługa dodana!', 'success');
  };

  // Usuń usługę
  const handleDeleteService = (id: string) => {
    if (!window.confirm('Czy na pewno chcesz usunąć tę usługę?')) return;

    setShopData((prev) => ({
      ...prev,
      services: prev.services.filter((s) => s.id !== id),
    }));
    showToast('Usługa usunięta', 'info');
  };

  // Toggle aktywność usługi
  const toggleServiceActive = (id: string) => {
    setShopData((prev) => ({
      ...prev,
      services: prev.services.map((s) =>
        s.id === id ? { ...s, isActive: !s.isActive } : s
      ),
    }));
  };

  // Aktualizuj usługę
  const updateService = (id: string, field: keyof ServiceItem, value: string | number | boolean) => {
    setShopData((prev) => ({
      ...prev,
      services: prev.services.map((s) =>
        s.id === id ? { ...s, [field]: value } : s
      ),
    }));
  };

  // Zapisz zmiany usługi
  const saveServiceEdit = (id: string) => {
    setEditingService(null);
    showToast('Zmiany zapisane!', 'success');
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl overflow-hidden">
              <img
                src={shopData.image}
                alt={shopData.businessName}
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h1 className="text-2xl font-bold">{shopData.businessName}</h1>
              <p className="text-gray-500 flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                {shopData.location}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className={`px-3 py-1 rounded-full text-sm font-medium ${
              shopData.isActive ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'
            }`}>
              {shopData.isActive ? '● Aktywny' : '○ Nieaktywny'}
            </div>
            <Link
              to={`/uslugodawcy/profil/${shopData.id}`}
              className="btn btn-ghost"
            >
              <Eye className="w-5 h-5" />
              Podgląd profilu
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="card p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                <Calendar className="w-5 h-5 text-blue-600" />
              </div>
              <span className="text-gray-500 text-sm">Rezerwacje</span>
            </div>
            <div className="text-2xl font-bold">{shopData.stats.totalBookings}</div>
          </div>

          <div className="card p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-green-600" />
              </div>
              <span className="text-gray-500 text-sm">Przychód (miesiąc)</span>
            </div>
            <div className="text-2xl font-bold">{shopData.stats.monthlyEarnings} zł</div>
          </div>

          <div className="card p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                <Users className="w-5 h-5 text-purple-600" />
              </div>
              <span className="text-gray-500 text-sm">Nowi klienci</span>
            </div>
            <div className="text-2xl font-bold">{shopData.stats.newClients}</div>
          </div>

          <div className="card p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-yellow-100 rounded-xl flex items-center justify-center">
                <Star className="w-5 h-5 text-yellow-600" />
              </div>
              <span className="text-gray-500 text-sm">Średnia ocena</span>
            </div>
            <div className="text-2xl font-bold flex items-center gap-1">
              {shopData.stats.avgRating}
              <span className="text-sm text-gray-500 font-normal">
                ({shopData.reviewsCount} opinii)
              </span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 bg-white rounded-xl p-2 shadow-sm">
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
              activeTab === 'overview'
                ? 'bg-primary text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <TrendingUp className="w-5 h-5 inline mr-2" />
            Przegląd
          </button>
          <button
            onClick={() => setActiveTab('services')}
            className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
              activeTab === 'services'
                ? 'bg-primary text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <DollarSign className="w-5 h-5 inline mr-2" />
            Usługi i ceny
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
              activeTab === 'settings'
                ? 'bg-primary text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Settings className="w-5 h-5 inline mr-2" />
            Ustawienia
          </button>
        </div>

        {/* Tab Content */}
        <div className="card p-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div>
              <h2 className="text-xl font-bold mb-6">Przegląd działalności</h2>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-3">Opis</h3>
                  <p className="text-gray-600">{shopData.description}</p>
                </div>

                <div>
                  <h3 className="font-semibold mb-3">Udogodnienia</h3>
                  <div className="flex flex-wrap gap-2">
                    {shopData.features.map((feature) => (
                      <span
                        key={feature}
                        className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm"
                      >
                        ✓ {feature}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-8 p-6 bg-gradient-to-r from-primary/5 to-secondary/5 rounded-xl">
                <h3 className="font-semibold mb-4">📊 Ostatnie 30 dni</h3>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-3xl font-bold text-primary">+15%</div>
                    <div className="text-sm text-gray-500">Wzrost rezerwacji</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-green-600">+8</div>
                    <div className="text-sm text-gray-500">Nowe opinie</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-purple-600">98%</div>
                    <div className="text-sm text-gray-500">Pozytywnych</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Services Tab */}
          {activeTab === 'services' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold">
                  Twoje usługi ({shopData.services.length})
                </h2>
                <button
                  onClick={() => setShowAddService(true)}
                  className="btn btn-primary"
                >
                  <Plus className="w-5 h-5" />
                  Dodaj usługę
                </button>
              </div>

              {/* Add Service Modal */}
              {showAddService && (
                <div className="mb-6 p-6 border-2 border-dashed border-primary/30 rounded-xl bg-primary/5">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold">Nowa usługa</h3>
                    <button
                      onClick={() => setShowAddService(false)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="grid md:grid-cols-4 gap-4 mb-4">
                    <input
                      type="text"
                      value={newService.name}
                      onChange={(e) => setNewService({ ...newService, name: e.target.value })}
                      placeholder="Nazwa usługi"
                      className="px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-primary focus:ring-0"
                    />
                    <div className="relative">
                      <input
                        type="number"
                        value={newService.price || ''}
                        onChange={(e) => setNewService({ ...newService, price: Number(e.target.value) })}
                        placeholder="Cena"
                        className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-primary focus:ring-0 pr-10"
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">zł</span>
                    </div>
                    <select
                      value={newService.duration}
                      onChange={(e) => setNewService({ ...newService, duration: e.target.value })}
                      className="px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-primary focus:ring-0"
                    >
                      {durations.map((d) => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                    <input
                      type="text"
                      value={newService.description}
                      onChange={(e) => setNewService({ ...newService, description: e.target.value })}
                      placeholder="Opis (opcjonalnie)"
                      className="px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-primary focus:ring-0"
                    />
                  </div>
                  <button onClick={handleAddService} className="btn btn-primary">
                    <Plus className="w-5 h-5" />
                    Dodaj
                  </button>
                </div>
              )}

              {/* Services List */}
              <div className="space-y-3">
                {shopData.services.map((service) => (
                  <div
                    key={service.id}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      service.isActive
                        ? 'border-gray-100 bg-white'
                        : 'border-gray-200 bg-gray-50 opacity-60'
                    }`}
                  >
                    {editingService === service.id ? (
                      // Edit mode
                      <div className="grid md:grid-cols-5 gap-3 items-center">
                        <input
                          type="text"
                          value={service.name}
                          onChange={(e) => updateService(service.id, 'name', e.target.value)}
                          className="px-3 py-2 rounded-lg border border-gray-200"
                        />
                        <div className="relative">
                          <input
                            type="number"
                            value={service.price}
                            onChange={(e) => updateService(service.id, 'price', Number(e.target.value))}
                            className="w-full px-3 py-2 rounded-lg border border-gray-200 pr-8"
                          />
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">zł</span>
                        </div>
                        <select
                          value={service.duration}
                          onChange={(e) => updateService(service.id, 'duration', e.target.value)}
                          className="px-3 py-2 rounded-lg border border-gray-200"
                        >
                          {durations.map((d) => (
                            <option key={d} value={d}>{d}</option>
                          ))}
                        </select>
                        <input
                          type="text"
                          value={service.description}
                          onChange={(e) => updateService(service.id, 'description', e.target.value)}
                          placeholder="Opis"
                          className="px-3 py-2 rounded-lg border border-gray-200"
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={() => saveServiceEdit(service.id)}
                            className="p-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200"
                          >
                            <Save className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => setEditingService(null)}
                            className="p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    ) : (
                      // View mode
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <label className="flex items-center">
                            <input
                              type="checkbox"
                              checked={service.isActive}
                              onChange={() => toggleServiceActive(service.id)}
                              className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary"
                            />
                          </label>
                          <div>
                            <h4 className="font-semibold">{service.name}</h4>
                            {service.description && (
                              <p className="text-sm text-gray-500">{service.description}</p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-6">
                          <div className="text-right">
                            <div className="font-bold text-lg">{service.price} zł</div>
                            <div className="text-sm text-gray-500 flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              {service.duration}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => setEditingService(service.id)}
                              className="p-2 text-gray-400 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                            >
                              <Edit2 className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => handleDeleteService(service.id)}
                              className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {shopData.services.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  <DollarSign className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p>Nie masz jeszcze żadnych usług</p>
                  <button
                    onClick={() => setShowAddService(true)}
                    className="btn btn-primary mt-4"
                  >
                    <Plus className="w-5 h-5" />
                    Dodaj pierwszą usługę
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <div>
              <h2 className="text-xl font-bold mb-6">Ustawienia profilu</h2>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nazwa firmy / salonu
                  </label>
                  <input
                    type="text"
                    value={shopData.businessName}
                    onChange={(e) => setShopData({ ...shopData, businessName: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-primary focus:ring-0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tytuł zawodowy
                  </label>
                  <input
                    type="text"
                    value={shopData.profession}
                    onChange={(e) => setShopData({ ...shopData, profession: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-primary focus:ring-0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Opis
                  </label>
                  <textarea
                    value={shopData.description}
                    onChange={(e) => setShopData({ ...shopData, description: e.target.value })}
                    rows={4}
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-primary focus:ring-0 resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Lokalizacja
                  </label>
                  <input
                    type="text"
                    value={shopData.location}
                    onChange={(e) => setShopData({ ...shopData, location: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-primary focus:ring-0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    URL zdjęcia
                  </label>
                  <input
                    type="url"
                    value={shopData.image}
                    onChange={(e) => setShopData({ ...shopData, image: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-primary focus:ring-0"
                  />
                </div>

                <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={shopData.isActive}
                      onChange={(e) => setShopData({ ...shopData, isActive: e.target.checked })}
                      className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    <div>
                      <span className="font-medium">Profil aktywny</span>
                      <p className="text-sm text-gray-500">
                        Gdy wyłączone, klienci nie zobaczą Twojego profilu
                      </p>
                    </div>
                  </label>
                </div>

                <div className="flex gap-4 pt-4 border-t border-gray-100">
                  <button
                    onClick={() => showToast('Zmiany zapisane!', 'success')}
                    className="btn btn-primary"
                  >
                    <Save className="w-5 h-5" />
                    Zapisz zmiany
                  </button>
                  <button className="btn btn-ghost text-red-500 hover:bg-red-50">
                    <Trash2 className="w-5 h-5" />
                    Usuń profil
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyShopPage;
