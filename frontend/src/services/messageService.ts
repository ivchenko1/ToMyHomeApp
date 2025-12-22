/**
 * Message Service - prawdziwy system wiadomości
 * Używa Firebase Firestore
 */

import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc,
  query, 
  where,
  onSnapshot,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { db } from '../firebase';

// ============================================
// TYPY
// ============================================

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  text: string;
  createdAt: string;
  read: boolean;
}

export interface Conversation {
  id: string;
  participants: string[]; // [userId1, userId2]
  participantNames: { [userId: string]: string };
  participantAvatars: { [userId: string]: string };
  lastMessage: string;
  lastMessageAt: string;
  lastMessageSenderId: string;
  unreadCount: { [userId: string]: number };
  createdAt: string;
}

// ============================================
// HELPERS
// ============================================

const CONVERSATIONS_COLLECTION = 'conversations';
const MESSAGES_COLLECTION = 'messages';

const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
};

// ============================================
// PUBLIC API
// ============================================

export const messageService = {
  /**
   * Pobierz lub utwórz konwersację między dwoma użytkownikami
   */
  async getOrCreateConversation(
    user1Id: string,
    user1Name: string,
    user1Avatar: string,
    user2Id: string,
    user2Name: string,
    user2Avatar: string
  ): Promise<Conversation> {
    try {
      // Szukaj istniejącej konwersacji
      const q = query(
        collection(db, CONVERSATIONS_COLLECTION),
        where('participants', 'array-contains', user1Id)
      );
      const snapshot = await getDocs(q);
      
      const existing = snapshot.docs.find(doc => {
        const data = doc.data();
        return data.participants.includes(user2Id);
      });
      
      if (existing) {
        return existing.data() as Conversation;
      }
      
      // Utwórz nową konwersację
      const id = generateId();
      const now = new Date().toISOString();
      
      const conversation: Conversation = {
        id,
        participants: [user1Id, user2Id],
        participantNames: {
          [user1Id]: user1Name,
          [user2Id]: user2Name,
        },
        participantAvatars: {
          [user1Id]: user1Avatar || '',
          [user2Id]: user2Avatar || '',
        },
        lastMessage: '',
        lastMessageAt: now,
        lastMessageSenderId: '',
        unreadCount: {
          [user1Id]: 0,
          [user2Id]: 0,
        },
        createdAt: now,
      };
      
      await setDoc(doc(db, CONVERSATIONS_COLLECTION, id), conversation);
      return conversation;
    } catch (error) {
      console.error('getOrCreateConversation error:', error);
      throw error;
    }
  },

  /**
   * Pobierz konwersacje użytkownika
   */
  async getConversations(userId: string): Promise<Conversation[]> {
    try {
      const q = query(
        collection(db, CONVERSATIONS_COLLECTION),
        where('participants', 'array-contains', userId)
      );
      const snapshot = await getDocs(q);
      const conversations = snapshot.docs.map(doc => doc.data() as Conversation);
      return conversations.sort((a, b) => 
        new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime()
      );
    } catch (error) {
      console.error('getConversations error:', error);
      return [];
    }
  },

  /**
   * Subskrybuj konwersacje użytkownika (real-time)
   */
  subscribeToConversations(
    userId: string,
    callback: (conversations: Conversation[]) => void
  ): () => void {
    const q = query(
      collection(db, CONVERSATIONS_COLLECTION),
      where('participants', 'array-contains', userId)
    );
    
    return onSnapshot(q, (snapshot) => {
      const conversations = snapshot.docs.map(doc => doc.data() as Conversation);
      conversations.sort((a, b) => 
        new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime()
      );
      callback(conversations);
    });
  },

  /**
   * Pobierz wiadomości z konwersacji
   */
  async getMessages(conversationId: string): Promise<Message[]> {
    try {
      const q = query(
        collection(db, MESSAGES_COLLECTION),
        where('conversationId', '==', conversationId)
      );
      const snapshot = await getDocs(q);
      const messages = snapshot.docs.map(doc => doc.data() as Message);
      return messages.sort((a, b) => 
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );
    } catch (error) {
      console.error('getMessages error:', error);
      return [];
    }
  },

  /**
   * Subskrybuj wiadomości z konwersacji (real-time)
   */
  subscribeToMessages(
    conversationId: string,
    callback: (messages: Message[]) => void
  ): () => void {
    const q = query(
      collection(db, MESSAGES_COLLECTION),
      where('conversationId', '==', conversationId)
    );
    
    return onSnapshot(q, (snapshot) => {
      const messages = snapshot.docs.map(doc => doc.data() as Message);
      messages.sort((a, b) => 
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );
      callback(messages);
    });
  },

  /**
   * Wyślij wiadomość
   */
  async sendMessage(
    conversationId: string,
    senderId: string,
    senderName: string,
    senderAvatar: string,
    text: string,
    recipientId: string
  ): Promise<Message> {
    try {
      const id = generateId();
      const now = new Date().toISOString();
      
      const message: Message = {
        id,
        conversationId,
        senderId,
        senderName,
        senderAvatar: senderAvatar || '',
        text,
        createdAt: now,
        read: false,
      };
      
      await setDoc(doc(db, MESSAGES_COLLECTION, id), message);
      
      // Zaktualizuj konwersację
      const conversationRef = doc(db, CONVERSATIONS_COLLECTION, conversationId);
      const conversationDoc = await getDoc(conversationRef);
      
      if (conversationDoc.exists()) {
        const conversation = conversationDoc.data() as Conversation;
        const newUnreadCount = { ...conversation.unreadCount };
        newUnreadCount[recipientId] = (newUnreadCount[recipientId] || 0) + 1;
        
        await updateDoc(conversationRef, {
          lastMessage: text,
          lastMessageAt: now,
          lastMessageSenderId: senderId,
          unreadCount: newUnreadCount,
        });
      }
      
      return message;
    } catch (error) {
      console.error('sendMessage error:', error);
      throw error;
    }
  },

  /**
   * Oznacz wiadomości jako przeczytane
   */
  async markAsRead(conversationId: string, userId: string): Promise<void> {
    try {
      // Oznacz wiadomości jako przeczytane
      const q = query(
        collection(db, MESSAGES_COLLECTION),
        where('conversationId', '==', conversationId)
      );
      const snapshot = await getDocs(q);
      
      const updates = snapshot.docs
        .filter(doc => {
          const msg = doc.data() as Message;
          return msg.senderId !== userId && !msg.read;
        })
        .map(doc => updateDoc(doc.ref, { read: true }));
      
      await Promise.all(updates);
      
      // Wyzeruj unread count
      const conversationRef = doc(db, CONVERSATIONS_COLLECTION, conversationId);
      const conversationDoc = await getDoc(conversationRef);
      
      if (conversationDoc.exists()) {
        const conversation = conversationDoc.data() as Conversation;
        const newUnreadCount = { ...conversation.unreadCount };
        newUnreadCount[userId] = 0;
        
        await updateDoc(conversationRef, {
          unreadCount: newUnreadCount,
        });
      }
    } catch (error) {
      console.error('markAsRead error:', error);
    }
  },

  /**
   * Policz nieprzeczytane wiadomości użytkownika
   */
  async countUnread(userId: string): Promise<number> {
    try {
      const conversations = await this.getConversations(userId);
      return conversations.reduce((sum, conv) => sum + (conv.unreadCount[userId] || 0), 0);
    } catch (error) {
      console.error('countUnread error:', error);
      return 0;
    }
  },

  /**
   * Subskrybuj liczbę nieprzeczytanych (real-time)
   */
  subscribeToUnreadCount(
    userId: string,
    callback: (count: number) => void
  ): () => void {
    return this.subscribeToConversations(userId, (conversations) => {
      const count = conversations.reduce((sum, conv) => sum + (conv.unreadCount[userId] || 0), 0);
      callback(count);
    });
  },
};

export default messageService;
