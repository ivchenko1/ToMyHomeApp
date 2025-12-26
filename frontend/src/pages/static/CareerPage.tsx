import { Briefcase, MapPin, Clock, ChevronRight, Heart, Zap, Users, Coffee } from 'lucide-react';

const CareerPage = () => {
  const benefits = [
    { icon: Heart, title: 'Ubezpieczenie zdrowotne', description: 'Pełny pakiet medyczny dla Ciebie i rodziny' },
    { icon: Zap, title: 'Elastyczna praca', description: 'Hybrydowy model pracy - biuro lub zdalnie' },
    { icon: Users, title: 'Świetny zespół', description: 'Pracuj z pasjonatami technologii i beauty' },
    { icon: Coffee, title: 'Benefity', description: 'Karta sportowa, owocowe wtorki, integracje' },
  ];

  const jobs = [
    {
      title: 'Senior Frontend Developer',
      department: 'Engineering',
      location: 'Poznań / Remote',
      type: 'Pełny etat',
      description: 'Szukamy doświadczonego frontend developera do rozwoju naszej platformy React.',
    },
    {
      title: 'Product Designer',
      department: 'Design',
      location: 'Poznań / Remote',
      type: 'Pełny etat',
      description: 'Dołącz do zespołu designu i twórz piękne interfejsy dla naszych użytkowników.',
    },
    {
      title: 'Customer Success Manager',
      department: 'Operations',
      location: 'Poznań',
      type: 'Pełny etat',
      description: 'Pomagaj naszym specjalistom rozwijać ich biznesy na platformie.',
    },
    {
      title: 'Marketing Specialist',
      department: 'Marketing',
      location: 'Poznań / Remote',
      type: 'Pełny etat',
      description: 'Twórz kampanie marketingowe i rozwijaj naszą obecność w social media.',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <section className="bg-gradient-to-br from-primary via-secondary to-accent text-white py-20">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h1 className="text-4xl lg:text-5xl font-bold mb-6">Kariera</h1>
          <p className="text-xl text-white/90 max-w-3xl mx-auto">
            Dołącz do zespołu, który zmienia branżę beauty i wellness w Polsce. 
            Szukamy talentów, które pomogą nam rosnąć!
          </p>
        </div>
      </section>

      {/* Why Join Us */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Dlaczego warto z nami pracować?</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Oferujemy nie tylko pracę, ale możliwość rozwoju w dynamicznym startupie.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((benefit, index) => (
              <div key={index} className="bg-white p-6 rounded-2xl shadow-sm text-center">
                <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <benefit.icon className="w-7 h-7 text-primary" />
                </div>
                <h3 className="font-bold text-lg mb-2">{benefit.title}</h3>
                <p className="text-gray-600 text-sm">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Open Positions */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Otwarte stanowiska</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Znajdź swoją wymarzoną rolę i dołącz do naszego zespołu.
            </p>
          </div>
          <div className="space-y-4 max-w-4xl mx-auto">
            {jobs.map((job, index) => (
              <div
                key={index}
                className="bg-gray-50 p-6 rounded-2xl hover:shadow-md transition-shadow cursor-pointer group"
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-3 py-1 bg-primary/10 text-primary text-xs font-semibold rounded-full">
                        {job.department}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">
                      {job.title}
                    </h3>
                    <p className="text-gray-600 text-sm mb-3">{job.description}</p>
                    <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {job.location}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {job.type}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-primary font-semibold group-hover:translate-x-2 transition-transform">
                    Aplikuj
                    <ChevronRight className="w-5 h-5" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* No Position */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="bg-gradient-to-r from-primary to-secondary rounded-2xl p-8 lg:p-12 text-white text-center">
            <Briefcase className="w-12 h-12 mx-auto mb-4 opacity-80" />
            <h2 className="text-2xl font-bold mb-4">Nie znalazłeś odpowiedniej oferty?</h2>
            <p className="text-white/90 mb-6 max-w-2xl mx-auto">
              Wyślij nam swoje CV, a odezwiemy się gdy pojawi się stanowisko odpowiadające Twoim umiejętnościom.
            </p>
            <a
              href="mailto:kariera@tomyhomeapp.pl"
              className="inline-flex items-center gap-2 px-8 py-3 bg-white text-primary font-semibold rounded-xl hover:shadow-lg transition-all"
            >
              Wyślij CV
              <ChevronRight className="w-5 h-5" />
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default CareerPage;
