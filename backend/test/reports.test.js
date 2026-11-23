import test, { after } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

process.env.DB_PATH = join(mkdtempSync(join(tmpdir(), 'galeria-reports-test-')), 'reports.sqlite');
const { db, productToApi } = await import('../src/db.js');
const { salesReport } = await import('../src/reports.js');
after(() => db.close());

const NOW = '2026-11-01T00:00:00.000Z';
const user = db.prepare('INSERT INTO users (id, name, email, password_hash, created_at) VALUES (?, ?, ?, ?, ?)');
user.run('u1', 'Ana', 'ana@example.com', 'x', NOW);
user.run('u2', 'Bia', 'bia@example.com', 'x', NOW);
const product = db.prepare(`INSERT INTO products (id, category_id, category, name, description, price_cents, discount_price_cents, stock, image)
  VALUES (?, ?, ?, ?, 'Produto de teste', ?, NULL, 10, 'https://example.com/p.png')`);
product.run(9001, 1, 'Moletons', 'Moletom Teste', 15000);
product.run(9002, 2, 'Camisetas', 'Camiseta Teste', 5000);
product.run(9003, 3, 'Calças', 'Calça Teste', 8000);
const order = db.prepare(`INSERT INTO orders (id, user_id, idempotency_key, address_json, shipping_code, subtotal_cents, shipping_cents,
  total_cents, payment_status, fulfillment_status, reservation_expires_at, created_at, updated_at)
  VALUES (?, ?, ?, '{}', 'standard', ?, ?, ?, ?, 'NOVO', ?, ?, ?)`);
const item = db.prepare('INSERT INTO order_items (order_id, product_id, name, size, quantity, unit_price_cents, image) VALUES (?, ?, ?, ?, ?, ?, ?)');
const names = { 9001: 'Moletom Teste', 9002: 'Camiseta Teste', 9003: 'Calça Teste' };
const seed = (id, userId, status, createdAt, shipping, items) => {
  const subtotal = items.reduce((sum, [, qty, price]) => sum + qty * price, 0);
  order.run(id, userId, `key-${id}`, subtotal, shipping, subtotal + shipping, status, createdAt, createdAt, createdAt);
  for (const [pid, qty, price] of items) item.run(id, pid, names[pid], 'M', qty, price, 'img');
};
// o1: 2 x 150,00 + 1 x 50,00 + frete 20,00 = 370,00
seed('o1', 'u1', 'APROVADO', '2026-11-10T10:00:00.000Z', 2000, [[9001, 2, 15000], [9002, 1, 5000]]);
// o2: 3 x 80,00 + 1 x 50,00 = 290,00
seed('o2', 'u2', 'APROVADO', '2026-11-12T15:30:00.000Z', 0, [[9003, 3, 8000], [9002, 1, 5000]]);
seed('o3', 'u1', 'RECUSADO', '2026-11-11T09:00:00.000Z', 2000, [[9001, 5, 15000]]);
seed('o4', 'u2', 'AGUARDANDO_PAGAMENTO', '2026-11-12T18:00:00.000Z', 1500, [[9003, 1, 8000]]);

test('faturamento e itens contam somente pedidos aprovados', () => {
  const { resumo } = salesReport(db, {});
  assert.equal(resumo.pedidos, 2);
  assert.equal(resumo.faturamento, 660);
  assert.equal(resumo.itensVendidos, 7);
  assert.equal(resumo.clientes, 2);
});

test('ticket médio é faturamento dividido por pedidos aprovados', () => {
  assert.equal(salesReport(db, {}).resumo.ticketMedio, 330);
});

test('banco sem pedido aprovado devolve zeros e listas vazias sem erro', () => {
  for (const periodo of [{ from: '2026-11-11', to: '2026-11-11' }, { from: '2030-01-01' }]) {
    const r = salesReport(db, periodo);
    assert.deepEqual(r.resumo, { pedidos: 0, faturamento: 0, ticketMedio: 0, itensVendidos: 0, clientes: 0 });
    assert.deepEqual(r.porDia, []);
    assert.deepEqual(r.porCategoria, []);
    assert.deepEqual(r.produtos, []);
  }
});

