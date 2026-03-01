import React from 'react';
import { Database } from '../../../types/database.types';
import DataTable from '../../../components/Admin/DataTable';
import { toast } from 'sonner';
import { supabase } from '../../../lib/supabase';
import { useGlobalStore } from '../../../stores/useGlobalStore';

type PortfolioItem = Database['public']['Tables']['portfolios']['Row'];

const PortfolioList: React.FC = () => {
  const { portfolio: items } = useGlobalStore();

  const handleDelete = async (item: PortfolioItem) => {
    try {
      const { error } = await supabase.from('portfolios').delete().eq('id', item.id);

      if (error) throw error;
      
      toast.success('Projeto excluído com sucesso');
    } catch (error) {
      console.error('Error deleting item:', error);
      toast.error('Erro ao excluir projeto');
    }
  };

  const columns = [
    {
      header: 'Título',
      accessor: 'title' as keyof PortfolioItem,
      className: 'font-medium text-gray-900',
    },
    {
      header: 'Categoria',
      accessor: 'category' as keyof PortfolioItem,
    },
    {
      header: 'Status',
      accessor: (item: PortfolioItem) => (
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
      header: 'Data',
      accessor: (item: PortfolioItem) => 
        new Date(item.created_at).toLocaleDateString('pt-BR'),
    },
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Gerenciar Portfólio</h1>
        <p className="text-gray-600">Adicione, edite ou remova projetos do portfólio.</p>
      </div>

      <DataTable
        title="Projetos"
        data={items || []}
        columns={columns}
        onDelete={handleDelete}
        addButtonLabel="Novo Projeto"
        addButtonLink="/admin/portfolio/novo"
        editLinkBase="/admin/portfolio"
        isLoading={false}
        getPreviewLink={(item) => item.published ? `/portfolio/${item.slug}` : null}
      />
    </div>
  );
};

export default PortfolioList;
