import React, { useEffect, useState } from 'react';
import { Menu, EyeOff, Loader2, GripVertical, Globe, PanelLeft } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '../../../lib/supabase';
import { useSystemModules } from '../../../hooks/useSystemModules';
import { notifySystemModulesSync } from '../../../hooks/systemModulesSync';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { applyMenuFieldUpdate } from './menuSidebarState';

interface MenuConfig {
  config_id: string;
  modulo_id: string;
  modulo_key: string;
  modulo_nome_original: string;
  nome_personalizado: string;
  visibilidade_personalizada: boolean;
  status_ativo: boolean;
  order_position: number;
}

interface MenuSidebarTabProps {
  onSaveReady?: (saveFn: () => Promise<boolean>) => void;
  onSavingChange?: (isSaving: boolean) => void;
}

const SortableItem = ({ item, onUpdate }: { item: MenuConfig, onUpdate: (id: string, field: string, value: any) => void }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: item.modulo_key });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      className={`flex items-center gap-4 p-4 bg-white border rounded-lg transition-all duration-200 ${!item.visibilidade_personalizada ? 'bg-gray-50 border-gray-200' : 'border-gray-200 shadow-sm'}`}
    >
      <div {...attributes} {...listeners} className="cursor-grab text-gray-400 hover:text-gray-600">
        <GripVertical size={20} />
      </div>

      <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
        <div>
           <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-1">Módulo Original</p>
           <p className="text-sm font-medium text-gray-900">{item.modulo_nome_original}</p>
           <p className="text-xs text-gray-400 font-mono">{item.modulo_key}</p>
        </div>

        <div>
           <label className="block text-xs text-gray-500 font-medium uppercase tracking-wider mb-1">Nome Exibido</label>
           <input 
             type="text" 
             value={item.nome_personalizado || ''} 
             onChange={(e) => onUpdate(item.modulo_id, 'nome_personalizado', e.target.value)}
             className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
             placeholder={item.modulo_nome_original}
           />
        </div>

        <div className="flex justify-end items-center gap-2 flex-wrap">
           <button
             type="button"
             onClick={() => onUpdate(item.modulo_id, 'status_ativo', !item.status_ativo)}
             title="Controla a exibição no site público"
             className={`flex items-center gap-2 px-3 py-1.5 rounded text-sm font-medium transition-colors min-w-[160px] justify-center ${
               item.status_ativo 
                 ? 'bg-green-50 text-green-700 hover:bg-green-100' 
                 : 'bg-red-50 text-red-700 hover:bg-red-100'
             }`}
           >
             {item.status_ativo ? <Globe size={16} /> : <EyeOff size={16} />}
             {item.status_ativo ? 'Site: Ativo' : 'Site: Oculto'}
           </button>
           <button
             type="button"
             onClick={() => onUpdate(item.modulo_id, 'visibilidade_personalizada', !item.visibilidade_personalizada)}
             title="Controla a exibição do botão na sidebar administrativa"
             className={`flex items-center gap-2 px-3 py-1.5 rounded text-sm font-medium transition-colors min-w-[185px] justify-center ${
               item.visibilidade_personalizada
                 ? 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100'
                 : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
             }`}
           >
             {item.visibilidade_personalizada ? <PanelLeft size={16} /> : <EyeOff size={16} />}
             {item.visibilidade_personalizada ? 'Sidebar: Visível' : 'Sidebar: Oculto'}
           </button>
        </div>
      </div>
    </div>
  );
};

