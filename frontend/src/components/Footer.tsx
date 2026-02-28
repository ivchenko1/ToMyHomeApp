import { Link } from 'react-router-dom';
import { Facebook, Instagram, Twitter, Mail, Phone, MapPin, Heart } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    services: [
      { label: 'Fryzjer', to: '/uslugodawcy/fryzjer' },
      { label: 'Manicure', to: '/uslugodawcy/paznokcie' },
      { label: 'Masaż', to: '/uslugodawcy/masaz' },
      { label: 'Kosmetyka', to: '/uslugodawcy/kosmetyka' },
      { label: 'Wszystkie usługi', to: '/uslugodawcy' },
    ],
    company: [
      { label: 'O nas', to: '/o-nas' },
      { label: 'Kariera', to: '/kariera' },
      { label: 'Blog', to: '/blog' },
      { label: 'Kontakt', to: '/kontakt' },
    ],
    help: [
      { label: 'FAQ', to: '/faq' },
      { label: 'Regulamin', to: '/regulamin' },
      { label: 'Polityka prywatności', to: '/prywatnosc' },
      { label: 'Wsparcie', to: '/wsparcie' },
    ],
  };

  return (
    <footer className="bg-gray-900 text-white" id="contact">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-6 pt-16 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-12">
          
          {/* Brand Column */}
          <div className="md:col-span-2 lg:col-span-1">
            <Link to="/" className="inline-block mb-4">
              <h4 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                TOMYHOMEAPP
              </h4>
            </Link>
            <p className="text-gray-400 mb-6 leading-relaxed">
              Profesjonalne usługi beauty i wellness w zaciszu Twojego domu. 
              Znajdź idealnego specjalistę w kilka sekund.
            </p>
            
            {/* Contact Info */}
            <div className="space-y-3 mb-6">
              <a href="mailto:kontakt@tomyhomeapp.pl" className="flex items-center gap-3 text-gray-400 hover:text-white transition-colors">
                <Mail className="w-4 h-4" />
                <span>kontakt@tomyhomeapp.pl</span>
              </a>
              <a href="tel:+48123456789" className="flex items-center gap-3 text-gray-400 hover:text-white transition-colors">
                <Phone className="w-4 h-4" />
                <span>+48 123 456 789</span>
              </a>
              <div className="flex items-center gap-3 text-gray-400">
                <MapPin className="w-4 h-4" />
                <span>Poznań, Polska</span>
              </div>
            </div>

            {/* Social Links */}
            <div className="flex gap-3">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center transition-all hover:bg-primary hover:-translate-y-1"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center transition-all hover:bg-gradient-to-r hover:from-purple-500 hover:to-pink-500 hover:-translate-y-1"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center transition-all hover:bg-blue-400 hover:-translate-y-1"
              >
                <Twitter className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Services Column */}
          <div>
            <h5 className="text-sm font-bold uppercase tracking-wider text-white mb-5">
              Usługi
            </h5>
            <ul className="space-y-3">
              {footerLinks.services.map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="text-gray-400 hover:text-white transition-all hover:translate-x-1 inline-block"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Column */}
          <div>
            <h5 className="text-sm font-bold uppercase tracking-wider text-white mb-5">
              Firma
            </h5>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="text-gray-400 hover:text-white transition-all hover:translate-x-1 inline-block"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Help Column */}
          <div>
            <h5 className="text-sm font-bold uppercase tracking-wider text-white mb-5">
              Pomoc
            </h5>
            <ul className="space-y-3">
              {footerLinks.help.map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="text-gray-400 hover:text-white transition-all hover:translate-x-1 inline-block"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
            
          </div>
        </div>
      </div>

      {/* Newsletter Section - Wkrótce dostępne */}
      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 opacity-50">
            <div>
              <h5 className="text-lg font-bold mb-1 text-gray-400">Zapisz się do newslettera</h5>
              <p className="text-gray-500 text-sm">Otrzymuj informacje o promocjach i nowościach</p>
            </div>
            <div className="flex w-full md:w-auto gap-2">
              <input
                type="email"
                placeholder="Twój email..."
                disabled
                className="flex-1 md:w-64 px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-gray-500 placeholder-gray-600 cursor-not-allowed"
              />
              <button 
                disabled
                className="px-6 py-2.5 bg-gray-700 text-gray-400 font-semibold rounded-xl cursor-not-allowed"
              >
                Zapisz się
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-gray-500">
            <p>© {currentYear} TOMYHOMEAPP. Wszystkie prawa zastrzeżone.</p>
            <p className="flex items-center gap-1">
              Stworzone z <Heart className="w-4 h-4 text-red-500 fill-red-500" /> w Poznaniu
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
