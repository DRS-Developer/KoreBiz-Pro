import React, { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabase';
import { Database } from '../../../types/database.types';
import DataTable from '../../../components/Admin/DataTable';
import { Eye, Mail, Archive } from 'lucide-react';
import { toast } from 'sonner';
import { useGlobalStore } from '../../../stores/useGlobalStore';

type ContactItem = Database['public']['Tables']['contacts']['Row'];

const ContactsList: React.FC = () => {
  const { contacts, setContacts } = useGlobalStore();
  const [selectedMessage, setSelectedMessage] = useState<ContactItem | null>(null);
  
  // Contacts might not be preloaded by initial AppLoader since they are private
  // So we might need to fetch them here
  useEffect(() => {
    if (contacts.length === 0) {
        fetchItems();
    }
  }, []);

  const fetchItems = async () => {
    try {
      const { data, error } = await supabase
        .from('contacts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setContacts(data || []);
    } catch (error) {
       console.error(error);
       toast.error('Erro ao carregar mensagens');
    }
  };

  const items = contacts;

  const handleStatusUpdate = async (id: string, status: 'new' | 'read' | 'archived') => {
    try {
      const { error } = await supabase
        .from('contacts')
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .update({ status } as any)
        .eq('id', id);

      if (error) throw error;

      setContacts(items.map(item => 
        item.id === id ? { ...item, status } : item
      ));
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Erro ao atualizar status');
    }
  };

  const handleDelete = async (item: ContactItem) => {
    try {
      const { error } = await supabase
        .from('contacts')
        .delete()
        .eq('id', item.id);

      if (error) throw error;
      
      setContacts(items.filter((i) => i.id !== item.id));
      if (selectedMessage?.id === item.id) setSelectedMessage(null);
      toast.success('Mensagem excluída com sucesso');
    } catch (error) {
      console.error('Error deleting item:', error);
      toast.error('Erro ao excluir mensagem');
    }
  };

  const columns = [
    {
      header: 'Nome',
      accessor: 'name' as keyof ContactItem,
      className: 'font-medium text-gray-900',
    },
    {
      header: 'Assunto',
      accessor: 'subject' as keyof ContactItem,
    },
    {
      header: 'Status',
      accessor: (item: ContactItem) => (
        <span
          className={`px-2 py-1 text-xs rounded-full ${
            item.status === 'new'
              ? 'bg-blue-100 text-blue-800'
              : item.status === 'read'
              ? 'bg-gray-100 text-gray-800'
              : 'bg-yellow-100 text-yellow-800'
          }`}
        >
          {item.status === 'new' ? 'Novo' : item.status === 'read' ? 'Lido' : 'Arquivado'}
        </span>
      ),
    },
    {
      header: 'Data',
      accessor: (item: ContactItem) => 
        new Date(item.created_at).toLocaleDateString('pt-BR'),
    },
    {
      header: 'Ações',
      accessor: (item: ContactItem) => (
        <div className="flex gap-2">
          <button
            onClick={() => {
              setSelectedMessage(item);
              if (item.status === 'new') handleStatusUpdate(item.id, 'read');
            }}
            className="p-1 text-blue-600 hover:bg-blue-50 rounded"
            title="Ver Detalhes"
          >
            <Eye size={18} />
          </button>
          <a
            href={`mailto:${item.email}?subject=Re: ${item.subject}`}
            className="p-1 text-green-600 hover:bg-green-50 rounded"
            title="Responder por E-mail"
          >
            <Mail size={18} />
          </a>
          <button
            onClick={() => handleStatusUpdate(item.id, item.status === 'archived' ? 'read' : 'archived')}
            className="p-1 text-yellow-600 hover:bg-yellow-50 rounded"
            title={item.status === 'archived' ? 'Desarquivar' : 'Arquivar'}
          >
            <Archive size={18} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="p-6 flex flex-col md:flex-row gap-6 h-[calc(100vh-64px)] overflow-hidden">
      <div className={`flex-1 overflow-auto ${selectedMessage ? 'hidden md:block' : ''}`}>
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Gerenciar Contatos</h1>
          <p className="text-gray-600">Visualize e responda as mensagens recebidas.</p>
        </div>

        <DataTable
          title="Mensagens"
          data={items}
          columns={columns}
          onDelete={handleDelete}
        />
      </div>

      {/* Message Detail Sidebar */}
      {selectedMessage && (
        <div className="w-full md:w-1/3 bg-white border-l border-gray-200 overflow-y-auto p-6 fixed inset-0 md:static z-50 md:z-auto">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-900">Detalhes da Mensagem</h2>
            <button
              onClick={() => setSelectedMessage(null)}
              className="text-gray-500 hover:text-gray-700 md:hidden"
            >
              Fechar
            </button>
          </div>

          <div className="space-y-6">
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase">De</label>
              <div className="text-lg font-medium text-gray-900">{selectedMessage.name}</div>
              <div className="text-blue-600">{selectedMessage.email}</div>
              {selectedMessage.phone && (
                <div className="text-gray-600">{selectedMessage.phone}</div>
              )}
            </div>

            <div>
              <label className="text-xs font-bold text-gray-500 uppercase">Assunto</label>
              <div className="text-gray-900 font-medium">{selectedMessage.subject}</div>
            </div>

            <div>
              <label className="text-xs font-bold text-gray-500 uppercase">Mensagem</label>
              <div className="mt-2 p-4 bg-gray-50 rounded-lg text-gray-700 whitespace-pre-wrap">
                {selectedMessage.message}
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-gray-500 uppercase">Recebido em</label>
              <div className="text-gray-600">
                {new Date(selectedMessage.created_at).toLocaleString('pt-BR')}
              </div>
            </div>

            <div className="pt-6 border-t border-gray-200 flex flex-col gap-3">
              <a
                href={`mailto:${selectedMessage.email}?subject=Re: ${selectedMessage.subject}`}
                className="flex items-center justify-center gap-2 w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Mail size={18} /> Responder por E-mail
              </a>
              
              <div className="flex gap-3">
                <button
                  onClick={() => handleStatusUpdate(selectedMessage.id, selectedMessage.status === 'archived' ? 'read' : 'archived')}
                  className="flex-1 flex items-center justify-center gap-2 bg-gray-100 text-gray-700 py-2 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <Archive size={18} /> {selectedMessage.status === 'archived' ? 'Desarquivar' : 'Arquivar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContactsList;
