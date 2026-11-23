import AsyncStorage from '@react-native-async-storage/async-storage';
import { ApiError, request } from '../../src/api';
import { saveAuth } from '../../src/storage';

const user = { id: 'u1', name: 'Maria Teste', email: 'maria@teste.com', isAdmin: false };
const fetchMock = jest.fn();

function jsonResponse(status: number, body: unknown) {
  return { ok: status >= 200 && status < 300, status, json: async () => body };
}

beforeEach(async () => {
  await AsyncStorage.clear();
  fetchMock.mockReset();
  (global as any).fetch = fetchMock;
});

test('request envia Authorization quando existe token', async () => {
  await saveAuth('token-falso', user);
  fetchMock.mockResolvedValue(jsonResponse(200, { ok: true }));
  await request('/api/me');
  const headers = fetchMock.mock.calls[0][1].headers;
  expect(headers.Authorization).toBe('Bearer token-falso');
});

test('request não envia Authorization sem token', async () => {
  fetchMock.mockResolvedValue(jsonResponse(200, { ok: true }));
  await request('/api/products');
  const headers = fetchMock.mock.calls[0][1].headers;
  expect(headers).not.toHaveProperty('Authorization');
});

test('erro da API vira ApiError com a mensagem do corpo e o status', async () => {
  fetchMock.mockResolvedValue(jsonResponse(403, { message: 'Acesso restrito.' }));
  const error = (await request('/api/admin').catch((e) => e)) as ApiError;
  expect(error).toBeInstanceOf(ApiError);
  expect(error.message).toBe('Acesso restrito.');
  expect(error.status).toBe(403);
});

test('falha de rede vira ApiError com status 0', async () => {
  fetchMock.mockRejectedValue(new TypeError('Network request failed'));
  const error = (await request('/api/products').catch((e) => e)) as ApiError;
  expect(error).toBeInstanceOf(ApiError);
  expect(error.status).toBe(0);
});
