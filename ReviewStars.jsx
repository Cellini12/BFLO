import React from 'react';
import { Star } from 'lucide-react';

export default function ReviewStars({ rating, totalReviews, size = 'sm' }) {
  const starSizeClasses = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6",
  };

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center">
        {[...Array(5)].map((_, index) => (
          <Star
            key={index}
            className={`${starSizeClasses[size]} ${
              rating > index ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
            }`}
          />
        ))}
      </div>
      {totalReviews !== undefined && (
        <span className="text-sm text-gray-500">
          ({totalReviews} reviews)
        </span>
      )}
    </div>
  );
}