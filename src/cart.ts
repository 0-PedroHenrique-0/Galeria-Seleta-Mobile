import { CartItem } from './types';

export const money = (value: number): string =>
  value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

export const cartSubtotal = (items: CartItem[]): number =>
  items.reduce((sum, item) => sum + (item.discountPrice ?? item.price) * item.quantity, 0);

export const changeQuantity = (items: CartItem[], id: number, size: string | undefined, delta: number): CartItem[] =>
  items.map(item => item.id === id && item.size === size
    ? { ...item, quantity: Math.max(1, Math.min(item.stock, item.quantity + delta)) }
    : item);

export const removeItem = (items: CartItem[], id: number, size: string | undefined): CartItem[] =>
  items.filter(item => !(item.id === id && item.size === size));
