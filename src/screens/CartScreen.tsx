import React, { useCallback, useState } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '../components/Screen';
import { Header } from '../components/Header';
import { Button } from '../components/Button';
import { CartItem } from '../types';
import { getCart, saveCart } from '../storage';
import { theme } from '../theme';

const money = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
export function CartScreen({ navigation }: any) {
  const [items, setItems] = useState<CartItem[]>([]);
  useFocusEffect(useCallback(() => { getCart().then(setItems); }, []));
  async function update(next: CartItem[]) { setItems(next); await saveCart(next); }
  const change = (id: number, size: string | undefined, delta: number) =>
    update(items.map(item => item.id === id && item.size === size
      ? { ...item, quantity: Math.max(1, Math.min(item.stock, item.quantity + delta)) } : item));
  const remove = (id: number, size: string | undefined) =>
    update(items.filter(item => !(item.id === id && item.size === size)));
  const subtotal = items.reduce((sum, item) => sum + (item.discountPrice ?? item.price) * item.quantity, 0);
  return <Screen><Header navigation={navigation} onSearch={() => navigation.navigate('Search')}/><View style={styles.page}>
    <Text style={styles.title}>Sacola de compras</Text>
    {!items.length ? <View style={styles.empty}>
      <Ionicons name="bag-handle-outline" size={42} color={theme.colors.accent}/>
      <Text style={styles.emptyTitle}>Sua sacola está vazia</Text>
      <Button label="VER PRODUTOS" onPress={() => navigation.navigate('Main', { screen: 'Produtos' })}/>
    </View> : <>
      <View style={styles.items}>{items.map(item => <View key={`${item.id}-${item.size}`} style={styles.item}>
        <Image source={{ uri: item.image }} style={styles.image}/>
        <View style={styles.info}>
          <View style={styles.row}><Text numberOfLines={2} style={styles.name}>{item.name}</Text>
            <Pressable onPress={() => remove(item.id, item.size)}><Ionicons name="close" size={18} color={theme.colors.muted}/></Pressable></View>
          <Text style={styles.muted}>Tamanho {item.size}</Text>
          <Text style={styles.price}>{money((item.discountPrice ?? item.price) * item.quantity)}</Text>
          <View style={styles.quantity}>
            <Pressable onPress={() => change(item.id, item.size, -1)}><Ionicons name="remove" size={16} color={theme.colors.text}/></Pressable>
            <Text style={styles.name}>{item.quantity}</Text>
            <Pressable onPress={() => change(item.id, item.size, 1)}><Ionicons name="add" size={16} color={theme.colors.text}/></Pressable>
          </View>
        </View>
      </View>)}</View>
      <View style={styles.summary}><Text style={styles.muted}>Subtotal: {money(subtotal)}</Text>
        <Text style={styles.muted}>O frete e o total serão confirmados no checkout.</Text></View>
      <Button label="FINALIZAR COMPRA" onPress={() => navigation.navigate('Checkout')}/>
    </>}
  </View></Screen>;
}
const styles = StyleSheet.create({
  page: { padding: 16 }, title: { color: theme.colors.text, fontFamily: theme.fonts.display, fontSize: 38 },
  items: { gap: 12, marginTop: 22 }, item: { backgroundColor: theme.colors.surface, borderRadius: 9, padding: 12, flexDirection: 'row' },
  image: { width: 90, height: 114, borderRadius: 5, backgroundColor: theme.colors.surface2 },
  info: { flex: 1, paddingLeft: 13 }, row: { flexDirection: 'row', justifyContent: 'space-between' },
  name: { color: theme.colors.text, fontSize: 12, fontWeight: '800', flexShrink: 1 },
  muted: { color: theme.colors.muted, fontSize: 11, marginTop: 7, lineHeight: 18 },
  price: { color: theme.colors.accent, fontFamily: theme.fonts.display, fontSize: 21, marginTop: 10 },
  quantity: { width: 96, height: 34, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around', marginTop: 8, borderWidth: 1, borderColor: theme.colors.surface2 },
  summary: { backgroundColor: theme.colors.surface, padding: 17, borderRadius: 8, marginTop: 20, marginBottom: 16 },
  empty: { gap: 20, alignItems: 'center', paddingTop: 90 },
  emptyTitle: { color: theme.colors.text, fontFamily: theme.fonts.display, fontSize: 28 },
});
