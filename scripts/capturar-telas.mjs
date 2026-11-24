/**
 * Captura as telas do aplicativo para os anexos do documento final.
 *
 * Sobe a API real com banco temporário, gera a build web do Expo apontando para essa API,
 * serve a build e fotografa as telas em 390 x 844 (tamanho de celular), uma por arquivo,
 * em docs/entrega-final/img/.
 *
 * Uso: node scripts/capturar-telas.mjs
 */
import { spawn, spawnSync } from 'node:child_process';
import { mkdirSync, copyFileSync, existsSync, readFileSync, globSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';
// Seletores e fluxos vêm do mesmo módulo usado pelos testes de ponta a ponta:
// um rótulo da interface que mudar é ajustado em um lugar só.
import {
  abrirSacolaPeloCabecalho, cadastrarEndereco, campo, clicar, entrarComoAdmin,
  esperarVisivel, irParaAba, preencherCadastro,
} from '../tests/e2e/fluxos.mjs';

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..');
const DESTINO = join(RAIZ, 'docs', 'entrega-final', 'img');

const PORTA_API = '3334';
const PORTA_WEB = '4176';
const API_URL = `http://127.0.0.1:${PORTA_API}`;
const APP_URL = `http://127.0.0.1:${PORTA_WEB}`;

// Credenciais fictícias, válidas só para esta API temporária.
const AMBIENTE_API = {
  PORT: PORTA_API,
  AUTH_SECRET: 'segredo-ficticio-apenas-para-capturas-0123456789',
  ADMIN_EMAIL: 'admin@galeriaseleta.test',
  ADMIN_PASSWORD: 'senha-admin-de-captura-123',
};
// E-mail diferente a cada execução: a conta anterior pode ter ficado no banco temporário.
const CLIENTE = {
  nome: 'Cliente Demonstração',
  email: `cliente-${Date.now()}@galeriaseleta.test`,
  senha: 'senha-de-captura-123',
};
const PRODUTO = 'Moletom Oversized';

const processos = [];

function iniciar(comando, argumentos, ambiente) {
  const processo = spawn(comando, argumentos, {
    cwd: RAIZ,
    env: { ...process.env, ...ambiente },
    stdio: 'inherit',
    shell: process.platform === 'win32',
  });
  processos.push(processo);
  return processo;
}

function encerrarTudo() {
  for (const processo of processos) {
    try {
      // No Windows o filho direto é o shell; sem /T os servidores ficariam no ar segurando as portas.
      if (process.platform === 'win32' && processo.pid) {
        spawnSync('taskkill', ['/pid', String(processo.pid), '/t', '/f'], { stdio: 'ignore' });
      } else {
        processo.kill();
      }
    } catch { /* já encerrado */ }
  }
}

async function esperarNoAr(url, segundos = 180) {
  const limite = Date.now() + segundos * 1000;
  while (Date.now() < limite) {
    try {
      const resposta = await fetch(url);
      if (resposta.ok) return;
    } catch { /* ainda subindo */ }
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  throw new Error(`Servidor não respondeu em ${segundos} s: ${url}`);
}

/** Troca de aba e espera a animação terminar antes da foto. */
async function aba(pagina, nome) {
  await irParaAba(pagina, nome);
  await pagina.waitForTimeout(600);
}

async function fotografar(pagina, arquivo) {
  await pagina.waitForTimeout(700);
  await pagina.screenshot({ path: join(DESTINO, `${arquivo}.png`) });
  console.log(`capturada: ${arquivo}.png`);
}

async function novaPagina(navegador) {
  const contexto = await navegador.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
  });
  const pagina = await contexto.newPage();
  await pagina.goto(APP_URL);
  await pagina.getByRole('tab', { name: 'Perfil' }).waitFor({ state: 'visible', timeout: 60000 });
  await pagina.waitForTimeout(1200);
  return pagina;
}

