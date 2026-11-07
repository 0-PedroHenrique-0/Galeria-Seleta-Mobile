import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Screen } from '../components/Screen';
import { Button } from '../components/Button';
import { Field } from '../components/Field';
import { getAddresses, saveAddresses } from '../storage';
import { Address } from '../types';
import { theme } from '../theme';

export function AddressesScreen({ navigation }: any) {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [adding, setAdding] = useState(false);
  const [street, setStreet] = useState(''), [city, setCity] = useState(''), [state, setState] = useState('');
  const [zip, setZip] = useState(''), [error, setError] = useState('');
  useEffect(() => { getAddresses().then(setAddresses); }, []);
  async function add() {
    if (street.trim().length < 5 || city.trim().length < 2 || !/^[A-Za-z]{2}$/.test(state.trim()) || !/^\d{8}$/.test(zip.replace(/\D/g, '')) || zip.replace(/\D/g, '') === '00000000') {
      setError('Informe rua e número, cidade, UF e CEP válido.');
      return;
    }
    const next = [...addresses, {
      id: `addr-${Date.now()}`, label: 'Endereço', street: street.trim(), city: city.trim(),
      state: state.trim().toUpperCase(), zip: zip.replace(/\D/g, ''), isDefault: addresses.length === 0,
    }];
    setAddresses(next); await saveAddresses(next); setAdding(false); setError('');
  }
  async function makeDefault(id: string) {
    const next = addresses.map(address => ({ ...address, isDefault: address.id === id }));
    setAddresses(next); await saveAddresses(next);
  }
  return <Screen><View style={styles.page}>
    <Text style={styles.title}>Meus endereços</Text>
    <Text style={styles.muted}>Escolha um endereço válido para receber seu pedido.</Text>
    {addresses.map(address => <View key={address.id} style={styles.card}>
      <Text style={styles.strong}>{address.street} {address.isDefault ? '· PADRÃO' : ''}</Text>
      <Text style={styles.muted}>{address.city} — {address.state} · {address.zip}</Text>
      {!address.isDefault && <Pressable onPress={() => makeDefault(address.id)}><Text style={styles.link}>TORNAR PADRÃO</Text></Pressable>}
    </View>)}
    {adding ? <View style={styles.form}>
      <Field label="RUA E NÚMERO" value={street} onChangeText={setStreet} placeholder="Rua, número"/>
      <Field label="CIDADE" value={city} onChangeText={setCity} placeholder="São Paulo"/>
      <Field label="UF" value={state} onChangeText={setState} autoCapitalize="characters" placeholder="SP"/>
      <Field label="CEP" value={zip} onChangeText={setZip} keyboardType="number-pad" placeholder="00000-000"/>
      {!!error && <Text style={styles.error}>{error}</Text>}
      <Button label="SALVAR ENDEREÇO" onPress={add}/>
    </View> : <View style={styles.form}><Button label="ADICIONAR ENDEREÇO" secondary onPress={() => setAdding(true)}/></View>}
    <View style={styles.form}><Button label="VOLTAR" secondary onPress={() => navigation.goBack()}/></View>
  </View></Screen>;
}
const styles = StyleSheet.create({
  page: { padding: 20 }, title: { color: theme.colors.text, fontFamily: theme.fonts.display, fontSize: 39 },
  muted: { color: theme.colors.muted, fontSize: 12, lineHeight: 18, marginTop: 7 },
  card: { backgroundColor: theme.colors.surface, borderRadius: 8, padding: 16, marginTop: 12 },
  strong: { color: theme.colors.text, fontSize: 13, fontWeight: '800' },
  link: { color: theme.colors.accent, fontSize: 10, fontWeight: '900', marginTop: 12 },
  form: { marginTop: 20 }, error: { color: theme.colors.error, marginBottom: 12 },
});
