import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  TrendingUp,
  Users,
  Calendar,
  DollarSign,
  Star,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  Eye,
} from 'lucide-react';
import { useAuth } from '../../App';

interface DashboardStats {
  totalBookings: number;
  bookingsChange: number;
  revenue: number;
  revenueChange: number;
  clients: number;
  clientsChange: number;
  rating: number;
  reviewsCount: number;
}

interface RecentBooking {
  id: number;
  clientName: string;
  service: string;
  date: string;
  time: string;
  price: number;
  status: 'pending' | 'confirmed' | 'completed';
}

const BusinessDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalBookings: 24,
    bookingsChange: 12,
    revenue: 3450,
    revenueChange: 8,
    clients: 18,
    clientsChange: -3,
    rating: 4.9,
    reviewsCount: 47,
  });

  const [recentBookings, setRecentBookings] = useState<RecentBooking[]>([
    {
      id: 1,
      clientName: 'Anna Nowak',
      service: 'Strzyżenie damskie',
      date: '2025-12-02',
      time: '10:00',
      price: 80,
      status: 'confirmed',
    },
    {
      id: 2,
      clientName: 'Piotr Kowalski',
      service: 'Strzyżenie męskie',
      date: '2025-12-02',
      time: '11:30',
      price: 60,
      status: 'pending',
    },
    {
      id: 3,
      clientName: 'Maria Wiśniewska',
      service: 'Koloryzacja',
      date: '2025-12-02',
      time: '14:00',
      price: 150,
      status: 'confirmed',
    },
  ]);

  const [hasProvider, setHasProvider] = useState(false);

  useEffect(() => {
    // Check if user has a provider profile
    const localProviders = JSON.parse(localStorage.getItem('localProviders') || '[]');
    const userProvider = localProviders.find((p: any) => p.ownerId === user?.id);
    setHasProvider(!!userProvider || localProviders.length > 0);
  }, [user]);

  const statCards = [
    {
      title: 'Rezerwacje',
      value: stats.totalBookings,
      change: stats.bookingsChange,
      icon: Calendar,
      color: 'emerald',
    },
    {
      title: 'Przychód',
      value: `${stats.revenue} zł`,
      change: stats.revenueChange,
      icon: DollarSign,
      color: 'blue',
    },
    {
      title: 'Klienci',
      value: stats.clients,
      change: stats.clientsChange,
      icon: Users,
      color: 'purple',
    },
    {
      title: 'Ocena',
      value: stats.rating,
      subtitle: `${stats.reviewsCount} opinii`,
      icon: Star,
      color: 'amber',
    },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">Potwierdzona</span>;
      case 'pending':
        return <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs font-medium rounded-full">Oczekuje</span>;
      case 'completed':
        return <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-full">Zakończona</span>;
      default:
        return null;
    }
  };

  // If no provider profile, show empty state
  if (!hasProvider) {
    return (
      <div className="max-w-2xl mx-auto text-center py-16">
        <div className="w-24 h-24 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <Plus className="w-12 h-12 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Witaj w ToMyHomeApp Biznes!
        </h1>
        <p className="text-gray-600 mb-8 max-w-md mx-auto">
          Nie masz jeszcze profilu usługodawcy. Dodaj swoją pierwszą usługę, 
          aby zacząć przyjmować rezerwacje od klientów.
        </p>
        <Link
          to="/biznes/dodaj-usluge"
          className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
        >
          <Plus className="w-5 h-5" />
          Dodaj pierwszą usługę
        </Link>
        
        <div className="mt-12 grid md:grid-cols-3 gap-6 text-left">
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-lg flex items-center justify-center mb-4">
              <Plus className="w-5 h-5" />
            </div>
            <h3 className="font-bold mb-2">1. Dodaj usługę</h3>
            <p className="text-sm text-gray-600">
              Opisz swoją usługę, ustal ceny i godziny pracy
            </p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center mb-4">
              <Eye className="w-5 h-5" />
            </div>
            <h3 className="font-bold mb-2">2. Bądź widoczny</h3>
            <p className="text-sm text-gray-600">
              Klienci znajdą Cię w wyszukiwarce usług
            </p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="w-10 h-10 bg-purple-100 text-purple-600 rounded-lg flex items-center justify-center mb-4">
              <Calendar className="w-5 h-5" />
            </div>
            <h3 className="font-bold mb-2">3. Przyjmuj rezerwacje</h3>
            <p className="text-sm text-gray-600">
              Zarządzaj kalendarzem i rozwijaj biznes
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Witaj, {user?.username || 'Użytkowniku'}! 👋
          </h1>
          <p className="text-gray-600">
            Oto przegląd Twojego biznesu na dziś
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

      {/* Stats Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, index) => (
          <div key={index} className="bg-white p-5 rounded-xl shadow-sm">
            <div className="flex items-start justify-between mb-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center bg-${stat.color}-100`}>
                <stat.icon className={`w-5 h-5 text-${stat.color}-600`} />
              </div>
              {stat.change !== undefined && (
                <div className={`flex items-center gap-1 text-sm font-medium ${
                  stat.change >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {stat.change >= 0 ? (
                    <ArrowUpRight className="w-4 h-4" />
                  ) : (
                    <ArrowDownRight className="w-4 h-4" />
                  )}
                  {Math.abs(stat.change)}%
                </div>
              )}
            </div>
            <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
            <div className="text-sm text-gray-500">
              {stat.subtitle || stat.title}
            </div>
          </div>
        ))}
      </div>

      {/* Recent Bookings & Quick Actions */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent Bookings */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm">
          <div className="p-5 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900">Nadchodzące rezerwacje</h2>
              <Link to="/biznes/kalendarz" className="text-sm text-emerald-600 hover:text-emerald-700 font-medium">
                Zobacz wszystkie →
              </Link>
            </div>
          </div>
          <div className="divide-y divide-gray-100">
            {recentBookings.map((booking) => (
              <div key={booking.id} className="p-5 flex items-center justify-between hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                    {booking.clientName.charAt(0)}
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">{booking.clientName}</div>
                    <div className="text-sm text-gray-500">{booking.service}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                    <Clock className="w-4 h-4" />
                    {booking.time}
                  </div>
                  {getStatusBadge(booking.status)}
                </div>
              </div>
            ))}
            {recentBookings.length === 0 && (
              <div className="p-8 text-center text-gray-500">
                Brak nadchodzących rezerwacji
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-sm p-5">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Szybkie akcje</h2>
          <div className="space-y-3">
            <Link
              to="/biznes/uslugi"
              className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-lg flex items-center justify-center">
                <Eye className="w-5 h-5" />
              </div>
              <div>
                <div className="font-medium text-gray-900">Zobacz swój profil</div>
                <div className="text-sm text-gray-500">Tak widzą Cię klienci</div>
              </div>
            </Link>
            <Link
              to="/biznes/kalendarz"
              className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <div className="font-medium text-gray-900">Zarządzaj kalendarzem</div>
                <div className="text-sm text-gray-500">Dostępność i godziny</div>
              </div>
            </Link>
            <Link
              to="/biznes/statystyki"
              className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="w-10 h-10 bg-purple-100 text-purple-600 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div>
                <div className="font-medium text-gray-900">Zobacz statystyki</div>
                <div className="text-sm text-gray-500">Analizuj swój biznes</div>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BusinessDashboard;
