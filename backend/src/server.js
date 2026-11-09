import express from 'express';
import cors from 'cors';
import { randomUUID } from 'node:crypto';
import { db, transaction, productToApi, getOrder, releaseReservation, expireReservations } from './db.js';
import { register, login, requireUser, requireAdmin, publicUser } from './auth.js';
import { createPreference, getPayment, searchPayments, verifyWebhook } from './mercado-pago.js';

const app = express();
const PORT = process.env.PORT || 3333;
app.use(cors({ origin: process.env.APP_ORIGIN || true }));
app.use(express.json({ limit: '32kb' }));
class HttpError extends Error { constructor(status, message) { super(message); this.status = status; } }
const asyncRoute = fn => (req, res, next) => Promise.resolve(fn(req, res)).catch(next);
const now = () => new Date().toISOString();
const toCents = value => Number.isFinite(Number(value)) ? Math.round(Number(value) * 100) : NaN;
const lastPaymentCheck = new Map();

function validateProduct(body) {
  const p = {
    name: String(body?.name ?? '').trim(), category: String(body?.category ?? '').trim(),
    description: String(body?.description ?? '').trim(), image: String(body?.image ?? '').trim(),
    categoryId: Number(body?.categoryId), stock: Number(body?.stock), price: toCents(body?.price),
    discount: body?.discountPrice == null || body.discountPrice === '' ? null : toCents(body.discountPrice),
  };
  if (!p.name || !p.category || !p.description || !p.image || !Number.isInteger(p.categoryId) || p.categoryId < 1 ||
      !Number.isInteger(p.stock) || p.stock < 0 || !Number.isInteger(p.price) || p.price < 0 ||
      (p.discount != null && (!Number.isInteger(p.discount) || p.discount < 0 || p.discount > p.price))) {
    throw new HttpError(400, 'Dados do produto inválidos.');
  }
  return p;
}

function quote(body) {
  if (!Array.isArray(body?.items) || body.items.length === 0 || body.items.length > 30) throw new HttpError(400, 'Carrinho inválido.');
  const shippingCode = body.shippingCode;
  const shippingCents = { standard: 2990, express: 5490 }[shippingCode];
  if (!shippingCents) throw new HttpError(400, 'Frete inválido.');
  const seen = new Set();
  let subtotalCents = 0;
  const items = body.items.map(input => {
    const id = Number(input.id), quantity = Number(input.quantity), size = String(input.size ?? '').trim();
    const key = `${id}:${size}`;
    if (!Number.isInteger(id) || !Number.isInteger(quantity) || quantity < 1 || quantity > 20 ||
        !['P', 'M', 'G', 'GG'].includes(size) || seen.has(key)) throw new HttpError(400, 'Item inválido no carrinho.');
    seen.add(key);
    const product = db.prepare('SELECT * FROM products WHERE id = ?').get(id);
    if (!product || product.stock < quantity) throw new HttpError(409, 'Produto indisponível ou estoque insuficiente. Atualize o carrinho.');
    const unitPriceCents = product.discount_price_cents ?? product.price_cents;
    subtotalCents += unitPriceCents * quantity;
    return { product_id: id, name: product.name, size, quantity, unit_price_cents: unitPriceCents, image: product.image };
  });
  return { items, shippingCode, subtotalCents, shippingCents, totalCents: subtotalCents + shippingCents };
}

function validateAddress(value) {
  const address = {
    street: String(value?.street ?? '').trim(), city: String(value?.city ?? '').trim(),
    state: String(value?.state ?? '').trim().toUpperCase(), zip: String(value?.zip ?? '').replace(/\D/g, ''),
    complement: String(value?.complement ?? '').trim(),
  };
  if (address.street.length < 5 || address.city.length < 2 || !/^[A-Z]{2}$/.test(address.state) || !/^\d{8}$/.test(address.zip) || address.zip === '00000000') {
    throw new HttpError(400, 'Preencha um endereço de entrega válido.');
  }
  return address;
}

