import { Alert, Platform } from 'react-native';
import { confirmar } from '../../src/screens/ProductAdminScreen';

jest.mock('../../src/database', () => ({}));
jest.mock('../../src/api', () => ({}));
jest.mock('../../src/reportExport', () => ({}));
jest.mock('@expo/vector-icons', () => ({ Ionicons: () => null }));
jest.mock('@react-navigation/native', () => ({ useFocusEffect: () => undefined }));

describe('confirmar', () => {
  const plataformaOriginal = Platform.OS;
  afterEach(() => {
    Platform.OS = plataformaOriginal;
    jest.restoreAllMocks();
    delete (globalThis as { window?: unknown }).window;
  });

  it.each([[true], [false]])('na web usa window.confirm com a pergunta (resposta %s)', async resposta => {
    Platform.OS = 'web';
    const confirm = jest.fn().mockReturnValue(resposta);
    (globalThis as { window?: unknown }).window = { confirm };
    const alerta = jest.spyOn(Alert, 'alert');

    await expect(confirmar('Excluir produto', 'Deseja excluir “Camisa”?')).resolves.toBe(resposta);
    expect(confirm).toHaveBeenCalledWith('Deseja excluir “Camisa”?');
    expect(alerta).not.toHaveBeenCalled();
  });

  it('no aparelho usa Alert.alert e resolve conforme o botão tocado', async () => {
    Platform.OS = 'ios';
    const alerta = jest.spyOn(Alert, 'alert').mockImplementation((_t, _m, botoes) => botoes?.find(b => b.text === 'Excluir')?.onPress?.());

    await expect(confirmar('Excluir produto', 'Deseja excluir “Camisa”?')).resolves.toBe(true);
    expect(alerta.mock.calls[0][0]).toBe('Excluir produto');
    expect(alerta.mock.calls[0][2]?.map(b => b.text)).toEqual(['Cancelar', 'Excluir']);
  });
});