async function main() {
  mkdirSync(DESTINO, { recursive: true });

  console.log('subindo a API...');
  iniciar('node', ['tests/e2e/servidor-api.mjs'], AMBIENTE_API);
  await esperarNoAr(`${API_URL}/api/products`, 60);

  console.log('gerando a build web...');
  await new Promise((resolve, reject) => {
    const build = iniciar('npm', ['run', 'build:web'], { EXPO_PUBLIC_API_URL: API_URL });
    build.on('exit', codigo => (codigo === 0 ? resolve() : reject(new Error(`build:web saiu com ${codigo}`))));
  });

  // A URL da API entra no pacote na hora do build; confere para não capturar telas vazias.
  const pacotes = [...globSync(join(RAIZ, 'dist', '_expo', 'static', 'js', 'web', '*.js'))];
  const temUrl = pacotes.some(arquivo => readFileSync(arquivo, 'utf-8').includes(`127.0.0.1:${PORTA_API}`));
  if (!temUrl) throw new Error(`A build web não aponta para ${API_URL}. Apague dist/ e rode de novo.`);

  console.log('servindo a build web...');
  iniciar('npx', ['serve', 'dist', '-l', PORTA_WEB], {});
  await esperarNoAr(APP_URL, 60);

  const navegador = await chromium.launch({ headless: true });

  // Visitante: início, catálogo, detalhe, sacola, login e checkout.
  const pagina = await novaPagina(navegador);
  await fotografar(pagina, '01-home');

  await aba(pagina, 'Produtos');
  await fotografar(pagina, '02-produtos');

  await clicar(pagina, PRODUTO);
  await fotografar(pagina, '03-detalhe-produto');

  await clicar(pagina, 'G');
  await clicar(pagina, 'ADICIONAR AO CARRINHO');
  await abrirSacolaPeloCabecalho(pagina);
  await fotografar(pagina, '04-carrinho');

  // A sacola foi aberta pelo cabeçalho, fora das abas: volta à raiz para seguir pelas abas.
  await pagina.goto(APP_URL);
  await pagina.getByRole('tab', { name: 'Perfil' }).waitFor({ state: 'visible', timeout: 60000 });
  await aba(pagina, 'Perfil');
  await clicar(pagina, 'ENTRAR');
  await campo(pagina, 'seu@email.com').waitFor({ state: 'visible', timeout: 30000 });
  await fotografar(pagina, '05-login');

  // Cria a conta do cliente para chegar ao checkout com endereço. O formulário é
  // aberto daqui, pela tela de login, e preenchido pelo fluxo compartilhado.
  await clicar(pagina, 'Criar uma conta');
  await preencherCadastro(pagina, { nome: CLIENTE.nome, email: CLIENTE.email, senha: CLIENTE.senha });

  await cadastrarEndereco(pagina);

  await aba(pagina, 'Carrinho');
  await clicar(pagina, 'FINALIZAR COMPRA');
  await esperarVisivel(pagina, 'Finalizar compra');
  await fotografar(pagina, '06-checkout');

  // Administrador: tela de gerenciamento de produtos, com o botão de exportar.
  const paginaAdmin = await novaPagina(navegador);
  await entrarComoAdmin(paginaAdmin, {
    email: AMBIENTE_API.ADMIN_EMAIL,
    senha: AMBIENTE_API.ADMIN_PASSWORD,
  });
  await clicar(paginaAdmin, 'Gerenciar produtos');
  await esperarVisivel(paginaAdmin, 'DADOS DE VENDAS');
  // Duas fotos: o formulário de cadastro no topo da tela...
  await fotografar(paginaAdmin, '07-gerenciar-cadastro');
  // ...e, mais abaixo, o cartão de exportação inteiro com a lista do catálogo.
  await paginaAdmin.mouse.wheel(0, 745);
  await fotografar(paginaAdmin, '08-gerenciar-lista');

  await navegador.close();

  // O painel do dashboard fica em pasta ignorada pelo git; o documento usa esta cópia versionada.
  const painel = join(RAIZ, 'dashboard', 'saida', 'dashboard.png');
  if (existsSync(painel)) {
    copyFileSync(painel, join(DESTINO, '09-dashboard.png'));
    console.log('copiada: 09-dashboard.png');
  } else {
    console.log('AVISO: dashboard/saida/dashboard.png não existe. Rode o dashboard antes.');
  }
}

try {
  await main();
} finally {
  encerrarTudo();
}
process.exit(0);
