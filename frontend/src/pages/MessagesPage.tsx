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
  Star,
} from 'lucide-react';
import { useAuth } from '../App';

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
  participant: {
    id: number;
    name: string;
    avatar: string;
    profession?: string;
    isOnline: boolean;
    rating?: number;
  };
  lastMessage: string;
  lastMessageTime: Date;
  unreadCount: number;
  messages: Message[];
}

const MessagesPage = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showMobileChat, setShowMobileChat] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Load demo conversations
    const demoConversations: Conversation[] = [
      {
        id: '1',
        participant: {
          id: 1,
          name: 'Anna Kowalska',
          avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop',
          profession: 'Fryzjerka',
          isOnline: true,
          rating: 4.9,
        },
        lastMessage: 'Dziękuję za rezerwację! Do zobaczenia w piątek 😊',
        lastMessageTime: new Date(Date.now() - 1000 * 60 * 5),
        unreadCount: 2,
        messages: [
          {
            id: '1',
            senderId: 1,
            text: 'Dzień dobry! Dziękuję za zainteresowanie moimi usługami.',
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
            read: true,
            type: 'text',
          },
          {
            id: '2',
            senderId: user?.id || 0,
            text: 'Dzień dobry! Chciałabym umówić się na strzyżenie w piątek.',
            timestamp: new Date(Date.now() - 1000 * 60 * 60),
            read: true,
            type: 'text',
          },
          {
            id: '3',
            senderId: 1,
            text: 'Oczywiście! Mam wolny termin o 14:00. Pasuje Pani?',
            timestamp: new Date(Date.now() - 1000 * 60 * 30),
            read: true,
            type: 'text',
          },
          {
            id: '4',
            senderId: user?.id || 0,
            text: 'Tak, idealnie! Rezerwuję.',
            timestamp: new Date(Date.now() - 1000 * 60 * 20),
            read: true,
            type: 'text',
          },
          {
            id: '5',
            senderId: 1,
            text: '',
            timestamp: new Date(Date.now() - 1000 * 60 * 10),
            read: false,
            type: 'booking',
            bookingData: {
              service: 'Strzyżenie damskie',
              date: '2025-12-06',
              time: '14:00',
              price: 80,
              status: 'confirmed',
            },
          },
          {
            id: '6',
            senderId: 1,
            text: 'Dziękuję za rezerwację! Do zobaczenia w piątek 😊',
            timestamp: new Date(Date.now() - 1000 * 60 * 5),
            read: false,
            type: 'text',
          },
        ],
      },
      {
        id: '2',
        participant: {
          id: 2,
          name: 'Piotr Nowak',
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
          profession: 'Masażysta',
          isOnline: false,
          rating: 4.7,
        },
        lastMessage: 'Proszę potwierdzić rezerwację na poniedziałek',
        lastMessageTime: new Date(Date.now() - 1000 * 60 * 60 * 3),
        unreadCount: 0,
        messages: [
          {
            id: '1',
            senderId: 2,
            text: 'Witam! Czy jest Pan zainteresowany masażem relaksacyjnym?',
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5),
            read: true,
            type: 'text',
          },
          {
            id: '2',
            senderId: user?.id || 0,
            text: 'Tak, szukam czegoś na napięte mięśnie.',
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4),
            read: true,
            type: 'text',
          },
          {
            id: '3',
            senderId: 2,
            text: 'Proszę potwierdzić rezerwację na poniedziałek',
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3),
            read: true,
            type: 'text',
          },
        ],
      },
      {
        id: '3',
        participant: {
          id: 3,
          name: 'Katarzyna Wiśniewska',
          avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop',
          profession: 'Kosmetyczka',
          isOnline: true,
          rating: 5.0,
        },
        lastMessage: 'Zapraszam na zabieg w środę!',
        lastMessageTime: new Date(Date.now() - 1000 * 60 * 60 * 24),
        unreadCount: 1,
        messages: [
          {
            id: '1',
            senderId: 3,
            text: 'Zapraszam na zabieg w środę!',
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24),
            read: false,
            type: 'text',
          },
        ],
      },
    ];

    setConversations(demoConversations);
    
    // Load from localStorage if exists
    const saved = localStorage.getItem('userConversations');
    if (saved) {
      // Merge with demo data
    }
  }, [user]);

  useEffect(() => {
    scrollToBottom();
  }, [selectedConversation?.messages]);

  const scrollToBottom = () => {
    // Scroll tylko wewnątrz kontenera wiadomości, nie całej strony
    if (messagesEndRef.current) {
      const container = messagesEndRef.current.parentElement;
      if (container) {
        container.scrollTop = container.scrollHeight;
      }
    }
  };

  const sendMessage = () => {
    if (!newMessage.trim() || !selectedConversation) return;

    const message: Message = {
      id: Date.now().toString(),
      senderId: user?.id || 0,
      text: newMessage,
      timestamp: new Date(),
      read: false,
      type: 'text',
    };

    const updatedConversations = conversations.map((conv) => {
      if (conv.id === selectedConversation.id) {
        return {
          ...conv,
          messages: [...conv.messages, message],
          lastMessage: newMessage,
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

    // Save to localStorage
    localStorage.setItem('userConversations', JSON.stringify(updatedConversations));
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
    conv.participant.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 pt-4">
      <div className="max-w-6xl mx-auto px-4">
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden" style={{ height: 'calc(100vh - 120px)' }}>
          <div className="flex h-full">
            {/* Conversations List */}
            <div
              className={`w-full md:w-96 border-r border-gray-100 flex flex-col ${
                showMobileChat ? 'hidden md:flex' : 'flex'
              }`}
            >
              {/* Header */}
              <div className="p-4 border-b border-gray-100">
                <h1 className="text-xl font-bold text-gray-900 mb-4">Wiadomości</h1>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Szukaj rozmów..."
                    className="w-full pl-10 pr-4 py-2 bg-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary"
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
                      selectedConversation?.id === conv.id ? 'bg-primary/5' : ''
                    }`}
                  >
                    <div className="relative">
                      <img
                        src={conv.participant.avatar}
                        alt={conv.participant.name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                      {conv.participant.isOnline && (
                        <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />
                      )}
                    </div>
                    <div className="flex-1 text-left min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-gray-900">{conv.participant.name}</span>
                        <span className="text-xs text-gray-500">
                          {formatTime(conv.lastMessageTime)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500">{conv.participant.profession}</p>
                      <p className="text-sm text-gray-600 truncate mt-1">{conv.lastMessage}</p>
                    </div>
                    {conv.unreadCount > 0 && (
                      <span className="w-5 h-5 bg-primary text-white text-xs font-bold rounded-full flex items-center justify-center">
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
                  <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setShowMobileChat(false)}
                        className="md:hidden p-2 hover:bg-gray-100 rounded-lg"
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </button>
                      <img
                        src={selectedConversation.participant.avatar}
                        alt={selectedConversation.participant.name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <h2 className="font-semibold text-gray-900">
                            {selectedConversation.participant.name}
                          </h2>
                          {selectedConversation.participant.rating && (
                            <span className="flex items-center gap-1 text-sm text-amber-500">
                              <Star className="w-3 h-3 fill-amber-400" />
                              {selectedConversation.participant.rating}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-500">
                          {selectedConversation.participant.isOnline ? (
                            <span className="text-green-500">Online</span>
                          ) : (
                            selectedConversation.participant.profession
                          )}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Link
                        to={`/uslugodawcy/profil/${selectedConversation.participant.id}`}
                        className="px-4 py-2 text-sm font-medium text-primary hover:bg-primary/10 rounded-lg transition-colors"
                      >
                        Zobacz profil
                      </Link>
                      <button className="p-2 hover:bg-gray-100 rounded-lg">
                        <Phone className="w-5 h-5 text-gray-500" />
                      </button>
                      <button className="p-2 hover:bg-gray-100 rounded-lg">
                        <Video className="w-5 h-5 text-gray-500" />
                      </button>
                      <button className="p-2 hover:bg-gray-100 rounded-lg">
                        <MoreVertical className="w-5 h-5 text-gray-500" />
                      </button>
                    </div>
                  </div>

                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {selectedConversation.messages.map((message) => {
                      const isMe = message.senderId === user?.id;

                      if (message.type === 'booking' && message.bookingData) {
                        return (
                          <div key={message.id} className="flex justify-center">
                            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 max-w-sm">
                              <div className="text-center mb-2">
                                <span className="text-xs font-medium text-emerald-600 uppercase">
                                  Rezerwacja {message.bookingData.status === 'confirmed' ? 'potwierdzona ✓' : 'oczekująca'}
                                </span>
                              </div>
                              <div className="text-sm space-y-1">
                                <p className="font-semibold">{message.bookingData.service}</p>
                                <p className="text-gray-600">
                                  📅 {new Date(message.bookingData.date).toLocaleDateString('pl-PL')} o {message.bookingData.time}
                                </p>
                                <p className="text-emerald-600 font-bold">{message.bookingData.price} zł</p>
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
                            className={`max-w-[70%] px-4 py-2 rounded-2xl ${
                              isMe
                                ? 'bg-gradient-to-r from-primary to-secondary text-white rounded-br-md'
                                : 'bg-gray-100 text-gray-900 rounded-bl-md'
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

                  {/* Message Input */}
                  <div className="p-4 border-t border-gray-100">
                    <div className="flex items-center gap-3">
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
                        className="flex-1 px-4 py-2 bg-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                      <button
                        onClick={sendMessage}
                        disabled={!newMessage.trim()}
                        className="p-3 bg-gradient-to-r from-primary to-secondary text-white rounded-xl hover:shadow-lg disabled:opacity-50 transition-all"
                      >
                        <Send className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                /* No conversation selected */
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center text-gray-500">
                    <div className="text-6xl mb-4">💬</div>
                    <h3 className="text-lg font-semibold mb-2">Wybierz rozmowę</h3>
                    <p className="text-sm">Kliknij na rozmowę z listy, aby zobaczyć wiadomości</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessagesPage;
