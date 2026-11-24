import { expect, test } from '@playwright/test';
import { abrirApp, abrirSacolaPeloCabecalho, texto, adicionarProdutoNaSacola, cadastrar, emailUnico } from './apoio';

test('cliente comum não vê o atalho de gerenciar produtos no perfil', async ({ page }) => {
  await abrirApp(page);
  await cadastrar(page, emailUnico('cliente'));

  // Os atalhos já carregaram (há "Meus endereços"), então a ausência abaixo não é falta de espera.
  await expect(texto(page, 'Meus endereços')).toBeVisible();
  await expect(texto(page, 'Gerenciar produtos')).toHaveCount(0);
});

test('visitante que abre o checkout é avisado para entrar na conta', async ({ page }) => {
  await abrirApp(page);
  await adicionarProdutoNaSacola(page);
  await abrirSacolaPeloCabecalho(page);
  await texto(page, 'FINALIZAR COMPRA').click();

  await expect(texto(page, 'Finalizar compra')).toBeVisible();
  await expect(texto(page, /Entre na sua conta para (finalizar a compra|continuar)\./)).toBeVisible();
  await expect(texto(page, 'ENTRAR')).toBeVisible();
});
