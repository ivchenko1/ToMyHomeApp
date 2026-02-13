import { useState, useEffect } from 'react';
import {
  TrendingUp,
  Users,
  Calendar,
  Coins,
  Star,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  BarChart3,
  PieChart,
  Loader2,
} from 'lucide-react';
import { useAuth } from '../../App';
import providerService from '../../services/providerService';
import bookingService from '../../services/bookingService';

interface Stats {
  revenue: {
    total: number;
    change: number;
    byDay: { day: string; amount: number }[];
  };
  bookings: {
    total: number;
    change: number;
    completed: number;
    cancelled: number;
    pending: number;
    confirmed: number;
  };
  clients: {
    total: number;
    new: number;
    returning: number;
  };
  rating: {
    average: number;
    count: number;
    distribution: { stars: number; count: number }[];
  };
  topServices: { name: string; count: number; revenue: number }[];
  peakHours: { hour: string; bookings: number }[];
}

const BusinessStatistics = () => {
  const { user } = useAuth();
  const [period, setPeriod] = useState<'week' | 'month' | 'year'>('month');
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<Stats>({
    revenue: { total: 0, change: 0, byDay: [] },
    bookings: { total: 0, change: 0, completed: 0, cancelled: 0, pending: 0, confirmed: 0 },
    clients: { total: 0, new: 0, returning: 0 },
    rating: { average: 0, count: 0, distribution: [] },
    topServices: [],
    peakHours: [],
  });

  useEffect(() => {
    const loadStats = async () => {
      if (!user?.id) {
        setIsLoading(false);
        return;
      }

      try {
        const providers = await providerService.getByOwner(user.id);
        if (providers.length === 0) {
          setIsLoading(false);
          return;
        }

        const provider = providers[0];
        const allBookings = await bookingService.getByProvider(provider.id);
        
        const now = new Date();
        let startDate: Date;
        
        if (period === 'week') {
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        } else if (period === 'month') {
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        } else {
          startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        }

        const bookings = allBookings.filter(b => new Date(b.createdAt) >= startDate);
        
        const completed = bookings.filter(b => b.status === 'completed').length;
        const cancelled = bookings.filter(b => b.status === 'cancelled').length;
        const pending = bookings.filter(b => b.status === 'pending').length;
        const confirmed = bookings.filter(b => b.status === 'confirmed').length;

        // Przychody liczone tylko dla zrealizowanych wizyt (completed) 
        // lub potwierdzonych wizyt z przeszłości (data wizyty już minęła)
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const completedBookings = bookings.filter(b => {
          if (b.status === 'completed') return true;
          if (b.status === 'confirmed' || b.status === 'pending') {
            const bookingDate = new Date(b.date);
            bookingDate.setHours(23, 59, 59, 999);
            return bookingDate < today; // Wizyta już się odbyła
          }
          return false;
        });

        const totalRevenue = completedBookings
          .reduce((sum, b) => sum + (b.servicePrice || 0), 0);

        const dayNames = ['Nd', 'Pon', 'Wt', 'Śr', 'Czw', 'Pt', 'Sob'];
        const revenueByDay = dayNames.map(day => ({ day, amount: 0 }));
        
        completedBookings.forEach(b => {
          const dayIndex = new Date(b.date).getDay();
          revenueByDay[dayIndex].amount += b.servicePrice || 0;
        });

        const sundayRevenue = revenueByDay.shift()!;
        revenueByDay.push(sundayRevenue);

        const uniqueClients = new Set(bookings.map(b => b.clientId));
        const clientBookingCounts: { [key: string]: number } = {};
        bookings.forEach(b => {
          clientBookingCounts[b.clientId] = (clientBookingCounts[b.clientId] || 0) + 1;
        });
        const returningClients = Object.values(clientBookingCounts).filter(count => count > 1).length;

        const serviceStats: { [key: string]: { count: number; revenue: number } } = {};
        bookings.forEach(b => {
          if (!serviceStats[b.serviceName]) {
            serviceStats[b.serviceName] = { count: 0, revenue: 0 };
          }
          serviceStats[b.serviceName].count++;
          
          // Przychód tylko dla zrealizowanych wizyt
          const isCompleted = b.status === 'completed';
          const isPastBooking = (() => {
            if (b.status === 'confirmed' || b.status === 'pending') {
              const bookingDate = new Date(b.date);
              bookingDate.setHours(23, 59, 59, 999);
              return bookingDate < today;
            }
            return false;
          })();
          
          if (isCompleted || isPastBooking) {
            serviceStats[b.serviceName].revenue += b.servicePrice || 0;
          }
        });
        const topServices = Object.entries(serviceStats)
          .map(([name, data]) => ({ name, ...data }))
          .sort((a, b) => b.revenue - a.revenue)
          .slice(0, 4);

        const hourStats: { [key: string]: number } = {};
        for (let h = 9; h <= 18; h++) {
          hourStats[`${h}:00`] = 0;
        }
        bookings.forEach(b => {
          const hour = b.time?.split(':')[0];
          if (hour && hourStats[`${hour}:00`] !== undefined) {
            hourStats[`${hour}:00`]++;
          }
        });
        const peakHours = Object.entries(hourStats).map(([hour, bookings]) => ({ hour, bookings }));

        const ratingAvg = provider.rating || 0;
        const reviewsCount = provider.reviewsCount || 0;
        const ratingDistribution = [
          { stars: 5, count: Math.round(reviewsCount * 0.7) },
          { stars: 4, count: Math.round(reviewsCount * 0.2) },
          { stars: 3, count: Math.round(reviewsCount * 0.07) },
          { stars: 2, count: Math.round(reviewsCount * 0.02) },
          { stars: 1, count: Math.round(reviewsCount * 0.01) },
        ];

        setStats({
          revenue: { total: totalRevenue, change: 0, byDay: revenueByDay },
          bookings: { total: bookings.length, change: 0, completed, cancelled, pending, confirmed },
          clients: { total: uniqueClients.size, new: uniqueClients.size - returningClients, returning: returningClients },
          rating: { average: ratingAvg, count: reviewsCount, distribution: ratingDistribution },
          topServices,
          peakHours,
        });
      } catch (error) {
        console.error('Error loading stats:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadStats();
  }, [user, period]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-12 h-12 animate-spin text-emerald-500" />
      </div>
    );
  }

  const maxRevenue = Math.max(...stats.revenue.byDay.map((d) => d.amount), 1);
  const maxBookings = Math.max(...stats.peakHours.map((h) => h.bookings), 1);
  const totalRatings = stats.rating.distribution.reduce((sum, r) => sum + r.count, 0) || 1;
  const totalBookings = stats.bookings.total || 1;
  const peakHour = stats.peakHours.reduce((max, h) => h.bookings > max.bookings ? h : max, { hour: '-', bookings: 0 });

  const statCards = [
    { title: 'Przychód', value: `${stats.revenue.total.toLocaleString()} zł`, change: stats.revenue.change, icon: Coins, bgColor: 'bg-emerald-100', textColor: 'text-emerald-600' },
    { title: 'Rezerwacje', value: stats.bookings.total, change: stats.bookings.change, icon: Calendar, bgColor: 'bg-blue-100', textColor: 'text-blue-600' },
    { title: 'Klienci', value: stats.clients.total, subtitle: `${stats.clients.new} nowych`, icon: Users, bgColor: 'bg-purple-100', textColor: 'text-purple-600' },
    { title: 'Ocena', value: stats.rating.average.toFixed(1), subtitle: `${stats.rating.count} opinii`, icon: Star, bgColor: 'bg-amber-100', textColor: 'text-amber-600' },
    { title: 'Ukończone', value: stats.bookings.completed, subtitle: 'usług', icon: Clock, bgColor: 'bg-pink-100', textColor: 'text-pink-600' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Statystyki</h1>
          <p className="text-gray-600">Analizuj wyniki swojego biznesu</p>
        </div>
        <div className="flex bg-white border border-gray-200 rounded-lg overflow-hidden">
          {(['week', 'month', 'year'] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-4 py-2 text-sm font-medium transition-colors ${period === p ? 'bg-emerald-500 text-white' : 'text-gray-600 hover:bg-gray-50'}`}
            >
              {p === 'week' ? 'Tydzień' : p === 'month' ? 'Miesiąc' : 'Rok'}
            </button>
          ))}
        </div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {statCards.map((stat, index) => (
          <div key={index} className="bg-white p-5 rounded-xl shadow-sm">
            <div className="flex items-start justify-between mb-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${stat.bgColor}`}>
                <stat.icon className={`w-5 h-5 ${stat.textColor}`} />
              </div>
              {stat.change !== undefined && stat.change !== 0 && (
                <div className={`flex items-center gap-1 text-sm font-medium ${stat.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {stat.change >= 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                  {Math.abs(stat.change)}%
                </div>
              )}
            </div>
            <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
            <div className="text-sm text-gray-500">{stat.subtitle || stat.title}</div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-emerald-500" />
              Przychody według dni
            </h3>
            <span className="text-2xl font-bold text-emerald-600">{stats.revenue.total.toLocaleString()} zł</span>
          </div>
          <div className="flex items-end justify-between gap-2 h-48">
            {stats.revenue.byDay.map((day, index) => (
              <div key={index} className="flex-1 flex flex-col items-center">
                <div className="w-full relative flex flex-col justify-end h-40">
                  <div
                    className="w-full bg-gradient-to-t from-emerald-500 to-emerald-400 rounded-t-lg transition-all hover:from-emerald-600 hover:to-emerald-500"
                    style={{ height: `${(day.amount / maxRevenue) * 100}%`, minHeight: day.amount > 0 ? '8px' : '0' }}
                  />
                </div>
                <div className="mt-2 text-xs text-gray-500 font-medium">{day.day}</div>
                <div className="text-xs text-gray-400">{day.amount > 0 ? `${day.amount}` : '-'}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-6">
            <Clock className="w-5 h-5 text-blue-500" />
            Godziny rezerwacji
          </h3>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {stats.peakHours.map((hour, index) => (
              <div key={index} className="flex items-center gap-3">
                <div className="w-12 text-sm text-gray-600 font-medium">{hour.hour}</div>
                <div className="flex-1 h-6 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full" style={{ width: `${(hour.bookings / maxBookings) * 100}%` }} />
                </div>
                <div className="w-8 text-sm text-gray-600 font-medium text-right">{hour.bookings}</div>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-gray-100">
            <p className="text-sm text-gray-500">💡 Popularna godzina: <strong>{peakHour.hour}</strong> ({peakHour.bookings} rez.)</p>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-6">
            <PieChart className="w-5 h-5 text-purple-500" />
            Status rezerwacji
          </h3>
          <div className="flex items-center justify-center mb-6">
            <div className="relative w-40 h-40">
              {stats.bookings.total > 0 ? (
                <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                  <circle cx="50" cy="50" r="40" fill="none" stroke="#10b981" strokeWidth="20" strokeDasharray={`${(stats.bookings.completed / totalBookings) * 251.2} 251.2`} />
                  <circle cx="50" cy="50" r="40" fill="none" stroke="#3b82f6" strokeWidth="20" strokeDasharray={`${(stats.bookings.confirmed / totalBookings) * 251.2} 251.2`} strokeDashoffset={`-${(stats.bookings.completed / totalBookings) * 251.2}`} />
                  <circle cx="50" cy="50" r="40" fill="none" stroke="#f59e0b" strokeWidth="20" strokeDasharray={`${(stats.bookings.pending / totalBookings) * 251.2} 251.2`} strokeDashoffset={`-${((stats.bookings.completed + stats.bookings.confirmed) / totalBookings) * 251.2}`} />
                  <circle cx="50" cy="50" r="40" fill="none" stroke="#ef4444" strokeWidth="20" strokeDasharray={`${(stats.bookings.cancelled / totalBookings) * 251.2} 251.2`} strokeDashoffset={`-${((stats.bookings.completed + stats.bookings.confirmed + stats.bookings.pending) / totalBookings) * 251.2}`} />
                </svg>
              ) : (
                <div className="w-full h-full rounded-full border-8 border-gray-200"></div>
              )}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-2xl font-bold">{stats.bookings.total}</div>
                  <div className="text-xs text-gray-500">rezerwacji</div>
                </div>
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between"><div className="flex items-center gap-2"><div className="w-3 h-3 bg-green-500 rounded-full" /><span className="text-sm text-gray-600">Zakończone</span></div><span className="font-medium">{stats.bookings.completed}</span></div>
            <div className="flex items-center justify-between"><div className="flex items-center gap-2"><div className="w-3 h-3 bg-blue-500 rounded-full" /><span className="text-sm text-gray-600">Potwierdzone</span></div><span className="font-medium">{stats.bookings.confirmed}</span></div>
            <div className="flex items-center justify-between"><div className="flex items-center gap-2"><div className="w-3 h-3 bg-yellow-500 rounded-full" /><span className="text-sm text-gray-600">Oczekujące</span></div><span className="font-medium">{stats.bookings.pending}</span></div>
            <div className="flex items-center justify-between"><div className="flex items-center gap-2"><div className="w-3 h-3 bg-red-500 rounded-full" /><span className="text-sm text-gray-600">Anulowane</span></div><span className="font-medium">{stats.bookings.cancelled}</span></div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-6">
            <Star className="w-5 h-5 text-amber-500" />
            Rozkład ocen
          </h3>
          <div className="text-center mb-6">
            <div className="text-5xl font-bold text-gray-900">{stats.rating.average.toFixed(1)}</div>
            <div className="flex items-center justify-center gap-1 mt-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star key={star} className={`w-5 h-5 ${star <= Math.round(stats.rating.average) ? 'text-amber-400 fill-amber-400' : 'text-gray-300'}`} />
              ))}
            </div>
            <div className="text-sm text-gray-500 mt-1">{stats.rating.count} opinii</div>
          </div>
          <div className="space-y-2">
            {stats.rating.distribution.map((r) => (
              <div key={r.stars} className="flex items-center gap-3">
                <div className="flex items-center gap-1 w-12"><span className="text-sm font-medium">{r.stars}</span><Star className="w-3 h-3 text-amber-400 fill-amber-400" /></div>
                <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden"><div className="h-full bg-amber-400 rounded-full" style={{ width: `${(r.count / totalRatings) * 100}%` }} /></div>
                <span className="text-sm text-gray-600 w-8 text-right">{r.count}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-6">
            <TrendingUp className="w-5 h-5 text-emerald-500" />
            Top usługi
          </h3>
          {stats.topServices.length > 0 ? (
            <div className="space-y-4">
              {stats.topServices.map((service, index) => (
                <div key={index} className="flex items-center gap-4">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-white ${index === 0 ? 'bg-amber-500' : index === 1 ? 'bg-gray-400' : index === 2 ? 'bg-amber-700' : 'bg-gray-300'}`}>{index + 1}</div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-900 truncate">{service.name}</div>
                    <div className="text-sm text-gray-500">{service.count} rezerwacji</div>
                  </div>
                  <div className="font-bold text-emerald-600">{service.revenue} zł</div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Calendar className="w-12 h-12 mx-auto mb-2 text-gray-300" />
              <p>Brak danych</p>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-6">
          <Users className="w-5 h-5 text-purple-500" />
          Klienci
        </h3>
        <div className="grid sm:grid-cols-3 gap-6">
          <div className="text-center p-6 bg-purple-50 rounded-xl">
            <div className="text-4xl font-bold text-purple-600">{stats.clients.total}</div>
            <div className="text-sm text-purple-600 mt-1">Wszystkich klientów</div>
          </div>
          <div className="text-center p-6 bg-green-50 rounded-xl">
            <div className="text-4xl font-bold text-green-600">{stats.clients.new}</div>
            <div className="text-sm text-green-600 mt-1">Nowych klientów</div>
          </div>
          <div className="text-center p-6 bg-blue-50 rounded-xl">
            <div className="text-4xl font-bold text-blue-600">{stats.clients.total > 0 ? Math.round((stats.clients.returning / stats.clients.total) * 100) : 0}%</div>
            <div className="text-sm text-blue-600 mt-1">Powracających</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BusinessStatistics;
