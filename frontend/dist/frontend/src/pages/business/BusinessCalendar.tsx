import { useState, useEffect } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  User,
  Phone,
  Mail,
  MapPin,
  Check,
  X,
  MoreVertical,
  Plus,
  Calendar as CalendarIcon,
} from 'lucide-react';
import { useToast } from '../../App';

interface Booking {
  id: string;
  clientName: string;
  clientPhone: string;
  clientEmail: string;
  service: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  duration: number; // minuty
  price: number;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  notes?: string;
  address?: string;
}

const BusinessCalendar = () => {
  const { showToast } = useToast();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'day'>('week');
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [showBookingModal, setShowBookingModal] = useState(false);

  // Przykładowe rezerwacje - w produkcji z API/bazy danych
  useEffect(() => {
    const savedBookings = localStorage.getItem('businessBookings');
    if (savedBookings) {
      setBookings(JSON.parse(savedBookings));
    } else {
      // Demo data
      const today = new Date().toISOString().split('T')[0];
      const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
      const dayAfter = new Date(Date.now() + 172800000).toISOString().split('T')[0];
      
      const demoBookings: Booking[] = [
        {
          id: '1',
          clientName: 'Anna Nowak',
          clientPhone: '+48 123 456 789',
          clientEmail: 'anna@example.com',
          service: 'Strzyżenie damskie',
          date: today,
          time: '09:00',
          duration: 60,
          price: 80,
          status: 'confirmed',
          address: 'ul. Marszałkowska 10, Warszawa',
        },
        {
          id: '2',
          clientName: 'Piotr Kowalski',
          clientPhone: '+48 987 654 321',
          clientEmail: 'piotr@example.com',
          service: 'Strzyżenie męskie',
          date: today,
          time: '10:30',
          duration: 30,
          price: 50,
          status: 'pending',
          address: 'ul. Puławska 25, Warszawa',
        },
        {
          id: '3',
          clientName: 'Maria Wiśniewska',
          clientPhone: '+48 555 666 777',
          clientEmail: 'maria@example.com',
          service: 'Koloryzacja + strzyżenie',
          date: today,
          time: '14:00',
          duration: 120,
          price: 250,
          status: 'confirmed',
          address: 'ul. Mokotowska 5/12, Warszawa',
        },
        {
          id: '4',
          clientName: 'Katarzyna Zielińska',
          clientPhone: '+48 111 222 333',
          clientEmail: 'kasia@example.com',
          service: 'Manicure hybrydowy',
          date: tomorrow,
          time: '11:00',
          duration: 90,
          price: 120,
          status: 'confirmed',
        },
        {
          id: '5',
          clientName: 'Tomasz Nowicki',
          clientPhone: '+48 444 555 666',
          clientEmail: 'tomek@example.com',
          service: 'Strzyżenie + broda',
          date: tomorrow,
          time: '15:30',
          duration: 45,
          price: 70,
          status: 'pending',
        },
        {
          id: '6',
          clientName: 'Ewa Kamińska',
          clientPhone: '+48 777 888 999',
          clientEmail: 'ewa@example.com',
          service: 'Masaż relaksacyjny',
          date: dayAfter,
          time: '10:00',
          duration: 60,
          price: 150,
          status: 'confirmed',
        },
      ];
      
      setBookings(demoBookings);
      localStorage.setItem('businessBookings', JSON.stringify(demoBookings));
    }
  }, []);

  const saveBookings = (newBookings: Booking[]) => {
    setBookings(newBookings);
    localStorage.setItem('businessBookings', JSON.stringify(newBookings));
  };

  // Nawigacja kalendarza
  const goToPrevious = () => {
    const newDate = new Date(currentDate);
    if (viewMode === 'month') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else if (viewMode === 'week') {
      newDate.setDate(newDate.getDate() - 7);
    } else {
      newDate.setDate(newDate.getDate() - 1);
    }
    setCurrentDate(newDate);
  };

  const goToNext = () => {
    const newDate = new Date(currentDate);
    if (viewMode === 'month') {
      newDate.setMonth(newDate.getMonth() + 1);
    } else if (viewMode === 'week') {
      newDate.setDate(newDate.getDate() + 7);
    } else {
      newDate.setDate(newDate.getDate() + 1);
    }
    setCurrentDate(newDate);
  };

  const goToToday = () => {
    setCurrentDate(new Date());
    setSelectedDate(new Date().toISOString().split('T')[0]);
  };

  // Pomocnicze funkcje
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days: Date[] = [];

    // Dodaj dni z poprzedniego miesiąca
    const startDay = firstDay.getDay() || 7;
    for (let i = startDay - 1; i > 0; i--) {
      days.push(new Date(year, month, 1 - i));
    }

    // Dni bieżącego miesiąca
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push(new Date(year, month, i));
    }

    // Dodaj dni z następnego miesiąca
    const remaining = 42 - days.length;
    for (let i = 1; i <= remaining; i++) {
      days.push(new Date(year, month + 1, i));
    }

    return days;
  };

  const getWeekDays = (date: Date) => {
    const days: Date[] = [];
    const startOfWeek = new Date(date);
    const day = startOfWeek.getDay() || 7;
    startOfWeek.setDate(startOfWeek.getDate() - day + 1);

    for (let i = 0; i < 7; i++) {
      days.push(new Date(startOfWeek.getTime() + i * 86400000));
    }
    return days;
  };

  const formatDate = (date: Date) => date.toISOString().split('T')[0];

  const getBookingsForDate = (dateStr: string) => {
    return bookings
      .filter((b) => b.date === dateStr)
      .sort((a, b) => a.time.localeCompare(b.time));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'completed':
        return 'bg-gray-100 text-gray-700 border-gray-200';
      case 'cancelled':
        return 'bg-red-100 text-red-700 border-red-200';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'Potwierdzona';
      case 'pending':
        return 'Oczekuje';
      case 'completed':
        return 'Zakończona';
      case 'cancelled':
        return 'Anulowana';
      default:
        return status;
    }
  };

  const updateBookingStatus = (bookingId: string, newStatus: Booking['status']) => {
    const updated = bookings.map((b) =>
      b.id === bookingId ? { ...b, status: newStatus } : b
    );
    saveBookings(updated);
    showToast(`Status zmieniony na: ${getStatusLabel(newStatus)}`, 'success');
    setSelectedBooking(null);
    setShowBookingModal(false);
  };

  const hours = Array.from({ length: 12 }, (_, i) => i + 8); // 8:00 - 19:00

  const dayNames = ['Pon', 'Wt', 'Śr', 'Czw', 'Pt', 'Sob', 'Nd'];
  const monthNames = [
    'Styczeń', 'Luty', 'Marzec', 'Kwiecień', 'Maj', 'Czerwiec',
    'Lipiec', 'Sierpień', 'Wrzesień', 'Październik', 'Listopad', 'Grudzień'
  ];

  const weekDays = getWeekDays(currentDate);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Kalendarz</h1>
          <p className="text-gray-600">Zarządzaj swoimi rezerwacjami</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={goToToday}
            className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50"
          >
            Dzisiaj
          </button>
          <div className="flex bg-white border border-gray-200 rounded-lg overflow-hidden">
            {(['day', 'week', 'month'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`px-4 py-2 text-sm font-medium transition-colors ${
                  viewMode === mode
                    ? 'bg-emerald-500 text-white'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                {mode === 'day' ? 'Dzień' : mode === 'week' ? 'Tydzień' : 'Miesiąc'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="bg-white rounded-xl shadow-sm p-4">
        <div className="flex items-center justify-between">
          <button
            onClick={goToPrevious}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h2 className="text-lg font-bold text-gray-900">
            {viewMode === 'day'
              ? new Date(selectedDate).toLocaleDateString('pl-PL', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })
              : viewMode === 'week'
              ? `${weekDays[0].toLocaleDateString('pl-PL', { day: 'numeric', month: 'short' })} - ${weekDays[6].toLocaleDateString('pl-PL', { day: 'numeric', month: 'short', year: 'numeric' })}`
              : `${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`}
          </h2>
          <button
            onClick={goToNext}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {viewMode === 'week' && (
          <>
            {/* Week Header */}
            <div className="grid grid-cols-8 border-b border-gray-200">
              <div className="p-3 text-center text-sm font-medium text-gray-500 border-r border-gray-200">
                Godzina
              </div>
              {weekDays.map((day, index) => {
                const dateStr = formatDate(day);
                const isToday = dateStr === new Date().toISOString().split('T')[0];
                const dayBookings = getBookingsForDate(dateStr);
                
                return (
                  <div
                    key={index}
                    className={`p-3 text-center border-r border-gray-200 last:border-r-0 cursor-pointer hover:bg-gray-50 ${
                      isToday ? 'bg-emerald-50' : ''
                    }`}
                    onClick={() => setSelectedDate(dateStr)}
                  >
                    <div className="text-xs text-gray-500">{dayNames[index]}</div>
                    <div
                      className={`text-lg font-bold ${
                        isToday ? 'text-emerald-600' : 'text-gray-900'
                      }`}
                    >
                      {day.getDate()}
                    </div>
                    {dayBookings.length > 0 && (
                      <div className="text-xs text-emerald-600 font-medium">
                        {dayBookings.length} rez.
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Time Grid */}
            <div className="max-h-[600px] overflow-y-auto">
              {hours.map((hour) => (
                <div key={hour} className="grid grid-cols-8 border-b border-gray-100">
                  <div className="p-2 text-center text-sm text-gray-500 border-r border-gray-200 bg-gray-50">
                    {hour}:00
                  </div>
                  {weekDays.map((day, dayIndex) => {
                    const dateStr = formatDate(day);
                    const hourBookings = bookings.filter(
                      (b) =>
                        b.date === dateStr &&
                        parseInt(b.time.split(':')[0]) === hour
                    );

                    return (
                      <div
                        key={dayIndex}
                        className="p-1 border-r border-gray-100 last:border-r-0 min-h-[60px] relative"
                      >
                        {hourBookings.map((booking) => (
                          <button
                            key={booking.id}
                            onClick={() => {
                              setSelectedBooking(booking);
                              setShowBookingModal(true);
                            }}
                            className={`w-full text-left p-2 rounded-lg text-xs mb-1 border ${getStatusColor(
                              booking.status
                            )} hover:shadow-md transition-shadow`}
                          >
                            <div className="font-bold truncate">{booking.time}</div>
                            <div className="truncate">{booking.clientName}</div>
                            <div className="truncate text-gray-600">{booking.service}</div>
                          </button>
                        ))}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </>
        )}

        {viewMode === 'day' && (
          <div className="p-4">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
              <CalendarIcon className="w-5 h-5 text-emerald-500" />
              Rezerwacje na {new Date(selectedDate).toLocaleDateString('pl-PL', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
              })}
            </h3>
            
            <div className="space-y-3">
              {hours.map((hour) => {
                const hourBookings = bookings.filter(
                  (b) =>
                    b.date === selectedDate &&
                    parseInt(b.time.split(':')[0]) === hour
                );

                return (
                  <div key={hour} className="flex gap-4">
                    <div className="w-16 text-sm text-gray-500 font-medium pt-2">
                      {hour}:00
                    </div>
                    <div className="flex-1 min-h-[60px] border-l-2 border-gray-200 pl-4">
                      {hourBookings.length === 0 ? (
                        <div className="text-sm text-gray-400 py-2">—</div>
                      ) : (
                        hourBookings.map((booking) => (
                          <button
                            key={booking.id}
                            onClick={() => {
                              setSelectedBooking(booking);
                              setShowBookingModal(true);
                            }}
                            className={`w-full text-left p-4 rounded-xl border-2 mb-2 ${getStatusColor(
                              booking.status
                            )} hover:shadow-lg transition-all`}
                          >
                            <div className="flex items-start justify-between">
                              <div>
                                <div className="font-bold text-gray-900">
                                  {booking.time} - {booking.clientName}
                                </div>
                                <div className="text-sm mt-1">{booking.service}</div>
                                <div className="text-sm text-gray-600 mt-1">
                                  {booking.duration} min • {booking.price} zł
                                </div>
                              </div>
                              <span
                                className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                                  booking.status
                                )}`}
                              >
                                {getStatusLabel(booking.status)}
                              </span>
                            </div>
                          </button>
                        ))
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {viewMode === 'month' && (
          <div className="p-4">
            {/* Month Header */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {dayNames.map((day) => (
                <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
                  {day}
                </div>
              ))}
            </div>
            
            {/* Month Days */}
            <div className="grid grid-cols-7 gap-1">
              {getDaysInMonth(currentDate).map((day, index) => {
                const dateStr = formatDate(day);
                const isCurrentMonth = day.getMonth() === currentDate.getMonth();
                const isToday = dateStr === new Date().toISOString().split('T')[0];
                const isSelected = dateStr === selectedDate;
                const dayBookings = getBookingsForDate(dateStr);

                return (
                  <button
                    key={index}
                    onClick={() => {
                      setSelectedDate(dateStr);
                      setViewMode('day');
                    }}
                    className={`p-2 min-h-[80px] rounded-lg text-left transition-all ${
                      isCurrentMonth ? 'bg-white' : 'bg-gray-50'
                    } ${isToday ? 'ring-2 ring-emerald-500' : ''} ${
                      isSelected ? 'bg-emerald-50' : ''
                    } hover:bg-gray-100`}
                  >
                    <div
                      className={`text-sm font-medium ${
                        isCurrentMonth ? 'text-gray-900' : 'text-gray-400'
                      }`}
                    >
                      {day.getDate()}
                    </div>
                    {dayBookings.slice(0, 2).map((b) => (
                      <div
                        key={b.id}
                        className={`text-xs p-1 rounded mt-1 truncate ${getStatusColor(
                          b.status
                        )}`}
                      >
                        {b.time} {b.clientName.split(' ')[0]}
                      </div>
                    ))}
                    {dayBookings.length > 2 && (
                      <div className="text-xs text-gray-500 mt-1">
                        +{dayBookings.length - 2} więcej
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Today's Summary */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="font-bold text-lg mb-4">Podsumowanie dnia</h3>
        <div className="grid sm:grid-cols-4 gap-4">
          <div className="p-4 bg-blue-50 rounded-xl">
            <div className="text-2xl font-bold text-blue-600">
              {getBookingsForDate(new Date().toISOString().split('T')[0]).length}
            </div>
            <div className="text-sm text-blue-600">Rezerwacje dziś</div>
          </div>
          <div className="p-4 bg-yellow-50 rounded-xl">
            <div className="text-2xl font-bold text-yellow-600">
              {bookings.filter((b) => b.status === 'pending').length}
            </div>
            <div className="text-sm text-yellow-600">Oczekujące</div>
          </div>
          <div className="p-4 bg-green-50 rounded-xl">
            <div className="text-2xl font-bold text-green-600">
              {bookings.filter((b) => b.status === 'confirmed').length}
            </div>
            <div className="text-sm text-green-600">Potwierdzone</div>
          </div>
          <div className="p-4 bg-purple-50 rounded-xl">
            <div className="text-2xl font-bold text-purple-600">
              {bookings
                .filter((b) => b.date === new Date().toISOString().split('T')[0])
                .reduce((sum, b) => sum + b.price, 0)} zł
            </div>
            <div className="text-sm text-purple-600">Przychód dziś</div>
          </div>
        </div>
      </div>

      {/* Booking Detail Modal */}
      {showBookingModal && selectedBooking && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-xl font-bold">Szczegóły rezerwacji</h3>
                <button
                  onClick={() => {
                    setShowBookingModal(false);
                    setSelectedBooking(null);
                  }}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                {/* Status */}
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Status:</span>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                      selectedBooking.status
                    )}`}
                  >
                    {getStatusLabel(selectedBooking.status)}
                  </span>
                </div>

                {/* Client Info */}
                <div className="p-4 bg-gray-50 rounded-xl space-y-3">
                  <div className="flex items-center gap-3">
                    <User className="w-5 h-5 text-gray-400" />
                    <span className="font-medium">{selectedBooking.clientName}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="w-5 h-5 text-gray-400" />
                    <a
                      href={`tel:${selectedBooking.clientPhone}`}
                      className="text-emerald-600 hover:underline"
                    >
                      {selectedBooking.clientPhone}
                    </a>
                  </div>
                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-gray-400" />
                    <a
                      href={`mailto:${selectedBooking.clientEmail}`}
                      className="text-emerald-600 hover:underline"
                    >
                      {selectedBooking.clientEmail}
                    </a>
                  </div>
                  {selectedBooking.address && (
                    <div className="flex items-center gap-3">
                      <MapPin className="w-5 h-5 text-gray-400" />
                      <span>{selectedBooking.address}</span>
                    </div>
                  )}
                </div>

                {/* Service Info */}
                <div className="p-4 bg-emerald-50 rounded-xl">
                  <div className="font-bold text-emerald-700">{selectedBooking.service}</div>
                  <div className="flex items-center gap-4 mt-2 text-sm text-emerald-600">
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {selectedBooking.time}
                    </span>
                    <span>{selectedBooking.duration} min</span>
                    <span className="font-bold">{selectedBooking.price} zł</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-4">
                  {selectedBooking.status === 'pending' && (
                    <>
                      <button
                        onClick={() => updateBookingStatus(selectedBooking.id, 'confirmed')}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-green-500 text-white rounded-xl font-semibold hover:bg-green-600"
                      >
                        <Check className="w-5 h-5" />
                        Potwierdź
                      </button>
                      <button
                        onClick={() => updateBookingStatus(selectedBooking.id, 'cancelled')}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-red-500 text-white rounded-xl font-semibold hover:bg-red-600"
                      >
                        <X className="w-5 h-5" />
                        Anuluj
                      </button>
                    </>
                  )}
                  {selectedBooking.status === 'confirmed' && (
                    <button
                      onClick={() => updateBookingStatus(selectedBooking.id, 'completed')}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-emerald-500 text-white rounded-xl font-semibold hover:bg-emerald-600"
                    >
                      <Check className="w-5 h-5" />
                      Oznacz jako zakończone
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BusinessCalendar;
