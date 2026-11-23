import test, { after } from 'node:test';
import assert from 'node:assert/strict';
import { createHmac } from 'node:crypto';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

process.env.NODE_ENV = 'test';
process.env.AUTH_SECRET = 'api-test-secret-with-at-least-thirty-two-chars';
process.env.MP_ACCESS_TOKEN = 'test-token';
process.env.APP_RETURN_URL = 'galeriaseleta://checkout/return';
process.env.ADMIN_EMAIL = 'admin@galeriaseleta.test';
process.env.ADMIN_PASSWORD = 'senha-admin-de-teste-123';
process.env.DB_PATH = join(mkdtempSync(join(tmpdir(), 'galeria-api-test-')), 'api.sqlite');

const originalFetch = globalThis.fetch;
let payment;
globalThis.fetch = (url, options) => {
  const target = String(url);
  if (target === 'https://api.mercadopago.com/checkout/preferences') {
    return Promise.resolve(new Response(JSON.stringify({ id: 'pref-api', init_point: 'https://www.mercadopago.com.br/checkout/test' }), { status: 201 }));
  }
  if (target.startsWith('https://api.mercadopago.com/v1/payments/search?')) {
    return Promise.resolve(new Response(JSON.stringify({ results: [] }), { status: 200 }));
  }
  if (target.startsWith('https://api.mercadopago.com/v1/payments/')) {
    return Promise.resolve(new Response(JSON.stringify(payment), { status: 200 }));
  }
  return originalFetch(url, options);
};
const { app } = await import('../src/server.js');
const { db } = await import('../src/db.js');
const server = app.listen(0);
const base = `http://127.0.0.1:${server.address().port}`;
const call = async (path, method = 'GET', body, token) => {
  const response = await originalFetch(base + path, {
    method, headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  });
  return { status: response.status, body: await response.json().catch(() => null) };
};
after(async () => {
  await new Promise(resolve => server.close(resolve));
  db.close();
});

const PASSWORD = 'senha-forte-123';
const address = { street: 'Rua das Flores, 123', city: 'São Paulo', state: 'SP', zip: '01310100' };
const signup = async (email, name = 'Cliente Teste') => {
  const response = await call('/api/auth/register', 'POST', { name, email, password: PASSWORD });
  assert.equal(response.status, 201);
  return response.body;
};
const adminToken = async () => {
  const response = await call('/api/auth/login', 'POST', { email: process.env.ADMIN_EMAIL, password: process.env.ADMIN_PASSWORD });
  assert.equal(response.status, 200);
  return response.body.token;
};
const orderCount = () => db.prepare('SELECT COUNT(*) AS total FROM orders').get().total;
const productBody = { categoryId: 2, category: 'Camisetas', name: 'Produto de Teste', description: 'Produto criado pelo teste.', price: 59.9, discountPrice: 49.9, stock: 5, image: 'https://example.com/produto.png' };

test('cadastro devolve 201 com token e usuário sem senha', async () => {
  const response = await call('/api/auth/register', 'POST', { name: 'Maria Souza', email: 'Maria@Example.com', password: PASSWORD });
  assert.equal(response.status, 201);
  assert.ok(response.body.token);
  assert.equal(response.body.user.email, 'maria@example.com');
  assert.equal(response.body.user.name, 'Maria Souza');
  assert.equal(response.body.user.isAdmin, false);
  assert.equal(JSON.stringify(response.body).includes('password'), false);
});

test('cadastro recusa e-mail inválido e senha menor que oito caracteres', async () => {
  const badEmail = await call('/api/auth/register', 'POST', { name: 'Ana', email: 'sem-arroba', password: PASSWORD });
  assert.equal(badEmail.status, 400);
  const shortPassword = await call('/api/auth/register', 'POST', { name: 'Ana', email: 'ana@example.com', password: '1234567' });
  assert.equal(shortPassword.status, 400);
});

test('cadastro do mesmo e-mail duas vezes devolve 409', async () => {
  await signup('duplicado@example.com');
  const again = await call('/api/auth/register', 'POST', { name: 'Outra Pessoa', email: 'duplicado@example.com', password: PASSWORD });
  assert.equal(again.status, 409);
});

test('cadastro com o e-mail do administrador devolve 403', async () => {
  const response = await call('/api/auth/register', 'POST', { name: 'Intruso', email: process.env.ADMIN_EMAIL, password: PASSWORD });
  assert.equal(response.status, 403);
});

