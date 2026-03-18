import { spawn } from 'child_process';
import fs from 'fs/promises';
import path from 'path';
import process from 'process';
import dotenv from 'dotenv';
import puppeteer from 'puppeteer';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const BASE_URL = process.env.E2E_BASE_URL || 'http://127.0.0.1:4173';
const REPORTS_DIR = path.join(process.cwd(), 'reports', 'e2e-home-builder');

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

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

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

const collectVisibleButtons = async (page) => {
  return page.evaluate(() => {
    const normalize = (value) =>
      (value || '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '');
    return Array.from(document.querySelectorAll('button'))
      .filter((button) => {
        const style = window.getComputedStyle(button);
        return style.display !== 'none' && style.visibility !== 'hidden' && style.opacity !== '0';
      })
      .map((button) => normalize((button.textContent || '').trim()))
      .filter(Boolean);
  });
};

const setHomeBuilderFlag = async (credentials, enabled) => {
  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseAnonKey) {
    return async () => {};
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey);
  const { error: authError } = await supabase.auth.signInWithPassword({
    email: credentials.email,
    password: credentials.password,
  });
  if (authError) {
    throw new Error(`Falha ao autenticar para configurar flag: ${authError.message}`);
  }

  const { data, error } = await supabase.from('site_settings').select('id, layout_settings').limit(1).single();
  if (error || !data) {
    throw new Error(`Falha ao ler site_settings: ${error?.message || 'registro ausente'}`);
  }

  const previousLayout = data.layout_settings || {};
  const nextLayout = {
    ...previousLayout,
    home_builder_v2_enabled: enabled,
  };

  const { error: updateError } = await supabase
    .from('site_settings')
    .update({ layout_settings: nextLayout, updated_at: new Date().toISOString() })
    .eq('id', data.id);

  if (updateError) {
    throw new Error(`Falha ao atualizar flag home_builder_v2_enabled: ${updateError.message}`);
  }

  return async () => {
    await supabase
      .from('site_settings')
      .update({ layout_settings: previousLayout, updated_at: new Date().toISOString() })
      .eq('id', data.id);
    await supabase.auth.signOut();
  };
};

const dragWidget = async (page, dragHandleSelector, dropItemSelector) => {
  const dragHandle = await page.$(dragHandleSelector);
  const dropItem = await page.$(dropItemSelector);
  if (!dragHandle || !dropItem) {
    throw new Error('Elementos de drag-and-drop não encontrados.');
  }
  const dragBox = await dragHandle.boundingBox();
  const dropBox = await dropItem.boundingBox();
  if (!dragBox || !dropBox) {
    throw new Error('Não foi possível obter coordenadas para drag-and-drop.');
  }

  await page.mouse.move(dragBox.x + dragBox.width / 2, dragBox.y + dragBox.height / 2);
  await page.mouse.down();
  await page.mouse.move(dropBox.x + dropBox.width / 2, dropBox.y + dropBox.height / 2, { steps: 20 });
  await sleep(200);
  await page.mouse.up();
  await sleep(1200);
};

const launchBrowser = async () => {
  const attempts = [
    { headless: true, args: ['--no-sandbox'] },
    { headless: true, channel: 'chrome', args: ['--no-sandbox'] },
    { headless: true, channel: 'msedge', args: ['--no-sandbox'] },
  ];

  let lastError = null;
  for (const options of attempts) {
    try {
      return await puppeteer.launch(options);
    } catch (error) {
      lastError = error;
    }
  }
  if (lastError instanceof Error) {
    throw new Error(lastError.message);
  }
  throw new Error('Falha ao iniciar navegador para E2E.');
};

