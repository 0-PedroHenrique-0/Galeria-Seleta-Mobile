import AsyncStorage from '@react-native-async-storage/async-storage';
import { Address, CartItem } from './types';

const KEYS = {
  cart: '@galeria/cart',
  addresses: '@galeria/addresses',
  user: '@galeria/user',
  session: '@galeria/session',
  authToken: '@galeria/auth-token',
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
  return raw ? JSON.parse(raw) : [];
}

export async function saveAddresses(addresses: Address[]) {
  await AsyncStorage.setItem(KEYS.addresses, JSON.stringify(addresses));
}

export async function saveUser(user: { name: string; email: string; phone?: string }) {
  await AsyncStorage.setItem(KEYS.user, JSON.stringify(user));
}

export async function getUser() {
  const raw = await AsyncStorage.getItem(KEYS.user);
  return raw ? JSON.parse(raw) : null;
}

export async function setSession(value: boolean) {
  if (!value) await AsyncStorage.multiRemove([KEYS.authToken, KEYS.session, KEYS.user]);
}

export async function getSession() {
  return Boolean(await getAuthToken());
}

export async function getAuthToken() {
  return AsyncStorage.getItem(KEYS.authToken);
}

export async function saveAuth(token: string, user: { id: string; name: string; email: string; phone?: string; isAdmin: boolean }) {
  await AsyncStorage.multiSet([[KEYS.authToken, token], [KEYS.user, JSON.stringify(user)]]);
}
