import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, Search, HelpCircle, User, Briefcase, CreditCard, Shield } from 'lucide-react';

const FAQPage = () => {
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [openQuestion, setOpenQuestion] = useState<number | null>(null);

  const categories = [
    { id: 'all', label: 'Wszystkie', icon: HelpCircle },
    { id: 'client', label: 'Dla klientów', icon: User },
    { id: 'specialist', label: 'Dla specjalistów', icon: Briefcase },
    { id: 'payments', label: 'Płatności', icon: CreditCard },
    { id: 'safety', label: 'Bezpieczeństwo', icon: Shield },
  ];

  const faqs = [
    {
      category: 'client',
      question: 'Jak zarezerwować wizytę u specjalisty?',
      answer: 'Aby zarezerwować wizytę, wyszukaj interesującą Cię usługę lub specjalistę, wybierz odpowiedni termin z kalendarza i potwierdź rezerwację. Otrzymasz powiadomienie email z potwierdzeniem oraz przypomnienie przed wizytą.',
    },
    {
      category: 'client',
      question: 'Czy mogę anulować rezerwację?',
      answer: 'Tak, możesz anulować rezerwację w dowolnym momencie. Zalecamy jednak anulowanie z minimum 24-godzinnym wyprzedzeniem, aby specjalista mógł przyjąć innych klientów. Anulowanie możesz wykonać w zakładce "Moje rezerwacje".',
    },
    {
      category: 'client',
      question: 'Jak działa usługa z dojazdem do domu?',
      answer: 'Specjaliści oferujący usługi mobilne przyjeżdżają do Twojego domu z pełnym wyposażeniem. Przy rezerwacji podajesz swój adres, a specjalista potwierdza możliwość dojazdu. Niektórzy specjaliści mogą doliczyć opłatę za dojazd.',
    },
    {
      category: 'client',
      question: 'Co jeśli nie jestem zadowolony z usługi?',
      answer: 'Twoje zadowolenie jest dla nas najważniejsze. Jeśli usługa nie spełniła Twoich oczekiwań, skontaktuj się z nami przez formularz kontaktowy w ciągu 48 godzin. Rozpatrzymy każdą reklamację indywidualnie.',
    },
    {
      category: 'specialist',
      question: 'Jak zostać specjalistą na platformie?',
      answer: 'Zarejestruj się wybierając opcję "Konto specjalisty", uzupełnij swój profil, dodaj usługi i zdjęcia portfolio. Po weryfikacji Twoje konto zostanie aktywowane i będziesz widoczny dla klientów.',
    },
    {
      category: 'specialist',
      question: 'Ile kosztuje konto specjalisty?',
      answer: 'Rejestracja i podstawowe konto są całkowicie bezpłatne. Pobieramy niewielką prowizję tylko od zrealizowanych rezerwacji. Oferujemy też plany Premium z dodatkowymi funkcjami promocyjnymi.',
    },
    {
      category: 'specialist',
      question: 'Jak ustawić swoje godziny pracy?',
      answer: 'W panelu specjalisty przejdź do sekcji "Godziny pracy". Możesz ustawić godziny dla każdego dnia tygodnia osobno, a także blokować konkretne daty gdy nie pracujesz.',
    },
    {
      category: 'specialist',
      question: 'Jak otrzymuję płatności za usługi?',
      answer: 'Płatności są przetwarzane przez naszą platformę. Po zrealizowanej usłudze środki trafiają na Twoje konto w systemie. Możesz je wypłacić na konto bankowe w dowolnym momencie (minimum 50 zł).',
    },
    {
      category: 'payments',
      question: 'Jakie formy płatności są akceptowane?',
      answer: 'Akceptujemy płatności kartą (Visa, Mastercard), BLIK, szybkie przelewy oraz tradycyjne przelewy bankowe. Niektórzy specjaliści akceptują też płatność gotówką na miejscu.',
    },
    {
      category: 'payments',
      question: 'Kiedy następuje płatność za usługę?',
      answer: 'Płatność jest pobierana po potwierdzeniu rezerwacji przez specjalistę. Środki są blokowane na Twoim koncie i przekazywane specjaliście po wykonaniu usługi.',
    },
    {
      category: 'payments',
      question: 'Czy otrzymam fakturę?',
      answer: 'Tak, po każdej transakcji otrzymasz potwierdzenie płatności na email. Jeśli potrzebujesz faktury VAT, możesz ją wygenerować w panelu użytkownika lub poprosić o nią specjalistę.',
    },
    {
      category: 'safety',
      question: 'Czy specjaliści są weryfikowani?',
      answer: 'Tak, każdy specjalista przechodzi proces weryfikacji tożsamości. Sprawdzamy dokumenty, certyfikaty i doświadczenie. Dodatkowo system opinii pozwala klientom oceniać jakość usług.',
    },
    {
      category: 'safety',
      question: 'Jak chronione są moje dane osobowe?',
      answer: 'Stosujemy najwyższe standardy bezpieczeństwa danych zgodne z RODO. Twoje dane są szyfrowane i nigdy nie są udostępniane osobom trzecim bez Twojej zgody. Więcej w naszej Polityce Prywatności.',
    },
    {
      category: 'safety',
      question: 'Co zrobić w przypadku problemu podczas wizyty?',
      answer: 'W nagłych przypadkach skontaktuj się z nami przez formularz kontaktowy lub telefon. Nasz zespół wsparcia jest dostępny 7 dni w tygodniu i pomoże rozwiązać każdy problem.',
    },
  ];

  const filteredFaqs = faqs.filter(faq => {
    const matchesCategory = activeCategory === 'all' || faq.category === activeCategory;
    const matchesSearch = faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <section className="bg-gradient-to-br from-primary via-secondary to-accent text-white py-20">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h1 className="text-4xl lg:text-5xl font-bold mb-6">Często zadawane pytania</h1>
          <p className="text-xl text-white/90 max-w-3xl mx-auto mb-8">
            Znajdź odpowiedzi na najczęstsze pytania dotyczące naszej platformy.
          </p>
          
          {/* Search */}
          <div className="max-w-xl mx-auto relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Szukaj pytania..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-4 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-white"
            />
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-8 bg-white border-b sticky top-16 z-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-wrap gap-2 justify-center">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  activeCategory === category.id
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <category.icon className="w-4 h-4" />
                {category.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ List */}
      <section className="py-12">
        <div className="max-w-3xl mx-auto px-6">
          {filteredFaqs.length === 0 ? (
            <div className="text-center py-12">
              <HelpCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Brak wyników</h3>
              <p className="text-gray-600">
                Nie znaleziono pytań pasujących do kryteriów. Spróbuj innych słów kluczowych.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredFaqs.map((faq, index) => (
                <div
                  key={index}
                  className="bg-white rounded-2xl shadow-sm overflow-hidden"
                >
                  <button
                    onClick={() => setOpenQuestion(openQuestion === index ? null : index)}
                    className="w-full px-6 py-5 text-left flex items-center justify-between gap-4"
                  >
                    <span className="font-semibold text-gray-900">{faq.question}</span>
                    <ChevronDown
                      className={`w-5 h-5 text-gray-400 transition-transform ${
                        openQuestion === index ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                  {openQuestion === index && (
                    <div className="px-6 pb-5">
                      <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Still have questions */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="bg-gradient-to-r from-primary to-secondary rounded-2xl p-8 lg:p-12 text-white text-center">
            <HelpCircle className="w-12 h-12 mx-auto mb-4 opacity-80" />
            <h2 className="text-2xl font-bold mb-4">Nie znalazłeś odpowiedzi?</h2>
            <p className="text-white/90 mb-6 max-w-2xl mx-auto">
              Nasz zespół wsparcia chętnie odpowie na Twoje pytania. 
              Skontaktuj się z nami!
            </p>
            <Link
              to="/kontakt"
              className="inline-flex items-center gap-2 px-8 py-3 bg-white text-primary font-semibold rounded-xl hover:shadow-lg transition-all"
            >
              Skontaktuj się z nami
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default FAQPage;
