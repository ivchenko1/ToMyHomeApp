import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Bell,
  Calendar,
  MessageSquare,
  Star,
  Check,
  Trash2,

  Filter,
  Loader2,
} from 'lucide-react';
import { useAuth, useToast } from '../App';
import notificationService, { Notification } from '../services/notificationService';

const NotificationsPage = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  useEffect(() => {
    if (!user || !user.id) {
      console.log('NotificationsPage: No user or user.id');
      setIsLoading(false);
      return;
    }
    
    console.log('NotificationsPage: Subscribing for user', user.id);
    
    // Subskrybuj powiadomienia real-time
    const unsubscribe = notificationService.subscribe(
      user.id,
      (newNotifications) => {
        console.log('NotificationsPage: Got notifications', newNotifications.length);
        setNotifications(newNotifications);
        setIsLoading(false);
      }
    );
    
    return () => unsubscribe();
  }, [user]);

  const markAsRead = async (id: string) => {
    try {
      await notificationService.markAsRead(id);
    } catch (error) {
      showToast('Błąd oznaczania jako przeczytane', 'error');
    }
  };

  const markAllAsRead = async () => {
    if (!user || !user.id) return;
    try {
      await notificationService.markAllAsRead(user.id);
      showToast('Wszystkie oznaczone jako przeczytane', 'success');
    } catch (error) {
      showToast('Błąd oznaczania powiadomień', 'error');
    }
  };

  const deleteNotification = async (id: string) => {
    try {
      await notificationService.delete(id);
      showToast('Powiadomienie usunięte', 'success');
    } catch (error) {
      showToast('Błąd usuwania powiadomienia', 'error');
    }
  };

  const clearAll = async () => {
    if (!user || !user.id) return;
    if (confirm('Czy na pewno chcesz usunąć wszystkie powiadomienia?')) {
      try {
        await notificationService.deleteAllByUser(user.id);
        showToast('Wszystkie powiadomienia usunięte', 'success');
      } catch (error) {
        showToast('Błąd usuwania powiadomień', 'error');
      }
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    markAsRead(notification.id);
    
    // Nawiguj w zależności od typu
    if (notification.data?.bookingId) {
      navigate('/profil'); // lub dedykowana strona rezerwacji
    } else if (notification.type === 'new_message') {
      navigate('/wiadomosci');
    } else if (notification.type === 'new_review' && notification.data?.providerId) {
      navigate(`/uslugodawcy/profil/${notification.data.providerId}`);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'booking_request':
      case 'booking_confirmed':
      case 'booking_cancelled':
      case 'booking_completed':
      case 'booking_reminder':
        return <Calendar className="w-5 h-5" />;
      case 'new_message':
        return <MessageSquare className="w-5 h-5" />;
      case 'new_review':
        return <Star className="w-5 h-5" />;
      default:
        return <Bell className="w-5 h-5" />;
    }
  };

  const getIconColor = (type: string) => {
    switch (type) {
      case 'booking_request':
        return 'bg-blue-100 text-blue-600';
      case 'booking_confirmed':
        return 'bg-green-100 text-green-600';
      case 'booking_cancelled':
        return 'bg-red-100 text-red-600';
      case 'booking_completed':
        return 'bg-purple-100 text-purple-600';
      case 'booking_reminder':
        return 'bg-yellow-100 text-yellow-600';
      case 'new_message':
        return 'bg-indigo-100 text-indigo-600';
      case 'new_review':
        return 'bg-amber-100 text-amber-600';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Teraz';
    if (minutes < 60) return `${minutes} min temu`;
    if (hours < 24) return `${hours}h temu`;
    if (days === 1) return 'Wczoraj';
    if (days < 7) return `${days} dni temu`;
    return date.toLocaleDateString('pl-PL');
  };

  const filteredNotifications = notifications.filter(n => {
    if (filter === 'unread' && n.read) return false;
    if (typeFilter !== 'all') {
      if (typeFilter === 'booking' && !n.type.startsWith('booking')) return false;
      if (typeFilter === 'message' && n.type !== 'new_message') return false;
      if (typeFilter === 'system' && n.type !== 'system') return false;
    }
    return true;
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Bell className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Zaloguj się</h3>
          <p className="text-gray-500 mb-4">Zaloguj się, aby zobaczyć powiadomienia</p>
          <Link to="/auth" className="text-primary hover:underline">
            Przejdź do logowania
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-8 pb-16">
      <div className="max-w-3xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Powiadomienia</h1>
            <p className="text-gray-600">
              {unreadCount > 0 ? `${unreadCount} nieprzeczytanych` : 'Wszystkie przeczytane'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="px-4 py-2 text-sm font-medium text-primary hover:bg-primary/10 rounded-lg transition-colors"
              >
                <Check className="w-4 h-4 inline mr-1" />
                Przeczytaj wszystkie
              </button>
            )}
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  filter === 'all' ? 'bg-white shadow text-gray-900' : 'text-gray-600'
                }`}
              >
                Wszystkie
              </button>
              <button
                onClick={() => setFilter('unread')}
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  filter === 'unread' ? 'bg-white shadow text-gray-900' : 'text-gray-600'
                }`}
              >
                Nieprzeczytane ({unreadCount})
              </button>
            </div>

            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-400" />
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="bg-transparent text-sm text-gray-600 focus:outline-none cursor-pointer"
              >
                <option value="all">Wszystkie typy</option>
                <option value="booking">Rezerwacje</option>
                <option value="message">Wiadomości</option>
                <option value="system">Systemowe</option>
              </select>
            </div>

            {notifications.length > 0 && (
              <button
                onClick={clearAll}
                className="ml-auto text-sm text-red-500 hover:text-red-600"
              >
                Usuń wszystkie
              </button>
            )}
          </div>
        </div>

        {/* Notifications List */}
        <div className="space-y-3">
          {filteredNotifications.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm p-12 text-center">
              <Bell className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Brak powiadomień</h3>
              <p className="text-gray-500">
                {filter === 'unread' 
                  ? 'Wszystkie powiadomienia zostały przeczytane'
                  : 'Nie masz jeszcze żadnych powiadomień'}
              </p>
            </div>
          ) : (
            filteredNotifications.map((notification) => (
              <div
                key={notification.id}
                className={`bg-white rounded-xl shadow-sm p-4 flex items-start gap-4 transition-all hover:shadow-md cursor-pointer ${
                  !notification.read ? 'border-l-4 border-primary' : ''
                }`}
                onClick={() => handleNotificationClick(notification)}
              >
                <div className={`p-3 rounded-xl ${getIconColor(notification.type)}`}>
                  {getIcon(notification.type)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className={`font-semibold ${!notification.read ? 'text-gray-900' : 'text-gray-700'}`}>
                        {notificationService.getIcon(notification.type)} {notification.title}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                      <p className="text-xs text-gray-400 mt-2">{formatTime(notification.createdAt)}</p>
                    </div>
                    
                    <div className="flex items-center gap-1 ml-4" onClick={(e) => e.stopPropagation()}>
                      {!notification.read && (
                        <button
                          onClick={() => markAsRead(notification.id)}
                          className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                          title="Oznacz jako przeczytane"
                        >
                          <Check className="w-4 h-4 text-gray-400" />
                        </button>
                      )}
                      <button
                        onClick={() => deleteNotification(notification.id)}
                        className="p-1.5 hover:bg-red-50 rounded-lg transition-colors"
                        title="Usuń"
                      >
                        <Trash2 className="w-4 h-4 text-gray-400 hover:text-red-500" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationsPage;
