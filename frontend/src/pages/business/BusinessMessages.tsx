import { useState, useEffect, useRef } from 'react';
import {
  Search,
  Send,
  MoreVertical,
  Phone,
<<<<<<< HEAD
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
  senderId: string;
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
    id: string;
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
=======
  Video,
  Loader2,
  MessageSquare,
} from 'lucide-react';
import { useAuth } from '../../App';
import messageService, { Conversation, Message } from '../../services/messageService';
import providerService from '../../services/providerService';
>>>>>>> origin/papi

const BusinessMessages = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [, setProviderId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Pobierz providerId i subskrybuj konwersacje
  useEffect(() => {
<<<<<<< HEAD
    // Load demo conversations for business
    const demoConversations: Conversation[] = [
      {
        id: '1',
        client: {
          id: '101',
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
            senderId: '101',
            text: 'Dzień dobry! Interesuje mnie strzyżenie.',
            timestamp: new Date(Date.now() - 1000 * 60 * 30),
            read: true,
            type: 'text',
          },
          {
            id: '2',
            senderId: user?.id || '',
            text: 'Dzień dobry! Oczywiście, kiedy chciałaby Pani się umówić?',
            timestamp: new Date(Date.now() - 1000 * 60 * 20),
            read: true,
            type: 'text',
          },
          {
            id: '3',
            senderId: '101',
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
          id: '102',
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
            senderId: '102',
            text: 'Chciałbym zarezerwować masaż na sobotę.',
            timestamp: new Date(Date.now() - 1000 * 60 * 120),
            read: true,
            type: 'text',
          },
          {
            id: '2',
            senderId: user?.id || '',
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
            senderId: '102',
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
          id: '103',
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
            senderId: '103',
            text: 'Czy można przełożyć rezerwację?',
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3),
            read: false,
            type: 'text',
          },
        ],
      },
    ];
=======
    if (!user?.id) {
      setIsLoading(false);
      return;
    }
>>>>>>> origin/papi

    const initMessages = async () => {
      try {
        // Znajdź providerId dla tego użytkownika
        const providers = await providerService.getByOwner(user.id);
        
        if (providers.length === 0) {
          setIsLoading(false);
          return;
        }

        const provider = providers[0];
        setProviderId(provider.id);

        // Subskrybuj konwersacje dla tego providera
        const unsubscribe = messageService.subscribeToProviderConversations(
          provider.id,
          (newConversations) => {
            setConversations(newConversations);
            setIsLoading(false);
          }
        );

        return unsubscribe;
      } catch (error) {
        console.error('Error loading messages:', error);
        setIsLoading(false);
      }
    };

    let unsubscribe: (() => void) | undefined;
    initMessages().then(unsub => {
      unsubscribe = unsub;
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [user?.id]);

  // Subskrybuj wiadomości z wybranej konwersacji
  useEffect(() => {
    if (!selectedConversation || !user?.id) return;

    // Oznacz jako przeczytane
    messageService.markAsRead(selectedConversation.id, user.id);

    const unsubscribe = messageService.subscribeToMessages(
      selectedConversation.id,
      (newMessages) => {
        setMessages(newMessages);
      }
    );

    return () => unsubscribe();
  }, [selectedConversation, user?.id]);

  // Auto-scroll do dołu
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation || !user?.id) return;

    setIsSending(true);
    try {
      const recipientId = selectedConversation.participants.find(p => p !== user.id) || '';
      
      await messageService.sendMessage(
        selectedConversation.id,
        user.id,
        user.username || 'Użytkownik',
        user.avatar || '',
        newMessage.trim(),
        recipientId
      );
      
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsSending(false);
    }
  };

