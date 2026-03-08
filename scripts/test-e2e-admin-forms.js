import { spawn } from 'child_process';
import fs from 'fs/promises';
import path from 'path';
import process from 'process';
import dotenv from 'dotenv';
import puppeteer from 'puppeteer';

dotenv.config();

const BASE_URL = process.env.E2E_BASE_URL || 'http://127.0.0.1:4173';
const REPORTS_DIR = path.join(process.cwd(), 'reports', 'e2e-forms');

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

const ensureCredentials = () => {
  const email = process.env.E2E_ADMIN_EMAIL;
  const password = process.env.E2E_ADMIN_PASSWORD;
  if (!email || !password) {
    throw new Error('Defina E2E_ADMIN_EMAIL e E2E_ADMIN_PASSWORD.');
  }
  return { email, password };
};

const clickButtonByRegex = async (page, regexSource) => {
  return page.evaluate((pattern) => {
    const normalize = (value) =>
      (value || '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '');
    const regex = new RegExp(pattern, 'i');
    const buttons = Array.from(document.querySelectorAll('button'));
    const button = buttons.find((candidate) => {
      if (candidate.disabled) return false;
      const text = normalize((candidate.textContent || '').trim());
      const style = window.getComputedStyle(candidate);
      const visible = style.display !== 'none' && style.visibility !== 'hidden' && style.opacity !== '0';
      return visible && regex.test(text);
    });
    if (!button) return false;
    button.click();
    return true;
  }, regexSource.normalize('NFD').replace(/[\u0300-\u036f]/g, ''));
};

const fillMinimalSuccessData = async (page) => {
  await page.evaluate(() => {
    const textInputs = Array.from(document.querySelectorAll('input[type="text"], input[type="email"], input[type="password"], textarea'));
    let idx = 0;
    for (const input of textInputs) {
      const element = input;
      const placeholder = (element.getAttribute('placeholder') || '').toLowerCase();
      if (placeholder.includes('slug')) {
        element.value = 'teste-slug-e2e';
      } else if (placeholder.includes('email')) {
        element.value = `teste${Date.now()}@mail.com`;
      } else if (placeholder.includes('url') || placeholder.includes('https')) {
        element.value = 'https://exemplo.com';
      } else if (element.getAttribute('type') === 'password') {
        element.value = 'Senhaforte123';
      } else {
        element.value = `Teste E2E ${idx + 1}`;
      }
      element.dispatchEvent(new Event('input', { bubbles: true }));
      element.dispatchEvent(new Event('change', { bubbles: true }));
      idx += 1;
    }

    const numberInputs = Array.from(document.querySelectorAll('input[type="number"]'));
    for (const input of numberInputs) {
      input.value = '1';
      input.dispatchEvent(new Event('input', { bubbles: true }));
      input.dispatchEvent(new Event('change', { bubbles: true }));
    }
  });
};

const hasValidationError = async (page) => {
  return page.evaluate(() => {
    const text = (document.body?.innerText || '').toLowerCase();
    return (
      text.includes('obrigatório') ||
      text.includes('inválido') ||
      text.includes('deve') ||
      text.includes('coincidir')
    );
  });
};

const run = async () => {
  await fs.mkdir(REPORTS_DIR, { recursive: true });
  let devServer = null;
  let browser = null;

  try {
    let serverReady = await waitForServer(BASE_URL, 2);
    if (!serverReady) {
      devServer = spawn('npm run dev -- --host 127.0.0.1 --port 4173', [], {
        shell: true,
        stdio: ['ignore', 'pipe', 'pipe'],
      });
      devServer.stdout.on('data', (data) => process.stdout.write(data.toString()));
      devServer.stderr.on('data', (data) => process.stderr.write(data.toString()));
      serverReady = await waitForServer(BASE_URL, 60);
    }
    if (!serverReady) throw new Error('Servidor não iniciou.');

    const credentials = ensureCredentials();
    const scenarios = [
      { name: 'services', route: '/admin/services/novo', submit: 'Salvar Servico' },
      { name: 'portfolio', route: '/admin/portfolio/novo', submit: 'Criar Projeto|Salvar Alteracoes' },
      { name: 'pages', route: '/admin/paginas/nova', submit: 'Salvar Pagina' },
      { name: 'partners', route: '/admin/parceiros/novo', submit: 'Salvar' },
      { name: 'practice-areas', route: '/admin/areas-atuacao/novo', submit: 'Salvar' },
      { name: 'users', route: '/admin/usuarios/novo', submit: 'Criar Usuario' },
    ];

    browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 900 });

    await page.goto(`${BASE_URL}/admin/login`, { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('input[type="email"]', { timeout: 45000 });
    await page.type('input[type="email"]', credentials.email);
    await page.type('input[type="password"]', credentials.password);
    await clickButtonByRegex(page, 'entrar');
    await page.waitForFunction(() => window.location.pathname.includes('/admin/dashboard'), { timeout: 45000 });

    const report = [];

    for (const scenario of scenarios) {
      await page.goto(`${BASE_URL}${scenario.route}`, { waitUntil: 'domcontentloaded' });
      await page.waitForFunction(() => document.readyState === 'complete', { timeout: 30000 });
      await page.waitForFunction(
        () => Array.from(document.querySelectorAll('button')).some((button) => (button.textContent || '').trim().length > 0),
        { timeout: 45000 }
      );

      const emptySubmitClicked = await clickButtonByRegex(page, scenario.submit);
      if (!emptySubmitClicked) {
        const diagnostic = await page.evaluate(() =>
          Array.from(document.querySelectorAll('button')).map((button) => (button.textContent || '').trim()).filter(Boolean)
        );
        const screenshotPath = path.join(REPORTS_DIR, `${scenario.name}-unavailable.png`);
        await page.screenshot({ path: screenshotPath, fullPage: true });
        report.push({
          name: scenario.name,
          route: scenario.route,
          status: 'unavailable',
          reason: `submit não encontrado`,
          currentUrl: page.url(),
          buttons: diagnostic,
          screenshotPath,
        });
        continue;
      }

      await new Promise((resolve) => setTimeout(resolve, 800));
      const emptyValidationDetected = await hasValidationError(page);

      await fillMinimalSuccessData(page);
      await clickButtonByRegex(page, scenario.submit);
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const screenshotPath = path.join(REPORTS_DIR, `${scenario.name}.png`);
      await page.screenshot({ path: screenshotPath, fullPage: true });

      report.push({
        name: scenario.name,
        route: scenario.route,
        status: 'executed',
        emptyValidationDetected,
        screenshotPath,
      });
    }

    const reportPath = path.join(REPORTS_DIR, 'resultado.json');
    await fs.writeFile(
      reportPath,
      JSON.stringify(
        {
          status: 'ok',
          executedAt: new Date().toISOString(),
          scenarios: report,
        },
        null,
        2
      )
    );
    console.log(`E2E formulários concluído: ${reportPath}`);
  } finally {
    if (browser) await browser.close();
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
  console.error('Falha no E2E de formulários:', error.message);
  process.exit(1);
});
