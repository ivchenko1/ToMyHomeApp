// src/pages/ContactPage.tsx
import { Mail, Phone } from 'lucide-react';

const ContactPage = () => {
  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Skontaktuj się z nami
        </h1>
        <p className="text-gray-600 mb-10">
          Masz pytanie lub problem? Skontaktuj się z naszym biurem obsługi klienta.
        </p>

        {/* Obsługa klienta */}
        <div className="border-t border-gray-200 py-6">
          <h2 className="text-sm font-semibold text-gray-900 mb-3">
            Obsługa klienta
          </h2>
          <a 
            href="mailto:pomoc@tomyhomeapp.pl" 
            className="flex items-center gap-3 text-primary hover:underline"
          >
            <Mail className="w-5 h-5 text-gray-400" />
            pomoc@tomyhomeapp.pl
          </a>
        </div>

        {/* Sprzedaż */}
        <div className="border-t border-gray-200 py-6">
          <h2 className="text-sm font-semibold text-gray-900 mb-3">
            Sprzedaż
          </h2>
          <div className="space-y-3">
            <a 
              href="mailto:sprzedaz@tomyhomeapp.pl" 
              className="flex items-center gap-3 text-primary hover:underline"
            >
              <Mail className="w-5 h-5 text-gray-400" />
              sprzedaz@tomyhomeapp.pl
            </a>
            <a 
              href="tel:+48123456789" 
              className="flex items-center gap-3 text-gray-700 hover:text-primary"
            >
              <Phone className="w-5 h-5 text-gray-400" />
              +48 123 456 789
            </a>
          </div>
        </div>

        {/* Współpraca */}
        <div className="border-t border-gray-200 py-6">
          <h2 className="text-sm font-semibold text-gray-900 mb-3">
            Współpraca
          </h2>
          <a 
            href="mailto:wspolpraca@tomyhomeapp.pl" 
            className="flex items-center gap-3 text-primary hover:underline"
          >
            <Mail className="w-5 h-5 text-gray-400" />
            wspolpraca@tomyhomeapp.pl
          </a>
        </div>

        {/* RODO */}
        <div className="border-t border-gray-200 pt-8 mt-4">
          <p className="text-sm text-gray-500 leading-relaxed">
            Administratorem Twoich danych osobowych jest ToMyHomeApp sp. z o.o. 
            Twoje dane osobowe będą przetwarzane w celu odpowiedzi na Twoją wiadomość 
            i komunikacji z Tobą. Szczegółowe informacje dotyczące przetwarzania Twoich 
            danych osobowych znajdziesz w{' '}
            <a href="/polityka-prywatnosci" className="text-primary hover:underline">
              informacji o sposobie przetwarzania danych osobowych
            </a>.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;