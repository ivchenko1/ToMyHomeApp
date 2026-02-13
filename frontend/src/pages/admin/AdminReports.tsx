import { useState, useEffect } from 'react';
import {
  Flag,
  Eye,
  Trash2,
  CheckCircle,
  XCircle,
  Clock,
  Loader2,
  AlertTriangle,
  MessageSquare,
} from 'lucide-react';
import reviewService from '../../services/reviewService';

interface Report {
  id: string;
  type: string;
  reviewId: string;
  reporterId: string;
  reporterName: string;
  reason: string;
  reviewContent: string;
  reviewAuthor: string;
  providerId: string;
  providerName: string;
  status: 'pending' | 'reviewed' | 'dismissed' | 'action_taken';
  createdAt: string;
  reviewedAt?: string;
  adminNote?: string;
}

const AdminReports = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'reviewed'>('all');
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [adminNote, setAdminNote] = useState('');

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    setIsLoading(true);
    try {
      const data = await reviewService.getReports();
      setReports(data as Report[]);
    } catch (error) {
      console.error('Error loading reports:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAction = async (action: 'dismiss' | 'delete_review') => {
    if (!selectedReport) return;
    
    setActionLoading(true);
    try {
      if (action === 'dismiss') {
        await reviewService.updateReportStatus(selectedReport.id, 'dismissed', adminNote);
      } else if (action === 'delete_review') {
        await reviewService.deleteReview(selectedReport.reviewId);
        await reviewService.updateReportStatus(selectedReport.id, 'action_taken', adminNote);
      }
      
      setShowModal(false);
      loadReports();
    } catch (error) {
      console.error('Error handling report:', error);
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { text: 'Oczekuje', bg: 'bg-yellow-100', color: 'text-yellow-700', icon: Clock },
      reviewed: { text: 'Rozpatrzone', bg: 'bg-blue-100', color: 'text-blue-700', icon: Eye },
      dismissed: { text: 'Odrzucone', bg: 'bg-gray-100', color: 'text-gray-700', icon: XCircle },
      action_taken: { text: 'Usunięto opinię', bg: 'bg-red-100', color: 'text-red-700', icon: Trash2 },
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    const Icon = config.icon;
    
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${config.bg} ${config.color}`}>
        <Icon className="w-3 h-3" />
        {config.text}
      </span>
    );
  };

  const filteredReports = reports.filter(report => {
    if (filter === 'all') return true;
    if (filter === 'pending') return report.status === 'pending';
    if (filter === 'reviewed') return report.status !== 'pending';
    return true;
  });

  const pendingCount = reports.filter(r => r.status === 'pending').length;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-red-500" />
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Flag className="w-7 h-7 text-red-500" />
          Zgłoszenia opinii
          {pendingCount > 0 && (
            <span className="ml-2 px-2 py-1 bg-red-500 text-white text-sm rounded-full">
              {pendingCount} nowych
            </span>
          )}
        </h1>
        <p className="text-gray-500 mt-1">Zarządzaj zgłoszeniami użytkowników dotyczącymi opinii</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gray-100 rounded-lg">
              <MessageSquare className="w-5 h-5 text-gray-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{reports.length}</p>
              <p className="text-sm text-gray-500">Wszystkie zgłoszenia</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Clock className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{pendingCount}</p>
              <p className="text-sm text-gray-500">Oczekujące</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{reports.filter(r => r.status === 'dismissed').length}</p>
              <p className="text-sm text-gray-500">Odrzucone</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <Trash2 className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{reports.filter(r => r.status === 'action_taken').length}</p>
              <p className="text-sm text-gray-500">Usunięte opinie</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-6">
        {(['all', 'pending', 'reviewed'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === f
                ? 'bg-red-500 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
          >
            {f === 'all' && 'Wszystkie'}
            {f === 'pending' && `Oczekujące (${pendingCount})`}
            {f === 'reviewed' && 'Rozpatrzone'}
          </button>
        ))}
      </div>

      {/* Reports List */}
      {filteredReports.length === 0 ? (
        <div className="bg-white rounded-xl p-8 text-center">
          <Flag className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">Brak zgłoszeń do wyświetlenia</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredReports.map((report) => (
            <div key={report.id} className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    {getStatusBadge(report.status)}
                    <span className="text-sm text-gray-400">
                      {new Date(report.createdAt).toLocaleString('pl-PL')}
                    </span>
                  </div>
                  
                  {/* Zgłoszona opinia */}
                  <div className="p-4 bg-gray-50 rounded-lg mb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 bg-gradient-to-r from-primary to-secondary rounded-full flex items-center justify-center text-white text-sm font-bold">
                        {report.reviewAuthor.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-sm">{report.reviewAuthor}</p>
                        <p className="text-xs text-gray-500">Opinia dla: {report.providerName}</p>
                      </div>
                    </div>
                    <p className="text-gray-600 italic">"{report.reviewContent}"</p>
                  </div>
                  
                  {/* Powód zgłoszenia */}
                  <div className="flex items-start gap-2 mb-2">
                    <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Powód zgłoszenia:</p>
                      <p className="text-sm text-gray-600">{report.reason}</p>
                    </div>
                  </div>
                  
                  <p className="text-xs text-gray-400 mt-2">
                    Zgłoszone przez: {report.reporterName}
                  </p>
                  
                  {report.adminNote && (
                    <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                      <p className="text-xs font-medium text-blue-700">Notatka admina:</p>
                      <p className="text-sm text-blue-600">{report.adminNote}</p>
                    </div>
                  )}
                </div>
                
                {report.status === 'pending' && (
                  <button
                    onClick={() => {
                      setSelectedReport(report);
                      setAdminNote('');
                      setShowModal(true);
                    }}
                    className="px-4 py-2 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600 flex items-center gap-2"
                  >
                    <Eye className="w-4 h-4" />
                    Rozpatrz
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Action Modal */}
      {showModal && selectedReport && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Flag className="w-5 h-5 text-red-500" />
              Rozpatrz zgłoszenie
            </h3>
            
            {/* Opinia */}
            <div className="p-4 bg-gray-50 rounded-lg mb-4">
              <p className="text-sm font-medium mb-1">{selectedReport.reviewAuthor} napisał:</p>
              <p className="text-gray-600 italic">"{selectedReport.reviewContent}"</p>
            </div>
            
            {/* Powód */}
            <div className="mb-4">
              <p className="text-sm font-medium text-gray-700">Powód zgłoszenia:</p>
              <p className="text-gray-600">{selectedReport.reason}</p>
            </div>
            
            {/* Notatka admina */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notatka (opcjonalnie)
              </label>
              <textarea
                value={adminNote}
                onChange={(e) => setAdminNote(e.target.value)}
                placeholder="Dodaj notatkę do decyzji..."
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-red-500 focus:ring-0 resize-none"
                rows={2}
              />
            </div>
            
            {/* Akcje */}
            <div className="flex gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl font-medium hover:bg-gray-50"
              >
                Anuluj
              </button>
              <button
                onClick={() => handleAction('dismiss')}
                disabled={actionLoading}
                className="flex-1 px-4 py-3 bg-gray-500 text-white rounded-xl font-medium hover:bg-gray-600 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
                Odrzuć
              </button>
              <button
                onClick={() => handleAction('delete_review')}
                disabled={actionLoading}
                className="flex-1 px-4 py-3 bg-red-500 text-white rounded-xl font-medium hover:bg-red-600 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                Usuń opinię
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminReports;
