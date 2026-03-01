import React from 'react';

const FormSkeleton: React.FC = () => {
  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-gray-200 rounded-full" />
          <div className="h-8 bg-gray-200 rounded w-48" />
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 space-y-6">
        <div className="h-6 bg-gray-200 rounded w-1/4 mb-6" /> {/* Section Title */}
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="space-y-2">
              <div className="h-4 bg-gray-200 rounded w-1/3" />
              <div className="h-10 bg-gray-200 rounded w-full" />
            </div>
          ))}
        </div>

        {/* Text Area / Description */}
        <div className="space-y-2 mt-6">
             <div className="h-4 bg-gray-200 rounded w-1/4" />
             <div className="h-32 bg-gray-200 rounded w-full" />
        </div>
      </div>

       {/* Actions */}
       <div className="flex justify-end gap-4 mt-6">
        <div className="h-10 bg-gray-200 rounded w-24" />
        <div className="h-10 bg-gray-200 rounded w-32" />
      </div>
    </div>
  );
};

export default FormSkeleton;
