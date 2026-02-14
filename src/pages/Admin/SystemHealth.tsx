import React, { useEffect, useState } from 'react';
import { HealthCheckService, HealthReport } from '../../services/healthCheck';
import { Activity, RefreshCw, Server, Database, Shield, HardDrive, Globe, CheckCircle, XCircle, AlertTriangle, Clock, Zap } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const SystemHealth: React.FC = () => {
  const [report, setReport] = useState<HealthReport | null>(null);
  const [loading, setLoading] = useState(false);

  const runCheck = async () => {
    setLoading(true);
    const result = await HealthCheckService.runFullDiagnosis();
    setReport(result);
    setLoading(false);
  };

  useEffect(() => {
    runCheck();
  }, []);

  const StatusIcon = ({ status }: { status: 'ok' | 'error' }) => {
    if (status === 'ok') return <CheckCircle className="text-green-500" size={20} />;
    return <XCircle className="text-red-500" size={20} />;
  };

  const StatusBadge = ({ status }: { status: 'online' | 'degraded' | 'offline' }) => {
    const configs = {
      online: { bg: 'bg-green-100', text: 'text-green-800', icon: CheckCircle, label: 'Operacional' },
      degraded: { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: AlertTriangle, label: 'Degradado' },
      offline: { bg: 'bg-red-100', text: 'text-red-800', icon: XCircle, label: 'Offline' }
    };
    const config = configs[status];
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${config.bg} ${config.text}`}>
        <Icon size={16} className="mr-2" />
        {config.label}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Diagnóstico do Sistema</h1>
          <p className="text-gray-600 mt-1">Monitoramento em tempo real da conectividade Supabase</p>
        </div>
        <button
          onClick={runCheck}
          disabled={loading}
          className="flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
          <span>Executar Diagnóstico</span>
        </button>
      </div>

      {report && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-50 rounded-lg text-blue-600">
                <Database size={24} />
              </div>
              <StatusIcon status={report.checks.database.status} />
            </div>
            <h3 className="text-lg font-semibold text-gray-800">Banco de Dados</h3>
            <p className="text-sm text-gray-500 mt-1">Conectividade e Leitura</p>
            <div className="mt-4 flex items-center text-sm">
              <Clock size={14} className="mr-1 text-gray-400" />
              <span className={report.checks.database.latency > 500 ? 'text-yellow-600' : 'text-gray-600'}>
                Latência: {report.checks.database.latency}ms
              </span>
            </div>
            {report.checks.database.message && (
               <p className="mt-2 text-xs text-red-500 bg-red-50 p-2 rounded">{report.checks.database.message}</p>
            )}
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-indigo-50 rounded-lg text-indigo-600">
                <Zap size={24} />
              </div>
              <StatusIcon status={report.checks.queryPerformance?.status === 'slow' ? 'error' : (report.checks.queryPerformance?.status || 'ok')} />
            </div>
            <h3 className="text-lg font-semibold text-gray-800">Performance</h3>
            <p className="text-sm text-gray-500 mt-1">Tempo de Resposta (Query)</p>
            <div className="mt-4 flex items-center text-sm">
              <Clock size={14} className="mr-1 text-gray-400" />
              <span className={report.checks.queryPerformance?.status === 'slow' ? 'text-red-600 font-bold' : 'text-gray-600'}>
                {report.checks.queryPerformance?.latency ? `${report.checks.queryPerformance.latency}ms` : 'N/A'}
              </span>
            </div>
            {report.checks.queryPerformance?.status === 'slow' && (
               <p className="mt-2 text-xs text-yellow-600 bg-yellow-50 p-2 rounded">
                 Query lenta detectada ({'>'}500ms). Considere otimizar índices.
               </p>
            )}
            {report.checks.queryPerformance?.message && (
               <p className="mt-2 text-xs text-red-500 bg-red-50 p-2 rounded">{report.checks.queryPerformance.message}</p>
            )}
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-purple-50 rounded-lg text-purple-600">
                <Shield size={24} />
              </div>
              <StatusIcon status={report.checks.auth.status} />
            </div>
            <h3 className="text-lg font-semibold text-gray-800">Autenticação</h3>
            <p className="text-sm text-gray-500 mt-1">Serviço de Sessão</p>
            {report.checks.auth.message && (
               <p className="mt-2 text-xs text-red-500 bg-red-50 p-2 rounded">{report.checks.auth.message}</p>
            )}
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-orange-50 rounded-lg text-orange-600">
                <HardDrive size={24} />
              </div>
              <StatusIcon status={report.checks.storage.status} />
            </div>
            <h3 className="text-lg font-semibold text-gray-800">Storage</h3>
            <p className="text-sm text-gray-500 mt-1">Acesso aos Buckets</p>
            {report.checks.storage.message && (
               <p className="mt-2 text-xs text-red-500 bg-red-50 p-2 rounded">{report.checks.storage.message}</p>
            )}
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-cyan-50 rounded-lg text-cyan-600">
                <Globe size={24} />
              </div>
              <StatusIcon status={report.checks.dns.status} />
            </div>
            <h3 className="text-lg font-semibold text-gray-800">Rede / DNS</h3>
            <p className="text-sm text-gray-500 mt-1">Resolução de Nomes</p>
            {report.checks.dns.message && (
               <p className="mt-2 text-xs text-red-500 bg-red-50 p-2 rounded">{report.checks.dns.message}</p>
            )}
          </div>
        </div>
      )}

      {report && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
            <h3 className="font-semibold text-gray-800">Relatório Geral</h3>
            <StatusBadge status={report.status} />
          </div>
          <div className="p-6">
            <div className="prose prose-sm max-w-none text-gray-600">
              <p>
                <strong>Última verificação:</strong> {format(new Date(report.timestamp), "dd 'de' MMMM 'às' HH:mm:ss", { locale: ptBR })}
              </p>
              <p>
                Este painel executa testes ativos contra a infraestrutura do Supabase configurada no projeto.
                Falhas aqui podem indicar problemas de configuração local (ex: variáveis de ambiente), 
                bloqueios de rede (ex: Firewall corporativo) ou indisponibilidade do provedor (Supabase Status).
              </p>
              <h4 className="font-medium text-gray-800 mt-4 mb-2">Ações Recomendadas em caso de erro:</h4>
              <ul className="list-disc pl-5 space-y-1">
                <li>Verifique sua conexão com a internet.</li>
                <li>Confirme se as variáveis de ambiente <code>VITE_SUPABASE_URL</code> e <code>VITE_SUPABASE_ANON_KEY</code> estão corretas.</li>
                <li>Consulte o <a href="https://status.supabase.com/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Supabase Status</a> para incidentes globais.</li>
                <li>Se o erro for de DNS, tente alterar seu DNS local para 8.8.8.8 (Google) ou 1.1.1.1 (Cloudflare).</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SystemHealth;
