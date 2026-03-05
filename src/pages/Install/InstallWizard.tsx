import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Check, Copy, Download, Database, Shield, User, Settings, ArrowRight, Loader2, FileText } from 'lucide-react';
import { toast } from 'sonner';
import { INSTALL_SCHEMA_SQL } from '../../data/install_schema';
import { INSTALL_DATA_SQL } from '../../data/install_data';

const STEPS = [
  { id: 'welcome', title: 'Bem-vindo', icon: Settings },
  { id: 'connect', title: 'Conexão', icon: Database },
  { id: 'schema', title: 'Estrutura', icon: Shield },
  { id: 'data', title: 'Conteúdo', icon: FileText },
  { id: 'admin', title: 'Admin', icon: User },
  { id: 'finish', title: 'Concluir', icon: Check },
];

export default function InstallWizard() {
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [config, setConfig] = useState({
    url: '',
    key: '',
  });
  const [adminData, setAdminData] = useState({
    email: '',
    password: '',
    fullName: 'Administrador',
  });
  const [tempClient, setTempClient] = useState<any>(null);

  // Check environment on mount
  useEffect(() => {
    // If env vars are already present, warn user
    if (import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY) {
      toast.info('Variáveis de ambiente já detectadas. O instalador é opcional.');
    }
  }, []);

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const testConnection = async () => {
    if (!config.url || !config.key) {
      toast.error('Preencha a URL e a Chave API.');
      return;
    }
    
    setLoading(true);
    try {
      const client = createClient(config.url, config.key);
      const { error } = await client.from('profiles').select('count').limit(1);
      
      if (error && (error.code === 'PGRST301' || error.message?.includes('fetch'))) {
         throw error;
      }
      
      setTempClient(client);
      toast.success('Conexão estabelecida com sucesso!');
      handleNext();
    } catch (err: any) {
      console.error(err);
      toast.error('Falha na conexão. Verifique a URL e a Chave.');
    } finally {
      setLoading(false);
    }
  };

  const copySchema = () => {
    navigator.clipboard.writeText(INSTALL_SCHEMA_SQL);
    toast.success('SQL de Estrutura copiado!');
  };

  const copyData = () => {
    navigator.clipboard.writeText(INSTALL_DATA_SQL);
    toast.success('SQL de Dados copiado!');
  };

  const checkTables = async () => {
    if (!tempClient) return;
    setLoading(true);
    const { error } = await tempClient.from('site_settings').select('id').limit(1);
    setLoading(false);
    
    if (error) {
      if (error.code === '42P01') {
        toast.error('Tabelas não encontradas. Execute o SQL no Supabase.');
      } else {
        toast.error(`Erro ao verificar: ${error.message}`);
      }
    } else {
      toast.success('Tabelas detectadas corretamente!');
      handleNext();
    }
  };

  const createAdmin = async () => {
    if (!tempClient) return;
    if (adminData.password.length < 6) {
      toast.error('A senha deve ter pelo menos 6 caracteres.');
      return;
    }
    
    setLoading(true);
    const { error } = await tempClient.auth.signUp({
      email: adminData.email,
      password: adminData.password,
      options: {
        data: {
          full_name: adminData.fullName,
          role: 'admin',
        }
      }
    });

    setLoading(false);

    if (error) {
      toast.error(`Erro ao criar usuário: ${error.message}`);
    } else {
      toast.success('Usuário criado! Verifique seu email para confirmar.');
      toast.info('Nota: Altere o cargo para "admin" manualmente no Supabase se necessário.');
      handleNext();
    }
  };

  const downloadConfig = () => {
    const jsonConfig = {
      VITE_SUPABASE_URL: config.url,
      VITE_SUPABASE_ANON_KEY: config.key
    };
    const blob = new Blob([JSON.stringify(jsonConfig, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'config.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    toast.success('Arquivo config.json baixado!');
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0: // Welcome
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-gray-900">Bem-vindo ao Instalador KoreBiz-Pro</h2>
            <p className="text-gray-600">Este assistente irá guiá-lo na configuração inicial do sistema.</p>
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <h3 className="font-semibold text-blue-800 mb-2">Pré-requisitos:</h3>
              <ul className="list-disc list-inside text-blue-700 space-y-1">
                <li>Um projeto Supabase criado.</li>
                <li>URL e Chave Pública (Anon Key).</li>
              </ul>
            </div>
            <button 
              onClick={handleNext}
              className="mt-4 flex items-center bg-blue-600 text-white px-6 py-2 rounded-lg"
            >
              Começar <ArrowRight className="ml-2 w-4 h-4" />
            </button>
          </div>
        );
      case 1: // Connect
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-gray-900">Conexão com Supabase</h2>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700">Project URL</label>
                <input 
                  type="text" 
                  value={config.url}
                  onChange={(e) => setConfig({...config, url: e.target.value})}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                  placeholder="https://your-project.supabase.co"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Anon Key</label>
                <input 
                  type="text" 
                  value={config.key}
                  onChange={(e) => setConfig({...config, key: e.target.value})}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                  placeholder="eyJhbGciOiJIUzI1NiIsInR5..."
                />
              </div>
            </div>
            <button 
              onClick={testConnection}
              disabled={loading}
              className="mt-4 flex items-center bg-blue-600 text-white px-6 py-2 rounded-lg disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-4 h-4 mr-2" /> : null}
              Testar Conexão
            </button>
          </div>
        );
      case 2: // Schema
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-gray-900">Estrutura do Banco de Dados</h2>
            <p className="text-gray-600 text-sm">
              Execute este SQL no Supabase para criar as tabelas necessárias.
            </p>
            <div className="bg-gray-800 rounded-lg p-4 relative group">
              <button 
                onClick={copySchema}
                className="absolute top-2 right-2 bg-white/10 text-white p-2 rounded"
                title="Copiar SQL"
              >
                <Copy className="w-4 h-4" />
              </button>
              <pre className="text-xs text-green-400 overflow-auto h-48 font-mono">
                {INSTALL_SCHEMA_SQL.slice(0, 500)}...
              </pre>
            </div>
            <button 
              onClick={checkTables}
              disabled={loading}
              className="mt-4 flex items-center bg-green-600 text-white px-6 py-2 rounded-lg disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-4 h-4 mr-2" /> : null}
              Verificar Tabelas
            </button>
          </div>
        );
      case 3: // Data (New Step)
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-gray-900">Dados Iniciais (Opcional)</h2>
            <p className="text-gray-600 text-sm">
              Deseja preencher o site com conteúdo de exemplo (Portfólio, Serviços, Páginas)?
            </p>
            <div className="bg-gray-800 rounded-lg p-4 relative group">
              <button 
                onClick={copyData}
                className="absolute top-2 right-2 bg-white/10 text-white p-2 rounded"
                title="Copiar SQL"
              >
                <Copy className="w-4 h-4" />
              </button>
              <pre className="text-xs text-blue-400 overflow-auto h-48 font-mono">
                {INSTALL_DATA_SQL.slice(0, 500)}...
              </pre>
            </div>
            <div className="flex gap-4">
              <button 
                onClick={handleNext}
                className="mt-4 flex items-center bg-gray-600 text-white px-6 py-2 rounded-lg"
              >
                Próximo (Pular ou Já Executei)
              </button>
            </div>
          </div>
        );
      case 4: // Admin
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-gray-900">Criar Administrador</h2>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700">Nome Completo</label>
                <input 
                  type="text" 
                  value={adminData.fullName}
                  onChange={(e) => setAdminData({...adminData, fullName: e.target.value})}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input 
                  type="email" 
                  value={adminData.email}
                  onChange={(e) => setAdminData({...adminData, email: e.target.value})}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Senha</label>
                <input 
                  type="password" 
                  value={adminData.password}
                  onChange={(e) => setAdminData({...adminData, password: e.target.value})}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                />
              </div>
            </div>
            <div className="flex gap-4">
               <button 
                onClick={createAdmin}
                disabled={loading}
                className="mt-4 flex items-center bg-blue-600 text-white px-6 py-2 rounded-lg disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-4 h-4 mr-2" /> : null}
                Criar Usuário
              </button>
              <button 
                onClick={handleNext}
                className="mt-4 flex items-center bg-gray-200 text-gray-700 px-6 py-2 rounded-lg"
              >
                Pular
              </button>
            </div>
          </div>
        );
      case 5: // Finish
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-gray-900">Instalação Concluída!</h2>
            <p className="text-gray-600">Salve sua configuração para finalizar.</p>
            
            <div className="grid gap-4 md:grid-cols-2">
              <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                <h3 className="font-semibold text-gray-800 mb-2">Opção 1: Hospedagem Compartilhada</h3>
                <button 
                  onClick={downloadConfig}
                  className="w-full flex items-center justify-center bg-indigo-600 text-white px-4 py-2 rounded"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Baixar config.json
                </button>
              </div>

              <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                <h3 className="font-semibold text-gray-800 mb-2">Opção 2: Vercel</h3>
                <div className="bg-gray-100 p-2 rounded text-xs font-mono mb-2 overflow-x-auto">
                  VITE_SUPABASE_URL={config.url}<br/>
                  VITE_SUPABASE_ANON_KEY={config.key}
                </div>
              </div>
            </div>

            <div className="mt-6 text-center">
              <a href="/" className="inline-flex items-center text-blue-600 font-medium">
                Ir para a Página Inicial <ArrowRight className="ml-1 w-4 h-4" />
              </a>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          KoreBiz-Pro Setup
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-3xl">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              {STEPS.map((step, index) => {
                const Icon = step.icon;
                const isActive = index === currentStep;
                const isCompleted = index < currentStep;
                
                return (
                  <div key={step.id} className="flex flex-col items-center flex-1 relative">
                    <div 
                      className={`w-10 h-10 rounded-full flex items-center justify-center border-2 z-10
                        ${isActive ? 'border-blue-600 bg-white text-blue-600' : 
                          isCompleted ? 'border-blue-600 bg-blue-600 text-white' : 
                          'border-gray-200 bg-white text-gray-400'}`}
                    >
                      {isCompleted ? <Check className="w-6 h-6" /> : <Icon className="w-5 h-5" />}
                    </div>
                    <span className={`text-xs mt-2 font-medium ${isActive ? 'text-blue-600' : 'text-gray-500'}`}>
                      {step.title}
                    </span>
                    {/* Line connector */}
                    {index !== STEPS.length - 1 && (
                      <div className={`absolute top-5 left-1/2 w-full h-0.5 -z-0
                        ${index < currentStep ? 'bg-blue-600' : 'bg-gray-200'}`} 
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Content */}
          <div className="mt-6">
            {renderStepContent()}
          </div>
        </div>
      </div>
    </div>
  );
}
