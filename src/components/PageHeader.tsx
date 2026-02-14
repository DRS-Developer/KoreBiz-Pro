import React from 'react';
import { clsx } from 'clsx';

interface PageHeaderProps {
  title: string;
  description?: string;
  className?: string;
  backgroundImage?: string;
}

const PageHeader: React.FC<PageHeaderProps> = ({ 
  title, 
  description, 
  className,
  backgroundImage 
}) => {
  return (
    <div 
      className={clsx(
        "bg-blue-900 text-white relative overflow-hidden flex flex-col justify-center min-h-[160px]", // Reduced min-height by 50%
        className
      )}
      style={backgroundImage ? {
        backgroundImage: `linear-gradient(rgba(30, 58, 138, 0.9), rgba(30, 58, 138, 0.9)), url(${backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      } : undefined}
    >
      <div className="container mx-auto px-4 py-8 flex-grow flex flex-col justify-center">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 leading-tight">
          {title}
        </h1>
        {description && (
          <p className="text-lg text-blue-100 max-w-3xl leading-relaxed">
            {description}
          </p>
        )}
      </div>
    </div>
  );
};

export default PageHeader;
