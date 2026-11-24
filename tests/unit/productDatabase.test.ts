import { request, getProductsApi, getProductApi } from '../../src/api';
import { createProduct, updateProduct, deleteProduct, getProducts, getProductById, ProductInput } from '../../src/productDatabase';

jest.mock('../../src/api', () => ({
  request: jest.fn(),
  getProductsApi: jest.fn(),
  getProductApi: jest.fn(),
}));

const requestMock = request as jest.Mock;
const produto: ProductInput = {
  categoryId: 1, category: 'Camisetas', name: 'Camiseta Teste', description: 'Descrição de teste',
  price: 59.9, discountPrice: null, stock: 10, image: 'https://exemplo.test/camiseta.png',
};

beforeEach(() => requestMock.mockReset());

test('createProduct chama POST /api/products com o corpo do produto e devolve o id criado', async () => {
  requestMock.mockResolvedValue({ id: 42, ...produto });
  await expect(createProduct(produto)).resolves.toBe(42);
  expect(requestMock).toHaveBeenCalledWith('/api/products', { method: 'POST', body: JSON.stringify(produto) });
});

test('updateProduct chama PUT /api/products/:id com o id na URL', async () => {
  requestMock.mockResolvedValue({ id: 7, ...produto });
  await updateProduct(7, produto);
  expect(requestMock).toHaveBeenCalledWith('/api/products/7', { method: 'PUT', body: JSON.stringify(produto) });
});

test('deleteProduct chama DELETE /api/products/:id', async () => {
  requestMock.mockResolvedValue(undefined);
  await deleteProduct(7);
  expect(requestMock).toHaveBeenCalledWith('/api/products/7', { method: 'DELETE' });
});

test('getProducts e getProductById delegam para as funções de src/api', () => {
  expect(getProducts).toBe(getProductsApi);
  expect(getProductById).toBe(getProductApi);
});