test('login com senha errada devolve 401 e com senha certa devolve token', async () => {
  await signup('login@example.com');
  const wrong = await call('/api/auth/login', 'POST', { email: 'login@example.com', password: 'senha-errada-999' });
  assert.equal(wrong.status, 401);
  assert.equal(wrong.body.token, undefined);
  const right = await call('/api/auth/login', 'POST', { email: 'login@example.com', password: PASSWORD });
  assert.equal(right.status, 200);
  assert.ok(right.body.token);
  assert.equal((await call('/api/me', 'GET', null, right.body.token)).body.email, 'login@example.com');
});

test('rota protegida sem token devolve 401', async () => {
  assert.equal((await call('/api/me')).status, 401);
});

test('token com assinatura adulterada devolve 401', async () => {
  const { token } = await signup('adulterado@example.com');
  assert.equal((await call('/api/me', 'GET', null, token)).status, 200);
  const [payload, signature] = token.split('.');
  const swapped = signature.endsWith('A') ? 'B' : 'A';
  const tampered = `${payload}.${signature.slice(0, -1)}${swapped}`;
  assert.notEqual(tampered, token);
  assert.equal((await call('/api/me', 'GET', null, tampered)).status, 401);
});

test('token com assinatura válida e prazo vencido devolve 401 de sessão expirada', async () => {
  const { user } = await signup('expirado@example.com');
  // Token montado com o mesmo segredo do servidor: a assinatura confere, só o prazo venceu.
  const payload = Buffer.from(JSON.stringify({ sub: user.id, exp: Date.now() - 1000 })).toString('base64url');
  const assinatura = createHmac('sha256', process.env.AUTH_SECRET).update(payload).digest('base64url');
  const response = await call('/api/me', 'GET', null, `${payload}.${assinatura}`);
  assert.equal(response.status, 401);
  assert.equal(response.body.message, 'Sessão expirada.');
});

test('catálogo lista os oito produtos iniciais com preço em reais', async () => {
  const response = await call('/api/products');
  assert.equal(response.status, 200);
  assert.equal(response.body.length, 8);
  const moletom = response.body.find(item => item.id === 1);
  assert.equal(moletom.price, 189.9);
  assert.equal(moletom.discountPrice, 149.9);
  assert.equal(response.body.find(item => item.id === 2).price, 99.9);
});

test('produto inexistente devolve 404', async () => {
  assert.equal((await call('/api/products/99999')).status, 404);
});

test('cliente comum não cria, não altera e não exclui produto', async () => {
  const { token } = await signup('comum@example.com');
  assert.equal((await call('/api/products', 'POST', productBody, token)).status, 403);
  assert.equal((await call('/api/products/1', 'PUT', productBody, token)).status, 403);
  assert.equal((await call('/api/products/1', 'DELETE', null, token)).status, 403);
  assert.equal((await call('/api/products/1')).body.name, 'Moletom Oversized');
});

test('administrador cria, altera, consulta e exclui produto', async () => {
  const token = await adminToken();
  const created = await call('/api/products', 'POST', productBody, token);
  assert.equal(created.status, 201);
  assert.equal(created.body.price, 59.9);
  const id = created.body.id;
  const updated = await call(`/api/products/${id}`, 'PUT', { ...productBody, name: 'Produto Alterado', price: 64.5 }, token);
  assert.equal(updated.status, 200);
  const fetched = await call(`/api/products/${id}`);
  assert.equal(fetched.status, 200);
  assert.equal(fetched.body.name, 'Produto Alterado');
  assert.equal(fetched.body.price, 64.5);
  assert.equal((await call(`/api/products/${id}`, 'DELETE', null, token)).status, 204);
  assert.equal((await call(`/api/products/${id}`)).status, 404);
});

test('cotação soma frete padrão e expresso sobre o preço do banco', async () => {
  const { token } = await signup('cotacao@example.com');
  const items = [{ id: 1, size: 'M', quantity: 1, price: 0.01 }];
  const standard = await call('/api/checkout/quote', 'POST', { items, shippingCode: 'standard' }, token);
  assert.equal(standard.status, 200);
  assert.deepEqual(standard.body, { subtotal: 149.9, shipping: 29.9, discount: 0, total: 179.8 });
  const express = await call('/api/checkout/quote', 'POST', { items: [{ id: 2, size: 'P', quantity: 2 }], shippingCode: 'express' }, token);
  assert.deepEqual(express.body, { subtotal: 199.8, shipping: 54.9, discount: 0, total: 254.7 });
});

test('checkout recusa endereço com CEP inválido e não grava pedido', async () => {
  const { token } = await signup('cep@example.com');
  const before = orderCount();
  const response = await call('/api/checkout/sessions', 'POST', {
    items: [{ id: 1, size: 'M', quantity: 1 }], shippingCode: 'standard',
    address: { ...address, zip: '123' }, idempotencyKey: 'cep-invalido-key-1234',
  }, token);
  assert.equal(response.status, 400);
  assert.equal(orderCount(), before);
});

