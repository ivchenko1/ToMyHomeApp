import { useState, useEffect } from 'react';
import {
  Users,
  Briefcase,
  Calendar,
  DollarSign,
  TrendingUp,
  Clock,
  AlertCircle,
  CheckCircle,
  XCircle,
  Loader2,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import adminService, { PlatformStats, AdminBooking, AdminProvider } from '../../services/adminService';

const AdminDashboard = () => {
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [recentBookings, setRecentBookings] = useState<AdminBooking[]>([]);
  const [pendingProviders, setPendingProviders] = useState<AdminProvider[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      const [statsData, bookingsData, providersData] = await Promise.all([
        adminService.getPlatformStats(),
        adminService.getRecentBookings(5),
        adminService.getPendingProviders(),
      ]);
      setStats(statsData);
      setRecentBookings(bookingsData);
      setPendingProviders(providersData);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const statCards = stats ? [
    {
      title: 'Użytkownicy',
      value: stats.totalUsers,
      icon: Users,
      color: 'bg-blue-500',
      bgColor: 'bg-blue-50',
      change: '+12%',
      positive: true,
    },
    {
      title: 'Usługodawcy',
      value: stats.totalProviders,
      subtitle: `${stats.activeProviders} aktywnych`,
      icon: Briefcase,
      color: 'bg-emerald-500',
      bgColor: 'bg-emerald-50',
      change: '+8%',
      positive: true,
    },
    {
      title: 'Rezerwacje',
      value: stats.totalBookings,
      subtitle: `${stats.todayBookings} dzisiaj`,
      icon: Calendar,
      color: 'bg-purple-500',
      bgColor: 'bg-purple-50',
      change: '+23%',
      positive: true,
    },
    {
      title: 'Przychody',
      value: `${stats.totalRevenue.toLocaleString()} zł`,
      subtitle: 'z prowizji',
      icon: DollarSign,
      color: 'bg-amber-500',
      bgColor: 'bg-amber-50',
      change: '+15%',
      positive: true,
    },
  ] : [];

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
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500">Przegląd statystyk platformy</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, index) => (
          <div key={index} className="bg-white rounded-2xl p-6 shadow-sm">
            <div className="flex items-start justify-between mb-4">
              <div className={`p-3 rounded-xl ${stat.bgColor}`}>
                <stat.icon className={`w-6 h-6 ${stat.color.replace('bg-', 'text-')}`} />
              </div>
              <div className={`flex items-center gap-1 text-sm font-medium ${
                stat.positive ? 'text-green-600' : 'text-red-600'
              }`}>
                {stat.positive ? (
                  <ArrowUpRight className="w-4 h-4" />
                ) : (
                  <ArrowDownRight className="w-4 h-4" />
                )}
                {stat.change}
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-900">{stat.value}</h3>
            <p className="text-gray-500 text-sm">{stat.title}</p>
            {stat.subtitle && (
              <p className="text-xs text-gray-400 mt-1">{stat.subtitle}</p>
            )}
          </div>
        ))}
      </div>

      {/* Alerts */}
      {stats && stats.pendingVerifications > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center gap-4">
          <div className="p-2 bg-amber-100 rounded-lg">
            <AlertCircle className="w-6 h-6 text-amber-600" />
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-amber-800">
              {stats.pendingVerifications} usługodawców oczekuje na weryfikację
            </h4>
            <p className="text-sm text-amber-600">
              Sprawdź nowe zgłoszenia i zweryfikuj profile
            </p>
          </div>
          <Link
            to="/admin/uslugodawcy"
            className="px-4 py-2 bg-amber-600 text-white font-medium rounded-lg hover:bg-amber-700 transition-colors"
          >
            Weryfikuj
          </Link>
        </div>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <Clock className="w-5 h-5 text-gray-400" />
            <h3 className="font-semibold text-gray-900">Rezerwacje w czasie</h3>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-500">Dzisiaj</span>
              <span className="font-bold text-gray-900">{stats?.todayBookings || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-500">Ten tydzień</span>
              <span className="font-bold text-gray-900">{stats?.weekBookings || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-500">Ten miesiąc</span>
              <span className="font-bold text-gray-900">{stats?.monthBookings || 0}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <TrendingUp className="w-5 h-5 text-gray-400" />
            <h3 className="font-semibold text-gray-900">Status platformy</h3>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-500">Aktywni usługodawcy</span>
              <span className="font-bold text-green-600">{stats?.activeProviders || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-500">Oczekujące weryfikacje</span>
              <span className="font-bold text-amber-600">{stats?.pendingVerifications || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-500">Zablokowani użytkownicy</span>
              <span className="font-bold text-red-600">{stats?.blockedUsers || 0}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <CheckCircle className="w-5 h-5 text-gray-400" />
            <h3 className="font-semibold text-gray-900">Szybkie akcje</h3>
          </div>
          <div className="space-y-2">
            <Link
              to="/admin/uzytkownicy"
              className="block w-full py-2 px-4 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium text-gray-700 transition-colors"
            >
              Zarządzaj użytkownikami
            </Link>
            <Link
              to="/admin/uslugodawcy"
              className="block w-full py-2 px-4 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium text-gray-700 transition-colors"
            >
              Weryfikuj usługodawców
            </Link>
            <Link
              to="/admin/rezerwacje"
              className="block w-full py-2 px-4 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium text-gray-700 transition-colors"
            >
              Przegląd rezerwacji
            </Link>
          </div>
        </div>
      </div>

      {/* Recent Bookings & Pending Providers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Bookings */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">Ostatnie rezerwacje</h3>
              <Link to="/admin/rezerwacje" className="text-sm text-red-600 hover:underline">
                Zobacz wszystkie
              </Link>
            </div>
          </div>
          <div className="divide-y divide-gray-100">
            {recentBookings.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                Brak rezerwacji
              </div>
            ) : (
              recentBookings.map((booking) => (
                <div key={booking.id} className="p-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-gray-900">{booking.clientName}</span>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(booking.status)}`}>
                      {getStatusLabel(booking.status)}
                    </span>
                  </div>
                  <div className="text-sm text-gray-500">
                    {booking.providerName} • {booking.date} {booking.time}
                  </div>
                  <div className="text-sm font-medium text-gray-900 mt-1">
                    {booking.totalPrice} zł
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Pending Verifications */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">Oczekujące weryfikacje</h3>
              <Link to="/admin/uslugodawcy" className="text-sm text-red-600 hover:underline">
                Zobacz wszystkie
              </Link>
            </div>
          </div>
          <div className="divide-y divide-gray-100">
            {pendingProviders.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
                Wszystko zweryfikowane!
              </div>
            ) : (
              pendingProviders.slice(0, 5).map((provider) => (
                <div key={provider.id} className="p-4 hover:bg-gray-50">
                  <div className="flex items-center gap-3">
                    <img
                      src={provider.image || 'https://via.placeholder.com/40'}
                      alt={provider.name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{provider.name}</p>
                      <p className="text-sm text-gray-500">{provider.profession}</p>
                    </div>
                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-amber-100 text-amber-700">
                      Oczekuje
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
