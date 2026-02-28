import { useState } from 'react';
import { ThumbsUp, Star } from 'lucide-react';

interface ReviewCardProps {
  review: {
    id: number;
    author: string;
    avatar: string;
    service: string;
    date: string;
    rating: number;
    content: string;
    helpful: number;
    gradientClass: string;
  };
}

const ReviewCard = ({ review }: ReviewCardProps) => {
  const [helpfulCount, setHelpfulCount] = useState(review.helpful);
  const [hasVoted, setHasVoted] = useState(false);

  const handleHelpful = () => {
    if (!hasVoted) {
      setHelpfulCount(prev => prev + 1);
      setHasVoted(true);
    }
  };

  return (
    <div className="card card-hover p-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-4">
        <div
          className={`w-12 h-12 rounded-full ${review.gradientClass} flex items-center justify-center text-white font-bold text-lg`}
        >
          {review.avatar}
        </div>
        <div>
          <h4 className="font-semibold text-gray-900">{review.author}</h4>
          <p className="text-sm text-gray-500">
            {review.service} • {review.date}
          </p>
        </div>
      </div>

      {/* Stars */}
      <div className="flex items-center gap-1 mb-4">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`w-4 h-4 ${
              i < review.rating
                ? 'fill-yellow-400 text-yellow-400'
                : 'text-gray-300'
            }`}
          />
        ))}
      </div>

      {/* Content */}
      <p className="text-gray-600 leading-relaxed mb-4">{review.content}</p>

      {/* Footer */}
      <button
        onClick={handleHelpful}
        disabled={hasVoted}
        className={`flex items-center gap-2 text-sm transition-colors ${
          hasVoted
            ? 'text-accent cursor-default'
            : 'text-gray-500 hover:text-accent'
        }`}
      >
        <ThumbsUp className="w-4 h-4" />
        <span>Pomocne ({helpfulCount})</span>
      </button>
    </div>
  );
};

export default ReviewCard;
