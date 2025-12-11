import { Link } from 'react-router-dom';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    services: [
      { label: 'Fryzjer', to: '/uslugodawcy/fryzjer' },
      { label: 'Manicure', to: '/uslugodawcy/manicure' },
      { label: 'Masaż', to: '/uslugodawcy/masaz' },
      { label: 'Więcej...', to: '/uslugodawcy' },
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
    <footer className="bg-gray-900 text-white pt-16 pb-6" id="contact">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Brand Column */}
          <div>
            <h4 className="text-xl font-bold mb-4">TOMYHOMEAPP</h4>
            <p className="text-gray-400 mb-6 leading-relaxed">
              Twój osobisty asystent usług domowych
            </p>
            <div className="flex gap-3">
              <a
                href="#"
                className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center font-bold transition-all hover:bg-accent hover:-translate-y-1"
              >
                f
              </a>
              <a
                href="#"
                className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center font-bold transition-all hover:bg-accent hover:-translate-y-1"
              >
                ig
              </a>
              <a
                href="#"
                className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center font-bold transition-all hover:bg-accent hover:-translate-y-1"
              >
                tw
              </a>
            </div>
          </div>

          {/* Services Column */}
          <div>
            <h5 className="text-sm font-bold uppercase tracking-wider text-gray-400 mb-5">
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
            <h5 className="text-sm font-bold uppercase tracking-wider text-gray-400 mb-5">
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
            <h5 className="text-sm font-bold uppercase tracking-wider text-gray-400 mb-5">
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

        {/* Bottom Bar */}
        <div className="pt-6 border-t border-white/10 text-center text-gray-500 text-sm">
          <p>© {currentYear} TOMYHOMEAPP. Wszystkie prawa zastrzeżone.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
