import React, { useCallback, useEffect, useState } from 'react';
import { AppState, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import * as WebBrowser from 'expo-web-browser';
import { Screen } from '../components/Screen';
import { Button } from '../components/Button';
import { getOrderApi, reconcileOrderApi } from '../api';
import { saveCart } from '../storage';
import { Order } from '../types';
import { theme } from '../theme';

const money = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
export function OrderDetailScreen({ route, navigation }: any) {
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState('');
  const paymentId = route.params?.payment_id ? String(route.params.payment_id) : '';
  const returned = Boolean(route.params?.result);
  const load = useCallback(async () => {
    try {
      let result: Order;
      if (paymentId) {
        try { result = await reconcileOrderApi(route.params.orderId, paymentId); }
        catch { result = await getOrderApi(route.params.orderId); }
      } else result = await getOrderApi(route.params.orderId);
      setOrder(result); setError('');
      if (result.paymentStatus === 'APROVADO') {
        await saveCart([]);
        if (returned) navigation.replace('OrderSuccess', { orderId: result.id });
      }
    } catch (e) { setError(e instanceof Error ? e.message : 'Falha ao carregar o pedido.'); }
  }, [route.params.orderId, paymentId, returned, navigation]);
  useFocusEffect(useCallback(() => { load(); }, [load]));
  useEffect(() => {
    const subscription = AppState.addEventListener('change', state => { if (state === 'active') load(); });
    return () => subscription.remove();
  }, [load]);
  if (!order) return <Screen><View style={styles.page}><Text style={styles.muted}>{error || 'Carregando pedido...'}</Text><Button label="TENTAR NOVAMENTE" onPress={load}/>{!!error && <View style={{ marginTop: 10 }}><Button label="ENTRAR" secondary onPress={() => navigation.navigate('Login')}/></View>}</View></Screen>;
  return <Screen><View style={styles.page}>
    <Text style={styles.kicker}>PEDIDO {order.id.slice(0, 8).toUpperCase()}</Text>
    <Text style={styles.title}>Detalhes do pedido</Text>
    <Text style={styles.muted}>Criado em {new Date(order.date).toLocaleDateString('pt-BR')}</Text>
    <View style={styles.card}><Text style={styles.kicker}>PAGAMENTO</Text>
      <Text style={styles.status}>{order.paymentStatus.replace(/_/g, ' ')}</Text>
      <Text style={styles.muted}>{order.paymentStatus === 'APROVADO' ? 'Pagamento confirmado.' :
        order.paymentStatus === 'REVISAO_MANUAL' ? 'Pagamento recebido. Nossa equipe precisa conferir o estoque.' :
        'A confirmação pode levar alguns instantes. Atualize para consultar o estado.'}</Text>
    </View>
    <Button label="ATUALIZAR STATUS" secondary onPress={load}/>
    {order.checkoutUrl && ['AGUARDANDO_PAGAMENTO', 'EM_ANALISE'].includes(order.paymentStatus) &&
      <View style={{ marginTop: 10 }}><Button label="ABRIR PAGAMENTO" onPress={() => WebBrowser.openBrowserAsync(order.checkoutUrl!)}/></View>}
    <Text style={styles.section}>ITENS</Text>
    {order.items.map(item => <View key={`${item.id}-${item.size}`} style={styles.item}>
      <View style={{ flex: 1 }}><Text style={styles.strong}>{item.name}</Text><Text style={styles.muted}>{item.quantity} × {money(item.price)} · Tamanho {item.size}</Text></View>
      <Text style={styles.strong}>{money(item.price * item.quantity)}</Text>
    </View>)}
    <Text style={styles.section}>ENTREGA</Text>
    <View style={styles.card}><Text style={styles.strong}>{order.address.street}</Text><Text style={styles.muted}>{order.address.city} — {order.address.state} · {order.address.zip}</Text></View>
    <View style={styles.totalRow}><Text style={styles.strong}>TOTAL</Text><Text style={styles.total}>{money(order.total)}</Text></View>
    {!!error && <Text style={styles.error}>{error}</Text>}
  </View></Screen>;
}
const styles = StyleSheet.create({
  page: { padding: 20 }, kicker: { color: theme.colors.accent, fontSize: 10, fontWeight: '900', letterSpacing: 1.2 },
  title: { color: theme.colors.text, fontFamily: theme.fonts.display, fontSize: 36, marginTop: 8 },
  muted: { color: theme.colors.muted, fontSize: 11, lineHeight: 18, marginTop: 6, marginBottom: 10 },
  card: { backgroundColor: theme.colors.surface, borderRadius: 9, padding: 16, marginTop: 18, marginBottom: 14 },
  status: { color: theme.colors.text, fontFamily: theme.fonts.display, fontSize: 24, marginTop: 8 },
  section: { color: theme.colors.muted, fontSize: 10, fontWeight: '900', letterSpacing: 1.2, marginTop: 25, marginBottom: 10 },
  item: { backgroundColor: theme.colors.surface, borderRadius: 8, padding: 15, flexDirection: 'row', marginBottom: 8 },
  strong: { color: theme.colors.text, fontSize: 12, fontWeight: '800' },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 26 },
  total: { color: theme.colors.accent, fontFamily: theme.fonts.display, fontSize: 25 },
  error: { color: theme.colors.error, marginTop: 16 },
});
