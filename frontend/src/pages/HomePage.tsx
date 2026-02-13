import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useToast, useAuth } from '../App';
import ServiceCard from '../components/ServiceCard';
import StatsSection from '../components/StatsSection';
import { Star } from 'lucide-react';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { db } from '../firebase';

// Interfejs dla opinii z Firebase
interface FirebaseReview {
  id: string;
  clientName: string;
  clientAvatar?: string;
  serviceName: string;
  rating: number;
  comment: string;
  createdAt: string;
  providerName?: string;
}

// Komponent karty opinii dla karuzeli
const ReviewCarouselCard = ({ review }: { review: FirebaseReview }) => {
  const gradientClasses = [
    'bg-gradient-to-r from-primary to-secondary',
    'bg-gradient-to-r from-pink-500 to-rose-500',
    'bg-gradient-to-r from-purple-500 to-indigo-500',
    'bg-gradient-to-r from-emerald-500 to-teal-500',
    'bg-gradient-to-r from-orange-500 to-amber-500',
  ];
  
  // Użyj hash z ID do konsystentnego wyboru gradientu
  const gradientIndex = review.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % gradientClasses.length;
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Dzisiaj';
    if (diffDays === 1) return 'Wczoraj';
    if (diffDays < 7) return `${diffDays} dni temu`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} tyg. temu`;
    return `${Math.floor(diffDays / 30)} mies. temu`;
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 min-w-[320px] max-w-[380px] flex-shrink-0 mx-3">
      {/* Header */}
      <div className="flex items-center gap-4 mb-4">
        <div className={`w-12 h-12 rounded-full ${gradientClasses[gradientIndex]} flex items-center justify-center text-white font-bold text-lg`}>
          {review.clientName.charAt(0).toUpperCase()}
        </div>
        <div>
          <h4 className="font-semibold text-gray-900">{review.clientName}</h4>
          <p className="text-sm text-gray-500">
            {review.serviceName} • {formatDate(review.createdAt)}
          </p>
        </div>
      </div>

      {/* Stars */}
      <div className="flex items-center gap-1 mb-4">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= review.rating
                ? 'fill-yellow-400 text-yellow-400'
                : 'text-gray-300'
            }`}
          />
        ))}
      </div>

      {/* Content */}
      <p className="text-gray-600 leading-relaxed line-clamp-4">{review.comment}</p>
    </div>
  );
};

