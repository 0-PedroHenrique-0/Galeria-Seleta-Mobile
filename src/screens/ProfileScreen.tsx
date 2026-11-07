import React, { useCallback, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Screen } from '../components/Screen';
import { Button } from '../components/Button';
import { getSession, getUser, setSession } from '../storage';
import { theme } from '../theme';

type User = { name: string; email: string; isAdmin?: boolean };
export function ProfileScreen({ navigation }: any) {
  const [user, setUser] = useState<User | null>(null);
  useFocusEffect(useCallback(() => {
    Promise.all([getSession(), getUser()]).then(([signedIn, data]) => setUser(signedIn ? data : null));
  }, []));
  async function logout() { await setSession(false); setUser(null); navigation.navigate('Login'); }
  const links: [string, string][] = [
    ['Meus pedidos', 'Main'], ['Meus endereços', 'Addresses'], ['Dados pessoais', 'PersonalData'],
    ['Sobre nós', 'About'], ['Fale conosco', 'Contact'],
  ];
  if (user?.isAdmin) links.splice(3, 0, ['Gerenciar produtos', 'ProductAdmin']);
  return <Screen><View style={styles.page}>
    <Text style={styles.title}>Meu perfil</Text>
    {user ? <>
      <View style={styles.card}><Text style={styles.name}>{user.name}</Text><Text style={styles.muted}>{user.email}</Text></View>
      {links.map(([label, screen]) => <Pressable key={label} style={styles.link} onPress={() => screen === 'Main'
        ? navigation.navigate('Main', { screen: 'Pedidos' }) : navigation.navigate(screen)}>
        <Text style={styles.linkText}>{label}</Text><Text style={styles.muted}>›</Text>
      </Pressable>)}
      <Pressable style={styles.link} onPress={logout}><Text style={styles.logout}>Sair da conta</Text></Pressable>
    </> : <View style={styles.card}>
      <Text style={styles.muted}>Entre para acompanhar pedidos e finalizar compras.</Text>
      <View style={{ marginTop: 18 }}><Button label="ENTRAR" onPress={() => navigation.navigate('Login')}/></View>
      <View style={{ marginTop: 10 }}><Button label="CRIAR CONTA" secondary onPress={() => navigation.navigate('Register')}/></View>
    </View>}
  </View></Screen>;
}
const styles = StyleSheet.create({
  page: { padding: 20 }, title: { color: theme.colors.text, fontFamily: theme.fonts.display, fontSize: 39 },
  card: { backgroundColor: theme.colors.surface, borderRadius: 9, padding: 16, marginTop: 24, marginBottom: 16 },
  name: { color: theme.colors.text, fontFamily: theme.fonts.display, fontSize: 24 },
  muted: { color: theme.colors.muted, fontSize: 12, marginTop: 5 },
  link: { minHeight: 56, borderBottomWidth: 1, borderBottomColor: theme.colors.line, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  linkText: { color: theme.colors.text, fontSize: 13 },
  logout: { color: theme.colors.error, fontSize: 13 },
});
