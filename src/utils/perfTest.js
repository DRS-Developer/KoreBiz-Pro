
// Teste de Performance Manual e Validação de Cache

console.group('🚀 Teste de Performance e Cache');

const start = performance.now();

// 1. Verificar se o DataBootstrapper rodou
import { get } from 'idb-keyval';

get('table_media_files_list').then(data => {
    const end = performance.now();
    console.log(`[Cache] Leitura de Mídia do Disco: ${(end - start).toFixed(2)}ms`);
    
    if (data && Array.isArray(data)) {
        console.log(`✅ Sucesso: ${data.length} arquivos de mídia encontrados no cache offline.`);
    } else {
        console.warn('⚠️ Aviso: Cache de mídia vazio ou não inicializado ainda.');
    }
});

get('table_services_list').then(data => {
    if (data) console.log(`✅ Sucesso: Serviços cacheados (${data.length} itens).`);
});

// 2. Verificar Conectividade
console.log(`[Rede] Status: ${navigator.onLine ? 'Online 🟢' : 'Offline 🔴'}`);

console.groupEnd();
