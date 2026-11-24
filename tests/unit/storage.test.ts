import AsyncStorage from '@react-native-async-storage/async-storage';
import { Address, CartItem } from '../../src/types';
import { getAddresses, getAuthToken, getCart, getSession, getUser, saveAddresses, saveAuth, saveCart, setSession } from '../../src/storage';

const item: CartItem = { id: 1, categoryId: 1, category: 'Roupas', name: 'Camisa', description: '', price: 100, stock: 5, image: '', size: 'M', quantity: 2 };
const endereco: Address = { id: 'e1', label: 'Casa', street: 'Rua das Flores, 123', city: 'São Paulo', state: 'SP', zip: '01310100', isDefault: true };
const user = { id: 'u1', name: 'Maria Teste', email: 'maria@teste.com', isAdmin: false };

beforeEach(async () => {
  await AsyncStorage.clear();
});

test('carrinho vazio volta como lista vazia', async () => {
  expect(await getCart()).toEqual([]);
});

test('carrinho salvo é lido de volta igual', async () => {
  await saveCart([item]);
  expect(await getCart()).toEqual([item]);
});

test('lista de endereços vazia volta como lista vazia', async () => {
  expect(await getAddresses()).toEqual([]);
});

test('endereços salvos são lidos de volta iguais', async () => {
  const outro: Address = { ...endereco, id: 'e2', label: 'Trabalho', complement: 'Sala 4', isDefault: false };
  await saveAddresses([endereco, outro]);
  expect(await getAddresses()).toEqual([endereco, outro]);
});

test('getSession é falso sem token e verdadeiro depois de saveAuth', async () => {
  expect(await getSession()).toBe(false);
  await saveAuth('token-falso', user);
  expect(await getSession()).toBe(true);
});

test('setSession(false) apaga token, sessão e usuário', async () => {
  await saveAuth('token-falso', user);
  await setSession(false);
  expect(await getAuthToken()).toBeNull();
  expect(await getUser()).toBeNull();
  expect(await getSession()).toBe(false);
});
