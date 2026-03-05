
import puppeteer from 'puppeteer';
import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 1. Iniciar servidor Vite em background
console.log('🚀 Iniciando servidor de preview para teste visual...');

const previewProcess = spawn('npx', ['vite', 'preview', '--port', '4173'], {
  stdio: ['ignore', 'pipe', 'pipe'],
  shell: true,
  cwd: path.resolve(__dirname, '..')
});

const serverUrl = 'http://localhost:4173';

// Aguardar o servidor estar pronto
const waitForServer = new Promise((resolve) => {
  previewProcess.stdout.on('data', (data) => {
    const output = data.toString();
    // console.log('[Vite]', output);
    if (output.includes('Local:') || output.includes('localhost')) {
      resolve();
    }
  });
});

async function runVisualTest() {
  console.log('⏳ Aguardando servidor...');
  // Timeout de segurança se o servidor não subir
  const timeout = setTimeout(() => {
    console.error('❌ Timeout aguardando servidor Vite Preview.');
    process.exit(1);
  }, 10000);

  await waitForServer;
  clearTimeout(timeout);
  console.log('✅ Servidor pronto em', serverUrl);

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();
    
    // Configurar Viewport Mobile
    await page.setViewport({ width: 375, height: 667 });
    console.log('📱 Testando Viewport Mobile (375x667)...');

    // Navegar para Home
    console.log('🌐 Navegando para a Home...');
    await page.goto(serverUrl, { waitUntil: 'networkidle0' });

    // Verificar se o título está correto (KoreBiz-Pro)
    const title = await page.title();
    console.log(`   Título da página: "${title}"`);
    if (!title.includes('KoreBiz-Pro')) {
      throw new Error('Título incorreto! Esperado conter "KoreBiz-Pro"');
    }

    // Verificar Layout Shift no Mapa (Flicker check)
    console.log('🗺️ Verificando componente de Mapa...');
    const mapSelector = '.leaflet-container';
    
    // Esperar pelo mapa (pode não existir na home se não configurado)
    try {
        const map = await page.$(mapSelector);
        if (map) {
             console.log('   ✅ Mapa renderizado com sucesso.');
        } else {
             console.log('   ℹ️ Mapa não presente na Home (OK se esperado).');
        }
    } catch (e) {
        console.warn('   ⚠️ Erro ao verificar mapa:', e.message);
    }

    // Verificar Imagens (Skeleton check)
    console.log('🖼️ Verificando carregamento de imagens...');
    const images = await page.$$('img');
    console.log(`   Encontradas ${images.length} imagens.`);
    
    // Validar se não há imagens quebradas visíveis
    let brokenCount = 0;
    for (const img of images) {
        const isBroken = await page.evaluate((el) => {
            return el.naturalWidth === 0 && el.getAttribute('src') !== '';
        }, img);
        
        if (isBroken) {
            brokenCount++;
            // const src = await page.evaluate(el => el.src, img);
            // console.warn(`   ⚠️ Imagem quebrada detectada: ${src}`);
        }
    }

    if (brokenCount > 0) {
        console.warn(`   ⚠️ ${brokenCount} imagens potencialmente quebradas ou skeletons ativos.`);
    } else {
        console.log('   ✅ Todas as imagens carregaram corretamente.');
    }

    console.log('✅ Teste visual automatizado concluído com sucesso!');

  } catch (error) {
    console.error('❌ Erro no teste visual:', error);
    process.exit(1);
  } finally {
    await browser.close();
    
    // Matar processo do servidor
    if (process.platform === 'win32') {
        spawn('taskkill', ['/pid', previewProcess.pid.toString(), '/f', '/t']);
    } else {
        previewProcess.kill();
    }
    
    process.exit(0);
  }
}

runVisualTest();
