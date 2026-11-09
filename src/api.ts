import { Platform } from 'react-native';
import { getAuthToken } from './storage';
import { Address, CartItem, Order, Product } from './types';

const defaultUrl = Platform.OS === 'android' ? 'http://10.0.2.2:3333' : 'http://localhost:3333';
export const API_URL = (process.env.EXPO_PUBLIC_API_URL || defaultUrl).replace(/\/$/, '');

export class ApiError extends Error {
  constructor(message: string, public status: number) { super(message); }
}

export async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = await getAuthToken();
  let response: Response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      ...init,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...init.headers,
      },
    });
  } catch {
    throw new ApiError('Não foi possível conectar à API. Confira a rede e EXPO_PUBLIC_API_URL.', 0);
  }
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new ApiError(body.message || 'Não foi possível concluir a operação.', response.status);
  return body as T;
}

export type AuthResult = { token: string; user: { id: string; name: string; email: string; phone: string; isAdmin: boolean } };
export const loginApi = (email: string, password: string) => request<AuthResult>('/api/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) });
export const registerApi = (name: string, email: string, password: string) => request<AuthResult>('/api/auth/register', { method: 'POST', body: JSON.stringify({ name, email, password }) });
export const updateProfileApi = (name: string, phone: string) => request<AuthResult['user']>('/api/me', { method: 'PUT', body: JSON.stringify({ name, phone }) });
export const getProductsApi = () => request<Product[]>('/api/products');
export const getProductApi = (id: number) => request<Product>(`/api/products/${id}`);
export const quoteApi = (items: CartItem[], shippingCode: 'standard' | 'express') =>
  request<{ subtotal: number; shipping: number; discount: number; total: number }>('/api/checkout/quote', {
    method: 'POST', body: JSON.stringify({ items: items.map(({ id, size, quantity }) => ({ id, size, quantity })), shippingCode }),
  });
export const createCheckout = (items: CartItem[], address: Address, shippingCode: 'standard' | 'express', idempotencyKey: string) =>
  request<{ orderId: string; checkoutUrl: string; paymentStatus: string }>('/api/checkout/sessions', {
    method: 'POST', body: JSON.stringify({ items: items.map(({ id, size, quantity }) => ({ id, size, quantity })), address, shippingCode, idempotencyKey }),
  });
export const getOrdersApi = () => request<Order[]>('/api/orders');
export const getOrderApi = (id: string) => request<Order>(`/api/orders/${encodeURIComponent(id)}`);
export const reconcileOrderApi = (id: string, paymentId: string) => request<Order>(`/api/orders/${encodeURIComponent(id)}/reconcile`, {
  method: 'POST', body: JSON.stringify({ paymentId }),
});
