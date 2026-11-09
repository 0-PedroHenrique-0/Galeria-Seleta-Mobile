import { createHmac, timingSafeEqual } from 'node:crypto';

const API = 'https://api.mercadopago.com';

async function mpRequest(path, options = {}) {
  if (!process.env.MP_ACCESS_TOKEN) throw new Error('Configure MP_ACCESS_TOKEN no backend.');
  const response = await fetch(`${API}${path}`, {
    ...options,
    headers: { Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}`, 'Content-Type': 'application/json', ...options.headers },
    signal: AbortSignal.timeout(15000),
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    console.error('Mercado Pago API:', response.status, body.error ?? body.message ?? 'erro');
    throw new Error('Não foi possível comunicar com o Mercado Pago.');
  }
  return body;
}

export async function createPreference(order, items) {
  const returnUrl = process.env.APP_RETURN_URL;
  if (!returnUrl) throw new Error('Configure APP_RETURN_URL no backend.');
  const base = `${returnUrl.replace(/\/$/, '')}/${encodeURIComponent(order.id)}`;
  const body = {
    items: [
      ...items.map(item => ({
        id: String(item.product_id), title: `${item.name} - ${item.size}`,
        quantity: item.quantity, currency_id: 'BRL', unit_price: item.unit_price_cents / 100,
      })),
      { id: 'shipping', title: 'Frete', quantity: 1, currency_id: 'BRL', unit_price: order.shipping_cents / 100 },
    ],
    external_reference: order.id,
    back_urls: { success: `${base}?result=success`, pending: `${base}?result=pending`, failure: `${base}?result=failure` },
    auto_return: 'approved',
    expires: true,
    expiration_date_from: order.created_at,
    expiration_date_to: order.reservation_expires_at,
  };
  return mpRequest('/checkout/preferences', { method: 'POST', body: JSON.stringify(body) });
}

export function getPayment(id) {
  if (!/^\d+$/.test(String(id))) throw new Error('ID de pagamento inválido.');
  return mpRequest(`/v1/payments/${id}`);
}

export async function searchPayments(orderId) {
  const response = await mpRequest(`/v1/payments/search?external_reference=${encodeURIComponent(orderId)}`);
  return Array.isArray(response.results) ? response.results : [];
}

export function verifyWebhook(headers, query) {
  const secret = process.env.MP_WEBHOOK_SECRET;
  const dataId = String(query['data.id'] ?? '').toLowerCase();
  const requestId = String(headers['x-request-id'] ?? '');
  const signature = String(headers['x-signature'] ?? '');
  const fields = Object.fromEntries(signature.split(',').map(part => part.trim().split('=')));
  if (!secret || !dataId || !requestId || !/^\d+$/.test(fields.ts ?? '') || !/^[a-f0-9]{64}$/i.test(fields.v1 ?? '')) return false;
  const manifest = `id:${dataId};request-id:${requestId};ts:${fields.ts};`;
  const expected = createHmac('sha256', secret).update(manifest).digest();
  const given = Buffer.from(fields.v1, 'hex');
  return given.length === expected.length && timingSafeEqual(given, expected);
}
