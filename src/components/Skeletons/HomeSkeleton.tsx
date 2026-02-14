import React from 'react';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

const HomeSkeleton: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section Skeleton */}
      <section className="relative bg-gray-200 h-[500px] md:h-[600px] flex items-center">
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl">
            <h1 className="mb-6">
              <Skeleton height={60} width="80%" />
              <Skeleton height={60} width="60%" />
            </h1>
            <p className="mb-8">
              <Skeleton count={3} />
            </p>
            <div className="flex gap-4">
              <Skeleton height={50} width={200} />
              <Skeleton height={50} width={200} />
            </div>
          </div>
        </div>
      </section>

      {/* Services Skeleton */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Skeleton height={40} width={300} className="mb-4" />
            <Skeleton height={20} width={500} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white p-8 rounded-xl shadow-md border-t-4 border-gray-300">
                <Skeleton height={192} className="mb-6 rounded-md" />
                <Skeleton height={32} width="70%" className="mb-3" />
                <Skeleton count={3} className="mb-4" />
                <Skeleton width={100} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Projects Skeleton */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Skeleton height={40} width={300} className="mb-4" />
            <Skeleton height={20} width={400} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-gray-100 rounded-xl overflow-hidden h-full flex flex-col">
                <Skeleton height={200} />
                <div className="p-6 flex-1">
                  <Skeleton width={100} className="mb-2" />
                  <Skeleton height={28} className="mb-2" />
                  <Skeleton count={2} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomeSkeleton;
