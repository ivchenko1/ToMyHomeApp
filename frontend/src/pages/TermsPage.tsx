// src/pages/TermsPage.tsx
import { Link } from 'react-router-dom';

const TermsPage = () => {
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
          Regulamin
        </h1>
        <p className="text-gray-500 mb-8">
          Ostatnia aktualizacja: 15 grudnia 2024
        </p>

        {/* Spis treści */}
        <div className="bg-gray-50 rounded-xl p-6 mb-10">
          <h2 className="font-semibold text-gray-900 mb-4">Spis treści</h2>
          <ol className="space-y-2 text-primary">
            <li><button onClick={() => scrollToSection('section-1')} className="hover:underline text-left">1. Postanowienia ogólne</button></li>
            <li><button onClick={() => scrollToSection('section-2')} className="hover:underline text-left">2. Definicje</button></li>
            <li><button onClick={() => scrollToSection('section-3')} className="hover:underline text-left">3. Zasady korzystania z Serwisu</button></li>
            <li><button onClick={() => scrollToSection('section-4')} className="hover:underline text-left">4. Rejestracja i Konto Użytkownika</button></li>
            <li><button onClick={() => scrollToSection('section-5')} className="hover:underline text-left">5. Usługi dla Klientów</button></li>
            <li><button onClick={() => scrollToSection('section-6')} className="hover:underline text-left">6. Usługi dla Usługodawców</button></li>
            <li><button onClick={() => scrollToSection('section-7')} className="hover:underline text-left">7. Rezerwacje</button></li>
            <li><button onClick={() => scrollToSection('section-8')} className="hover:underline text-left">8. Płatności</button></li>
            <li><button onClick={() => scrollToSection('section-9')} className="hover:underline text-left">9. Odpowiedzialność</button></li>
            <li><button onClick={() => scrollToSection('section-10')} className="hover:underline text-left">10. Reklamacje</button></li>
            <li><button onClick={() => scrollToSection('section-11')} className="hover:underline text-left">11. Ochrona danych osobowych</button></li>
            <li><button onClick={() => scrollToSection('section-12')} className="hover:underline text-left">12. Postanowienia końcowe</button></li>
          </ol>
        </div>

        {/* Sekcje */}
        <div className="space-y-10 text-gray-700 leading-relaxed">
          
          {/* Sekcja 1 */}
          <section id="section-1">
            <h2 className="text-xl font-bold text-gray-900 mb-4">1. Postanowienia ogólne</h2>
            <div className="space-y-3">
              <p>1.1. Niniejszy Regulamin określa zasady korzystania z serwisu internetowego ToMyHomeApp, dostępnego pod adresem tomyhomeapp.pl oraz w aplikacji mobilnej.</p>
              <p>1.2. Właścicielem i operatorem Serwisu jest ToMyHomeApp sp. z o.o. z siedzibą w Warszawie, ul. Przykładowa 123, 00-001 Warszawa, wpisana do rejestru przedsiębiorców KRS pod numerem 0000000000.</p>
              <p>1.3. Korzystanie z Serwisu oznacza akceptację niniejszego Regulaminu.</p>
              <p>1.4. Serwis umożliwia Klientom wyszukiwanie i rezerwowanie usług beauty oraz wellness świadczonych przez Usługodawców z dojazdem do domu Klienta.</p>
            </div>
          </section>

          {/* Sekcja 2 */}
          <section id="section-2">
            <h2 className="text-xl font-bold text-gray-900 mb-4">2. Definicje</h2>
            <div className="space-y-3">
              <p><strong>Serwis</strong> – platforma internetowa ToMyHomeApp dostępna pod adresem tomyhomeapp.pl oraz w aplikacji mobilnej.</p>
              <p><strong>Użytkownik</strong> – każda osoba korzystająca z Serwisu.</p>
              <p><strong>Klient</strong> – Użytkownik, który korzysta z Serwisu w celu wyszukiwania i rezerwowania Usług.</p>
              <p><strong>Usługodawca</strong> – podmiot świadczący usługi beauty i wellness, który zarejestrował się w Serwisie w celu prezentacji swojej oferty.</p>
              <p><strong>Usługa</strong> – usługa beauty lub wellness świadczona przez Usługodawcę z dojazdem do Klienta.</p>
              <p><strong>Rezerwacja</strong> – zgłoszenie przez Klienta chęci skorzystania z Usługi w określonym terminie.</p>
              <p><strong>Konto</strong> – indywidualny profil Użytkownika w Serwisie.</p>
            </div>
          </section>

          {/* Sekcja 3 */}
          <section id="section-3">
            <h2 className="text-xl font-bold text-gray-900 mb-4">3. Zasady korzystania z Serwisu</h2>
            <div className="space-y-3">
              <p>3.1. Korzystanie z Serwisu jest bezpłatne dla Klientów.</p>
              <p>3.2. Użytkownik zobowiązany jest do:</p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>podawania prawdziwych danych osobowych,</li>
                <li>przestrzegania przepisów prawa oraz postanowień Regulaminu,</li>
                <li>nienaruszania praw osób trzecich,</li>
                <li>niepodejmowania działań mogących zakłócić funkcjonowanie Serwisu.</li>
              </ul>
              <p>3.3. Zabrania się wykorzystywania Serwisu do celów niezgodnych z prawem lub Regulaminem.</p>
            </div>
          </section>

          {/* Sekcja 4 */}
          <section id="section-4">
            <h2 className="text-xl font-bold text-gray-900 mb-4">4. Rejestracja i Konto Użytkownika</h2>
            <div className="space-y-3">
              <p>4.1. Rejestracja w Serwisie jest dobrowolna i bezpłatna.</p>
              <p>4.2. Do dokonania Rezerwacji wymagane jest posiadanie Konta.</p>
              <p>4.3. Podczas rejestracji Użytkownik podaje:</p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>imię i nazwisko,</li>
                <li>adres e-mail,</li>
                <li>numer telefonu,</li>
                <li>hasło.</li>
              </ul>
              <p>4.4. Użytkownik odpowiada za zachowanie poufności danych do logowania.</p>
              <p>4.5. Użytkownik może w każdej chwili usunąć swoje Konto.</p>
            </div>
          </section>

          {/* Sekcja 5 */}
          <section id="section-5">
            <h2 className="text-xl font-bold text-gray-900 mb-4">5. Usługi dla Klientów</h2>
            <div className="space-y-3">
              <p>5.1. Klient może przeglądać profile Usługodawców, ich ofertę oraz opinie innych Klientów.</p>
              <p>5.2. Klient może dokonać Rezerwacji wybranej Usługi poprzez Serwis.</p>
              <p>5.3. Klient może kontaktować się z Usługodawcą za pośrednictwem wbudowanego komunikatora.</p>
              <p>5.4. Po wykonaniu Usługi Klient może wystawić opinię i ocenę Usługodawcy.</p>
            </div>
          </section>

          {/* Sekcja 6 */}
          <section id="section-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">6. Usługi dla Usługodawców</h2>
            <div className="space-y-3">
              <p>6.1. Usługodawca może utworzyć profil prezentujący swoją działalność i ofertę.</p>
              <p>6.2. Usługodawca zobowiązany jest do:</p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>podawania prawdziwych informacji o sobie i oferowanych Usługach,</li>
                <li>posiadania odpowiednich kwalifikacji i uprawnień,</li>
                <li>realizowania przyjętych Rezerwacji,</li>
                <li>przestrzegania standardów jakości i bezpieczeństwa.</li>
              </ul>
              <p>6.3. ToMyHomeApp może weryfikować Usługodawców i odmawiać lub cofać dostęp do Serwisu.</p>
            </div>
          </section>

          {/* Sekcja 7 */}
          <section id="section-7">
            <h2 className="text-xl font-bold text-gray-900 mb-4">7. Rezerwacje</h2>
            <div className="space-y-3">
              <p>7.1. Rezerwacja zostaje dokonana po wybraniu Usługi, terminu i potwierdzeniu przez Klienta.</p>
              <p>7.2. Usługodawca może potwierdzić lub odrzucić Rezerwację.</p>
              <p>7.3. Klient może anulować Rezerwację zgodnie z polityką anulowania danego Usługodawcy.</p>
              <p>7.4. ToMyHomeApp nie jest stroną umowy między Klientem a Usługodawcą.</p>
            </div>
          </section>

          {/* Sekcja 8 */}
          <section id="section-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">8. Płatności</h2>
            <div className="space-y-3">
              <p>8.1. Płatność za Usługi dokonywana jest bezpośrednio między Klientem a Usługodawcą.</p>
              <p>8.2. Metody płatności (gotówka, karta, przelew) ustalane są indywidualnie z Usługodawcą.</p>
              <p>8.3. Ceny Usług podawane są w złotych polskich (PLN) i zawierają podatek VAT.</p>
            </div>
          </section>

          {/* Sekcja 9 */}
          <section id="section-9">
            <h2 className="text-xl font-bold text-gray-900 mb-4">9. Odpowiedzialność</h2>
            <div className="space-y-3">
              <p>9.1. ToMyHomeApp nie ponosi odpowiedzialności za jakość Usług świadczonych przez Usługodawców.</p>
              <p>9.2. ToMyHomeApp nie ponosi odpowiedzialności za szkody wynikłe z niewykonania lub nienależytego wykonania Usług przez Usługodawców.</p>
              <p>9.3. ToMyHomeApp dokłada starań, aby Serwis działał nieprzerwanie, jednak nie gwarantuje jego ciągłej dostępności.</p>
            </div>
          </section>

          {/* Sekcja 10 */}
          <section id="section-10">
            <h2 className="text-xl font-bold text-gray-900 mb-4">10. Reklamacje</h2>
            <div className="space-y-3">
              <p>10.1. Reklamacje dotyczące funkcjonowania Serwisu można składać na adres: pomoc@tomyhomeapp.pl</p>
              <p>10.2. Reklamacja powinna zawierać opis problemu oraz dane kontaktowe.</p>
              <p>10.3. Reklamacje rozpatrywane są w terminie 14 dni roboczych.</p>
              <p>10.4. Reklamacje dotyczące jakości Usług należy kierować bezpośrednio do Usługodawcy.</p>
            </div>
          </section>

          {/* Sekcja 11 */}
          <section id="section-11">
            <h2 className="text-xl font-bold text-gray-900 mb-4">11. Ochrona danych osobowych</h2>
            <div className="space-y-3">
              <p>11.1. Administratorem danych osobowych jest ToMyHomeApp sp. z o.o.</p>
              <p>11.2. Dane osobowe przetwarzane są zgodnie z RODO oraz ustawą o ochronie danych osobowych.</p>
              <p>11.3. Szczegółowe informacje zawiera <a href="/polityka-prywatnosci" className="text-primary hover:underline">Polityka Prywatności</a>.</p>
            </div>
          </section>

          {/* Sekcja 12 */}
          <section id="section-12">
            <h2 className="text-xl font-bold text-gray-900 mb-4">12. Postanowienia końcowe</h2>
            <div className="space-y-3">
              <p>12.1. ToMyHomeApp zastrzega sobie prawo do zmiany Regulaminu.</p>
              <p>12.2. O zmianach Użytkownicy zostaną powiadomieni drogą elektroniczną.</p>
              <p>12.3. W sprawach nieuregulowanych Regulaminem zastosowanie mają przepisy prawa polskiego.</p>
              <p>12.4. Spory rozstrzygane będą przez sąd właściwy dla siedziby ToMyHomeApp sp. z o.o.</p>
              <p>12.5. Regulamin wchodzi w życie z dniem 15 grudnia 2024 roku.</p>
            </div>
          </section>

        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 mt-12 pt-8">
             <p className="text-sm text-gray-500">
                 Masz pytania dotyczące regulaminu?{' '}
                  <Link to="/kontakt" className="text-primary hover:underline">Skontaktuj się z nami</Link>
             </p>
        </div>
      </div>
    </div>
  );
};

export default TermsPage;