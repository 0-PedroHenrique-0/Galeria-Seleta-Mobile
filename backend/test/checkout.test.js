import test from 'node:test';
import assert from 'node:assert/strict';
import { createHmac } from 'node:crypto';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

process.env.NODE_ENV = 'test';
process.env.AUTH_SECRET = 'test-secret-with-at-least-thirty-two-chars';
process.env.MP_ACCESS_TOKEN = 'test-token';
process.env.MP_WEBHOOK_SECRET = 'webhook-secret';
process.env.APP_RETURN_URL = 'galeriaseleta://checkout/return';
process.env.DB_PATH = join(mkdtempSync(join(tmpdir(), 'galeria-test-')), 'test.sqlite');

const originalFetch = globalThis.fetch;
let preferenceBody, payment, preferenceCalls = 0;
globalThis.fetch = (url, options) => {
  const target = String(url);
  if (target === 'https://api.mercadopago.com/checkout/preferences') {
    preferenceBody = JSON.parse(options.body);
    preferenceCalls++;
    return Promise.resolve(new Response(JSON.stringify({ id: 'pref-1', init_point: 'https://www.mercadopago.com.br/checkout/test' }), { status: 201 }));
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

test('checkout calcula no servidor, reutiliza tentativa e confirma somente por pagamento validado', async () => {
  try {
    const signup = await call('/api/auth/register', 'POST', { name: 'Cliente Teste', email: 'cliente@example.com', password: 'senha-forte-123' });
    assert.equal(signup.status, 201);
    const token = signup.body.token;
    const products = await call('/api/products');
    assert.equal(products.body.length, 8);
    const beforeStock = products.body.find(item => item.id === 1).stock;
    const items = [{ id: 1, size: 'M', quantity: 1, price: 0.01 }];
    const quoted = await call('/api/checkout/quote', 'POST', { items, shippingCode: 'standard' }, token);
    assert.equal(quoted.body.total, 179.8);
    const address = { street: 'Rua das Flores, 123', city: 'São Paulo', state: 'SP', zip: '01310100' };
    const input = { items, shippingCode: 'standard', address, idempotencyKey: 'same-checkout-key-123' };
    delete process.env.MP_WEBHOOK_SECRET;
    const first = await call('/api/checkout/sessions', 'POST', input, token);
    const second = await call('/api/checkout/sessions', 'POST', input, token);
    assert.equal(first.status, 201);
    assert.equal(second.body.orderId, first.body.orderId);
    assert.equal(preferenceCalls, 1);
    assert.equal(preferenceBody.items.reduce((sum, item) => sum + item.unit_price * item.quantity, 0), 179.8);
    assert.equal(preferenceBody.external_reference, first.body.orderId);
    assert.equal((await call(`/api/orders/${first.body.orderId}`, 'GET', null, token)).body.paymentStatus, 'AGUARDANDO_PAGAMENTO');
    assert.equal((await originalFetch(`${base}/api/webhooks/mercado-pago?data.id=12345&type=payment`, { method: 'POST' })).status, 401);
    process.env.MP_WEBHOOK_SECRET = 'webhook-secret';
    const other = await call('/api/auth/register', 'POST', { name: 'Outro Cliente', email: 'outro@example.com', password: 'senha-forte-123' });
    assert.equal((await call(`/api/orders/${first.body.orderId}`, 'GET', null, other.body.token)).status, 404);
    payment = { id: 12345, external_reference: first.body.orderId, transaction_amount: 179.8, currency_id: 'BRL', status: 'approved' };
    const invalid = await originalFetch(`${base}/api/webhooks/mercado-pago?data.id=12345&type=payment`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: 7 }) });
    assert.equal(invalid.status, 401);
    const requestId = 'test-request-id', ts = String(Date.now());
    const manifest = `id:12345;request-id:${requestId};ts:${ts};`;
    const signature = createHmac('sha256', process.env.MP_WEBHOOK_SECRET).update(manifest).digest('hex');
    const headers = { 'Content-Type': 'application/json', 'x-request-id': requestId, 'x-signature': `ts=${ts},v1=${signature}` };
    payment.transaction_amount = 1;
    await originalFetch(`${base}/api/webhooks/mercado-pago?data.id=12345&type=payment`, {
      method: 'POST', headers, body: JSON.stringify({ id: 7, type: 'payment', data: { id: '12345' } }),
    });
    assert.equal((await call(`/api/orders/${first.body.orderId}`, 'GET', null, token)).body.paymentStatus, 'AGUARDANDO_PAGAMENTO');
    payment.transaction_amount = 179.8;
    for (let n = 0; n < 2; n++) {
      const response = await originalFetch(`${base}/api/webhooks/mercado-pago?data.id=12345&type=payment`, {
        method: 'POST', headers, body: JSON.stringify({ id: 7, type: 'payment', data: { id: '12345' } }),
      });
      assert.equal(response.status, 200);
    }
    assert.equal((await call(`/api/orders/${first.body.orderId}`, 'GET', null, token)).body.paymentStatus, 'APROVADO');
    assert.equal(db.prepare('SELECT stock FROM products WHERE id = 1').get().stock, beforeStock - 1);
    const next = await call('/api/checkout/sessions', 'POST', {
      items: [{ id: 2, size: 'P', quantity: 1 }], shippingCode: 'standard', address, idempotencyKey: 'second-checkout-key-123',
    }, token);
    assert.equal(next.status, 201);
    const stockBeforeRejection = db.prepare('SELECT stock FROM products WHERE id = 2').get().stock;
    payment = { id: 67890, external_reference: next.body.orderId, transaction_amount: 129.8, currency_id: 'BRL', status: 'pending' };
    const secondManifest = `id:67890;request-id:${requestId};ts:${ts};`;
    const secondSignature = createHmac('sha256', process.env.MP_WEBHOOK_SECRET).update(secondManifest).digest('hex');
    const secondHeaders = { ...headers, 'x-signature': `ts=${ts},v1=${secondSignature}` };
    const sendSecond = () => originalFetch(`${base}/api/webhooks/mercado-pago?data.id=67890&type=payment`, {
      method: 'POST', headers: secondHeaders, body: JSON.stringify({ id: 8, type: 'payment', data: { id: '67890' } }),
    });
    assert.equal((await sendSecond()).status, 200);
    assert.equal((await call(`/api/orders/${next.body.orderId}`, 'GET', null, token)).body.paymentStatus, 'EM_ANALISE');
    payment.status = 'rejected';
    assert.equal((await sendSecond()).status, 200);
    assert.equal((await sendSecond()).status, 200);
    assert.equal((await call(`/api/orders/${next.body.orderId}`, 'GET', null, token)).body.paymentStatus, 'RECUSADO');
    assert.equal(db.prepare('SELECT stock FROM products WHERE id = 2').get().stock, stockBeforeRejection + 1);
  } finally {
    await new Promise(resolve => server.close(resolve));
    db.close();
  }
});
