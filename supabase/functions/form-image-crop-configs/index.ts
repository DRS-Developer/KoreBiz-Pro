import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
};

type Payload = {
  formKey: string;
  label: string;
  description?: string;
  aspectWidth: number;
  aspectHeight: number;
  minWidth: number;
  minHeight: number;
  maxWidth: number;
  maxHeight: number;
  isActive: boolean;
};

const toError = (message: string, status = 400) =>
  new Response(JSON.stringify({ error: message }), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

const toSuccess = <T>(data: T, status = 200) =>
  new Response(JSON.stringify({ data }), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

const parsePayload = (payload: Payload) => {
  if (!payload.formKey || !payload.label) {
    throw new Error("Campos obrigatórios ausentes.");
  }

  const numericFields = [
    payload.aspectWidth,
    payload.aspectHeight,
    payload.minWidth,
    payload.minHeight,
    payload.maxWidth,
    payload.maxHeight,
  ];

  if (numericFields.some((value) => !Number.isFinite(value) || value <= 0)) {
    throw new Error("As dimensões devem ser maiores que zero.");
  }

  if (payload.minWidth > payload.maxWidth || payload.minHeight > payload.maxHeight) {
    throw new Error("Dimensões mínimas não podem ser maiores que as máximas.");
  }

  return {
    form_key: payload.formKey,
    label: payload.label,
    description: payload.description || null,
    aspect_width: Math.round(payload.aspectWidth),
    aspect_height: Math.round(payload.aspectHeight),
    min_width: Math.round(payload.minWidth),
    min_height: Math.round(payload.minHeight),
    max_width: Math.round(payload.maxWidth),
    max_height: Math.round(payload.maxHeight),
    is_active: payload.isActive,
  };
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
  if (!supabaseUrl || !serviceRoleKey || !anonKey) {
    return toError("Configuração de ambiente inválida.", 500);
  }

  const authHeader = req.headers.get("Authorization");
  if (!authHeader) {
    return toError("Token de autenticação ausente.", 401);
  }

  const supabaseAuth = createClient(supabaseUrl, anonKey, {
    global: {
      headers: { Authorization: authHeader },
    },
  });

  const { data: userData, error: userError } = await supabaseAuth.auth.getUser();
  if (userError || !userData.user) {
    return toError("Sessão inválida.", 401);
  }

  const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);
  const { data: profile, error: profileError } = await supabaseAdmin
    .from("profiles")
    .select("role")
    .eq("id", userData.user.id)
    .single();

  if (profileError || !profile || !["admin", "editor"].includes(profile.role)) {
    return toError("Acesso negado.", 403);
  }

  try {
    if (req.method === "GET") {
      const url = new URL(req.url);
      const formKey = url.searchParams.get("formKey");
      let query = supabaseAdmin
        .from("form_image_crop_configs")
        .select("*")
        .order("form_key", { ascending: true });

      if (formKey) {
        query = query.eq("form_key", formKey);
      }

      const { data, error } = await query;
      if (error) {
        return toError(error.message, 500);
      }

      if (formKey) {
        return toSuccess(data?.[0] || null);
      }

      return toSuccess(data || []);
    }

    if (req.method === "PUT" || req.method === "POST") {
      const payload = (await req.json()) as Payload;
      const parsed = parsePayload(payload);

      const { data, error } = await supabaseAdmin
        .from("form_image_crop_configs")
        .upsert(
          {
            ...parsed,
            updated_at: new Date().toISOString(),
            updated_by: userData.user.id,
          },
          { onConflict: "form_key" }
        )
        .select("*")
        .single();

      if (error) {
        return toError(error.message, 500);
      }

      return toSuccess(data);
    }

    if (req.method === "DELETE") {
      const url = new URL(req.url);
      const formKey = url.searchParams.get("formKey");
      if (!formKey) {
        return toError("Informe formKey para exclusão.");
      }

      const { error } = await supabaseAdmin
        .from("form_image_crop_configs")
        .delete()
        .eq("form_key", formKey);

      if (error) {
        return toError(error.message, 500);
      }

      return toSuccess(true);
    }

    return toError("Método não suportado.", 405);
  } catch (error) {
    if (error instanceof Error) {
      return toError(error.message);
    }
    return toError("Falha inesperada ao processar a requisição.");
  }
});
