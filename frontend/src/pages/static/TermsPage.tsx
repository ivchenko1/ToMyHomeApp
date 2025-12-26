import { FileText, Calendar } from 'lucide-react';

const TermsPage = () => {
  const lastUpdated = '1 grudnia 2024';

  const sections = [
    {
      title: '1. Postanowienia ogólne',
      content: `
        <p>1.1. Niniejszy Regulamin określa zasady korzystania z platformy ToMyHomeApp, dostępnej pod adresem tomyhomeapp.pl.</p>
        <p>1.2. Właścicielem i operatorem platformy jest ToMyHomeApp Sp. z o.o. z siedzibą w Poznaniu, ul. Przykładowa 1, 61-001 Poznań, wpisana do rejestru przedsiębiorców KRS pod numerem 0000000000.</p>
        <p>1.3. Korzystanie z platformy oznacza akceptację niniejszego Regulaminu.</p>
        <p>1.4. Platforma umożliwia łączenie Klientów ze Specjalistami świadczącymi usługi z zakresu beauty i wellness.</p>
      `,
    },
    {
      title: '2. Definicje',
      content: `
        <p><strong>Platforma</strong> - serwis internetowy ToMyHomeApp umożliwiający rezerwację usług.</p>
        <p><strong>Klient</strong> - osoba fizyczna korzystająca z Platformy w celu rezerwacji usług.</p>
        <p><strong>Specjalista</strong> - osoba fizyczna lub prawna oferująca swoje usługi za pośrednictwem Platformy.</p>
        <p><strong>Usługa</strong> - świadczenie oferowane przez Specjalistę za pośrednictwem Platformy.</p>
        <p><strong>Rezerwacja</strong> - umowa o świadczenie Usługi zawarta między Klientem a Specjalistą.</p>
        <p><strong>Konto</strong> - indywidualne konto użytkownika na Platformie.</p>
      `,
    },
    {
      title: '3. Rejestracja i Konto',
      content: `
        <p>3.1. Korzystanie z pełnej funkcjonalności Platformy wymaga utworzenia Konta.</p>
        <p>3.2. Rejestracja jest bezpłatna i wymaga podania prawdziwych danych osobowych.</p>
        <p>3.3. Użytkownik zobowiązuje się do zachowania poufności danych logowania.</p>
        <p>3.4. Jedno Konto może być używane wyłącznie przez jedną osobę.</p>
        <p>3.5. Operator zastrzega sobie prawo do zawieszenia lub usunięcia Konta w przypadku naruszenia Regulaminu.</p>
      `,
    },
    {
      title: '4. Rezerwacje',
      content: `
        <p>4.1. Rezerwacja zostaje dokonana po wyborze Usługi, terminu i potwierdzeniu przez Specjalistę.</p>
        <p>4.2. Klient otrzymuje potwierdzenie Rezerwacji drogą elektroniczną.</p>
        <p>4.3. Anulowanie Rezerwacji jest możliwe zgodnie z polityką anulowania danego Specjalisty.</p>
        <p>4.4. Zalecamy anulowanie z minimum 24-godzinnym wyprzedzeniem.</p>
        <p>4.5. Niestawienie się na umówioną wizytę bez uprzedniego anulowania może skutkować naliczeniem opłaty.</p>
      `,
    },
    {
      title: '5. Płatności',
      content: `
        <p>5.1. Ceny Usług są określane przez Specjalistów i widoczne przy każdej ofercie.</p>
        <p>5.2. Platforma umożliwia płatności online za pośrednictwem zaufanych operatorów płatności.</p>
        <p>5.3. Płatność jest pobierana po potwierdzeniu Rezerwacji przez Specjalistę.</p>
        <p>5.4. W przypadku anulowania Rezerwacji, zwrot środków następuje zgodnie z polityką zwrotów.</p>
        <p>5.5. Platforma pobiera prowizję od Specjalistów za zrealizowane Rezerwacje.</p>
      `,
    },
    {
      title: '6. Obowiązki Specjalistów',
      content: `
        <p>6.1. Specjalista zobowiązuje się do świadczenia Usług zgodnie z opisem i najwyższą starannością.</p>
        <p>6.2. Specjalista ponosi pełną odpowiedzialność za jakość świadczonych Usług.</p>
        <p>6.3. Specjalista zobowiązuje się do posiadania wymaganych kwalifikacji i uprawnień.</p>
        <p>6.4. Specjalista zobowiązuje się do przestrzegania zasad higieny i bezpieczeństwa.</p>
        <p>6.5. Specjalista zobowiązuje się do terminowego realizowania Rezerwacji.</p>
      `,
    },
    {
      title: '7. Obowiązki Klientów',
      content: `
        <p>7.1. Klient zobowiązuje się do podawania prawdziwych danych przy Rezerwacji.</p>
        <p>7.2. Klient zobowiązuje się do terminowego stawiania się na umówione wizyty.</p>
        <p>7.3. Klient zobowiązuje się do informowania o wszelkich przeciwwskazaniach zdrowotnych.</p>
        <p>7.4. Klient zobowiązuje się do traktowania Specjalisty z szacunkiem.</p>
        <p>7.5. Klient zobowiązuje się do terminowej zapłaty za Usługi.</p>
      `,
    },
    {
      title: '8. Odpowiedzialność',
      content: `
        <p>8.1. Platforma pełni rolę pośrednika między Klientem a Specjalistą.</p>
        <p>8.2. Platforma nie ponosi odpowiedzialności za jakość Usług świadczonych przez Specjalistów.</p>
        <p>8.3. Platforma nie ponosi odpowiedzialności za szkody wynikłe z działań Specjalistów.</p>
        <p>8.4. Wszelkie spory między Klientem a Specjalistą powinny być rozwiązywane bezpośrednio między stronami.</p>
        <p>8.5. Platforma może pośredniczyć w rozwiązywaniu sporów na prośbę stron.</p>
      `,
    },
    {
      title: '9. Reklamacje',
      content: `
        <p>9.1. Reklamacje można składać drogą elektroniczną na adres: reklamacje@tomyhomeapp.pl.</p>
        <p>9.2. Reklamacja powinna zawierać opis problemu i dane kontaktowe.</p>
        <p>9.3. Reklamacje są rozpatrywane w terminie 14 dni roboczych.</p>
        <p>9.4. O wyniku rozpatrzenia reklamacji Użytkownik zostanie poinformowany drogą elektroniczną.</p>
      `,
    },
    {
      title: '10. Ochrona danych osobowych',
      content: `
        <p>10.1. Administratorem danych osobowych jest ToMyHomeApp Sp. z o.o.</p>
        <p>10.2. Dane osobowe są przetwarzane zgodnie z RODO i Polityką Prywatności.</p>
        <p>10.3. Użytkownik ma prawo dostępu do swoich danych, ich poprawiania i usunięcia.</p>
        <p>10.4. Szczegółowe informacje znajdują się w Polityce Prywatności.</p>
      `,
    },
    {
      title: '11. Postanowienia końcowe',
      content: `
        <p>11.1. Operator zastrzega sobie prawo do zmiany Regulaminu.</p>
        <p>11.2. O zmianach Użytkownicy zostaną poinformowani z 14-dniowym wyprzedzeniem.</p>
        <p>11.3. W sprawach nieuregulowanych stosuje się przepisy prawa polskiego.</p>
        <p>11.4. Spory będą rozstrzygane przez sąd właściwy dla siedziby Operatora.</p>
        <p>11.5. Regulamin wchodzi w życie z dniem publikacji na Platformie.</p>
      `,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <section className="bg-gradient-to-br from-primary via-secondary to-accent text-white py-20">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h1 className="text-4xl lg:text-5xl font-bold mb-6">Regulamin</h1>
          <p className="text-xl text-white/90 max-w-3xl mx-auto">
            Zasady korzystania z platformy ToMyHomeApp
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="py-12">
        <div className="max-w-4xl mx-auto px-6">
          {/* Last Updated */}
          <div className="bg-white rounded-2xl shadow-sm p-6 mb-8 flex items-center gap-4">
            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
              <Calendar className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Ostatnia aktualizacja</p>
              <p className="font-semibold text-gray-900">{lastUpdated}</p>
            </div>
          </div>

          {/* Sections */}
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            {sections.map((section, index) => (
              <div
                key={index}
                className={`p-6 ${index !== sections.length - 1 ? 'border-b border-gray-100' : ''}`}
              >
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                  <FileText className="w-5 h-5 text-primary" />
                  {section.title}
                </h2>
                <div
                  className="prose prose-gray max-w-none text-gray-600 space-y-2"
                  dangerouslySetInnerHTML={{ __html: section.content }}
                />
              </div>
            ))}
          </div>

          {/* Contact */}
          <div className="mt-8 bg-primary/5 rounded-2xl p-6 text-center">
            <p className="text-gray-600 mb-2">
              Masz pytania dotyczące regulaminu?
            </p>
            <a href="/kontakt" className="text-primary font-semibold hover:underline">
              Skontaktuj się z nami →
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default TermsPage;
