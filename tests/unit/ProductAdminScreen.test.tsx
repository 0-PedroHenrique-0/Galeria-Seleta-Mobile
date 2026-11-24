import React from 'react';
import { fireEvent, render, screen, waitFor, act } from '@testing-library/react-native';
import { ProductAdminScreen } from '../../src/screens/ProductAdminScreen';
import { getSalesReportApi } from '../../src/api';
import { exportSalesReport } from '../../src/reportExport';

jest.mock('../../src/database', () => ({
  getProducts: jest.fn().mockResolvedValue([]),
  createProduct: jest.fn(),
  updateProduct: jest.fn(),
  deleteProduct: jest.fn(),
}));
jest.mock('../../src/api', () => ({
  getSalesReportApi: jest.fn(),
  ApiError: class ApiError extends Error {
    status: number;
    constructor(message: string, status: number) { super(message); this.status = status; }
  },
}));
jest.mock('@expo/vector-icons', () => ({ Ionicons: () => null }));
jest.mock('../../src/reportExport', () => ({ exportSalesReport: jest.fn() }));
jest.mock('@react-navigation/native', () => {
  const React = require('react');
  return { useFocusEffect: (cb: () => void) => React.useEffect(cb, [cb]) };
});

const { ApiError } = jest.requireMock('../../src/api');
const reportMock = getSalesReportApi as jest.Mock;
const exportMock = exportSalesReport as jest.Mock;
const navigation = { goBack: jest.fn() };

beforeEach(() => { jest.clearAllMocks(); });

test('botão de exportar aparece na tela de gerenciar produtos', async () => {
  render(<ProductAdminScreen navigation={navigation} />);
  expect(await screen.findByText('EXPORTAR DADOS (JSON)')).toBeTruthy();
});

test('ao exportar, mostra estado de geração e depois a confirmação com o nome do arquivo', async () => {
  let resolveReport!: (value: unknown) => void;
  reportMock.mockReturnValue(new Promise(resolve => { resolveReport = resolve; }));
  exportMock.mockResolvedValue('vendas-galeria-seleta-2026-11-23.json');
  render(<ProductAdminScreen navigation={navigation} />);

  fireEvent.press(await screen.findByText('EXPORTAR DADOS (JSON)'));
  await waitFor(() => expect(screen.queryByText('EXPORTAR DADOS (JSON)')).toBeNull());
  expect(screen.getByText('Gerando arquivo...')).toBeTruthy();

  await act(async () => { resolveReport({ geradoEm: '2026-11-23T12:00:00.000Z' }); });
  expect(await screen.findByText(/vendas-galeria-seleta-2026-11-23\.json/)).toBeTruthy();
  expect(exportMock).toHaveBeenCalledWith({ geradoEm: '2026-11-23T12:00:00.000Z' });
  expect(screen.getByText('EXPORTAR DADOS (JSON)')).toBeTruthy();
});

test('sessão expirada mostra a mensagem da API e o botão volta a ficar disponível', async () => {
  reportMock.mockRejectedValue(new ApiError('Sessão expirada. Entre novamente.', 401));
  render(<ProductAdminScreen navigation={navigation} />);

  fireEvent.press(await screen.findByText('EXPORTAR DADOS (JSON)'));
  expect(await screen.findByText('Sessão expirada. Entre novamente.')).toBeTruthy();
  expect(screen.getByText('EXPORTAR DADOS (JSON)')).toBeTruthy();
  expect(screen.queryByText('Gerando arquivo...')).toBeNull();
  expect(exportMock).not.toHaveBeenCalled();
});
