import { expect, Page } from '@playwright/test';

// Valores fictícios, só para a API de teste subida em playwright.config.ts.
export const API_URL = 'http://127.0.0.1:3334';
export const AUTH_SECRET_TESTE = 'segredo-ficticio-apenas-para-testes-e2e-0123456789';
export const ADMIN_EMAIL = 'admin@galeriaseleta.test';
export const ADMIN_SENHA = 'senha-admin-de-teste-123';

export const SENHA_CLIENTE = 'senha-de-teste-123';
export const PRODUTO_DO_CATALOGO = 'Moletom Oversized';

export const emailUnico = (prefixo: string) => `${prefixo}-${Date.now()}-${Math.floor(Math.random() * 1e6)}@e2e.test`;

export const brl = (valor: number) =>
  valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }).replace(/\s/g, ' ');

export const normalizar = (texto: string | null) => (texto ?? '').replace(/\s/g, ' ').trim();

export async function abrirApp(page: Page) {
  await page.goto('/');
  await expect(page.getByRole('tab', { name: 'Perfil' })).toBeVisible();
}

export async function irParaAba(page: Page, nome: 'Início' | 'Produtos' | 'Carrinho' | 'Pedidos' | 'Perfil') {
  await page.getByRole('tab', { name: nome }).click();
}

export async function cadastrar(page: Page, email: string, nome = 'Cliente E2E') {
  await irParaAba(page, 'Perfil');
  await texto(page, 'CRIAR CONTA').click();
  await page.getByPlaceholder('Seu nome').fill(nome);
  await page.getByPlaceholder('seu@email.com').fill(email);
  await page.getByPlaceholder('Mínimo 8 caracteres').fill(SENHA_CLIENTE);
  await page.getByPlaceholder('Repita a senha').fill(SENHA_CLIENTE);
  await texto(page, /Li e aceito os Termos de Uso/).click();
  await texto(page, 'CRIAR CONTA').click();
  await expect(texto(page, 'Meu perfil')).toBeVisible();
  await expect(texto(page, email)).toBeVisible();
}

export async function entrarComoAdmin(page: Page) {
  await irParaAba(page, 'Perfil');
  await texto(page, 'ENTRAR').click();
  await page.getByPlaceholder('seu@email.com').fill(ADMIN_EMAIL);
  await page.getByPlaceholder('Sua senha').fill(ADMIN_SENHA);
  await texto(page, 'ENTRAR').click();
  await expect(texto(page, 'Meu perfil')).toBeVisible();
  await expect(texto(page, ADMIN_EMAIL)).toBeVisible();
}

export async function cadastrarEndereco(page: Page) {
  await irParaAba(page, 'Perfil');
  await texto(page, 'Meus endereços').click();
  await texto(page, 'ADICIONAR ENDEREÇO').click();
  await page.getByPlaceholder('Rua, número').fill('Rua das Flores, 123');
  await page.getByPlaceholder('São Paulo').fill('São Paulo');
  await page.getByPlaceholder('SP').fill('SP');
  await page.getByPlaceholder('00000-000').fill('01310100');
  await texto(page, 'SALVAR ENDEREÇO').click();
  await expect(texto(page, 'Rua das Flores, 123 · PADRÃO')).toBeVisible();
  await texto(page, 'VOLTAR').click();
}

/** Abre o produto, escolhe o tamanho e adiciona à sacola. */
export async function adicionarProdutoNaSacola(page: Page, nome = PRODUTO_DO_CATALOGO, tamanho = 'G') {
  await irParaAba(page, 'Produtos');
  await texto(page, nome).click();
  await texto(page, tamanho).click();
  await texto(page, 'ADICIONAR AO CARRINHO').click();
  await expect(texto(page, '✓ ADICIONADO AO CARRINHO')).toBeVisible();
}

/**
 * Texto exato na tela ativa. O React Navigation mantém as telas anteriores montadas
 * (marcadas com aria-hidden), então o mesmo texto pode existir em mais de uma tela.
 */
export const texto = (page: Page, conteudo: string | RegExp) =>
  page.getByText(conteudo, { exact: typeof conteudo === 'string' }).and(page.locator(':not([aria-hidden="true"] *)'));

/** Abre a sacola pelo ícone do cabeçalho, que existe nas telas fora das abas (como o detalhe do produto). */
export async function abrirSacolaPeloCabecalho(page: Page) {
  await page.getByTestId('header-carrinho').and(page.locator(':not([aria-hidden="true"] *)')).click();
  await expect(texto(page, 'Sacola de compras')).toBeVisible();
}
