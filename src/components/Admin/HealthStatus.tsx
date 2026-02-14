import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Activity, AlertTriangle, CheckCircle, XCircle, CloudOff, RefreshCw } from 'lucide-react';
import { HealthCheckService, HealthReport } from '../../services/healthCheck';

const HealthStatus: React.FC = () => {
  const [status, setStatus] = useState<HealthReport['status']>('online');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkHealth = async () => {
      setLoading(true);
      const report = await HealthCheckService.runFullDiagnosis();
      
      setStatus(report.status);
      setLoading(false);
    };

    checkHealth();
    const interval = setInterval(checkHealth, 5 * 60 * 1000); // 5 minutes

    return () => {
        clearInterval(interval);
    };
  }, []);

  if (loading) {
    return (
      <div className="mt-auto px-4 py-3 border-t border-blue-800">
        <div className="flex items-center space-x-2 text-blue-300 text-sm">
          <Activity size={16} className="animate-pulse" />
          <span>Verificando sistema...</span>
        </div>
      </div>
    );
  }

  const getStatusConfig = () => {
    switch (status) {
      case 'online':
        return { icon: <CheckCircle size={16} />, color: 'text-green-400', label: 'Online' };
      case 'degraded':
        return { icon: <AlertTriangle size={16} />, color: 'text-yellow-400', label: 'Degradado' };
      case 'offline':
        return { icon: <CloudOff size={16} />, color: 'text-red-400', label: 'Offline' };
    }
  };

  const config = getStatusConfig();

  return (
    <div className="mt-auto px-4 py-3 border-t border-blue-800">
      <Link to="/admin/system-health" className="group block">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs font-semibold text-blue-300 uppercase tracking-wider">Status do Sistema</span>
          <Activity size={14} className="text-blue-400 group-hover:text-white transition-colors" />
        </div>
        <div className={`flex items-center space-x-2 ${config.color} font-medium text-sm group-hover:opacity-80 transition-opacity`}>
          {config.icon}
          <span>{config.label}</span>
        </div>
      </Link>
    </div>
  );
};

export default HealthStatus;
