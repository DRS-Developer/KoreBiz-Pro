import React from 'react';
import { LucideIcon } from 'lucide-react';

interface SettingsCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  onClick: () => void;
  color?: string;
}

const SettingsCard: React.FC<SettingsCardProps> = ({ 
  title, 
  description, 
  icon: Icon, 
  onClick,
  color = 'text-blue-600'
}) => {
  return (
    <div
      className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm cursor-pointer flex flex-col h-full"
      onClick={onClick}
    >
      <div className={`p-3 rounded-lg w-fit mb-4 bg-gray-50 ${color}`}>
        <Icon size={28} />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-sm text-gray-500 leading-relaxed">{description}</p>
    </div>
  );
};

export default SettingsCard;
