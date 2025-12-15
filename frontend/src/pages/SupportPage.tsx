// src/pages/SupportPage.tsx
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  MessageCircle, 
  Mail, 
  Phone,
  HelpCircle,
  FileText,
  Shield,
  Send,
  Clock,
  CheckCircle
} from 'lucide-react';

const SupportPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [formSent, setFormSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    setFormSent(true);
    setFormData({ name: '', email: '', subject: '', message: '' });
    setTimeout(() => setFormSent(false), 5000);
  };

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-4xl mx-auto">
        
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Wsparcie
          </h1>
          <p className="text-gray-600 text-lg">
            Jesteśmy tutaj, aby Ci pomóc
          </p>
        </div>

        {/* Quick Links */}
        <div className="grid md:grid-cols-3 gap-6 mb-10">
          <Link
            to="/faq"
            className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow group"
          >
            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
              <HelpCircle className="w-6 h-6 text-primary" />
            </div>
            <h3 className="font-bold text-gray-900 mb-2">FAQ</h3>
            <p className="text-gray-600 text-sm">
              Znajdź odpowiedzi na najczęstsze pytania
            </p>
          </Link>

          <Link
            to="/regulamin"
            className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow group"
          >
            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
              <FileText className="w-6 h-6 text-primary" />
            </div>
            <h3 className="font-bold text-gray-900 mb-2">Regulamin</h3>
            <p className="text-gray-600 text-sm">
              Zapoznaj się z zasadami korzystania
            </p>
          </Link>

          <Link
            to="/polityka-prywatnosci"
            className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow group"
          >
            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
              <Shield className="w-6 h-6 text-primary" />
            </div>
            <h3 className="font-bold text-gray-900 mb-2">Prywatność</h3>
            <p className="text-gray-600 text-sm">
              Dowiedz się jak chronimy Twoje dane
            </p>
          </Link>
        </div>

        {/* Contact Form */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-2">
            <MessageCircle className="w-6 h-6 text-primary" />
            Napisz do nas
          </h2>
          <p className="text-gray-600 mb-6">
            Masz pytanie lub problem? Wypełnij formularz, a odpowiemy najszybciej jak to możliwe.
          </p>

          {formSent ? (
            <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center">
              <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
              <div className="text-green-600 text-lg font-semibold mb-2">
                Wiadomość wysłana!
              </div>
              <p className="text-green-700">
                Odpowiemy najszybciej jak to możliwe, zwykle w ciągu 24 godzin.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Imię i nazwisko
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="Jan Kowalski"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Adres e-mail
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="jan@example.com"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Temat
                </label>
                <select
                  required
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="">Wybierz temat...</option>
                  <option value="account">Problem z kontem</option>
                  <option value="booking">Pytanie o rezerwację</option>
                  <option value="payment">Płatności i rozliczenia</option>
                  <option value="report">Zgłoszenie problemu</option>
                  <option value="business">Konto firmowe</option>
                  <option value="feedback">Opinia o aplikacji</option>
                  <option value="other">Inne</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Wiadomość
                </label>
                <textarea
                  required
                  rows={5}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                  placeholder="Opisz swój problem lub pytanie..."
                />
              </div>
              <button
                type="submit"
                className="w-full py-4 bg-primary text-white font-semibold rounded-xl hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
              >
                <Send className="w-5 h-5" />
                Wyślij wiadomość
              </button>
            </form>
          )}

          {/* Response time */}
          <div className="mt-6 flex items-center gap-2 text-gray-500 text-sm">
            <Clock className="w-4 h-4" />
            <span>Średni czas odpowiedzi: do 24 godzin</span>
          </div>
        </div>

        {/* Contact Options */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Inne sposoby kontaktu
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            <a
              href="mailto:pomoc@tomyhomeapp.pl"
              className="flex flex-col items-center p-6 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
            >
              <Mail className="w-10 h-10 text-primary mb-3" />
              <span className="font-semibold text-gray-900 mb-1">E-mail</span>
              <span className="text-sm text-gray-600 text-center">pomoc@tomyhomeapp.pl</span>
            </a>
            <a
              href="tel:+48123456789"
              className="flex flex-col items-center p-6 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
            >
              <Phone className="w-10 h-10 text-primary mb-3" />
              <span className="font-semibold text-gray-900 mb-1">Telefon</span>
              <span className="text-sm text-gray-600 text-center">+48 123 456 789</span>
              <span className="text-xs text-gray-400 mt-1">pon-pt 9:00-17:00</span>
            </a>
            <Link
              to="/kontakt"
              className="flex flex-col items-center p-6 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
            >
              <MessageCircle className="w-10 h-10 text-primary mb-3" />
              <span className="font-semibold text-gray-900 mb-1">Kontakt</span>
              <span className="text-sm text-gray-600 text-center">Wszystkie dane kontaktowe</span>
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
};

export default SupportPage;