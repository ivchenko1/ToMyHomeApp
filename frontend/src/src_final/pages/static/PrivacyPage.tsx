import { Shield, Calendar, Lock, Eye, Database, UserCheck, Mail, Trash2 } from 'lucide-react';

const PrivacyPage = () => {
  const lastUpdated = '1 grudnia 2024';

  const highlights = [
    { icon: Lock, title: 'Szyfrowanie', description: 'Wszystkie dane są szyfrowane SSL/TLS' },
    { icon: Eye, title: 'Transparentność', description: 'Jasno informujemy o przetwarzaniu danych' },
    { icon: Database, title: 'Minimalizacja', description: 'Zbieramy tylko niezbędne dane' },
    { icon: UserCheck, title: 'Twoje prawa', description: 'Pełna kontrola nad swoimi danymi' },
  ];

  const sections = [
    {
      title: '1. Administrator danych',
      content: `
        <p>Administratorem Twoich danych osobowych jest:</p>
        <p><strong>ToMyHomeApp Sp. z o.o.</strong><br>
        ul. Przykładowa 1<br>
        61-001 Poznań<br>
        NIP: 0000000000<br>
        Email: dane@tomyhomeapp.pl</p>
      `,
    },
    {
      title: '2. Jakie dane zbieramy?',
      content: `
        <p>Zbieramy następujące kategorie danych:</p>
        <ul>
          <li><strong>Dane identyfikacyjne:</strong> imię, nazwisko, adres email, numer telefonu</li>
          <li><strong>Dane adresowe:</strong> adres zamieszkania (dla usług z dojazdem)</li>
          <li><strong>Dane finansowe:</strong> informacje o płatnościach (przetwarzane przez operatorów płatności)</li>
          <li><strong>Dane techniczne:</strong> adres IP, informacje o urządzeniu, pliki cookies</li>
          <li><strong>Dane o aktywności:</strong> historia rezerwacji, preferencje, opinie</li>
        </ul>
      `,
    },
    {
      title: '3. Cele przetwarzania danych',
      content: `
        <p>Twoje dane przetwarzamy w celu:</p>
        <ul>
          <li>Świadczenia usług platformy i realizacji rezerwacji</li>
          <li>Komunikacji z użytkownikami (powiadomienia, przypomnienia)</li>
          <li>Obsługi płatności i rozliczeń</li>
          <li>Zapewnienia bezpieczeństwa platformy</li>
          <li>Analizy i ulepszania usług</li>
          <li>Marketingu bezpośredniego (za zgodą)</li>
          <li>Wypełniania obowiązków prawnych</li>
        </ul>
      `,
    },
    {
      title: '4. Podstawy prawne przetwarzania',
      content: `
        <p>Przetwarzamy dane na podstawie:</p>
        <ul>
          <li><strong>Art. 6 ust. 1 lit. a RODO</strong> - zgoda (np. na marketing)</li>
          <li><strong>Art. 6 ust. 1 lit. b RODO</strong> - wykonanie umowy (realizacja rezerwacji)</li>
          <li><strong>Art. 6 ust. 1 lit. c RODO</strong> - obowiązek prawny (rachunkowość)</li>
          <li><strong>Art. 6 ust. 1 lit. f RODO</strong> - prawnie uzasadniony interes (bezpieczeństwo)</li>
        </ul>
      `,
    },
    {
      title: '5. Udostępnianie danych',
      content: `
        <p>Twoje dane mogą być udostępniane:</p>
        <ul>
          <li><strong>Specjalistom</strong> - w zakresie niezbędnym do realizacji usługi</li>
          <li><strong>Operatorom płatności</strong> - do przetwarzania transakcji</li>
          <li><strong>Dostawcom usług IT</strong> - hosting, analityka (na podstawie umów powierzenia)</li>
          <li><strong>Organom publicznym</strong> - gdy wymagają tego przepisy prawa</li>
        </ul>
        <p>Nie sprzedajemy danych osobowych podmiotom trzecim.</p>
      `,
    },
    {
      title: '6. Okres przechowywania danych',
      content: `
        <p>Dane przechowujemy przez okres:</p>
        <ul>
          <li><strong>Dane konta:</strong> do momentu usunięcia konta + 30 dni</li>
          <li><strong>Historia rezerwacji:</strong> 5 lat (wymogi księgowe)</li>
          <li><strong>Dane marketingowe:</strong> do cofnięcia zgody</li>
          <li><strong>Logi systemowe:</strong> 12 miesięcy</li>
          <li><strong>Cookies:</strong> zgodnie z ustawieniami przeglądarki</li>
        </ul>
      `,
    },
    {
      title: '7. Twoje prawa',
      content: `
        <p>Przysługują Ci następujące prawa:</p>
        <ul>
          <li><strong>Prawo dostępu</strong> - możesz uzyskać informacje o przetwarzanych danych</li>
          <li><strong>Prawo do sprostowania</strong> - możesz poprawić nieprawidłowe dane</li>
          <li><strong>Prawo do usunięcia</strong> - możesz żądać usunięcia danych ("prawo do bycia zapomnianym")</li>
          <li><strong>Prawo do ograniczenia</strong> - możesz ograniczyć przetwarzanie</li>
          <li><strong>Prawo do przenoszenia</strong> - możesz otrzymać dane w formacie elektronicznym</li>
          <li><strong>Prawo do sprzeciwu</strong> - możesz sprzeciwić się przetwarzaniu</li>
          <li><strong>Prawo do cofnięcia zgody</strong> - w dowolnym momencie</li>
        </ul>
        <p>Aby skorzystać z tych praw, skontaktuj się z nami: dane@tomyhomeapp.pl</p>
      `,
    },
    {
      title: '8. Pliki cookies',
      content: `
        <p>Używamy plików cookies do:</p>
        <ul>
          <li><strong>Niezbędne:</strong> funkcjonowanie strony, logowanie, bezpieczeństwo</li>
          <li><strong>Analityczne:</strong> analiza ruchu, ulepszanie usług (Google Analytics)</li>
          <li><strong>Marketingowe:</strong> personalizacja reklam (za zgodą)</li>
        </ul>
        <p>Możesz zarządzać cookies w ustawieniach przeglądarki.</p>
      `,
    },
    {
      title: '9. Bezpieczeństwo danych',
      content: `
        <p>Stosujemy następujące zabezpieczenia:</p>
        <ul>
          <li>Szyfrowanie SSL/TLS wszystkich połączeń</li>
          <li>Hashowanie haseł (bcrypt)</li>
          <li>Regularne kopie zapasowe</li>
          <li>Kontrola dostępu do danych</li>
          <li>Monitoring bezpieczeństwa 24/7</li>
          <li>Regularne audyty bezpieczeństwa</li>
        </ul>
      `,
    },
    {
      title: '10. Zmiany polityki',
      content: `
        <p>Zastrzegamy sobie prawo do aktualizacji niniejszej Polityki Prywatności.</p>
        <p>O istotnych zmianach poinformujemy użytkowników drogą elektroniczną z 14-dniowym wyprzedzeniem.</p>
        <p>Aktualna wersja jest zawsze dostępna na tej stronie.</p>
      `,
    },
    {
      title: '11. Kontakt',
      content: `
        <p>W sprawach związanych z ochroną danych osobowych możesz skontaktować się z nami:</p>
        <p><strong>Email:</strong> dane@tomyhomeapp.pl<br>
        <strong>Adres:</strong> ToMyHomeApp Sp. z o.o., ul. Przykładowa 1, 61-001 Poznań</p>
        <p>Masz również prawo wnieść skargę do Prezesa Urzędu Ochrony Danych Osobowych.</p>
      `,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <section className="bg-gradient-to-br from-primary via-secondary to-accent text-white py-20">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h1 className="text-4xl lg:text-5xl font-bold mb-6">Polityka Prywatności</h1>
          <p className="text-xl text-white/90 max-w-3xl mx-auto">
            Twoje dane są dla nas ważne. Dowiedz się, jak je chronimy.
          </p>
        </div>
      </section>

      {/* Highlights */}
      <section className="py-12 -mt-8">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {highlights.map((item, index) => (
              <div key={index} className="bg-white p-6 rounded-2xl shadow-sm text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <item.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-bold text-gray-900 mb-1">{item.title}</h3>
                <p className="text-gray-600 text-sm">{item.description}</p>
              </div>
            ))}
          </div>
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
                  <Shield className="w-5 h-5 text-primary" />
                  {section.title}
                </h2>
                <div
                  className="prose prose-gray max-w-none text-gray-600 [&>ul]:list-disc [&>ul]:pl-5 [&>ul]:space-y-1"
                  dangerouslySetInnerHTML={{ __html: section.content }}
                />
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="mt-8 grid md:grid-cols-2 gap-4">
            <a
              href="mailto:dane@tomyhomeapp.pl"
              className="bg-white rounded-2xl p-6 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow"
            >
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                <Mail className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">Masz pytania?</p>
                <p className="text-sm text-gray-600">Napisz do nas: dane@tomyhomeapp.pl</p>
              </div>
            </a>
            <a
              href="/profil"
              className="bg-white rounded-2xl p-6 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow"
            >
              <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                <Trash2 className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">Usuń swoje dane</p>
                <p className="text-sm text-gray-600">Zarządzaj w ustawieniach konta</p>
              </div>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default PrivacyPage;
