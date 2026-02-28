import { useState, useEffect } from 'react';
import {
  Star,
  Flag,
  MessageSquare,
  Loader2,
  TrendingUp,
  X,
  Send,
} from 'lucide-react';
import { useAuth, useToast } from '../../App';
import providerService from '../../services/providerService';
import reviewService, { Review } from '../../services/reviewService';

const BusinessReviews = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [providerId, setProviderId] = useState<string | null>(null);
  const [providerName, setProviderName] = useState('');
  const [filter, setFilter] = useState<'all' | 'positive' | 'negative'>('all');
  const [stats, setStats] = useState({
    average: 0,
    count: 0,
    distribution: [
      { stars: 5, count: 0 },
      { stars: 4, count: 0 },
      { stars: 3, count: 0 },
      { stars: 2, count: 0 },
      { stars: 1, count: 0 },
    ],
  });

  // Modal zgłaszania
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportingReview, setReportingReview] = useState<Review | null>(null);
  const [reportReason, setReportReason] = useState('');
  const [reportSubmitting, setReportSubmitting] = useState(false);

  // Modal odpowiedzi
  const [showReplyModal, setShowReplyModal] = useState(false);
  const [replyingReview, setReplyingReview] = useState<Review | null>(null);
  const [replyText, setReplyText] = useState('');
  const [replySubmitting, setReplySubmitting] = useState(false);

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = async () => {
    if (!user?.id) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const providers = await providerService.getByOwner(user.id.toString());
      
      if (providers.length > 0) {
        const provider = providers[0];
        setProviderId(provider.id);
        setProviderName(provider.name);

        // Pobierz opinie
        const reviewsData = await reviewService.getByProvider(provider.id);
        setReviews(reviewsData);

        // Pobierz statystyki
        const statsData = await reviewService.getProviderStats(provider.id);
        setStats(statsData);
      }
    } catch (error) {
      console.error('Error loading reviews:', error);
      showToast('Błąd ładowania opinii', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Filtrowanie opinii
  const filteredReviews = reviews.filter(review => {
    if (filter === 'positive') return review.rating >= 4;
    if (filter === 'negative') return review.rating <= 2;
    return true;
  });

  // Zgłoś opinię
  const openReportModal = (review: Review) => {
    setReportingReview(review);
    setReportReason('');
    setShowReportModal(true);
  };

  const submitReport = async () => {
    if (!reportingReview || !user || !providerId) return;
    
    if (reportReason.trim().length < 10) {
      showToast('Opisz powód zgłoszenia (min. 10 znaków)', 'error');
      return;
    }
    
    setReportSubmitting(true);
    try {
      await reviewService.reportReview({
        reviewId: reportingReview.id,
        reporterId: user.id,
        reporterName: user.username || 'Usługodawca',
        reason: reportReason.trim(),
        reviewContent: reportingReview.comment,
        reviewAuthor: reportingReview.clientName,
        providerId: providerId,
        providerName: providerName,
      });
      
      setShowReportModal(false);
      showToast('Zgłoszenie wysłane do administratora 🙏', 'success');
    } catch (error) {
      console.error('Error reporting review:', error);
      showToast('Błąd podczas wysyłania zgłoszenia', 'error');
    } finally {
      setReportSubmitting(false);
    }
  };

  // Odpowiedz na opinię
  const openReplyModal = (review: Review) => {
    setReplyingReview(review);
    setReplyText(review.providerResponse || '');
    setShowReplyModal(true);
  };

  const submitReply = async () => {
    if (!replyingReview || !replyText.trim()) return;
    
    setReplySubmitting(true);
    try {
      await reviewService.addProviderResponse(replyingReview.id, replyText.trim());
      
      // Zaktualizuj lokalnie
      setReviews(prev => prev.map(r => 
        r.id === replyingReview.id 
          ? { ...r, providerResponse: replyText.trim() }
          : r
      ));
      
      setShowReplyModal(false);
      showToast('Odpowiedź dodana!', 'success');
    } catch (error) {
      console.error('Error adding response:', error);
      showToast('Błąd podczas dodawania odpowiedzi', 'error');
    } finally {
      setReplySubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pl-PL', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
      </div>
    );
  }

  if (!providerId) {
    return (
      <div className="text-center py-16">
        <Star className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-gray-900 mb-2">Brak profilu usługodawcy</h2>
        <p className="text-gray-500">Najpierw utwórz profil usługodawcy, aby widzieć opinie.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Opinie klientów</h1>
        <p className="text-gray-600">Zobacz co mówią o Tobie klienci</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Średnia ocena */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-amber-100 rounded-xl flex items-center justify-center">
              <Star className="w-8 h-8 text-amber-500 fill-amber-500" />
            </div>
            <div>
              <p className="text-3xl font-bold text-gray-900">{stats.average.toFixed(1)}</p>
              <p className="text-gray-500">Średnia ocena</p>
            </div>
          </div>
        </div>

        {/* Liczba opinii */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-emerald-100 rounded-xl flex items-center justify-center">
              <MessageSquare className="w-8 h-8 text-emerald-500" />
            </div>
            <div>
              <p className="text-3xl font-bold text-gray-900">{stats.count}</p>
              <p className="text-gray-500">Wszystkich opinii</p>
            </div>
          </div>
        </div>

        {/* Pozytywne opinie */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-green-100 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-8 h-8 text-green-500" />
            </div>
            <div>
              <p className="text-3xl font-bold text-gray-900">
                {stats.count > 0 
                  ? Math.round((reviews.filter(r => r.rating >= 4).length / stats.count) * 100)
                  : 0}%
              </p>
              <p className="text-gray-500">Pozytywnych</p>
            </div>
          </div>
        </div>
      </div>

      {/* Rating Distribution */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Rozkład ocen</h3>
        <div className="space-y-3">
          {stats.distribution.map((item) => (
            <div key={item.stars} className="flex items-center gap-3">
              <div className="flex items-center gap-1 w-20">
                <span className="text-sm font-medium">{item.stars}</span>
                <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
              </div>
              <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-400 rounded-full transition-all"
                  style={{
                    width: stats.count > 0 ? `${(item.count / stats.count) * 100}%` : '0%',
                  }}
                />
              </div>
              <span className="text-sm text-gray-500 w-10 text-right">{item.count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Filter */}
      <div className="flex gap-2">
        {(['all', 'positive', 'negative'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === f
                ? 'bg-emerald-500 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
          >
            {f === 'all' && `Wszystkie (${reviews.length})`}
            {f === 'positive' && `Pozytywne (${reviews.filter(r => r.rating >= 4).length})`}
            {f === 'negative' && `Negatywne (${reviews.filter(r => r.rating <= 2).length})`}
          </button>
        ))}
      </div>

      {/* Reviews List */}
      {filteredReviews.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <Star className="w-16 h-16 text-gray-200 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Brak opinii</h3>
          <p className="text-gray-500">
            {filter === 'all' 
              ? 'Jeszcze nikt nie wystawił opinii. Zachęcaj klientów do dzielenia się swoimi wrażeniami!'
              : 'Brak opinii w tej kategorii'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredReviews.map((review) => (
            <div key={review.id} className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                    {review.clientName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">{review.clientName}</h4>
                    <p className="text-sm text-gray-500">{review.serviceName}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-0.5 justify-end">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-5 h-5 ${
                          star <= review.rating
                            ? 'text-amber-400 fill-amber-400'
                            : 'text-gray-200'
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-sm text-gray-400 mt-1">{formatDate(review.createdAt)}</p>
                </div>
              </div>

              <p className="text-gray-700 mb-4">{review.comment}</p>

              {/* Provider Response */}
              {review.providerResponse && (
                <div className="bg-emerald-50 rounded-lg p-4 mb-4">
                  <p className="text-sm font-medium text-emerald-700 mb-1">Twoja odpowiedź:</p>
                  <p className="text-gray-700">{review.providerResponse}</p>
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
                <button
                  onClick={() => openReplyModal(review)}
                  className="flex items-center gap-2 px-3 py-2 text-sm text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                >
                  <MessageSquare className="w-4 h-4" />
                  {review.providerResponse ? 'Edytuj odpowiedź' : 'Odpowiedz'}
                </button>
                <button
                  onClick={() => openReportModal(review)}
                  className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Flag className="w-4 h-4" />
                  Zgłoś
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Report Modal */}
      {showReportModal && reportingReview && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <div className="flex items-start justify-between mb-4">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <Flag className="w-5 h-5 text-red-500" />
                Zgłoś opinię
              </h3>
              <button onClick={() => setShowReportModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 bg-gray-50 rounded-xl mb-6">
              <div className="flex items-center gap-2 mb-2">
                <span className="font-medium text-sm">{reportingReview.clientName}</span>
                <div className="flex items-center gap-0.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} className={`w-3 h-3 ${star <= reportingReview.rating ? 'text-amber-400 fill-amber-400' : 'text-gray-200'}`} />
                  ))}
                </div>
              </div>
              <p className="text-sm text-gray-600 italic">"{reportingReview.comment}"</p>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Dlaczego zgłaszasz tę opinię?
              </label>
              <div className="space-y-2 mb-4">
                {[
                  'Fałszywa opinia (osoba nie korzystała z usługi)',
                  'Obraźliwa lub wulgarna treść',
                  'Spam lub reklama',
                  'Narusza prywatność',
                  'Inny powód',
                ].map((reason) => (
                  <button
                    key={reason}
                    onClick={() => setReportReason(reason)}
                    className={`w-full text-left px-4 py-2 rounded-lg border-2 transition-colors ${
                      reportReason === reason ? 'border-red-500 bg-red-50' : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <span className="text-sm">{reason}</span>
                  </button>
                ))}
              </div>
              <textarea
                value={reportReason}
                onChange={(e) => setReportReason(e.target.value)}
                placeholder="Opisz szczegóły zgłoszenia..."
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-red-500 focus:ring-0 resize-none"
                rows={3}
              />
            </div>

            <div className="flex gap-3">
              <button onClick={() => setShowReportModal(false)} className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl font-medium hover:bg-gray-50">
                Anuluj
              </button>
              <button
                onClick={submitReport}
                disabled={reportSubmitting || reportReason.length < 10}
                className="flex-1 px-4 py-3 bg-red-500 text-white rounded-xl font-semibold hover:bg-red-600 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {reportSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Flag className="w-5 h-5" />}
                Wyślij zgłoszenie
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reply Modal */}
      {showReplyModal && replyingReview && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <div className="flex items-start justify-between mb-4">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-emerald-500" />
                Odpowiedz na opinię
              </h3>
              <button onClick={() => setShowReplyModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 bg-gray-50 rounded-xl mb-6">
              <div className="flex items-center gap-2 mb-2">
                <span className="font-medium text-sm">{replyingReview.clientName}</span>
                <div className="flex items-center gap-0.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} className={`w-3 h-3 ${star <= replyingReview.rating ? 'text-amber-400 fill-amber-400' : 'text-gray-200'}`} />
                  ))}
                </div>
              </div>
              <p className="text-sm text-gray-600 italic">"{replyingReview.comment}"</p>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Twoja odpowiedź
              </label>
              <textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Napisz odpowiedź dla klienta..."
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-0 resize-none"
                rows={4}
              />
              <p className="text-xs text-gray-400 mt-1">
                Odpowiedz profesjonalnie i uprzejmie - klienci to docenią!
              </p>
            </div>

            <div className="flex gap-3">
              <button onClick={() => setShowReplyModal(false)} className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl font-medium hover:bg-gray-50">
                Anuluj
              </button>
              <button
                onClick={submitReply}
                disabled={replySubmitting || !replyText.trim()}
                className="flex-1 px-4 py-3 bg-emerald-500 text-white rounded-xl font-semibold hover:bg-emerald-600 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {replySubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                Wyślij odpowiedź
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BusinessReviews;
