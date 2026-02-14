
-- Add email_settings column for dynamic email provider configuration
ALTER TABLE public.site_settings
ADD COLUMN IF NOT EXISTS email_settings JSONB DEFAULT '{"provider": "emailjs", "emailjs": {"serviceId": "", "templateId": "", "publicKey": ""}, "supabase": {"functionUrl": "", "anonKey": ""}}'::jsonb;
