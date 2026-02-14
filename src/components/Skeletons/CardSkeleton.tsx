import React from 'react';
import { clsx } from 'clsx';

interface CardSkeletonProps {
  count?: number;
  className?: string;
  imageHeight?: string;
}

const CardSkeleton: React.FC<CardSkeletonProps> = ({ 
  count = 6, 
  className = "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8",
  imageHeight = "h-64"
}) => {
  return (
    <div className={className}>
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 animate-pulse">
          {/* Image Skeleton */}
          <div className={clsx("bg-gray-200 w-full", imageHeight)}></div>
          
          {/* Content Skeleton */}
          <div className="p-6 space-y-4">
            {/* Meta tag */}
            <div className="flex gap-2">
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            </div>
            
            {/* Title */}
            <div className="h-7 bg-gray-200 rounded w-3/4"></div>
            
            {/* Description lines */}
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded w-full"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            </div>
            
            {/* Footer/Button */}
            <div className="pt-2">
              <div className="h-5 bg-gray-200 rounded w-1/3"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default CardSkeleton;
