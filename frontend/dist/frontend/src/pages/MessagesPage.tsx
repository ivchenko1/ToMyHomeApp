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

// --- FIREBASE IMPORTS ---
import { db } from '../firebase'; 
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  addDoc, 
  orderBy, 
  serverTimestamp, 
  doc, 
  updateDoc
  // Timestamp удален, так как он не использовался
} from 'firebase/firestore';

// --- TYPES ---
interface Message {
  id: string;
  senderId: number | string;
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
    id: number | string;
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

  console.log("=== DIAGNOSTIC ===");
  console.log("User Object:", user);
  console.log("User ID Value:", user?.id);
  console.log("User ID Type:", typeof user?.id); // Это самое важное!
  console.log("==================");
  
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [activeMessages, setActiveMessages] = useState<Message[]>([]);
  
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showMobileChat, setShowMobileChat] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 1. ЗАГРУЗКА СПИСКА ЧАТОВ
  useEffect(() => {
    if (!user?.id) return;

    const q = query(
      collection(db, 'conversations'), 
      where('participantIds', 'array-contains', user.id)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const loadedConversations = snapshot.docs.map(doc => {
        const data = doc.data();
        
        const otherUserId = data.participantIds.find((id: string | number) => String(id) !== String(user.id));
        const otherUserData = data.participantsData?.[otherUserId] || { 
          name: 'Неизвестный', 
          avatar: '', 
          profession: 'Услуги' 
        };

        return {
          id: doc.id,
          participant: {
            id: otherUserId,
            name: otherUserData.name,
            avatar: otherUserData.avatar || 'https://via.placeholder.com/150',
            profession: otherUserData.profession,
            isOnline: false,
            rating: otherUserData.rating || 5.0,
          },
          lastMessage: data.lastMessage || '',
          lastMessageTime: data.lastMessageTime?.toDate() || new Date(),
          unreadCount: data.unreadCount?.[user.id] || 0,
          messages: [] 
        } as Conversation;
      });

      loadedConversations.sort((a, b) => b.lastMessageTime.getTime() - a.lastMessageTime.getTime());
      
      setConversations(loadedConversations);
    });

    return () => unsubscribe();
  }, [user]);

  // 2. ЗАГРУЗКА СООБЩЕНИЙ
  useEffect(() => {
    if (!selectedConversation) return;

    const messagesRef = collection(db, 'conversations', selectedConversation.id, 'messages');
    const q = query(messagesRef, orderBy('createdAt', 'asc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const liveMessages = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          senderId: data.senderId,
          text: data.text,
          timestamp: data.createdAt?.toDate() || new Date(),
          read: data.read || false,
          type: data.type || 'text',
          bookingData: data.bookingData || undefined
        } as Message;
      });

      setActiveMessages(liveMessages);
    });

    return () => unsubscribe();
  }, [selectedConversation?.id]);

  useEffect(() => {
    scrollToBottom();
  }, [activeMessages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // 3. ОТПРАВКА СООБЩЕНИЯ
  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation || !user) return;
    const textToSend = newMessage;
    setNewMessage(''); 

    try {
      const chatId = selectedConversation.id;

      await addDoc(collection(db, 'conversations', chatId, 'messages'), {
        text: textToSend,
        senderId: user.id,
        createdAt: serverTimestamp(),
        read: false,
        type: 'text'
      });

      await updateDoc(doc(db, 'conversations', chatId), {
        lastMessage: textToSend,
        lastMessageTime: serverTimestamp(),
      });

    } catch (error) {
      console.error("Ошибка отправки:", error);
      alert("Не удалось отправить сообщение");
    }
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Teraz';
    if (minutes < 60) return `${minutes} min`;
    if (hours < 24) return `${hours}h`;
    if (days === 1) return 'Wczoraj';
    return date.toLocaleDateString('pl-PL');
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
                          {selectedConversation.participant.profession}
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
                    {activeMessages.map((message) => {
                      const isMe = String(message.senderId) === String(user?.id);

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
                                {message.timestamp.toLocaleTimeString('pl-PL', {
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
