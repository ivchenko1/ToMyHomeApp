import { useState, useEffect } from 'react';
import {
  Search,
  CheckCircle,
  XCircle,
  Clock,
  MapPin,
  Star,
  Loader2,
  Eye,
  Check,
  X,
  Trash2,
  Pause,
  Play,
} from 'lucide-react';
import adminService, { AdminProvider } from '../../services/adminService';
import { useToast, useAuth } from '../../App';

const AdminProviders = () => {
  const { showToast } = useToast();
  const { user } = useAuth();
  const [providers, setProviders] = useState<AdminProvider[]>([]);
  const [filteredProviders, setFilteredProviders] = useState<AdminProvider[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'verified' | 'rejected' | 'suspended'>('all');
  const [selectedProvider, setSelectedProvider] = useState<AdminProvider | null>(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    loadProviders();
  }, []);

  useEffect(() => {
    filterProviders();
  }, [providers, searchQuery, filterStatus]);

  const loadProviders = async () => {
    setIsLoading(true);
    try {
      const data = await adminService.getAllProviders();
      setProviders(data);
    } catch (error) {
      console.error('Error loading providers:', error);
      showToast('Błąd ładowania usługodawców', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const filterProviders = () => {
    let filtered = [...providers];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (provider) =>
          provider.name?.toLowerCase().includes(query) ||
          provider.profession?.toLowerCase().includes(query) ||
          provider.locationString?.toLowerCase().includes(query)
      );
    }

    // Status filter
    switch (filterStatus) {
      case 'pending':
        filtered = filtered.filter((p) => !p.isVerified && !p.rejectedAt);
        break;
      case 'verified':
        filtered = filtered.filter((p) => p.isVerified && p.isActive !== false);
        break;
      case 'rejected':
        filtered = filtered.filter((p) => p.rejectedAt);
        break;
      case 'suspended':
        filtered = filtered.filter((p) => p.isVerified && p.isActive === false);
        break;
    }

    setFilteredProviders(filtered);
  };

  const handleVerify = async (provider: AdminProvider) => {
    if (!user?.id) return;
    
    setActionLoading(true);
    try {
      const success = await adminService.verifyProvider(provider.id, user.id);
      if (success) {
        showToast('Usługodawca zweryfikowany pomyślnie', 'success');
        loadProviders();
      } else {
        showToast('Błąd weryfikacji', 'error');
      }
    } catch (error) {
      showToast('Błąd weryfikacji', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!selectedProvider || !rejectReason.trim()) {
      showToast('Podaj powód odrzucenia', 'error');
      return;
    }

    setActionLoading(true);
    try {
      const success = await adminService.rejectProvider(selectedProvider.id, rejectReason);
      if (success) {
        showToast('Usługodawca odrzucony', 'success');
        setShowRejectModal(false);
        setRejectReason('');
        loadProviders();
      } else {
        showToast('Błąd odrzucania', 'error');
      }
    } catch (error) {
      showToast('Błąd odrzucania', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleSuspend = async (provider: AdminProvider) => {
    const reason = window.prompt('Podaj powód zawieszenia:');
    if (!reason) return;

    setActionLoading(true);
    try {
      const success = await adminService.suspendProvider(provider.id, reason);
      if (success) {
        showToast('Usługodawca zawieszony', 'success');
        loadProviders();
      } else {
        showToast('Błąd zawieszania', 'error');
      }
    } catch (error) {
      showToast('Błąd zawieszania', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleActivate = async (provider: AdminProvider) => {
    setActionLoading(true);
    try {
      const success = await adminService.activateProvider(provider.id);
      if (success) {
        showToast('Usługodawca aktywowany', 'success');
        loadProviders();
      } else {
        showToast('Błąd aktywacji', 'error');
      }
    } catch (error) {
      showToast('Błąd aktywacji', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (provider: AdminProvider) => {
    if (!window.confirm(`Czy na pewno chcesz usunąć profil ${provider.name}? Ta operacja jest nieodwracalna.`)) {
      return;
    }

    setActionLoading(true);
    try {
      const success = await adminService.deleteProvider(provider.id);
      if (success) {
        showToast('Profil usunięty', 'success');
        loadProviders();
      } else {
        showToast('Błąd usuwania', 'error');
      }
    } catch (error) {
      showToast('Błąd usuwania', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (provider: AdminProvider) => {
    if (provider.rejectedAt) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-700">
          <XCircle className="w-3 h-3" />
          Odrzucony
        </span>
      );
    }
    if (!provider.isVerified) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full bg-amber-100 text-amber-700">
          <Clock className="w-3 h-3" />
          Oczekuje
        </span>
      );
    }
    if (provider.isActive === false) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-700">
          <Pause className="w-3 h-3" />
          Zawieszony
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-700">
        <CheckCircle className="w-3 h-3" />
        Zweryfikowany
      </span>
    );
  };

  const filters = [
    { value: 'all', label: 'Wszyscy', count: providers.length },
    { value: 'pending', label: 'Oczekujące', count: providers.filter((p) => !p.isVerified && !p.rejectedAt).length },
    { value: 'verified', label: 'Zweryfikowani', count: providers.filter((p) => p.isVerified && p.isActive !== false).length },
    { value: 'suspended', label: 'Zawieszeni', count: providers.filter((p) => p.isVerified && p.isActive === false).length },
    { value: 'rejected', label: 'Odrzuceni', count: providers.filter((p) => p.rejectedAt).length },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-red-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Usługodawcy</h1>
        <p className="text-gray-500">Weryfikuj i zarządzaj profilami usługodawców</p>
      </div>

      {/* Pending Alert */}
      {filters[1].count > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center gap-4">
          <div className="p-2 bg-amber-100 rounded-lg">
            <Clock className="w-6 h-6 text-amber-600" />
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-amber-800">
              {filters[1].count} usługodawców oczekuje na weryfikację
            </h4>
            <p className="text-sm text-amber-600">
              Sprawdź profile i zatwierdź lub odrzuć
            </p>
          </div>
          <button
            onClick={() => setFilterStatus('pending')}
            className="px-4 py-2 bg-amber-600 text-white font-medium rounded-lg hover:bg-amber-700 transition-colors"
          >
            Pokaż oczekujące
          </button>
        </div>
      )}

      {/* Filters & Search */}
      <div className="bg-white rounded-2xl shadow-sm p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Szukaj po nazwie, zawodzie lub lokalizacji..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:border-red-500 focus:ring-0"
            />
          </div>

          {/* Filter Tabs */}
          <div className="flex flex-wrap gap-2">
            {filters.map((filter) => (
              <button
                key={filter.value}
                onClick={() => setFilterStatus(filter.value as any)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                  filterStatus === filter.value
                    ? 'bg-red-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {filter.label} ({filter.count})
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Providers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredProviders.length === 0 ? (
          <div className="col-span-full bg-white rounded-2xl p-12 text-center">
            <p className="text-gray-500">Nie znaleziono usługodawców</p>
          </div>
        ) : (
          filteredProviders.map((provider) => (
            <div key={provider.id} className="bg-white rounded-2xl shadow-sm overflow-hidden">
              {/* Provider Image */}
              <div className="relative h-48">
                <img
                  src={provider.image || 'https://via.placeholder.com/400x200?text=Brak+zdjęcia'}
                  alt={provider.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-3 right-3">
                  {getStatusBadge(provider)}
                </div>
              </div>

              {/* Provider Info */}
              <div className="p-4">
                <h3 className="font-bold text-lg text-gray-900">{provider.name}</h3>
                <p className="text-gray-600">{provider.profession}</p>
                
                <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {provider.locationString || 'Brak lokalizacji'}
                  </span>
                  {provider.rating > 0 && (
                    <span className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                      {provider.rating.toFixed(1)} ({provider.reviewsCount})
                    </span>
                  )}
                </div>

                <p className="text-xs text-gray-400 mt-2">
                  Utworzono: {new Date(provider.createdAt).toLocaleDateString('pl-PL')}
                </p>

                {/* Actions */}
                <div className="flex gap-2 mt-4 pt-4 border-t border-gray-100">
                  {/* Pending - show verify/reject */}
                  {!provider.isVerified && !provider.rejectedAt && (
                    <>
                      <button
                        onClick={() => handleVerify(provider)}
                        disabled={actionLoading}
                        className="flex-1 flex items-center justify-center gap-1 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                      >
                        <Check className="w-4 h-4" />
                        Zatwierdź
                      </button>
                      <button
                        onClick={() => {
                          setSelectedProvider(provider);
                          setShowRejectModal(true);
                        }}
                        disabled={actionLoading}
                        className="flex-1 flex items-center justify-center gap-1 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                      >
                        <X className="w-4 h-4" />
                        Odrzuć
                      </button>
                    </>
                  )}

                  {/* Verified - show suspend/delete */}
                  {provider.isVerified && provider.isActive !== false && (
                    <>
                      <a
                        href={`/#/uslugodawcy/profil/${provider.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 flex items-center justify-center gap-1 py-2 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                        Podgląd
                      </a>
                      <button
                        onClick={() => handleSuspend(provider)}
                        disabled={actionLoading}
                        className="flex-1 flex items-center justify-center gap-1 py-2 bg-amber-100 text-amber-700 font-medium rounded-lg hover:bg-amber-200 transition-colors disabled:opacity-50"
                      >
                        <Pause className="w-4 h-4" />
                        Zawieś
                      </button>
                    </>
                  )}

                  {/* Suspended - show activate */}
                  {provider.isVerified && provider.isActive === false && (
                    <>
                      <button
                        onClick={() => handleActivate(provider)}
                        disabled={actionLoading}
                        className="flex-1 flex items-center justify-center gap-1 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                      >
                        <Play className="w-4 h-4" />
                        Aktywuj
                      </button>
                      <button
                        onClick={() => handleDelete(provider)}
                        disabled={actionLoading}
                        className="py-2 px-4 bg-red-100 text-red-700 font-medium rounded-lg hover:bg-red-200 transition-colors disabled:opacity-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </>
                  )}

                  {/* Rejected - show delete */}
                  {provider.rejectedAt && (
                    <button
                      onClick={() => handleDelete(provider)}
                      disabled={actionLoading}
                      className="flex-1 flex items-center justify-center gap-1 py-2 bg-red-100 text-red-700 font-medium rounded-lg hover:bg-red-200 transition-colors disabled:opacity-50"
                    >
                      <Trash2 className="w-4 h-4" />
                      Usuń
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Reject Modal */}
      {showRejectModal && selectedProvider && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              Odrzuć usługodawcę
            </h3>
            <p className="text-gray-600 mb-4">
              Zamierzasz odrzucić profil <strong>{selectedProvider.name}</strong>.
              Podaj powód odrzucenia (użytkownik go zobaczy):
            </p>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Powód odrzucenia..."
              rows={3}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-red-500 focus:ring-0 resize-none mb-4"
            />
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setRejectReason('');
                }}
                className="flex-1 py-2.5 border border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors"
              >
                Anuluj
              </button>
              <button
                onClick={handleReject}
                disabled={actionLoading || !rejectReason.trim()}
                className="flex-1 py-2.5 bg-red-600 text-white font-medium rounded-xl hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {actionLoading ? 'Odrzucanie...' : 'Odrzuć'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProviders;