const MenuSidebarTab: React.FC<MenuSidebarTabProps> = ({ onSaveReady, onSavingChange }) => {
  const [menus, setMenus] = useState<MenuConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { refreshModules, reorderModules } = useSystemModules();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const fetchMenus = React.useCallback(async (showLoading = true) => {
    try {
      if (showLoading) {
        setLoading(true);
      }
      
      const { data, error } = await supabase.rpc('get_system_modules_config');

      if (error) throw error;

      const mappedMenus = (data || []).map((m: any) => ({
        config_id: m.config_id || m.id,
        modulo_id: m.id,
        modulo_key: m.key,
        modulo_nome_original: m.name,
        nome_personalizado: m.nome_personalizado,
        visibilidade_personalizada: m.visibilidade_personalizada ?? true,
        status_ativo: m.is_active,
        order_position: m.order_position
      }));

      setMenus(mappedMenus);
    } catch (error) {
      console.error('Error fetching menu config:', error);
      toast.error('Erro ao carregar configurações do menu.');
    } finally {
      if (showLoading) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    fetchMenus();
  }, [fetchMenus]);

  useEffect(() => {
    if (onSavingChange) {
      onSavingChange(saving);
    }
  }, [onSavingChange, saving]);

  const handleUpdate = (moduloId: string, field: string, value: any) => {
    setMenus(prev => prev.map(item =>
      item.modulo_id === moduloId ? applyMenuFieldUpdate(item, field, value) : item
    ));
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (active.id !== over?.id) {
      setMenus((items) => {
        const oldIndex = items.findIndex((i) => i.modulo_key === active.id);
        const newIndex = items.findIndex((i) => i.modulo_key === over?.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const menusRef = React.useRef(menus);
  useEffect(() => {
    menusRef.current = menus;
  }, [menus]);

  const saveChangesRef = React.useCallback(async () => {
     try {
      setSaving(true);
      const currentMenus = menusRef.current;
      
      const keysOrder = currentMenus.map(m => m.modulo_key);
      await reorderModules(keysOrder);

      const updates = currentMenus.map(async (menu) => {
        return (supabase as any).rpc('update_system_module_details', {
          p_id: menu.modulo_id,
          p_custom_name: menu.nome_personalizado || null,
          p_is_visible: menu.visibilidade_personalizada,
          p_is_active: menu.status_ativo
        });
      });

      const results = await Promise.all(updates);
      
      const errors = results.filter(r => r.error);
      if (errors.length > 0) {
        throw new Error(`Falha ao salvar ${errors.length} itens. Verifique o console.`);
      }

      toast.success('Menu atualizado com sucesso!');
      await fetchMenus(false);
      if (refreshModules) {
        await refreshModules(); 
      }
      notifySystemModulesSync();
      return true;
    } catch (error: any) {
      console.error('Error saving menu:', error);
      toast.error('Erro ao salvar alterações: ' + error.message);
      return false;
    } finally {
      setSaving(false);
    }
  }, [fetchMenus, refreshModules, reorderModules]);

  useEffect(() => {
    if (onSaveReady) {
      onSaveReady(saveChangesRef);
    }
  }, [onSaveReady, saveChangesRef]);


  if (loading) {
    return <div className="flex justify-center p-8"><Loader2 className="animate-spin text-blue-600" size={32} /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b pb-4">
        <div>
            <h2 className="text-lg font-medium text-gray-900">Configuração do Menu Lateral</h2>
            <p className="text-sm text-gray-500">Personalize a ordem, nomes e visibilidade dos itens no menu do painel administrativo.</p>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <div className="flex items-start gap-3">
            <Menu className="text-blue-600 mt-1" size={20} />
            <div>
                <h3 className="font-medium text-blue-900">Como funciona?</h3>
                <ul className="text-sm text-blue-800 list-disc list-inside mt-1 space-y-1">
                    <li>Arraste os itens pelos ícones <GripVertical className="inline w-3 h-3"/> para reordenar.</li>
                    <li>Edite o <strong>Nome Exibido</strong> para renomear botões (ex: "Portfólio" → "Projetos").</li>
                    <li><strong>Site Ativo/Oculto</strong> controla exibição no menu do site e disponibilidade da página.</li>
                    <li><strong>Sidebar Visível/Oculto</strong> controla apenas a exibição do botão na sidebar administrativa.</li>
                </ul>
            </div>
        </div>
      </div>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={menus.map(m => m.modulo_key)} strategy={verticalListSortingStrategy}>
          <div className="space-y-3">
            {menus.map((item) => (
              <SortableItem key={item.modulo_key} item={item} onUpdate={handleUpdate} />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
};

export default MenuSidebarTab;