const HomePage = () => {
  const { showToast } = useToast();
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const servicesRef = useRef<HTMLDivElement>(null);
  const carouselRef = useRef<HTMLDivElement>(null);
  
  // State dla opinii z Firebase
  const [reviews, setReviews] = useState<FirebaseReview[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [carouselPosition, setCarouselPosition] = useState(0);
  
  // State dla mini statystyk w Hero
  const [heroStats, setHeroStats] = useState({ clients: '0+', providers: '0+' });

  const services = [
    { id: 'fryzjer', name: 'Fryzjer', icon: '✂️', price: 80, slug: 'fryzjer' },
    { id: 'tatuaze', name: 'Tatuaże', icon: '🖊️', price: 200, slug: 'tatuaze' },
    { id: 'paznokcie', name: 'Paznokcie', icon: '💅', price: 60, slug: 'paznokcie' },
    { id: 'masaz', name: 'Masaż', icon: '💆', price: 120, slug: 'masaz' },
    { id: 'makijaz', name: 'Makijaż', icon: '💄', price: 100, slug: 'makijaz' },
    { id: 'twarz', name: 'Twarz', icon: '💧', price: 120, slug: 'twarz' },
    { id: 'inne', name: 'Inne usługi', icon: '✨', price: 0, slug: 'inne' },
  ];

  const howItWorks = [
    {
      step: 1,
      title: 'Wybierz usługę',
      description: 'Przeglądaj kategorie i wybierz specjalistę według opinii i ceny',
      gradient: 'from-red-400 to-orange-500',
    },
    {
      step: 2,
      title: 'Zarezerwuj termin',
      description: 'Wybierz dogodny termin i potwierdź rezerwację online',
      gradient: 'from-primary to-secondary',
    },
    {
      step: 3,
      title: 'Specjalista przyjeżdża',
      description: 'Profesjonalista przyjedzie pod wskazany adres z całym sprzętem',
      gradient: 'from-pink-400 to-rose-500',
    },
  ];

  const scrollToServices = () => {
    servicesRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Funkcja formatująca liczby dla Hero (podobna jak w StatsSection)
  const formatHeroStat = (num: number): string => {
    if (num === 0) return '0+';
    if (num < 10) return `${num}+`;
    if (num < 100) return `${Math.floor(num / 5) * 5}+`;
    if (num < 1000) return `${Math.floor(num / 50) * 50}+`;
    const rounded = Math.floor(num / 500) * 500;
    if (rounded >= 1000) {
      return `${(rounded / 1000).toFixed(rounded % 1000 === 0 ? 0 : 1)}K+`;
    }
    return `${rounded}+`;
  };

  // Pobierz opinie i mini statystyki z Firebase
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Pobierz opinie
        const reviewsQuery = query(
          collection(db, 'reviews'),
          orderBy('createdAt', 'desc'),
          limit(20)
        );
        const reviewsSnapshot = await getDocs(reviewsQuery);
        const fetchedReviews = reviewsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as FirebaseReview[];
        
        // Filtruj tylko opinie z ratingiem >= 4
        const positiveReviews = fetchedReviews.filter(r => r.rating >= 4);
        setReviews(positiveReviews);

        // Pobierz statystyki dla Hero
        const [usersSnapshot, providersSnapshot] = await Promise.all([
          getDocs(collection(db, 'users')),
          getDocs(collection(db, 'providers'))
        ]);
        
        const clientsCount = usersSnapshot.docs.filter(
          doc => doc.data().accountType === 'client'
        ).length;
        const providersCount = providersSnapshot.size;

        setHeroStats({
          clients: formatHeroStat(clientsCount),
          providers: formatHeroStat(providersCount)
        });
      } catch (error) {
        console.error('Error fetching data:', error);
        setReviews([]);
      } finally {
        setReviewsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Automatyczne przewijanie karuzeli
  useEffect(() => {
    if (reviews.length <= 1) return;
    
    const interval = setInterval(() => {
      setCarouselPosition(prev => {
        const maxPosition = reviews.length - 1;
        return prev >= maxPosition ? 0 : prev + 1;
      });
    }, 4000); // Przewiń co 4 sekundy

    return () => clearInterval(interval);
  }, [reviews.length]);

  // Scroll karuzeli gdy zmienia się pozycja
  useEffect(() => {
    if (carouselRef.current && reviews.length > 0) {
      const cardWidth = 356; // 320px + 36px margin
      carouselRef.current.scrollTo({
        left: carouselPosition * cardWidth,
        behavior: 'smooth'
      });
    }
  }, [carouselPosition, reviews.length]);

  // Intersection Observer for scroll animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('opacity-100', 'translate-y-0');
            entry.target.classList.remove('opacity-0', 'translate-y-10');
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );

    document.querySelectorAll('.fade-in-scroll').forEach((el) => {
      observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <div>
      {/* Hero Section */}
      <section className="py-20 lg:py-32 animate-fade-in">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left Content */}
            <div className="animate-slide-in-left">
              <div className="inline-flex items-center gap-2 bg-accent/10 text-accent px-4 py-2 rounded-full text-sm font-semibold mb-6 animate-bounce-slow">
                <span>✨</span>
                <span>Nowy w Twojej okolicy</span>
              </div>

              <h1 className="text-4xl lg:text-6xl font-black leading-tight mb-6">
                Zamów usługę i nie tylko
                <br />
                <span className="gradient-text">Usługi z dojazdem do domu</span>
              </h1>

              <p className="text-gray-600 text-lg mb-8 leading-relaxed">
                Specjaliści przyjadą pod wskazany adres — fryzjer, manicure, tatuażysta, masaż i więcej.
              </p>

              <div className="flex flex-wrap gap-4">
                <button
                  onClick={() => {
                    if (isAuthenticated) {
                      scrollToServices();
                    } else {
                      navigate('/auth?mode=register&type=client');
                    }
                  }}
                  className="btn btn-cta animate-pulse-slow group"
                >
                  <span>Zarezerwuj usługę</span>
                  <span className="transition-transform group-hover:translate-x-1">→</span>
                </button>
                {/* Przycisk Dodaj usługę - tylko dla niezalogowanych lub usługodawców */}
                {(!isAuthenticated || user?.accountType === 'provider') && (
                  <Link
                    to={isAuthenticated ? '/biznes/dodaj-usluge' : '/auth?mode=register&type=provider'}
                    className="btn btn-ghost border-2 border-primary text-primary hover:bg-primary hover:text-white group"
                  >
                    <span>➕ Dodaj usługę</span>
                    <span className="transition-transform group-hover:translate-x-1">→</span>
                  </Link>
                )}
              </div>

              <div className="flex flex-wrap gap-6 mt-8 text-sm text-gray-600">
                <span className="flex items-center gap-2">
                  <span className="text-green-500">✓</span> Bez opłat za dojazd
                </span>
                <span className="flex items-center gap-2">
                  <span className="text-green-500">✓</span> Sprawdzeni specjaliści
                </span>
                <span className="flex items-center gap-2">
                  <span className="text-green-500">✓</span> Gwarancja satysfakcji
                </span>
              </div>
            </div>

            {/* Right Content - Hero Card */}
            <div className="animate-slide-in-right">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-3xl blur-3xl" />
                <div className="relative bg-white rounded-3xl shadow-2xl overflow-hidden">
                  <img
                    src="https://images.unsplash.com/photo-1560066984-138dadb4c035?w=600&h=400&fit=crop"
                    alt="Profesjonalna usługa fryzjerska"
                    className="w-full h-64 lg:h-80 object-cover"
                  />
                  <div className="p-6 flex gap-8">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-900">{heroStats.clients}</div>
                      <div className="text-sm text-gray-500">Zadowolonych klientów</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-900">{heroStats.providers}</div>
                      <div className="text-sm text-gray-500">Specjalistów</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section
        id="services"
        ref={servicesRef}
        className="py-20 fade-in-scroll opacity-0 translate-y-10 transition-all duration-700"
      >
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <span className="inline-block bg-primary/10 text-primary px-4 py-1 rounded-full text-sm font-semibold mb-4">
              USŁUGI
            </span>
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">Popularne usługi</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Wybierz spośród szerokiej gamy profesjonalnych usług
            </p>
          </div>

          {/* Grid usług */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-4">
            {services.map((service) => (
              <ServiceCard key={service.id} service={service} />
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section
        id="how"
        className="py-20 fade-in-scroll opacity-0 translate-y-10 transition-all duration-700"
      >
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <span className="inline-block bg-primary/10 text-primary px-4 py-1 rounded-full text-sm font-semibold mb-4">
              JAK TO DZIAŁA
            </span>
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">Proste 3 kroki</h2>
            <p className="text-gray-600">Od rezerwacji do realizacji usługi</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {howItWorks.map((item, index) => (
              <div
                key={item.step}
                className="text-center p-8 rounded-2xl bg-white shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="text-sm font-bold text-gray-400 mb-4">
                  Krok {item.step}
                </div>
                <div
                  className={`w-16 h-16 mx-auto mb-6 rounded-full bg-gradient-to-r ${item.gradient} flex items-center justify-center`}
                >
                  <span className="text-white text-2xl">✓</span>
                </div>
                <h3 className="text-xl font-bold mb-3">{item.title}</h3>
                <p className="text-gray-600">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Reviews Section - Automatic Carousel */}
      <section
        id="reviews"
        className="py-20 fade-in-scroll opacity-0 translate-y-10 transition-all duration-700 overflow-hidden"
      >
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <span className="inline-block bg-primary/10 text-primary px-4 py-1 rounded-full text-sm font-semibold mb-4">
              OPINIE
            </span>
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              Co mówią nasi klienci
            </h2>
            <p className="text-gray-600">
              {reviews.length > 0 
                ? `Ponad ${Math.max(reviews.length, 10)} zadowolonych użytkowników`
                : 'Opinie naszych zadowolonych klientów'
              }
            </p>
          </div>

          {reviewsLoading ? (
            <div className="flex justify-center py-12">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : reviews.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-2xl">
              <Star className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">Bądź pierwszym, który wystawi opinię!</p>
              <p className="text-gray-400">Skorzystaj z usługi i podziel się swoją opinią</p>
            </div>
          ) : reviews.length === 1 ? (
            // Tylko jedna opinia - wyśrodkuj bez karuzeli
            <div className="flex justify-center">
              <ReviewCarouselCard review={reviews[0]} />
            </div>
          ) : (
            <div className="relative">
              {/* Carousel Container */}
              <div 
                ref={carouselRef}
                className="flex overflow-x-hidden scroll-smooth pb-4 justify-center"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              >
                {reviews.map((review) => (
                  <ReviewCarouselCard key={review.id} review={review} />
                ))}
              </div>

              {/* Gradient overlays - tylko gdy więcej niż 2 opinie */}
              {reviews.length > 2 && (
                <>
                  <div className="absolute left-0 top-0 bottom-4 w-20 bg-gradient-to-r from-white to-transparent pointer-events-none z-10" />
                  <div className="absolute right-0 top-0 bottom-4 w-20 bg-gradient-to-l from-white to-transparent pointer-events-none z-10" />
                </>
              )}

              {/* Dots indicator */}
              {reviews.length > 1 && (
                <div className="flex justify-center gap-2 mt-6">
                  {reviews.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCarouselPosition(index)}
                      className={`w-2 h-2 rounded-full transition-all duration-300 ${
                        carouselPosition % reviews.length === index
                          ? 'bg-primary w-6'
                          : 'bg-gray-300 hover:bg-gray-400'
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Stats Section */}
      <StatsSection />

      {/* CTA Section */}
      <section className="py-20 fade-in-scroll opacity-0 translate-y-10 transition-all duration-700">
        <div className="max-w-7xl mx-auto px-6">
          <div className="bg-gradient-to-r from-primary to-secondary rounded-3xl p-12 lg:p-16 text-center text-white relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.1),transparent_70%)]" />
            
            <div className="relative z-10">
              <span className="inline-block bg-white/20 px-4 py-2 rounded-full text-sm font-bold tracking-wider mb-6">
                🎉 ZACZNIJ JUŻ DZIŚ
              </span>
              
              <h2 className="text-3xl lg:text-5xl font-black mb-4">
                Gotowy, by zamówić?
              </h2>
              
              <p className="text-lg opacity-95 max-w-xl mx-auto mb-8">
                Dołącz do tysięcy zadowolonych klientów. Pierwsze zamówienie z rabatem 20%!
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
                <button
                  onClick={() => {
                    scrollToServices();
                    showToast('Wybierz usługę powyżej, aby rozpocząć rezerwację', 'info');
                  }}
                  className="btn bg-white text-gray-900 font-bold shadow-lg hover:shadow-xl hover:-translate-y-1"
                >
                  <span>Zarezerwuj usługę</span>
                  <span>→</span>
                </button>
                <button className="btn border-2 border-white/30 text-white hover:bg-white/10">
                  Dowiedz się więcej
                </button>
              </div>

              <div className="flex flex-wrap gap-6 justify-center text-sm opacity-90">
                <span>✓ Bez ukrytych kosztów</span>
                <span>✓ Anuluj bezpłatnie</span>
                <span>✓ Płatność po usłudze</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
