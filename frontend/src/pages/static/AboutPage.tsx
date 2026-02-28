import { Heart, Users, Shield, Sparkles, Target, Award } from 'lucide-react';

const AboutPage = () => {
  const values = [
    {
      icon: Heart,
      title: 'Pasja',
      description: 'Kochamy to co robimy i wkładamy serce w każdy aspekt naszej platformy.',
    },
    {
      icon: Users,
      title: 'Społeczność',
      description: 'Budujemy mosty między specjalistami a klientami, tworząc silną społeczność.',
    },
    {
      icon: Shield,
      title: 'Zaufanie',
      description: 'Bezpieczeństwo i wiarygodność to fundamenty naszej działalności.',
    },
    {
      icon: Sparkles,
      title: 'Innowacja',
      description: 'Ciągle rozwijamy platformę, by oferować najlepsze doświadczenia.',
    },
  ];

  const stats = [
    { value: '10,000+', label: 'Zadowolonych klientów' },
    { value: '500+', label: 'Specjalistów' },
    { value: '25,000+', label: 'Wykonanych usług' },
    { value: '4.9', label: 'Średnia ocena' },
  ];

  const team = [
    { name: 'Mykyta Ivchenko', role: 'Co-Founder & Developer', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200' },
    { name: 'Grzegorz Rychlicki', role: 'Co-Founder & CEO', image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200' },
    { name: 'Jakub Białasik', role: 'Co-Founder & CTO', image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <section className="bg-gradient-to-br from-primary via-secondary to-accent text-white py-20">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h1 className="text-4xl lg:text-5xl font-bold mb-6">O nas</h1>
          <p className="text-xl text-white/90 max-w-3xl mx-auto">
            ToMyHomeApp to platforma łącząca profesjonalnych specjalistów beauty i wellness 
            z klientami szukającymi usług w zaciszu własnego domu.
          </p>
        </div>
      </section>

      {/* Mission */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-semibold mb-6">
                <Target className="w-4 h-4" />
                Nasza misja
              </div>
              <h2 className="text-3xl font-bold mb-6">
                Demokratyzujemy dostęp do profesjonalnych usług beauty
              </h2>
              <p className="text-gray-600 mb-4 leading-relaxed">
                Wierzymy, że każdy zasługuje na profesjonalną pielęgnację bez wychodzenia z domu. 
                Nasza platforma powstała z myślą o wygodzie klientów i rozwoju specjalistów.
              </p>
              <p className="text-gray-600 leading-relaxed">
                Łączymy najlepszych specjalistów z klientami, zapewniając bezpieczeństwo, 
                wygodę i najwyższą jakość usług. Od fryzjerstwa po masaże - wszystko 
                dostępne na wyciągnięcie ręki.
              </p>
            </div>
            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600"
                alt="Nasza misja"
                className="rounded-2xl shadow-xl"
              />
              <div className="absolute -bottom-6 -left-6 bg-white p-4 rounded-xl shadow-lg">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                    <Award className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">Od 2024</p>
                    <p className="text-sm text-gray-500">Na rynku</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <p className="text-4xl font-bold text-primary mb-2">{stat.value}</p>
                <p className="text-gray-600">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Nasze wartości</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Kierujemy się zasadami, które pomagają nam tworzyć lepszą platformę dla wszystkich.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => (
              <div key={index} className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                  <value.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-bold text-lg mb-2">{value.title}</h3>
                <p className="text-gray-600 text-sm">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Nasz zespół</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Poznaj ludzi, którzy tworzą ToMyHomeApp i dbają o Twoje doświadczenia.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-3xl mx-auto">
            {team.map((member, index) => (
              <div key={index} className="text-center">
                <img
                  src={member.image}
                  alt={member.name}
                  className="w-32 h-32 rounded-full mx-auto mb-4 object-cover"
                />
                <h3 className="font-bold text-lg">{member.name}</h3>
                <p className="text-gray-500">{member.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-gradient-to-r from-primary to-secondary text-white">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-4">Dołącz do nas!</h2>
          <p className="text-white/90 mb-8 max-w-2xl mx-auto">
            Zostań częścią naszej społeczności - jako klient lub specjalista.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="/uslugodawcy" className="px-8 py-3 bg-white text-primary font-semibold rounded-xl hover:shadow-lg transition-all">
              Znajdź specjalistę
            </a>
            <a href="/auth?mode=register&type=provider" className="px-8 py-3 bg-white/20 text-white font-semibold rounded-xl hover:bg-white/30 transition-all">
              Zostań specjalistą
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;
