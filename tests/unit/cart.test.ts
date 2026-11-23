import { CartItem } from '../../src/types';
import { cartSubtotal, changeQuantity, money, removeItem } from '../../src/cart';

const base = { categoryId: 1, category: 'Roupas', description: '', image: '' };
const promo: CartItem = { ...base, id: 1, name: 'Camisa', price: 189.9, discountPrice: 149.9, stock: 10, size: 'M', quantity: 2 };
const regular: CartItem = { ...base, id: 2, name: 'Calça', price: 99.9, stock: 5, size: 'G', quantity: 1 };

test('money formata em real brasileiro', () => {
  const text = money(149.9);
  expect(text).toContain('R$');
  expect(text).toContain('149,90');
});

test('subtotal usa o preço promocional quando existe', () => {
  expect(cartSubtotal([promo, regular])).toBeCloseTo(399.7, 2);
});

test('subtotal de carrinho vazio é zero', () => {
  expect(cartSubtotal([])).toBe(0);
});

test('changeQuantity respeita o estoque como teto', () => {
  const full = { ...promo, quantity: 10 };
  expect(changeQuantity([full], 1, 'M', 1)[0].quantity).toBe(10);
});

test('changeQuantity nunca desce abaixo de 1', () => {
  const one = { ...promo, quantity: 1 };
  expect(changeQuantity([one], 1, 'M', -1)[0].quantity).toBe(1);
});

test('changeQuantity só altera o item do mesmo id e tamanho', () => {
  const otherSize = { ...promo, size: 'G' };
  const result = changeQuantity([promo, otherSize, regular], 1, 'M', 1);
  expect(result[0].quantity).toBe(3);
  expect(result[1].quantity).toBe(2);
  expect(result[2].quantity).toBe(1);
});

test('removeItem remove apenas a combinação de id e tamanho', () => {
  const otherSize = { ...promo, size: 'G' };
  const result = removeItem([promo, otherSize, regular], 1, 'M');
  expect(result).toEqual([otherSize, regular]);
});
