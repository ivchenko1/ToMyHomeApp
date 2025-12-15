// src/pages/PrivacyPage.tsx
import { Link } from 'react-router-dom';

const PrivacyPage = () => {
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg p-8 md:p-12">
        {/* Header */}
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Polityka Prywatności
        </h1>
        <p className="text-gray-500 mb-8">
          Ostatnia aktualizacja: 15 grudnia 2024
        </p>

        {/* Spis treści */}
        <div className="bg-gray-50 rounded-xl p-6 mb-10">
          <h2 className="font-semibold text-gray-900 mb-4">Spis treści</h2>
          <ol className="space-y-2 text-primary">
            <li><button onClick={() => scrollToSection('privacy-1')} className="hover:underline text-left">1. Administrator danych</button></li>
            <li><button onClick={() => scrollToSection('privacy-2')} className="hover:underline text-left">2. Jakie dane zbieramy</button></li>
            <li><button onClick={() => scrollToSection('privacy-3')} className="hover:underline text-left">3. Cele przetwarzania danych</button></li>
            <li><button onClick={() => scrollToSection('privacy-4')} className="hover:underline text-left">4. Podstawy prawne</button></li>
            <li><button onClick={() => scrollToSection('privacy-5')} className="hover:underline text-left">5. Udostępnianie danych</button></li>
            <li><button onClick={() => scrollToSection('privacy-6')} className="hover:underline text-left">6. Okres przechowywania</button></li>
            <li><button onClick={() => scrollToSection('privacy-7')} className="hover:underline text-left">7. Twoje prawa</button></li>
            <li><button onClick={() => scrollToSection('privacy-8')} className="hover:underline text-left">8. Pliki cookies</button></li>
            <li><button onClick={() => scrollToSection('privacy-9')} className="hover:underline text-left">9. Bezpieczeństwo danych</button></li>
            <li><button onClick={() => scrollToSection('privacy-10')} className="hover:underline text-left">10. Kontakt</button></li>
          </ol>
        </div>

        {/* Sekcje */}
        <div className="space-y-10 text-gray-700 leading-relaxed">
          
          {/* Sekcja 1 */}
          <section id="privacy-1">
            <h2 className="text-xl font-bold text-gray-900 mb-4">1. Administrator danych</h2>
            <div className="space-y-3">
              <p>Administratorem Twoich danych osobowych jest:</p>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p><strong>ToMyHomeApp sp. z o.o.</strong></p>
                <p>ul. Przykładowa 123</p>
                <p>00-001 Warszawa</p>
                <p>NIP: 0000000000</p>
                <p>E-mail: dane@tomyhomeapp.pl</p>
              </div>
            </div>
          </section>

          {/* Sekcja 2 */}
          <section id="privacy-2">
            <h2 className="text-xl font-bold text-gray-900 mb-4">2. Jakie dane zbieramy</h2>
            <div className="space-y-3">
              <p>Zbieramy następujące kategorie danych osobowych:</p>
              <p><strong>Dane podawane przez Ciebie:</strong></p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>Imię i nazwisko</li>
                <li>Adres e-mail</li>
                <li>Numer telefonu</li>
                <li>Adres (w przypadku rezerwacji usług)</li>
                <li>Zdjęcie profilowe (opcjonalnie)</li>
              </ul>
              <p><strong>Dane zbierane automatycznie:</strong></p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>Adres IP</li>
                <li>Typ przeglądarki i urządzenia</li>
                <li>Historia przeglądania w Serwisie</li>
                <li>Pliki cookies</li>
              </ul>
            </div>
          </section>

          {/* Sekcja 3 */}
          <section id="privacy-3">
            <h2 className="text-xl font-bold text-gray-900 mb-4">3. Cele przetwarzania danych</h2>
            <div className="space-y-3">
              <p>Twoje dane przetwarzamy w następujących celach:</p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>Świadczenie usług – umożliwienie korzystania z Serwisu i dokonywania rezerwacji</li>
                <li>Komunikacja – odpowiadanie na zapytania i obsługa zgłoszeń</li>
                <li>Marketing – wysyłanie informacji o nowościach i promocjach (za zgodą)</li>
                <li>Analityka – analiza sposobu korzystania z Serwisu w celu jego ulepszania</li>
                <li>Bezpieczeństwo – zapewnienie bezpieczeństwa Serwisu i Użytkowników</li>
              </ul>
            </div>
          </section>

          {/* Sekcja 4 */}
          <section id="privacy-4">
            <h2 className="text-xl font-bold text-gray-900 mb-4">4. Podstawy prawne</h2>
            <div className="space-y-3">
              <p>Przetwarzamy dane na podstawie:</p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li><strong>Art. 6 ust. 1 lit. b RODO</strong> – wykonanie umowy (świadczenie usług)</li>
                <li><strong>Art. 6 ust. 1 lit. a RODO</strong> – Twoja zgoda (marketing, newsletter)</li>
                <li><strong>Art. 6 ust. 1 lit. f RODO</strong> – prawnie uzasadniony interes (analityka, bezpieczeństwo)</li>
                <li><strong>Art. 6 ust. 1 lit. c RODO</strong> – obowiązek prawny (przepisy podatkowe, rachunkowe)</li>
              </ul>
            </div>
          </section>

          {/* Sekcja 5 */}
          <section id="privacy-5">
            <h2 className="text-xl font-bold text-gray-900 mb-4">5. Udostępnianie danych</h2>
            <div className="space-y-3">
              <p>Twoje dane mogą być udostępniane:</p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li><strong>Usługodawcom</strong> – w celu realizacji zarezerwowanych usług</li>
                <li><strong>Dostawcom usług IT</strong> – hosting, poczta e-mail, analityka</li>
                <li><strong>Operatorom płatności</strong> – w przypadku płatności online</li>
                <li><strong>Organom państwowym</strong> – na podstawie przepisów prawa</li>
              </ul>
              <p>Nie sprzedajemy Twoich danych osobowych podmiotom trzecim.</p>
            </div>
          </section>

          {/* Sekcja 6 */}
          <section id="privacy-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">6. Okres przechowywania</h2>
            <div className="space-y-3">
              <p>Dane przechowujemy przez okres:</p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>Dane konta – do momentu usunięcia konta</li>
                <li>Dane rezerwacji – 5 lat od realizacji (przepisy podatkowe)</li>
                <li>Dane marketingowe – do wycofania zgody</li>
                <li>Logi serwera – 12 miesięcy</li>
              </ul>
            </div>
          </section>

          {/* Sekcja 7 */}
          <section id="privacy-7">
            <h2 className="text-xl font-bold text-gray-900 mb-4">7. Twoje prawa</h2>
            <div className="space-y-3">
              <p>Przysługują Ci następujące prawa:</p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li><strong>Dostęp</strong> – prawo do uzyskania informacji o przetwarzaniu danych</li>
                <li><strong>Sprostowanie</strong> – prawo do poprawienia nieprawidłowych danych</li>
                <li><strong>Usunięcie</strong> – prawo do żądania usunięcia danych ("prawo do bycia zapomnianym")</li>
                <li><strong>Ograniczenie</strong> – prawo do ograniczenia przetwarzania</li>
                <li><strong>Przenoszenie</strong> – prawo do otrzymania danych w ustrukturyzowanym formacie</li>
                <li><strong>Sprzeciw</strong> – prawo do sprzeciwu wobec przetwarzania</li>
                <li><strong>Wycofanie zgody</strong> – w dowolnym momencie, bez wpływu na zgodność z prawem wcześniejszego przetwarzania</li>
              </ul>
              <p>Aby skorzystać z tych praw, skontaktuj się z nami: dane@tomyhomeapp.pl</p>
            </div>
          </section>

          {/* Sekcja 8 */}
          <section id="privacy-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">8. Pliki cookies</h2>
            <div className="space-y-3">
              <p>Serwis wykorzystuje pliki cookies w celu:</p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>Zapewnienia prawidłowego działania Serwisu</li>
                <li>Zapamiętania preferencji użytkownika</li>
                <li>Analizy ruchu i sposobu korzystania z Serwisu</li>
                <li>Personalizacji treści i reklam</li>
              </ul>
              <p>Możesz zarządzać plikami cookies w ustawieniach przeglądarki.</p>
            </div>
          </section>

          {/* Sekcja 9 */}
          <section id="privacy-9">
            <h2 className="text-xl font-bold text-gray-900 mb-4">9. Bezpieczeństwo danych</h2>
            <div className="space-y-3">
              <p>Stosujemy odpowiednie środki techniczne i organizacyjne w celu ochrony Twoich danych:</p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>Szyfrowanie połączeń (SSL/TLS)</li>
                <li>Szyfrowanie danych w bazie</li>
                <li>Regularne kopie zapasowe</li>
                <li>Ograniczony dostęp do danych</li>
                <li>Szkolenia pracowników z zakresu ochrony danych</li>
              </ul>
            </div>
          </section>

          {/* Sekcja 10 */}
          <section id="privacy-10">
            <h2 className="text-xl font-bold text-gray-900 mb-4">10. Kontakt</h2>
            <div className="space-y-3">
              <p>W sprawach związanych z ochroną danych osobowych możesz skontaktować się z nami:</p>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p><strong>E-mail:</strong> dane@tomyhomeapp.pl</p>
                <p><strong>Adres:</strong> ToMyHomeApp sp. z o.o., ul. Przykładowa 123, 00-001 Warszawa</p>
              </div>
              <p>Masz również prawo wniesienia skargi do Prezesa Urzędu Ochrony Danych Osobowych (PUODO).</p>
            </div>
          </section>

        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 mt-12 pt-8">
            <p className="text-sm text-gray-500">
                Masz pytania dotyczące prywatności?{' '}
                <Link to="/kontakt" className="text-primary hover:underline">Skontaktuj się z nami</Link>
            </p>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPage;