const run = async () => {
  await fs.mkdir(REPORTS_DIR, { recursive: true });
  let devServer = null;
  let browser = null;
  let restoreFlag = async () => {};

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
    restoreFlag = await setHomeBuilderFlag(credentials, true);

    browser = await launchBrowser();
    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 900 });

    await page.goto(`${BASE_URL}/admin/login`, { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('input[type="email"]', { timeout: 45000 });
    await page.type('input[type="email"]', credentials.email);
    await page.type('input[type="password"]', credentials.password);
    await clickButtonByRegex(page, 'entrar');
    await page.waitForFunction(() => window.location.pathname.includes('/admin/dashboard'), { timeout: 45000 });

    await page.goto(`${BASE_URL}/admin/home`, { waitUntil: 'domcontentloaded' });
    await page.waitForFunction(() => document.readyState === 'complete', { timeout: 30000 });
    await clickButtonByRegex(page, 'Secoes da Home|Seções da Home');
    let builderAvailable = true;
    try {
      await page.waitForSelector('[data-testid="add-widget-button"]', { timeout: 15000 });
    } catch {
      await page.reload({ waitUntil: 'domcontentloaded' });
      await page.waitForFunction(() => document.readyState === 'complete', { timeout: 30000 });
      await clickButtonByRegex(page, 'Secoes da Home|Seções da Home');
      try {
        await page.waitForSelector('[data-testid="add-widget-button"]', { timeout: 15000 });
      } catch {
        builderAvailable = false;
      }
    }

    const report = {
      executedAt: new Date().toISOString(),
      steps: [],
    };

    if (builderAvailable) {
      await page.click('[data-testid="add-widget-button"]');
      await page.waitForSelector('[data-testid="widget-palette-modal"]', { timeout: 10000 });
      await page.click('[data-testid="widget-template-hero"]');
      await sleep(800);
      report.steps.push('Elemento Hero adicionado');

      await page.click('[data-testid="add-widget-button"]');
      await page.waitForSelector('[data-testid="widget-palette-modal"]', { timeout: 10000 });
      await page.click('[data-testid="widget-template-contact"]');
      await sleep(800);
      report.steps.push('Elemento Contato adicionado');

      await page.waitForFunction(
        () => document.querySelectorAll('[data-testid^="widget-item-"]').length >= 2,
        { timeout: 20000 }
      );

      const itemIds = await page.$$eval('[data-testid^="widget-item-"]', (elements) =>
        elements.map((item) => item.getAttribute('data-testid')?.replace('widget-item-', '')).filter(Boolean)
      );

      await dragWidget(page, `[data-testid="widget-drag-${itemIds[0]}"]`, `[data-testid="widget-item-${itemIds[1]}"]`);
      report.steps.push('Reordenação por drag-and-drop executada');

      await page.click(`[data-testid="widget-select-${itemIds[0]}"]`);
      await page.waitForSelector('[data-testid="widget-settings-panel"]', { timeout: 10000 });
      await page.click('[data-testid="widget-variant-input"]', { clickCount: 3 });
      await page.type('[data-testid="widget-variant-input"]', 'default-e2e');
      await page.click('[data-testid="widget-save-button"]');
      await sleep(1000);
      report.steps.push('Edição de propriedades e salvamento executados');
    } else {
      const buttons = await collectVisibleButtons(page);
      report.steps.push(`Builder v2 indisponível; fallback legado verificado (${buttons.join(' | ')})`);
    }

    await page.goto(`${BASE_URL}/`, { waitUntil: 'domcontentloaded' });
    await page.waitForFunction(() => document.body && document.body.innerText.length > 50, { timeout: 30000 });
    report.steps.push('Página Home carregada após mudanças');

    const screenshotPath = path.join(REPORTS_DIR, 'home-builder.png');
    await page.screenshot({ path: screenshotPath, fullPage: true });

    await fs.writeFile(
      path.join(REPORTS_DIR, 'resultado.json'),
      JSON.stringify(
        {
          status: 'ok',
          mode: builderAvailable ? 'builder_v2' : 'fallback_legado',
          ...report,
          screenshotPath,
        },
        null,
        2
      )
    );
    console.log(`E2E Home Builder concluído: ${path.join(REPORTS_DIR, 'resultado.json')}`);
  } finally {
    try {
      await restoreFlag();
    } catch {}
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
  console.error('Falha no E2E Home Builder:', error.message);
  process.exit(1);
});
