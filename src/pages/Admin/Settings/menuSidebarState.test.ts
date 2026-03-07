import { describe, expect, it } from 'vitest';
import { applyMenuFieldUpdate } from './menuSidebarState';

const baseItem = {
  modulo_id: '1',
  visibilidade_personalizada: true,
  status_ativo: true,
  nome_personalizado: 'Serviços',
};

describe('applyMenuFieldUpdate', () => {
  it('ativa Site automaticamente ao tornar Sidebar visível', () => {
    const current = {
      ...baseItem,
      visibilidade_personalizada: false,
      status_ativo: false,
    };

    const next = applyMenuFieldUpdate(current, 'visibilidade_personalizada', true);

    expect(next.visibilidade_personalizada).toBe(true);
    expect(next.status_ativo).toBe(true);
  });

  it('oculta Site ao ocultar Sidebar', () => {
    const next = applyMenuFieldUpdate(baseItem, 'visibilidade_personalizada', false);

    expect(next.visibilidade_personalizada).toBe(false);
    expect(next.status_ativo).toBe(false);
  });

  it('mantém visibilidade da Sidebar ao alternar Site manualmente', () => {
    const current = {
      ...baseItem,
      visibilidade_personalizada: true,
      status_ativo: true,
    };

    const next = applyMenuFieldUpdate(current, 'status_ativo', false);

    expect(next.status_ativo).toBe(false);
    expect(next.visibilidade_personalizada).toBe(true);
  });
});
