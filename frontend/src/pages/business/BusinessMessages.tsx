import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  Search,
  Send,
  Image,
  Paperclip,
  MoreVertical,
  Phone,
  Video,
  ChevronLeft,
  Check,
  CheckCheck,
  Calendar,
  Clock,
  DollarSign,
} from 'lucide-react';
import { useAuth, useToast } from '../../App';

interface Message {
  id: string;
  senderId: number;
  text: string;
  timestamp: Date;
  read: boolean;
  type: 'text' | 'image' | 'booking';
  bookingData?: {
    service: string;
    date: string;
    time: string;
    price: number;
    status: 'pending' | 'confirmed' | 'cancelled';
  };
}

interface Conversation {
  id: string;
  client: {
    id: number;
    name: string;
    avatar: string;
    phone?: string;
    email?: string;
    isOnline: boolean;
    totalBookings?: number;
  };
  lastMessage: string;
  lastMessageTime: Date;
  unreadCount: number;
  messages: Message[];
}

const BusinessMessages = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showMobileChat, setShowMobileChat] = useState(false);
  const [showQuickReply, setShowQuickReply] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const quickReplies = [
    'Dziękuję za wiadomość! Odezwę się wkrótce.',
    'Oczywiście, mam wolny termin. Kiedy Pani/Panu pasuje?',
    'Rezerwacja została potwierdzona ✓',
    'Niestety ten termin jest zajęty. Proponuję...',
    'Do zobaczenia! 😊',
  ];

  useEffect(() => {
    // Load demo conversations for business
    const demoConversations: Conversation[] = [
      {
        id: '1',
        client: {
          id: 101,
          name: 'Magdalena Kowalczyk',
          avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop',
          phone: '+48 123 456 789',
          email: 'magda@example.com',
          isOnline: true,
          totalBookings: 3,
        },
        lastMessage: 'Czy mogę się umówić na piątek?',
        lastMessageTime: new Date(Date.now() - 1000 * 60 * 2),
        unreadCount: 1,
        messages: [
          {
            id: '1',
            senderId: 101,
            text: 'Dzień dobry! Interesuje mnie strzyżenie.',
            timestamp: new Date(Date.now() - 1000 * 60 * 30),
            read: true,
            type: 'text',
          },
          {
            id: '2',
            senderId: user?.id || 0,
            text: 'Dzień dobry! Oczywiście, kiedy chciałaby Pani się umówić?',
            timestamp: new Date(Date.now() - 1000 * 60 * 20),
            read: true,
            type: 'text',
          },
          {
            id: '3',
            senderId: 101,
            text: 'Czy mogę się umówić na piątek?',
            timestamp: new Date(Date.now() - 1000 * 60 * 2),
            read: false,
            type: 'text',
          },
        ],
      },
      {
        id: '2',
        client: {
          id: 102,
          name: 'Tomasz Nowicki',
          avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop',
          phone: '+48 987 654 321',
          isOnline: false,
          totalBookings: 1,
        },
        lastMessage: 'Świetnie, dziękuję!',
        lastMessageTime: new Date(Date.now() - 1000 * 60 * 60),
        unreadCount: 0,
        messages: [
          {
            id: '1',
            senderId: 102,
            text: 'Chciałbym zarezerwować masaż na sobotę.',
            timestamp: new Date(Date.now() - 1000 * 60 * 120),
            read: true,
            type: 'text',
          },
          {
            id: '2',
            senderId: user?.id || 0,
            text: '',
            timestamp: new Date(Date.now() - 1000 * 60 * 90),
            read: true,
            type: 'booking',
            bookingData: {
              service: 'Masaż relaksacyjny',
              date: '2025-12-07',
              time: '11:00',
              price: 150,
              status: 'confirmed',
            },
          },
          {
            id: '3',
            senderId: 102,
            text: 'Świetnie, dziękuję!',
            timestamp: new Date(Date.now() - 1000 * 60 * 60),
            read: true,
            type: 'text',
          },
        ],
      },
      {
        id: '3',
        client: {
          id: 103,
          name: 'Anna Wiśniewska',
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop',
          email: 'anna.w@example.com',
          isOnline: true,
          totalBookings: 7,
        },
        lastMessage: 'Czy można przełożyć rezerwację?',
        lastMessageTime: new Date(Date.now() - 1000 * 60 * 60 * 3),
        unreadCount: 1,
        messages: [
          {
            id: '1',
            senderId: 103,
            text: 'Czy można przełożyć rezerwację?',
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3),
            read: false,
            type: 'text',
          },
        ],
      },
    ];

    setConversations(demoConversations);
  }, [user]);

  useEffect(() => {
    scrollToBottom();
  }, [selectedConversation?.messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const sendMessage = (text?: string) => {
    const messageText = text || newMessage;
    if (!messageText.trim() || !selectedConversation) return;

    const message: Message = {
      id: Date.now().toString(),
      senderId: user?.id || 0,
      text: messageText,
      timestamp: new Date(),
      read: false,
      type: 'text',
    };

    const updatedConversations = conversations.map((conv) => {
      if (conv.id === selectedConversation.id) {
        return {
          ...conv,
          messages: [...conv.messages, message],
          lastMessage: messageText,
          lastMessageTime: new Date(),
        };
      }
      return conv;
    });

    setConversations(updatedConversations);
    setSelectedConversation({
      ...selectedConversation,
      messages: [...selectedConversation.messages, message],
    });
    setNewMessage('');
    setShowQuickReply(false);
  };

  const sendBookingConfirmation = () => {
    if (!selectedConversation) return;

    const message: Message = {
      id: Date.now().toString(),
      senderId: user?.id || 0,
      text: '',
      timestamp: new Date(),
      read: false,
      type: 'booking',
      bookingData: {
        service: 'Strzyżenie',
        date: new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0],
        time: '14:00',
        price: 80,
        status: 'pending',
      },
    };

    const updatedConversations = conversations.map((conv) => {
      if (conv.id === selectedConversation.id) {
        return {
          ...conv,
          messages: [...conv.messages, message],
          lastMessage: 'Wysłano propozycję rezerwacji',
          lastMessageTime: new Date(),
        };
      }
      return conv;
    });

    setConversations(updatedConversations);
    setSelectedConversation({
      ...selectedConversation,
      messages: [...selectedConversation.messages, message],
    });
    showToast('Propozycja rezerwacji wysłana!', 'success');
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Teraz';
    if (minutes < 60) return `${minutes} min`;
    if (hours < 24) return `${hours}h`;
    if (days === 1) return 'Wczoraj';
    return new Date(date).toLocaleDateString('pl-PL');
  };

  const filteredConversations = conversations.filter((conv) =>
    conv.client.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalUnread = conversations.reduce((sum, conv) => sum + conv.unreadCount, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Wiadomości</h1>
          <p className="text-gray-600">
            {totalUnread > 0 ? `${totalUnread} nieprzeczytanych` : 'Wszystkie przeczytane'}
          </p>
        </div>
      </div>

      {/* Chat Container */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden" style={{ height: 'calc(100vh - 220px)' }}>
        <div className="flex h-full">
          {/* Conversations List */}
          <div
            className={`w-full md:w-80 lg:w-96 border-r border-gray-100 flex flex-col ${
              showMobileChat ? 'hidden md:flex' : 'flex'
            }`}
          >
            {/* Search */}
            <div className="p-4 border-b border-gray-100">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Szukaj klientów..."
                  className="w-full pl-10 pr-4 py-2 bg-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            {/* Conversations */}
            <div className="flex-1 overflow-y-auto">
              {filteredConversations.map((conv) => (
                <button
                  key={conv.id}
                  onClick={() => {
                    setSelectedConversation(conv);
                    setShowMobileChat(true);
                    // Mark as read
                    const updated = conversations.map((c) =>
                      c.id === conv.id ? { ...c, unreadCount: 0 } : c
                    );
                    setConversations(updated);
                  }}
                  className={`w-full p-4 flex items-start gap-3 hover:bg-gray-50 transition-colors border-b border-gray-50 ${
                    selectedConversation?.id === conv.id ? 'bg-emerald-50' : ''
                  }`}
                >
                  <div className="relative">
                    <img
                      src={conv.client.avatar}
                      alt={conv.client.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    {conv.client.isOnline && (
                      <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />
                    )}
                  </div>
                  <div className="flex-1 text-left min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-gray-900">{conv.client.name}</span>
                      <span className="text-xs text-gray-500">
                        {formatTime(conv.lastMessageTime)}
                      </span>
                    </div>
                    {conv.client.totalBookings && (
                      <p className="text-xs text-emerald-600">{conv.client.totalBookings} rezerwacji</p>
                    )}
                    <p className="text-sm text-gray-600 truncate mt-1">{conv.lastMessage}</p>
                  </div>
                  {conv.unreadCount > 0 && (
                    <span className="w-5 h-5 bg-emerald-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                      {conv.unreadCount}
                    </span>
                  )}
                </button>
              ))}

              {filteredConversations.length === 0 && (
                <div className="p-8 text-center text-gray-500">
                  <p>Brak rozmów</p>
                </div>
              )}
            </div>
          </div>

          {/* Chat Area */}
          <div
            className={`flex-1 flex flex-col ${
              !showMobileChat ? 'hidden md:flex' : 'flex'
            }`}
          >
            {selectedConversation ? (
              <>
                {/* Chat Header */}
                <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-white">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setShowMobileChat(false)}
                      className="md:hidden p-2 hover:bg-gray-100 rounded-lg"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <img
                      src={selectedConversation.client.avatar}
                      alt={selectedConversation.client.name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div>
                      <h2 className="font-semibold text-gray-900">
                        {selectedConversation.client.name}
                      </h2>
                      <p className="text-sm text-gray-500">
                        {selectedConversation.client.isOnline ? (
                          <span className="text-green-500">Online</span>
                        ) : (
                          `${selectedConversation.client.totalBookings || 0} rezerwacji`
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={sendBookingConfirmation}
                      className="px-3 py-1.5 bg-emerald-100 text-emerald-700 rounded-lg text-sm font-medium hover:bg-emerald-200 transition-colors flex items-center gap-1"
                    >
                      <Calendar className="w-4 h-4" />
                      Wyślij rezerwację
                    </button>
                    {selectedConversation.client.phone && (
                      <a
                        href={`tel:${selectedConversation.client.phone}`}
                        className="p-2 hover:bg-gray-100 rounded-lg"
                      >
                        <Phone className="w-5 h-5 text-gray-500" />
                      </a>
                    )}
                    <button className="p-2 hover:bg-gray-100 rounded-lg">
                      <MoreVertical className="w-5 h-5 text-gray-500" />
                    </button>
                  </div>
                </div>

                {/* Client Info Bar */}
                <div className="px-4 py-2 bg-gray-50 border-b border-gray-100 flex items-center gap-4 text-sm">
                  {selectedConversation.client.phone && (
                    <span className="text-gray-600">
                      📞 {selectedConversation.client.phone}
                    </span>
                  )}
                  {selectedConversation.client.email && (
                    <span className="text-gray-600">
                      ✉️ {selectedConversation.client.email}
                    </span>
                  )}
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                  {selectedConversation.messages.map((message) => {
                    const isMe = message.senderId === user?.id;

                    if (message.type === 'booking' && message.bookingData) {
                      return (
                        <div key={message.id} className="flex justify-center">
                          <div className={`border rounded-xl p-4 max-w-sm ${
                            message.bookingData.status === 'confirmed'
                              ? 'bg-emerald-50 border-emerald-200'
                              : 'bg-yellow-50 border-yellow-200'
                          }`}>
                            <div className="text-center mb-2">
                              <span className={`text-xs font-medium uppercase ${
                                message.bookingData.status === 'confirmed'
                                  ? 'text-emerald-600'
                                  : 'text-yellow-600'
                              }`}>
                                Rezerwacja {message.bookingData.status === 'confirmed' ? 'potwierdzona ✓' : 'oczekująca'}
                              </span>
                            </div>
                            <div className="text-sm space-y-1">
                              <p className="font-semibold">{message.bookingData.service}</p>
                              <p className="text-gray-600 flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {new Date(message.bookingData.date).toLocaleDateString('pl-PL')}
                              </p>
                              <p className="text-gray-600 flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {message.bookingData.time}
                              </p>
                              <p className="text-emerald-600 font-bold flex items-center gap-1">
                                <DollarSign className="w-3 h-3" />
                                {message.bookingData.price} zł
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    }

                    return (
                      <div
                        key={message.id}
                        className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[70%] px-4 py-2 rounded-2xl shadow-sm ${
                            isMe
                              ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-br-md'
                              : 'bg-white text-gray-900 rounded-bl-md'
                          }`}
                        >
                          <p>{message.text}</p>
                          <div
                            className={`flex items-center justify-end gap-1 mt-1 text-xs ${
                              isMe ? 'text-white/70' : 'text-gray-500'
                            }`}
                          >
                            <span>
                              {new Date(message.timestamp).toLocaleTimeString('pl-PL', {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                            {isMe && (
                              message.read ? (
                                <CheckCheck className="w-4 h-4" />
                              ) : (
                                <Check className="w-4 h-4" />
                              )
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>

                {/* Quick Replies */}
                {showQuickReply && (
                  <div className="px-4 py-2 border-t border-gray-100 bg-white">
                    <p className="text-xs text-gray-500 mb-2">Szybkie odpowiedzi:</p>
                    <div className="flex flex-wrap gap-2">
                      {quickReplies.map((reply, index) => (
                        <button
                          key={index}
                          onClick={() => sendMessage(reply)}
                          className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-gray-200 transition-colors"
                        >
                          {reply.length > 30 ? reply.substring(0, 30) + '...' : reply}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Message Input */}
                <div className="p-4 border-t border-gray-100 bg-white">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setShowQuickReply(!showQuickReply)}
                      className={`p-2 rounded-lg transition-colors ${
                        showQuickReply ? 'bg-emerald-100 text-emerald-600' : 'hover:bg-gray-100 text-gray-500'
                      }`}
                      title="Szybkie odpowiedzi"
                    >
                      ⚡
                    </button>
                    <button className="p-2 hover:bg-gray-100 rounded-lg">
                      <Paperclip className="w-5 h-5 text-gray-500" />
                    </button>
                    <button className="p-2 hover:bg-gray-100 rounded-lg">
                      <Image className="w-5 h-5 text-gray-500" />
                    </button>
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                      placeholder="Napisz wiadomość..."
                      className="flex-1 px-4 py-2 bg-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                    <button
                      onClick={() => sendMessage()}
                      disabled={!newMessage.trim()}
                      className="p-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl hover:shadow-lg disabled:opacity-50 transition-all"
                    >
                      <Send className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </>
            ) : (
              /* No conversation selected */
              <div className="flex-1 flex items-center justify-center bg-gray-50">
                <div className="text-center text-gray-500">
                  <div className="text-6xl mb-4">💬</div>
                  <h3 className="text-lg font-semibold mb-2">Wybierz rozmowę</h3>
                  <p className="text-sm">Kliknij na klienta z listy, aby zobaczyć wiadomości</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BusinessMessages;
