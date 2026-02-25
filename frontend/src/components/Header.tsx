import { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Bell, MessageSquare, User, LogOut, ChevronDown } from 'lucide-react';
import { useAuth } from '../App';
import notificationService, { Notification } from '../services/notificationService';
import messageService from '../services/messageService';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [showAuthDropdown, setShowAuthDropdown] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const { isAuthenticated, user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  
  // Sprawdź czy użytkownik jest usługodawcą
  const isProvider = user?.accountType === 'provider' || !!user?.businessName;
  
  const authDropdownRef = useRef<HTMLDivElement>(null);
  const userDropdownRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);

  // Real-time powiadomienia z Firebase
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadMessagesCount, setUnreadMessagesCount] = useState(0);

  // Subskrybuj powiadomienia
  useEffect(() => {
    if (!user?.id) {
      setNotifications([]);
      return;
    }
    
    const unsubscribe = notificationService.subscribe(
      user.id,
      (newNotifications) => {
        setNotifications(newNotifications.slice(0, 5)); // Max 5 w dropdown
      }
    );
    
    return () => unsubscribe();
  }, [user?.id]);

  // Subskrybuj nieprzeczytane wiadomości
  useEffect(() => {
    if (!user?.id) {
      setUnreadMessagesCount(0);
      return;
    }
    
    const unsubscribe = messageService.subscribeToUnreadCount(
      user.id,
      (count) => {
        setUnreadMessagesCount(count);
      }
    );
    
    return () => unsubscribe();
  }, [user?.id]);

  const unreadCount = notifications.filter(n => !n.read).length;

  // Formatuj czas
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    
    if (minutes < 1) return 'Teraz';
    if (minutes < 60) return `${minutes} min temu`;
    if (hours < 24) return `${hours}h temu`;
    return date.toLocaleDateString('pl-PL');
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (authDropdownRef.current && !authDropdownRef.current.contains(event.target as Node)) {
        setShowAuthDropdown(false);
      }
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target as Node)) {
        setShowUserDropdown(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navLinks = [
    { to: '/', label: 'Strona Główna' },
    { to: '/#services', label: 'Usługi' },
    { to: '/#how', label: 'Jak to działa' },
    { to: '/#reviews', label: 'Opinie' },
    { to: '/#contact', label: 'Kontakt' },
  ];

  const handleNavClick = (to: string) => {
    setIsMenuOpen(false);
    if (to.startsWith('/#')) {
      const elementId = to.replace('/#', '');
      const element = document.getElementById(elementId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const markAllAsRead = async () => {
    if (!user?.id) return;
    try {
      await notificationService.markAllAsRead(user.id);
    } catch (error) {
      console.error('Error marking notifications as read:', error);
    }
  };

  // Hamburger Icon SVG
  const HamburgerIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="3" y1="12" x2="21" y2="12"></line>
      <line x1="3" y1="6" x2="21" y2="6"></line>
      <line x1="3" y1="18" x2="21" y2="18"></line>
    </svg>
  );

  // Close Icon SVG
  const CloseIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18"></line>
      <line x1="6" y1="6" x2="18" y2="18"></line>
    </svg>
  );

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-white/95 backdrop-blur-xl shadow-lg'
          : 'bg-white/95 backdrop-blur-xl border-b border-gray-100'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6">
        <div className="h-[72px] flex items-center justify-between gap-8">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center gap-3 transition-transform duration-300 hover:scale-105"
          >
            <div className="h-12 w-12 bg-gradient-to-r from-primary to-secondary rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-lg">T</span>
            </div>
            <span className="font-extrabold text-xl gradient-text hidden sm:block">
              TOMYHOMEAPP
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => handleNavClick(link.to)}
                className={`text-gray-600 font-medium text-[15px] relative py-2 transition-colors hover:text-primary
                  after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 
                  after:bg-gradient-to-r after:from-primary after:to-secondary after:transition-all
                  hover:after:w-full ${
                    location.pathname === link.to ? 'text-primary after:w-full' : ''
                  }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden lg:flex items-center gap-3">
            {isAuthenticated ? (
              <>
                {/* Notifications */}
                <div className="relative" ref={notificationsRef}>
                  <button
                    onClick={() => setShowNotifications(!showNotifications)}
                    className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <Bell className="w-5 h-5" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                        {unreadCount > 99 ? '99+' : unreadCount}
                      </span>
                    )}
                  </button>

                  {/* Notifications Dropdown */}
                  {showNotifications && (
                    <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50">
                      <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                        <h3 className="font-bold text-gray-900">Powiadomienia</h3>
                        {unreadCount > 0 && (
                          <button
                            onClick={markAllAsRead}
                            className="text-sm text-primary hover:underline"
                          >
                            Oznacz jako przeczytane
                          </button>
                        )}
                      </div>
                      <div className="max-h-80 overflow-y-auto">
                        {notifications.length === 0 ? (
                          <div className="p-6 text-center text-gray-500">
                            <Bell className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                            <p className="text-sm">Brak powiadomień</p>
                          </div>
                        ) : (
                          notifications.map((notif) => (
                            <div
                              key={notif.id}
                              onClick={async () => {
                                await notificationService.markAsRead(notif.id);
                                setShowNotifications(false);
                                navigate('/powiadomienia');
                              }}
                              className={`p-4 border-b border-gray-50 hover:bg-gray-50 cursor-pointer ${
                                !notif.read ? 'bg-blue-50' : ''
                              }`}
                            >
                              <p className="text-sm font-medium text-gray-900">
                                {notificationService.getIcon(notif.type)} {notif.title}
                              </p>
                              <p className="text-sm text-gray-600 mt-1">{notif.message}</p>
                              <p className="text-xs text-gray-400 mt-1">{formatTime(notif.createdAt)}</p>
                            </div>
                          ))
                        )}
                      </div>
                      <Link
                        to="/powiadomienia"
                        className="block p-3 text-center text-sm text-primary hover:bg-gray-50"
                        onClick={() => setShowNotifications(false)}
                      >
                        Zobacz wszystkie
                      </Link>
                    </div>
                  )}
                </div>

                {/* Messages */}
                <Link
                  to="/wiadomosci"
                  className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <MessageSquare className="w-5 h-5" />
                  {unreadMessagesCount > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 bg-primary text-white text-xs font-bold rounded-full flex items-center justify-center">
                      {unreadMessagesCount > 99 ? '99+' : unreadMessagesCount}
                    </span>
                  )}
                </Link>

                {/* Panel Biznes - tylko dla usługodawców */}
                {isProvider && (
                  <Link
                    to="/biznes"
                    className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all text-sm"
                  >
                    🏪 Panel Biznes
                  </Link>
                )}

                {/* User Dropdown */}
                <div className="relative" ref={userDropdownRef}>
                  <button
                    onClick={() => setShowUserDropdown(!showUserDropdown)}
                    className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded-xl transition-colors"
                  >
                    <div className="w-8 h-8 bg-gradient-to-r from-primary to-secondary rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-sm">
                        {user?.username?.charAt(0).toUpperCase() || 'U'}
                      </span>
                    </div>
                    <span className="text-sm font-medium text-gray-700 hidden xl:block">
                      {user?.username}
                    </span>
                    <ChevronDown className="w-4 h-4 text-gray-500" />
                  </button>

                  {showUserDropdown && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50">
                      <div className="px-4 py-3 border-b border-gray-100">
                        <p className="font-medium text-gray-900">{user?.username}</p>
                        <p className="text-sm text-gray-500">{user?.email}</p>
                      </div>
                      <Link
                        to="/profil"
                        className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-50"
                        onClick={() => setShowUserDropdown(false)}
                      >
                        <User className="w-4 h-4" />
                        Mój profil
                      </Link>
                      <Link
                        to="/wiadomosci"
                        className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-50"
                        onClick={() => setShowUserDropdown(false)}
                      >
                        <MessageSquare className="w-4 h-4" />
                        Wiadomości
                      </Link>
                      <hr className="my-2" />
                      <button
                        onClick={() => {
                          logout();
                          setShowUserDropdown(false);
                          navigate('/');
                        }}
                        className="flex items-center gap-3 px-4 py-2 text-red-600 hover:bg-red-50 w-full text-left"
                      >
                        <LogOut className="w-4 h-4" />
                        Wyloguj się
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              /* Auth Dropdown - Allegro style */
              <div 
                className="relative" 
                ref={authDropdownRef}
                onMouseEnter={() => setShowAuthDropdown(true)}
                onMouseLeave={() => setShowAuthDropdown(false)}
              >
                <button
                  className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-primary transition-colors font-medium"
                >
                  <User className="w-5 h-5" />
                  <span>Moje konto</span>
                  <ChevronDown className={`w-4 h-4 transition-transform ${showAuthDropdown ? 'rotate-180' : ''}`} />
                </button>

                {/* Allegro-style Dropdown */}
                {showAuthDropdown && (
                  <div className="absolute right-0 mt-0 pt-2 z-50">
                    <div className="w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
                      {/* Header with illustration */}
                      <div className="p-6 text-center bg-gradient-to-b from-gray-50 to-white">
                        <div className="flex justify-center gap-4 mb-4">
                          <div className="text-5xl">🔍</div>
                          <div className="text-5xl">💇</div>
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">
                          Witaj w ToMyHomeApp
                        </h3>
                        <p className="text-sm text-gray-500">
                          Zaloguj się, aby zobaczyć swoje rezerwacje, ulubione usługi i powiadomienia.
                        </p>
                      </div>

                      {/* Login Button */}
                      <div className="px-6 pb-4">
                        <Link
                          to="/auth?mode=login"
                          className="block w-full py-3 bg-gradient-to-r from-primary to-secondary text-white text-center rounded-xl font-bold hover:shadow-lg transition-all"
                          onClick={() => setShowAuthDropdown(false)}
                        >
                          ZALOGUJ SIĘ
                        </Link>
                      </div>

                      {/* Divider */}
                      <div className="px-6 pb-4">
                        <p className="text-center text-sm text-gray-500 mb-3">
                          Nie masz jeszcze konta? Załóż teraz.
                        </p>

                        {/* Register options */}
                        <Link
                          to="/auth?mode=register&type=client"
                          className="flex items-center justify-center w-full py-3 mb-2 border-2 border-primary text-primary rounded-xl font-bold hover:bg-primary hover:text-white transition-all"
                          onClick={() => setShowAuthDropdown(false)}
                        >
                          DLA KLIENTA
                        </Link>
                        <Link
                          to="/auth?mode=register&type=provider"
                          className="flex items-center justify-center w-full py-3 border-2 border-emerald-500 text-emerald-600 rounded-xl font-bold hover:bg-emerald-500 hover:text-white transition-all"
                          onClick={() => setShowAuthDropdown(false)}
                        >
                          DLA USŁUGODAWCY
                        </Link>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
            className="lg:hidden flex items-center justify-center"
            style={{
              width: '44px',
              height: '44px',
              backgroundColor: '#ffffff',
              border: '2px solid #e5e7eb',
              borderRadius: '12px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              color: '#374151',
              cursor: 'pointer',
            }}
          >
            {isMenuOpen ? <CloseIcon /> : <HamburgerIcon />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <>
          {/* Overlay */}
          <div 
            className="lg:hidden fixed inset-0 bg-black/50 z-40"
            onClick={() => setIsMenuOpen(false)}
          />
          
          {/* Menu Panel */}
          <div
            className="lg:hidden fixed top-[72px] left-0 right-0 bg-white shadow-xl z-50 max-h-[calc(100vh-72px)] overflow-y-auto"
            style={{ backgroundColor: '#ffffff' }}
          >
            <nav className="p-6 flex flex-col gap-4">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => handleNavClick(link.to)}
                  className="py-3 border-b border-gray-100 text-gray-900 font-medium transition-all hover:text-primary hover:pl-2"
                >
                  {link.label}
                </Link>
              ))}
              
              <div className="flex flex-col gap-3 mt-4">
                {isAuthenticated ? (
                  <>
                    {user?.accountType === 'provider' && (
                      <Link
                        to="/biznes"
                        onClick={() => setIsMenuOpen(false)}
                        className="w-full py-3 px-4 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-semibold text-center"
                      >
                        🏪 Panel Biznes
                      </Link>
                    )}
                    <Link
                      to="/wiadomosci"
                      onClick={() => setIsMenuOpen(false)}
                      className="w-full py-3 px-4 border border-gray-200 text-gray-700 rounded-xl font-medium text-center hover:bg-gray-50"
                    >
                      💬 Wiadomości
                    </Link>
                    <Link
                      to="/profil"
                      onClick={() => setIsMenuOpen(false)}
                      className="w-full py-3 px-4 border border-gray-200 text-gray-700 rounded-xl font-medium text-center hover:bg-gray-50"
                    >
                      Mój profil
                    </Link>
                    <button
                      onClick={() => {
                        logout();
                        setIsMenuOpen(false);
                      }}
                      className="w-full py-3 px-4 border border-red-200 text-red-600 rounded-xl font-medium text-center hover:bg-red-50"
                    >
                      Wyloguj się
                    </button>
                  </>
                ) : (
                  <>
                    <div className="p-4 bg-gray-50 rounded-xl text-center mb-2">
                      <div className="text-3xl mb-2">🔍 💇</div>
                      <p className="text-sm text-gray-600">
                        Zaloguj się, aby korzystać z pełnych funkcji
                      </p>
                    </div>
                    <Link
                      to="/auth?mode=login"
                      onClick={() => setIsMenuOpen(false)}
                      className="w-full py-3 px-4 bg-gradient-to-r from-primary to-secondary text-white rounded-xl font-semibold text-center"
                    >
                      ZALOGUJ SIĘ
                    </Link>
                    <Link
                      to="/auth?mode=register&type=client"
                      onClick={() => setIsMenuOpen(false)}
                      className="w-full py-3 px-4 border-2 border-primary text-primary rounded-xl font-semibold text-center"
                    >
                      REJESTRACJA - KLIENT
                    </Link>
                    <Link
                      to="/auth?mode=register&type=provider"
                      onClick={() => setIsMenuOpen(false)}
                      className="w-full py-3 px-4 border-2 border-emerald-500 text-emerald-600 rounded-xl font-semibold text-center"
                    >
                      REJESTRACJA - USŁUGODAWCA
                    </Link>
                  </>
                )}
              </div>
            </nav>
          </div>
        </>
      )}
    </header>
  );
};

export default Header;
