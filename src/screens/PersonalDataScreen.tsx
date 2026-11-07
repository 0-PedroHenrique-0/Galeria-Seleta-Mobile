import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Screen } from '../components/Screen';
import { Button } from '../components/Button';
import { Field } from '../components/Field';
import { updateProfileApi } from '../api';
import { getUser, saveUser } from '../storage';
import { theme } from '../theme';

export function PersonalDataScreen() {
  const [name, setName] = useState(''), [email, setEmail] = useState(''), [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  useEffect(() => { getUser().then(user => { if (user) { setName(user.name); setEmail(user.email); setPhone(user.phone ?? ''); } }); }, []);
  async function save() {
    try {
      const user = await updateProfileApi(name, phone);
      await saveUser(user);
      setMessage('Dados salvos.');
    } catch (e) { setMessage(e instanceof Error ? e.message : 'Falha ao salvar.'); }
  }
  return <Screen><View style={styles.page}>
    <Text style={styles.title}>Dados pessoais</Text>
    <Text style={styles.sub}>Seu e-mail de acesso: {email}</Text>
    <Field label="NOME" value={name} onChangeText={setName} placeholder="Seu nome"/>
    <Field label="TELEFONE" value={phone} onChangeText={setPhone} keyboardType="phone-pad" placeholder="(11) 90000-0000"/>
    {!!message && <Text style={styles.sub}>{message}</Text>}
    <Button label="SALVAR ALTERAÇÕES" onPress={save}/>
  </View></Screen>;
}
const styles = StyleSheet.create({
  page: { padding: 20 }, title: { color: theme.colors.text, fontFamily: theme.fonts.display, fontSize: 39 },
  sub: { color: theme.colors.muted, fontSize: 12, marginTop: 7, marginBottom: 20 },
});
