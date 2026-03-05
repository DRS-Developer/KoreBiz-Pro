
import { serve } from "std/http/server.ts"
import { Resend } from "resend"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Email Styles
const STYLES = {
  containerBg: '#f9f9f9',
  borderColor: '#eee',
  footerText: '#888',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
    if (!RESEND_API_KEY) {
      throw new Error('RESEND_API_KEY not configured in Supabase Secrets')
    }

    const resend = new Resend(RESEND_API_KEY)
    const { name, email, phone, message, subject, to_name } = await req.json()

    // Send the email
    const { data, error } = await resend.emails.send({
      from: 'KoreBiz-Pro <onboarding@resend.dev>', // Update this if you have a verified domain
      to: ['devdrsoares@gmail.com'], // Default admin email - change this or use env var
      reply_to: email,
      subject: subject || `Novo contato de ${name}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Novo Contato via Site KoreBiz-Pro</h2>
          <p>Olá <strong>${to_name || 'Admin'}</strong>,</p>
          <p>Você recebeu uma nova mensagem através do formulário de contato.</p>
          
          <div style="background: ${STYLES.containerBg}; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p><strong>Nome:</strong> ${name}</p>
            <p><strong>E-mail:</strong> ${email}</p>
            <p><strong>Telefone:</strong> ${phone || 'Não informado'}</p>
            <p><strong>Mensagem:</strong></p>
            <p style="white-space: pre-wrap;">${message}</p>
          </div>

          <hr style="border: 0; border-top: 1px solid ${STYLES.borderColor}; margin: 20px 0;" />
          <p style="font-size: 12px; color: ${STYLES.footerText};">Mensagem enviada automaticamente pelo sistema KoreBiz-Pro.</p>
        </div>
      `,
    })

    if (error) {
      console.error('Resend API Error:', error);
      return new Response(JSON.stringify({ error: error.message }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      })
    }

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    console.error('Edge Function Error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})
