import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
};

type WidgetPayload = {
  pageKey?: string;
  widgetType?: string;
  variant?: string;
  orderIndex?: number;
  enabled?: boolean;
  settings?: Record<string, unknown>;
  dataBinding?: Record<string, unknown> | null;
  version?: number;
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

const normalizePayload = (payload: WidgetPayload) => {
  if (!payload.widgetType || typeof payload.widgetType !== "string") {
    throw new Error("widgetType é obrigatório.");
  }

  const parsedOrder = Number.isFinite(payload.orderIndex) ? Number(payload.orderIndex) : 0;
  const parsedEnabled = typeof payload.enabled === "boolean" ? payload.enabled : true;

  return {
    page_key: payload.pageKey || "home",
    widget_type: payload.widgetType.trim(),
    variant: (payload.variant || "default").trim(),
    order_index: Math.max(0, Math.floor(parsedOrder)),
    enabled: parsedEnabled,
    settings: payload.settings || {},
    data_binding: payload.dataBinding || null,
  };
};

const isAllowedRole = (role: string) => {
  return ["admin", "editor", "editor-conteudo", "editor_conteudo", "editor-conteúdo"].includes(role);
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

  if (profileError || !profile || !isAllowedRole(profile.role)) {
    return toError("Acesso negado.", 403);
  }

  const url = new URL(req.url);
  const pageKey = url.searchParams.get("pageKey") || "home";
  const id = url.searchParams.get("id");
  const action = url.searchParams.get("action");

  try {
    if (req.method === "GET") {
      const { data, error } = await supabaseAdmin
        .from("home_widgets")
        .select("*")
        .eq("page_key", pageKey)
        .order("order_index", { ascending: true });

      if (error) {
        return toError(error.message, 500);
      }

      return toSuccess(data || []);
    }

    if (req.method === "POST" && action === "reorder") {
      const payload = (await req.json()) as { pageKey?: string; ids?: string[] };
      const finalPageKey = payload.pageKey || pageKey;
      const ids = payload.ids || [];
      if (!Array.isArray(ids) || ids.length === 0) {
        return toError("Informe ids para reordenação.");
      }

      const { data, error } = await supabaseAdmin.rpc("reorder_home_widgets", {
        p_page_key: finalPageKey,
        p_widget_ids: ids,
      });

      if (error) {
        return toError(error.message, 500);
      }

      await supabaseAdmin.from("home_widget_audit_logs").insert({
        action: "reorder_widgets",
        widget_id: null,
        previous_state: null,
        next_state: { ids, pageKey: finalPageKey },
        changed_by: userData.user.id,
      });

      return toSuccess(data || []);
    }

    if (req.method === "POST") {
      const payload = (await req.json()) as WidgetPayload;
      const parsed = normalizePayload(payload);
      const { data, error } = await supabaseAdmin
        .from("home_widgets")
        .insert({
          ...parsed,
          created_by: userData.user.id,
          updated_by: userData.user.id,
        })
        .select("*")
        .single();

      if (error) {
        return toError(error.message, 500);
      }

      await supabaseAdmin.from("home_widget_audit_logs").insert({
        action: "create_widget",
        widget_id: data.id,
        previous_state: null,
        next_state: data,
        changed_by: userData.user.id,
      });

      return toSuccess(data, 201);
    }

    if (req.method === "PUT") {
      if (!id) {
        return toError("Informe id para atualização.");
      }
      const payload = (await req.json()) as WidgetPayload;
      const parsed = normalizePayload(payload);

      const { data: previous } = await supabaseAdmin
        .from("home_widgets")
        .select("*")
        .eq("id", id)
        .single();

      if (typeof payload.version === "number" && previous?.version !== payload.version) {
        return toError("Conflito de versão detectado. Recarregue os dados.", 409);
      }

      const { data, error } = await supabaseAdmin
        .from("home_widgets")
        .update({
          ...parsed,
          updated_by: userData.user.id,
        })
        .eq("id", id)
        .select("*")
        .single();

      if (error) {
        return toError(error.message, 500);
      }

      await supabaseAdmin.from("home_widget_audit_logs").insert({
        action: "update_widget",
        widget_id: data.id,
        previous_state: previous || null,
        next_state: data,
        changed_by: userData.user.id,
      });

      return toSuccess(data);
    }

    if (req.method === "DELETE") {
      if (!id) {
        return toError("Informe id para exclusão.");
      }

      const { data: previous } = await supabaseAdmin
        .from("home_widgets")
        .select("*")
        .eq("id", id)
        .single();

      const { error } = await supabaseAdmin
        .from("home_widgets")
        .delete()
        .eq("id", id);

      if (error) {
        return toError(error.message, 500);
      }

      await supabaseAdmin.from("home_widget_audit_logs").insert({
        action: "delete_widget",
        widget_id: id,
        previous_state: previous || null,
        next_state: null,
        changed_by: userData.user.id,
      });

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
