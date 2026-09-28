import * as SQLite from 'expo-sqlite';
import { PRODUCTS } from './data';
import { Product } from './types';

let databasePromise: Promise<SQLite.SQLiteDatabase> | null = null;

function getDatabase() {
  if (!databasePromise) {
    databasePromise = SQLite.openDatabaseAsync('galeria-seleta.db');
  }
  return databasePromise;
}

type ProductRow = {
  id: number;
  category_id: number;
  category: string;
  name: string;
  description: string;
  price: number;
  discount_price: number | null;
  stock: number;
  image: string;
};

function rowToProduct(row: ProductRow): Product {
  return {
    id: row.id,
    categoryId: row.category_id,
    category: row.category,
    name: row.name,
    description: row.description,
    price: row.price,
    discountPrice: row.discount_price,
    stock: row.stock,
    image: row.image,
  };
}

export async function initializeDatabase() {
  const db = await getDatabase();

  await db.execAsync(`
    PRAGMA journal_mode = WAL;
    PRAGMA foreign_keys = ON;

    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT,
      phone TEXT,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS services (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      price REAL NOT NULL DEFAULT 0,
      active INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS appointments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      service_id INTEGER NOT NULL,
      scheduled_at TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'AGENDADO',
      notes TEXT,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (service_id) REFERENCES services(id)
    );

    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      category_id INTEGER NOT NULL,
      category TEXT NOT NULL,
      name TEXT NOT NULL,
      description TEXT NOT NULL,
      price REAL NOT NULL CHECK (price >= 0),
      discount_price REAL,
      stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
      image TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);

  const count = await db.getFirstAsync<{ total: number }>('SELECT COUNT(*) AS total FROM products');
  if ((count?.total ?? 0) === 0) {
    for (const product of PRODUCTS) {
      await db.runAsync(
        `INSERT INTO products
          (id, category_id, category, name, description, price, discount_price, stock, image)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        product.id,
        product.categoryId,
        product.category,
        product.name,
        product.description,
        product.price,
        product.discountPrice ?? null,
        product.stock,
        product.image,
      );
    }
  }
}

export async function getProducts(): Promise<Product[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<ProductRow>('SELECT * FROM products ORDER BY id DESC');
  return rows.map(rowToProduct);
}

export async function getProductById(id: number): Promise<Product | null> {
  const db = await getDatabase();
  const row = await db.getFirstAsync<ProductRow>('SELECT * FROM products WHERE id = ?', id);
  return row ? rowToProduct(row) : null;
}

export type ProductInput = Omit<Product, 'id'>;

export async function createProduct(product: ProductInput) {
  const db = await getDatabase();
  const result = await db.runAsync(
    `INSERT INTO products
      (category_id, category, name, description, price, discount_price, stock, image)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    product.categoryId,
    product.category,
    product.name,
    product.description,
    product.price,
    product.discountPrice ?? null,
    product.stock,
    product.image,
  );
  return Number(result.lastInsertRowId);
}

export async function updateProduct(id: number, product: ProductInput) {
  const db = await getDatabase();
  await db.runAsync(
    `UPDATE products
     SET category_id = ?, category = ?, name = ?, description = ?, price = ?,
         discount_price = ?, stock = ?, image = ?, updated_at = CURRENT_TIMESTAMP
     WHERE id = ?`,
    product.categoryId,
    product.category,
    product.name,
    product.description,
    product.price,
    product.discountPrice ?? null,
    product.stock,
    product.image,
    id,
  );
}

export async function deleteProduct(id: number) {
  const db = await getDatabase();
  await db.runAsync('DELETE FROM products WHERE id = ?', id);
}
