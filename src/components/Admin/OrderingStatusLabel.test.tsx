import { describe, it, expect, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import OrderingStatusLabel from './OrderingStatusLabel';

describe('OrderingStatusLabel', () => {
  it('exibe estado inicial com texto padrão', () => {
    render(
      <OrderingStatusLabel
        phase="idle"
        allSortingEnabled={true}
        onToggleAllSorting={vi.fn()}
      />
    );

    expect(screen.getByText('Menu Configurável')).toBeInTheDocument();
    expect(screen.queryByRole('status', { name: 'reordenando' })).toBeNull();
    expect(screen.getByRole('button', { name: 'Alternar ordenação de todos os botões' })).toBeInTheDocument();
  });

  it('exibe estado de processamento com spinner', () => {
    render(
      <OrderingStatusLabel
        phase="processing"
        allSortingEnabled={true}
        onToggleAllSorting={vi.fn()}
      />
    );

    expect(screen.getByText('Reordenando')).toBeInTheDocument();
    expect(screen.getByRole('status', { name: 'reordenando' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Alternar ordenação de todos os botões' })).toBeNull();
  });

  it('retorna ao texto padrão após sucesso', () => {
    render(
      <OrderingStatusLabel
        phase="success"
        allSortingEnabled={true}
        onToggleAllSorting={vi.fn()}
      />
    );

    expect(screen.getByText('Reordenado com sucesso')).toBeInTheDocument();
    expect(screen.queryByRole('status', { name: 'reordenando' })).toBeNull();
  });

  it('exibe estado de erro sem spinner', () => {
    render(
      <OrderingStatusLabel
        phase="error"
        allSortingEnabled={true}
        onToggleAllSorting={vi.fn()}
      />
    );

    expect(screen.getByText('Falha ao reordenar')).toBeInTheDocument();
    expect(screen.queryByRole('status', { name: 'reordenando' })).toBeNull();
  });

  it('aciona toggle global no estado padrão', () => {
    const onToggleAllSorting = vi.fn();
    render(
      <OrderingStatusLabel
        phase="idle"
        allSortingEnabled={false}
        onToggleAllSorting={onToggleAllSorting}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: 'Alternar ordenação de todos os botões' }));
    expect(onToggleAllSorting).toHaveBeenCalledWith(true);
  });
});
