-- Fix security warning: View public.view_menu_sidebar_completo is defined with the SECURITY DEFINER property
-- This ensures the view respects Row Level Security (RLS) policies of the invoking user
ALTER VIEW public.view_menu_sidebar_completo SET (security_invoker = true);
