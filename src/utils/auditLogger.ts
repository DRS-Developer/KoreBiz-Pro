
export type AuditAction = 'IMAGE_REPLACEMENT' | 'IMAGE_DELETION' | 'IMAGE_UPLOAD';

interface AuditLogEntry {
  action: AuditAction;
  entityType: 'service' | 'portfolio' | 'partner' | 'page' | 'setting' | 'profile';
  entityId: string;
  details: {
    oldValue?: string | null;
    newValue?: string | null;
    reason?: string;
    user?: string;
  };
  timestamp: string;
}

/**
 * Logs audit events.
 * Currently logs to console as there is no backend audit table.
 * In a production environment, this should write to a 'audit_logs' table in Supabase.
 */
export const logAudit = async (
  action: AuditAction,
  entityType: AuditLogEntry['entityType'],
  entityId: string,
  details: AuditLogEntry['details']
) => {
  const entry: AuditLogEntry = {
    action,
    entityType,
    entityId,
    details,
    timestamp: new Date().toISOString(),
  };

  console.info(`[AUDIT] ${action} on ${entityType} (${entityId})`, entry);
  
  // Example of how it would be implemented with Supabase if the table existed:
  /*
  await supabase.from('audit_logs').insert({
    action,
    entity_type: entityType,
    entity_id: entityId,
    details: details,
    created_at: new Date().toISOString()
  });
  */
};
