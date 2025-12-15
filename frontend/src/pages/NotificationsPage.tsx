import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Bell,
  Calendar,
  MessageSquare,
  Star,
  DollarSign,
  Check,
  Trash2,
  Settings,
  Filter,
} from 'lucide-react';
import { NotificationData } from '../types';

interface Notification {
  id: string;
  type: 'booking' | 'message' | 'review' | 'payment' | 'system';
  title: string;
  message: string;
  time: Date;
  read: boolean;
  link?: string;
  data?: NotificationData;
}

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  useEffect(() => {
    // Load demo notifications - tylko dla klienta (bez review)
    const demoNotifications: Notification[] = [
      {
        id: '1',
        type: 'booking',
        title: 'Rezerwacja potwierdzona',
        message: 'Twoja rezerwacja została potwierdzona',
        time: new Date(Date.now() - 1000 * 60 * 60 * 3),
        read: false,
        link: '/profil',
      },
      {
        id: '2',
        type: 'message',
        title: 'Nowa wiadomość',
        message: 'Masz nową wiadomość od usługodawcy',
        time: new Date(Date.now() - 1000 * 60 * 30),
        read: false,
        link: '/wiadomosci',
      },
      {
        id: '3',
        type: 'booking',
        title: 'Przypomnienie o wizycie',
        message: 'Masz wizytę jutro o 14:00',
        time: new Date(Date.now() - 1000 * 60 * 60 * 24),
        read: true,
        link: '/profil',
      },
      {
        id: '4',
        type: 'system',
        title: 'Uzupełnij profil',
        message: 'Dodaj zdjęcie profilowe dla lepszego doświadczenia',
        time: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
        read: true,
        link: '/profil',
      },
    ];

    setNotifications(demoNotifications);
  }, []);

  const markAsRead = (id: string) => {
    setNotifications(notifications.map(n => 
      n.id === id ? { ...n, read: true } : n
    ));
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const deleteNotification = (id: string) => {
    setNotifications(notifications.filter(n => n.id !== id));
  };

  const clearAll = () => {
    if (confirm('Czy na pewno chcesz usunąć wszystkie powiadomienia?')) {
      setNotifications([]);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'booking':
        return <Calendar className="w-5 h-5" />;
      case 'message':
        return <MessageSquare className="w-5 h-5" />;
      case 'review':
        return <Star className="w-5 h-5" />;
      case 'payment':
        return <DollarSign className="w-5 h-5" />;
      default:
        return <Bell className="w-5 h-5" />;
    }
  };

  const getIconColor = (type: string) => {
    switch (type) {
      case 'booking':
        return 'bg-blue-100 text-blue-600';
      case 'message':
        return 'bg-purple-100 text-purple-600';
      case 'review':
        return 'bg-amber-100 text-amber-600';
      case 'payment':
        return 'bg-green-100 text-green-600';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Teraz';
    if (minutes < 60) return `${minutes} min temu`;
    if (hours < 24) return `${hours}h temu`;
    if (days === 1) return 'Wczoraj';
    if (days < 7) return `${days} dni temu`;
    return new Date(date).toLocaleDateString('pl-PL');
  };

  const filteredNotifications = notifications.filter(n => {
    if (filter === 'unread' && n.read) return false;
    if (typeFilter !== 'all' && n.type !== typeFilter) return false;
    return true;
  });

  const unreadCount = notifications.filter(n => !n.read).length;

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
            <button
              onClick={markAllAsRead}
              className="px-4 py-2 text-sm font-medium text-primary hover:bg-primary/10 rounded-lg transition-colors"
            >
              <Check className="w-4 h-4 inline mr-1" />
              Przeczytaj wszystkie
            </button>
            <Link
              to="/ustawienia/powiadomienia"
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <Settings className="w-5 h-5 text-gray-500" />
            </Link>
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
                className={`bg-white rounded-xl shadow-sm p-4 flex items-start gap-4 transition-all hover:shadow-md ${
                  !notification.read ? 'border-l-4 border-primary' : ''
                }`}
              >
                <div className={`p-3 rounded-xl ${getIconColor(notification.type)}`}>
                  {getIcon(notification.type)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className={`font-semibold ${!notification.read ? 'text-gray-900' : 'text-gray-700'}`}>
                        {notification.title}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                      <p className="text-xs text-gray-400 mt-2">{formatTime(notification.time)}</p>
                    </div>
                    
                    <div className="flex items-center gap-1 ml-4">
                      {notification.link && (
                        <Link
                          to={notification.link}
                          onClick={() => markAsRead(notification.id)}
                          className="px-3 py-1 text-sm text-primary hover:bg-primary/10 rounded-lg transition-colors"
                        >
                          Zobacz
                        </Link>
                      )}
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
