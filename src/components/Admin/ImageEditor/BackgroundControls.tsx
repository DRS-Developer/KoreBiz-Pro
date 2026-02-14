import React from 'react';
import { Palette } from 'lucide-react';

export interface BackgroundConfig {
  type: 'solid' | 'gradient';
  color: string;
  gradient?: string;
}

interface BackgroundControlsProps {
  config: BackgroundConfig;
  onChange: (config: BackgroundConfig) => void;
}

const PRESET_COLORS = [
  '#ffffff', // White
  '#000000', // Black
  '#f3f4f6', // Gray 100
  '#9ca3af', // Gray 400
  '#ef4444', // Red 500
  '#f97316', // Orange 500
  '#eab308', // Yellow 500
  '#22c55e', // Green 500
  '#3b82f6', // Blue 500
  '#8b5cf6', // Violet 500
  '#ec4899', // Pink 500
];

const BackgroundControls: React.FC<BackgroundControlsProps> = ({ config, onChange }) => {
  const handleColorChange = (color: string) => {
    onChange({ ...config, type: 'solid', color });
  };

  return (
    <div className="space-y-4">
      <label className="flex items-center text-sm font-medium text-gray-300 mb-2">
        <Palette size={16} className="mr-2" /> Cor de Fundo
      </label>
      
      {/* Preset Colors */}
      <div className="grid grid-cols-6 gap-2">
        {PRESET_COLORS.map((color) => (
          <button
            key={color}
            type="button"
            className={`w-8 h-8 rounded-full border-2 ${
              config.type === 'solid' && config.color === color
                ? 'border-blue-500 scale-110'
                : 'border-transparent hover:border-gray-400'
            }`}
            style={{ backgroundColor: color }}
            onClick={() => handleColorChange(color)}
            aria-label={`Select color ${color}`}
          />
        ))}
        {/* Custom Color Input */}
        <div className="relative w-8 h-8 rounded-full overflow-hidden border-2 border-gray-600 hover:border-gray-400">
           <input
            type="color"
            value={config.type === 'solid' ? config.color : '#ffffff'}
            onChange={(e) => handleColorChange(e.target.value)}
            className="absolute -top-1/2 -left-1/2 w-[200%] h-[200%] p-0 cursor-pointer border-0"
          />
        </div>
      </div>
      
      {/* TODO: Add Gradient controls if needed in future iterations */}
    </div>
  );
};

export default BackgroundControls;
