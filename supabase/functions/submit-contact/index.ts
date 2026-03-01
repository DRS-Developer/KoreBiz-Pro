
import { serve } from "std/http/server.ts"
import { createClient } from "@supabase/supabase-js"
import { Resend } from "resend"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { name, email, phone, message, subject } = await req.json()

    // 1. Validation
    if (!name || !email || !message || !subject) {
      throw new Error('Campos obrigatórios faltando')
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      throw new Error('Email inválido')
    }

    // 2. Sanitization (Basic)
    const sanitize = (str: string) => str.replace(/</g, "&lt;").replace(/>/g, "&gt;")
    const cleanMessage = sanitize(message)
    const cleanName = sanitize(name)
    const cleanSubject = sanitize(subject)

    // 3. Supabase Client (Service Role for bypass RLS)
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    const resendApiKey = Deno.env.get('RESEND_API_KEY')

    if (!supabaseUrl || !supabaseKey || !resendApiKey) {
        throw new Error('Configuração de servidor incompleta')
    }

    const supabase = createClient(supabaseUrl, supabaseKey)
    const resend = new Resend(resendApiKey)

    // 4. Insert into Database
    const { error: dbError } = await supabase
      .from('contacts')
      .insert({
        name: cleanName,
        email,
        phone,
        subject: cleanSubject,
        message: cleanMessage,
        status: 'new'
      })

    if (dbError) throw dbError

    // 5. Send Email
    const { error: emailError } = await resend.emails.send({
      from: 'KoreBiz <onboarding@resend.dev>',
      to: ['devdrsoares@gmail.com'],
      reply_to: email,
      subject: `[Site] ${cleanSubject}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Novo Contato via Site</h2>
          <div style="background: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p><strong>Nome:</strong> ${cleanName}</p>
            <p><strong>E-mail:</strong> ${email}</p>
            <p><strong>Telefone:</strong> ${phone || 'Não informado'}</p>
            <p><strong>Assunto:</strong> ${cleanSubject}</p>
            <p><strong>Mensagem:</strong></p>
            <p style="white-space: pre-wrap;">${cleanMessage}</p>
          </div>
        </div>
      `
    })

    if (emailError) console.error('Erro ao enviar email:', emailError)

    // 6. Audit Log
    await supabase.from('audit_logs').insert({
        action: 'contact_form_submission',
        details: { email, subject: cleanSubject, status: 'success', email_sent: !emailError },
        ip_address: req.headers.get('x-forwarded-for') || 'unknown'
    })

    return new Response(JSON.stringify({ success: true, message: 'Mensagem enviada com sucesso' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (error) {
    console.error('Erro no processamento:', error)
    
    // Log failure if possible
    try {
        const supabaseUrl = Deno.env.get('SUPABASE_URL')
        const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
        if (supabaseUrl && supabaseKey) {
            const supabase = createClient(supabaseUrl, supabaseKey)
            await supabase.from('audit_logs').insert({
                action: 'contact_form_failure',
                details: { error: error.message },
                ip_address: req.headers.get('x-forwarded-for') || 'unknown'
            })
        }
    } catch (e) { /* ignore */ }

    return new Response(JSON.stringify({ error: 'Erro ao processar sua solicitação. Tente novamente mais tarde.' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
