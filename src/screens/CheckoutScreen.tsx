import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import { Screen } from '../components/Screen';
import { Button } from '../components/Button';
import { getAddresses, getCart, getSession } from '../storage';
import { createCheckout, quoteApi } from '../api';
import { Address, CartItem } from '../types';
import { theme } from '../theme';

const money = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
const newKey = () => `checkout-${Date.now()}-${Math.random().toString(36).slice(2, 12)}`;

export function CheckoutScreen({ navigation }: any) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [address, setAddress] = useState<Address | null>(null);
  const [shippingCode, setShippingCode] = useState<'standard' | 'express'>('standard');
  const [quote, setQuote] = useState<{ subtotal: number; shipping: number; discount: number; total: number } | null>(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const key = useRef(newKey());

  useEffect(() => {
    const load = async () => {
      const [cart, addresses, signedIn] = await Promise.all([getCart(), getAddresses(), getSession()]);
      setItems(cart);
      setAddress(addresses.find(a => a.isDefault) || addresses[0] || null);
      if (!signedIn) setError('Entre na sua conta para finalizar a compra.');
    };
    load().catch(e => setError(e instanceof Error ? e.message : 'Falha ao carregar o checkout.'));
    const unsubscribe = navigation.addListener('focus', load);
    return unsubscribe;
  }, [navigation]);

  useEffect(() => {
    if (!items.length) return;
    let active = true;
    key.current = newKey();
    setQuote(null);
    quoteApi(items, shippingCode).then(result => { if (active) { setQuote(result); setError(''); } })
      .catch(e => { if (active) setError(e instanceof Error ? e.message : 'Falha ao calcular o pedido.'); });
    return () => { active = false; };
  }, [items, shippingCode]);

  async function pay() {
    if (!address || !quote || busy) return;
    try {
      setBusy(true); setError('');
      const session = await createCheckout(items, address, shippingCode, key.current);
      navigation.navigate('OrderDetail', { orderId: session.orderId });
      await WebBrowser.openBrowserAsync(session.checkoutUrl);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Não foi possível iniciar o pagamento.');
    } finally { setBusy(false); }
  }

  return <Screen><View style={styles.page}>
    <Text style={styles.kicker}>GALERIA SELETA</Text>
    <Text style={styles.title}>Finalizar compra</Text>
    <Text style={styles.section}>ENTREGA</Text>
    <View style={styles.card}>
      {address ? <>
        <Text style={styles.strong}>{address.street}</Text>
        <Text style={styles.muted}>{address.city} — {address.state} · {address.zip}</Text>
      </> : <Text style={styles.muted}>Cadastre um endereço de entrega.</Text>}
      <Pressable onPress={() => navigation.navigate('Addresses')}><Text style={styles.link}>ALTERAR ENDEREÇO</Text></Pressable>
    </View>
    <Text style={styles.section}>FRETE</Text>
    <Option label="Padrão · 5–7 dias" value={money(29.9)} selected={shippingCode === 'standard'} onPress={() => setShippingCode('standard')}/>
    <Option label="Expresso · 1–3 dias" value={money(54.9)} selected={shippingCode === 'express'} onPress={() => setShippingCode('express')}/>
    <Text style={styles.section}>RESUMO</Text>
    <View style={styles.card}>
      {quote ? <>
        <Row label="Subtotal" value={money(quote.subtotal)}/>
        <Row label="Frete" value={money(quote.shipping)}/>
        <View style={styles.divider}/>
        <Row label="Total" value={money(quote.total)} strong/>
      </> : <ActivityIndicator color={theme.colors.accent}/>}
    </View>
    <Text style={styles.muted}>Pix, cartão e boleto são escolhidos no ambiente seguro do Mercado Pago. O pedido será confirmado após a aprovação do pagamento.</Text>
    {!!error && <Text style={styles.error}>{error}</Text>}
    <Button label={busy ? 'ABRINDO PAGAMENTO...' : 'PAGAR COM MERCADO PAGO'} disabled={busy || !quote || !items.length || !address} onPress={pay}/>
    {error.includes('Entre na sua conta') && <View style={{ marginTop: 12 }}><Button label="ENTRAR" secondary onPress={() => navigation.navigate('Login')}/></View>}
  </View></Screen>;
}
function Option({ label, value, selected, onPress }: { label: string; value: string; selected: boolean; onPress: () => void }) {
  return <Pressable onPress={onPress} style={[styles.option, selected && styles.optionActive]}>
    <Text style={styles.optionText}>{selected ? '◉' : '○'}  {label}</Text><Text style={styles.optionText}>{value}</Text>
  </Pressable>;
}
function Row({ label, value, strong = false }: { label: string; value: string; strong?: boolean }) {
  return <View style={styles.row}><Text style={[styles.muted, strong && styles.strong]}>{label}</Text><Text style={[styles.muted, strong && styles.total]}>{value}</Text></View>;
}
const styles = StyleSheet.create({
  page: { padding: 20 }, kicker: { color: theme.colors.accent, fontSize: 10, fontWeight: '900', letterSpacing: 1.4 },
  title: { color: theme.colors.text, fontFamily: theme.fonts.display, fontSize: 42, marginTop: 8, marginBottom: 14 },
  section: { color: theme.colors.accent, fontSize: 10, fontWeight: '900', letterSpacing: 1.3, marginTop: 24, marginBottom: 10 },
  card: { backgroundColor: theme.colors.surface, borderRadius: 8, padding: 17, gap: 10 },
  strong: { color: theme.colors.text, fontWeight: '900', fontSize: 13 },
  muted: { color: theme.colors.muted, fontSize: 12, lineHeight: 19, marginTop: 10 },
  link: { color: theme.colors.accent, fontSize: 10, fontWeight: '900', marginTop: 12 },
  option: { minHeight: 50, backgroundColor: theme.colors.surface2, borderRadius: 6, paddingHorizontal: 13, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  optionActive: { borderWidth: 1, borderColor: theme.colors.accent },
  optionText: { color: theme.colors.text, fontSize: 11, fontWeight: '700' },
  divider: { height: 1, backgroundColor: theme.colors.surface2 },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  total: { color: theme.colors.accent, fontFamily: theme.fonts.display, fontSize: 23 },
  error: { color: theme.colors.error, fontSize: 12, marginVertical: 14 },
});
