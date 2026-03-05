import React from 'react';
import { clsx } from 'clsx';

export type OrderingPhase = 'idle' | 'processing' | 'success' | 'error';

interface OrderingStatusLabelProps {
  phase: OrderingPhase;
  allSortingEnabled: boolean;
  onToggleAllSorting: (enabled: boolean) => void;
  disabled?: boolean;
}

const OrderingStatusLabel: React.FC<OrderingStatusLabelProps> = ({
  phase,
  allSortingEnabled,
  onToggleAllSorting,
  disabled = false,
}) => {
  const isProcessing = phase === 'processing';
  const isError = phase === 'error';
  const isSuccess = phase === 'success';
  const isIdle = phase === 'idle';

  return (
    <div
      className={clsx(
        "px-4 pb-2 text-[11px] font-semibold uppercase tracking-wider flex items-center justify-between min-h-5",
        isError ? "text-red-300" : isSuccess ? "text-emerald-300" : "text-blue-300"
      )}
    >
      <span>
        {isProcessing
          ? 'Reordenando'
          : isSuccess
            ? 'Reordenado com sucesso'
            : isError
              ? 'Falha ao reordenar'
              : 'Menu Configurável'}
      </span>
      {isProcessing && (
        <div
          role="status"
          aria-label="reordenando"
          className="w-3.5 h-3.5 border-2 border-blue-200 border-t-transparent rounded-full animate-spin"
        />
      )}
      {isIdle && (
        <button
          type="button"
          onClick={() => onToggleAllSorting(!allSortingEnabled)}
          disabled={disabled}
          title={allSortingEnabled ? 'Desativar ordenação de todos' : 'Ativar ordenação de todos'}
          className={clsx(
            "relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-1",
            allSortingEnabled ? "bg-blue-500" : "bg-gray-400",
            disabled && "opacity-60 cursor-not-allowed"
          )}
          aria-label="Alternar ordenação de todos os botões"
        >
          <span
            className={clsx(
              "inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ease-in-out shadow-sm",
              allSortingEnabled ? "translate-x-4" : "translate-x-1"
            )}
          />
        </button>
      )}
    </div>
  );
};

export default OrderingStatusLabel;
