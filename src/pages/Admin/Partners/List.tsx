
import React, { useEffect, useState } from 'react';
import DataTable from '../../../components/Admin/DataTable';
import { toast } from 'sonner';
import { PartnersRepository } from '../../../repositories/PartnersRepository';
import { Partner } from '../../../types/home-content';

const PartnersList: React.FC = () => {
  const [items, setItems] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await PartnersRepository.getAll();
      setItems(data);
    } catch (error) {
      console.error('Error loading partners:', error);
      toast.error('Erro ao carregar parceiros.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (item: Partner) => {
    try {
      await PartnersRepository.delete(item.id);
      setItems(items.filter((i) => i.id !== item.id));
      toast.success('Parceiro excluído com sucesso');
    } catch (error) {
      console.error('Error deleting partner:', error);
      toast.error('Erro ao excluir parceiro');
    }
  };

  const columns = [
    {
      header: 'Ordem',
      accessor: 'order_index' as keyof Partner,
      className: 'w-20',
    },
    {
      header: 'Logo',
      accessor: (item: Partner) => (
        item.logo_url ? (
          <img src={item.logo_url} alt={item.name} className="h-10 w-auto object-contain" />
        ) : (
          <span className="text-gray-400 italic">Sem logo</span>
        )
      ),
      className: 'w-24',
    },
    {
      header: 'Nome',
      accessor: 'name' as keyof Partner,
      className: 'font-medium text-gray-900',
    },
    {
      header: 'Site',
      accessor: 'website_url' as keyof Partner,
      className: 'text-blue-600 truncate max-w-xs',
    },
    {
      header: 'Status',
      accessor: (item: Partner) => (
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
        <h1 className="text-2xl font-bold text-gray-900">Parceiros</h1>
        <p className="text-gray-600">Gerencie os logotipos e links dos parceiros exibidos no site.</p>
      </div>

      <DataTable
        title="Parceiros Cadastrados"
        data={items}
        columns={columns}
        onDelete={handleDelete}
        addButtonLabel="Novo Parceiro"
        addButtonLink="/admin/parceiros/novo"
        editLinkBase="/admin/parceiros"
        isLoading={loading}
      />
    </div>
  );
};

export default PartnersList;
