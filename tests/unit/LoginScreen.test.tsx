import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { LoginScreen } from '../../src/screens/LoginScreen';
import { loginApi } from '../../src/api';
import { saveAuth } from '../../src/storage';

jest.mock('../../src/api', () => ({
  loginApi: jest.fn(),
  ApiError: class ApiError extends Error {
    status: number;
    constructor(message: string, status: number) { super(message); this.status = status; }
  },
}));
jest.mock('../../src/storage', () => ({
  saveAuth: jest.fn().mockResolvedValue(undefined),
}));

const { ApiError } = jest.requireMock('../../src/api');
const loginMock = loginApi as jest.Mock;
const saveAuthMock = saveAuth as jest.Mock;

function fillForm() {
  fireEvent.changeText(screen.getByPlaceholderText('seu@email.com'), 'maria@teste.com');
  fireEvent.changeText(screen.getByPlaceholderText('Sua senha'), 'senha-falsa');
}

beforeEach(() => {
  loginMock.mockReset();
  saveAuthMock.mockClear();
});

test('botão ENTRAR fica desabilitado sem e-mail e senha', () => {
  render(<LoginScreen navigation={{ navigate: jest.fn() }} />);
  fireEvent.press(screen.getByText('ENTRAR'));
  expect(loginMock).not.toHaveBeenCalled();
  expect(screen.getByText('ENTRAR')).toBeDisabled();
  fillForm();
  expect(screen.getByText('ENTRAR')).toBeEnabled();
});

test('mensagem de erro da API aparece na tela', async () => {
  loginMock.mockRejectedValue(new ApiError('E-mail ou senha inválidos.', 401));
  render(<LoginScreen navigation={{ navigate: jest.fn() }} />);
  fillForm();
  fireEvent.press(screen.getByText('ENTRAR'));
  expect(await screen.findByText('E-mail ou senha inválidos.')).toBeTruthy();
});

test('login bem-sucedido guarda a sessão e navega para o perfil', async () => {
  const result = { token: 'token-falso', user: { id: 'u1', name: 'Maria Teste', email: 'maria@teste.com', phone: '', isAdmin: false } };
  loginMock.mockResolvedValue(result);
  const navigation = { navigate: jest.fn() };
  render(<LoginScreen navigation={navigation} />);
  fillForm();
  fireEvent.press(screen.getByText('ENTRAR'));
  await waitFor(() => expect(navigation.navigate).toHaveBeenCalledWith('Main', { screen: 'Perfil' }));
  expect(loginMock).toHaveBeenCalledWith('maria@teste.com', 'senha-falsa');
  expect(saveAuthMock).toHaveBeenCalledWith('token-falso', result.user);
});
