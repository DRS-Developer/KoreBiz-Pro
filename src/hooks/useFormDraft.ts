import { useState, useEffect } from 'react';

// Hook para persistência automática de formulários em rascunho
export function useFormDraft<T>(key: string, initialValue: T) {
  // Tenta carregar do localStorage na inicialização
  const [value, setValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(`draft_${key}`);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.warn('Error reading draft from localStorage:', error);
      return initialValue;
    }
  });

  // Salva no localStorage sempre que o valor mudar
  useEffect(() => {
    try {
      window.localStorage.setItem(`draft_${key}`, JSON.stringify(value));
    } catch (error) {
      console.warn('Error saving draft to localStorage:', error);
    }
  }, [key, value]);

  // Função para limpar o rascunho (usar após submit com sucesso)
  const clearDraft = () => {
    try {
      window.localStorage.removeItem(`draft_${key}`);
      setValue(initialValue);
    } catch (error) {
      console.warn('Error clearing draft:', error);
    }
  };

  return [value, setValue, clearDraft] as const;
}
