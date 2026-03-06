import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Check,
  Star,
  MapPin,
  Car,
  CreditCard,
  Clock,
  Heart,
  MessageCircle,
  ChevronLeft,
  ChevronRight,
  Award,
  Shield,
  Share2,
  Loader2,
  Flag,
  X,
} from 'lucide-react';
import { useToast, useAuth } from '../App';
import providerService, { Provider, ServiceItem } from '../services/providerService';
import bookingService from '../services/bookingService';
import favoriteService from '../services/favoriteService';
import reviewService, { Review } from '../services/reviewService';
import PaymentModal from '../components/PaymentModal';

const StatBadge = ({ icon: Icon, value, label, color }: {
  icon: any;
  value: string | number;
  label: string;
  color: string;
}) => (
  <div className={`flex items-center gap-2 px-3 py-2 rounded-xl ${color}`}>
    <Icon className="w-4 h-4" />
    <span className="font-bold">{value}</span>
    <span className="text-sm opacity-80">{label}</span>
  </div>
);

const ServiceCard = ({ 
  service, 
  isSelected, 
  onToggle 
}: { 
  service: ServiceItem; 
  isSelected: boolean; 
  onToggle: () => void;
}) => (
  <div
    onClick={onToggle}
    className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
      isSelected
        ? 'border-primary bg-primary/5 shadow-md'
        : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
    }`}
  >
    <div className="flex justify-between items-start mb-2">
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <h4 className="font-bold text-gray-900">{service.name}</h4>
          {service.badge && (
            <span className={`px-2 py-0.5 text-xs font-bold rounded-full ${
              service.badge === 'Premium' 
                ? 'bg-yellow-100 text-yellow-700' 
                : 'bg-primary/10 text-primary'
            }`}>
              {service.badge}
            </span>
          )}
        </div>
        {service.description && (
          <p className="text-sm text-gray-600 mt-1 line-clamp-2">{service.description}</p>
        )}
      </div>
      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
        isSelected ? 'bg-primary border-primary' : 'border-gray-300'
      }`}>
        {isSelected && <Check className="w-4 h-4 text-white" />}
      </div>
    </div>
    <div className="flex items-center justify-between mt-3">
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <Clock className="w-4 h-4" />
        <span>{service.duration}</span>
      </div>
      <div className="text-right">
        {service.oldPrice && (
          <span className="text-sm text-gray-400 line-through mr-2">{service.oldPrice} zł</span>
        )}
        <span className="text-lg font-bold text-primary">{service.price} zł</span>
        {service.discount && (
          <span className="ml-2 text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full">
            -{service.discount}%
          </span>
        )}
      </div>
    </div>
  </div>
);

const ProviderDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { user } = useAuth();

  const [provider, setProvider] = useState<Provider | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedServices, setSelectedServices] = useState<ServiceItem[]>([]);
  const [selectedDate, setSelectedDate] = useState<number | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [activeServiceFilter, setActiveServiceFilter] = useState('Wszystkie');
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [bookedSlots, setBookedSlots] = useState<string[]>([]);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isFavoriteLoading, setIsFavoriteLoading] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  
  const [confirmedBooking, setConfirmedBooking] = useState<{
    date: string;
    time: string;
    services: string;
    price: number;
  } | null>(null);
  
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportingReview, setReportingReview] = useState<Review | null>(null);
  const [reportReason, setReportReason] = useState('');
  const [reportSubmitting, setReportSubmitting] = useState(false);

  useEffect(() => {
    const checkFavorite = async () => {
      if (!user?.id || !id) return;
      try {
        const isFav = await favoriteService.isFavorite(String(user.id), id);
        setIsFavorite(isFav);
      } catch (error) {
        console.error('Error checking favorite:', error);
      }
    };
    checkFavorite();
  }, [user?.id, id]);

  useEffect(() => {
    const loadReviews = async () => {
      if (!id) return;
      setReviewsLoading(true);
      try {
        const providerReviews = await reviewService.getByProvider(id);
        setReviews(providerReviews);
      } catch (error) {
        console.error('Error loading reviews:', error);
      } finally {
        setReviewsLoading(false);
      }
    };
    loadReviews();
  }, [id]);

  const toggleFavorite = async () => {
    if (!user?.id) {
      showToast('Zaloguj się, aby dodać do ulubionych', 'info');
      navigate(`/auth?mode=login&redirect=/uslugodawcy/profil/${id}`);
      return;
    }
    if (!provider) return;

    setIsFavoriteLoading(true);
    try {
      const newState = await favoriteService.toggle(String(user.id), {
        id: provider.id,
        name: provider.name,
        image: provider.image,
        profession: provider.profession,
      });
      setIsFavorite(newState);
      showToast(newState ? '❤️ Dodano do ulubionych' : 'Usunięto z ulubionych', 'success');
    } catch (error) {
      console.error('Error toggling favorite:', error);
      showToast('Błąd podczas zapisywania', 'error');
    } finally {
      setIsFavoriteLoading(false);
    }
  };

  const openReportModal = (review: Review) => {
    if (!user) {
      showToast('Zaloguj się, aby zgłosić opinię', 'info');
      return;
    }
    setReportingReview(review);
    setReportReason('');
    setShowReportModal(true);
  };

  const submitReport = async () => {
    if (!reportingReview || !user || !provider) return;
    
    if (reportReason.trim().length < 10) {
      showToast('Opisz powód zgłoszenia (min. 10 znaków)', 'error');
      return;
    }
    
    setReportSubmitting(true);
    try {
      await reviewService.reportReview({
        reviewId: reportingReview.id,
        reporterId: user.id,
        reporterName: user.username || 'Użytkownik',
        reason: reportReason.trim(),
        reviewContent: reportingReview.comment,
        reviewAuthor: reportingReview.clientName,
        providerId: provider.id,
        providerName: provider.name,
      });
      
      setShowReportModal(false);
      showToast('Zgłoszenie wysłane. Dziękujemy! 🙏', 'success');
    } catch (error) {
      console.error('Error reporting review:', error);
      showToast('Błąd podczas wysyłania zgłoszenia', 'error');
    } finally {
      setReportSubmitting(false);
    }
  };

  const monthNames = [
    'Styczeń', 'Luty', 'Marzec', 'Kwiecień', 'Maj', 'Czerwiec',
    'Lipiec', 'Sierpień', 'Wrzesień', 'Październik', 'Listopad', 'Grudzień'
  ];

  const goToPrevMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
    setSelectedDate(null);
  };

  const goToNextMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
    setSelectedDate(null);
  };

  const canGoPrev = () => {
    const now = new Date();
    return currentDate.getFullYear() > now.getFullYear() || 
           (currentDate.getFullYear() === now.getFullYear() && currentDate.getMonth() > now.getMonth());
  };

  const isOwner = Boolean(
    user?.id && 
    provider?.ownerId && 
    String(user.id) === String(provider.ownerId)
  );

  useEffect(() => {
    const loadProvider = async () => {
      if (!id) return;
      
      setIsLoading(true);
      try {
        const data = await providerService.getById(id);
        if (data) {
          setProvider(data);
        } else {
          showToast('Nie znaleziono profilu usługodawcy', 'error');
        }
      } catch (error) {
        console.error('Error loading provider:', error);
        showToast('Błąd ładowania profilu', 'error');
      } finally {
        setIsLoading(false);
      }
    };

    loadProvider();

    const handleUpdate = (e: CustomEvent) => {
      if (e.detail?.id === id) {
        setProvider(e.detail);
      }
    };
    window.addEventListener('providerUpdated', handleUpdate as EventListener);
    return () => window.removeEventListener('providerUpdated', handleUpdate as EventListener);
  }, [id]);

  const serviceCategories = provider?.services
    ? ['Wszystkie', ...new Set(provider.services.map(s => s.category).filter(Boolean))]
    : ['Wszystkie'];

  const filteredServices = provider?.services?.filter(
    s => activeServiceFilter === 'Wszystkie' || s.category === activeServiceFilter
  ) || [];

  const totalPrice = selectedServices.reduce((sum, s) => sum + s.price, 0);
  const totalDuration = selectedServices.reduce((sum, s) => {
    const match = s.duration.match(/(\d+)/);
    return sum + (match ? parseInt(match[1]) : 30);
  }, 0);

  const toggleService = (service: ServiceItem) => {
    setSelectedServices(prev => 
      prev.find(s => s.id === service.id)
        ? prev.filter(s => s.id !== service.id)
        : [...prev, service]
    );
  };

  const generateCalendarDays = () => {
    const today = new Date();
    const days = [];
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const startDay = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1;
    
    const dayKeyMap: { [key: number]: string } = {
      1: 'monday',
      2: 'tuesday',
      3: 'wednesday',
      4: 'thursday',
      5: 'friday',
      6: 'saturday',
      0: 'sunday',
    };
    
    for (let i = 0; i < 42; i++) {
      const dayNum = i - startDay + 1;
      const date = new Date(year, month, dayNum);
      const isCurrentMonth = date.getMonth() === month;
      const isPast = date < new Date(today.getFullYear(), today.getMonth(), today.getDate());
      
      let isClosed = false;
      if (provider) {
        const dayKey = dayKeyMap[date.getDay()] as keyof typeof provider.workingHours;
        isClosed = !provider.workingHours[dayKey]?.enabled;
      }
      
      days.push({
        day: date.getDate(),
        isToday: date.toDateString() === today.toDateString(),
        disabled: !isCurrentMonth || isPast || isClosed,
        isClosed,
        fullDate: date,
        isCurrentMonth,
      });
    }
    return days;
  };

  const calendarDays = generateCalendarDays();

  useEffect(() => {
    const loadBookedSlots = async () => {
      if (!provider?.id || !selectedDate) return;
      
      const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate).padStart(2, '0')}`;
      
      const slots = await bookingService.getBookedSlots(provider.id, dateStr);
      setBookedSlots(slots);
    };
    
    loadBookedSlots();
  }, [provider?.id, selectedDate, currentDate]);

  type DayKey = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';
  const getDayKey = (date: Date): DayKey | null => {
    const dayMap: { [key: number]: DayKey } = {
      1: 'monday',
      2: 'tuesday',
      3: 'wednesday',
      4: 'thursday',
      5: 'friday',
      6: 'saturday',
      0: 'sunday',
    };
    return dayMap[date.getDay()] || null;
  };

  const generateTimeSlots = () => {
    if (!provider || !selectedDate) {
      return [];
    }

    const slots: { time: string; disabled: boolean }[] = [];
    
    const now = new Date();
    const selectedFullDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), selectedDate);
    const dayKey = getDayKey(selectedFullDate);
    
    if (!dayKey) return [];
    
    const dayHours = provider.workingHours[dayKey];
    
    if (!dayHours.enabled) {
      return [];
    }

    const [fromHour, fromMin] = dayHours.from.split(':').map(Number);
    const [toHour, toMin] = dayHours.to.split(':').map(Number);
    
    const closingTimeMinutes = toHour * 60 + toMin;
    
    let currentHour = fromHour;
    let currentMin = fromMin;
    
    while (currentHour < toHour || (currentHour === toHour && currentMin < toMin)) {
      const time = `${String(currentHour).padStart(2, '0')}:${String(currentMin).padStart(2, '0')}`;
      const slotStartMinutes = currentHour * 60 + currentMin;
      
      const isToday = selectedFullDate.toDateString() === now.toDateString();
      const slotInPast = isToday && (currentHour < now.getHours() || (currentHour === now.getHours() && currentMin <= now.getMinutes()));
      
      const serviceEndMinutes = slotStartMinutes + totalDuration;
      const fitsBeforeClosing = serviceEndMinutes <= closingTimeMinutes;
      
      const isDisabled = slotInPast || bookedSlots.includes(time) || (selectedServices.length > 0 && !fitsBeforeClosing);
      
      slots.push({
        time,
        disabled: isDisabled,
      });
      
      currentMin += 30;
      if (currentMin >= 60) {
        currentMin = 0;
        currentHour++;
      }
    }
    
    return slots;
  };

  const timeSlots = generateTimeSlots();

  const confirmBooking = async () => {
    if (!user || !user.id) {
      showToast('Zaloguj się, aby zarezerwować wizytę', 'info');
      navigate(`/auth?mode=login&redirect=/uslugodawcy/profil/${id}`);
      return;
    }

    if (selectedServices.length === 0) {
      showToast('Wybierz przynajmniej jedną usługę', 'error');
      return;
    }

    if (!selectedDate || !selectedTime) {
      showToast('Wybierz datę i godzinę', 'error');
      return;
    }

    if (!provider) return;

    setShowPaymentModal(true);
  };

  const handlePaymentSuccess = async () => {
    if (!user || !provider || !selectedDate || !selectedTime) return;

    setIsSubmitting(true);
    console.log('Payment successful, creating booking for user:', user.id);

    try {
      const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate).padStart(2, '0')}`;
      
      const isAvailable = await bookingService.isTimeSlotAvailable(provider.id, dateStr, selectedTime, totalDuration);
      if (!isAvailable) {
        showToast('Ten termin jest już zajęty. Wybierz inny.', 'error');
        setIsSubmitting(false);
        return;
      }

      const mainService = selectedServices[0];
      
      await bookingService.create({
        clientId: user.id,
        clientName: user.username || 'Klient',
        clientEmail: user.email || '',
        clientPhone: user.phone || '',
        providerId: provider.id,
        providerName: provider.name,
        providerImage: provider.image,
        serviceId: mainService.id,
        serviceName: selectedServices.map(s => s.name).join(', '),
        servicePrice: totalPrice,
        serviceDuration: `${totalDuration} min`,
        date: dateStr,
        time: selectedTime,
      });

      console.log('Booking created successfully');
      
      setConfirmedBooking({
        date: `${selectedDate} ${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`,
        time: selectedTime,
        services: selectedServices.map(s => s.name).join(', '),
        price: totalPrice,
      });
      
      setShowBookingModal(true);
      
      setSelectedServices([]);
      setSelectedDate(null);
      setSelectedTime(null);
      
      showToast('🎉 Rezerwacja opłacona i potwierdzona!', 'success');
    } catch (error: any) {
      console.error('Błąd rezerwacji:', error);
      
      if (error.message === 'SLOT_TAKEN') {
        showToast('Ten termin został właśnie zarezerwowany przez kogoś innego. Wybierz inny termin.', 'error');
        if (provider && selectedDate) {
          const refreshDateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate).padStart(2, '0')}`;
          const slots = await bookingService.getBookedSlots(provider.id, refreshDateStr);
          setBookedSlots(slots);
        }
        setSelectedTime(null);
      } else {
        showToast('Błąd podczas tworzenia rezerwacji', 'error');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Ładowanie profilu...</p>
        </div>
      </div>
    );
  }

  if (!provider) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">😕</div>
          <h1 className="text-2xl font-bold mb-2">Nie znaleziono profilu</h1>
          <p className="text-gray-600 mb-4">Ten usługodawca nie istnieje lub został usunięty</p>
          <button
            onClick={() => navigate('/uslugodawcy')}
            className="px-6 py-2 bg-primary text-white rounded-xl hover:bg-primary/90"
          >
            Wróć do listy
          </button>
        </div>
      </div>
    );
  }

  const dayNames: Record<string, string> = {
    monday: 'Pon', tuesday: 'Wt', wednesday: 'Śr', thursday: 'Czw',
    friday: 'Pt', saturday: 'Sob', sunday: 'Nd'
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-14">
            <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-600 hover:text-primary transition-colors">
              <ArrowLeft className="w-5 h-5" />
              <span className="hidden sm:inline">Wróć</span>
            </button>
            <div className="flex items-center gap-2">
              <button 
                onClick={toggleFavorite} 
                disabled={isFavoriteLoading}
                className={`p-2 rounded-full transition-colors ${isFavorite ? 'text-red-500 bg-red-50' : 'text-gray-400 hover:text-red-500 hover:bg-red-50'}`}
              >
                <Heart className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
              </button>
              <button className="p-2 rounded-full text-gray-400 hover:text-primary hover:bg-primary/10 transition-colors">
                <Share2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
              <div className="relative h-48 sm:h-64">
                <img src={provider.image} alt={provider.name} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute top-4 left-4 flex gap-2">
                  {provider.isPremium && (
                    <span className="px-3 py-1 bg-yellow-400 text-yellow-900 text-xs font-bold rounded-full flex items-center gap-1">
                      <Star className="w-3 h-3 fill-current" /> Premium
                    </span>
                  )}
                  {provider.isVerified && (
                    <span className="px-3 py-1 bg-green-500 text-white text-xs font-bold rounded-full flex items-center gap-1">
                      <Shield className="w-3 h-3" /> Zweryfikowany
                    </span>
                  )}
                </div>
                <div className="absolute bottom-4 left-4 right-4 text-white">
                  <h1 className="text-2xl sm:text-3xl font-bold">{provider.name}</h1>
                  <p className="text-white/90">{provider.profession}</p>
                </div>
              </div>
              <div className="p-4 flex flex-wrap gap-3">
                <StatBadge icon={Star} value={provider.rating > 0 ? provider.rating.toFixed(1) : 'Nowy'} label={provider.reviewsCount > 0 ? `(${provider.reviewsCount} opinii)` : ''} color="bg-yellow-50 text-yellow-700" />
                {provider.completedServices > 0 && <StatBadge icon={Award} value={provider.completedServices} label="usług" color="bg-blue-50 text-blue-700" />}
                {provider.hasTravel && <StatBadge icon={Car} value={`${provider.travelRadius} km`} label="dojazd" color="bg-green-50 text-green-700" />}
                {provider.acceptsCard && <StatBadge icon={CreditCard} value="Karta" label="" color="bg-purple-50 text-purple-700" />}
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h2 className="text-xl font-bold mb-4">O mnie</h2>
              {provider.description ? <p className="text-gray-600 whitespace-pre-line">{provider.description}</p> : <p className="text-gray-400 italic">Brak opisu</p>}
              {provider.experience && <p className="mt-4 text-sm text-gray-500 flex items-center gap-2"><Award className="w-4 h-4 text-primary" />{provider.experience}</p>}
              {provider.features.length > 0 && (
                <div className="mt-6">
                  <h3 className="font-medium mb-3">Udogodnienia</h3>
                  <div className="flex flex-wrap gap-2">{provider.features.map((f, i) => <span key={i} className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full">{f}</span>)}</div>
                </div>
              )}
              {provider.certifications.length > 0 && (
                <div className="mt-6">
                  <h3 className="font-medium mb-3">Certyfikaty</h3>
                  <div className="flex flex-wrap gap-2">{provider.certifications.map((c, i) => <span key={i} className="px-3 py-1 bg-green-50 text-green-700 text-sm rounded-full flex items-center gap-1"><Check className="w-3 h-3" /> {c}</span>)}</div>
                </div>
              )}
            </div>

            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h2 className="text-xl font-bold mb-4">Usługi i cennik</h2>
              {serviceCategories.length > 1 && (
                <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
                  {serviceCategories.map(cat => (
                    <button key={cat} onClick={() => setActiveServiceFilter(cat)} className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors ${activeServiceFilter === cat ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>{cat}</button>
                  ))}
                </div>
              )}
              <div className="space-y-3">
                {filteredServices.length > 0 ? filteredServices.map(service => (
                  <ServiceCard key={service.id} service={service} isSelected={selectedServices.some(s => s.id === service.id)} onToggle={() => toggleService(service)} />
                )) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500 mb-2">Brak usług</p>
                    <p className="text-sm text-gray-400">Ten usługodawca nie dodał jeszcze usług</p>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h2 className="text-xl font-bold mb-4">Lokalizacja</h2>
              <div className="flex items-start gap-3 mb-4">
                <MapPin className="w-5 h-5 text-primary mt-0.5" />
                <div>
                  <p className="font-medium">{provider.locationString}</p>
                  {provider.location.address && <p className="text-sm text-gray-500">{provider.location.address}</p>}
                  {provider.hasTravel && <p className="text-sm text-green-600 mt-1">✓ Dojazd do klienta (do {provider.travelRadius} km)</p>}
                </div>
              </div>
              {provider.location?.lat && provider.location?.lng ? (
                <div className="h-48 rounded-xl overflow-hidden">
                  <iframe
                    title="Lokalizacja usługodawcy"
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    loading="lazy"
                    src={`https://www.openstreetmap.org/export/embed.html?bbox=${provider.location.lng - 0.01}%2C${provider.location.lat - 0.01}%2C${provider.location.lng + 0.01}%2C${provider.location.lat + 0.01}&layer=mapnik&marker=${provider.location.lat}%2C${provider.location.lng}`}
                  />
                  <a 
                    href={`https://www.openstreetmap.org/?mlat=${provider.location.lat}&mlon=${provider.location.lng}#map=16/${provider.location.lat}/${provider.location.lng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block text-center text-sm text-primary hover:underline mt-2"
                  >
                    Otwórz większą mapę
                  </a>
                </div>
              ) : (
                <div className="h-48 bg-gray-100 rounded-xl flex items-center justify-center">
                  <p className="text-gray-400">Brak danych lokalizacji</p>
                </div>
              )}
            </div>

            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h2 className="text-xl font-bold mb-4">Godziny pracy</h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {Object.entries(provider.workingHours).map(([day, hours]) => (
                  <div key={day} className={`p-3 rounded-xl ${hours.enabled ? 'bg-green-50' : 'bg-gray-100'}`}>
                    <p className="text-sm font-medium text-gray-900">{dayNames[day]}</p>
                    <p className={`text-sm ${hours.enabled ? 'text-green-700' : 'text-gray-500'}`}>{hours.enabled ? `${hours.from} - ${hours.to}` : 'Zamknięte'}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">Opinie klientów</h2>
                {provider.reviewsCount > 0 && (
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
                      <span className="font-bold">{provider.rating.toFixed(1)}</span>
                    </div>
                    <span className="text-gray-500 text-sm">({provider.reviewsCount} opinii)</span>
                  </div>
                )}
              </div>

              {reviewsLoading ? (
                <div className="text-center py-8">
                  <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" />
                </div>
              ) : reviews.length === 0 ? (
                <div className="text-center py-8">
                  <Star className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                  <p className="text-gray-500">Brak opinii</p>
                  <p className="text-sm text-gray-400">Bądź pierwszy i wystaw opinię po skorzystaniu z usługi!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {reviews.slice(0, 5).map((review) => (
                    <div key={review.id} className="border-b border-gray-100 pb-4 last:border-0">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-r from-primary to-secondary rounded-full flex items-center justify-center text-white font-bold">
                            {review.clientName.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{review.clientName}</p>
                            <p className="text-xs text-gray-500">{review.serviceName}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center gap-0.5">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star 
                                key={star}
                                className={`w-4 h-4 ${star <= review.rating ? 'text-amber-400 fill-amber-400' : 'text-gray-200'}`}
                              />
                            ))}
                          </div>
                          <p className="text-xs text-gray-400 mt-1">
                            {new Date(review.createdAt).toLocaleDateString('pl-PL')}
                          </p>
                        </div>
                      </div>
                      <p className="text-gray-600 text-sm">{review.comment}</p>
                      
                      {review.providerResponse && (
                        <div className="mt-3 p-3 bg-emerald-50 border-l-4 border-emerald-500 rounded-r-lg">
                          <p className="text-xs font-semibold text-emerald-700 mb-1">💬 Odpowiedź usługodawcy:</p>
                          <p className="text-sm text-gray-700">{review.providerResponse}</p>
                        </div>
                      )}
                      
                      <div className="flex items-center justify-end mt-2">
                        <button
                          onClick={() => openReportModal(review)}
                          className="text-xs text-gray-400 hover:text-red-500 flex items-center gap-1 transition-colors"
                          title="Zgłoś opinię"
                        >
                          <Flag className="w-3 h-3" />
                          Zgłoś
                        </button>
                      </div>
                    </div>
                  ))}
                  {reviews.length > 5 && (
                    <p className="text-center text-sm text-gray-500">
                      ... i {reviews.length - 5} więcej opinii
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm p-6 sticky top-20">
              <h3 className="text-lg font-bold mb-4">Zarezerwuj wizytę</h3>
              {selectedServices.length > 0 ? (
                <div className="mb-4 p-4 bg-primary/5 rounded-xl">
                  <p className="text-sm font-medium text-gray-600 mb-2">Wybrane usługi:</p>
                  {selectedServices.map(s => <div key={s.id} className="flex justify-between text-sm py-1"><span>{s.name}</span><span className="font-medium">{s.price} zł</span></div>)}
                  <div className="flex justify-between mt-2 pt-2 border-t border-primary/20"><span className="font-bold">Razem:</span><span className="font-bold text-primary">{totalPrice} zł</span></div>
                  <p className="text-xs text-gray-500 mt-1">Czas: ~{totalDuration} min</p>
                </div>
              ) : (
                <p className="text-sm text-gray-500 mb-4 p-4 bg-gray-50 rounded-xl">Wybierz usługi z listy</p>
              )}
              <div className="mb-4">
                <div className="flex justify-between items-center mb-3">
                  <label className="text-sm font-medium text-gray-700">Data</label>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={goToPrevMonth}
                      disabled={!canGoPrev()}
                      className={`p-1 rounded-full transition-colors ${canGoPrev() ? 'hover:bg-gray-100 text-gray-600' : 'text-gray-300 cursor-not-allowed'}`}
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <span className="text-sm font-medium text-gray-700 min-w-[120px] text-center">
                      {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                    </span>
                    <button 
                      onClick={goToNextMonth}
                      className="p-1 rounded-full hover:bg-gray-100 text-gray-600 transition-colors"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-7 gap-1 text-center">
                  {['Pn', 'Wt', 'Śr', 'Cz', 'Pt', 'So', 'Nd'].map(d => <div key={d} className="text-xs font-medium text-gray-400 py-1">{d}</div>)}
                  {calendarDays.slice(0, 42).map((d, i) => (
                    <button 
                      key={i} 
                      disabled={d.disabled} 
                      onClick={() => !d.disabled && setSelectedDate(d.day)} 
                      className={`aspect-square text-sm rounded-lg transition-colors ${
                        !d.isCurrentMonth 
                          ? 'text-gray-300' 
                          : d.disabled 
                            ? 'opacity-30 cursor-not-allowed' 
                            : selectedDate === d.day 
                              ? 'bg-primary text-white' 
                              : d.isToday 
                                ? 'ring-2 ring-primary text-primary' 
                                : 'hover:bg-gray-100'
                      }`}
                    >
                      {d.day}
                    </button>
                  ))}
                </div>
              </div>
              <div className="mb-4">
                <label className="text-sm font-medium text-gray-700 mb-2 block">Godzina</label>
                {!selectedDate ? (
                  <p className="text-sm text-gray-500 p-4 bg-gray-50 rounded-xl text-center">
                    Wybierz datę, aby zobaczyć dostępne godziny
                  </p>
                ) : timeSlots.length === 0 ? (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-center">
                    <p className="text-red-600 font-medium">Dzień zamknięty</p>
                    <p className="text-sm text-red-500 mt-1">Wybierz inny dzień</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-3 gap-2">
                    {timeSlots.map(slot => (
                      <button 
                        key={slot.time} 
                        disabled={slot.disabled} 
                        onClick={() => !slot.disabled && setSelectedTime(slot.time)} 
                        className={`py-2 text-sm rounded-lg transition-colors ${
                          slot.disabled 
                            ? 'opacity-30 cursor-not-allowed bg-gray-100' 
                            : selectedTime === slot.time 
                              ? 'bg-primary text-white' 
                              : 'bg-gray-100 hover:bg-gray-200'
                        }`}
                      >
                        {slot.time}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <button 
                onClick={confirmBooking} 
                disabled={selectedServices.length === 0 || isSubmitting || isOwner} 
                className={`w-full py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${
                  isOwner
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : selectedServices.length > 0 && !isSubmitting 
                      ? 'bg-gradient-to-r from-primary to-secondary text-white hover:shadow-lg hover:-translate-y-0.5' 
                      : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                }`}
              >
                {isOwner ? (
                  '🔒 To Twój profil'
                ) : isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Rezerwuję...
                  </>
                ) : selectedServices.length > 0 ? (
                  `Zarezerwuj za ${totalPrice} zł`
                ) : (
                  'Wybierz usługę'
                )}
              </button>
              <button 
                onClick={() => {
                  if (isOwner) return;
                  if (!user) {
                    showToast('Zaloguj się, aby napisać wiadomość', 'info');
                    navigate(`/auth?mode=login&redirect=/uslugodawcy/profil/${id}`);
                    return;
                  }
                  navigate(`/wiadomosci?providerId=${id}`);
                }} 
                disabled={isOwner}
                className={`w-full mt-3 py-3 border-2 rounded-xl font-medium transition-colors flex items-center justify-center gap-2 ${
                  isOwner
                    ? 'border-gray-200 text-gray-400 cursor-not-allowed'
                    : 'border-gray-200 text-gray-700 hover:border-primary hover:text-primary'
                }`}
              >
                <MessageCircle className="w-5 h-5" />
                {isOwner ? '🔒 To Twój profil' : 'Napisz wiadomość'}
              </button>
              
              {isOwner && (
                <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-xl text-center">
                  <p className="text-sm text-amber-700">👁️ Podgląd profilu - rezerwacje wyłączone</p>
                  <button 
                    onClick={() => navigate('/biznes/uslugi')}
                    className="mt-2 text-sm text-amber-600 underline hover:text-amber-800"
                  >
                    Przejdź do panelu biznesowego
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {showBookingModal && confirmedBooking && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
            <div className="text-center">
              <div className="text-5xl mb-4">📅</div>
              <h3 className="text-xl font-bold mb-2">Rezerwacja wysłana!</h3>
              <p className="text-gray-600 mb-4">
                Twoja prośba o rezerwację u <strong>{provider.name}</strong> została wysłana. 
                Czekaj na potwierdzenie od usługodawcy.
              </p>
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-left mb-4">
                <div className="flex items-center gap-2 text-yellow-700 font-medium mb-2">
                  <Clock className="w-4 h-4" />
                  Oczekuje na potwierdzenie
                </div>
                <p className="text-sm text-yellow-600">
                  Otrzymasz powiadomienie gdy usługodawca potwierdzi Twoją wizytę.
                </p>
              </div>
              <div className="bg-gray-50 rounded-xl p-4 text-left mb-4">
                <p className="text-sm mb-1"><strong>Data:</strong> {confirmedBooking.date}</p>
                <p className="text-sm mb-1"><strong>Godzina:</strong> {confirmedBooking.time}</p>
                <p className="text-sm mb-1"><strong>Usługi:</strong> {confirmedBooking.services}</p>
                <p className="text-sm"><strong>Łącznie:</strong> {confirmedBooking.price} zł</p>
              </div>
              <button 
                onClick={() => { 
                  setShowBookingModal(false);
                  setConfirmedBooking(null);
                  showToast('Rezerwacja wysłana! Czekaj na potwierdzenie.', 'success'); 
                }} 
                className="w-full py-3 bg-primary text-white rounded-xl font-medium hover:bg-primary/90"
              >
                OK, rozumiem
              </button>
            </div>
          </div>
        </div>
      )}

      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        onSuccess={handlePaymentSuccess}
        amount={totalPrice}
        serviceName={selectedServices.map(s => s.name).join(', ') || 'Usługa'}
        providerName={provider?.name || ''}
        bookingDate={selectedDate ? `${selectedDate} ${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}` : undefined}
        bookingTime={selectedTime || undefined}
      />

      {showReportModal && reportingReview && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <Flag className="w-5 h-5 text-red-500" />
                  Zgłoś opinię
                </h3>
                <button
                  onClick={() => setShowReportModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-4 bg-gray-50 rounded-xl mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 bg-gradient-to-r from-primary to-secondary rounded-full flex items-center justify-center text-white text-sm font-bold">
                    {reportingReview.clientName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-medium text-sm">{reportingReview.clientName}</p>
                    <div className="flex items-center gap-0.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star 
                          key={star}
                          className={`w-3 h-3 ${star <= reportingReview.rating ? 'text-amber-400 fill-amber-400' : 'text-gray-200'}`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
                <p className="text-sm text-gray-600 italic">"{reportingReview.comment}"</p>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Dlaczego zgłaszasz tę opinię?
                </label>
                <div className="space-y-2 mb-4">
                  {[
                    'Fałszywa opinia (osoba nie korzystała z usługi)',
                    'Obraźliwa lub wulgarna treść',
                    'Spam lub reklama',
                    'Narusza prywatność',
                    'Inny powód',
                  ].map((reason) => (
                    <button
                      key={reason}
                      onClick={() => setReportReason(reason)}
                      className={`w-full text-left px-4 py-2 rounded-lg border-2 transition-colors ${
                        reportReason === reason 
                          ? 'border-red-500 bg-red-50' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <span className="text-sm">{reason}</span>
                    </button>
                  ))}
                </div>
                <textarea
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                  placeholder="Opisz szczegóły zgłoszenia..."
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-red-500 focus:ring-0 resize-none"
                  rows={3}
                />
                <p className="text-xs text-gray-400 mt-1">
                  Minimum 10 znaków ({reportReason.length}/10)
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowReportModal(false)}
                  className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl font-medium hover:bg-gray-50"
                >
                  Anuluj
                </button>
                <button
                  onClick={submitReport}
                  disabled={reportSubmitting || reportReason.length < 10}
                  className="flex-1 px-4 py-3 bg-red-500 text-white rounded-xl font-semibold hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {reportSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Wysyłanie...
                    </>
                  ) : (
                    <>
                      <Flag className="w-5 h-5" />
                      Wyślij zgłoszenie
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

export default ProviderDetailPage;
