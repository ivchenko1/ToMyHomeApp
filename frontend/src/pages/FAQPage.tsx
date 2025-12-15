// src/pages/FAQPage.tsx
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  ChevronDown, 
  ChevronUp, 
  Search, 
  HelpCircle,
  User,
  Briefcase,
  Calendar,
  CreditCard,
  Shield
} from 'lucide-react';

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQCategory {
  id: string;
  title: string;
  icon: React.ReactNode;
  items: FAQItem[];
}

const FAQPage = () => {
  const [activeTab, setActiveTab] = useState<'client' | 'business'>('client');
  const [openFAQ, setOpenFAQ] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const clientFAQ: FAQCategory[] = [
    {
      id: 'account',
      title: 'Konto i rejestracja',
      icon: <User className="w-5 h-5" />,
      items: [
        {
          question: 'Jak założyć konto w ToMyHomeApp?',
          answer: 'Kliknij przycisk "Zarejestruj się" na stronie głównej. Wypełnij formularz podając imię, nazwisko, e-mail i numer telefonu. Możesz też zarejestrować się przez Google lub Facebook.'
        },
        {
          question: 'Jak zmienić dane w profilu?',
          answer: 'Zaloguj się na swoje konto, przejdź do zakładki "Profil" i kliknij "Ustawienia". Tam możesz edytować swoje dane osobowe, zdjęcie profilowe oraz hasło.'
        },
        {
          question: 'Jak usunąć konto?',
          answer: 'Przejdź do Profil → Ustawienia → Usuń konto. Pamiętaj, że ta operacja jest nieodwracalna i wszystkie Twoje dane zostaną usunięte.'
        },
        {
          question: 'Zapomniałem hasła. Co robić?',
          answer: 'Na stronie logowania kliknij "Zapomniałem hasła". Podaj swój adres e-mail, a wyślemy Ci link do resetowania hasła.'
        }
      ]
    },
    {
      id: 'booking',
      title: 'Rezerwacje',
      icon: <Calendar className="w-5 h-5" />,
      items: [
        {
          question: 'Jak zarezerwować usługę?',
          answer: 'Znajdź usługodawcę w wyszukiwarce, wybierz interesującą Cię usługę, termin i godzinę, a następnie potwierdź rezerwację. Otrzymasz potwierdzenie na e-mail i SMS.'
        },
        {
          question: 'Jak odwołać rezerwację?',
          answer: 'Przejdź do zakładki "Moje rezerwacje", znajdź rezerwację którą chcesz odwołać i kliknij "Odwołaj". Pamiętaj o polityce anulowania danego usługodawcy.'
        },
        {
          question: 'Czy mogę zmienić termin rezerwacji?',
          answer: 'Tak, przejdź do "Moje rezerwacje", wybierz rezerwację i kliknij "Zmień termin". Możesz też skontaktować się bezpośrednio z usługodawcą przez czat.'
        },
        {
          question: 'Usługodawca nie pojawił się. Co robić?',
          answer: 'Skontaktuj się z usługodawcą przez czat lub telefon. Jeśli nie odpowiada, zgłoś problem przez formularz kontaktowy, a my pomożemy rozwiązać sprawę.'
        }
      ]
    },
    {
      id: 'payments',
      title: 'Płatności',
      icon: <CreditCard className="w-5 h-5" />,
      items: [
        {
          question: 'Jakie metody płatności są dostępne?',
          answer: 'Płatności ustalasz bezpośrednio z usługodawcą. Większość akceptuje gotówkę, karty płatnicze oraz przelewy. Sprawdź profil usługodawcy, aby poznać dostępne opcje.'
        },
        {
          question: 'Czy płacę przez aplikację?',
          answer: 'Obecnie płatności odbywają się bezpośrednio między Tobą a usługodawcą. Pracujemy nad wbudowanym systemem płatności online.'
        },
        {
          question: 'Jak uzyskać fakturę?',
          answer: 'O fakturę poproś bezpośrednio usługodawcę przed lub po wykonaniu usługi. Podaj mu swoje dane do faktury.'
        }
      ]
    },
    {
      id: 'safety',
      title: 'Bezpieczeństwo',
      icon: <Shield className="w-5 h-5" />,
      items: [
        {
          question: 'Czy usługodawcy są weryfikowani?',
          answer: 'Tak, weryfikujemy tożsamość usługodawców oraz ich kwalifikacje. Dodatkowo system opinii pozwala sprawdzić doświadczenia innych klientów.'
        },
        {
          question: 'Jak zgłosić nieodpowiednie zachowanie?',
          answer: 'Skontaktuj się z nami przez formularz kontaktowy lub napisz na pomoc@tomyhomeapp.pl. Każde zgłoszenie traktujemy poważnie i podejmujemy odpowiednie działania.'
        },
        {
          question: 'Czy moje dane są bezpieczne?',
          answer: 'Tak, stosujemy najwyższe standardy bezpieczeństwa. Wszystkie dane są szyfrowane, a my nigdy nie udostępniamy ich osobom trzecim bez Twojej zgody.'
        }
      ]
    }
  ];

  const businessFAQ: FAQCategory[] = [
    {
      id: 'registration',
      title: 'Rejestracja i profil',
      icon: <Briefcase className="w-5 h-5" />,
      items: [
        {
          question: 'Jak zostać usługodawcą w ToMyHomeApp?',
          answer: 'Zarejestruj się wybierając opcję "Konto firmowe". Wypełnij profil, dodaj swoje usługi, cennik i dostępność. Po weryfikacji Twój profil będzie widoczny dla klientów.'
        },
        {
          question: 'Ile kosztuje konto usługodawcy?',
          answer: 'Rejestracja i podstawowe konto są bezpłatne. Oferujemy też plany Premium z dodatkowymi funkcjami, takimi jak wyróżnienie w wyszukiwarce czy zaawansowane statystyki.'
        },
        {
          question: 'Jak edytować swój profil i usługi?',
          answer: 'Zaloguj się i przejdź do panelu "Mój biznes". Tam możesz edytować opis, zdjęcia, usługi, cennik oraz godziny pracy.'
        },
        {
          question: 'Jak dodać certyfikaty i kwalifikacje?',
          answer: 'W panelu "Mój biznes" przejdź do sekcji "Certyfikaty". Możesz dodać zdjęcia lub skany swoich certyfikatów, dyplomów i uprawnień.'
        }
      ]
    },
    {
      id: 'bookings',
      title: 'Zarządzanie rezerwacjami',
      icon: <Calendar className="w-5 h-5" />,
      items: [
        {
          question: 'Jak zarządzać kalendarzem?',
          answer: 'W panelu "Mój biznes" przejdź do "Kalendarz". Możesz ustawić dostępne godziny, blokować terminy i zarządzać rezerwacjami.'
        },
        {
          question: 'Jak potwierdzić lub odrzucić rezerwację?',
          answer: 'Nowe rezerwacje pojawiają się w zakładce "Rezerwacje". Kliknij "Potwierdź" lub "Odrzuć" i opcjonalnie dodaj wiadomość dla klienta.'
        },
        {
          question: 'Klient nie pojawił się na wizycie. Co robić?',
          answer: 'Oznacz rezerwację jako "Nieobecność". System automatycznie odnotuje to w profilu klienta. Możesz też wprowadzić politykę przedpłat.'
        }
      ]
    },
    {
      id: 'payments-business',
      title: 'Płatności i rozliczenia',
      icon: <CreditCard className="w-5 h-5" />,
      items: [
        {
          question: 'Czy ToMyHomeApp pobiera prowizję?',
          answer: 'Podstawowe konto jest bezpłatne bez prowizji. Plany Premium mają stałą miesięczną opłatę, ale nadal bez prowizji od rezerwacji.'
        },
        {
          question: 'Jak wystawić fakturę klientowi?',
          answer: 'ToMyHomeApp nie generuje faktur za usługi. Faktury wystawiasz samodzielnie zgodnie z przepisami dla Twojej działalności.'
        }
      ]
    },
    {
      id: 'promotion',
      title: 'Promocja i widoczność',
      icon: <Search className="w-5 h-5" />,
      items: [
        {
          question: 'Jak zwiększyć widoczność mojego profilu?',
          answer: 'Uzupełnij profil w 100%, dodaj profesjonalne zdjęcia, zbieraj pozytywne opinie i odpowiadaj na wiadomości szybko. Możesz też skorzystać z planu Premium.'
        },
        {
          question: 'Jak działają opinie klientów?',
          answer: 'Po każdej wizycie klient może wystawić ocenę i opinię. Odpowiadaj na opinie, szczególnie negatywne — pokazuje to profesjonalizm.'
        },
        {
          question: 'Czy mogę promować swoje usługi?',
          answer: 'Tak, w planie Premium możesz tworzyć promocje i rabaty, które będą widoczne dla klientów w wyszukiwarce.'
        }
      ]
    }
  ];

  const currentFAQ = activeTab === 'client' ? clientFAQ : businessFAQ;

  const filteredFAQ = currentFAQ.map(category => ({
    ...category,
    items: category.items.filter(
      item =>
        item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.answer.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(category => category.items.length > 0);

  const toggleFAQ = (id: string) => {
    setOpenFAQ(openFAQ === id ? null : id);
  };

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-4xl mx-auto">
        
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Często zadawane pytania
          </h1>
          <p className="text-gray-600 text-lg">
            Znajdź odpowiedzi na najczęstsze pytania
          </p>
        </div>

        {/* Search */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Szukaj w FAQ..."
              className="w-full pl-12 pr-4 py-3 bg-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-2xl shadow-lg p-2 mb-8">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('client')}
              className={`flex-1 py-4 px-6 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 ${
                activeTab === 'client'
                  ? 'bg-primary text-white shadow-md'
                  : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
              }`}
            >
              <User className="w-5 h-5" />
              Dla Klientów
            </button>
            <button
              onClick={() => setActiveTab('business')}
              className={`flex-1 py-4 px-6 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 ${
                activeTab === 'business'
                  ? 'bg-primary text-white shadow-md'
                  : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
              }`}
            >
              <Briefcase className="w-5 h-5" />
              Dla Biznesu
            </button>
          </div>
        </div>

        {/* FAQ */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <HelpCircle className="w-6 h-6 text-primary" />
            {activeTab === 'client' ? 'Pytania klientów' : 'Pytania usługodawców'}
          </h2>

          {filteredFAQ.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              Nie znaleziono wyników dla "{searchQuery}"
            </p>
          ) : (
            <div className="space-y-6">
              {filteredFAQ.map((category) => (
                <div key={category.id}>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <span className="text-primary">{category.icon}</span>
                    {category.title}
                  </h3>
                  <div className="space-y-3">
                    {category.items.map((item, index) => {
                      const faqId = `${category.id}-${index}`;
                      const isOpen = openFAQ === faqId;
                      return (
                        <div
                          key={faqId}
                          className="border border-gray-200 rounded-xl overflow-hidden"
                        >
                          <button
                            onClick={() => toggleFAQ(faqId)}
                            className="w-full px-5 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                          >
                            <span className="font-medium text-gray-900">
                              {item.question}
                            </span>
                            {isOpen ? (
                              <ChevronUp className="w-5 h-5 text-primary" />
                            ) : (
                              <ChevronDown className="w-5 h-5 text-gray-400" />
                            )}
                          </button>
                          {isOpen && (
                            <div className="px-5 pb-4 text-gray-600 leading-relaxed border-t border-gray-100 pt-3">
                              {item.answer}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
          <h3 className="text-xl font-bold text-gray-900 mb-3">
            Nie znalazłeś odpowiedzi?
          </h3>
          <p className="text-gray-600 mb-6">
            Skontaktuj się z naszym zespołem wsparcia
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/wsparcie"
              className="px-6 py-3 bg-primary text-white font-semibold rounded-xl hover:bg-primary/90 transition-colors"
            >
              Przejdź do wsparcia
            </Link>
            <Link
              to="/kontakt"
              className="px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors"
            >
              Kontakt
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
};

export default FAQPage;