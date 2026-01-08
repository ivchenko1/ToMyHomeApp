import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, Bell, Settings, User, LogOut, Calendar, MessageSquare, CreditCard } from 'lucide-react';
import { useAuth } from '../../App';
import notificationService, { Notification } from '../../services/notificationService';

const BusinessHeader = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const notificationsRef = useRef<HTMLDivElement>(null);

  // Real-time powiadomienia z Firebase
  const [notifications, setNotifications] = useState<Notification[]>([]);

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

  // Oznacz powiadomienie jako przeczytane
  const markAsRead = async (notificationId: string) => {
    await notificationService.markAsRead(notificationId);
  };

  // Oznacz wszystkie jako przeczytane
  const markAllAsRead = async () => {
    if (!user?.id) return;
    await notificationService.markAllAsRead(user.id);
  };

  // Ikona powiadomienia
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'booking':
      case 'booking_request':
      case 'booking_confirmed':
        return <Calendar className="w-4 h-4 text-emerald-500" />;
      case 'message':
      case 'new_message':
        return <MessageSquare className="w-4 h-4 text-blue-500" />;
      case 'payment':
        return <CreditCard className="w-4 h-4 text-purple-500" />;
      default:
        return <Bell className="w-4 h-4 text-gray-500" />;
    }
  };

  // Pobierz link z powiadomienia
  const getNotificationLink = (notification: Notification): string | undefined => {
    return notification.data?.link;
  };

  // Zamknij dropdown po kliknięciu poza
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="px-4 lg:px-8">
        <div className="h-16 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-4">
            <button
              className="lg:hidden p-2 bg-white rounded-lg border border-gray-200 hover:bg-gray-50"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              style={{ backgroundColor: 'white' }}
            >
              {isMenuOpen ? (
                <X className="w-5 h-5 text-gray-700" />
              ) : (
                <Menu className="w-5 h-5 text-gray-700" />
              )}
            </button>
            
            <Link to="/biznes" className="flex items-center gap-2">
              <div className="h-10 w-10 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-sm">T</span>
              </div>
              <div className="hidden sm:block">
                <span className="font-extrabold text-lg text-gray-900">TOMYHOMEAPP</span>
                <span className="ml-2 px-2 py-0.5 bg-emerald-100 text-emerald-700 text-xs font-bold rounded-full">
                  BIZNES
                </span>
              </div>
            </Link>
          </div>

          {/* Right Side */}
          <div className="flex items-center gap-3">
            {/* Switch to Client View - widoczny zawsze */}
            <Link
              to="/"
              className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors border border-gray-200"
            >
              <span className="hidden sm:inline">Widok klienta</span>
              <span className="sm:hidden">🏠</span>
              <span>→</span>
            </Link>

            {/* Notifications */}
            <div className="relative" ref={notificationsRef}>
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              {/* Notifications Dropdown */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-100 z-50 overflow-hidden">
                  <div className="p-3 border-b border-gray-100 flex items-center justify-between">
                    <h3 className="font-bold text-gray-900">Powiadomienia</h3>
                    {unreadCount > 0 && (
                      <button 
                        onClick={markAllAsRead}
                        className="text-xs text-emerald-600 hover:text-emerald-700 font-medium"
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
                      notifications.map((notification) => {
                        const link = getNotificationLink(notification);
                        return (
                        <div
                          key={notification.id}
                          onClick={() => {
                            markAsRead(notification.id);
                            if (link) {
                              navigate(link);
                            }
                            setShowNotifications(false);
                          }}
                          className={`p-3 border-b border-gray-50 cursor-pointer hover:bg-gray-50 transition-colors ${
                            !notification.read ? 'bg-emerald-50/50' : ''
                          }`}
                        >
                          <div className="flex gap-3">
                            <div className="flex-shrink-0 w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                              {getNotificationIcon(notification.type)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className={`text-sm ${!notification.read ? 'font-semibold' : ''} text-gray-900`}>
                                {notification.title}
                              </p>
                              <p className="text-xs text-gray-500 truncate">{notification.message}</p>
                              <p className="text-xs text-gray-400 mt-1">{formatTime(notification.createdAt)}</p>
                            </div>
                            {!notification.read && (
                              <div className="w-2 h-2 bg-emerald-500 rounded-full flex-shrink-0 mt-2" />
                            )}
                          </div>
                        </div>
                      );
                      })
                    )}
                  </div>
                  
                  <Link
                    to="/biznes/powiadomienia"
                    onClick={() => setShowNotifications(false)}
                    className="block p-3 text-center text-sm text-emerald-600 hover:bg-gray-50 font-medium border-t"
                  >
                    Zobacz wszystkie
                  </Link>
                </div>
              )}
            </div>

            {/* User Menu */}
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-sm">
                    {user?.username?.charAt(0).toUpperCase() || 'U'}
                  </span>
                </div>
                <span className="hidden md:block text-sm font-medium text-gray-700">
                  {user?.username || 'Użytkownik'}
                </span>
              </button>

              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50">
                  <Link
                    to="/biznes/profil"
                    className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    onClick={() => setShowUserMenu(false)}
                  >
                    <User className="w-4 h-4" />
                    Mój profil
                  </Link>
                  <Link
                    to="/biznes/ustawienia"
                    className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    onClick={() => setShowUserMenu(false)}
                  >
                    <Settings className="w-4 h-4" />
                    Ustawienia
                  </Link>
                  <hr className="my-2" />
                  <button
                    onClick={() => {
                      logout();
                      setShowUserMenu(false);
                    }}
                    className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full text-left"
                  >
                    <LogOut className="w-4 h-4" />
                    Wyloguj się
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsMenuOpen(false)}
        />
      )}
    </header>
  );
};

export default BusinessHeader;
