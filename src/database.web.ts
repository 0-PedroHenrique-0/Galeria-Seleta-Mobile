import { PRODUCTS } from './data';
import { Product } from './types';

let products: Product[] = PRODUCTS.map(product => ({ ...product }));
let nextId = Math.max(...products.map(product => product.id), 0) + 1;

export async function initializeDatabase() {
  return;
}

export async function getProducts(): Promise<Product[]> {
  return [...products].sort((a, b) => b.id - a.id);
}

export async function getProductById(id: number): Promise<Product | null> {
  return products.find(product => product.id === id) ?? null;
}

export type ProductInput = Omit<Product, 'id'>;

export async function createProduct(product: ProductInput) {
  const id = nextId++;
  products.push({ ...product, id });
  return id;
}

export async function updateProduct(id: number, product: ProductInput) {
  products = products.map(item => item.id === id ? { ...product, id } : item);
}

export async function deleteProduct(id: number) {
  products = products.filter(item => item.id !== id);
}
