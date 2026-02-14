import React, { useState } from 'react';
import { Edit, Trash2, Plus, Search, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';
import ConfirmationModal from './ConfirmationModal';

interface Column<T> {
  header: string;
  accessor: keyof T | ((item: T) => React.ReactNode);
  className?: string;
}

interface DataTableProps<T> {
  title: string;
  data: T[];
  columns: Column<T>[];
  onDelete?: (item: T) => void;
  onEdit?: (item: T) => void;
  addButtonLabel?: string;
  addButtonLink?: string;
  editLinkBase?: string;
  isLoading?: boolean;
  getPreviewLink?: (item: T) => string | null;
}

function DataTable<T extends { id: string | number }>({
  title,
  data,
  columns,
  onDelete,
  addButtonLabel,
  addButtonLink,
  editLinkBase,
  isLoading = false,
  getPreviewLink,
}: DataTableProps<T>) {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [itemToDelete, setItemToDelete] = useState<T | null>(null);

  // Simple search implementation - filters if any value in the row matches the search term
  const filteredData = React.useMemo(() => data.filter((item) =>
    Object.values(item as Record<string, unknown>).some((val) =>
      String(val).toLowerCase().includes(searchTerm.toLowerCase())
    )
  ), [data, searchTerm]);

  const handleDeleteClick = (item: T) => {
    setItemToDelete(item);
  };

  const handleConfirmDelete = () => {
    if (itemToDelete && onDelete) {
      onDelete(itemToDelete);
    }
    setItemToDelete(null);
  };

  return (
    <>
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Header */}
      <div className="p-6 border-b border-gray-200 flex flex-col md:flex-row justify-between items-center gap-4">
        <h2 className="text-xl font-bold text-gray-800">{title}</h2>
        
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="relative flex-grow md:flex-grow-0">
            <input
              type="text"
              placeholder="Buscar..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none w-full md:w-64"
            />
            <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
          </div>

          {addButtonLabel && addButtonLink && (
            <Link
              to={addButtonLink}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium whitespace-nowrap"
            >
              <Plus size={18} />
              {addButtonLabel}
            </Link>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-gray-50 text-gray-600 font-semibold text-sm uppercase tracking-wider">
            <tr>
              {columns.map((col, index) => (
                <th key={index} className={`px-6 py-4 ${col.className || ''}`}>
                  {col.header}
                </th>
              ))}
              {(onDelete || addButtonLink) && <th className="px-6 py-4 text-right">Ações</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {isLoading && filteredData.length === 0 ? (
              <tr>
                <td colSpan={columns.length + 1} className="px-6 py-12 text-center text-gray-500">
                  <div className="flex flex-col items-center justify-center">
                    <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
                    <p>Carregando dados...</p>
                  </div>
                </td>
              </tr>
            ) : filteredData.length === 0 ? (
              <tr>
                <td colSpan={columns.length + 1} className="px-6 py-12 text-center text-gray-500">
                  Nenhum registro encontrado.
                </td>
              </tr>
            ) : (
              filteredData.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                  {columns.map((col, index) => (
                    <td key={index} className={`px-6 py-4 ${col.className || ''}`}>
                      {typeof col.accessor === 'function'
                        ? col.accessor(item)
                        : (item[col.accessor] as React.ReactNode)}
                    </td>
                  ))}
                  {(onDelete || addButtonLink || editLinkBase || getPreviewLink) && (
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        {getPreviewLink && (() => {
                          const link = getPreviewLink(item);
                          return link ? (
                            <a
                              href={link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                              title="Visualizar página"
                            >
                              <Eye size={18} />
                            </a>
                          ) : null;
                        })()}
                        {(addButtonLink || editLinkBase) && (
                          <Link
                            to={editLinkBase ? `${editLinkBase}/${item.id}` : `${addButtonLink}/${item.id}`}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                            title="Editar"
                          >
                            <Edit size={18} />
                          </Link>
                        )}
                        {onDelete && (
                          <button
                            onClick={() => handleDeleteClick(item)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-full transition-colors"
                            title="Excluir"
                          >
                            <Trash2 size={18} />
                          </button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>

    <ConfirmationModal
      isOpen={!!itemToDelete}
      onConfirm={handleConfirmDelete}
      onCancel={() => setItemToDelete(null)}
      title="Confirmar Exclusão"
      description="Tem certeza que deseja excluir este item? Esta ação não pode ser desfeita."
      confirmText="Sim, excluir"
      cancelText="Cancelar"
      variant="danger"
    />
    </>
  );
}

export default DataTable;
