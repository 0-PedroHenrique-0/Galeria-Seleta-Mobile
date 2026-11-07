import { request, getProductsApi, getProductApi } from './api';
import { Product } from './types';

export async function initializeDatabase() { return; }
export const getProducts = getProductsApi;
export const getProductById = getProductApi;
export type ProductInput = Omit<Product, 'id'>;
export async function createProduct(product: ProductInput) {
  const created = await request<Product>('/api/products', { method: 'POST', body: JSON.stringify(product) });
  return created.id;
}
export async function updateProduct(id: number, product: ProductInput) {
  await request<Product>(`/api/products/${id}`, { method: 'PUT', body: JSON.stringify(product) });
}
export async function deleteProduct(id: number) {
  await request(`/api/products/${id}`, { method: 'DELETE' });
}
