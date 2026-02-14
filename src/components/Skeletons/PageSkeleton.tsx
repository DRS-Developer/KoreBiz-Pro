import React from 'react';
import { clsx } from 'clsx';

interface PageSkeletonProps {
  type?: 'default' | 'home';
}

const PageSkeleton: React.FC<PageSkeletonProps> = ({ type = 'default' }) => {
  if (type === 'home') {
    return (
      <div className="flex flex-col min-h-screen">
        <section className="relative bg-gray-200 h-[500px] md:h-[600px] flex items-center animate-pulse">
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-3xl space-y-6">
              <div className="h-16 bg-gray-300 rounded w-3/4"></div>
              <div className="h-6 bg-gray-300 rounded w-1/2"></div>
              <div className="flex gap-4">
                <div className="h-12 bg-gray-300 rounded w-40"></div>
                <div className="h-12 bg-gray-300 rounded w-40"></div>
              </div>
            </div>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen animate-pulse">
      {/* Header Skeleton */}
      <div className="bg-gray-200 h-64 w-full">
        <div className="container mx-auto px-4 py-16 h-full flex flex-col justify-center">
          <div className="h-10 bg-gray-300 rounded w-1/3 mb-4"></div>
          <div className="h-6 bg-gray-300 rounded w-1/2"></div>
        </div>
      </div>

      {/* Content Skeleton */}
      <div className="container mx-auto px-4 py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="space-y-4">
            <div className="h-8 bg-gray-200 rounded w-3/4 mb-6"></div>
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            <div className="h-4 bg-gray-200 rounded w-full"></div>
          </div>
          <div className="h-80 bg-gray-200 rounded-lg"></div>
        </div>
      </div>
    </div>
  );
};

export default PageSkeleton;
