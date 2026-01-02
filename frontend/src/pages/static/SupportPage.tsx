import { MessageCircle, Phone, Mail, Clock, FileText, HelpCircle, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const SupportPage = () => {
  const supportOptions = [
    {
      icon: MessageCircle,
      title: 'Chat na żywo',
      description: 'Porozmawiaj z naszym konsultantem w czasie rzeczywistym',
      availability: 'Pn-Pt: 9:00 - 20:00, Sob: 10:00 - 16:00',
      action: 'Rozpocznij chat',
      primary: true,
    },
    {
      icon: Mail,
      title: 'Email',
      description: 'Wyślij wiadomość, odpowiemy w ciągu 24 godzin',
      availability: 'pomoc@tomyhomeapp.pl',
      action: 'Wyślij email',
      href: 'mailto:pomoc@tomyhomeapp.pl',
    },
    {
      icon: Phone,
      title: 'Telefon',
      description: 'Zadzwoń do nas w godzinach pracy',
      availability: '+48 123 456 789',
      action: 'Zadzwoń',
      href: 'tel:+48123456789',
    },
  ];

  const quickLinks = [
    { icon: HelpCircle, title: 'FAQ', description: 'Odpowiedzi na najczęstsze pytania', to: '/faq' },
    { icon: FileText, title: 'Regulamin', description: 'Zasady korzystania z platformy', to: '/regulamin' },
    { icon: FileText, title: 'Polityka prywatności', description: 'Jak chronimy Twoje dane', to: '/prywatnosc' },
  ];

  const guides = [
    {
      title: 'Jak zarezerwować wizytę?',
      steps: [
        'Wyszukaj usługę lub specjalistę',
        'Wybierz odpowiedni termin z kalendarza',
        'Potwierdź rezerwację i dokonaj płatności',
        'Otrzymaj potwierdzenie na email',
      ],
    },
    {
      title: 'Jak anulować rezerwację?',
      steps: [
        'Zaloguj się na swoje konto',
        'Przejdź do "Moje rezerwacje"',
        'Znajdź rezerwację i kliknij "Anuluj"',
        'Potwierdź anulowanie',
      ],
    },
    {
      title: 'Jak zmienić dane konta?',
      steps: [
        'Zaloguj się na swoje konto',
        'Kliknij w ikonę profilu',
        'Wybierz "Ustawienia"',
        'Edytuj dane i zapisz zmiany',
      ],
    },
  ];

  const commonIssues = [
    {
      problem: 'Nie mogę się zalogować',
      solution: 'Sprawdź czy wpisujesz prawidłowy email. Użyj opcji "Zapomniałem hasła" aby je zresetować.',
    },
    {
      problem: 'Nie otrzymałem potwierdzenia rezerwacji',
      solution: 'Sprawdź folder SPAM. Jeśli wiadomości tam nie ma, skontaktuj się z nami.',
    },
    {
      problem: 'Specjalista nie pojawił się na wizycie',
      solution: 'Skontaktuj się z nami natychmiast. Pomożemy rozwiązać sytuację i zapewnimy zwrot środków.',
    },
    {
      problem: 'Chcę zmienić termin wizyty',
      solution: 'Anuluj obecną rezerwację i utwórz nową z innym terminem. Możesz też skontaktować się ze specjalistą.',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <section className="bg-gradient-to-br from-primary via-secondary to-accent text-white py-20">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h1 className="text-4xl lg:text-5xl font-bold mb-6">Centrum wsparcia</h1>
          <p className="text-xl text-white/90 max-w-3xl mx-auto">
            Jesteśmy tu, aby Ci pomóc. Wybierz preferowany sposób kontaktu 
            lub znajdź odpowiedź w naszych poradnikach.
          </p>
        </div>
      </section>

      {/* Support Options */}
      <section className="py-12 -mt-8">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-6">
            {supportOptions.map((option, index) => (
              <div
                key={index}
                className={`p-6 rounded-2xl ${
                  option.primary
                    ? 'bg-gradient-to-br from-primary to-secondary text-white'
                    : 'bg-white shadow-sm'
                }`}
              >
                <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-4 ${
                  option.primary ? 'bg-white/20' : 'bg-primary/10'
                }`}>
                  <option.icon className={`w-7 h-7 ${option.primary ? 'text-white' : 'text-primary'}`} />
                </div>
                <h3 className={`text-xl font-bold mb-2 ${option.primary ? 'text-white' : 'text-gray-900'}`}>
                  {option.title}
                </h3>
                <p className={`mb-3 ${option.primary ? 'text-white/80' : 'text-gray-600'}`}>
                  {option.description}
                </p>
                <p className={`text-sm mb-4 flex items-center gap-2 ${option.primary ? 'text-white/70' : 'text-gray-500'}`}>
                  <Clock className="w-4 h-4" />
                  {option.availability}
                </p>
                <a
                  href={option.href || '#'}
                  className={`inline-flex items-center gap-2 font-semibold ${
                    option.primary
                      ? 'text-white hover:underline'
                      : 'text-primary hover:underline'
                  }`}
                >
                  {option.action}
                  <ChevronRight className="w-4 h-4" />
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Quick Links */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-2xl font-bold mb-8 text-center">Przydatne linki</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {quickLinks.map((link, index) => (
              <Link
                key={index}
                to={link.to}
                className="p-6 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-colors group"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                    <link.icon className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 group-hover:text-primary transition-colors">
                      {link.title}
                    </h3>
                    <p className="text-gray-600 text-sm">{link.description}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Step by Step Guides */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-2xl font-bold mb-8 text-center">Poradniki krok po kroku</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {guides.map((guide, index) => (
              <div key={index} className="bg-white p-6 rounded-2xl shadow-sm">
                <h3 className="font-bold text-lg text-gray-900 mb-4">{guide.title}</h3>
                <ol className="space-y-3">
                  {guide.steps.map((step, stepIndex) => (
                    <li key={stepIndex} className="flex items-start gap-3">
                      <span className="w-6 h-6 bg-primary/10 text-primary rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                        {stepIndex + 1}
                      </span>
                      <span className="text-gray-600 text-sm">{step}</span>
                    </li>
                  ))}
                </ol>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Common Issues */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-2xl font-bold mb-8 text-center">Najczęstsze problemy</h2>
          <div className="max-w-3xl mx-auto space-y-4">
            {commonIssues.map((issue, index) => (
              <div key={index} className="bg-gray-50 p-6 rounded-2xl">
                <h3 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                  <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                  {issue.problem}
                </h3>
                <p className="text-gray-600 pl-4">{issue.solution}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Still Need Help */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="bg-gradient-to-r from-primary to-secondary rounded-2xl p-8 lg:p-12 text-white text-center">
            <MessageCircle className="w-12 h-12 mx-auto mb-4 opacity-80" />
            <h2 className="text-2xl font-bold mb-4">Nadal potrzebujesz pomocy?</h2>
            <p className="text-white/90 mb-6 max-w-2xl mx-auto">
              Nasz zespół wsparcia jest dostępny 7 dni w tygodniu. 
              Chętnie odpowiemy na wszystkie Twoje pytania!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/kontakt"
                className="inline-flex items-center justify-center gap-2 px-8 py-3 bg-white text-primary font-semibold rounded-xl hover:shadow-lg transition-all"
              >
                <Mail className="w-5 h-5" />
                Napisz do nas
              </Link>
              <a
                href="tel:+48123456789"
                className="inline-flex items-center justify-center gap-2 px-8 py-3 bg-white/20 text-white font-semibold rounded-xl hover:bg-white/30 transition-all"
              >
                <Phone className="w-5 h-5" />
                +48 123 456 789
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default SupportPage;
