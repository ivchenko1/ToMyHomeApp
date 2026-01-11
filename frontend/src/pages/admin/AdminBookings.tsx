import { useState, useEffect } from 'react';
import {
  Search,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  Loader2,
  DollarSign,
  User,
  Briefcase,
} from 'lucide-react';
import adminService, { AdminBooking } from '../../services/adminService';
import { useToast } from '../../App';

const AdminBookings = () => {
  const { showToast } = useToast();
  const [bookings, setBookings] = useState<AdminBooking[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<AdminBooking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'confirmed' | 'completed' | 'cancelled'>('all');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    loadBookings();
  }, []);

  useEffect(() => {
    filterBookings();
  }, [bookings, searchQuery, filterStatus]);

  const loadBookings = async () => {
    setIsLoading(true);
    try {
      const data = await adminService.getAllBookings();
      // Sort by date descending
      data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setBookings(data);
    } catch (error) {
      console.error('Error loading bookings:', error);
      showToast('Błąd ładowania rezerwacji', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const filterBookings = () => {
    let filtered = [...bookings];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (booking) =>
          booking.clientName?.toLowerCase().includes(query) ||
          booking.clientEmail?.toLowerCase().includes(query) ||
          booking.providerName?.toLowerCase().includes(query) ||
          booking.id?.toLowerCase().includes(query)
      );
    }

    // Status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter((b) => b.status === filterStatus);
    }

    setFilteredBookings(filtered);
  };

  const handleStatusChange = async (booking: AdminBooking, newStatus: AdminBooking['status']) => {
    let reason = '';
    if (newStatus === 'cancelled') {
      reason = window.prompt('Podaj powód anulowania:') || '';
      if (!reason) return;
    }

    setActionLoading(true);
    try {
      const success = await adminService.updateBookingStatus(booking.id, newStatus, reason);
      if (success) {
        showToast('Status zaktualizowany', 'success');
        loadBookings();
      } else {
        showToast('Błąd aktualizacji statusu', 'error');
      }
    } catch (error) {
      showToast('Błąd aktualizacji statusu', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-700';
      case 'pending':
        return 'bg-yellow-100 text-yellow-700';
      case 'completed':
        return 'bg-blue-100 text-blue-700';
      case 'cancelled':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'Potwierdzona';
      case 'pending':
        return 'Oczekująca';
      case 'completed':
        return 'Zakończona';
      case 'cancelled':
        return 'Anulowana';
      default:
        return status;
    }
  };

  const filters = [
    { value: 'all', label: 'Wszystkie', count: bookings.length },
    { value: 'pending', label: 'Oczekujące', count: bookings.filter((b) => b.status === 'pending').length },
    { value: 'confirmed', label: 'Potwierdzone', count: bookings.filter((b) => b.status === 'confirmed').length },
    { value: 'completed', label: 'Zakończone', count: bookings.filter((b) => b.status === 'completed').length },
    { value: 'cancelled', label: 'Anulowane', count: bookings.filter((b) => b.status === 'cancelled').length },
  ];

  // Stats
  const totalRevenue = bookings
    .filter((b) => b.status === 'completed')
    .reduce((sum, b) => sum + (b.totalPrice || 0), 0);
  const todayBookings = bookings.filter(
    (b) => new Date(b.date).toDateString() === new Date().toDateString()
  ).length;

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
        <h1 className="text-2xl font-bold text-gray-900">Rezerwacje</h1>
        <p className="text-gray-500">Przegląd wszystkich rezerwacji na platformie</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Calendar className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{bookings.length}</p>
              <p className="text-sm text-gray-500">Wszystkich</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-100 rounded-lg">
              <Clock className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{todayBookings}</p>
              <p className="text-sm text-gray-500">Dzisiaj</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{filters[3].count}</p>
              <p className="text-sm text-gray-500">Zakończonych</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-100 rounded-lg">
              <DollarSign className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{totalRevenue.toLocaleString()} zł</p>
              <p className="text-sm text-gray-500">Przychód</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-white rounded-2xl shadow-sm p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Szukaj po kliencie, usługodawcy lub ID..."
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

      {/* Bookings Table */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">ID</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Klient</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Usługodawca</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Termin</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Usługi</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Kwota</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Status</th>
                <th className="text-right px-6 py-4 text-sm font-semibold text-gray-600">Akcje</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredBookings.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                    Nie znaleziono rezerwacji
                  </td>
                </tr>
              ) : (
                filteredBookings.map((booking) => (
                  <tr key={booking.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <span className="text-xs font-mono text-gray-500">
                        {booking.id.slice(0, 8)}...
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <User className="w-4 h-4 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{booking.clientName || 'Nieznany'}</p>
                          <p className="text-xs text-gray-500">{booking.clientEmail}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                          <Briefcase className="w-4 h-4 text-purple-600" />
                        </div>
                        <span className="font-medium text-gray-900">{booking.providerName || 'Nieznany'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-gray-900">{booking.date}</p>
                        <p className="text-sm text-gray-500">{booking.time}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="max-w-[200px]">
                        {booking.services?.map((s, i) => (
                          <span key={i} className="text-sm text-gray-600">
                            {s.name}{i < booking.services.length - 1 ? ', ' : ''}
                          </span>
                        )) || '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-bold text-gray-900">{booking.totalPrice} zł</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(booking.status)}`}>
                        {getStatusLabel(booking.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-1">
                        {booking.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleStatusChange(booking, 'confirmed')}
                              disabled={actionLoading}
                              className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                              title="Potwierdź"
                            >
                              <CheckCircle className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => handleStatusChange(booking, 'cancelled')}
                              disabled={actionLoading}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Anuluj"
                            >
                              <XCircle className="w-5 h-5" />
                            </button>
                          </>
                        )}
                        {booking.status === 'confirmed' && (
                          <>
                            <button
                              onClick={() => handleStatusChange(booking, 'completed')}
                              disabled={actionLoading}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Oznacz jako zakończone"
                            >
                              <CheckCircle className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => handleStatusChange(booking, 'cancelled')}
                              disabled={actionLoading}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Anuluj"
                            >
                              <XCircle className="w-5 h-5" />
                            </button>
                          </>
                        )}
                        {(booking.status === 'completed' || booking.status === 'cancelled') && (
                          <span className="text-sm text-gray-400 px-2">—</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminBookings;
