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

const run = async () => {
  await fs.mkdir(REPORTS_DIR, { recursive: true });
  let devServer = null;

  let browser;
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
    await page.setViewport({ width: 1440, height: 900 });

    await page.goto(`${BASE_URL}/admin/login`, { waitUntil: 'networkidle2' });
    await page.type('input[type="email"]', credentials.email);
    await page.type('input[type="password"]', credentials.password);
    await clickButtonByText(page, 'entrar');
    await page.waitForFunction(() => window.location.pathname.includes('/admin/dashboard'), { timeout: 30000 });

    const scenarios = [
      { name: 'services', route: '/admin/services/novo' },
      { name: 'portfolio', route: '/admin/portfolio/novo' },
      { name: 'pages', route: '/admin/paginas/nova' },
    ];

    const summary = [];

    for (const scenario of scenarios) {
      await page.goto(`${BASE_URL}${scenario.route}`, { waitUntil: 'networkidle2' });

      const input = await page.$('input[type="file"]');
      if (!input) throw new Error(`Input de arquivo não encontrado em ${scenario.route}`);
      await input.uploadFile(fixturePath);

      const saveClicked = await page.waitForFunction(
        () => {
          const buttons = Array.from(document.querySelectorAll('button'));
          const button = buttons.find((candidate) => {
            if (candidate.disabled) return false;
            const text = (candidate.textContent || '').trim();
            return /save|salvar/i.test(text);
          });
          if (!button) return false;
          button.click();
          return true;
        },
        { timeout: 40000 }
      );
      if (!saveClicked) throw new Error(`Botão de salvar do editor não encontrado em ${scenario.route}`);

      await page.waitForFunction(
        () => Array.from(document.images).some((image) => image.alt === 'Preview' && !!image.getAttribute('src')),
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
