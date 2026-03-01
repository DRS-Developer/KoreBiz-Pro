
import React, { useEffect, useState } from 'react';
import DataTable from '../../../components/Admin/DataTable';
import { toast } from 'sonner';
import { PracticeAreasRepository } from '../../../repositories/PracticeAreasRepository';
import { PracticeArea } from '../../../types/home-content';

const PracticeAreasList: React.FC = () => {
  const [items, setItems] = useState<PracticeArea[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await PracticeAreasRepository.getAll();
      setItems(data);
    } catch (error) {
      console.error('Error loading practice areas:', error);
      toast.error('Erro ao carregar áreas de atuação.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (item: PracticeArea) => {
    try {
      await PracticeAreasRepository.delete(item.id);
      setItems(items.filter((i) => i.id !== item.id));
      toast.success('Item excluído com sucesso');
    } catch (error) {
      console.error('Error deleting item:', error);
      toast.error('Erro ao excluir item');
    }
  };

  const columns = [
    {
      header: 'Ordem',
      accessor: 'order_index' as keyof PracticeArea,
      className: 'w-20',
    },
    {
      header: 'Título',
      accessor: 'title' as keyof PracticeArea,
      className: 'font-medium text-gray-900',
    },
    {
      header: 'Link',
      accessor: 'link' as keyof PracticeArea,
    },
    {
      header: 'Status',
      accessor: (item: PracticeArea) => (
        <span
          className={`px-2 py-1 text-xs rounded-full ${
            item.is_active
              ? 'bg-green-100 text-green-800'
              : 'bg-gray-100 text-gray-800'
          }`}
        >
          {item.is_active ? 'Ativo' : 'Inativo'}
        </span>
      ),
    },
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Áreas de Atuação</h1>
        <p className="text-gray-600">Gerencie as áreas de atuação exibidas na Home.</p>
      </div>

      <DataTable
        title="Áreas de Atuação"
        data={items}
        columns={columns}
        onDelete={handleDelete}
        addButtonLabel="Nova Área"
        addButtonLink="/admin/areas-atuacao/novo"
        editLinkBase="/admin/areas-atuacao"
        isLoading={loading}
      />
    </div>
  );
};

export default PracticeAreasList;
