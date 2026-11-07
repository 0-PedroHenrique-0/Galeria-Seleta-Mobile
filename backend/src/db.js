import { DatabaseSync } from 'node:sqlite';
import { mkdirSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const dbPath = resolve(process.env.DB_PATH || fileURLToPath(new URL('../data/galeria.sqlite', import.meta.url)));
mkdirSync(dirname(dbPath), { recursive: true });
export const db = new DatabaseSync(dbPath);
db.exec('PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON; PRAGMA busy_timeout = 5000;');
db.exec(`
CREATE TABLE IF NOT EXISTS users (
 id TEXT PRIMARY KEY, name TEXT NOT NULL, email TEXT NOT NULL UNIQUE,
 password_hash TEXT NOT NULL, phone TEXT, is_admin INTEGER NOT NULL DEFAULT 0, created_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS products (
 id INTEGER PRIMARY KEY, category_id INTEGER NOT NULL, category TEXT NOT NULL,
 name TEXT NOT NULL, description TEXT NOT NULL, price_cents INTEGER NOT NULL,
 discount_price_cents INTEGER, stock INTEGER NOT NULL, image TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS orders (
 id TEXT PRIMARY KEY, user_id TEXT NOT NULL REFERENCES users(id),
 idempotency_key TEXT NOT NULL, address_json TEXT NOT NULL, shipping_code TEXT NOT NULL,
 subtotal_cents INTEGER NOT NULL, shipping_cents INTEGER NOT NULL, total_cents INTEGER NOT NULL,
 payment_status TEXT NOT NULL, fulfillment_status TEXT NOT NULL,
 preference_id TEXT, checkout_url TEXT, reservation_expires_at TEXT NOT NULL,
 created_at TEXT NOT NULL, updated_at TEXT NOT NULL,
 UNIQUE(user_id, idempotency_key)
);
CREATE TABLE IF NOT EXISTS order_items (
 order_id TEXT NOT NULL REFERENCES orders(id), product_id INTEGER NOT NULL,
 name TEXT NOT NULL, size TEXT NOT NULL, quantity INTEGER NOT NULL,
 unit_price_cents INTEGER NOT NULL, image TEXT NOT NULL,
 PRIMARY KEY (order_id, product_id, size)
);
CREATE TABLE IF NOT EXISTS payments (
 id TEXT PRIMARY KEY, order_id TEXT NOT NULL REFERENCES orders(id),
 status TEXT NOT NULL, amount_cents INTEGER NOT NULL, updated_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS webhook_events (
 id TEXT PRIMARY KEY, received_at TEXT NOT NULL
);
`);
if (!db.prepare('PRAGMA table_info(users)').all().some(column => column.name === 'is_admin')) {
  db.exec('ALTER TABLE users ADD COLUMN is_admin INTEGER NOT NULL DEFAULT 0');
}

const count = db.prepare('SELECT COUNT(*) AS count FROM products').get().count;
if (count === 0) {
  const catalog = JSON.parse(readFileSync(new URL('./catalog.json', import.meta.url), 'utf8'));
  const insert = db.prepare(`INSERT INTO products
    (id, category_id, category, name, description, price_cents, discount_price_cents, stock, image)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`);
  for (const p of catalog) {
    insert.run(p.id, p.categoryId, p.category, p.name, p.description,
      Math.round(p.price * 100), p.discountPrice == null ? null : Math.round(p.discountPrice * 100), p.stock, p.image);
  }
}

export function transaction(fn) {
  db.exec('BEGIN IMMEDIATE');
  try {
    const result = fn();
    db.exec('COMMIT');
    return result;
  } catch (error) {
    db.exec('ROLLBACK');
    throw error;
  }
}

export function productToApi(row) {
  return {
    id: row.id, categoryId: row.category_id, category: row.category,
    name: row.name, description: row.description, price: row.price_cents / 100,
    discountPrice: row.discount_price_cents == null ? null : row.discount_price_cents / 100,
    stock: row.stock, image: row.image,
  };
}

export function getOrder(id) {
  const row = db.prepare('SELECT * FROM orders WHERE id = ?').get(id);
  if (!row) return null;
  const items = db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(id).map(item => ({
    id: item.product_id, name: item.name, size: item.size, quantity: item.quantity,
    price: item.unit_price_cents / 100, image: item.image,
  }));
  return {
    id: row.id, userId: row.user_id, date: row.created_at,
    paymentStatus: row.payment_status, fulfillmentStatus: row.fulfillment_status,
    items, address: JSON.parse(row.address_json),
    subtotal: row.subtotal_cents / 100, shipping: row.shipping_cents / 100,
    discount: 0, total: row.total_cents / 100,
    checkoutUrl: row.checkout_url,
  };
}

export function releaseReservation(id, status) {
  return transaction(() => {
    const order = db.prepare('SELECT payment_status FROM orders WHERE id = ?').get(id);
    if (!order || !['AGUARDANDO_PAGAMENTO', 'EM_ANALISE'].includes(order.payment_status)) return false;
    const items = db.prepare('SELECT product_id, quantity FROM order_items WHERE order_id = ?').all(id);
    for (const item of items) db.prepare('UPDATE products SET stock = stock + ? WHERE id = ?').run(item.quantity, item.product_id);
    db.prepare('UPDATE orders SET payment_status = ?, updated_at = ? WHERE id = ?').run(status, new Date().toISOString(), id);
    return true;
  });
}

export function expireReservations() {
  const ids = db.prepare(`SELECT id FROM orders WHERE payment_status IN ('AGUARDANDO_PAGAMENTO', 'EM_ANALISE') AND reservation_expires_at < ?`).all(new Date().toISOString());
  for (const { id } of ids) releaseReservation(id, 'EXPIRADO');
}
