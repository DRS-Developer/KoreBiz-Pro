import React, { useEffect, useState } from 'react';
import { Users, FileText, MessageSquare, Eye } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useGlobalStore } from '../../stores/useGlobalStore';

const Dashboard: React.FC = () => {
  const { services, portfolio, pages, contacts } = useGlobalStore();
  
  // Realtime counts from Global Store
  const stats = {
    services: services.length,
    projects: portfolio.length,
    pages: pages.length,
    contacts: contacts.length,
    newContacts: contacts.filter(c => c.status === 'new').length
  };
  
  const loading = false; // Always ready due to AppLoader

  const recentContacts = contacts.slice(0, 5);

  const statCards = [
    { label: 'Serviços Cadastrados', value: stats.services, icon: <Users className="text-blue-500" size={24} />, link: '/admin/services' },
    { label: 'Projetos no Portfólio', value: stats.projects, icon: <FileText className="text-purple-500" size={24} />, link: '/admin/portfolio' },
    { label: 'Mensagens Recebidas', value: stats.contacts, icon: <MessageSquare className="text-green-500" size={24} />, link: '/admin/contatos', highlight: stats.newContacts > 0 ? `${stats.newContacts} novas` : undefined },
    { label: 'Páginas Publicadas', value: stats.pages, icon: <Eye className="text-orange-500" size={24} />, link: '/admin/paginas' },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Dashboard</h1>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat, index) => (
          <Link key={index} to={stat.link} className="block group">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 group-hover:shadow-md transition-shadow h-full">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-gray-500 text-sm">{stat.label}</p>
                  {loading && stats.services === 0 ? (
                    <div className="h-8 w-16 bg-gray-200 animate-pulse rounded mt-1" />
                  ) : (
                    <h3 className="text-2xl font-bold text-gray-800 mt-1">{stat.value}</h3>
                  )}
                </div>
                <div className="p-2 bg-gray-50 rounded-lg group-hover:bg-blue-50 transition-colors">
                  {stat.icon}
                </div>
              </div>
              {stat.highlight && (
                <div className="text-sm text-green-600 font-medium">
                  {stat.highlight}
                </div>
              )}
            </div>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Activity */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold text-gray-800">Últimas Mensagens</h2>
            <Link to="/admin/contatos" className="text-sm text-blue-600 hover:underline">Ver todas</Link>
          </div>
          
          <div className="space-y-4">
            {loading && recentContacts.length === 0 ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-start pb-4 border-b border-gray-50 last:border-0 last:pb-0 animate-pulse">
                  <div className="w-2 h-2 mt-2 rounded-full mr-3 bg-gray-200"></div>
                  <div className="flex-1">
                    <div className="flex justify-between mb-2">
                      <div className="h-4 w-24 bg-gray-200 rounded"></div>
                      <div className="h-3 w-16 bg-gray-200 rounded"></div>
                    </div>
                    <div className="h-3 w-full bg-gray-200 rounded"></div>
                  </div>
                </div>
              ))
            ) : recentContacts.length > 0 ? (
              recentContacts.map((contact) => (
                <div key={contact.id} className="flex items-start pb-4 border-b border-gray-50 last:border-0 last:pb-0">
                  <div className={`w-2 h-2 mt-2 rounded-full mr-3 ${contact.status === 'new' ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                  <div className="flex-1">
                    <div className="flex justify-between">
                      <p className="text-gray-800 text-sm font-medium">{contact.name}</p>
                      <span className="text-xs text-gray-400">
                        {formatDistanceToNow(new Date(contact.created_at), { addSuffix: true, locale: ptBR })}
                      </span>
                    </div>
                    <p className="text-gray-500 text-xs mt-1 truncate">{contact.subject}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-sm text-center py-4">Nenhuma mensagem recente.</p>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold text-gray-800 mb-4">Ações Rápidas</h2>
          <div className="grid grid-cols-2 gap-4">
            <Link to="/admin/paginas/nova" className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left group">
              <span className="block font-medium text-gray-800 group-hover:text-blue-600 transition-colors">Nova Página</span>
              <span className="text-xs text-gray-500">Criar novo conteúdo</span>
            </Link>
            <Link to="/admin/midia" className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left group">
              <span className="block font-medium text-gray-800 group-hover:text-blue-600 transition-colors">Gerenciar Mídia</span>
              <span className="text-xs text-gray-500">Upload de imagens</span>
            </Link>
            <Link to="/admin/contatos" className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left group">
              <span className="block font-medium text-gray-800 group-hover:text-blue-600 transition-colors">Ver Contatos</span>
              <span className="text-xs text-gray-500">Responder mensagens</span>
            </Link>
            <Link to="/admin/configuracoes" className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left group">
              <span className="block font-medium text-gray-800 group-hover:text-blue-600 transition-colors">Configurações</span>
              <span className="text-xs text-gray-500">Editar SEO e geral</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
