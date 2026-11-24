import { expect, test } from '@playwright/test';
import { abrirApp, abrirSacolaPeloCabecalho, texto, adicionarProdutoNaSacola, API_URL, brl, cadastrar, cadastrarEndereco, emailUnico, irParaAba, normalizar, PRODUTO_DO_CATALOGO } from './apoio';

test('visitante cria conta, monta o carrinho e vê no checkout o total da API', async ({ page, request }) => {
  const produtos = await (await request.get(`${API_URL}/api/products`)).json();
  const produto = produtos.find((p: { name: string }) => p.name === PRODUTO_DO_CATALOGO);
  const precoUnitario: number = produto.discountPrice ?? produto.price;

  await abrirApp(page);
  await cadastrar(page, emailUnico('compra'));
  await adicionarProdutoNaSacola(page);

  await abrirSacolaPeloCabecalho(page);
  await expect(texto(page, PRODUTO_DO_CATALOGO)).toBeVisible();
  await expect(texto(page, 'Tamanho G')).toBeVisible();
  await expect(texto(page, `Subtotal: ${brl(precoUnitario)}`)).toBeVisible();

  await abrirApp(page); // reabre nas abas; sessão e sacola ficam no armazenamento do navegador
  await cadastrarEndereco(page);
  await irParaAba(page, 'Carrinho');

  // A própria página pede a cotação à API ao abrir o checkout; o teste lê a mesma resposta.
  const cotacao = page.waitForResponse(r => r.url().endsWith('/api/checkout/quote') && r.request().method() === 'POST');
  await texto(page, 'FINALIZAR COMPRA').click();
  const resposta = await cotacao;
  expect(resposta.ok()).toBe(true);
  const { total, subtotal } = await resposta.json();
  expect(subtotal).toBeCloseTo(precoUnitario, 2);

  await expect(texto(page, 'Finalizar compra')).toBeVisible();
  await expect(texto(page, 'Rua das Flores, 123')).toBeVisible();
  await expect.poll(async () => normalizar(await page.getByTestId('checkout-total').textContent())).toBe(brl(total));
  // O pagamento (Mercado Pago) fica de fora: o fluxo para aqui, sem criar a sessão.
});

test('sacola vazia mostra o estado vazio e o atalho para os produtos', async ({ page }) => {
  await abrirApp(page);
  await irParaAba(page, 'Carrinho');
  await expect(texto(page, 'Sua sacola está vazia')).toBeVisible();

  await texto(page, 'VER PRODUTOS').click();
  await expect(texto(page, PRODUTO_DO_CATALOGO)).toBeVisible();
  await expect(page.getByText(/\d+ peças/)).toBeVisible();
});
