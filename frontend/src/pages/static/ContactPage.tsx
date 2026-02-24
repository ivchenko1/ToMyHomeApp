import { useState } from 'react';
import { Mail, Phone, MapPin, Clock, Send, MessageSquare, Headphones, Building } from 'lucide-react';
import ticketService, { TicketSubject } from '../../services/ticketService';
import { useAuth, useToast } from '../../App';

const ContactPage = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '' as TicketSubject | '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.subject) {
      showToast('Wybierz temat wiadomości', 'error');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      await ticketService.create({
        name: formData.name,
        email: formData.email,
        subject: formData.subject as TicketSubject,
        message: formData.message,
        userId: user?.id,
      });
      
      setIsSubmitted(true);
      setFormData({ name: '', email: '', subject: '', message: '' });
      showToast('Wiadomość wysłana! Odpowiemy najszybciej jak to możliwe.', 'success');
    } catch (error) {
      console.error('Error sending message:', error);
      showToast('Błąd wysyłania wiadomości. Spróbuj ponownie.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const contactInfo = [
    {
      icon: Mail,
      title: 'Email',
      value: 'kontakt@tomyhomeapp.pl',
      link: 'mailto:kontakt@tomyhomeapp.pl',
    },
    {
      icon: Phone,
      title: 'Telefon',
      value: '+48 123 456 789',
      link: 'tel:+48123456789',
    },
    {
      icon: MapPin,
      title: 'Adres',
      value: 'ul. Przykładowa 1, 61-001 Poznań',
      link: 'https://maps.google.com',
    },
    {
      icon: Clock,
      title: 'Godziny pracy',
      value: 'Pn-Pt: 9:00 - 17:00',
      link: null,
    },
  ];

  const departments = [
    {
      icon: Headphones,
      title: 'Obsługa klienta',
      description: 'Pomoc z rezerwacjami i kontem',
      email: 'pomoc@tomyhomeapp.pl',
    },
    {
      icon: Building,
      title: 'Dla specjalistów',
      description: 'Pytania dotyczące współpracy',
      email: 'specjalisci@tomyhomeapp.pl',
    },
    {
      icon: MessageSquare,
      title: 'Media i PR',
      description: 'Zapytania prasowe i współprace',
      email: 'media@tomyhomeapp.pl',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <section className="bg-gradient-to-br from-primary via-secondary to-accent text-white py-20">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h1 className="text-4xl lg:text-5xl font-bold mb-6">Kontakt</h1>
          <p className="text-xl text-white/90 max-w-3xl mx-auto">
            Masz pytania? Chętnie pomożemy! Skontaktuj się z nami 
            w dogodny dla Ciebie sposób.
          </p>
        </div>
      </section>

      {/* Contact Info Cards */}
      <section className="py-12 -mt-8">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {contactInfo.map((item, index) => (
              <a
                key={index}
                href={item.link || '#'}
                className={`bg-white p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow ${
                  item.link ? 'cursor-pointer' : 'cursor-default'
                }`}
              >
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                  <item.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">{item.title}</h3>
                <p className="text-gray-600">{item.value}</p>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div className="bg-white p-8 rounded-2xl shadow-sm">
              <h2 className="text-2xl font-bold mb-6">Wyślij wiadomość</h2>
              
              {isSubmitted ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Send className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Wiadomość wysłana!</h3>
                  <p className="text-gray-600 mb-6">
                    Dziękujemy za kontakt. Odpowiemy najszybciej jak to możliwe.
                  </p>
                  <button
                    onClick={() => setIsSubmitted(false)}
                    className="text-primary font-semibold hover:underline"
                  >
                    Wyślij kolejną wiadomość
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Imię i nazwisko
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary focus:ring-0"
                        placeholder="Jan Kowalski"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email
                      </label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary focus:ring-0"
                        placeholder="jan@example.com"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Temat
                    </label>
                    <select
                      required
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value as TicketSubject })}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary focus:ring-0"
                    >
                      <option value="">Wybierz temat</option>
                      <option value="general">Pytanie ogólne</option>
                      <option value="booking">Problem z rezerwacją</option>
                      <option value="account">Problem z kontem</option>
                      <option value="specialist">Chcę zostać specjalistą</option>
                      <option value="partnership">Współpraca biznesowa</option>
                      <option value="complaint">Reklamacja</option>
                      <option value="other">Inne</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Wiadomość
                    </label>
                    <textarea
                      required
                      rows={5}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary focus:ring-0 resize-none"
                      placeholder="Opisz swoje pytanie lub problem..."
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3 bg-gradient-to-r from-primary to-secondary text-white font-semibold rounded-xl hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      'Wysyłanie...'
                    ) : (
                      <>
                        <Send className="w-5 h-5" />
                        Wyślij wiadomość
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>

            {/* Departments */}
            <div>
              <h2 className="text-2xl font-bold mb-6">Działy</h2>
              <div className="space-y-4 mb-8">
                {departments.map((dept, index) => (
                  <div key={index} className="bg-white p-6 rounded-2xl shadow-sm">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                        <dept.icon className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900">{dept.title}</h3>
                        <p className="text-gray-600 text-sm mb-2">{dept.description}</p>
                        <a
                          href={`mailto:${dept.email}`}
                          className="text-primary font-medium hover:underline"
                        >
                          {dept.email}
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Map */}
              <div className="bg-white p-6 rounded-2xl shadow-sm">
                <h3 className="font-bold text-gray-900 mb-4">Nasza lokalizacja</h3>
                <div className="h-64 bg-gray-100 rounded-xl overflow-hidden">
                  <iframe
                    title="Lokalizacja"
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    loading="lazy"
                    src="https://www.openstreetmap.org/export/embed.html?bbox=16.90%2C52.40%2C16.95%2C52.42&layer=mapnik"
                  />
                </div>
                <p className="text-sm text-gray-500 mt-3">
                  ul. Przykładowa 1, 61-001 Poznań
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ContactPage;
