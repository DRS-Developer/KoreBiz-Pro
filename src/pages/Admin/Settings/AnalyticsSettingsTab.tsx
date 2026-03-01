import React from 'react';
import { useFormContext } from 'react-hook-form';
import { BarChart3, Code } from 'lucide-react';

const AnalyticsSettingsTab: React.FC = () => {
  const { register } = useFormContext();

  return (
    <div className="space-y-8">
      {/* Google Analytics & GTM */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 space-y-6">
        <div className="flex items-center gap-2 border-b pb-4">
          <BarChart3 className="w-5 h-5 text-gray-500" />
          <h2 className="text-lg font-medium text-gray-900">Google Analytics & Tag Manager</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="col-span-2 md:col-span-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Google Analytics 4 (Measurement ID)
            </label>
            <input
              type="text"
              {...register('analytics_settings.google_analytics_id')}
              placeholder="G-XXXXXXXXXX"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-1">ID de medição do fluxo de dados.</p>
          </div>

          <div className="col-span-2 md:col-span-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Google Tag Manager (Container ID)
            </label>
            <input
              type="text"
              {...register('analytics_settings.google_tag_manager_id')}
              placeholder="GTM-XXXXXXX"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-1">ID do container para gerenciamento avançado de tags.</p>
          </div>
        </div>
      </div>

      {/* Meta Pixel */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 space-y-6">
        <div className="flex items-center gap-2 border-b pb-4">
          <Code className="w-5 h-5 text-gray-500" />
          <h2 className="text-lg font-medium text-gray-900">Meta / Facebook Pixel</h2>
        </div>
        
        <div className="grid grid-cols-1 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Pixel ID
            </label>
            <input
              type="text"
              {...register('analytics_settings.facebook_pixel_id')}
              placeholder="XXXXXXXXXXXXXXXX"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Custom Scripts */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 space-y-6">
        <div className="flex items-center gap-2 border-b pb-4">
          <Code className="w-5 h-5 text-gray-500" />
          <h2 className="text-lg font-medium text-gray-900">Scripts Personalizados</h2>
        </div>
        
        <div className="grid grid-cols-1 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Head Scripts (Global)
            </label>
            <textarea
              {...register('analytics_settings.custom_head_scripts')}
              rows={4}
              placeholder="<script>...</script>"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent font-mono text-xs"
            />
            <p className="text-xs text-gray-500 mt-1">Scripts injetados dentro da tag &lt;head&gt;.</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Body Scripts (Global)
            </label>
            <textarea
              {...register('analytics_settings.custom_body_scripts')}
              rows={4}
              placeholder="<script>...</script>"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent font-mono text-xs"
            />
            <p className="text-xs text-gray-500 mt-1">Scripts injetados no final da tag &lt;body&gt;.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsSettingsTab;
