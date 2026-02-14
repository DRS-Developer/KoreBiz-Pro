import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import dns from 'dns';
import https from 'https';
import { URL } from 'url';

dotenv.config();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY;

console.log('--- Diagnóstico de Conectividade Supabase ---');
console.log(`Timestamp: ${new Date().toISOString()}`);

if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error('ERRO: VITE_SUPABASE_URL ou VITE_SUPABASE_ANON_KEY não encontradas nas variáveis de ambiente.');
    process.exit(1);
}

const supabaseHost = new URL(SUPABASE_URL).hostname;
console.log(`Target Host: ${supabaseHost}`);

async function runDiagnostics() {
    const report = {
        dns: null,
        ping: null,
        db_query: null
    };

    // 1. DNS Lookup
    console.log('\n1. Verificando DNS...');
    try {
        const addresses = await new Promise((resolve, reject) => {
            dns.resolve4(supabaseHost, (err, addresses) => {
                if (err) reject(err);
                else resolve(addresses);
            });
        });
        console.log(`   ✅ DNS Resolvido: ${addresses.join(', ')}`);
        report.dns = 'OK';
    } catch (error) {
        console.error(`   ❌ Falha no DNS: ${error.message}`);
        report.dns = 'FAIL';
    }

    // 2. HTTPS Ping (Latency)
    console.log('\n2. Testando Latência (HTTPS HEAD)...');
    try {
        const start = Date.now();
        await new Promise((resolve, reject) => {
            const req = https.request(SUPABASE_URL, { method: 'HEAD', timeout: 5000 }, (res) => {
                if (res.statusCode >= 200 && res.statusCode < 500) {
                   resolve(res);
                } else {
                   reject(new Error(`Status Code: ${res.statusCode}`));
                }
            });
            req.on('error', reject);
            req.on('timeout', () => { req.destroy(); reject(new Error('Timeout')); });
            req.end();
        });
        const latency = Date.now() - start;
        console.log(`   ✅ Conexão estabelecida em ${latency}ms`);
        report.ping = `${latency}ms`;
    } catch (error) {
        console.error(`   ❌ Falha na conexão HTTPS: ${error.message}`);
        report.ping = 'FAIL';
    }

    // 3. Supabase Client Connection (Auth Endpoint check implicit)
    console.log('\n3. Testando Cliente Supabase (Query Simples)...');
    const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
        auth: {
            persistSession: false,
            autoRefreshToken: false,
            detectSessionInUrl: false
        }
    });

    try {
        const start = Date.now();
        // Trying to fetch system settings or just a health check via a light query
        // Using 'site_settings' as it was seen in memories
        const { data, error, status } = await supabase.from('site_settings').select('count', { count: 'exact', head: true });
        
        const latency = Date.now() - start;

        if (error) {
            console.error(`   ❌ Erro na query: ${error.message} (Code: ${error.code})`);
            console.error(`   Detalhes: ${JSON.stringify(error)}`);
            report.db_query = `FAIL: ${error.message}`;
        } else {
            console.log(`   ✅ Query executada com sucesso em ${latency}ms. Status: ${status}`);
            report.db_query = 'OK';
        }
    } catch (error) {
        console.error(`   ❌ Exceção ao executar query: ${error.message}`);
        report.db_query = 'EXCEPTION';
    }

    console.log('\n--- Resumo do Diagnóstico ---');
    console.table(report);
}

runDiagnostics();
