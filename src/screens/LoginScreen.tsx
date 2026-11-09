import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Screen } from '../components/Screen';
import { Button } from '../components/Button';
import { Field } from '../components/Field';
import { loginApi } from '../api';
import { saveAuth } from '../storage';
import { theme } from '../theme';

export function LoginScreen({ navigation }: any) {
  const [email, setEmail] = useState(''), [password, setPassword] = useState('');
  const [error, setError] = useState(''), [busy, setBusy] = useState(false);
  async function login() {
    try {
      setBusy(true); setError('');
      const result = await loginApi(email.trim(), password);
      await saveAuth(result.token, result.user);
      navigation.navigate('Main', { screen: 'Perfil' });
    } catch (e) { setError(e instanceof Error ? e.message : 'Falha ao entrar.'); }
    finally { setBusy(false); }
  }
  return <Screen><View style={styles.page}>
    <Text style={styles.kicker}>GALERIA SELETA</Text>
    <Text style={styles.editorialTitle}>Seu estilo, sua identidade</Text>
    <View style={styles.line}/>
    <Text style={styles.title}>Entrar</Text>
    <Field label="E-MAIL" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" placeholder="seu@email.com"/>
    <Field label="SENHA" value={password} onChangeText={setPassword} secureTextEntry placeholder="Sua senha"/>
    {!!error && <Text style={styles.error}>{error}</Text>}
    <Button label={busy ? 'ENTRANDO...' : 'ENTRAR'} disabled={busy || !email || !password} onPress={login}/>
    <Pressable onPress={() => navigation.navigate('Register')}><Text style={styles.link}>Criar uma conta</Text></Pressable>
  </View></Screen>;
}
const styles = StyleSheet.create({
  page: { padding: 28 }, kicker: { color: theme.colors.accent, fontSize: 10, fontWeight: '900', letterSpacing: 1.4 },
  editorialTitle: { color: theme.colors.text, fontFamily: theme.fonts.display, fontSize: 47, lineHeight: 46, marginTop: 12 },
  line: { width: 72, height: 2, backgroundColor: theme.colors.accent, marginTop: 24 },
  title: { color: theme.colors.text, fontFamily: theme.fonts.display, fontSize: 36, marginTop: 28, marginBottom: 24 },
  error: { color: theme.colors.error, fontSize: 11, marginBottom: 12 },
  link: { color: theme.colors.accent, textAlign: 'center', fontSize: 11, marginTop: 20 },
});
