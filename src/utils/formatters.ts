
export const formatPhoneDisplay = (phone: string | null | undefined): string => {
  if (!phone) return 'Telefone não informado';
  
  const clean = phone.replace(/\D/g, '');
  
  if (clean.length === 11) {
    return `(${clean.slice(0, 2)}) ${clean.slice(2, 7)}-${clean.slice(7)}`;
  }
  
  if (clean.length === 10) {
    return `(${clean.slice(0, 2)}) ${clean.slice(2, 6)}-${clean.slice(6)}`;
  }
  
  // Return original if it doesn't match standard lengths, or cleaned if preferred
  // Returning original allows for things like "0800 123 4567" to at least show up
  return phone;
};

export const formatWhatsAppLink = (phone: string | null | undefined): string => {
  if (!phone) return '#';
  
  let clean = phone.replace(/\D/g, '');
  
  if (clean.length === 0) return '#';
  
  // Assume Brazil (55) if missing and length is 10 or 11 (DDD + Number)
  if (clean.length >= 10 && clean.length <= 11) {
    clean = `55${clean}`;
  }
  
  return `https://wa.me/${clean}`;
};
