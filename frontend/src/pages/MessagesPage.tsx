import { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Search,
  Send,
  ArrowLeft,
  Loader2,
  MessageSquare,
} from 'lucide-react';
import { useAuth } from '../App';
import messageService, { Conversation, Message } from '../services/messageService';
import providerService from '../services/providerService';

const MessagesPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Obsłuż parametr providerId - otwórz/utwórz konwersację z usługodawcą
  useEffect(() => {
    const initConversation = async () => {
      const providerId = searchParams.get('providerId');
      if (!providerId || !user?.id) return;

      try {
        // Pobierz dane providera
        const provider = await providerService.getById(providerId);
        if (!provider) return;

        // Utwórz lub pobierz konwersację
        const conversation = await messageService.getOrCreateConversation(
          user.id,
          user.username || 'Użytkownik',
          user.avatar || '',
          provider.id, // providerId
          provider.ownerId, // providerOwnerId
          provider.name,
          provider.image || ''
        );

        setSelectedConversation(conversation);
      } catch (error) {
        console.error('Error initializing conversation:', error);
      }
    };

    initConversation();
  }, [searchParams, user]);

  // Subskrybuj konwersacje
  useEffect(() => {
    if (!user?.id) {
      setIsLoading(false);
      return;
    }

    const unsubscribe = messageService.subscribeToConversations(
      user.id,
      (newConversations) => {
        setConversations(newConversations);
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
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

  const getOtherParticipant = (conversation: Conversation) => {
    if (!user?.id) return { name: 'Nieznany', avatar: '' };
    const otherId = conversation.participants.find(p => p !== user.id) || '';
    return {
      name: conversation.participantNames[otherId] || 'Nieznany',
      avatar: conversation.participantAvatars[otherId] || '',
    };
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
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

  // Nie zalogowany
  if (!user) {
    return (
      <div className="min-h-screen pt-24 pb-12">
        <div className="max-w-4xl mx-auto px-6">
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <MessageSquare className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">Zaloguj się</h2>
            <p className="text-gray-600 mb-4">Musisz być zalogowany, aby korzystać z wiadomości</p>
            <button
              onClick={() => navigate('/auth?mode=login')}
              className="px-6 py-3 bg-gradient-to-r from-primary to-secondary text-white rounded-xl font-semibold"
            >
              Zaloguj się
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen pt-24 pb-12 flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 pb-0">
      <div className="max-w-6xl mx-auto px-6">
        <div className="h-[calc(100vh-120px)] flex bg-white rounded-2xl shadow-lg overflow-hidden">
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
                  className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              {filteredConversations.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <MessageSquare className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>Brak wiadomości</p>
                  <p className="text-sm mt-1">Napisz do usługodawcy ze strony jego profilu</p>
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
                          ? 'bg-primary/10'
                          : 'hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          {other.avatar ? (
                            <img src={other.avatar} alt={other.name} className="w-12 h-12 rounded-full object-cover" />
                          ) : (
                            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-primary to-secondary flex items-center justify-center text-white font-bold">
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
              <div className="p-4 border-b border-gray-100 flex items-center gap-3">
                <button
                  onClick={() => setSelectedConversation(null)}
                  className="md:hidden p-2 hover:bg-gray-100 rounded-lg"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                {(() => {
                  const other = getOtherParticipant(selectedConversation);
                  return (
                    <>
                      {other.avatar ? (
                        <img src={other.avatar} alt={other.name} className="w-10 h-10 rounded-full object-cover" />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-primary to-secondary flex items-center justify-center text-white font-bold">
                          {other.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <div className="font-medium text-gray-900">{other.name}</div>
                        <div className="text-xs text-gray-500">Usługodawca</div>
                      </div>
                    </>
                  );
                })()}
              </div>

              {/* Wiadomości */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                {messages.length === 0 ? (
                  <div className="text-center text-gray-500 py-8">
                    <p>Rozpocznij rozmowę</p>
                    <p className="text-sm">Napisz do usługodawcy</p>
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
                              ? 'bg-gradient-to-r from-primary to-secondary text-white'
                              : 'bg-white text-gray-900 shadow-sm'
                          }`}
                        >
                          <p>{message.text}</p>
                          <div
                            className={`text-xs mt-1 ${
                              isOwn ? 'text-white/70' : 'text-gray-400'
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
              <div className="p-4 border-t border-gray-100 bg-white">
                <div className="flex items-center gap-3">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="Napisz wiadomość..."
                    className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary"
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim() || isSending}
                    className="p-3 bg-gradient-to-r from-primary to-secondary text-white rounded-xl hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
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
                <p className="text-sm">lub napisz do usługodawcy z jego profilu</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessagesPage;
