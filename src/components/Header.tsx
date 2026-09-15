import React, { useEffect, useState } from 'react';
import { Image, Modal, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { theme, shadow } from '../theme';
import { getCart, getSession } from '../storage';

export function Header({ navigation, onSearch, showSearch = true }: {
  navigation: any; onSearch?: () => void; showSearch?: boolean;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [logged, setLogged] = useState(false);

  const refresh = async () => {
    const [cart, session] = await Promise.all([getCart(), getSession()]);
    setCartCount(cart.reduce((sum, item) => sum + item.quantity, 0));
    setLogged(session);
  };
  useFocusEffect(React.useCallback(() => { refresh(); }, []));
  useEffect(() => { if (!menuOpen) refresh(); }, [menuOpen]);

  const root = navigation.getParent?.() ?? navigation;
  const go = (screen: string, params?: any) => { setMenuOpen(false); root.navigate(screen, params); };

  return (
    <>
      <View style={styles.wrap}>
        <View style={styles.top}>
          <Pressable onPress={() => setMenuOpen(true)} hitSlop={10} style={styles.iconButton}>
            <Ionicons name="menu-outline" size={25} color={theme.colors.text} />
          </Pressable>

          <Pressable onPress={() => go('Main', { screen: 'Início' })} style={styles.logo}>
            <Image source={require('../../assets/LogoNova-removebg.png')} style={styles.logoImage} resizeMode="contain" />
            <View style={styles.logoText}><Text style={styles.logoMain}>Galeria</Text><Text style={styles.logoSub}>SELETA</Text></View>
          </Pressable>

          <View style={styles.right}>
            <Pressable onPress={() => go('Cart')} hitSlop={10} style={styles.iconButton}>
              <Ionicons name="bag-outline" size={23} color={theme.colors.text} />
              {cartCount > 0 && <View style={styles.badge}><Text style={styles.badgeText}>{cartCount > 99 ? '99+' : cartCount}</Text></View>}
            </Pressable>
            <Pressable onPress={() => logged ? go('Main', { screen: 'Perfil' }) : go('Login')} hitSlop={10} style={styles.iconButton}>
              <Ionicons name="person-outline" size={23} color={theme.colors.text} />
            </Pressable>
          </View>
        </View>

        {showSearch && (
          <Pressable onPress={onSearch} style={styles.searchBar}>
            <Ionicons name="search-outline" size={17} color={theme.colors.muted} />
            <TextInput editable={false} pointerEvents="none" placeholder="O que procura?" placeholderTextColor={theme.colors.muted} style={styles.searchText} />
          </Pressable>
        )}

        <View style={styles.navRow}>
          <Pressable onPress={() => go('Main', { screen: 'Início' })}><Text style={styles.navText}>Novidades</Text></Pressable>
          <Pressable onPress={() => go('Main', { screen: 'Produtos' })}><Text style={styles.navText}>Produtos</Text></Pressable>
          <Pressable onPress={() => go('About')}><Text style={styles.navText}>Sobre Nós</Text></Pressable>
        </View>
      </View>

      <Modal visible={menuOpen} transparent animationType="fade" onRequestClose={() => setMenuOpen(false)}>
        <Pressable style={styles.modalBackdrop} onPress={() => setMenuOpen(false)}>
          <Pressable style={styles.drawer} onPress={(e) => e.stopPropagation()}>
            <View style={styles.drawerHead}>
              <View><Text style={styles.drawerTitle}>Galeria</Text><Text style={styles.drawerSub}>SELETA</Text></View>
              <Pressable onPress={() => setMenuOpen(false)} hitSlop={10}><Ionicons name="close" size={24} color={theme.colors.text} /></Pressable>
            </View>
            {[
              ['Início', () => go('Main', { screen: 'Início' })],
              ['Produtos', () => go('Main', { screen: 'Produtos' })],
              ['Buscar', () => go('Search')],
              ['Carrinho', () => go('Cart')],
              ['Meus pedidos', () => go('Main', { screen: 'Pedidos' })],
              ['Sobre nós', () => go('About')],
              ['Fale conosco', () => go('Contact')],
              [logged ? 'Meu perfil' : 'Entrar', () => logged ? go('Main', { screen: 'Perfil' }) : go('Login')],
            ].map(([label, action]) => (
              <Pressable key={String(label)} onPress={action as any} style={styles.drawerItem}><Text style={styles.drawerItemText}>{String(label)}</Text><Ionicons name="chevron-forward" size={17} color={theme.colors.muted} /></Pressable>
            ))}
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  wrap: { backgroundColor: theme.colors.bg, borderBottomWidth: 1, borderBottomColor: theme.colors.line },
  top: { height: 58, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  iconButton: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },
  logo: { position: 'absolute', left: '50%', transform: [{ translateX: -62 }], alignItems: 'center', justifyContent: 'center', width: 124, flexDirection: 'row', gap: 6 },
  logoImage: { width: 35, height: 25 },
  logoText: { alignItems: 'flex-start' },
  logoMain: { color: theme.colors.text, fontFamily: theme.fonts.display, fontSize: 23, fontStyle: 'italic', lineHeight: 23 },
  logoSub: { color: theme.colors.muted, fontFamily: theme.fonts.body, fontSize: 8, fontWeight: '800', letterSpacing: 3.2, marginTop: 2, marginLeft: 3 },
  right: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  badge: { position: 'absolute', right: -5, top: -5, minWidth: 16, height: 16, paddingHorizontal: 3, borderRadius: 9, backgroundColor: theme.colors.accent, alignItems: 'center', justifyContent: 'center' },
  badgeText: { color: theme.colors.bg, fontSize: 8, fontWeight: '900' },
  searchBar: { height: 42, marginHorizontal: 16, marginBottom: 12, paddingHorizontal: 13, borderRadius: 21, backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: theme.colors.surface2, flexDirection: 'row', alignItems: 'center' },
  searchText: { flex: 1, marginLeft: 9, paddingVertical: 0, color: theme.colors.text, fontFamily: theme.fonts.body, fontSize: 12 },
  navRow: { height: 38, borderTopWidth: 1, borderTopColor: theme.colors.line, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 28 },
  navText: { color: theme.colors.muted, fontFamily: theme.fonts.body, fontSize: 10, letterSpacing: 1, textTransform: 'uppercase' },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.62)', justifyContent: 'flex-start' },
  drawer: { width: '84%', maxWidth: 340, minHeight: '100%', backgroundColor: theme.colors.surface, paddingTop: 58, paddingHorizontal: 22, ...shadow },
  drawerHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 22, borderBottomWidth: 1, borderBottomColor: theme.colors.line },
  drawerTitle: { color: theme.colors.text, fontFamily: theme.fonts.display, fontSize: 30, fontStyle: 'italic' },
  drawerSub: { color: theme.colors.muted, fontSize: 8, letterSpacing: 3, marginTop: 2 },
  drawerItem: { minHeight: 52, borderBottomWidth: 1, borderBottomColor: theme.colors.line, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  drawerItemText: { color: theme.colors.text, fontFamily: theme.fonts.body, fontSize: 13 },
});