test('pedido de outro usuário devolve 404', async () => {
  const owner = await signup('dono@example.com');
  const other = await signup('intruso-pedido@example.com');
  const created = await call('/api/checkout/sessions', 'POST', {
    items: [{ id: 3, size: 'G', quantity: 1 }], shippingCode: 'standard', address, idempotencyKey: 'pedido-alheio-key-123',
  }, owner.token);
  assert.equal(created.status, 201);
  assert.equal((await call(`/api/orders/${created.body.orderId}`, 'GET', null, owner.token)).status, 200);
  assert.equal((await call(`/api/orders/${created.body.orderId}`, 'GET', null, other.token)).status, 404);
});

test('reconciliação com pagamento que não corresponde devolve 409', async () => {
  const { token } = await signup('reconcilia@example.com');
  const created = await call('/api/checkout/sessions', 'POST', {
    items: [{ id: 4, size: 'M', quantity: 1 }], shippingCode: 'standard', address, idempotencyKey: 'reconcilia-key-12345',
  }, token);
  assert.equal(created.status, 201);
  payment = { id: 555001, external_reference: created.body.orderId, transaction_amount: 1, currency_id: 'BRL', status: 'approved' };
  const response = await call(`/api/orders/${created.body.orderId}/reconcile`, 'POST', { paymentId: '555001' }, token);
  assert.equal(response.status, 409);
  assert.equal((await call(`/api/orders/${created.body.orderId}`, 'GET', null, token)).body.paymentStatus, 'AGUARDANDO_PAGAMENTO');
});

test('relatório sem token devolve 401 e com token de cliente comum devolve 403', async () => {
  assert.equal((await call('/api/reports/sales')).status, 401);
  const { token } = await signup('relatorio-comum@example.com');
  assert.equal((await call('/api/reports/sales', 'GET', null, token)).status, 403);
});

test('administrador recebe o relatório com resumo, porDia, porCategoria, porStatus e produtos', async () => {
  const response = await call('/api/reports/sales', 'GET', null, await adminToken());
  assert.equal(response.status, 200);
  for (const chave of ['geradoEm', 'periodo', 'resumo', 'porDia', 'porCategoria', 'porStatus', 'produtos']) assert.ok(chave in response.body, chave);
  assert.deepEqual(response.body.periodo, { de: null, ate: null });
  assert.equal(typeof response.body.resumo.ticketMedio, 'number');
});

test('from depois de to devolve 400 com mensagem', async () => {
  const response = await call('/api/reports/sales?from=2026-11-12&to=2026-11-10', 'GET', null, await adminToken());
  assert.equal(response.status, 400);
  assert.ok(response.body.message);
});

test('data em formato inválido devolve 400', async () => {
  const token = await adminToken();
  for (const query of ['from=ontem', 'to=2026-02-31']) {
    const response = await call(`/api/reports/sales?${query}`, 'GET', null, token);
    assert.equal(response.status, 400);
    assert.ok(response.body.message);
  }
});

test('schema.sql cobre as tabelas do banco real', async () => {
  const { readFileSync } = await import('node:fs');
  const { DatabaseSync } = await import('node:sqlite');
  const referencia = new DatabaseSync(':memory:');
  referencia.exec(readFileSync(new URL('../../database/schema.sql', import.meta.url), 'utf8'));
  const tabelas = sql => sql.prepare("SELECT name FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%' ORDER BY name").all().map(t => t.name);
  const colunas = (sql, tabela) => sql.prepare(`PRAGMA table_info(${tabela})`).all().map(c => ({ name: c.name, type: c.type, notnull: c.notnull, dflt_value: c.dflt_value, pk: c.pk }));
  const unicos = (sql, tabela) => sql.prepare(`PRAGMA index_list(${tabela})`).all().filter(i => i.unique)
    .map(i => sql.prepare(`PRAGMA index_info(${i.name})`).all().map(c => c.name).join(',')).sort();
  const chaves = (sql, tabela) => sql.prepare(`PRAGMA foreign_key_list(${tabela})`).all().map(f => `${f.from}->${f.table}.${f.to}`).sort();

  assert.deepEqual(tabelas(referencia), tabelas(db));
  for (const tabela of tabelas(db)) {
    assert.deepEqual(colunas(referencia, tabela), colunas(db, tabela), `colunas de ${tabela}`);
    assert.deepEqual(chaves(referencia, tabela), chaves(db, tabela), `chaves estrangeiras de ${tabela}`);
    assert.deepEqual(unicos(referencia, tabela), unicos(db, tabela), `restrições UNIQUE de ${tabela}`);
  }
});
