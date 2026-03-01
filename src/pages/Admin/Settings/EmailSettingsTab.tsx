
import React, { useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { Mail, CheckCircle, AlertCircle, Info, Send } from 'lucide-react';
import { toast } from 'sonner';
import emailjs from '@emailjs/browser';

const EmailSettingsTab: React.FC = () => {
  const { register, watch, setValue, formState: { errors } } = useFormContext();
  const [activeProvider, setActiveProvider] = useState<'emailjs' | 'supabase'>('emailjs');
  const [isTesting, setIsTesting] = useState(false);
  const emailErrors = errors as any;

  // Watch current values for testing
  const emailSettings = watch('email_settings') || {
    provider: 'emailjs',
    emailjs: { serviceId: '', templateId: '', publicKey: '' },
    supabase: { functionUrl: '', anonKey: '' }
  };

  // Sync active provider state with form data on mount/change
  React.useEffect(() => {
    if (emailSettings.provider && emailSettings.provider !== activeProvider) {
      setActiveProvider(emailSettings.provider as 'emailjs' | 'supabase');
    }
  }, [emailSettings.provider]);

  const handleProviderChange = (provider: 'emailjs' | 'supabase') => {
    setActiveProvider(provider);
    setValue('email_settings.provider', provider, { shouldDirty: true });
  };

  const testConnection = async () => {
    setIsTesting(true);
    try {
      if (activeProvider === 'emailjs') {
        const { serviceId, templateId, publicKey } = emailSettings.emailjs;
        
        if (!serviceId || !templateId || !publicKey) {
          toast.error('Preencha todos os campos do EmailJS antes de testar.');
          return;
        }

        // Send a test email
        await emailjs.send(
          serviceId,
          templateId,
          {
            to_name: 'Admin',
            from_name: 'Teste de Conexão',
            message: 'Este é um e-mail de teste para verificar suas configurações.',
            email: 'teste@exemplo.com',
            phone: '000000000'
          },
          publicKey
        );

        toast.success('Conexão com EmailJS bem-sucedida! Verifique sua caixa de entrada.');
      } else {
        // Supabase Edge Function Test
        const { functionUrl, anonKey } = emailSettings.supabase;
        
        if (!functionUrl || !anonKey) {
          toast.error('Preencha a URL e a Anon Key antes de testar.');
          return;
        }

        const response = await fetch(functionUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${anonKey}`
          },
          body: JSON.stringify({
            name: 'Teste Admin',
            email: 'teste@exemplo.com',
            phone: '000000000',
            message: 'Este é um teste de conexão da Edge Function.',
            subject: 'Teste de Conexão - Supabase Edge Function'
          })
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || `Erro ${response.status}: ${response.statusText}`);
        }

        toast.success('Teste de Edge Function enviado com sucesso! Verifique o email do admin.');
      }
    } catch (error: any) {
      console.error('Test failed:', error);
      toast.error(`Falha no teste: ${error.message || 'Erro desconhecido'}`);
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="flex items-center gap-2 border-b pb-4 mb-6">
          <Mail className="w-5 h-5 text-gray-500" />
          <h2 className="text-lg font-medium text-gray-900">Configuração de Envio de E-mail</h2>
        </div>

        {/* Provider Selection */}
        <div className="mb-8">
          <label className="block text-sm font-medium text-gray-700 mb-4">Escolha o Provedor de E-mail</label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => handleProviderChange('emailjs')}
              className={`relative p-4 rounded-lg border-2 text-left ${
            activeProvider === 'emailjs'
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-200'
          }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-gray-900">EmailJS</span>
                {activeProvider === 'emailjs' && <CheckCircle className="text-blue-500 w-5 h-5" />}
              </div>
              <p className="text-sm text-gray-500">
                Solução client-side fácil. Gratuito até 200 emails/mês. Ideal para formulários de contato simples.
              </p>
            </button>

            <button
              type="button"
              onClick={() => handleProviderChange('supabase')}
              className={`relative p-4 rounded-lg border-2 text-left ${
                activeProvider === 'supabase'
                  ? 'border-green-500 bg-green-50'
                  : 'border-gray-200'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-gray-900">Supabase (Edge Functions)</span>
                {activeProvider === 'supabase' && <CheckCircle className="text-green-500 w-5 h-5" />}
              </div>
              <p className="text-sm text-gray-500">
                Solução server-side robusta. Requer configuração de Edge Functions e provedor SMTP (Resend/SendGrid).
              </p>
            </button>
          </div>
        </div>

        {/* EmailJS Configuration */}
        {activeProvider === 'emailjs' && (
          <div className="space-y-6">
            <div className="bg-blue-50 p-4 rounded-md flex items-start gap-3 text-blue-800 text-sm">
              <Info className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-bold mb-1">Como configurar o EmailJS:</p>
                <ol className="list-decimal list-inside space-y-1 ml-1">
                  <li>Crie uma conta em <a href="https://www.emailjs.com/" target="_blank" rel="noreferrer" className="underline">emailjs.com</a></li>
                  <li>Adicione um Serviço de Email (Gmail, Outlook, etc).</li>
                  <li>Crie um Template de Email.</li>
                  <li>Copie os IDs abaixo do painel do EmailJS.</li>
                </ol>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="col-span-2 md:col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Service ID <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    {...register('email_settings.emailjs.serviceId', { required: activeProvider === 'emailjs' })}
                    placeholder="ex: service_xxxxxx"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                  <div className="absolute right-2 top-2 text-gray-400">
                    <Info size={16} />
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Encontrado na aba "Email Services" do painel EmailJS.
                  </div>
                </div>
                {emailErrors?.email_settings?.emailjs?.serviceId && (
                  <p className="text-red-500 text-xs mt-1">Obrigatório</p>
                )}
              </div>

              <div className="col-span-2 md:col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Template ID <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    {...register('email_settings.emailjs.templateId', { required: activeProvider === 'emailjs' })}
                    placeholder="ex: template_xxxxxx"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                  <div className="absolute right-2 top-2 text-gray-400">
                    <Info size={16} />
                  </div>
                   <div className="text-xs text-gray-500 mt-1">
                    Encontrado na aba "Email Templates".
                  </div>
                </div>
              </div>

              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Public Key <span className="text-red-500">*</span>
                </label>
                <div className="relative group">
                  <input
                    type="text"
                    {...register('email_settings.emailjs.publicKey', { required: activeProvider === 'emailjs' })}
                    placeholder="ex: user_xxxxxx ou chave pública"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent font-mono"
                  />
                  <div className="absolute right-2 top-2 text-gray-400">
                    <Info size={16} />
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Encontrado em "Account" &gt; "API Keys".
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Supabase Configuration */}
        {activeProvider === 'supabase' && (
          <div className="space-y-6">
            <div className="bg-yellow-50 p-4 rounded-md flex items-start gap-3 text-yellow-800 text-sm">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-bold mb-1">Como configurar (Passo a Passo):</p>
                <ol className="list-decimal list-inside space-y-1 ml-1 mb-2">
                  <li>Crie uma conta no <a href="https://resend.com" target="_blank" rel="noreferrer" className="underline font-medium">Resend.com</a> e gere uma API Key.</li>
                  <li>Faça login no Supabase via terminal: <code className="bg-yellow-100 px-1 rounded">npx supabase login</code></li>
                  <li>Vincule o projeto local ao remoto: <code className="bg-yellow-100 px-1 rounded">npx supabase link --project-ref &lt;project-id&gt;</code> <span className="text-xs text-gray-500">(Pegue o ID na URL do Supabase)</span></li>
                  <li>Configure a chave do Resend: <code className="bg-yellow-100 px-1 rounded">npx supabase secrets set RESEND_API_KEY=re_123...</code></li>
                  <li>Faça o deploy da função: <code className="bg-yellow-100 px-1 rounded">npx supabase functions deploy send-email</code></li>
                  <li>Copie a URL gerada no terminal e cole abaixo.</li>
                </ol>
                <p className="text-xs mt-2">
                  Nota: A chave "Anon Key" abaixo é encontrada no painel do Supabase em <strong>Project Settings &gt; API</strong>.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Edge Function URL <span className="text-red-500">*</span>
                </label>
                <input
                  type="url"
                  {...register('email_settings.supabase.functionUrl', { required: activeProvider === 'supabase' })}
                  placeholder="https://[project-id].supabase.co/functions/v1/send-email"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent font-mono"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Authorization Header / Anon Key
                </label>
                <input
                  type="password"
                  {...register('email_settings.supabase.anonKey')}
                  placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent font-mono"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Chave pública (anon public) do seu projeto Supabase. Necessária para autenticar a chamada à função.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Test Connection Button */}
        <div className="mt-8 pt-6 border-t border-gray-100 flex justify-end">
          <button
            type="button"
            onClick={testConnection}
            disabled={isTesting}
            className="flex items-center gap-2 px-4 py-2 bg-gray-800 text-white rounded-md disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
            Testar Conexão ({activeProvider === 'emailjs' ? 'EmailJS' : 'Supabase'})
          </button>
        </div>
      </div>
    </div>
  );
};

export default EmailSettingsTab;
