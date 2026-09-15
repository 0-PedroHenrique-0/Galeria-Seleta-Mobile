import React, { useEffect, useRef, useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '../components/Screen';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { Button } from '../components/Button';
import { ProductCard } from '../components/ProductCard';
import { HERO_SLIDES, PRODUCTS } from '../data';
import { theme } from '../theme';

export function HomeScreen({ navigation }: any) {
  const [slide, setSlide] = useState(0);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);
  useEffect(() => { timer.current = setInterval(() => setSlide(v => (v + 1) % HERO_SLIDES.length), 4500); return () => { if (timer.current) clearInterval(timer.current); }; }, []);
  const next = () => setSlide(v => (v + 1) % HERO_SLIDES.length);
  const prev = () => setSlide(v => (v - 1 + HERO_SLIDES.length) % HERO_SLIDES.length);
  return <Screen>
    <Header navigation={navigation} onSearch={() => navigation.navigate('Search')} />
    <View style={styles.hero}>
      <View style={styles.heroImageWrap}>
        <Image source={{ uri: HERO_SLIDES[slide].image }} style={styles.heroImage} resizeMode="cover" />
        <View style={styles.imageShade} />
        <Pressable onPress={prev} style={[styles.arrow, { left: 9 }]}><Ionicons name="chevron-back" size={26} color={theme.colors.text} /></Pressable>
        <Pressable onPress={next} style={[styles.arrow, { right: 9 }]}><Ionicons name="chevron-forward" size={26} color={theme.colors.text} /></Pressable>
        <View style={styles.dots}>{HERO_SLIDES.map((_, i) => <Pressable key={i} onPress={() => setSlide(i)} style={[styles.dot, i === slide && styles.dotActive]} />)}</View>
      </View>
      <View style={styles.heroText}>
        <Text style={styles.heroTitle}>Encontre</Text><Text style={styles.heroTitle}>Peças</Text><Text style={[styles.heroTitle, styles.italic]}>únicas</Text>
        <Text style={styles.heroSub}>Descubra tesouro vintage{`\n`}e <Text style={styles.heroSubItalic}>peças exclusivas</Text></Text>
        <View style={styles.cta}><Button label="COMPRE AGORA" onPress={() => navigation.navigate('Main', { screen: 'Produtos' })} /></View>
      </View>
    </View>

    <View style={styles.novidades}>
      <Text style={styles.sectionTitle}>NOVIDADES</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.marquee}>
        {[...PRODUCTS, ...PRODUCTS.slice(0, 3)].map((p, i) => <ProductCard key={`${p.id}-${i}`} product={p} compact onPress={() => navigation.navigate('ProductDetail', { id: p.id })} />)}
      </ScrollView>
    </View>

    <Footer />
  </Screen>;
}

const styles = StyleSheet.create({
  hero: { paddingHorizontal: 16, paddingTop: 24, paddingBottom: 34 },
  heroImageWrap: { width: '100%', aspectRatio: 1.333, borderRadius: theme.radius.md, overflow: 'hidden', backgroundColor: theme.colors.surface2, position: 'relative' },
  heroImage: { width: '100%', height: '100%' },
  imageShade: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.12)' },
  arrow: { position: 'absolute', top: '46%', width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(15,15,15,0.55)', alignItems: 'center', justifyContent: 'center' },
  dots: { position: 'absolute', bottom: 12, left: 0, right: 0, flexDirection: 'row', justifyContent: 'center', gap: 7 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: 'rgba(242,242,240,0.55)' },
  dotActive: { width: 18, backgroundColor: theme.colors.text },
  heroText: { alignItems: 'center', paddingTop: 26 },
  heroTitle: { color: theme.colors.text, fontFamily: theme.fonts.display, fontSize: 54, lineHeight: 49, textAlign: 'center' },
  italic: { fontStyle: 'italic' },
  heroSub: { color: theme.colors.muted, fontFamily: theme.fonts.body, fontSize: 13, lineHeight: 20, textAlign: 'center', marginTop: 14 },
  heroSubItalic: { color: theme.colors.text, fontStyle: 'italic' },
  cta: { width: 156, marginTop: 18 },
  novidades: { borderTopWidth: 2, borderTopColor: theme.colors.accent, paddingTop: 20, paddingBottom: 10 },
  sectionTitle: { color: theme.colors.text, fontFamily: theme.fonts.body, fontWeight: '900', fontSize: 11, letterSpacing: 2, textAlign: 'center', marginBottom: 18 },
  marquee: { paddingHorizontal: 16, gap: 12 },
});
