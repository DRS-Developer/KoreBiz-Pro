export const applyMenuFieldUpdate = <T extends { visibilidade_personalizada: boolean; status_ativo: boolean }>(
  item: T,
  field: string,
  value: unknown
): T => {
  if (field === 'visibilidade_personalizada') {
    const isSidebarVisible = Boolean(value);
    return {
      ...item,
      visibilidade_personalizada: isSidebarVisible,
      status_ativo: isSidebarVisible ? true : false,
    } as T;
  }

  return {
    ...item,
    [field]: value
  } as T;
};