async function reconcilePayment(paymentId) {
  const payment = await getPayment(paymentId);
  const id = String(payment.external_reference ?? '');
  const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(id);
  if (!order) return false;
  const amountCents = toCents(payment.transaction_amount);
  if (payment.currency_id !== 'BRL' || amountCents !== order.total_cents || String(payment.id) !== String(paymentId)) {
    console.error('Pagamento incompatível com o pedido:', paymentId, id);
    return false;
  }
  const status = String(payment.status ?? '');
  transaction(() => {
    db.prepare(`INSERT INTO payments (id, order_id, status, amount_cents, updated_at) VALUES (?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET status=excluded.status, updated_at=excluded.updated_at`)
      .run(String(payment.id), id, status, amountCents, now());
    const current = db.prepare('SELECT payment_status FROM orders WHERE id = ?').get(id).payment_status;
    if (current === 'REVISAO_MANUAL' || current === 'REEMBOLSADO') return;
    if (current === 'APROVADO') {
      if (['refunded', 'charged_back'].includes(status)) {
        db.prepare('UPDATE orders SET payment_status = ?, updated_at = ? WHERE id = ?').run('REEMBOLSADO', now(), id);
      }
      return;
    }
    let next = current;
    if (status === 'approved') {
      if (['EXPIRADO', 'RECUSADO', 'CANCELADO'].includes(current)) {
        const items = db.prepare('SELECT product_id, quantity FROM order_items WHERE order_id = ?').all(id);
        const enough = items.every(item => db.prepare('SELECT stock FROM products WHERE id = ?').get(item.product_id)?.stock >= item.quantity);
        if (enough) for (const item of items) db.prepare('UPDATE products SET stock = stock - ? WHERE id = ?').run(item.quantity, item.product_id);
        next = enough ? 'APROVADO' : 'REVISAO_MANUAL';
      } else next = 'APROVADO';
    } else if (['pending', 'in_process', 'authorized'].includes(status)) next = 'EM_ANALISE';
    else if (status === 'rejected') next = 'RECUSADO';
    else if (['cancelled', 'refunded', 'charged_back'].includes(status)) next = 'CANCELADO';
    if (next !== current && !['RECUSADO', 'CANCELADO'].includes(next)) {
      db.prepare('UPDATE orders SET payment_status = ?, updated_at = ? WHERE id = ?').run(next, now(), id);
    }
  });
  if (status === 'rejected') releaseReservation(id, 'RECUSADO');
  if (['cancelled', 'refunded', 'charged_back'].includes(status)) releaseReservation(id, 'CANCELADO');
  return true;
}

