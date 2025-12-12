/**
 * ProviderDetailPage - Strona profilu usługodawcy
 * Pobiera dane z Firebase przez providerService
 */

import { useState, useEffect, useRef } from 'react';
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
  X,
  Send,
  Award,
  Shield,
  Share2,
} from 'lucide-react';
import { useToast } from '../App';
import providerService, { Provider, ServiceItem } from '../services/providerService';

// ============================================
// KOMPONENTY POMOCNICZE
// ============================================

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

// ============================================
// GŁÓWNY KOMPONENT
// ============================================

const ProviderDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();

  // State
  const [provider, setProvider] = useState<Provider | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedServices, setSelectedServices] = useState<ServiceItem[]>([]);
  const [selectedDate, setSelectedDate] = useState<number | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [activeServiceFilter, setActiveServiceFilter] = useState('Wszystkie');
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [chatMessages, setChatMessages] = useState<{ text: string; fromMe: boolean }[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [currentMonth] = useState({ month: 'Grudzień', year: 2025 });

  const chatInputRef = useRef<HTMLInputElement>(null);

  // Załaduj dane usługodawcy z Firebase
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

    // Nasłuchuj na aktualizacje
    const handleUpdate = (e: CustomEvent) => {
      if (e.detail?.id === id) {
        setProvider(e.detail);
      }
    };
    window.addEventListener('providerUpdated', handleUpdate as EventListener);
    return () => window.removeEventListener('providerUpdated', handleUpdate as EventListener);
  }, [id]);

  // Kategorie usług
  const serviceCategories = provider?.services
    ? ['Wszystkie', ...new Set(provider.services.map(s => s.category).filter(Boolean))]
    : ['Wszystkie'];

  // Filtrowane usługi
  const filteredServices = provider?.services?.filter(
    s => activeServiceFilter === 'Wszystkie' || s.category === activeServiceFilter
  ) || [];

  // Suma wybranych usług
  const totalPrice = selectedServices.reduce((sum, s) => sum + s.price, 0);
  const totalDuration = selectedServices.reduce((sum, s) => {
    const match = s.duration.match(/(\d+)/);
    return sum + (match ? parseInt(match[1]) : 30);
  }, 0);

  // Toggle usługi
  const toggleService = (service: ServiceItem) => {
    setSelectedServices(prev => 
      prev.find(s => s.id === service.id)
        ? prev.filter(s => s.id !== service.id)
        : [...prev, service]
    );
  };

  // Dni kalendarza
  const generateCalendarDays = () => {
    const today = new Date();
    const days = [];
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
    const startDay = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1;
    
    for (let i = 0; i < 35; i++) {
      const date = new Date(today.getFullYear(), today.getMonth(), i - startDay + 1);
      const isCurrentMonth = date.getMonth() === today.getMonth();
      days.push({
        day: date.getDate(),
        isToday: date.toDateString() === today.toDateString(),
        disabled: !isCurrentMonth || date < today || date.getDay() === 0,
        fullDate: date,
      });
    }
    return days;
  };

  const calendarDays = generateCalendarDays();

  // Dostępne godziny
  const timeSlots = [
    { time: '09:00', disabled: false },
    { time: '10:00', disabled: false },
    { time: '11:00', disabled: false },
    { time: '12:00', disabled: true },
    { time: '13:00', disabled: false },
    { time: '14:00', disabled: false },
    { time: '15:00', disabled: false },
    { time: '16:00', disabled: false },
    { time: '17:00', disabled: true },
    { time: '18:00', disabled: false },
  ];

  // Potwierdź rezerwację
  const confirmBooking = () => {
    const userData = sessionStorage.getItem('user');
    if (!userData) {
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

    setShowBookingModal(true);
  };

  // Wyślij wiadomość
  const sendMessage = () => {
    if (!chatInput.trim()) return;
    setChatMessages(prev => [...prev, { text: chatInput, fromMe: true }]);
    setChatInput('');
    
    setTimeout(() => {
      setChatMessages(prev => [...prev, { 
        text: 'Dziękuję za wiadomość! Odpowiem najszybciej jak to możliwe 😊', 
        fromMe: false 
      }]);
    }, 1500);
  };

  // Loading state
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

  // Not found state
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
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-14">
            <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-600 hover:text-primary transition-colors">
              <ArrowLeft className="w-5 h-5" />
              <span className="hidden sm:inline">Wróć</span>
            </button>
            <div className="flex items-center gap-2">
              <button onClick={() => setIsFavorite(!isFavorite)} className={`p-2 rounded-full transition-colors ${isFavorite ? 'text-red-500 bg-red-50' : 'text-gray-400 hover:text-red-500 hover:bg-red-50'}`}>
                <Heart className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
              </button>
              <button className="p-2 rounded-full text-gray-400 hover:text-primary hover:bg-primary/10 transition-colors">
                <Share2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Hero */}
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

            {/* About */}
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

            {/* Services */}
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

            {/* Location */}
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
              <div className="h-48 bg-gray-100 rounded-xl flex items-center justify-center"><p className="text-gray-400">Mapa lokalizacji</p></div>
            </div>

            {/* Working Hours */}
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
          </div>

          {/* Right Column - Booking */}
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
                <div className="flex justify-between items-center mb-2"><label className="text-sm font-medium text-gray-700">Data</label><span className="text-sm text-gray-500">{currentMonth.month} {currentMonth.year}</span></div>
                <div className="grid grid-cols-7 gap-1 text-center">
                  {['Pn', 'Wt', 'Śr', 'Cz', 'Pt', 'So', 'Nd'].map(d => <div key={d} className="text-xs font-medium text-gray-400 py-1">{d}</div>)}
                  {calendarDays.slice(0, 35).map((d, i) => (
                    <button key={i} disabled={d.disabled} onClick={() => !d.disabled && setSelectedDate(d.day)} className={`aspect-square text-sm rounded-lg transition-colors ${d.disabled ? 'opacity-30 cursor-not-allowed' : selectedDate === d.day ? 'bg-primary text-white' : d.isToday ? 'ring-2 ring-primary text-primary' : 'hover:bg-gray-100'}`}>{d.day}</button>
                  ))}
                </div>
              </div>
              <div className="mb-4">
                <label className="text-sm font-medium text-gray-700 mb-2 block">Godzina</label>
                <div className="grid grid-cols-3 gap-2">
                  {timeSlots.map(slot => <button key={slot.time} disabled={slot.disabled} onClick={() => !slot.disabled && setSelectedTime(slot.time)} className={`py-2 text-sm rounded-lg transition-colors ${slot.disabled ? 'opacity-30 cursor-not-allowed bg-gray-100' : selectedTime === slot.time ? 'bg-primary text-white' : 'bg-gray-100 hover:bg-gray-200'}`}>{slot.time}</button>)}
                </div>
              </div>
              <button onClick={confirmBooking} disabled={selectedServices.length === 0} className={`w-full py-3 rounded-xl font-bold transition-all ${selectedServices.length > 0 ? 'bg-gradient-to-r from-primary to-secondary text-white hover:shadow-lg hover:-translate-y-0.5' : 'bg-gray-200 text-gray-500 cursor-not-allowed'}`}>{selectedServices.length > 0 ? `Zarezerwuj za ${totalPrice} zł` : 'Wybierz usługę'}</button>
              <button onClick={() => setShowChat(true)} className="w-full mt-3 py-3 border-2 border-gray-200 rounded-xl font-medium text-gray-700 hover:border-primary hover:text-primary transition-colors flex items-center justify-center gap-2"><MessageCircle className="w-5 h-5" />Napisz wiadomość</button>
            </div>
          </div>
        </div>
      </main>

      {/* Booking Modal */}
      {showBookingModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
            <div className="text-center">
              <div className="text-5xl mb-4">🎉</div>
              <h3 className="text-xl font-bold mb-2">Rezerwacja potwierdzona!</h3>
              <p className="text-gray-600 mb-4">Twoja rezerwacja u <strong>{provider.name}</strong> została przyjęta.</p>
              <div className="bg-gray-50 rounded-xl p-4 text-left mb-4">
                <p className="text-sm mb-1"><strong>Data:</strong> {selectedDate} {currentMonth.month}</p>
                <p className="text-sm mb-1"><strong>Godzina:</strong> {selectedTime}</p>
                <p className="text-sm mb-1"><strong>Usługi:</strong> {selectedServices.map(s => s.name).join(', ')}</p>
                <p className="text-sm"><strong>Łącznie:</strong> {totalPrice} zł</p>
              </div>
              <button onClick={() => { setShowBookingModal(false); setSelectedServices([]); setSelectedDate(null); setSelectedTime(null); showToast('Rezerwacja potwierdzona!', 'success'); }} className="w-full py-3 bg-primary text-white rounded-xl font-medium hover:bg-primary/90">OK</button>
            </div>
          </div>
        </div>
      )}

      {/* Chat */}
      {showChat && (
        <div className="fixed bottom-4 right-4 w-80 h-96 bg-white rounded-2xl shadow-xl flex flex-col overflow-hidden z-50">
          <div className="p-3 bg-gradient-to-r from-primary to-secondary text-white flex items-center justify-between"><span className="font-medium">Czat z {provider.name}</span><button onClick={() => setShowChat(false)}><X className="w-5 h-5" /></button></div>
          <div className="flex-1 p-3 bg-gray-50 overflow-y-auto space-y-2">
            {chatMessages.length === 0 ? <p className="text-center text-gray-400 text-sm mt-4">Rozpocznij rozmowę...</p> : chatMessages.map((msg, i) => <div key={i} className={`max-w-[80%] p-3 rounded-2xl text-sm ${msg.fromMe ? 'bg-primary text-white ml-auto rounded-br-none' : 'bg-white shadow mr-auto rounded-bl-none'}`}>{msg.text}</div>)}
          </div>
          <div className="p-3 border-t flex gap-2">
            <input ref={chatInputRef} type="text" value={chatInput} onChange={(e) => setChatInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && sendMessage()} placeholder="Napisz wiadomość..." className="flex-1 px-3 py-2 bg-gray-100 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary" />
            <button onClick={sendMessage} className="p-2 bg-primary text-white rounded-xl hover:bg-primary/90"><Send className="w-5 h-5" /></button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProviderDetailPage;
