import { useState, useEffect } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Users,
  Calendar,
  DollarSign,
  Star,
  Eye,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  BarChart3,
  PieChart,
} from 'lucide-react';

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
  views: {
    total: number;
    change: number;
  };
  topServices: { name: string; count: number; revenue: number }[];
  peakHours: { hour: string; bookings: number }[];
}

const BusinessStatistics = () => {
  const [period, setPeriod] = useState<'week' | 'month' | 'year'>('month');
  const [stats, setStats] = useState<Stats>({
    revenue: {
      total: 12450,
      change: 15,
      byDay: [
        { day: 'Pon', amount: 1200 },
        { day: 'Wt', amount: 1800 },
        { day: 'Śr', amount: 1500 },
        { day: 'Czw', amount: 2100 },
        { day: 'Pt', amount: 2400 },
        { day: 'Sob', amount: 2800 },
        { day: 'Nd', amount: 650 },
      ],
    },
    bookings: {
      total: 89,
      change: 12,
      completed: 72,
      cancelled: 5,
      pending: 12,
    },
    clients: {
      total: 156,
      new: 23,
      returning: 133,
    },
    rating: {
      average: 4.8,
      count: 47,
      distribution: [
        { stars: 5, count: 35 },
        { stars: 4, count: 9 },
        { stars: 3, count: 2 },
        { stars: 2, count: 1 },
        { stars: 1, count: 0 },
      ],
    },
    views: {
      total: 1234,
      change: 23,
    },
    topServices: [
      { name: 'Strzyżenie damskie', count: 34, revenue: 2720 },
      { name: 'Koloryzacja', count: 18, revenue: 4500 },
      { name: 'Strzyżenie męskie', count: 22, revenue: 1100 },
      { name: 'Modelowanie', count: 15, revenue: 1200 },
    ],
    peakHours: [
      { hour: '9:00', bookings: 8 },
      { hour: '10:00', bookings: 12 },
      { hour: '11:00', bookings: 15 },
      { hour: '12:00', bookings: 10 },
      { hour: '13:00', bookings: 6 },
      { hour: '14:00', bookings: 14 },
      { hour: '15:00', bookings: 18 },
      { hour: '16:00', bookings: 16 },
      { hour: '17:00', bookings: 12 },
      { hour: '18:00', bookings: 8 },
    ],
  });

  // Calculate max values for charts
  const maxRevenue = Math.max(...stats.revenue.byDay.map((d) => d.amount));
  const maxBookings = Math.max(...stats.peakHours.map((h) => h.bookings));
  const totalRatings = stats.rating.distribution.reduce((sum, r) => sum + r.count, 0);

  const statCards = [
    {
      title: 'Przychód',
      value: `${stats.revenue.total.toLocaleString()} zł`,
      change: stats.revenue.change,
      icon: DollarSign,
      color: 'emerald',
      bgColor: 'bg-emerald-100',
      textColor: 'text-emerald-600',
    },
    {
      title: 'Rezerwacje',
      value: stats.bookings.total,
      change: stats.bookings.change,
      icon: Calendar,
      color: 'blue',
      bgColor: 'bg-blue-100',
      textColor: 'text-blue-600',
    },
    {
      title: 'Klienci',
      value: stats.clients.total,
      subtitle: `${stats.clients.new} nowych`,
      icon: Users,
      color: 'purple',
      bgColor: 'bg-purple-100',
      textColor: 'text-purple-600',
    },
    {
      title: 'Ocena',
      value: stats.rating.average,
      subtitle: `${stats.rating.count} opinii`,
      icon: Star,
      color: 'amber',
      bgColor: 'bg-amber-100',
      textColor: 'text-amber-600',
    },
    {
      title: 'Wyświetlenia',
      value: stats.views.total.toLocaleString(),
      change: stats.views.change,
      icon: Eye,
      color: 'pink',
      bgColor: 'bg-pink-100',
      textColor: 'text-pink-600',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
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
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                period === p
                  ? 'bg-emerald-500 text-white'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              {p === 'week' ? 'Tydzień' : p === 'month' ? 'Miesiąc' : 'Rok'}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {statCards.map((stat, index) => (
          <div key={index} className="bg-white p-5 rounded-xl shadow-sm">
            <div className="flex items-start justify-between mb-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${stat.bgColor}`}>
                <stat.icon className={`w-5 h-5 ${stat.textColor}`} />
              </div>
              {stat.change !== undefined && (
                <div
                  className={`flex items-center gap-1 text-sm font-medium ${
                    stat.change >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}
                >
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
            <div className="text-sm text-gray-500">{stat.subtitle || stat.title}</div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-emerald-500" />
              Przychody
            </h3>
            <span className="text-sm text-gray-500">Ostatnie 7 dni</span>
          </div>
          
          {/* Bar Chart */}
          <div className="flex items-end justify-between gap-2 h-48">
            {stats.revenue.byDay.map((day, index) => (
              <div key={index} className="flex-1 flex flex-col items-center gap-2">
                <div className="text-xs font-medium text-gray-600">
                  {day.amount} zł
                </div>
                <div
                  className="w-full bg-gradient-to-t from-emerald-500 to-teal-400 rounded-t-lg transition-all hover:from-emerald-600 hover:to-teal-500"
                  style={{
                    height: `${(day.amount / maxRevenue) * 100}%`,
                    minHeight: '20px',
                  }}
                />
                <div className="text-xs text-gray-500">{day.day}</div>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between">
            <div>
              <span className="text-sm text-gray-500">Suma tygodnia:</span>
              <span className="ml-2 font-bold text-gray-900">
                {stats.revenue.byDay.reduce((sum, d) => sum + d.amount, 0).toLocaleString()} zł
              </span>
            </div>
            <div className="flex items-center gap-1 text-green-600 text-sm font-medium">
              <TrendingUp className="w-4 h-4" />
              +{stats.revenue.change}% vs poprzedni tydzień
            </div>
          </div>
        </div>

        {/* Peak Hours Chart */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-500" />
              Najbardziej popularne godziny
            </h3>
          </div>
          
          {/* Horizontal Bar Chart */}
          <div className="space-y-3">
            {stats.peakHours.map((hour, index) => (
              <div key={index} className="flex items-center gap-3">
                <div className="w-12 text-sm text-gray-600 font-medium">
                  {hour.hour}
                </div>
                <div className="flex-1 h-6 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full transition-all"
                    style={{ width: `${(hour.bookings / maxBookings) * 100}%` }}
                  />
                </div>
                <div className="w-8 text-sm text-gray-600 font-medium text-right">
                  {hour.bookings}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 pt-4 border-t border-gray-100">
            <p className="text-sm text-gray-500">
              💡 Najbardziej popularna godzina: <strong>15:00</strong> (18 rezerwacji)
            </p>
          </div>
        </div>
      </div>

      {/* Second Row */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Bookings Breakdown */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-6">
            <PieChart className="w-5 h-5 text-purple-500" />
            Status rezerwacji
          </h3>
          
          {/* Simple Pie Chart Visual */}
          <div className="flex items-center justify-center mb-6">
            <div className="relative w-40 h-40">
              <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                {/* Completed */}
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="20"
                  strokeDasharray={`${(stats.bookings.completed / stats.bookings.total) * 251.2} 251.2`}
                />
                {/* Pending */}
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke="#f59e0b"
                  strokeWidth="20"
                  strokeDasharray={`${(stats.bookings.pending / stats.bookings.total) * 251.2} 251.2`}
                  strokeDashoffset={`-${(stats.bookings.completed / stats.bookings.total) * 251.2}`}
                />
                {/* Cancelled */}
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke="#ef4444"
                  strokeWidth="20"
                  strokeDasharray={`${(stats.bookings.cancelled / stats.bookings.total) * 251.2} 251.2`}
                  strokeDashoffset={`-${((stats.bookings.completed + stats.bookings.pending) / stats.bookings.total) * 251.2}`}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-2xl font-bold">{stats.bookings.total}</div>
                  <div className="text-xs text-gray-500">rezerwacji</div>
                </div>
              </div>
            </div>
          </div>

          {/* Legend */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full" />
                <span className="text-sm text-gray-600">Zakończone</span>
              </div>
              <span className="font-medium">{stats.bookings.completed}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-yellow-500 rounded-full" />
                <span className="text-sm text-gray-600">Oczekujące</span>
              </div>
              <span className="font-medium">{stats.bookings.pending}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-500 rounded-full" />
                <span className="text-sm text-gray-600">Anulowane</span>
              </div>
              <span className="font-medium">{stats.bookings.cancelled}</span>
            </div>
          </div>
        </div>

        {/* Rating Distribution */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-6">
            <Star className="w-5 h-5 text-amber-500" />
            Rozkład ocen
          </h3>

          {/* Big Rating */}
          <div className="text-center mb-6">
            <div className="text-5xl font-bold text-gray-900">{stats.rating.average}</div>
            <div className="flex items-center justify-center gap-1 mt-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`w-5 h-5 ${
                    star <= Math.round(stats.rating.average)
                      ? 'text-amber-400 fill-amber-400'
                      : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
            <div className="text-sm text-gray-500 mt-1">{stats.rating.count} opinii</div>
          </div>

          {/* Distribution Bars */}
          <div className="space-y-2">
            {stats.rating.distribution.map((r) => (
              <div key={r.stars} className="flex items-center gap-3">
                <div className="flex items-center gap-1 w-12">
                  <span className="text-sm font-medium">{r.stars}</span>
                  <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                </div>
                <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-400 rounded-full"
                    style={{ width: `${(r.count / totalRatings) * 100}%` }}
                  />
                </div>
                <span className="text-sm text-gray-600 w-8 text-right">{r.count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Top Services */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-6">
            <TrendingUp className="w-5 h-5 text-emerald-500" />
            Top usługi
          </h3>

          <div className="space-y-4">
            {stats.topServices.map((service, index) => (
              <div key={index} className="flex items-center gap-4">
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-white ${
                    index === 0
                      ? 'bg-amber-500'
                      : index === 1
                      ? 'bg-gray-400'
                      : index === 2
                      ? 'bg-amber-700'
                      : 'bg-gray-300'
                  }`}
                >
                  {index + 1}
                </div>
                <div className="flex-1">
                  <div className="font-medium text-gray-900">{service.name}</div>
                  <div className="text-sm text-gray-500">
                    {service.count} rezerwacji
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-emerald-600">{service.revenue} zł</div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 pt-4 border-t border-gray-100">
            <p className="text-sm text-gray-500">
              Łącznie: <strong>{stats.topServices.reduce((sum, s) => sum + s.revenue, 0).toLocaleString()} zł</strong>
            </p>
          </div>
        </div>
      </div>

      {/* Clients Info */}
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
            <div className="text-sm text-green-600 mt-1">Nowych w tym miesiącu</div>
          </div>
          <div className="text-center p-6 bg-blue-50 rounded-xl">
            <div className="text-4xl font-bold text-blue-600">
              {Math.round((stats.clients.returning / stats.clients.total) * 100)}%
            </div>
            <div className="text-sm text-blue-600 mt-1">Powracających klientów</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BusinessStatistics;
