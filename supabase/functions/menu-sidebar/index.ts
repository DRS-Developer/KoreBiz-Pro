import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.8";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: req.headers.get("Authorization")! } } }
    );

    // Get site features
    const { data: siteSettings, error: settingsError } = await supabaseClient
      .from('site_settings')
      .select('features')
      .single();
    
    if (settingsError) throw settingsError;

    const isMenuV2Enabled = siteSettings?.features?.menu_sidebar_v2 === true;
    const url = new URL(req.url);
    const path = url.pathname.split("/").pop(); // Get last segment
    const method = req.method;

    // Check admin permissions for write operations
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    const isAdmin = user && (user.app_metadata?.role === 'admin' || user.app_metadata?.role === 'service_role'); // Simplificação

    if (!isAdmin && ["POST", "PUT", "DELETE", "PATCH"].includes(method)) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 403,
      });
    }

    // --- GET Handlers ---
    if (method === "GET") {
      // Feature Flag Check for Read
      if (!isMenuV2Enabled) {
        // Fallback to original system_modules logic
        const { data, error } = await supabaseClient
          .from('system_modules')
          .select('*')
          .eq('is_active', true)
          .order('order_position');
        
        if (error) throw error;
        
        return new Response(JSON.stringify(data), {
          headers: { ...corsHeaders, "Content-Type": "application/json", "Cache-Control": "public, max-age=60" },
        });
      }

      // V2 Logic: Use the view
      if (path && path !== "menu-sidebar") {
        // GET /api/menu-sidebar/{id}
        const { data, error } = await supabaseClient
          .from('view_menu_sidebar_completo')
          .select('*')
          .eq('config_id', path) // Assuming ID passed is config_id
          .single();
          
        if (error) throw error;
        return new Response(JSON.stringify(data), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
      } else {
        // GET /api/menu-sidebar (List all)
        let query = supabaseClient
          .from('view_menu_sidebar_completo')
          .select('*')
          .order('order_position');

        // If NOT admin, filter invisible items (already handled by view logic but double check)
        if (!isAdmin) {
          query = query.eq('visivel', true);
        }

        const { data, error } = await query;
        if (error) throw error;

        return new Response(JSON.stringify(data), {
          headers: { 
            ...corsHeaders, 
            "Content-Type": "application/json",
            "Cache-Control": isAdmin ? "no-cache" : "public, max-age=60" // Cache for public, no-cache for admin
          },
        });
      }
    }

    // --- Write Handlers (Admin Only) ---

    // POST /api/menu-sidebar (Create/Configure)
    if (method === "POST") {
      const body = await req.json();
      const { menu_ordenacao_id, nome_botao, status_botao, visibilidade_botao, metadados } = body;

      // Validate integrity
      if (!menu_ordenacao_id) throw new Error("menu_ordenacao_id is required");

      const { data, error } = await supabaseClient
        .from('menu_sidebar_config')
        .insert({
          menu_ordenacao_id,
          nome_botao,
          status_botao,
          visibilidade_botao,
          metadados,
          usuario_ultima_alteracao: user?.id
        })
        .select()
        .single();

      if (error) throw error;
      return new Response(JSON.stringify(data), { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 201 });
    }

    // PUT /api/menu-sidebar/{id} (Update)
    if (method === "PUT") {
      const id = path;
      const body = await req.json();
       // Remove protected fields from body if any
      const { menu_ordenacao_id, ...updates } = body;

      const { data, error } = await supabaseClient
        .from('menu_sidebar_config')
        .update({
          ...updates,
          usuario_ultima_alteracao: user?.id,
          data_ultima_configuracao: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return new Response(JSON.stringify(data), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // PATCH /api/menu-sidebar/{id}/status (Update Status/Visibility)
    if (method === "PATCH" && path?.includes("status")) {
        // Extract ID from path logic might need adjustment if using file-based routing or just regex
        // Assuming path is the ID here for simplicity or needs better routing logic
        // For simplicity in this example, let's assume the ID is passed differently or we parse it better.
        // Let's assume the client calls the function with query param ?id=... or we rely on body.
        
        // Better approach for single function: rely on body or query params for complex routing
        // But following RESTful strictly:
        const id = req.url.split("/").slice(-2)[0]; // get ID before 'status'
        const body = await req.json();
        
        const { data, error } = await supabaseClient
            .from('menu_sidebar_config')
            .update({
                status_botao: body.status_botao,
                visibilidade_botao: body.visibilidade_botao,
                usuario_ultima_alteracao: user?.id
            })
            .eq('id', id)
            .select()
            .single();
            
        if (error) throw error;
        return new Response(JSON.stringify(data), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    
    // DELETE /api/menu-sidebar/{id}
    if (method === "DELETE") {
      const id = path;
      const { error } = await supabaseClient
        .from('menu_sidebar_config')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return new Response(null, { headers: corsHeaders, status: 204 });
    }

    return new Response(JSON.stringify({ error: "Method not allowed" }), { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 405 
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
