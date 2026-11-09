import React, { useCallback, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Screen } from '../components/Screen';
import { getOrdersApi } from '../api';
import { Order } from '../types';
import { theme } from '../theme';

const money = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
export function OrdersScreen({ navigation }: any) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [error, setError] = useState('');
  useFocusEffect(useCallback(() => {
    getOrdersApi().then(setOrders).catch(e => setError(e instanceof Error ? e.message : 'Falha ao carregar pedidos.'));
  }, []));
  return <Screen><View style={styles.page}>
    <Text style={styles.title}>Meus pedidos</Text>
    {!!error && <Text style={styles.error}>{error}</Text>}
    {orders.length === 0 ? <Text style={styles.muted}>Seus pedidos aparecerão aqui após iniciar uma compra.</Text> :
      <View style={styles.list}>{orders.map(order =>
        <Pressable key={order.id} style={styles.card} onPress={() => navigation.navigate('OrderDetail', { orderId: order.id })}>
          <Text style={styles.id}>Pedido {order.id.slice(0, 8).toUpperCase()}</Text>
          <Text style={styles.muted}>{new Date(order.date).toLocaleDateString('pt-BR')}</Text>
          <View style={styles.row}><Text style={styles.status}>{order.paymentStatus.replace(/_/g, ' ')}</Text><Text style={styles.total}>{money(order.total)}</Text></View>
        </Pressable>)}</View>}
  </View></Screen>;
}
const styles = StyleSheet.create({
  page: { padding: 20 }, title: { color: theme.colors.text, fontFamily: theme.fonts.display, fontSize: 39 },
  list: { gap: 12, marginTop: 22 }, card: { backgroundColor: theme.colors.surface, borderRadius: 9, padding: 16 },
  id: { color: theme.colors.text, fontSize: 13, fontWeight: '800' },
  muted: { color: theme.colors.muted, fontSize: 11, marginTop: 8 }, error: { color: theme.colors.error, marginTop: 18 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 16 },
  status: { color: theme.colors.accent, fontSize: 9, fontWeight: '900' },
  total: { color: theme.colors.accent, fontFamily: theme.fonts.display, fontSize: 20 },
});
