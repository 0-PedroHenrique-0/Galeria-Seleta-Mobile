import { readFileSync } from 'node:fs';
import { expect, Page, test } from '@playwright/test';
import { abrirApp, texto, API_URL, entrarComoAdmin, irParaAba } from './apoio';

async function abrirGerenciarProdutos(page: Page) {
  await irParaAba(page, 'Perfil');
  await texto(page, 'Gerenciar produtos').click();
  await expect(texto(page, 'NOVO PRODUTO')).toBeVisible();
}

const linhaDo = (page: Page, nome: string) => page.getByTestId('produto-linha').filter({ hasText: nome });

test('administrador insere, consulta, altera e exclui um produto', async ({ page, request }) => {
  const nome = `Produto E2E ${Date.now()}`;
  const nomeNovo = `${nome} editado`;

  await abrirApp(page);
  await entrarComoAdmin(page);
  await abrirGerenciarProdutos(page);

  // Inserir
  await page.getByPlaceholder('Nome do produto').fill(nome);
  await page.getByPlaceholder('Descrição do produto').fill('Peça criada pelo teste E2E.');
  await page.getByPlaceholder('0,00', { exact: true }).fill('199,90');
  await page.getByPlaceholder('0', { exact: true }).fill('7');
  await page.getByPlaceholder('https://...').fill('https://example.invalid/e2e.png');
  await texto(page, 'INSERIR PRODUTO').click();

  // Consultar: aparece na lista da administração, na vitrine e na API
  await expect(linhaDo(page, nome)).toBeVisible();
  await expect(linhaDo(page, nome)).toContainText('estoque 7');
  const lista = await (await request.get(`${API_URL}/api/products`)).json();
  const criado = lista.find((p: { name: string }) => p.name === nome);
  expect(criado).toMatchObject({ price: 199.9, stock: 7 });
  await abrirApp(page); // reabre o app nas abas; a sessão fica no armazenamento do navegador
  await irParaAba(page, 'Produtos');
  await expect(texto(page, nome)).toBeVisible();

  // Alterar
  await abrirGerenciarProdutos(page);
  await linhaDo(page, nome).getByTestId('produto-editar').click();
  await expect(texto(page, `EDITANDO PRODUTO #${criado.id}`)).toBeVisible();
  await page.getByPlaceholder('Nome do produto').fill(nomeNovo);
  await page.getByPlaceholder('0,00', { exact: true }).fill('149,90');
  await texto(page, 'SALVAR ALTERAÇÕES').click();
  await expect(linhaDo(page, nomeNovo)).toBeVisible();
  const alterado = await (await request.get(`${API_URL}/api/products/${criado.id}`)).json();
  expect(alterado).toMatchObject({ name: nomeNovo, price: 149.9 });

  // Excluir pela tela: na web a confirmação é um window.confirm, aceito aqui.
  const perguntas: string[] = [];
  page.once('dialog', dialogo => { perguntas.push(dialogo.message()); void dialogo.accept(); });
  await linhaDo(page, nomeNovo).getByTestId('produto-excluir').click();
  await expect(linhaDo(page, nomeNovo)).toHaveCount(0);
  expect(perguntas).toEqual([`Deseja excluir “${nomeNovo}”?`]);
  const depois = await request.get(`${API_URL}/api/products/${criado.id}`);
  expect(depois.status()).toBe(404);

  await abrirApp(page);
  await abrirGerenciarProdutos(page);
  await expect(texto(page, 'PRODUTOS CADASTRADOS')).toBeVisible();
  await expect(linhaDo(page, nomeNovo)).toHaveCount(0);
});

test('administrador exporta os dados e o arquivo baixado é um JSON com resumo', async ({ page }) => {
  await abrirApp(page);
  await entrarComoAdmin(page);
  await abrirGerenciarProdutos(page);

  const download = page.waitForEvent('download');
  await texto(page, 'EXPORTAR DADOS (JSON)').click();
  const arquivo = await download;
  expect(arquivo.suggestedFilename()).toMatch(/^vendas-galeria-seleta-\d{4}-\d{2}-\d{2}\.json$/);

  const conteudo = JSON.parse(readFileSync(await arquivo.path(), 'utf8'));
  expect(conteudo).toHaveProperty('resumo');
  await expect(texto(page, `Arquivo gerado: ${arquivo.suggestedFilename()}`)).toBeVisible();
});
