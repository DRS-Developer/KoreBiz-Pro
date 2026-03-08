import { spawn } from 'child_process';
import fs from 'fs/promises';
import path from 'path';
import os from 'os';
import process from 'process';
import dotenv from 'dotenv';
import puppeteer from 'puppeteer';

dotenv.config();

const BASE_URL = process.env.E2E_BASE_URL || 'http://127.0.0.1:4173';
const REPORTS_DIR = path.join(process.cwd(), 'reports', 'e2e-editor');

const waitForServer = async (url, maxRetries = 60) => {
  for (let i = 0; i < maxRetries; i += 1) {
    try {
      const response = await fetch(url);
      if (response.ok) return true;
    } catch {}
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
  return false;
};

const ensureCredentials = async () => {
  const envEmail = process.env.E2E_ADMIN_EMAIL;
  const envPassword = process.env.E2E_ADMIN_PASSWORD;
  if (envEmail && envPassword) {
    return { email: envEmail, password: envPassword, source: 'env' };
  }
  throw new Error('Defina E2E_ADMIN_EMAIL e E2E_ADMIN_PASSWORD para executar o fluxo E2E autenticado.');
};

const downloadFixtureImage = async () => {
  const tempFile = path.join(os.tmpdir(), `e2e-editor-${Date.now()}.jpg`);
  const response = await fetch('https://picsum.photos/1600/1200.jpg');
  if (!response.ok) throw new Error(`Falha ao baixar imagem de teste: ${response.status}`);
  const arrayBuffer = await response.arrayBuffer();
  await fs.writeFile(tempFile, Buffer.from(arrayBuffer));
  return tempFile;
};

const clickButtonByText = async (page, regexSource) => {
  return page.evaluate((pattern) => {
    const regex = new RegExp(pattern, 'i');
    const buttons = Array.from(document.querySelectorAll('button'));
    const button = buttons.find((candidate) => {
      if (candidate.disabled) return false;
      const text = (candidate.textContent || '').trim();
      const style = window.getComputedStyle(candidate);
      const visible = style.display !== 'none' && style.visibility !== 'hidden' && style.opacity !== '0';
      return visible && regex.test(text);
    });
    if (!button) return false;
    button.click();
    return true;
  }, regexSource);
};

const clickEditorSaveButton = async (page) => {
  return page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const preferredLabels = ['Save', 'Salvar', 'Salvar Corte'];
    const button = buttons.find((candidate) => {
      if (candidate.disabled) return false;
      const text = (candidate.textContent || '').trim();
      const style = window.getComputedStyle(candidate);
      const visible = style.display !== 'none' && style.visibility !== 'hidden' && style.opacity !== '0';
      return visible && preferredLabels.includes(text);
    });
    if (!button) return false;
    button.click();
    return true;
  });
};

const getVisibleButtonTexts = async (page) => {
  return page.evaluate(() =>
    Array.from(document.querySelectorAll('button'))
      .map((candidate) => ({
        text: (candidate.textContent || '').trim(),
        hidden:
          window.getComputedStyle(candidate).display === 'none' ||
          window.getComputedStyle(candidate).visibility === 'hidden' ||
          window.getComputedStyle(candidate).opacity === '0',
      }))
      .filter((item) => item.text)
      .slice(0, 50)
  );
};

