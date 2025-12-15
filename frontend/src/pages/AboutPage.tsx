// src/pages/AboutPage.tsx
import { Link } from 'react-router-dom';
import { 
  Heart, 
  Target, 
  Users, 
  Award,
  MapPin,
  Clock,
  Shield,
  Sparkles,
  ArrowRight,
  CheckCircle
} from 'lucide-react';

const AboutPage = () => {
  const stats = [
    { number: '10,000+', label: 'Zadowolonych klientów' },
    { number: '500+', label: 'Usługodawców' },
    { number: '50,000+', label: 'Wykonanych usług' },
    { number: '4.8', label: 'Średnia ocena' },
  ];

  const values = [
    {
      icon: <Heart className="w-8 h-8" />,
      title: 'Pasja',
      description: 'Kochamy to, co robimy. Nasza pasja napędza nas do ciągłego doskonalenia.'
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: 'Zaufanie',
      description: 'Budujemy zaufanie poprzez transparentność, bezpieczeństwo i jakość usług.'
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: 'Społeczność',
      description: 'Tworzymy społeczność, która łączy profesjonalistów z klientami.'
    },
    {
      icon: <Sparkles className="w-8 h-8" />,
      title: 'Innowacja',
      description: 'Stale rozwijamy naszą platformę, aby oferować najlepsze doświadczenia.'
    },
  ];

  const team = [
    {
      name: 'Grzegorz Rychlicki',
      role: 'Developer',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop',
    },
    {
      name: 'Jakub Białasik',
      role: 'Developer',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop',
    },
    {
      name: 'Mykyta Ivchenko',
      role: 'Developer',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop',
    },
    // {
    //   name: 'Tomasz Zieliński',
    //   role: 'Head of Marketing',
    //   image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop',
    // },
  ];

  const timeline = [
    { year: '2023', title: 'Początek', description: 'Powstanie pomysłu na ToMyHomeApp' },
    { year: '2024', title: 'Start', description: 'Uruchomienie platformy w Polsce' },
    { year: '2025', title: 'Rozwój', description: '500+ usługodawców na platformie' },
    { year: '2026', title: 'Przyszłość', description: 'Ekspansja na nowe rynki' },
  ];

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-6xl mx-auto">
        
        {/* Hero Section */}
        <div className="bg-white rounded-3xl shadow-lg p-8 md:p-12 mb-10 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            O nas
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            ToMyHomeApp to platforma, która łączy profesjonalistów beauty i wellness 
            z klientami szukającymi usług z dojazdem do domu. Wierzymy, że piękno 
            i relaks powinny być dostępne dla każdego — w komforcie własnego domu.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {stats.map((stat, index) => (
            <div 
              key={index}
              className="bg-white rounded-2xl shadow-lg p-6 text-center"
            >
              <div className="text-3xl md:text-4xl font-bold text-primary mb-2">
                {stat.number}
              </div>
              <div className="text-gray-600 text-sm">
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* Mission */}
        <div className="grid md:grid-cols-2 gap-6 mb-10">
          <div className="bg-gradient-to-br from-primary to-primary/80 rounded-2xl shadow-lg p-8 text-white">
            <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center mb-6">
              <Target className="w-7 h-7" />
            </div>
            <h2 className="text-2xl font-bold mb-4">Nasza misja</h2>
            <p className="text-white/90 leading-relaxed">
              Ułatwiamy dostęp do wysokiej jakości usług beauty i wellness, 
              eliminując bariery czasowe i lokalizacyjne. Chcemy, aby każdy 
              mógł zadbać o siebie bez wychodzenia z domu.
            </p>
          </div>
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mb-6">
              <Award className="w-7 h-7 text-primary" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Nasza wizja</h2>
            <p className="text-gray-600 leading-relaxed">
              Dążymy do tego, aby stać się wiodącą platformą usług mobilnych 
              w Europie Środkowej, zmieniając sposób, w jaki ludzie korzystają 
              z usług beauty i wellness.
            </p>
          </div>
        </div>

        {/* Why Us */}
        <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12 mb-10">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Dlaczego ToMyHomeApp?
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <CheckCircle className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Wygoda</h3>
                <p className="text-gray-600">Usługi w komforcie Twojego domu, bez dojazdów</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <CheckCircle className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Oszczędność czasu</h3>
                <p className="text-gray-600">Nie tracisz czasu na dojazdy do salonu</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <CheckCircle className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Sprawdzeni specjaliści</h3>
                <p className="text-gray-600">Weryfikujemy wszystkich usługodawców</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <CheckCircle className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Przejrzyste ceny</h3>
                <p className="text-gray-600">Znasz cenę przed rezerwacją, bez niespodzianek</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <CheckCircle className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Łatwa rezerwacja</h3>
                <p className="text-gray-600">Zarezerwuj usługę w kilka kliknięć</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <CheckCircle className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Opinie klientów</h3>
                <p className="text-gray-600">Sprawdź oceny i wybierz najlepszego specjalistę</p>
              </div>
            </div>
          </div>
        </div>

        {/* Values */}
        <div className="mb-10">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Nasze wartości
          </h2>
          <div className="grid md:grid-cols-4 gap-6">
            {values.map((value, index) => (
              <div 
                key={index}
                className="bg-white rounded-2xl shadow-lg p-6 text-center hover:shadow-xl transition-shadow"
              >
                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4 text-primary">
                  {value.icon}
                </div>
                <h3 className="font-bold text-gray-900 mb-2">{value.title}</h3>
                <p className="text-gray-600 text-sm">{value.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Timeline */}
        <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12 mb-10">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Nasza historia
          </h2>
          <div className="relative">
            {/* Line */}
            <div className="hidden md:block absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-primary/20 rounded-full" />
            
            <div className="space-y-8">
              {timeline.map((item, index) => (
                <div 
                  key={index}
                  className={`flex items-center gap-6 ${
                    index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
                  }`}
                >
                  <div className={`flex-1 ${index % 2 === 0 ? 'md:text-right' : 'md:text-left'}`}>
                    <div className="bg-gray-50 rounded-xl p-4 inline-block">
                      <div className="text-primary font-bold text-lg">{item.year}</div>
                      <div className="font-semibold text-gray-900">{item.title}</div>
                      <div className="text-gray-600 text-sm">{item.description}</div>
                    </div>
                  </div>
                  <div className="hidden md:flex w-4 h-4 bg-primary rounded-full z-10 flex-shrink-0" />
                  <div className="flex-1 hidden md:block" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Team */}
        <div className="mb-10">
        <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Nasz zespół
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {team.map((member, index) => (
            <div 
                key={index}
                className="bg-white rounded-2xl shadow-lg p-6 text-center hover:shadow-xl transition-shadow"
            >
                <img
                src={member.image}
                alt={member.name}
                className="w-24 h-24 rounded-full mx-auto mb-4 object-cover"
                />
                <h3 className="font-bold text-gray-900">{member.name}</h3>
                <p className="text-gray-600 text-sm">{member.role}</p>
            </div>
            ))}
        </div>
        </div>

        {/* Contact Info */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-10">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Dane firmy
          </h2>
          <div className="grid md:grid-cols-3 gap-6 text-center">
            <div>
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-3">
                <MapPin className="w-6 h-6 text-primary" />
              </div>
              <p className="text-gray-600">
                ToMyHomeApp sp. z o.o.<br />
                ul. Przykładowa 123<br />
                00-001 Warszawa
              </p>
            </div>
            <div>
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-3">
                <Award className="w-6 h-6 text-primary" />
              </div>
              <p className="text-gray-600">
                NIP: 0000000000<br />
                REGON: 000000000<br />
                KRS: 0000000000
              </p>
            </div>
            <div>
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-3">
                <Clock className="w-6 h-6 text-primary" />
              </div>
              <p className="text-gray-600">
                Biuro czynne:<br />
                pon-pt 9:00-17:00<br />
                sob-ndz: nieczynne
              </p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="bg-gradient-to-r from-primary to-primary/80 rounded-2xl shadow-lg p-8 md:p-12 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">
            Dołącz do nas!
          </h2>
          <p className="text-white/90 mb-8 max-w-2xl mx-auto">
            Szukasz usług beauty z dojazdem? A może jesteś profesjonalistą i chcesz 
            dołączyć do naszej platformy? Zacznij już dziś!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/uslugodawcy"
              className="px-8 py-4 bg-white text-primary font-semibold rounded-xl hover:bg-gray-100 transition-colors flex items-center justify-center gap-2"
            >
              Znajdź usługodawcę
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              to="/auth"
              className="px-8 py-4 border-2 border-white text-white font-semibold rounded-xl hover:bg-white/10 transition-colors"
            >
              Zostań usługodawcą
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AboutPage;