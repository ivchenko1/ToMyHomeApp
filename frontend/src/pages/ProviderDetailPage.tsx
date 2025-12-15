import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
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
  ChevronLeft,
  ChevronRight,
  Award,
  Camera,
  FileText,
  Scissors,
} from 'lucide-react';
import { useToast } from '../App';
import { LocalProvider, ServiceData } from '../types';

interface ServiceItem {
  id: string;
  name: string;
  description: string;
  duration: string;
  price: number;
  oldPrice?: number;
  discount?: number;
  badge?: string;
  category: string;
}

interface Review {
  id: string;
  author: string;
  initials: string;
  date: string;
  rating: number;
  text: string;
  service: string;
}

interface ProviderData {
  id: number;
  name: string;
  profession: string;
  experience: string;
  rating: number;
  reviewsCount: number;
  completedServices: number;
  image: string;
  verified: boolean;
  isPremium: boolean;
  location: string;
  hasTravel: boolean;
  acceptsCard: boolean;
  punctuality: number;
  responseTime: string;
  regularClients: number;
  description: string[];
  certifications: string[];
  workingHours: {
    weekdays: string;
    saturday: string;
  };
  travelArea: string;
  travelCost: string;
  services: ServiceItem[];
  portfolio: { id: string; image: string; title: string }[];
  reviews: Review[];
}

const ProviderDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();

  // State
  const [selectedServices, setSelectedServices] = useState<ServiceItem[]>([]);
  const [selectedDate, setSelectedDate] = useState<number | null>(11);
  const [selectedTime, setSelectedTime] = useState<string | null>('14:00');
  const [activeFilter, setActiveFilter] = useState('Wszystkie');
  const [showModal, setShowModal] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [chatMessages, setChatMessages] = useState<{ text: string; fromMe: boolean }[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [currentMonth, setCurrentMonth] = useState({ month: 'Listopad', year: 2025 });
  const [provider, setProvider] = useState<ProviderData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const chatInputRef = useRef<HTMLInputElement>(null);

  // Domyślne dane demo
  const defaultProvider: ProviderData = {
    id: 1,
    name: 'Anna Kowalska',
    profession: 'Mistrzyni fryzjerstwa',
    experience: '15 lat doświadczenia',
    rating: 5.0,
    reviewsCount: 127,
    completedServices: 324,
    image: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400&h=400&fit=crop',
    verified: true,
    isPremium: true,
    location: 'Warszawa, Mokotów',
    hasTravel: true,
    acceptsCard: true,
    punctuality: 98,
    responseTime: '24h',
    regularClients: 127,
    description: [
      'Cześć! Jestem Anna, profesjonalna fryzjerka z 15-letnim doświadczeniem w branży beauty. Moją pasją jest tworzenie fryzur, które podkreślają naturalne piękno i osobowość każdej klientki.',
      'Specjalizuję się w nowoczesnych technikach koloryzacji, takich jak baleyage, ombre czy sombre. Regularnie uczestniczę w szkoleniach i warsztatach, aby być na bieżąco z najnowszymi trendami. Używam tylko wysokiej jakości produktów marek L\'Oréal, Wella i Olaplex.',
      'Oferuję usługi zarówno w swoim studio, jak i z dojazdem do klienta. Dbam o komfort i bezpieczeństwo - wszystkie narzędzia są sterylizowane, a produkty testowane dermatologicznie.',
    ],
    certifications: [
      'Dyplom Mistrzowski',
      'Certyfikat L\'Oréal Expert',
      'Olaplex Certified',
      'Wella Professional',
    ],
    workingHours: {
      weekdays: 'Pn-Pt: 9:00-19:00',
      saturday: 'Sob: 10:00-16:00',
    },
    travelArea: 'Warszawa i okolice (do 15km)',
    travelCost: 'Bezpłatny w Warszawie',
    services: [
      {
        id: '1',
        name: 'Strzyżenie damskie',
        description: 'Profesjonalne strzyżenie z myciem włosów, konsultacją i modelowaniem. Dopasowanie fryzury do kształtu twarzy.',
        duration: '60 min',
        price: 80,
        badge: 'Popularne',
        category: 'Strzyżenie',
      },
      {
        id: '2',
        name: 'Koloryzacja jednolita',
        description: 'Farbowanie całych włosów jednym kolorem. Profesjonalne farby L\'Oréal lub Wella.',
        duration: '120 min',
        price: 150,
        oldPrice: 200,
        discount: 25,
        category: 'Koloryzacja',
      },
      {
        id: '3',
        name: 'Baleyage / Ombre',
        description: 'Nowoczesne techniki rozjaśniania włosów. Naturalny efekt słonecznych refleksów.',
        duration: '180 min',
        price: 250,
        badge: 'Premium',
        category: 'Koloryzacja',
      },
      {
        id: '4',
        name: 'Keratynowe prostowanie',
        description: 'Zabieg wygładzający i prostujący włosy. Efekt utrzymuje się do 6 miesięcy.',
        duration: '240 min',
        price: 350,
        category: 'Pielęgnacja',
      },
      {
        id: '5',
        name: 'Strzyżenie męskie',
        description: 'Klasyczne strzyżenie męskie z myciem i stylizacją.',
        duration: '45 min',
        price: 60,
        category: 'Strzyżenie',
      },
      {
        id: '6',
        name: 'Modelowanie i stylizacja',
        description: 'Profesjonalne modelowanie na szczotkę, lokowanie lub prostowanie.',
        duration: '45 min',
        price: 50,
        category: 'Strzyżenie',
      },
    ],
    portfolio: [],
    reviews: [],
  };

  // Ładuj dane providera z localStorage lub użyj demo
  useEffect(() => {
    setIsLoading(true);
    
    // Sprawdź localStorage
    const localProviders: LocalProvider[] = JSON.parse(localStorage.getItem('localProviders') || '[]');
    const foundProvider = localProviders.find((p: LocalProvider) => p.id === Number(id));

    if (foundProvider) {
      // Konwertuj dane z localStorage na format ProviderData
      const services: ServiceItem[] = foundProvider.servicesData?.map((s: ServiceData, index: number): ServiceItem => ({
        id: s.id || String(index),
        name: s.name,
        description: s.description || '',
        duration: s.duration || '30 min',
        price: s.price,
        category: 'Usługi',
      })) || [];

      setProvider({
        id: foundProvider.id,
        name: foundProvider.name,
        profession: foundProvider.profession || 'Specjalista',
        experience: foundProvider.experience || '',
        rating: foundProvider.rating || 0,
        reviewsCount: foundProvider.reviewsCount || 0,
        completedServices: 0,
        image: foundProvider.image || 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400&h=400&fit=crop',
        verified: true,
        isPremium: foundProvider.isPremium || false,
        location: foundProvider.location || '',
        hasTravel: true,
        acceptsCard: true,
        punctuality: 95,
        responseTime: '24h',
        regularClients: 0,
        description: foundProvider.description ? [foundProvider.description] : [''],
        certifications: [],
        workingHours: {
          weekdays: 'Pn-Pt: 9:00-17:00',
          saturday: 'Sob: 10:00-14:00',
        },
        travelArea: `Do ${foundProvider.travelRadius || 10} km`,
        travelCost: 'Do ustalenia',
        services: services.length > 0 ? services : defaultProvider.services,
        portfolio: [],
        reviews: [],
      });
    } else {
      // Użyj domyślnych danych demo
      setProvider(defaultProvider);
    }
    
    setIsLoading(false);
  }, [id]);

  // Jeśli ładowanie lub brak providera
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!provider) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Nie znaleziono profilu</h1>
          <button onClick={() => navigate(-1)} className="text-primary hover:underline">
            Wróć
          </button>
        </div>
      </div>
    );
  }

  const filterCategories = ['Wszystkie', 'Strzyżenie', 'Koloryzacja', 'Pielęgnacja', 'Usługi'];

  const timeSlots = [
    { time: '9:00', disabled: true },
    { time: '10:00', disabled: false },
    { time: '11:00', disabled: false },
    { time: '12:00', disabled: true },
    { time: '14:00', disabled: false },
    { time: '15:00', disabled: false },
    { time: '16:00', disabled: false },
    { time: '17:00', disabled: false },
    { time: '18:00', disabled: true },
  ];

  const calendarDays = [
    { day: 27, disabled: true },
    { day: 28, disabled: true },
    { day: 29, disabled: true },
    { day: 30, disabled: true },
    { day: 31, disabled: true },
    { day: 1, disabled: false },
    { day: 2, disabled: false },
    { day: 3, disabled: false },
    { day: 4, disabled: false, isToday: true },
    { day: 5, disabled: false },
    { day: 6, disabled: false },
    { day: 7, disabled: false },
    { day: 8, disabled: false },
    { day: 9, disabled: false },
    { day: 10, disabled: false },
    { day: 11, disabled: false },
    { day: 12, disabled: false },
    { day: 13, disabled: false },
    { day: 14, disabled: false },
    { day: 15, disabled: false },
    { day: 16, disabled: false },
  ];

  // Filtruj usługi
  const filteredServices = activeFilter === 'Wszystkie'
    ? provider.services
    : provider.services.filter((s) => s.category === activeFilter);

  // Dodaj/usuń usługę
  const toggleService = (service: ServiceItem) => {
    const exists = selectedServices.find((s) => s.id === service.id);
    if (exists) {
      setSelectedServices(selectedServices.filter((s) => s.id !== service.id));
    } else {
      setSelectedServices([...selectedServices, service]);
      showToast(`Dodano: ${service.name}`, 'success');
    }
  };

  // Suma
  const totalPrice = selectedServices.reduce((sum, s) => sum + s.price, 0);

  // Wyślij wiadomość
  const sendMessage = () => {
    if (!chatInput.trim()) return;
    setChatMessages([...chatMessages, { text: chatInput, fromMe: true }]);
    setChatInput('');
    // Symulacja odpowiedzi
    setTimeout(() => {
      setChatMessages((prev) => [
        ...prev,
        { text: 'Dziękuję za wiadomość! Odezwę się wkrótce.', fromMe: false },
      ]);
    }, 1000);
  };

  // Otwórz chat
  const openChat = () => {
    if (window.innerWidth <= 768) {
      // Mobile - przekieruj na stronę czatu
      navigate(`/chat?provider=${provider.id}`);
    } else {
      setShowChat(true);
    }
  };

  // Potwierdź rezerwację
  const confirmBooking = () => {
    if (selectedServices.length === 0) {
      showToast('Wybierz przynajmniej jedną usługę', 'error');
      return;
    }
    if (!selectedDate) {
      showToast('Wybierz datę', 'error');
      return;
    }
    if (!selectedTime) {
      showToast('Wybierz godzinę', 'error');
      return;
    }
    setShowModal(true);
  };

  // Animacje scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-fade-in');
          }
        });
      },
      { threshold: 0.1, rootMargin: '-50px' }
    );

    document.querySelectorAll('.animate-on-scroll').forEach((el) => {
      observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 relative">
      {/* Animated Background */}
      <div className="fixed inset-0 -z-10 overflow-hidden opacity-30">
        <div className="absolute -top-[200px] -left-[200px] w-[600px] h-[600px] bg-gradient-to-br from-primary to-secondary rounded-full blur-[100px] animate-float" />
        <div className="absolute -bottom-[300px] -right-[300px] w-[800px] h-[800px] bg-gradient-to-br from-pink-400 to-rose-500 rounded-full blur-[100px] animate-float" style={{ animationDelay: '10s' }} />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-lg border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 h-[72px] flex items-center justify-between">
          <Link to="/" className="transition-transform hover:scale-105">
            <img src="/brand.png" alt="TOMYHOMEAPP" className="h-[80px]" />
          </Link>
          <Link
            to="/uslugodawcy"
            className="flex items-center gap-2 px-4 py-2 border-2 border-primary text-primary rounded-xl font-semibold hover:bg-primary hover:text-white transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
            Powrót do listy
          </Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 pb-12">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 py-5 text-sm text-gray-500">
          <Link to="/" className="hover:text-primary transition-colors">Strona główna</Link>
          <span>/</span>
          <Link to="/uslugodawcy" className="hover:text-primary transition-colors">Usługi</Link>
          <span>/</span>
          <span className="text-gray-700">{provider.name}</span>
        </div>

        {/* Profile Header */}
        <section className="bg-white rounded-3xl p-8 lg:p-10 shadow-lg mb-8 animate-fade-in">
          <div className="grid lg:grid-cols-[200px_1fr_auto] gap-8 items-start">
            {/* Image */}
            <div className="relative w-[200px] h-[200px] mx-auto lg:mx-0 rounded-2xl overflow-hidden shadow-lg group">
              <img
                src={provider.image}
                alt={provider.name}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
              {provider.verified && (
                <div className="absolute bottom-3 right-3 bg-green-500 text-white px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1">
                  <Check className="w-3 h-3" />
                  Zweryfikowany
                </div>
              )}
            </div>

            {/* Info */}
            <div className="text-center lg:text-left">
              <h1 className="text-3xl font-extrabold mb-2">{provider.name}</h1>
              <p className="text-gray-500 mb-4">
                {provider.profession} • {provider.experience}
              </p>

              {/* Rating */}
              <div className="flex items-center justify-center lg:justify-start gap-3 mb-5">
                <div className="flex gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className="w-5 h-5 fill-yellow-400 text-yellow-400"
                    />
                  ))}
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-500">
                  <strong className="text-gray-900">{provider.rating}</strong>
                  <span>({provider.reviewsCount} opinii)</span>
                  <span>•</span>
                  <span>{provider.completedServices} wykonane usługi</span>
                </div>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap justify-center lg:justify-start gap-3 mb-5">
                {provider.isPremium && (
                  <span className="px-4 py-2 bg-gradient-to-r from-primary to-secondary text-white rounded-full text-sm font-medium">
                    ⭐ Premium Partner
                  </span>
                )}
                <span className="px-4 py-2 bg-gray-100 rounded-full text-sm font-medium flex items-center gap-1.5">
                  <MapPin className="w-4 h-4" />
                  {provider.location}
                </span>
                {provider.hasTravel && (
                  <span className="px-4 py-2 bg-gray-100 rounded-full text-sm font-medium flex items-center gap-1.5">
                    <Car className="w-4 h-4" />
                    Dojazd do klienta
                  </span>
                )}
                {provider.acceptsCard && (
                  <span className="px-4 py-2 bg-gray-100 rounded-full text-sm font-medium flex items-center gap-1.5">
                    <CreditCard className="w-4 h-4" />
                    Płatność kartą
                  </span>
                )}
              </div>

              {/* Stats */}
              <div className="flex justify-center lg:justify-start gap-8">
                <div className="text-center lg:text-left">
                  <div className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                    {provider.punctuality}%
                  </div>
                  <div className="text-xs text-gray-500 uppercase tracking-wide">
                    Punktualność
                  </div>
                </div>
                <div className="text-center lg:text-left">
                  <div className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                    {provider.responseTime}
                  </div>
                  <div className="text-xs text-gray-500 uppercase tracking-wide">
                    Czas odpowiedzi
                  </div>
                </div>
                <div className="text-center lg:text-left">
                  <div className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                    {provider.regularClients}
                  </div>
                  <div className="text-xs text-gray-500 uppercase tracking-wide">
                    Stałych klientów
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-3 lg:flex-col">
              <button
                onClick={openChat}
                className="px-6 py-3 bg-gradient-to-r from-primary to-secondary text-white rounded-xl font-semibold shadow-md hover:-translate-y-0.5 hover:shadow-lg transition-all flex items-center justify-center gap-2"
              >
                <MessageCircle className="w-5 h-5" />
                Napisz wiadomość
              </button>
              <button className="px-6 py-3 border-2 border-primary text-primary rounded-xl font-semibold hover:bg-primary hover:text-white transition-all flex items-center justify-center gap-2">
                <Heart className="w-5 h-5" />
                Dodaj do ulubionych
              </button>
            </div>
          </div>
        </section>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-[2fr_1fr] gap-8">
          {/* Left Column */}
          <div className="space-y-8">
            {/* Services Section */}
            <section className="bg-white rounded-3xl p-8 shadow-md">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b-2 border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-primary to-secondary rounded-xl flex items-center justify-center text-white">
                    <Scissors className="w-5 h-5" />
                  </div>
                  <h2 className="text-2xl font-bold">Lista usług</h2>
                </div>
                <div className="flex gap-2 flex-wrap">
                  {filterCategories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setActiveFilter(cat)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                        activeFilter === cat
                          ? 'bg-gradient-to-r from-primary to-secondary text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                {filteredServices.map((service) => {
                  const isSelected = selectedServices.some((s) => s.id === service.id);
                  return (
                    <div
                      key={service.id}
                      className={`relative p-5 bg-gray-50 rounded-2xl transition-all cursor-pointer group hover:bg-white hover:shadow-md hover:translate-x-1 ${
                        isSelected ? 'ring-2 ring-primary bg-primary/5' : ''
                      }`}
                      onClick={() => toggleService(service)}
                    >
                      {/* Left accent bar */}
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-primary to-secondary rounded-l-2xl scale-y-0 group-hover:scale-y-100 transition-transform origin-top" />

                      <div className="flex items-center justify-between gap-4">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold mb-1">{service.name}</h3>
                          <p className="text-sm text-gray-500 mb-2">{service.description}</p>
                          <div className="flex items-center gap-4">
                            <span className="text-sm text-gray-400 flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              {service.duration}
                            </span>
                            {service.badge && (
                              <span
                                className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                  service.badge === 'Popularne'
                                    ? 'bg-blue-100 text-blue-600'
                                    : service.badge === 'Premium'
                                    ? 'bg-purple-100 text-purple-600'
                                    : 'bg-green-100 text-green-600'
                                }`}
                              >
                                {service.badge}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            {service.oldPrice && (
                              <div className="text-sm text-gray-400 line-through">
                                {service.oldPrice} zł
                              </div>
                            )}
                            <div className="text-2xl font-bold">
                              {service.price} <span className="text-sm font-medium text-gray-500">zł</span>
                            </div>
                          </div>
                          {service.discount && (
                            <span className="px-2 py-1 bg-red-500 text-white rounded-lg text-xs font-bold">
                              -{service.discount}%
                            </span>
                          )}
                          <button
                            className={`px-5 py-2.5 rounded-xl font-semibold text-sm transition-all ${
                              isSelected
                                ? 'bg-green-500 text-white'
                                : 'bg-gradient-to-r from-primary to-secondary text-white hover:scale-105 hover:shadow-md'
                            }`}
                          >
                            {isSelected ? '✓ Wybrano' : 'Wybierz'}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* About Section */}
            <section className="bg-white rounded-3xl p-8 shadow-md animate-on-scroll opacity-0">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b-2 border-gray-100">
                <div className="w-10 h-10 bg-gradient-to-r from-primary to-secondary rounded-xl flex items-center justify-center text-white">
                  <FileText className="w-5 h-5" />
                </div>
                <h2 className="text-2xl font-bold">O mnie</h2>
              </div>
              <div className="text-gray-500 leading-relaxed space-y-4 mb-6">
                {provider.description.map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
              </div>
              <div className="flex flex-wrap gap-4">
                {provider.certifications.map((cert, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-xl text-sm"
                  >
                    <div className="w-6 h-6 bg-gradient-to-r from-primary to-secondary rounded-full flex items-center justify-center">
                      <Award className="w-3 h-3 text-white" />
                    </div>
                    {cert}
                  </div>
                ))}
              </div>
            </section>

            {/* Portfolio */}
            <section className="bg-white rounded-3xl p-8 shadow-md animate-on-scroll opacity-0">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b-2 border-gray-100">
                <div className="w-10 h-10 bg-gradient-to-r from-primary to-secondary rounded-xl flex items-center justify-center text-white">
                  <Camera className="w-5 h-5" />
                </div>
                <h2 className="text-2xl font-bold">Portfolio</h2>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {provider.portfolio.map((item) => (
                  <div
                    key={item.id}
                    className="aspect-square rounded-2xl overflow-hidden cursor-pointer transition-all hover:scale-105 hover:shadow-lg relative group"
                  >
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                    />
                    <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/70 to-transparent text-white text-xs font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                      {item.title}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Reviews */}
            <section className="bg-white rounded-3xl p-8 shadow-md animate-on-scroll opacity-0">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b-2 border-gray-100">
                <div className="w-10 h-10 bg-gradient-to-r from-primary to-secondary rounded-xl flex items-center justify-center text-white">
                  <Star className="w-5 h-5" />
                </div>
                <h2 className="text-2xl font-bold">
                  Opinie klientów ({provider.reviewsCount})
                </h2>
              </div>
              <div className="space-y-4">
                {provider.reviews.map((review) => (
                  <div
                    key={review.id}
                    className="p-5 bg-gray-50 rounded-2xl transition-all hover:bg-white hover:shadow-md"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-r from-primary to-secondary rounded-full flex items-center justify-center text-white font-bold">
                          {review.initials}
                        </div>
                        <div>
                          <div className="font-semibold">{review.author}</div>
                          <div className="text-xs text-gray-400">{review.date}</div>
                        </div>
                      </div>
                      <div className="flex gap-0.5">
                        {[...Array(review.rating)].map((_, i) => (
                          <Star
                            key={i}
                            className="w-4 h-4 fill-yellow-400 text-yellow-400"
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-sm text-gray-500 leading-relaxed mb-3">
                      {review.text}
                    </p>
                    <span className="inline-block px-3 py-1 bg-white rounded-full text-xs font-medium text-gray-500">
                      {review.service}
                    </span>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Right Column - Sidebar */}
          <aside className="space-y-6">
            {/* Contact Widget */}
            <div className="bg-white rounded-3xl p-6 shadow-md">
              <h3 className="text-lg font-bold mb-4">Informacje kontaktowe</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3 py-3 border-b border-gray-100">
                  <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center text-primary">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs text-gray-400">Obszar działania</div>
                    <div className="text-sm font-semibold">{provider.travelArea}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 py-3 border-b border-gray-100">
                  <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center text-primary">
                    <Car className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs text-gray-400">Dojazd</div>
                    <div className="text-sm font-semibold">{provider.travelCost}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 py-3 border-b border-gray-100">
                  <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center text-primary">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs text-gray-400">Godziny pracy</div>
                    <div className="text-sm font-semibold">
                      {provider.workingHours.weekdays}
                      <br />
                      {provider.workingHours.saturday}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3 py-3">
                  <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center text-primary">
                    <CreditCard className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs text-gray-400">Formy płatności</div>
                    <div className="text-sm font-semibold">Gotówka, karta, BLIK</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Booking Widget */}
            <div className="bg-white rounded-3xl p-6 shadow-md sticky top-24">
              <div className="text-center mb-6">
                <h3 className="text-xl font-bold mb-2">Zarezerwuj termin</h3>
                <p className="text-sm text-gray-500">Wybierz datę i godzinę wizyty</p>
              </div>

              {/* Calendar */}
              <div className="mb-5">
                <label className="text-sm font-semibold text-gray-500 mb-2 block">
                  Wybierz datę:
                </label>
                <div className="flex justify-between items-center mb-3">
                  <span className="font-semibold">
                    {currentMonth.month} {currentMonth.year}
                  </span>
                  <div className="flex gap-2">
                    <button className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center hover:bg-primary hover:text-white transition-colors">
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center hover:bg-primary hover:text-white transition-colors">
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-7 gap-1 mb-2">
                  {['Pn', 'Wt', 'Śr', 'Cz', 'Pt', 'So', 'Nd'].map((d) => (
                    <div
                      key={d}
                      className="text-center text-xs font-semibold text-gray-400 py-2"
                    >
                      {d}
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-1">
                  {calendarDays.map((d, i) => (
                    <button
                      key={i}
                      disabled={d.disabled}
                      onClick={() => !d.disabled && setSelectedDate(d.day)}
                      className={`aspect-square flex items-center justify-center rounded-lg text-sm transition-all
                        ${d.disabled ? 'opacity-30 cursor-not-allowed bg-gray-100' : 'bg-gray-100 hover:bg-primary/10 hover:text-primary cursor-pointer'}
                        ${selectedDate === d.day ? 'bg-gradient-to-r from-primary to-secondary text-white' : ''}
                        ${d.isToday && selectedDate !== d.day ? 'ring-2 ring-primary' : ''}
                      `}
                    >
                      {d.day}
                    </button>
                  ))}
                </div>
              </div>

              {/* Time Slots */}
              <div className="mb-5">
                <label className="text-sm font-semibold text-gray-500 mb-3 block">
                  Dostępne godziny:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {timeSlots.map((slot) => (
                    <button
                      key={slot.time}
                      disabled={slot.disabled}
                      onClick={() => !slot.disabled && setSelectedTime(slot.time)}
                      className={`py-2.5 rounded-xl text-sm font-medium transition-all
                        ${slot.disabled ? 'opacity-30 cursor-not-allowed bg-gray-100' : 'bg-gray-100 hover:border-primary border-2 border-transparent'}
                        ${selectedTime === slot.time ? 'bg-gradient-to-r from-primary to-secondary text-white border-transparent' : ''}
                      `}
                    >
                      {slot.time}
                    </button>
                  ))}
                </div>
              </div>

              {/* Summary */}
              <div className="p-4 bg-gray-50 rounded-xl mb-5">
                <h4 className="text-sm font-semibold text-gray-500 mb-3">
                  Wybrane usługi:
                </h4>
                {selectedServices.length > 0 ? (
                  <>
                    {selectedServices.map((s) => (
                      <div
                        key={s.id}
                        className="flex justify-between items-center py-2 border-b border-gray-200 last:border-0"
                      >
                        <span className="text-sm">{s.name}</span>
                        <span className="font-semibold text-primary">{s.price} zł</span>
                      </div>
                    ))}
                    <div className="flex justify-between items-center pt-3 mt-3 border-t-2 border-gray-200">
                      <span className="font-bold">Razem:</span>
                      <span className="text-xl font-bold text-primary">{totalPrice} zł</span>
                    </div>
                  </>
                ) : (
                  <p className="text-sm text-gray-400 text-center py-2">
                    Wybierz usługi z listy powyżej
                  </p>
                )}
              </div>

              <button
                onClick={confirmBooking}
                className="w-full py-3.5 bg-gradient-to-r from-primary to-secondary text-white rounded-xl font-semibold hover:-translate-y-0.5 hover:shadow-lg transition-all"
              >
                Potwierdź rezerwację
              </button>
            </div>
          </aside>
        </div>
      </main>

      {/* Booking Confirmation Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-[200] flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full max-h-[90vh] overflow-y-auto animate-slide-up">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold">✅ Rezerwacja potwierdzona!</h3>
              <button
                onClick={() => setShowModal(false)}
                className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center hover:bg-primary hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="text-center">
              <div className="text-6xl mb-5">🎉</div>
              <p className="text-lg mb-3">Twoja rezerwacja została przyjęta!</p>
              <p className="text-gray-500 mb-6">
                Otrzymasz potwierdzenie SMS i e-mail w ciągu kilku minut.
              </p>
              <div className="bg-gray-50 p-5 rounded-2xl text-left mb-6">
                <h4 className="font-bold mb-4">Szczegóły rezerwacji:</h4>
                <p className="mb-2">
                  <strong>Specjalista:</strong> {provider.name}
                </p>
                <p className="mb-2">
                  <strong>Data:</strong> {selectedDate} {currentMonth.month} {currentMonth.year}
                </p>
                <p className="mb-2">
                  <strong>Godzina:</strong> {selectedTime}
                </p>
                <p className="mb-2">
                  <strong>Usługi:</strong> {selectedServices.map((s) => s.name).join(', ')}
                </p>
                <p>
                  <strong>Łączna kwota:</strong> {totalPrice} zł
                </p>
              </div>
              <button
                onClick={() => {
                  setShowModal(false);
                  setSelectedServices([]);
                }}
                className="w-full py-3.5 bg-gradient-to-r from-primary to-secondary text-white rounded-xl font-semibold hover:-translate-y-0.5 hover:shadow-lg transition-all"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Chat Window (Desktop) */}
      {showChat && (
        <div className="fixed bottom-5 right-5 w-80 h-[420px] bg-white rounded-2xl shadow-xl flex flex-col overflow-hidden z-[999] animate-slide-up">
          <div className="p-3 bg-gradient-to-r from-primary to-secondary text-white font-bold flex justify-between items-center">
            <span>Czat z {provider.name}</span>
            <button
              onClick={() => setShowChat(false)}
              className="hover:opacity-80 transition-opacity"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="flex-1 p-3 bg-gray-50 overflow-y-auto space-y-2">
            {chatMessages.length === 0 ? (
              <p className="text-center text-gray-400 text-sm mt-4">
                Rozpocznij rozmowę...
              </p>
            ) : (
              chatMessages.map((msg, i) => (
                <div
                  key={i}
                  className={`max-w-[80%] p-3 rounded-2xl text-sm ${
                    msg.fromMe
                      ? 'bg-gradient-to-r from-primary to-secondary text-white ml-auto rounded-br-none'
                      : 'bg-white shadow-sm mr-auto rounded-bl-none'
                  }`}
                >
                  {msg.text}
                </div>
              ))
            )}
          </div>
          <div className="p-3 border-t border-gray-100 flex gap-2">
            <input
              ref={chatInputRef}
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
              placeholder="Napisz wiadomość..."
              className="flex-1 px-4 py-2 bg-gray-100 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary"
            />
            <button
              onClick={sendMessage}
              className="p-2 bg-gradient-to-r from-primary to-secondary text-white rounded-xl hover:opacity-90 transition-opacity"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProviderDetailPage;