const run = async () => {
  await fs.mkdir(REPORTS_DIR, { recursive: true });
  let devServer = null;

  let browser;
  let currentPage = null;
  let fixturePath = '';
  try {
    let serverReady = await waitForServer(BASE_URL, 2);
    if (!serverReady) {
      devServer = spawn(
        'npm run dev -- --host 127.0.0.1 --port 4173',
        [],
        { shell: true, stdio: ['ignore', 'pipe', 'pipe'] }
      );
      devServer.stdout.on('data', (data) => process.stdout.write(data.toString()));
      devServer.stderr.on('data', (data) => process.stderr.write(data.toString()));
      serverReady = await waitForServer(BASE_URL, 60);
    }
    if (!serverReady) throw new Error('Servidor de desenvolvimento não iniciou no tempo esperado.');

    const credentials = await ensureCredentials();
    fixturePath = await downloadFixtureImage();

    browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
    const page = await browser.newPage();
    currentPage = page;
    await page.setViewport({ width: 1440, height: 900 });
    page.on('pageerror', (error) => {
      console.error('PAGE_ERROR:', error.message);
    });
    page.on('console', (message) => {
      const type = message.type().toUpperCase();
      if (type === 'ERROR') {
        console.error('BROWSER_CONSOLE_ERROR:', message.text());
      }
    });

    await page.goto(`${BASE_URL}/admin/login`, { waitUntil: 'domcontentloaded' });
    await page.waitForFunction(() => document.readyState === 'complete', { timeout: 30000 });
    await page.waitForSelector('input[type="email"]', { timeout: 45000 });
    await page.type('input[type="email"]', credentials.email);
    await page.type('input[type="password"]', credentials.password);
    await clickButtonByText(page, 'entrar');
    await page.waitForFunction(() => window.location.pathname.includes('/admin/dashboard'), { timeout: 45000 });

    const scenarios = [
      { name: 'services', route: '/admin/services/novo' },
      { name: 'portfolio', route: '/admin/portfolio/novo' },
      { name: 'pages', route: '/admin/paginas/nova' },
    ];

    const summary = [];

    for (const scenario of scenarios) {
      await page.goto(`${BASE_URL}${scenario.route}`, { waitUntil: 'domcontentloaded' });
      await page.waitForFunction(() => document.readyState === 'complete', { timeout: 30000 });
      const currentPath = new URL(page.url()).pathname;
      if (currentPath.includes('/admin/login')) {
        throw new Error(`Sessão expirada ao acessar ${scenario.route}.`);
      }
      await page.waitForSelector('input[type="file"]', { timeout: 45000 });
      const inputs = await page.$$('input[type="file"]');
      if (!inputs.length) throw new Error(`Input de arquivo não encontrado em ${scenario.route}. URL atual: ${currentPath}`);
      let input = null;
      for (const candidate of inputs) {
        const accept = (await candidate.evaluate((node) => (node.getAttribute('accept') || '').toLowerCase())) || '';
        if (accept.includes('image')) {
          input = candidate;
          break;
        }
      }
      if (!input) {
        input = inputs[0];
      }
      await input.uploadFile(fixturePath);
      await page.waitForFunction(
        () =>
          Array.from(document.querySelectorAll('button')).some((candidate) => {
            const text = (candidate.textContent || '').trim();
            return text === 'Save' || text === 'Salvar' || text === 'Salvar Corte';
          }),
        { timeout: 45000 }
      );

      const saveClicked = await clickEditorSaveButton(page);
      if (!saveClicked) {
        await page.waitForFunction(
          () => {
            const buttons = Array.from(document.querySelectorAll('button'));
            const button = buttons.find((candidate) => {
              if (candidate.disabled) return false;
              const text = (candidate.textContent || '').trim();
              return text === 'Save' || text === 'Salvar' || text === 'Salvar Corte';
            });
            if (!button) return false;
            button.click();
            return true;
          },
          { timeout: 45000 }
        );
      }
      await new Promise((resolve) => setTimeout(resolve, 800));
      await clickEditorSaveButton(page);

      await page.waitForFunction(
        () =>
          Array.from(document.images).some((image) => {
            const alt = image.getAttribute('alt') || '';
            return alt.startsWith('Preview') && !!image.getAttribute('src');
          }),
        { timeout: 40000 }
      );

      const screenshotPath = path.join(REPORTS_DIR, `e2e-${scenario.name}.png`);
      await page.screenshot({ path: screenshotPath, fullPage: true });
      summary.push({ scenario: scenario.name, screenshotPath });
    }

    const reportPath = path.join(REPORTS_DIR, 'resultado.json');
    await fs.writeFile(
      reportPath,
      JSON.stringify(
        {
          status: 'ok',
          baseUrl: BASE_URL,
          credentialsSource: credentials.source,
          scenarios: summary,
          executedAt: new Date().toISOString(),
        },
        null,
        2
      )
    );

    console.log('E2E concluído com sucesso.');
    console.log(`Relatório: ${reportPath}`);
  } catch (error) {
    if (currentPage) {
      try {
        const failPath = path.join(REPORTS_DIR, `erro-${Date.now()}.png`);
        await currentPage.screenshot({ path: failPath, fullPage: true });
        const buttons = await getVisibleButtonTexts(currentPage);
        const currentUrl = currentPage.url();
        const html = await currentPage.content();
        console.error('URL no erro:', currentUrl);
        console.error('HTML length no erro:', html.length);
        console.error('Botões visíveis (diagnóstico):', JSON.stringify(buttons, null, 2));
        console.error('Screenshot de erro:', failPath);
      } catch {}
    }
    throw error;
  } finally {
    if (browser) await browser.close();
    if (fixturePath) {
      try {
        await fs.unlink(fixturePath);
      } catch {}
    }
    if (devServer && devServer.exitCode === null && !devServer.killed) {
      if (process.platform === 'win32' && devServer.pid) {
        spawn(`taskkill /pid ${devServer.pid} /t /f`, [], { shell: true, stdio: 'ignore' });
      } else {
        devServer.kill();
      }
    }
  }
};

run().catch((error) => {
  console.error('Falha no E2E:', error.message);
  process.exit(1);
});
