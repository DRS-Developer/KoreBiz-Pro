import React from 'react';
import { Database } from '../../../types/database.types';
import DataTable from '../../../components/Admin/DataTable';
import { toast } from 'sonner';
import { supabase } from '../../../lib/supabase';
import { useGlobalStore } from '../../../stores/useGlobalStore';

type PageItem = Database['public']['Tables']['pages']['Row'];

const PagesList: React.FC = () => {
  const { pages: items } = useGlobalStore();

  const handleDelete = async (item: PageItem) => {
    try {
      const { error } = await supabase.from('pages').delete().eq('id', item.id);

      if (error) throw error;
      
      toast.success('Página excluída com sucesso');
    } catch (error) {
      console.error('Error deleting item:', error);
      toast.error('Erro ao excluir página');
    }
  };

  const columns = [
    {
      header: 'Título',
      accessor: 'title' as keyof PageItem,
      className: 'font-medium text-gray-900',
    },
    {
      header: 'Slug',
      accessor: 'slug' as keyof PageItem,
    },
    {
      header: 'Status',
      accessor: (item: PageItem) => (
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
    {
      header: 'Última Atualização',
      accessor: (item: PageItem) => 
        new Date(item.updated_at).toLocaleDateString('pt-BR'),
    },
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Gerenciar Páginas</h1>
        <p className="text-gray-600">Crie e edite as páginas institucionais do site.</p>
      </div>

      <DataTable
        title="Páginas"
        data={items || []}
        columns={columns}
        onDelete={handleDelete}
        addButtonLabel="Nova Página"
        addButtonLink="/admin/paginas/nova"
        editLinkBase="/admin/paginas/editar"
        isLoading={false}
        getPreviewLink={(item) => item.published ? `/${item.slug}` : null}
      />
    </div>
  );
};

export default PagesList;
