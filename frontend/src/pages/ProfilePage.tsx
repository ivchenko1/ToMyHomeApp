// src/pages/ProfilePage.tsx
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Home,
  Gift,
  Heart,
  Calendar,
  Settings,
  HelpCircle,
  LogOut,
  Camera,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Eye,
  EyeOff,
  Lock,
  Save,
  Clock,
  X,
  Star,
} from 'lucide-react';
import { useAuth, useToast } from '../App';
import PhoneInput, { validatePhoneNumber } from '../components/PhoneInput';
import { 
  updateUserProfile, 
  uploadAvatar, 
  changePassword,
  deleteUserAccount 
} from '../services/userService';
import favoriteService, { Favorite } from '../services/favoriteService';
import bookingService, { Booking } from '../services/bookingService';
import reviewService from '../services/reviewService';
import { Link } from 'react-router-dom';

type SectionType =
  | 'dashboard'
  | 'referral'
  | 'favorites'
  | 'visits'
  | 'settings'
  | 'help';

const ProfilePage = () => {
  const navigate = useNavigate();
  const { user, userData, isAuthenticated, logout } = useAuth();
  const { showToast } = useToast();
  const [activeSection, setActiveSection] = useState<SectionType>('dashboard');
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [favoritesLoading, setFavoritesLoading] = useState(false);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [bookingsLoading, setBookingsLoading] = useState(false);
  
  // Stan dla modalu opinii
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewBooking, setReviewBooking] = useState<Booking | null>(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewedBookings, setReviewedBookings] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/auth');
    }
  }, [isAuthenticated, navigate]);

  // Ładuj rezerwacje użytkownika
  useEffect(() => {
    const loadBookings = async () => {
      if (!user?.id) return;
      
      setBookingsLoading(true);
      try {
        const userBookings = await bookingService.getByClient(String(user.id));
        setBookings(userBookings);
      } catch (error) {
        console.error('Error loading bookings:', error);
      } finally {
        setBookingsLoading(false);
      }
    };
    
    loadBookings();
  }, [user?.id]);

  // Ładuj ulubione przy starcie
  useEffect(() => {
    const loadFavorites = async () => {
      if (!user?.id) return;
      
      setFavoritesLoading(true);
      try {
        const favs = await favoriteService.getByUser(String(user.id));
        setFavorites(favs);
      } catch (error) {
        console.error('Error loading favorites:', error);
      } finally {
        setFavoritesLoading(false);
      }
    };
    
    loadFavorites();
  }, [user?.id]);

  // Sprawdź które rezerwacje mają już opinie
  useEffect(() => {
    const checkReviews = async () => {
      if (!bookings.length) return;
      
      const reviewed = new Set<string>();
      for (const booking of bookings) {
        if (booking.status === 'completed' || (booking.status !== 'cancelled' && new Date(booking.date) < new Date())) {
          const hasReview = await reviewService.hasReviewForBooking(booking.id);
          if (hasReview) {
            reviewed.add(booking.id);
          }
        }
      }
      setReviewedBookings(reviewed);
    };
    
    checkReviews();
  }, [bookings]);

  // Otwórz modal opinii
  const openReviewModal = (booking: Booking) => {
    setReviewBooking(booking);
    setReviewRating(5);
    setReviewComment('');
    setShowReviewModal(true);
  };

  // Wyślij opinię
  const submitReview = async () => {
    if (!reviewBooking || !user) return;
    
    if (reviewComment.trim().length < 10) {
      showToast('Opinia musi mieć minimum 10 znaków', 'error');
      return;
    }
    
    setReviewSubmitting(true);
    try {
      await reviewService.create({
        bookingId: reviewBooking.id,
        providerId: reviewBooking.providerId,
        clientId: user.id,
        clientName: user.username || 'Klient',
        rating: reviewRating,
        comment: reviewComment.trim(),
        serviceName: reviewBooking.serviceName,
      });
      
      setReviewedBookings(prev => new Set([...prev, reviewBooking.id]));
      setShowReviewModal(false);
      showToast('Dziękujemy za opinię! ⭐', 'success');
    } catch (error) {
      console.error('Error submitting review:', error);
      showToast('Błąd podczas wysyłania opinii', 'error');
    } finally {
      setReviewSubmitting(false);
    }
  };

  // Pobierz nadchodzące wizyty (od dziś)
  const getUpcomingBookings = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return bookings
      .filter(b => {
        const bookingDate = new Date(b.date);
        return bookingDate >= today && b.status !== 'cancelled';
      })
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  };

  // Pobierz daty z rezerwacjami w danym miesiącu
  const getBookingDatesInMonth = () => {
    const dates = new Set<number>();
    bookings.forEach(b => {
      const bookingDate = new Date(b.date);
      if (
        bookingDate.getMonth() === currentMonth.getMonth() &&
        bookingDate.getFullYear() === currentMonth.getFullYear() &&
        b.status !== 'cancelled'
      ) {
        dates.add(bookingDate.getDate());
      }
    });
    return dates;
  };

  // Anuluj rezerwację
  const cancelBooking = async (bookingId: string) => {
    if (!confirm('Czy na pewno chcesz anulować tę wizytę?')) return;
    
    try {
      await bookingService.updateStatus(bookingId, 'cancelled');
      setBookings(prev => prev.map(b => 
        b.id === bookingId ? { ...b, status: 'cancelled' as const } : b
      ));
      showToast('Wizyta została anulowana', 'success');
    } catch (error) {
      showToast('Błąd podczas anulowania', 'error');
    }
  };

  // Usuń z ulubionych
  const removeFavorite = async (providerId: string) => {
    if (!user?.id) return;
    
    try {
      await favoriteService.remove(String(user.id), providerId);
      setFavorites(prev => prev.filter(f => f.providerId !== providerId));
      showToast('Usunięto z ulubionych', 'success');
    } catch (error) {
      showToast('Błąd podczas usuwania', 'error');
    }
  };

  const menuItems = [
    { id: 'dashboard', label: 'Panel Główny', icon: Home },
    { id: 'referral', label: 'Poleć znajomym', icon: Gift },
    { id: 'favorites', label: 'Ulubione', icon: Heart },
    { id: 'visits', label: 'Moje wizyty', icon: Calendar },
    { id: 'settings', label: 'Ustawienia', icon: Settings },
    { id: 'help', label: 'Pomoc', icon: HelpCircle },
  ];

  const handleLogout = async () => {
    if (window.confirm('Czy na pewno chcesz się wylogować?')) {
      try {
        await logout();
        showToast('Wylogowano pomyślnie', 'success');
        navigate('/');
      } catch (error) {
        showToast('Błąd wylogowania', 'error');
      }
    }
  };

  // Calendar functions
  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    const day = new Date(date.getFullYear(), date.getMonth(), 1).getDay();
    return day === 0 ? 6 : day - 1;
  };

  const monthNames = [
    'Styczeń', 'Luty', 'Marzec', 'Kwiecień', 'Maj', 'Czerwiec',
    'Lipiec', 'Sierpień', 'Wrzesień', 'Październik', 'Listopad', 'Grudzień',
  ];

  const renderCalendar = () => {
    const days = getDaysInMonth(currentMonth);
    const firstDay = getFirstDayOfMonth(currentMonth);
    const today = new Date();
    const dayNames = ['Pn', 'Wt', 'Śr', 'Cz', 'Pt', 'Sb', 'Nd'];
    const bookingDates = getBookingDatesInMonth();

    return (
      <div className="bg-white rounded-xl border-2 border-gray-100 p-6">
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
          <button
            onClick={() =>
              setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))
            }
            className="p-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <div className="font-bold text-lg">
            {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
          </div>
          <button
            onClick={() =>
              setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))
            }
            className="p-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-7 gap-2 text-center">
          {dayNames.map((day) => (
            <div key={day} className="font-semibold text-gray-500 text-sm py-2">
              {day}
            </div>
          ))}
          {[...Array(firstDay)].map((_, i) => (
            <div key={`empty-${i}`} />
          ))}
          {[...Array(days)].map((_, i) => {
            const day = i + 1;
            const isToday =
              day === today.getDate() &&
              currentMonth.getMonth() === today.getMonth() &&
              currentMonth.getFullYear() === today.getFullYear();
            const hasBooking = bookingDates.has(day);

            return (
              <div
                key={day}
                className={`py-3 rounded-lg cursor-pointer transition-all hover:scale-110 relative ${
                  isToday
                    ? 'bg-primary text-white font-bold'
                    : hasBooking
                    ? 'bg-emerald-100 text-emerald-700 font-semibold'
                    : 'bg-gray-50 hover:bg-gray-100'
                }`}
              >
                {day}
                {hasBooking && !isToday && (
                  <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                )}
              </div>
            );
          })}
        </div>
        
        {/* Legenda */}
        <div className="mt-4 pt-4 border-t border-gray-100 flex items-center gap-4 text-xs text-gray-500">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-primary rounded" />
            <span>Dziś</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-emerald-100 rounded" />
            <span>Masz wizytę</span>
          </div>
        </div>
      </div>
    );
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard':
        const upcomingCount = getUpcomingBookings().length;
        const favoritesCount = favorites.length;
        
        return (
          <div>
            <div className="bg-gradient-to-r from-primary to-secondary text-white rounded-2xl p-8 mb-8">
              <h2 className="text-2xl font-bold mb-2">Witaj z powrotem, {user?.username || userData?.username}!</h2>
              <p className="opacity-90">
                Miło Cię widzieć. Oto Twój panel użytkownika gdzie możesz zarządzać swoim kontem i
                rezerwacjami.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div 
                className="card p-6 text-center cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => setActiveSection('visits')}
              >
                <div className="text-4xl font-bold text-gray-900 mb-2">{upcomingCount}</div>
                <div className="text-gray-500">Nadchodzących wizyt</div>
              </div>
              <div 
                className="card p-6 text-center cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => setActiveSection('favorites')}
              >
                <div className="text-4xl font-bold text-gray-900 mb-2">{favoritesCount}</div>
                <div className="text-gray-500">Ulubionych miejsc</div>
              </div>
            </div>
          </div>
        );

      case 'referral':
        return (
          <div>
            <div className="bg-gradient-to-r from-primary to-secondary text-white rounded-2xl p-8 mb-8">
              <h2 className="text-2xl font-bold mb-4">Zapraszaj i zarabiaj!</h2>
              <p className="text-lg opacity-95">
                Każdy polecony znajomy to <strong>50 zł</strong> na Twoje konto!
              </p>
            </div>

            <div className="bg-gray-50 rounded-xl p-8">
              <h3 className="font-bold text-lg mb-4">Twój unikalny link:</h3>
              <div className="flex gap-4">
                <input
                  type="text"
                  readOnly
                  disabled
                  value={`https://tomyhomeapp.pl/ref/${user?.id || 'user'}`}
                  className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl bg-gray-100 text-gray-600 cursor-not-allowed select-all"
                />
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(
                      `https://tomyhomeapp.pl/ref/${user?.id || 'user'}`
                    );
                    showToast('Link skopiowany!', 'success');
                  }}
                  className="btn btn-primary"
                >
                  Kopiuj
                </button>
              </div>
            </div>
          </div>
        );

      case 'favorites':
        return (
          <div>
            {favoritesLoading ? (
              <div className="text-center py-16">
                <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto mb-4" />
                <p className="text-gray-500">Ładowanie ulubionych...</p>
              </div>
            ) : favorites.length === 0 ? (
              <div className="text-center py-16">
                <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 mb-4">Nie masz jeszcze ulubionych miejsc.</p>
                <Link 
                  to="/uslugodawcy" 
                  className="inline-block px-6 py-3 bg-primary text-white rounded-xl font-medium hover:bg-primary/90 transition-colors"
                >
                  Przeglądaj usługodawców
                </Link>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {favorites.map((fav) => (
                  <div key={fav.id} className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100 hover:shadow-md transition-shadow">
                    <Link to={`/uslugodawcy/profil/${fav.providerId}`}>
                      <div className="relative h-40">
                        <img 
                          src={fav.providerImage || 'https://via.placeholder.com/300x200'} 
                          alt={fav.providerName}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                        <div className="absolute bottom-3 left-3 text-white">
                          <h3 className="font-bold">{fav.providerName}</h3>
                          <p className="text-sm text-white/80">{fav.providerProfession}</p>
                        </div>
                      </div>
                    </Link>
                    <div className="p-3 flex items-center justify-between">
                      <Link 
                        to={`/uslugodawcy/profil/${fav.providerId}`}
                        className="text-sm text-primary font-medium hover:underline"
                      >
                        Zobacz profil
                      </Link>
                      <button
                        onClick={() => removeFavorite(fav.providerId)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors"
                        title="Usuń z ulubionych"
                      >
                        <Heart className="w-5 h-5 fill-current" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      case 'visits':
        const upcomingBookings = getUpcomingBookings();
        const pastBookings = bookings
          .filter(b => {
            const bookingDate = new Date(b.date);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            return bookingDate < today || b.status === 'cancelled';
          })
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
          .slice(0, 20);

        return (
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <h3 className="font-bold text-lg mb-4">Kalendarz wizyt</h3>
              {renderCalendar()}
              
              {/* Historia wizyt */}
              {pastBookings.length > 0 && (
                <div className="mt-6">
                  <h3 className="font-bold text-lg mb-4">Historia wizyt</h3>
                  <div className="space-y-3">
                    {pastBookings.map(booking => {
                      const canReview = booking.status !== 'cancelled' && !reviewedBookings.has(booking.id);
                      const hasReviewed = reviewedBookings.has(booking.id);
                      
                      return (
                      <div 
                        key={booking.id} 
                        className={`bg-white rounded-xl border p-4 ${
                          booking.status === 'cancelled' ? 'opacity-60' : ''
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <img 
                            src={booking.providerImage || 'https://via.placeholder.com/50'} 
                            alt={booking.providerName}
                            className="w-12 h-12 rounded-full object-cover"
                          />
                          <div className="flex-1">
                            <p className="font-semibold text-gray-900">{booking.serviceName}</p>
                            <p className="text-sm text-gray-500">{booking.providerName}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium text-gray-700">
                              {new Date(booking.date).toLocaleDateString('pl-PL')}
                            </p>
                            <p className={`text-xs ${
                              booking.status === 'cancelled' ? 'text-red-500' : 
                              booking.status === 'completed' ? 'text-green-500' : 'text-gray-400'
                            }`}>
                              {booking.status === 'cancelled' ? 'Anulowana' : 
                               booking.status === 'completed' ? 'Zakończona' : 'Minęła'}
                            </p>
                          </div>
                        </div>
                        
                        {/* Przycisk opinii */}
                        {canReview && (
                          <div className="mt-3 pt-3 border-t border-gray-100">
                            <button
                              onClick={() => openReviewModal(booking)}
                              className="flex items-center gap-2 text-sm text-amber-600 hover:text-amber-700 font-medium"
                            >
                              <Star className="w-4 h-4" />
                              Wystaw opinię
                            </button>
                          </div>
                        )}
                        {hasReviewed && (
                          <div className="mt-3 pt-3 border-t border-gray-100">
                            <span className="flex items-center gap-2 text-sm text-green-600">
                              <Star className="w-4 h-4 fill-current" />
                              Opinia wystawiona
                            </span>
                          </div>
                        )}
                      </div>
                    );
                    })}
                  </div>
                </div>
              )}
            </div>
            
            <div>
              <h3 className="font-bold text-lg mb-4">Nadchodzące wizyty</h3>
              {bookingsLoading ? (
                <div className="text-center py-8">
                  <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" />
                </div>
              ) : upcomingBookings.length === 0 ? (
                <div className="bg-gray-50 rounded-xl p-6 text-center">
                  <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 mb-4">Brak nadchodzących wizyt</p>
                  <Link 
                    to="/uslugodawcy"
                    className="inline-block px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90"
                  >
                    Znajdź usługodawcę
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {upcomingBookings.map(booking => {
                    const bookingDate = new Date(booking.date);
                    const isToday = bookingDate.toDateString() === new Date().toDateString();
                    const isTomorrow = bookingDate.toDateString() === new Date(Date.now() + 86400000).toDateString();
                    
                    return (
                      <div 
                        key={booking.id} 
                        className={`bg-white rounded-xl border-2 p-4 ${
                          isToday ? 'border-primary bg-primary/5' : 
                          isTomorrow ? 'border-yellow-400 bg-yellow-50' : 'border-gray-100'
                        }`}
                      >
                        {isToday && (
                          <div className="text-xs font-bold text-primary mb-2">📅 DZISIAJ</div>
                        )}
                        {isTomorrow && (
                          <div className="text-xs font-bold text-yellow-600 mb-2">⏰ JUTRO</div>
                        )}
                        
                        <div className="flex items-start gap-3">
                          <img 
                            src={booking.providerImage || 'https://via.placeholder.com/50'} 
                            alt={booking.providerName}
                            className="w-14 h-14 rounded-xl object-cover"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-gray-900 truncate">{booking.serviceName}</p>
                            <p className="text-sm text-gray-600">{booking.providerName}</p>
                            
                            <div className="flex items-center gap-3 mt-2 text-sm text-gray-500">
                              <div className="flex items-center gap-1">
                                <Calendar className="w-4 h-4" />
                                <span>{bookingDate.toLocaleDateString('pl-PL', { weekday: 'short', day: 'numeric', month: 'short' })}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Clock className="w-4 h-4" />
                                <span>{booking.time}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                          <span className="font-bold text-primary">{booking.servicePrice} zł</span>
                          <div className="flex gap-2">
                            <Link
                              to={`/uslugodawcy/profil/${booking.providerId}`}
                              className="px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                            >
                              Zobacz profil
                            </Link>
                            <button
                              onClick={() => cancelBooking(booking.id)}
                              className="px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-lg"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                        
                        {booking.status === 'pending' && (
                          <div className="mt-2 text-xs text-yellow-600 bg-yellow-50 px-2 py-1 rounded">
                            ⏳ Oczekuje na potwierdzenie
                          </div>
                        )}
                        {booking.status === 'confirmed' && (
                          <div className="mt-2 text-xs text-green-600 bg-green-50 px-2 py-1 rounded">
                            ✅ Potwierdzona
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        );

      case 'settings':
        return (
          <SettingsSection />
        );

      case 'help':
        return (
          <div className="card p-8">
            <h3 className="text-xl font-bold mb-4">Centrum Pomocy</h3>
            <p className="text-gray-600 mb-4">
              Masz pytania? Skontaktuj się z nami!
            </p>
            <p className="text-primary font-semibold">pomoc@tomyhomeapp.pl</p>
          </div>
        );

      default:
        return null;
    }
  };

  // ==================== SETTINGS SECTION ====================
  const SettingsSection = () => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    
    // Parsuj numer telefonu
    const parsePhoneNumber = (phone: string | undefined) => {
      if (!phone) return { countryCode: '+48', number: '' };
      const match = phone.match(/^(\+\d{1,3})\s?(.*)$/);
      if (match) {
        return { countryCode: match[1], number: match[2] };
      }
      return { countryCode: '+48', number: phone };
    };

    const parsedPhone = parsePhoneNumber(userData?.phone || user?.phone);
    
    // Form state
    const [formData, setFormData] = useState({
      username: userData?.username || user?.username || '',
      phone: parsedPhone.number,
      phoneCountryCode: parsedPhone.countryCode,
      businessName: userData?.businessName || '',
    });
    
    const [avatarUrl, setAvatarUrl] = useState(userData?.avatar || user?.avatar || '');
    const [saving, setSaving] = useState(false);
    const [uploadingAvatar, setUploadingAvatar] = useState(false);
    
    // Password change state
    const [showPasswordForm, setShowPasswordForm] = useState(false);
    const [passwordData, setPasswordData] = useState({
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    });
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [changingPassword, setChangingPassword] = useState(false);

    // Handle avatar upload
    const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file || !user?.id) return;

      setUploadingAvatar(true);
      try {
        const newAvatarUrl = await uploadAvatar(user.id, file);
        setAvatarUrl(newAvatarUrl);
        showToast('Zdjęcie zostało zmienione!', 'success');
      } catch (error: any) {
        showToast(error.message || 'Błąd przesyłania zdjęcia', 'error');
      } finally {
        setUploadingAvatar(false);
      }
    };

    // Handle profile form submit
    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      
      // Walidacja imienia i nazwiska
      const nameParts = formData.username.trim().split(/\s+/);
      if (nameParts.length < 2 || nameParts.some((part: string) => part.length < 2)) {
        showToast('Podaj pełne imię i nazwisko (np. Jan Kowalski)', 'error');
        return;
      }
      
      // Walidacja telefonu
      const phoneValidation = validatePhoneNumber(formData.phoneCountryCode, formData.phone);
      if (!phoneValidation.valid) {
        showToast(phoneValidation.message, 'error');
        return;
      }

      if (!user?.id) return;

      setSaving(true);
      try {
        const formattedPhone = `${formData.phoneCountryCode} ${formData.phone.replace(/\D/g, '')}`;
        
        // Przygotuj dane do aktualizacji (bez pustych wartości)
        const updateData: Record<string, string> = {
          username: formData.username,
          phone: formattedPhone,
        };
        
        // Dodaj businessName tylko jeśli nie jest pusty
        if (formData.businessName && formData.businessName.trim()) {
          updateData.businessName = formData.businessName.trim();
        }
        
        await updateUserProfile(user.id, updateData);
        
        showToast('Zmiany zostały zapisane!', 'success');
      } catch (error: any) {
        showToast(error.message || 'Błąd zapisywania zmian', 'error');
      } finally {
        setSaving(false);
      }
    };

    // Handle password change
    const handlePasswordChange = async (e: React.FormEvent) => {
      e.preventDefault();

      if (passwordData.newPassword !== passwordData.confirmPassword) {
        showToast('Hasła nie są zgodne', 'error');
        return;
      }

      if (passwordData.newPassword.length < 8) {
        showToast('Hasło musi mieć co najmniej 8 znaków', 'error');
        return;
      }

      setChangingPassword(true);
      try {
        await changePassword(passwordData.currentPassword, passwordData.newPassword);
        showToast('Hasło zostało zmienione!', 'success');
        setShowPasswordForm(false);
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      } catch (error: any) {
        showToast(error.message || 'Błąd zmiany hasła', 'error');
      } finally {
        setChangingPassword(false);
      }
    };

    // Handle account deletion
    const handleDeleteAccount = async () => {
      const password = window.prompt('Aby usunąć konto, wpisz swoje hasło:');
      if (password === null) return;
      
      if (!password || password.length < 8) {
        showToast('Nieprawidłowe hasło', 'error');
        return;
      }
      
      if (!window.confirm('UWAGA: Czy na pewno chcesz usunąć swoje konto? Ta operacja jest nieodwracalna!')) {
        return;
      }

      try {
        await deleteUserAccount(password);
        showToast('Konto zostało usunięte', 'info');
        navigate('/');
      } catch (error: any) {
        showToast(error.message || 'Błąd usuwania konta', 'error');
      }
    };

    return (
      <div className="max-w-2xl space-y-6">
        {/* Avatar */}
        <div className="card p-8">
          <h3 className="font-bold text-lg mb-6">Zdjęcie profilowe</h3>
          <div className="flex items-center gap-6">
            <div className="relative">
              <div className="w-24 h-24 rounded-full overflow-hidden bg-gradient-to-r from-primary to-secondary flex items-center justify-center text-white text-3xl">
                {uploadingAvatar ? (
                  <Loader2 className="w-8 h-8 animate-spin" />
                ) : avatarUrl ? (
                  <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  '👤'
                )}
              </div>
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingAvatar}
                className="absolute bottom-0 right-0 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-100 transition-colors disabled:opacity-50"
              >
                <Camera className="w-4 h-4 text-gray-600" />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
              />
            </div>
            <div>
              <p className="text-gray-600 text-sm">
                Kliknij ikonę aparatu aby zmienić zdjęcie.
              </p>
              <p className="text-gray-400 text-xs mt-1">
                Max 5MB, formaty: JPG, PNG, GIF
              </p>
            </div>
          </div>
        </div>

        {/* Dane osobowe */}
        <div className="card p-8">
          <h3 className="font-bold text-lg mb-6">Dane osobowe</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-gray-500 mb-2">Imię i Nazwisko</label>
              <input
                type="text"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                placeholder="Jan Kowalski"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary focus:ring-0 focus:outline-none"
              />
              <p className="text-xs text-gray-500 mt-1">Wpisz imię i nazwisko</p>
            </div>
            
            <div>
              <label className="block text-sm text-gray-500 mb-2">Email</label>
              <input
                type="email"
                value={userData?.email || user?.email || ''}
                readOnly
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl bg-gray-50 text-gray-500"
              />
              <p className="text-xs text-gray-400 mt-1">Email nie może być zmieniony</p>
            </div>
            
            <div>
              <label className="block text-sm text-gray-500 mb-2">Telefon</label>
              <PhoneInput
                value={formData.phone}
                countryCode={formData.phoneCountryCode}
                onChange={(phone, code) => {
                  setFormData({ ...formData, phone, phoneCountryCode: code });
                }}
              />
            </div>

            {(userData?.accountType === 'provider' || user?.accountType === 'provider') && (
              <div>
                <label className="block text-sm text-gray-500 mb-2">Nazwa firmy / salonu</label>
                <input
                  type="text"
                  value={formData.businessName}
                  onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                  placeholder="np. Beauty Studio Anna"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary focus:ring-0 focus:outline-none"
                />
              </div>
            )}

            <button
              type="submit"
              disabled={saving}
              className="btn btn-primary mt-4 flex items-center gap-2"
            >
              {saving ? (
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
          </form>
        </div>

        {/* Zmiana hasła */}
        <div className="card p-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-lg">Zmiana hasła</h3>
            <button
              onClick={() => setShowPasswordForm(!showPasswordForm)}
              className="text-primary hover:underline text-sm font-medium"
            >
              {showPasswordForm ? 'Anuluj' : 'Zmień hasło'}
            </button>
          </div>

          {showPasswordForm ? (
            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-500 mb-2">Obecne hasło</label>
                <div className="relative">
                  <input
                    type={showCurrentPassword ? 'text' : 'password'}
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                    placeholder="••••••••"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary focus:ring-0 focus:outline-none"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showCurrentPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-500 mb-2">Nowe hasło</label>
                <div className="relative">
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                    placeholder="••••••••"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary focus:ring-0 focus:outline-none"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                <div className="mt-2 text-xs text-gray-500 space-y-1">
                  <p className={passwordData.newPassword.length >= 8 ? 'text-green-600' : ''}>
                    {passwordData.newPassword.length >= 8 ? '✓' : '○'} Minimum 8 znaków
                  </p>
                  <p className={/[A-Z]/.test(passwordData.newPassword) ? 'text-green-600' : ''}>
                    {/[A-Z]/.test(passwordData.newPassword) ? '✓' : '○'} Wielka litera
                  </p>
                  <p className={/[a-z]/.test(passwordData.newPassword) ? 'text-green-600' : ''}>
                    {/[a-z]/.test(passwordData.newPassword) ? '✓' : '○'} Mała litera
                  </p>
                  <p className={/[0-9]/.test(passwordData.newPassword) ? 'text-green-600' : ''}>
                    {/[0-9]/.test(passwordData.newPassword) ? '✓' : '○'} Cyfra
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-500 mb-2">Potwierdź nowe hasło</label>
                <input
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary focus:ring-0 focus:outline-none"
                  required
                />
                {passwordData.confirmPassword && (
                  <p className={`text-xs mt-1 ${passwordData.newPassword === passwordData.confirmPassword ? 'text-green-600' : 'text-red-500'}`}>
                    {passwordData.newPassword === passwordData.confirmPassword ? '✓ Hasła są zgodne' : '✗ Hasła nie są zgodne'}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={changingPassword}
                className="btn btn-primary flex items-center gap-2"
              >
                {changingPassword ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Zmieniam...
                  </>
                ) : (
                  <>
                    <Lock className="w-5 h-5" />
                    Zmień hasło
                  </>
                )}
              </button>
            </form>
          ) : (
            <p className="text-gray-500 text-sm">
              Zalecamy regularną zmianę hasła dla bezpieczeństwa konta.
            </p>
          )}
        </div>

        {/* Strefa zagrożenia */}
        <div className="card p-8 border-2 border-red-200 bg-red-50">
          <h3 className="font-bold text-lg text-red-600 mb-4">Strefa zagrożenia</h3>
          <p className="text-gray-600 mb-4">
            Po usunięciu konta wszystkie Twoje dane, rezerwacje i historia zostaną trwale usunięte. 
            Ta operacja jest nieodwracalna.
          </p>
          <button
            onClick={handleDeleteAccount}
            className="px-4 py-2 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition-colors"
          >
            Usuń moje konto
          </button>
        </div>
      </div>
    );
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      {/* Mobile Navigation */}
      <div className="lg:hidden mb-6 overflow-x-auto">
        <div className="flex gap-2 pb-2 min-w-max">
          {menuItems.map((item) => {
            const isDisabled = item.id === 'referral';
            return (
              <button
                key={item.id}
                onClick={() => !isDisabled && setActiveSection(item.id as SectionType)}
                disabled={isDisabled}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl whitespace-nowrap transition-all ${
                  isDisabled
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed opacity-60'
                    : activeSection === item.id
                      ? 'bg-primary text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <item.icon className="w-4 h-4" />
                <span className="text-sm font-medium">{item.label}</span>
              </button>
            );
          })}
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 rounded-xl whitespace-nowrap bg-red-50 text-red-600 hover:bg-red-100 transition-all"
          >
            <LogOut className="w-4 h-4" />
            <span className="text-sm font-medium">Wyloguj</span>
          </button>
        </div>
      </div>

      <div className="flex gap-8">
        {/* Sidebar - tylko desktop */}
        <aside className="w-72 shrink-0 hidden lg:block">
          <div className="card p-6 sticky top-24">
            {/* Profile Section */}
            <div className="text-center mb-6 pb-6 border-b border-gray-100">
              <div className="relative inline-block">
                <div className="w-20 h-20 rounded-full overflow-hidden bg-gradient-to-r from-primary to-secondary flex items-center justify-center text-white text-3xl">
                  {userData?.avatar || user?.avatar ? (
                    <img 
                      src={userData?.avatar || user?.avatar} 
                      alt="Avatar" 
                      className="w-full h-full object-cover" 
                    />
                  ) : (
                    '👤'
                  )}
                </div>
              </div>
              <div className="font-bold text-lg mt-3">{userData?.username || user?.username}</div>
              <div className="text-gray-500 text-sm">{userData?.phone || user?.phone}</div>
              {(userData?.accountType === 'provider' || user?.accountType === 'provider') && (
                <span className="inline-block mt-2 px-3 py-1 bg-emerald-100 text-emerald-700 text-xs font-medium rounded-full">
                  Usługodawca
                </span>
              )}
            </div>

            {/* Menu */}
            <nav className="space-y-1">
              {menuItems.map((item) => {
                const isDisabled = item.id === 'referral';
                return (
                  <button
                    key={item.id}
                    onClick={() => !isDisabled && setActiveSection(item.id as SectionType)}
                    disabled={isDisabled}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                      isDisabled
                        ? 'text-gray-400 cursor-not-allowed opacity-60'
                        : activeSection === item.id
                          ? 'bg-primary text-white'
                          : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <item.icon className="w-5 h-5" />
                    <span className="font-medium">{item.label}</span>
                  </button>
                );
              })}
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 transition-all"
              >
                <LogOut className="w-5 h-5" />
                <span className="font-medium">Wyloguj</span>
              </button>
            </nav>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 min-w-0">
          <div className="mb-6">
            <h1 className="text-2xl font-bold">
              {menuItems.find((m) => m.id === activeSection)?.label || 'Panel Główny'}
            </h1>
            <p className="text-gray-500">
              {activeSection === 'dashboard' && 'Przegląd Twojej aktywności'}
              {activeSection === 'referral' && 'Zapraszaj znajomych i zarabiaj'}
              {activeSection === 'favorites' && 'Twoje ulubione miejsca i usługi'}
              {activeSection === 'visits' && 'Kalendarz i historia rezerwacji'}
              {activeSection === 'settings' && 'Personalizuj swoje konto'}
              {activeSection === 'help' && 'FAQ i Kontakt'}
            </p>
          </div>

          {renderContent()}
        </main>
      </div>

      {/* Modal wystawiania opinii */}
      {showReviewModal && reviewBooking && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-xl font-bold">Wystaw opinię</h3>
                <button
                  onClick={() => setShowReviewModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Info o wizycie */}
              <div className="p-4 bg-gray-50 rounded-xl mb-6">
                <div className="flex items-center gap-3">
                  <img 
                    src={reviewBooking.providerImage || 'https://via.placeholder.com/50'} 
                    alt={reviewBooking.providerName}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                    <p className="font-semibold">{reviewBooking.providerName}</p>
                    <p className="text-sm text-gray-500">{reviewBooking.serviceName}</p>
                    <p className="text-xs text-gray-400">
                      {new Date(reviewBooking.date).toLocaleDateString('pl-PL')}
                    </p>
                  </div>
                </div>
              </div>

              {/* Ocena gwiazdkowa */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Twoja ocena
                </label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setReviewRating(star)}
                      className="p-1 transition-transform hover:scale-110"
                    >
                      <Star 
                        className={`w-10 h-10 ${
                          star <= reviewRating 
                            ? 'text-amber-400 fill-amber-400' 
                            : 'text-gray-300'
                        }`}
                      />
                    </button>
                  ))}
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  {reviewRating === 1 && 'Bardzo słabo'}
                  {reviewRating === 2 && 'Słabo'}
                  {reviewRating === 3 && 'Średnio'}
                  {reviewRating === 4 && 'Dobrze'}
                  {reviewRating === 5 && 'Świetnie!'}
                </p>
              </div>

              {/* Komentarz */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Twoja opinia
                </label>
                <textarea
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder="Opisz swoje doświadczenie z usługą..."
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary focus:ring-0 resize-none"
                  rows={4}
                />
                <p className="text-xs text-gray-400 mt-1">
                  Minimum 10 znaków ({reviewComment.length}/10)
                </p>
              </div>

              {/* Przyciski */}
              <div className="flex gap-3">
                <button
                  onClick={() => setShowReviewModal(false)}
                  className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl font-medium hover:bg-gray-50"
                >
                  Anuluj
                </button>
                <button
                  onClick={submitReview}
                  disabled={reviewSubmitting || reviewComment.length < 10}
                  className="flex-1 px-4 py-3 bg-primary text-white rounded-xl font-semibold hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {reviewSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Wysyłanie...
                    </>
                  ) : (
                    <>
                      <Star className="w-5 h-5" />
                      Wyślij opinię
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;