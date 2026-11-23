import { expect, Page } from '@playwright/test';
import {
  ativo,
  cadastrarCliente,
  clicar,
  entrarComoAdmin as entrarNaContaAdmin,
  irParaAba as clicarNaAba,
} from './fluxos.mjs';

// Os seletores e os fluxos de cadastro, endereço e login de administrador vivem em
// `fluxos.mjs`, compartilhados com `scripts/capturar-telas.mjs`.
export { abrirSacolaPeloCabecalho, cadastrarEndereco, ENDERECO_DE_TESTE } from './fluxos.mjs';

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

/** Texto exato na tela ativa; o React Navigation mantém as telas anteriores montadas. */
export const texto = (page: Page, conteudo: string | RegExp) => ativo(page, conteudo);

export async function abrirApp(page: Page) {
  await page.goto('/');
  await expect(page.getByRole('tab', { name: 'Perfil' })).toBeVisible();
}

export async function irParaAba(page: Page, nome: 'Início' | 'Produtos' | 'Carrinho' | 'Pedidos' | 'Perfil') {
  await clicarNaAba(page, nome);
}

export async function cadastrar(page: Page, email: string, nome = 'Cliente E2E') {
  await cadastrarCliente(page, { nome, email, senha: SENHA_CLIENTE });
  await expect(texto(page, email)).toBeVisible();
}

export async function entrarComoAdmin(page: Page) {
  await entrarNaContaAdmin(page, { email: ADMIN_EMAIL, senha: ADMIN_SENHA });
  await expect(texto(page, ADMIN_EMAIL)).toBeVisible();
}

/** Abre o produto, escolhe o tamanho e adiciona à sacola. */
export async function adicionarProdutoNaSacola(page: Page, nome = PRODUTO_DO_CATALOGO, tamanho = 'G') {
  await irParaAba(page, 'Produtos');
  await clicar(page, nome);
  await clicar(page, tamanho);
  await clicar(page, 'ADICIONAR AO CARRINHO');
  await expect(texto(page, '✓ ADICIONADO AO CARRINHO')).toBeVisible();
}
