import React, { useEffect, useState } from 'react';
import { HealthCheckService, HealthReport } from '../../services/healthCheck';
import { RefreshCw, Server, Database, Shield, HardDrive, Globe, CheckCircle, XCircle, AlertTriangle, Clock, Zap, Gauge, LayoutTemplate, MousePointer } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { supabase } from '../../lib/supabase';

interface PerformanceStats {
  lcp: number;
  cls: number;
  fid: number;
  inp: number;
  ttfb: number;
  count: number;
}

const SystemHealth: React.FC = () => {
  const [report, setReport] = useState<HealthReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [perfStats, setPerfStats] = useState<PerformanceStats | null>(null);

  const runCheck = async () => {
    setLoading(true);
    const result = await HealthCheckService.runFullDiagnosis();
    setReport(result);
    
    // Fetch Performance Metrics
    fetchPerformanceMetrics();
    
    setLoading(false);
  };

  const fetchPerformanceMetrics = async () => {
    try {
      const { data, error } = await supabase
        .from('performance_metrics')
        .select('metric_name, value')
        .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()); // Last 7 days

      if (error) throw error;

      if (data) {
        const stats: PerformanceStats = { lcp: 0, cls: 0, fid: 0, inp: 0, ttfb: 0, count: 0 };
        const counts = { lcp: 0, cls: 0, inp: 0, ttfb: 0 };

        data.forEach(m => {
          const name = m.metric_name.toLowerCase();
          if (name === 'lcp') { stats.lcp += Number(m.value); counts.lcp++; }
          if (name === 'cls') { stats.cls += Number(m.value); counts.cls++; }
          if (name === 'inp') { stats.inp += Number(m.value); counts.inp++; }
          if (name === 'ttfb') { stats.ttfb += Number(m.value); counts.ttfb++; }
        });

        if (counts.lcp > 0) stats.lcp = stats.lcp / counts.lcp;
        if (counts.cls > 0) stats.cls = stats.cls / counts.cls;
        if (counts.inp > 0) stats.inp = stats.inp / counts.inp;
        if (counts.ttfb > 0) stats.ttfb = stats.ttfb / counts.ttfb;
        stats.count = data.length;

        setPerfStats(stats);
      }
    } catch (err) {
      console.error('Error fetching perf metrics:', err);
    }
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
          className="flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-50"
        >
          <RefreshCw size={20} />
          <span>Executar Diagnóstico</span>
        </button>
      </div>

      {report && (
        <>
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

          {/* Performance Real User Monitoring (RUM) */}
          <div className="mt-8">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Gauge className="text-blue-600" />
              Métricas de Performance Real (RUM)
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* LCP */}
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-500 font-medium text-sm">LCP (Carregamento)</span>
                  <LayoutTemplate size={20} className="text-gray-400" />
                </div>
                <div className="flex items-baseline gap-2">
                  <span className={`text-2xl font-bold ${!perfStats || perfStats.lcp > 2500 ? 'text-yellow-600' : 'text-green-600'}`}>
                    {perfStats ? `${Math.round(perfStats.lcp)}ms` : '-'}
                  </span>
                </div>
                <p className="text-xs text-gray-400 mt-1">Largest Contentful Paint (Ideal &lt; 2.5s)</p>
              </div>

              {/* CLS */}
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-500 font-medium text-sm">CLS (Estabilidade)</span>
                  <LayoutTemplate size={20} className="text-gray-400" />
                </div>
                <div className="flex items-baseline gap-2">
                  <span className={`text-2xl font-bold ${!perfStats || perfStats.cls > 0.1 ? 'text-yellow-600' : 'text-green-600'}`}>
                    {perfStats ? perfStats.cls.toFixed(3) : '-'}
                  </span>
                </div>
                <p className="text-xs text-gray-400 mt-1">Cumulative Layout Shift (Ideal &lt; 0.1)</p>
              </div>

              {/* INP */}
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-500 font-medium text-sm">INP (Interatividade)</span>
                  <MousePointer size={20} className="text-gray-400" />
                </div>
                <div className="flex items-baseline gap-2">
                  <span className={`text-2xl font-bold ${!perfStats || perfStats.inp > 200 ? 'text-yellow-600' : 'text-green-600'}`}>
                    {perfStats ? `${Math.round(perfStats.inp)}ms` : '-'}
                  </span>
                </div>
                <p className="text-xs text-gray-400 mt-1">Interaction to Next Paint (Ideal &lt; 200ms)</p>
              </div>

              {/* TTFB */}
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-500 font-medium text-sm">TTFB (Servidor)</span>
                  <Server size={20} className="text-gray-400" />
                </div>
                <div className="flex items-baseline gap-2">
                  <span className={`text-2xl font-bold ${!perfStats || perfStats.ttfb > 800 ? 'text-yellow-600' : 'text-green-600'}`}>
                    {perfStats ? `${Math.round(perfStats.ttfb)}ms` : '-'}
                  </span>
                </div>
                <p className="text-xs text-gray-400 mt-1">Time to First Byte (Ideal &lt; 0.8s)</p>
              </div>
            </div>
            {!perfStats && (
              <p className="text-sm text-gray-500 mt-2 italic">
                * Coletando dados de uso real... Navegue pelo site para gerar métricas.
              </p>
            )}
          </div>
        </>
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
                <li>Consulte o <a href="https://status.supabase.com/" target="_blank" rel="noopener noreferrer" className="text-blue-600">Supabase Status</a> para incidentes globais.</li>
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
