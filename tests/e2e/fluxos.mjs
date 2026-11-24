/**
 * Seletores e fluxos compartilhados pela build web do aplicativo.
 *
 * Fonte única para os dois consumidores: os testes de ponta a ponta
 * (`tests/e2e/apoio.ts`, que reexporta estas funções) e o script de capturas
 * (`scripts/capturar-telas.mjs`). Quando um rótulo da interface muda, o ajuste
 * é feito aqui e os dois lados acompanham.
 *
 * É JavaScript puro (`.mjs`) porque o script de capturas roda no Node, sem
 * TypeScript. Também não usa `expect` do Playwright: só espera por elementos,
 * o que funciona tanto dentro do runner quanto fora dele.
 *
 * @typedef {import('@playwright/test').Page} Pagina
 * @typedef {import('@playwright/test').Locator} Alvo
 */

const ESPERA = 30000;

/** Endereço fictício usado no checkout dos testes e das capturas. */
export const ENDERECO_DE_TESTE = {
  rua: 'Rua das Flores, 123',
  cidade: 'São Paulo',
  estado: 'SP',
  cep: '01310100',
};

/**
 * Texto exato na tela ativa. O React Navigation mantém as telas anteriores montadas
 * (marcadas com aria-hidden), então o mesmo texto pode existir em mais de uma tela.
 *
 * @param {Pagina} pagina
 * @param {string | RegExp} texto
 * @returns {Alvo}
 */
export const ativo = (pagina, texto) =>
  pagina.getByText(texto, { exact: typeof texto === 'string' }).and(pagina.locator(':not([aria-hidden="true"] *)'));

/**
 * Campo pelo texto de exemplo, restrito à tela ativa.
 *
 * @param {Pagina} pagina
 * @param {string | RegExp} exemplo
 * @returns {Alvo}
 */
export const campo = (pagina, exemplo) =>
  pagina.getByPlaceholder(exemplo).and(pagina.locator(':not([aria-hidden="true"] *)')).first();

/**
 * Elemento por testID, restrito à tela ativa.
 *
 * @param {Pagina} pagina
 * @param {string} id
 * @returns {Alvo}
 */
export const porTestId = (pagina, id) =>
  pagina.getByTestId(id).and(pagina.locator(':not([aria-hidden="true"] *)'));

/**
 * @param {Pagina} pagina
 * @param {string | RegExp} texto
 */
export async function esperarVisivel(pagina, texto) {
  await ativo(pagina, texto).first().waitFor({ state: 'visible', timeout: ESPERA });
}

/**
 * @param {Pagina} pagina
 * @param {string | RegExp} texto
 */
export async function clicar(pagina, texto) {
  const alvo = ativo(pagina, texto).first();
  await alvo.waitFor({ state: 'visible', timeout: ESPERA });
  await alvo.click();
}

/**
 * @param {Pagina} pagina
 * @param {string} exemplo
 * @param {string} valor
 */
export async function preencher(pagina, exemplo, valor) {
  const alvo = campo(pagina, exemplo);
  await alvo.waitFor({ state: 'visible', timeout: ESPERA });
  await alvo.fill(valor);
}

/**
 * @param {Pagina} pagina
 * @param {string} nome
 */
export async function irParaAba(pagina, nome) {
  await pagina.getByRole('tab', { name: nome }).click();
}

/**
 * Abre a sacola pelo ícone do cabeçalho, que existe nas telas fora das abas
 * (como o detalhe do produto).
 *
 * @param {Pagina} pagina
 */
export async function abrirSacolaPeloCabecalho(pagina) {
  await porTestId(pagina, 'header-carrinho').click();
  await esperarVisivel(pagina, 'Sacola de compras');
}

/**
 * Preenche o formulário de criação de conta já aberto e espera o perfil carregar.
 * Separado de `cadastrarCliente` porque o script de capturas chega ao formulário
 * pela tela de login, que ele fotografa no caminho.
 *
 * @param {Pagina} pagina
 * @param {{ nome: string, email: string, senha: string }} dados
 */
export async function preencherCadastro(pagina, { nome, email, senha }) {
  await preencher(pagina, 'Seu nome', nome);
  await preencher(pagina, 'seu@email.com', email);
  await preencher(pagina, 'Mínimo 8 caracteres', senha);
  await preencher(pagina, 'Repita a senha', senha);
  await clicar(pagina, /Li e aceito os Termos de Uso/);
  await clicar(pagina, 'CRIAR CONTA');
  await esperarVisivel(pagina, 'Meu perfil');
}

/**
 * Cria a conta do cliente a partir da aba Perfil.
 *
 * @param {Pagina} pagina
 * @param {{ nome: string, email: string, senha: string }} dados
 */
export async function cadastrarCliente(pagina, dados) {
  await irParaAba(pagina, 'Perfil');
  await clicar(pagina, 'CRIAR CONTA');
  await preencherCadastro(pagina, dados);
}

/**
 * Cadastra o endereço padrão do cliente logado e volta ao perfil.
 *
 * @param {Pagina} pagina
 * @param {typeof ENDERECO_DE_TESTE} [endereco]
 */
export async function cadastrarEndereco(pagina, endereco = ENDERECO_DE_TESTE) {
  await irParaAba(pagina, 'Perfil');
  await clicar(pagina, 'Meus endereços');
  await clicar(pagina, 'ADICIONAR ENDEREÇO');
  await preencher(pagina, 'Rua, número', endereco.rua);
  await preencher(pagina, 'São Paulo', endereco.cidade);
  await preencher(pagina, 'SP', endereco.estado);
  await preencher(pagina, '00000-000', endereco.cep);
  await clicar(pagina, 'SALVAR ENDEREÇO');
  await esperarVisivel(pagina, `${endereco.rua} · PADRÃO`);
  await clicar(pagina, 'VOLTAR');
}

/**
 * Entra com a conta administradora a partir da aba Perfil.
 *
 * @param {Pagina} pagina
 * @param {{ email: string, senha: string }} credenciais
 */
export async function entrarComoAdmin(pagina, { email, senha }) {
  await irParaAba(pagina, 'Perfil');
  await clicar(pagina, 'ENTRAR');
  await preencher(pagina, 'seu@email.com', email);
  await preencher(pagina, 'Sua senha', senha);
  await clicar(pagina, 'ENTRAR');
  await esperarVisivel(pagina, 'Meu perfil');
}
