import test from 'node:test';
import assert from 'node:assert/strict';
import { HttpError, toCents, validateProduct, validateAddress, quote } from '../src/rules.js';

const product = { id: 1, name: 'Moletom', price_cents: 18990, discount_price_cents: 14990, stock: 10, image: 'x' };
const findProduct = id => (id === 1 ? product : undefined);
const findFullPrice = id => (id === 1 ? { ...product, discount_price_cents: null } : undefined);
const validBody = { name: 'Moletom', category: 'Inverno', description: 'Moletom de algodão', image: 'x.jpg', categoryId: 2, stock: 5, price: 189.9, discountPrice: 149.9 };
const validAddress = { street: 'Av. Paulista, 1000', city: 'São Paulo', state: 'sp', zip: '01310-100', complement: ' Apto 1 ' };
const status = code => err => err instanceof HttpError && err.status === code;

test('toCents arredonda reais para centavos', () => {
  assert.equal(toCents(189.9), 18990);
  assert.equal(toCents('10.5'), 1050);
  assert.ok(Number.isNaN(toCents('abc')));
});

test('validateProduct aceita produto completo', () => {
  assert.deepEqual(validateProduct(validBody), {
    name: 'Moletom', category: 'Inverno', description: 'Moletom de algodão', image: 'x.jpg',
    categoryId: 2, stock: 5, price: 18990, discount: 14990,
  });
  assert.equal(validateProduct({ ...validBody, discountPrice: '' }).discount, null);
});

test('validateProduct recusa desconto maior que o preço', () => {
  assert.throws(() => validateProduct({ ...validBody, discountPrice: 200 }), status(400));
});

test('validateProduct recusa estoque negativo e categoria zero', () => {
  assert.throws(() => validateProduct({ ...validBody, stock: -1 }), status(400));
  assert.throws(() => validateProduct({ ...validBody, categoryId: 0 }), status(400));
});

test('validateAddress normaliza estado e limpa o CEP', () => {
  const a = validateAddress(validAddress);
  assert.equal(a.state, 'SP');
  assert.equal(a.zip, '01310100');
  assert.equal(a.complement, 'Apto 1');
});

test('validateAddress recusa CEP com menos de oito dígitos e CEP zerado', () => {
  assert.throws(() => validateAddress({ ...validAddress, zip: '1234567' }), status(400));
  assert.throws(() => validateAddress({ ...validAddress, zip: '00000-000' }), status(400));
});

test('quote usa o preço do banco e ignora o preço enviado pelo cliente', () => {
  const q = quote({ shippingCode: 'standard', items: [{ id: 1, size: 'M', quantity: 1, price: 0.01, unit_price_cents: 1 }] }, findProduct);
  assert.equal(q.items[0].unit_price_cents, 14990);
  assert.equal(q.totalCents / 100, 179.8);
});

test('quote aplica o preço promocional quando existe', () => {
  const item = { id: 1, size: 'M', quantity: 2 };
  assert.equal(quote({ shippingCode: 'express', items: [item] }, findProduct).subtotalCents, 29980);
  const full = quote({ shippingCode: 'express', items: [item] }, findFullPrice);
  assert.equal(full.items[0].unit_price_cents, 18990);
  assert.equal(full.totalCents, 37980 + 5490);
});

test('quote recusa frete desconhecido, item duplicado e quantidade acima de 20', () => {
  const item = { id: 1, size: 'M', quantity: 1 };
  assert.throws(() => quote({ shippingCode: 'teleporte', items: [item] }, findProduct), status(400));
  assert.throws(() => quote({ shippingCode: 'standard', items: [item, item] }, findProduct), status(400));
  assert.throws(() => quote({ shippingCode: 'standard', items: [{ ...item, quantity: 21 }] }, findProduct), status(400));
});

test('quote devolve 409 quando o estoque é insuficiente', () => {
  assert.throws(() => quote({ shippingCode: 'standard', items: [{ id: 1, size: 'M', quantity: 11 }] }, findProduct), status(409));
  assert.throws(() => quote({ shippingCode: 'standard', items: [{ id: 99, size: 'M', quantity: 1 }] }, findProduct), status(409));
});
