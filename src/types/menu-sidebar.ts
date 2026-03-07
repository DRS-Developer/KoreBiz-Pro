export interface MenuSidebarConfig {
  id: string;
  menu_ordenacao_id: string; // Referência ao system_modules.id
  nome_botao: string;
  status_botao: boolean;
  visibilidade_botao: boolean;
  data_ultima_configuracao: string;
  usuario_ultima_alteracao: string;
  metadados?: Record<string, any>;
}

export interface MenuSidebarView {
  modulo_id: string;
  modulo_key: string;
  modulo_nome_original: string;
  order_position: number;
  config_id: string | null;
  nome_exibicao: string; // Já resolvido (customizado ou original)
  status_ativo: boolean; // Já resolvido (customizado ou original)
  visivel: boolean;
  metadados?: Record<string, any>;
}
