import { useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useToast, useAuth } from '../App';
import ServiceCard from '../components/ServiceCard';
import ReviewCard from '../components/ReviewCard';
import StatsSection from '../components/StatsSection';

const HomePage = () => {
  const { showToast } = useToast();
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const servicesRef = useRef<HTMLDivElement>(null);

  const services = [
    { id: 'fryzjer', name: 'Fryzjer', icon: '✂️', price: 80, slug: 'fryzjer' },
    { id: 'tatuaze', name: 'Tatuaże', icon: '🖊️', price: 200, slug: 'tatuaze' },
    { id: 'paznokcie', name: 'Paznokcie', icon: '💅', price: 60, slug: 'paznokcie' },
    { id: 'masaz', name: 'Masaż', icon: '💆', price: 120, slug: 'masaz' },
    { id: 'makijaz', name: 'Makijaż', icon: '💄', price: 100, slug: 'makijaz' },
    { id: 'twarz', name: 'Twarz', icon: '💧', price: 120, slug: 'twarz' },
  ];

  const reviews = [
    {
      id: 1,
      author: 'Anna Kowalska',
      avatar: 'A',
      service: 'Fryzjer',
      date: '2 dni temu',
      rating: 5,
      content: 'Świetna usługa! Fryzjer przyjechał punktualnie, był bardzo profesjonalny. Efekt przekroczył moje oczekiwania. Na pewno skorzystam ponownie!',
      helpful: 23,
      gradientClass: 'bg-gradient-to-r from-primary to-secondary',
    },
    {
      id: 2,
      author: 'Krzysztof Chójan',
      avatar: 'K',
      service: 'Masaż',
      date: 'Tydzień temu',
      rating: 5,
      content: 'Bardzo wygodne rozwiązanie. Masażysta przywiózł profesjonalny stół, wszystko przebiegło sprawnie. Polecam każdemu!',
      helpful: 18,
      gradientClass: 'bg-gradient-to-r from-pink-500 to-rose-500',
    },
    {
      id: 3,
      author: 'Magdalena Wiśniewska',
      avatar: 'M',
      service: 'Manicure',
      date: '3 dni temu',
      rating: 5,
      content: 'Profesjonalny manicure w domu - świetny efekt, przystępna cena. Oszczędność czasu nieoceniona!',
      helpful: 31,
      gradientClass: 'bg-gradient-to-r from-purple-500 to-indigo-500',
    },
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

  const scrollToServices = (): void => {
    servicesRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Intersection Observer for scroll animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries: IntersectionObserverEntry[]): void => {
        entries.forEach((entry: IntersectionObserverEntry): void => {
          if (entry.isIntersecting) {
            entry.target.classList.add('opacity-100', 'translate-y-0');
            entry.target.classList.remove('opacity-0', 'translate-y-10');
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );

    document.querySelectorAll('.fade-in-scroll').forEach((el: Element): void => {
      observer.observe(el);
    });

    return (): void => { observer.disconnect(); };
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
                      <div className="text-2xl font-bold text-gray-900">10K+</div>
                      <div className="text-sm text-gray-500">Zadowolonych klientów</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-900">500+</div>
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

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
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

      {/* Reviews Section */}
      <section
        id="reviews"
        className="py-20 fade-in-scroll opacity-0 translate-y-10 transition-all duration-700"
      >
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <span className="inline-block bg-primary/10 text-primary px-4 py-1 rounded-full text-sm font-semibold mb-4">
              OPINIE
            </span>
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              Co mówią nasi klienci
            </h2>
            <p className="text-gray-600">Ponad 10 000 zadowolonych użytkowników</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {reviews.map((review) => (
              <ReviewCard key={review.id} review={review} />
            ))}
          </div>
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
