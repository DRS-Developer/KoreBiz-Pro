import React from 'react';
import { Database } from '../../../types/database.types';
import DataTable from '../../../components/Admin/DataTable';
import { toast } from 'sonner';
import { supabase } from '../../../lib/supabase';
import { useGlobalStore } from '../../../stores/useGlobalStore';

type ServiceItem = Database['public']['Tables']['services']['Row'];

const ServicesList: React.FC = () => {
  // Consome diretamente do Zustand (Memória)
  // Sem loading state explícito pois o AppLoader já garantiu a hidratação
  const { services: items } = useGlobalStore();

  const handleDelete = async (item: ServiceItem) => {
    try {
      // Deleta direto no Supabase
      // O Realtime (useRealtimeSync) vai detectar o evento DELETE e atualizar o Zustand automaticamente
      const { error } = await supabase.from('services').delete().eq('id', item.id);

      if (error) throw error;
      
      toast.success('Serviço excluído com sucesso');
    } catch (error) {
      console.error('Error deleting item:', error);
      toast.error('Erro ao excluir serviço');
    }
  };

  const columns = [
    {
      header: 'Ordem',
      accessor: 'order' as keyof ServiceItem,
      className: 'w-20',
    },
    {
      header: 'Título',
      accessor: 'title' as keyof ServiceItem,
      className: 'font-medium text-gray-900',
    },
    {
      header: 'Categoria',
      accessor: 'category' as keyof ServiceItem,
    },
    {
      header: 'Status',
      accessor: (item: ServiceItem) => (
        <span
          className={`px-2 py-1 text-xs rounded-full ${
            item.published
              ? 'bg-green-100 text-green-800'
              : 'bg-yellow-100 text-yellow-800'
          }`}
        >
          {item.published ? 'Publicado' : 'Rascunho'}
        </span>
      ),
    },
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Gerenciar Serviços</h1>
        <p className="text-gray-600">Adicione, edite ou remova serviços oferecidos.</p>
      </div>

      <DataTable
        title="Serviços"
        data={items || []}
        columns={columns}
        onDelete={handleDelete}
        addButtonLabel="Novo Serviço"
        addButtonLink="/admin/services/novo"
        editLinkBase="/admin/services"
        isLoading={false}
        getPreviewLink={(item) => item.published ? `/servicos/${item.slug}` : null}
      />
    </div>
  );
};

export default ServicesList;
