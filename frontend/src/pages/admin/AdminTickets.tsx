import { useState, useEffect } from 'react';
import {
  Mail,
  Eye,
  CheckCircle,
  Clock,
  AlertCircle,
  Loader2,
  MessageSquare,
  User,
  Calendar,
  Tag,
  X,
  Send,
  Filter,
} from 'lucide-react';
import ticketService, { ContactTicket, TicketStatus } from '../../services/ticketService';
import { useAuth, useToast } from '../../App';

const AdminTickets = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  
  const [tickets, setTickets] = useState<ContactTicket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | TicketStatus>('all');
  const [selectedTicket, setSelectedTicket] = useState<ContactTicket | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [resolution, setResolution] = useState('');
  const [stats, setStats] = useState({ total: 0, new: 0, open: 0, inProgress: 0, resolved: 0 });

  useEffect(() => {
    // Subskrybuj tickety w czasie rzeczywistym
    const unsubscribe = ticketService.subscribeToTickets((data) => {
      setTickets(data);
      setIsLoading(false);
    });
    
    // Pobierz statystyki
    loadStats();
    
    return () => unsubscribe();
  }, []);

  const loadStats = async () => {
    const data = await ticketService.getStats();
    setStats(data);
  };

  const handleViewTicket = (ticket: ContactTicket) => {
    setSelectedTicket(ticket);
    setResolution('');
    setShowModal(true);
    
    // Jeśli ticket jest 'new', zmień na 'open'
    if (ticket.status === 'new') {
      ticketService.updateStatus(ticket.id, 'open');
    }
  };

  const handleTakeTicket = async () => {
    if (!selectedTicket || !user) return;
    
    setActionLoading(true);
    try {
      await ticketService.assignTo(selectedTicket.id, user.id, user.username || 'Admin');
      showToast('Przypisano do Ciebie', 'success');
      loadStats();
    } catch (error) {
      showToast('Błąd przypisywania', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleResolve = async () => {
    if (!selectedTicket || !resolution.trim()) {
      showToast('Wpisz treść odpowiedzi', 'error');
      return;
    }
    
    setActionLoading(true);
    try {
      await ticketService.resolve(selectedTicket.id, resolution);
      showToast('Zgłoszenie rozwiązane', 'success');
      setShowModal(false);
      loadStats();
    } catch (error) {
      showToast('Błąd rozwiązywania zgłoszenia', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleClose = async () => {
    if (!selectedTicket) return;
    
    setActionLoading(true);
    try {
      await ticketService.updateStatus(selectedTicket.id, 'closed');
      showToast('Zgłoszenie zamknięte', 'success');
      setShowModal(false);
      loadStats();
    } catch (error) {
      showToast('Błąd zamykania zgłoszenia', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (status: TicketStatus) => {
    const color = ticketService.getStatusColor(status);
    const label = ticketService.getStatusLabel(status);
    
    const colorClasses: Record<string, string> = {
      red: 'bg-red-100 text-red-700',
      yellow: 'bg-yellow-100 text-yellow-700',
      blue: 'bg-blue-100 text-blue-700',
      green: 'bg-green-100 text-green-700',
      gray: 'bg-gray-100 text-gray-700',
    };
    
    const iconMap: Record<TicketStatus, JSX.Element> = {
      new: <AlertCircle className="w-3 h-3" />,
      open: <Eye className="w-3 h-3" />,
      in_progress: <Clock className="w-3 h-3" />,
      resolved: <CheckCircle className="w-3 h-3" />,
      closed: <CheckCircle className="w-3 h-3" />,
    };
    
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${colorClasses[color]}`}>
        {iconMap[status]}
        {label}
      </span>
    );
  };

  const getPriorityBadge = (priority: string) => {
    const colors: Record<string, string> = {
      low: 'bg-gray-100 text-gray-600',
      normal: 'bg-blue-100 text-blue-600',
      high: 'bg-orange-100 text-orange-600',
      urgent: 'bg-red-100 text-red-600',
    };
    
    return (
      <span className={`px-2 py-0.5 rounded text-xs font-medium ${colors[priority] || colors.normal}`}>
        {ticketService.getPriorityLabel(priority as any)}
      </span>
    );
  };

  const filteredTickets = tickets.filter(ticket => {
    if (filter === 'all') return true;
    return ticket.status === filter;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-12 h-12 animate-spin text-purple-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Zgłoszenia kontaktowe</h1>
        <p className="text-gray-600">Wiadomości z formularza kontaktowego</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white p-4 rounded-xl shadow-sm">
          <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
          <div className="text-sm text-gray-500">Wszystkie</div>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border-l-4 border-red-500">
          <div className="text-2xl font-bold text-red-600">{stats.new}</div>
          <div className="text-sm text-gray-500">Nowe</div>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border-l-4 border-yellow-500">
          <div className="text-2xl font-bold text-yellow-600">{stats.open}</div>
          <div className="text-sm text-gray-500">Otwarte</div>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border-l-4 border-blue-500">
          <div className="text-2xl font-bold text-blue-600">{stats.inProgress}</div>
          <div className="text-sm text-gray-500">W trakcie</div>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border-l-4 border-green-500">
          <div className="text-2xl font-bold text-green-600">{stats.resolved}</div>
          <div className="text-sm text-gray-500">Rozwiązane</div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 flex-wrap">
        <Filter className="w-5 h-5 text-gray-400" />
        {(['all', 'new', 'open', 'in_progress', 'resolved', 'closed'] as const).map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              filter === status
                ? 'bg-purple-100 text-purple-700'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {status === 'all' ? 'Wszystkie' : ticketService.getStatusLabel(status)}
          </button>
        ))}
      </div>

      {/* Tickets List */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {filteredTickets.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <Mail className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>Brak zgłoszeń</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredTickets.map((ticket) => (
              <div
                key={ticket.id}
                className="p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                onClick={() => handleViewTicket(ticket)}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      {getStatusBadge(ticket.status)}
                      {getPriorityBadge(ticket.priority)}
                      <span className="text-xs text-gray-400">#{ticket.id}</span>
                    </div>
                    <div className="font-medium text-gray-900 truncate">
                      {ticket.subjectLabel}
                    </div>
                    <div className="text-sm text-gray-600 line-clamp-1 mt-1">
                      {ticket.message}
                    </div>
                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        {ticket.name}
                      </span>
                      <span className="flex items-center gap-1">
                        <Mail className="w-3 h-3" />
                        {ticket.email}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(ticket.createdAt).toLocaleDateString('pl-PL')}
                      </span>
                    </div>
                  </div>
                  <Eye className="w-5 h-5 text-gray-400" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && selectedTicket && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    {getStatusBadge(selectedTicket.status)}
                    {getPriorityBadge(selectedTicket.priority)}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">
                    {selectedTicket.subjectLabel}
                  </h3>
                  <p className="text-sm text-gray-500">#{selectedTicket.id}</p>
                </div>
                <button onClick={() => setShowModal(false)}>
                  <X className="w-6 h-6 text-gray-400 hover:text-gray-600" />
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Dane kontaktowe */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-xl">
                  <div className="text-sm text-gray-500 mb-1">Od</div>
                  <div className="font-medium text-gray-900">{selectedTicket.name}</div>
                  <div className="text-sm text-gray-600">{selectedTicket.email}</div>
                  {selectedTicket.phone && (
                    <div className="text-sm text-gray-600">{selectedTicket.phone}</div>
                  )}
                </div>
                <div className="bg-gray-50 p-4 rounded-xl">
                  <div className="text-sm text-gray-500 mb-1">Data zgłoszenia</div>
                  <div className="font-medium text-gray-900">
                    {new Date(selectedTicket.createdAt).toLocaleString('pl-PL')}
                  </div>
                  {selectedTicket.assignedToName && (
                    <div className="text-sm text-blue-600 mt-1">
                      Przypisane do: {selectedTicket.assignedToName}
                    </div>
                  )}
                </div>
              </div>

              {/* Treść wiadomości */}
              <div>
                <div className="text-sm font-medium text-gray-700 mb-2">Treść wiadomości</div>
                <div className="bg-gray-50 p-4 rounded-xl text-gray-800 whitespace-pre-wrap">
                  {selectedTicket.message}
                </div>
              </div>

              {/* Rozwiązanie */}
              {selectedTicket.resolution && (
                <div>
                  <div className="text-sm font-medium text-gray-700 mb-2">Rozwiązanie</div>
                  <div className="bg-green-50 p-4 rounded-xl text-green-800">
                    {selectedTicket.resolution}
                  </div>
                </div>
              )}

              {/* Formularz odpowiedzi */}
              {selectedTicket.status !== 'resolved' && selectedTicket.status !== 'closed' && (
                <div>
                  <div className="text-sm font-medium text-gray-700 mb-2">Odpowiedź / Rozwiązanie</div>
                  <textarea
                    value={resolution}
                    onChange={(e) => setResolution(e.target.value)}
                    rows={4}
                    placeholder="Wpisz odpowiedź dla klienta..."
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                  />
                </div>
              )}
            </div>

            {/* Akcje */}
            <div className="p-6 border-t border-gray-100 flex gap-3">
              {selectedTicket.status !== 'resolved' && selectedTicket.status !== 'closed' && (
                <>
                  {!selectedTicket.assignedTo && (
                    <button
                      onClick={handleTakeTicket}
                      disabled={actionLoading}
                      className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg font-medium hover:bg-blue-200 disabled:opacity-50"
                    >
                      Przypisz do mnie
                    </button>
                  )}
                  <button
                    onClick={handleResolve}
                    disabled={actionLoading || !resolution.trim()}
                    className="px-4 py-2 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 disabled:opacity-50 flex items-center gap-2"
                  >
                    {actionLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <CheckCircle className="w-4 h-4" />
                    )}
                    Rozwiąż i odpowiedz
                  </button>
                </>
              )}
              {selectedTicket.status === 'resolved' && (
                <button
                  onClick={handleClose}
                  disabled={actionLoading}
                  className="px-4 py-2 bg-gray-500 text-white rounded-lg font-medium hover:bg-gray-600 disabled:opacity-50"
                >
                  Zamknij zgłoszenie
                </button>
              )}
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 ml-auto"
              >
                Zamknij
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminTickets;