<<<<<<< HEAD
  const sendMessage = (text?: string) => {
    const messageText = text || newMessage;
    if (!messageText.trim() || !selectedConversation) return;

    const message: Message = {
      id: Date.now().toString(),
      senderId: user?.id || '',
      text: messageText,
      timestamp: new Date(),
      read: false,
      type: 'text',
=======
  const getOtherParticipant = (conversation: Conversation) => {
    if (!user?.id) return { name: 'Nieznany', avatar: '' };
    const otherId = conversation.participants.find(p => p !== user.id) || '';
    return {
      name: conversation.participantNames[otherId] || 'Nieznany',
      avatar: conversation.participantAvatars[otherId] || '',
>>>>>>> origin/papi
    };
  };

<<<<<<< HEAD
  const sendBookingConfirmation = () => {
    if (!selectedConversation) return;

    const message: Message = {
      id: Date.now().toString(),
      senderId: user?.id || '',
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
=======
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
>>>>>>> origin/papi
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Teraz';
    if (minutes < 60) return `${minutes} min`;
    if (hours < 24) return `${hours}h`;
    if (days < 7) return `${days}d`;
    return date.toLocaleDateString('pl-PL');
  };

  const filteredConversations = conversations.filter(conv => {
    const other = getOtherParticipant(conv);
    return other.name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-12 h-12 animate-spin text-emerald-500" />
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-180px)] flex bg-white rounded-xl shadow-sm overflow-hidden">
      {/* Lista konwersacji */}
      <div className={`w-full md:w-80 lg:w-96 border-r border-gray-100 flex flex-col ${selectedConversation ? 'hidden md:flex' : ''}`}>
        <div className="p-4 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900 mb-3">Wiadomości</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Szukaj..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {filteredConversations.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <MessageSquare className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>Brak wiadomości</p>
              <p className="text-sm mt-1">Gdy klient napisze, pojawi się tutaj</p>
            </div>
          ) : (
            filteredConversations.map((conversation) => {
              const other = getOtherParticipant(conversation);
              const unread = user?.id ? (conversation.unreadCount[user.id] || 0) : 0;
              
              return (
                <div
                  key={conversation.id}
                  onClick={() => setSelectedConversation(conversation)}
                  className={`p-4 border-b border-gray-50 cursor-pointer transition-colors ${
                    selectedConversation?.id === conversation.id
                      ? 'bg-emerald-50'
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      {other.avatar ? (
                        <img src={other.avatar} alt={other.name} className="w-12 h-12 rounded-full object-cover" />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-gradient-to-r from-emerald-400 to-teal-500 flex items-center justify-center text-white font-bold">
                          {other.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                      {unread > 0 && (
                        <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                          {unread}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-gray-900">{other.name}</span>
                        <span className="text-xs text-gray-500">
                          {formatTime(conversation.lastMessageAt)}
                        </span>
                      </div>
                      <p className={`text-sm truncate ${unread > 0 ? 'font-medium text-gray-900' : 'text-gray-500'}`}>
                        {conversation.lastMessage || 'Brak wiadomości'}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Panel czatu */}
      {selectedConversation ? (
        <div className="flex-1 flex flex-col">
          {/* Header czatu */}
          <div className="p-4 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSelectedConversation(null)}
                className="md:hidden p-2 hover:bg-gray-100 rounded-lg"
              >
                ←
              </button>
              {(() => {
                const other = getOtherParticipant(selectedConversation);
                return (
                  <>
                    {other.avatar ? (
                      <img src={other.avatar} alt={other.name} className="w-10 h-10 rounded-full object-cover" />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gradient-to-r from-emerald-400 to-teal-500 flex items-center justify-center text-white font-bold">
                        {other.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <div className="font-medium text-gray-900">{other.name}</div>
                      <div className="text-xs text-gray-500">Klient</div>
                    </div>
                  </>
                );
              })()}
            </div>
            <div className="flex items-center gap-2">
              <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg">
                <Phone className="w-5 h-5" />
              </button>
              <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg">
                <Video className="w-5 h-5" />
              </button>
              <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg">
                <MoreVertical className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Wiadomości */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
            {messages.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                <p>Rozpocznij rozmowę</p>
              </div>
            ) : (
              messages.map((message) => {
                const isOwn = message.senderId === user?.id;
                return (
                  <div
                    key={message.id}
                    className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                        isOwn
                          ? 'bg-emerald-500 text-white'
                          : 'bg-white text-gray-900 shadow-sm'
                      }`}
                    >
                      <p>{message.text}</p>
                      <div
                        className={`text-xs mt-1 ${
                          isOwn ? 'text-emerald-100' : 'text-gray-400'
                        }`}
                      >
                        {formatTime(message.createdAt)}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t border-gray-100">
            <div className="flex items-center gap-3">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Napisz wiadomość..."
                className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
              <button
                onClick={handleSendMessage}
                disabled={!newMessage.trim() || isSending}
                className="p-3 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSending ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="hidden md:flex flex-1 items-center justify-center bg-gray-50">
          <div className="text-center text-gray-500">
            <MessageSquare className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p className="text-lg">Wybierz konwersację</p>
            <p className="text-sm">lub poczekaj na wiadomość od klienta</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default BusinessMessages;