app.get('/health', (_req, res) => res.json({ status: 'ok', service: 'galeria-seleta-api' }));
app.post('/api/auth/register', register);
app.post('/api/auth/login', login);
app.get('/api/me', requireUser, (req, res) => res.json(req.user));
app.put('/api/me', requireUser, (req, res) => {
  const name = String(req.body?.name ?? '').trim();
  const phone = String(req.body?.phone ?? '').trim();
  if (name.length < 2 || phone.length > 30) throw new HttpError(400, 'Dados pessoais inválidos.');
  db.prepare('UPDATE users SET name = ?, phone = ? WHERE id = ?').run(name, phone, req.user.id);
  res.json(publicUser(db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.id)));
});
app.get('/api/products', (_req, res) => res.json(db.prepare('SELECT * FROM products ORDER BY id DESC').all().map(productToApi)));
app.get('/api/products/:id', (req, res) => {
  const row = db.prepare('SELECT * FROM products WHERE id = ?').get(Number(req.params.id));
  return row ? res.json(productToApi(row)) : res.status(404).json({ message: 'Produto não encontrado.' });
});
app.post('/api/products', requireUser, requireAdmin, (req, res) => {
  const p = validateProduct(req.body);
  const result = db.prepare(`INSERT INTO products (category_id, category, name, description, price_cents, discount_price_cents, stock, image)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)`).run(p.categoryId, p.category, p.name, p.description, p.price, p.discount, p.stock, p.image);
  res.status(201).json(productToApi(db.prepare('SELECT * FROM products WHERE id = ?').get(result.lastInsertRowid)));
});
app.put('/api/products/:id', requireUser, requireAdmin, (req, res) => {
  const p = validateProduct(req.body);
  const result = db.prepare(`UPDATE products SET category_id=?, category=?, name=?, description=?, price_cents=?, discount_price_cents=?, stock=?, image=? WHERE id=?`)
    .run(p.categoryId, p.category, p.name, p.description, p.price, p.discount, p.stock, p.image, Number(req.params.id));
  if (!result.changes) return res.status(404).json({ message: 'Produto não encontrado.' });
  res.json(productToApi(db.prepare('SELECT * FROM products WHERE id = ?').get(Number(req.params.id))));
});
app.delete('/api/products/:id', requireUser, requireAdmin, (req, res) => {
  const result = db.prepare('DELETE FROM products WHERE id = ?').run(Number(req.params.id));
  res.status(result.changes ? 204 : 404).end();
});
app.post('/api/checkout/quote', requireUser, (req, res) => {
  const q = quote(req.body);
  res.json({ subtotal: q.subtotalCents / 100, shipping: q.shippingCents / 100, discount: 0, total: q.totalCents / 100 });
});
app.post('/api/checkout/sessions', requireUser, asyncRoute(async (req, res) => {
  if (!process.env.MP_ACCESS_TOKEN || !process.env.APP_RETURN_URL) throw new HttpError(503, 'Pagamento ainda não configurado no servidor.');
  const key = String(req.body?.idempotencyKey ?? '');
  if (!/^[a-zA-Z0-9-]{16,80}$/.test(key)) throw new HttpError(400, 'Chave da tentativa inválida.');
  expireReservations();
  const existing = db.prepare('SELECT * FROM orders WHERE user_id = ? AND idempotency_key = ?').get(req.user.id, key);
  if (existing) {
    if (!existing.checkout_url) throw new HttpError(409, 'Pagamento em preparação. Tente novamente em instantes.');
    return res.json({ orderId: existing.id, checkoutUrl: existing.checkout_url, paymentStatus: existing.payment_status });
  }
  const address = validateAddress(req.body?.address);
  const result = transaction(() => {
    const q = quote(req.body), id = randomUUID(), created = now();
    const expires = new Date(Date.now() + 72 * 60 * 60 * 1000).toISOString();
    for (const item of q.items) {
      const changed = db.prepare('UPDATE products SET stock = stock - ? WHERE id = ? AND stock >= ?').run(item.quantity, item.product_id, item.quantity);
      if (!changed.changes) throw new HttpError(409, 'Estoque alterado. Atualize o carrinho.');
    }
    db.prepare(`INSERT INTO orders (id, user_id, idempotency_key, address_json, shipping_code, subtotal_cents, shipping_cents,
      total_cents, payment_status, fulfillment_status, reservation_expires_at, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'AGUARDANDO_PAGAMENTO', 'NAO_INICIADO', ?, ?, ?)`)
      .run(id, req.user.id, key, JSON.stringify(address), q.shippingCode, q.subtotalCents, q.shippingCents, q.totalCents, expires, created, created);
    const add = db.prepare('INSERT INTO order_items (order_id, product_id, name, size, quantity, unit_price_cents, image) VALUES (?, ?, ?, ?, ?, ?, ?)');
    for (const item of q.items) add.run(id, item.product_id, item.name, item.size, item.quantity, item.unit_price_cents, item.image);
    return { order: db.prepare('SELECT * FROM orders WHERE id = ?').get(id), items: q.items };
  });
  try {
    const preference = await createPreference(result.order, result.items);
    if (!preference.id || !preference.init_point) throw new Error('Preferência sem URL de checkout.');
    db.prepare('UPDATE orders SET preference_id = ?, checkout_url = ?, updated_at = ? WHERE id = ?')
      .run(String(preference.id), preference.init_point, now(), result.order.id);
    return res.status(201).json({ orderId: result.order.id, checkoutUrl: preference.init_point, paymentStatus: 'AGUARDANDO_PAGAMENTO' });
  } catch (error) {
    releaseReservation(result.order.id, 'CANCELADO');
    transaction(() => {
      db.prepare('DELETE FROM order_items WHERE order_id = ?').run(result.order.id);
      db.prepare('DELETE FROM orders WHERE id = ?').run(result.order.id);
    });
    throw error;
  }
}));
app.get('/api/orders', requireUser, (req, res) => {
  expireReservations();
  const ids = db.prepare('SELECT id FROM orders WHERE user_id = ? ORDER BY created_at DESC').all(req.user.id);
  res.json(ids.map(({ id }) => getOrder(id)));
});
app.get('/api/orders/:id', requireUser, asyncRoute(async (req, res) => {
  expireReservations();
  let order = getOrder(req.params.id);
  if (!order || order.userId !== req.user.id) return res.status(404).json({ message: 'Pedido não encontrado.' });
  if (['AGUARDANDO_PAGAMENTO', 'EM_ANALISE'].includes(order.paymentStatus) &&
      Date.now() - (lastPaymentCheck.get(order.id) ?? 0) > 5000) {
    lastPaymentCheck.set(order.id, Date.now());
    try {
      const payments = await searchPayments(order.id);
      for (const payment of payments) if (payment.id) await reconcilePayment(String(payment.id));
      order = getOrder(order.id);
    } catch (error) { console.error('Falha ao reconciliar pedido:', error); }
  }
  res.json(order);
}));
app.post('/api/orders/:id/reconcile', requireUser, asyncRoute(async (req, res) => {
  const order = getOrder(req.params.id);
  if (!order || order.userId !== req.user.id) throw new HttpError(404, 'Pedido não encontrado.');
  const paymentId = String(req.body?.paymentId ?? '');
  if (!/^\d+$/.test(paymentId)) throw new HttpError(400, 'Pagamento inválido.');
  if (!await reconcilePayment(paymentId)) throw new HttpError(409, 'Pagamento não corresponde ao pedido.');
  res.json(getOrder(order.id));
}));
app.post('/api/webhooks/mercado-pago', asyncRoute(async (req, res) => {
  if (!verifyWebhook(req.headers, req.query)) return res.status(401).end();
  if (req.query.type !== 'payment') return res.status(200).end();
  const paymentId = String(req.query['data.id']);
  await reconcilePayment(paymentId);
  const eventId = String(req.body?.id ?? `${paymentId}:${req.body?.action ?? ''}`);
  db.prepare('INSERT OR IGNORE INTO webhook_events (id, received_at) VALUES (?, ?)').run(eventId, now());
  res.status(200).end();
}));
app.use((error, _req, res, _next) => {
  console.error(error);
  res.status(error.status ?? 500).json({ message: error.status ? error.message : 'Erro interno do servidor.' });
});
if (process.env.NODE_ENV !== 'test') app.listen(PORT, () => console.log(`Galeria Seleta API na porta ${PORT}`));
export { app };
