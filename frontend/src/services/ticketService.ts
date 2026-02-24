/**
 * Ticket Service - zarządzanie zgłoszeniami kontaktowymi
 * Zgłoszenia trafiają do panelu administracyjnego
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
  orderBy,
  onSnapshot,
} from 'firebase/firestore';
import { db } from '../firebase';

// ============================================
// TYPY
// ============================================

export type TicketStatus = 'new' | 'open' | 'in_progress' | 'resolved' | 'closed';
export type TicketPriority = 'low' | 'normal' | 'high' | 'urgent';

export type TicketSubject = 
  | 'general'      // Pytanie ogólne
  | 'booking'      // Problem z rezerwacją
  | 'account'      // Problem z kontem
  | 'specialist'   // Chcę zostać specjalistą
  | 'partnership'  // Współpraca biznesowa
  | 'complaint'    // Reklamacja
  | 'other';       // Inne

export interface ContactTicket {
  id: string;
  
  // Dane kontaktowe
  name: string;
  email: string;
  phone?: string;
  
  // Treść zgłoszenia
  subject: TicketSubject;
  subjectLabel: string;
  message: string;
  
  // Status
  status: TicketStatus;
  priority: TicketPriority;
  
  // Powiązanie z użytkownikiem (jeśli zalogowany)
  userId?: string;
  
  // Obsługa przez admina
  assignedTo?: string;
  assignedToName?: string;
  adminNotes?: string;
  resolution?: string;
  
  // Daty
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
  closedAt?: string;
}

// ============================================
// HELPERS
// ============================================

const TICKETS_COLLECTION = 'contactTickets';

const generateId = (): string => {
  return 'TKT' + Date.now().toString(36).toUpperCase() + Math.random().toString(36).substr(2, 5).toUpperCase();
};

const subjectLabels: Record<TicketSubject, string> = {
  general: 'Pytanie ogólne',
  booking: 'Problem z rezerwacją',
  account: 'Problem z kontem',
  specialist: 'Chcę zostać specjalistą',
  partnership: 'Współpraca biznesowa',
  complaint: 'Reklamacja',
  other: 'Inne',
};

// ============================================
// PUBLIC API
// ============================================

export const ticketService = {
  /**
   * Utwórz nowe zgłoszenie kontaktowe
   */
  async create(data: {
    name: string;
    email: string;
    phone?: string;
    subject: TicketSubject;
    message: string;
    userId?: string;
  }): Promise<ContactTicket> {
    const id = generateId();
    const now = new Date().toISOString();
    
    // Ustal priorytet na podstawie tematu
    let priority: TicketPriority = 'normal';
    if (data.subject === 'complaint') priority = 'high';
    if (data.subject === 'partnership') priority = 'low';
    
    const ticket: ContactTicket = {
      id,
      name: data.name,
      email: data.email,
      ...(data.phone ? { phone: data.phone } : {}),
      subject: data.subject,
      subjectLabel: subjectLabels[data.subject],
      message: data.message,
      status: 'new',
      priority,
      ...(data.userId ? { userId: data.userId } : {}),
      createdAt: now,
      updatedAt: now,
    };
    
    try {
      await setDoc(doc(db, TICKETS_COLLECTION, id), ticket);
      console.log('Contact ticket created:', id);
      return ticket;
    } catch (error) {
      console.error('Ticket create error:', error);
      throw error;
    }
  },

  /**
   * Pobierz ticket po ID
   */
  async getById(id: string): Promise<ContactTicket | null> {
    try {
      const docRef = doc(db, TICKETS_COLLECTION, id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return docSnap.data() as ContactTicket;
      }
      return null;
    } catch (error) {
      console.error('Ticket getById error:', error);
      return null;
    }
  },

  /**
   * Pobierz wszystkie tickety (dla admina)
   */
  async getAll(): Promise<ContactTicket[]> {
    try {
      const q = query(collection(db, TICKETS_COLLECTION));
      const snapshot = await getDocs(q);
      const tickets = snapshot.docs.map(doc => doc.data() as ContactTicket);
      return tickets.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    } catch (error) {
      console.error('Ticket getAll error:', error);
      return [];
    }
  },

  /**
   * Pobierz tickety po statusie
   */
  async getByStatus(status: TicketStatus): Promise<ContactTicket[]> {
    try {
      const q = query(
        collection(db, TICKETS_COLLECTION),
        where('status', '==', status)
      );
      const snapshot = await getDocs(q);
      const tickets = snapshot.docs.map(doc => doc.data() as ContactTicket);
      return tickets.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    } catch (error) {
      console.error('Ticket getByStatus error:', error);
      return [];
    }
  },

  /**
   * Aktualizuj status ticketu
   */
  async updateStatus(ticketId: string, status: TicketStatus, adminNotes?: string): Promise<void> {
    try {
      const now = new Date().toISOString();
      const updates: Partial<ContactTicket> = {
        status,
        updatedAt: now,
      };
      
      if (adminNotes) {
        updates.adminNotes = adminNotes;
      }
      
      if (status === 'resolved') {
        updates.resolvedAt = now;
      }
      if (status === 'closed') {
        updates.closedAt = now;
      }
      
      await updateDoc(doc(db, TICKETS_COLLECTION, ticketId), updates);
      console.log('Ticket status updated:', ticketId, status);
    } catch (error) {
      console.error('Ticket updateStatus error:', error);
      throw error;
    }
  },

  /**
   * Przypisz ticket do admina
   */
  async assignTo(ticketId: string, adminId: string, adminName: string): Promise<void> {
    try {
      await updateDoc(doc(db, TICKETS_COLLECTION, ticketId), {
        assignedTo: adminId,
        assignedToName: adminName,
        status: 'in_progress',
        updatedAt: new Date().toISOString(),
      });
      console.log('Ticket assigned:', ticketId, adminName);
    } catch (error) {
      console.error('Ticket assignTo error:', error);
      throw error;
    }
  },

  /**
   * Dodaj rozwiązanie i zamknij ticket
   */
  async resolve(ticketId: string, resolution: string): Promise<void> {
    try {
      const now = new Date().toISOString();
      await updateDoc(doc(db, TICKETS_COLLECTION, ticketId), {
        status: 'resolved',
        resolution,
        resolvedAt: now,
        updatedAt: now,
      });
      console.log('Ticket resolved:', ticketId);
    } catch (error) {
      console.error('Ticket resolve error:', error);
      throw error;
    }
  },

  /**
   * Subskrybuj tickety (real-time dla admina)
   */
  subscribeToTickets(callback: (tickets: ContactTicket[]) => void): () => void {
    const q = query(collection(db, TICKETS_COLLECTION));
    
    return onSnapshot(q, (snapshot) => {
      const tickets = snapshot.docs.map(doc => doc.data() as ContactTicket);
      tickets.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      callback(tickets);
    });
  },

  /**
   * Pobierz statystyki ticketów
   */
  async getStats(): Promise<{
    total: number;
    new: number;
    open: number;
    inProgress: number;
    resolved: number;
  }> {
    try {
      const tickets = await this.getAll();
      return {
        total: tickets.length,
        new: tickets.filter(t => t.status === 'new').length,
        open: tickets.filter(t => t.status === 'open').length,
        inProgress: tickets.filter(t => t.status === 'in_progress').length,
        resolved: tickets.filter(t => t.status === 'resolved' || t.status === 'closed').length,
      };
    } catch (error) {
      console.error('Ticket getStats error:', error);
      return { total: 0, new: 0, open: 0, inProgress: 0, resolved: 0 };
    }
  },

  /**
   * Formatuj status po polsku
   */
  getStatusLabel(status: TicketStatus): string {
    switch (status) {
      case 'new': return 'Nowe';
      case 'open': return 'Otwarte';
      case 'in_progress': return 'W trakcie';
      case 'resolved': return 'Rozwiązane';
      case 'closed': return 'Zamknięte';
      default: return status;
    }
  },

  /**
   * Pobierz kolor statusu
   */
  getStatusColor(status: TicketStatus): string {
    switch (status) {
      case 'new': return 'red';
      case 'open': return 'yellow';
      case 'in_progress': return 'blue';
      case 'resolved': return 'green';
      case 'closed': return 'gray';
      default: return 'gray';
    }
  },

  /**
   * Formatuj priorytet po polsku
   */
  getPriorityLabel(priority: TicketPriority): string {
    switch (priority) {
      case 'low': return 'Niski';
      case 'normal': return 'Normalny';
      case 'high': return 'Wysoki';
      case 'urgent': return 'Pilny';
      default: return priority;
    }
  },
};

export default ticketService;
