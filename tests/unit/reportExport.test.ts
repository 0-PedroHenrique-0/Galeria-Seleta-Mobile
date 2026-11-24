import { Platform } from 'react-native';
import * as Sharing from 'expo-sharing';
import { exportSalesReport } from '../../src/reportExport';
import type { SalesReport } from '../../src/api';

const mockWrite = jest.fn();
const mockCreate = jest.fn();
const mockFiles: { parent: unknown; name: string }[] = [];

jest.mock('expo-file-system', () => ({
  Paths: { document: 'DOC_DIR' },
  File: jest.fn().mockImplementation((parent: unknown, name: string) => {
    mockFiles.push({ parent, name });
    return { uri: `file:///docs/${name}`, create: mockCreate, write: mockWrite };
  }),
}));
jest.mock('expo-sharing', () => ({
  isAvailableAsync: jest.fn().mockResolvedValue(true),
  shareAsync: jest.fn().mockResolvedValue(undefined),
}));

const report: SalesReport = {
  geradoEm: '2026-11-23T12:00:00.000Z',
  periodo: { de: null, ate: null },
  resumo: { pedidos: 2, faturamento: 660, ticketMedio: 330, itensVendidos: 7, clientes: 2 },
  porDia: [{ data: '2026-11-10', pedidos: 1, faturamento: 370 }],
  porCategoria: [{ categoria: 'Moletons', itens: 2, faturamento: 300 }],
  porStatus: [{ status: 'APROVADO', pedidos: 2 }],
  produtos: [{ id: 9001, nome: 'Moletom Teste', itens: 2, faturamento: 300 }],
};

const originalOS = Platform.OS;
afterEach(() => { Object.defineProperty(Platform, 'OS', { value: originalOS, configurable: true }); });
beforeEach(() => { jest.clearAllMocks(); mockFiles.length = 0; });

test('no dispositivo grava o arquivo e abre o compartilhamento', async () => {
  Object.defineProperty(Platform, 'OS', { value: 'android', configurable: true });
  const name = await exportSalesReport(report);
  expect(name).toBe('vendas-galeria-seleta-2026-11-23.json');
  expect(mockFiles[0]).toEqual({ parent: 'DOC_DIR', name });
  expect(mockCreate).toHaveBeenCalledWith({ overwrite: true });
  expect(JSON.parse(mockWrite.mock.calls[0][0])).toEqual(report);
  expect(mockWrite.mock.calls[0][0]).toContain('\n  "geradoEm"');
  expect(Sharing.shareAsync).toHaveBeenCalledWith(`file:///docs/${name}`, expect.objectContaining({ mimeType: 'application/json' }));
});

test('no dispositivo sem compartilhamento ainda grava e devolve o nome', async () => {
  Object.defineProperty(Platform, 'OS', { value: 'ios', configurable: true });
  (Sharing.isAvailableAsync as jest.Mock).mockResolvedValueOnce(false);
  const name = await exportSalesReport(report);
  expect(name).toBe('vendas-galeria-seleta-2026-11-23.json');
  expect(mockWrite).toHaveBeenCalled();
  expect(Sharing.shareAsync).not.toHaveBeenCalled();
});

test('na web dispara o download com o nome esperado', async () => {
  Object.defineProperty(Platform, 'OS', { value: 'web', configurable: true });
  const anchor = { href: '', download: '', click: jest.fn(), remove: jest.fn() };
  const g = globalThis as any;
  const original = { document: g.document, URL: g.URL };
  g.document = { createElement: jest.fn().mockReturnValue(anchor), body: { appendChild: jest.fn() } };
  const createObjectURL = jest.fn().mockReturnValue('blob:abc');
  const revokeObjectURL = jest.fn();
  g.URL = Object.assign(function URL() {}, { createObjectURL, revokeObjectURL });
  try {
    const name = await exportSalesReport(report);
    expect(name).toBe('vendas-galeria-seleta-2026-11-23.json');
    expect(anchor.download).toBe(name);
    expect(anchor.href).toBe('blob:abc');
    expect(anchor.click).toHaveBeenCalledTimes(1);
    expect(createObjectURL.mock.calls[0][0]).toBeInstanceOf(Blob);
    expect(mockWrite).not.toHaveBeenCalled();
  } finally {
    g.document = original.document; g.URL = original.URL;
  }
});

test('nome do arquivo tem a data do relatório', async () => {
  Object.defineProperty(Platform, 'OS', { value: 'android', configurable: true });
  const name = await exportSalesReport({ ...report, geradoEm: '2027-01-05T08:00:00.000Z' });
  expect(name).toBe('vendas-galeria-seleta-2027-01-05.json');
});

test('nome do arquivo usa a data de Brasília, não a UTC', async () => {
  Object.defineProperty(Platform, 'OS', { value: 'android', configurable: true });
  const name = await exportSalesReport({ ...report, geradoEm: '2026-11-21T01:30:00.000Z' });
  expect(name).toBe('vendas-galeria-seleta-2026-11-20.json');
});
