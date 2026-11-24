-- Galeria Seleta: modelo de dados.
-- Este arquivo é a referência documental do banco. O banco de verdade é criado
-- pelo próprio backend/src/db.js na primeira execução da API; um teste em
-- backend/test/api.test.js confere que os dois descrevem as mesmas tabelas.
-- Valores em dinheiro ficam em centavos (INTEGER), para não acumular erro de arredondamento.

PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  phone TEXT,
  is_admin INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS products (
  id INTEGER PRIMARY KEY,
  category_id INTEGER NOT NULL,
  category TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  price_cents INTEGER NOT NULL,
  discount_price_cents INTEGER,
  stock INTEGER NOT NULL,
  image TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id),
  idempotency_key TEXT NOT NULL,
  address_json TEXT NOT NULL,
  shipping_code TEXT NOT NULL,
  subtotal_cents INTEGER NOT NULL,
  shipping_cents INTEGER NOT NULL,
  total_cents INTEGER NOT NULL,
  payment_status TEXT NOT NULL,
  fulfillment_status TEXT NOT NULL,
  preference_id TEXT,
  checkout_url TEXT,
  reservation_expires_at TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  UNIQUE(user_id, idempotency_key)
);

CREATE TABLE IF NOT EXISTS order_items (
  order_id TEXT NOT NULL REFERENCES orders(id),
  product_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  size TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  unit_price_cents INTEGER NOT NULL,
  image TEXT NOT NULL,
  PRIMARY KEY (order_id, product_id, size)
);

CREATE TABLE IF NOT EXISTS payments (
  id TEXT PRIMARY KEY,
  order_id TEXT NOT NULL REFERENCES orders(id),
  status TEXT NOT NULL,
  amount_cents INTEGER NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS webhook_events (
  id TEXT PRIMARY KEY,
  received_at TEXT NOT NULL
);
