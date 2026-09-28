import { chromium } from 'playwright';
import fs from 'node:fs';

const baseUrl = process.env.APP_URL || 'http://127.0.0.1:4173';
fs.mkdirSync('evidence', { recursive: true });

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1 });

async function shot(name) {
  await page.screenshot({ path: `evidence/${name}.png`, fullPage: true });
}

await page.goto(baseUrl, { waitUntil: 'networkidle' });
await page.waitForTimeout(1000);
await shot('01-home');

const produtos = page.getByText('Produtos', { exact: true });
if (await produtos.count()) {
  await produtos.first().click();
  await page.waitForTimeout(800);
}
await shot('02-produtos');

const perfil = page.getByText('Perfil', { exact: true });
if (await perfil.count()) {
  await perfil.last().click();
  await page.waitForTimeout(800);
}
const gerenciar = page.getByText('Gerenciar produtos', { exact: true });
if (await gerenciar.count()) {
  await gerenciar.first().click();
  await page.waitForTimeout(800);
}
await shot('03-gerenciar-produtos');

await browser.close();