test('porStatus conta todos os status, inclusive os não aprovados', () => {
  assert.deepEqual(salesReport(db, {}).porStatus, [
    { status: 'APROVADO', pedidos: 2 }, { status: 'AGUARDANDO_PAGAMENTO', pedidos: 1 }, { status: 'RECUSADO', pedidos: 1 },
  ]);
});

test('porDia agrupa por data e vem em ordem crescente', () => {
  seed('o5', 'u2', 'APROVADO', '2026-11-10T23:59:00.000Z', 0, [[9002, 1, 5000]]);
  try {
    assert.deepEqual(salesReport(db, {}).porDia, [
      { data: '2026-11-10', pedidos: 2, faturamento: 420 }, { data: '2026-11-12', pedidos: 1, faturamento: 290 },
    ]);
  } finally {
    db.exec("DELETE FROM order_items WHERE order_id = 'o5'; DELETE FROM orders WHERE id = 'o5'");
  }
});

test('porCategoria e produtos vêm ordenados por faturamento, do maior para o menor', () => {
  const r = salesReport(db, {});
  assert.deepEqual(r.porCategoria, [
    { categoria: 'Moletons', itens: 2, faturamento: 300 },
    { categoria: 'Calças', itens: 3, faturamento: 240 },
    { categoria: 'Camisetas', itens: 2, faturamento: 100 },
  ]);
  assert.deepEqual(r.produtos, [
    { id: 9001, nome: 'Moletom Teste', itens: 2, faturamento: 300 },
    { id: 9003, nome: 'Calça Teste', itens: 3, faturamento: 240 },
    { id: 9002, nome: 'Camiseta Teste', itens: 2, faturamento: 100 },
  ]);
});

test('from e to recortam o período', () => {
  const a = salesReport(db, { from: '2026-11-11', to: '2026-11-12' });
  assert.deepEqual(a.periodo, { de: '2026-11-11', ate: '2026-11-12' });
  assert.equal(a.resumo.pedidos, 1);
  assert.equal(a.resumo.faturamento, 290);
  assert.deepEqual(a.porStatus.map(s => s.pedidos), [1, 1, 1]);
  const b = salesReport(db, { from: '2026-11-10', to: '2026-11-10' });
  assert.equal(b.resumo.faturamento, 370);
  assert.deepEqual(salesReport(db, {}).periodo, { de: null, ate: null });
});

test('datas inválidas e período invertido lançam HttpError 400', () => {
  for (const periodo of [{ from: '10/11/2026' }, { to: '2026-02-31' }, { from: '2026-11-12', to: '2026-11-10' }]) {
    assert.throws(() => salesReport(db, periodo), error => error.status === 400 && /\S/.test(error.message));
  }
});

test('productToApi devolve preço em reais', () => {
  const api = productToApi(db.prepare('SELECT * FROM products WHERE id = 9001').get());
  assert.equal(api.price, 150);
  assert.equal(api.discountPrice, null);
});

test('dia e período usam a data de Brasília, não UTC', () => {
  // 01:30 UTC de 21/11 é 22:30 de 20/11 em Brasília
  seed('o6', 'u1', 'APROVADO', '2026-11-21T01:30:00.000Z', 0, [[9002, 1, 5000]]);
  try {
    assert.deepEqual(salesReport(db, { from: '2026-11-20', to: '2026-11-20' }).porDia, [{ data: '2026-11-20', pedidos: 1, faturamento: 50 }]);
    assert.equal(salesReport(db, { from: '2026-11-21' }).resumo.pedidos, 0);
  } finally {
    db.exec("DELETE FROM order_items WHERE order_id = 'o6'; DELETE FROM orders WHERE id = 'o6'");
  }
});
