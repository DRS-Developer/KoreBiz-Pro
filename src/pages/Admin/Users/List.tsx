import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../../lib/supabase';
import { Database } from '../../../types/database.types';
import DataTable from '../../../components/Admin/DataTable';
import { Shield, User } from 'lucide-react';
import { toast } from 'sonner';

type Profile = Database['public']['Tables']['profiles']['Row'];

const UsersList: React.FC = () => {
  const [items, setItems] = useState<Profile[]>([]);

  const navigate = useNavigate();

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      setItems(data || []);

    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Erro ao carregar usuários');
    }
  };

  const handleRoleChange = async (id: string, newRole: 'admin' | 'editor') => {
    try {
      const { error } = await supabase
        .from('profiles')
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .update({ role: newRole } as any)
        .eq('id', id);

      if (error) throw error;
      
      setItems(items.map(item => 
        item.id === id ? { ...item, role: newRole } : item
      ));
      
      toast.success('Função atualizada com sucesso');
    } catch (error) {
      console.error('Error updating role:', error);
      toast.error('Erro ao atualizar função');
    }
  };

  const columns = [
    {
      header: 'Usuário',
      accessor: (item: Profile) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
            {item.avatar_url ? (
              <img src={item.avatar_url} alt={item.full_name || ''} className="w-full h-full object-cover" />
            ) : (
              <User className="w-4 h-4 text-gray-500" />
            )}
          </div>
          <div>
            <div className="font-medium text-gray-900">{item.full_name || 'Sem nome'}</div>
            <div className="text-sm text-gray-500">{item.email}</div>
          </div>
        </div>
      ),
    },
    {
      header: 'Função',
      accessor: (item: Profile) => (
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-gray-400" />
          <select
            value={item.role}
            onChange={(e) => handleRoleChange(item.id, e.target.value as 'admin' | 'editor')}
            className="block w-full pl-3 pr-10 py-1 text-base border-gray-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md"
          >
            <option value="admin">Administrador</option>
            <option value="editor">Editor</option>
          </select>
        </div>
      ),
    },
    {
      header: 'Data de Cadastro',
      accessor: (item: Profile) => 
        new Date(item.created_at).toLocaleDateString('pt-BR'),
    },
  ];

  return (
    <div className="p-6">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gerenciar Usuários</h1>
          <p className="text-gray-600">Gerencie os usuários e suas permissões de acesso.</p>
        </div>
        <button
          onClick={() => navigate('/admin/usuarios/novo')}
          className="flex items-center gap-2 px-4 py-2 bg-blue-800 text-white rounded-md hover:bg-blue-900 transition-colors"
        >
          <User className="w-4 h-4" />
          Adicionar Novo Usuário
        </button>
      </div>

      <DataTable
        title="Usuários"
        data={items}
        columns={columns}
        // No delete or add button for now as it requires Auth Admin API or Edge Functions
      />
    </div>
  );
};

export default UsersList;
