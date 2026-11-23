import test from 'node:test';
import assert from 'node:assert/strict';
import { createHmac } from 'node:crypto';
import { verifyWebhook } from '../src/mercado-pago.js';

const SEGREDO = 'segredo-de-teste-do-webhook';
const DATA_ID = 'ABC123';
const REQUEST_ID = 'req-0001';
const TS = '1700000000000';

const segredoOriginal = process.env.MP_WEBHOOK_SECRET;
process.env.MP_WEBHOOK_SECRET = SEGREDO;
test.after(() => {
  if (segredoOriginal === undefined) delete process.env.MP_WEBHOOK_SECRET;
  else process.env.MP_WEBHOOK_SECRET = segredoOriginal;
});

function assinar(segredo, { dataId = DATA_ID, requestId = REQUEST_ID, ts = TS } = {}) {
  const manifest = `id:${dataId.toLowerCase()};request-id:${requestId};ts:${ts};`;
  return createHmac('sha256', segredo).update(manifest).digest('hex');
}

function montar({ segredo = SEGREDO, requestId = REQUEST_ID, ts = TS, v1 = assinar(segredo) } = {}) {
  const partes = [];
  if (ts !== null) partes.push(`ts=${ts}`);
  if (v1 !== null) partes.push(`v1=${v1}`);
  const headers = { 'x-signature': partes.join(',') };
  if (requestId !== null) headers['x-request-id'] = requestId;
  return { headers, query: { 'data.id': DATA_ID } };
}

test('assinatura correta é aceita', () => {
  const { headers, query } = montar();
  assert.equal(verifyWebhook(headers, query), true);
});

test('assinatura de outro segredo é recusada', () => {
  const { headers, query } = montar({ v1: assinar('outro-segredo') });
  assert.equal(verifyWebhook(headers, query), false);
});

test('falta de x-request-id, de ts ou de v1 recusa', () => {
  for (const faltando of [{ requestId: null }, { ts: null }, { v1: null }]) {
    const { headers, query } = montar(faltando);
    assert.equal(verifyWebhook(headers, query), false, `deveria recusar com ${JSON.stringify(faltando)}`);
  }
});

test('v1 fora do formato hexadecimal de 64 caracteres recusa', () => {
  const valida = assinar(SEGREDO);
  const invalidas = {
    curta: valida.slice(0, 62),
    longa: `${valida}ab`,
    'não hexadecimal': `${valida.slice(0, 63)}z`,
  };
  for (const [motivo, v1] of Object.entries(invalidas)) {
    const { headers, query } = montar({ v1 });
    assert.equal(verifyWebhook(headers, query), false, `deveria recusar v1 ${motivo}`);
  }
});

test('sem MP_WEBHOOK_SECRET configurado recusa', () => {
  const { headers, query } = montar();
  delete process.env.MP_WEBHOOK_SECRET;
  try {
    assert.equal(verifyWebhook(headers, query), false);
  } finally {
    process.env.MP_WEBHOOK_SECRET = SEGREDO;
  }
});
