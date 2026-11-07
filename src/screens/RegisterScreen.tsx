import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Screen } from '../components/Screen';
import { Button } from '../components/Button';
import { Field } from '../components/Field';
import { saveAuth } from '../storage';
import { registerApi } from '../api';
import { theme } from '../theme';

export function RegisterScreen({ navigation }: any) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [accepted, setAccepted] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  async function submit() {
    try {
      setBusy(true); setError('');
      const result = await registerApi(name.trim(), email.trim(), password);
      await saveAuth(result.token, result.user);
      navigation.navigate('Main', { screen: 'Perfil' });
    } catch (e) { setError(e instanceof Error ? e.message : 'Falha ao cadastrar.'); }
    finally { setBusy(false); }
  }
  return <Screen><View style={styles.page}>
    <Text style={styles.kicker}>NOVA CONTA</Text>
    <Text style={styles.title}>Crie sua conta exclusiva</Text>
    <Text style={styles.sub}>Acesse peças únicas e acompanhe seus pedidos.</Text>
    <Field label="NOME" value={name} onChangeText={setName} placeholder="Seu nome"/>
    <Field label="E-MAIL" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" placeholder="seu@email.com"/>
    <Field label="SENHA" value={password} onChangeText={setPassword} secureTextEntry placeholder="Mínimo 8 caracteres"/>
    <Field label="CONFIRMAR SENHA" value={confirm} onChangeText={setConfirm} secureTextEntry placeholder="Repita a senha"/>
    {confirm.length > 0 && password !== confirm && <Text style={styles.error}>As senhas não coincidem.</Text>}
    <Pressable onPress={() => setAccepted(v => !v)} style={styles.check}>
      <Text style={styles.checkText}>{accepted ? '☑' : '□'}  Li e aceito os Termos de Uso e a Política de Privacidade.</Text>
    </Pressable>
    {!!error && <Text style={styles.error}>{error}</Text>}
    <Button label={busy ? 'CRIANDO CONTA...' : 'CRIAR CONTA'} disabled={busy || !accepted || password.length < 8 || password !== confirm} onPress={submit}/>
    <Pressable onPress={() => navigation.navigate('Login')}><Text style={styles.loginLink}>Já tem cadastro? Entrar</Text></Pressable>
  </View></Screen>;
}

const styles = StyleSheet.create({
  page: { padding: 28 },
  kicker: { color: theme.colors.accent, fontSize: 10, fontWeight: '900', letterSpacing: 1.4 },
  title: { color: theme.colors.text, fontFamily: theme.fonts.display, fontSize: 44, lineHeight: 44, marginTop: 10 },
  sub: { color: theme.colors.muted, fontSize: 12, lineHeight: 18, marginTop: 14, marginBottom: 24 },
  check: { marginBottom: 18 }, checkText: { color: theme.colors.muted, fontSize: 11, lineHeight: 17 },
  error: { color: theme.colors.error, fontSize: 11, marginBottom: 12 },
  loginLink: { color: theme.colors.accent, textAlign: 'center', fontSize: 11, fontWeight: '700', marginTop: 18 },
});
