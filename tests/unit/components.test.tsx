import React from 'react';
import { ActivityIndicator, StyleSheet } from 'react-native';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { Button } from '../../src/components/Button';
import { Field } from '../../src/components/Field';
import { ProductCard } from '../../src/components/ProductCard';
import { Product } from '../../src/types';

const product: Product = {
  id: 1, categoryId: 1, category: 'Roupas', name: 'Camisa Linho', description: 'Camisa leve',
  price: 189.9, discountPrice: 149.9, stock: 10, image: 'https://exemplo.test/camisa.jpg',
};

test('Button desabilitado não dispara onPress', () => {
  const onPress = jest.fn();
  render(<Button label="ENTRAR" disabled onPress={onPress} />);
  fireEvent.press(screen.getByText('ENTRAR'));
  expect(onPress).not.toHaveBeenCalled();
});

test('Button em carregamento mostra o indicador e não dispara onPress', () => {
  const onPress = jest.fn();
  const { UNSAFE_getByType } = render(<Button label="ENTRAR" loading onPress={onPress} />);
  const indicator = UNSAFE_getByType(ActivityIndicator);
  expect(screen.queryByText('ENTRAR')).toBeNull();
  fireEvent.press(indicator);
  expect(onPress).not.toHaveBeenCalled();
});

test('Field chama onChangeText com o texto digitado', () => {
  const onChangeText = jest.fn();
  render(<Field label="E-MAIL" placeholder="seu@email.com" onChangeText={onChangeText} />);
  fireEvent.changeText(screen.getByPlaceholderText('seu@email.com'), 'maria@teste.com');
  expect(onChangeText).toHaveBeenCalledWith('maria@teste.com');
});

test('ProductCard mostra o preço promocional e o preço cheio riscado', () => {
  render(<ProductCard product={product} />);
  expect(screen.getByText(/149,90/)).toBeTruthy();
  const full = screen.getByText(/189,90/);
  expect(StyleSheet.flatten(full.props.style).textDecorationLine).toBe('line-through');
});
