import AsyncStorage from '@react-native-async-storage/async-storage';
import { Address, CartItem, Order } from './types';

const KEYS = {
  cart: '@galeria/cart',
  addresses: '@galeria/addresses',
  orders: '@galeria/orders',
  user: '@galeria/user',
  session: '@galeria/session',
};

export async function getCart(): Promise<CartItem[]> {
  const raw = await AsyncStorage.getItem(KEYS.cart);
  return raw ? JSON.parse(raw) : [];
}

export async function saveCart(cart: CartItem[]) {
  await AsyncStorage.setItem(KEYS.cart, JSON.stringify(cart));
}

export async function getAddresses(): Promise<Address[]> {
  const raw = await AsyncStorage.getItem(KEYS.addresses);
  return raw ? JSON.parse(raw) : [{ id: 'addr-1', label: 'Principal', street: 'Av. Rio Bonito, 9021', city: 'São Paulo', state: 'SP', zip: '00000-000', complement: '', isDefault: true }];
}

export async function saveAddresses(addresses: Address[]) {
  await AsyncStorage.setItem(KEYS.addresses, JSON.stringify(addresses));
}

export async function getOrders(): Promise<Order[]> {
  const raw = await AsyncStorage.getItem(KEYS.orders);
  return raw ? JSON.parse(raw) : [];
}

export async function saveOrders(orders: Order[]) {
  await AsyncStorage.setItem(KEYS.orders, JSON.stringify(orders));
}

export async function saveUser(user: { name: string; email: string; phone?: string }) {
  await AsyncStorage.setItem(KEYS.user, JSON.stringify(user));
}

export async function getUser() {
  const raw = await AsyncStorage.getItem(KEYS.user);
  return raw ? JSON.parse(raw) : null;
}

export async function setSession(value: boolean) {
  await AsyncStorage.setItem(KEYS.session, value ? '1' : '0');
}

export async function getSession() {
  return (await AsyncStorage.getItem(KEYS.session)) === '1';
}