import React from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { Product } from '../types';
import { theme } from '../theme';

const money = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

export function ProductCard({ product, onPress, compact = false }: { product: Product; onPress?: () => void; compact?: boolean }) {
  const finalPrice = product.discountPrice ?? product.price;
  return (
    <Pressable onPress={onPress} style={[styles.card, compact ? styles.compact : styles.normal]}>
      <View style={styles.imageBox}>
        <Image source={{ uri: product.image }} style={styles.image} resizeMode="cover" />
        {product.discountPrice && <View style={styles.discount}><Text style={styles.discountText}>OFERTA</Text></View>}
      </View>
      <Text numberOfLines={1} style={styles.name}>{product.name}</Text>
      <Text numberOfLines={2} style={styles.desc}>{product.description}</Text>
      <View style={styles.priceRow}>
        <Text style={styles.price}>{money(finalPrice)}</Text>
        {product.discountPrice && <Text style={styles.original}>{money(product.price)}</Text>}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { marginBottom: 22 },
  normal: { width: '48%' },
  compact: { width: 148 },
  imageBox: { width: '100%', aspectRatio: 0.78, backgroundColor: theme.colors.surface2, borderRadius: theme.radius.sm, overflow: 'hidden', position: 'relative' },
  image: { width: '100%', height: '100%' },
  discount: { position: 'absolute', left: 8, top: 8, backgroundColor: theme.colors.accent, paddingHorizontal: 7, paddingVertical: 4, borderRadius: 3 },
  discountText: { color: theme.colors.bg, fontSize: 7, fontWeight: '900', letterSpacing: 0.7 },
  name: { color: theme.colors.text, fontFamily: theme.fonts.body, fontWeight: '800', fontSize: 12, marginTop: 8 },
  desc: { color: theme.colors.muted, fontFamily: theme.fonts.body, fontSize: 10, lineHeight: 14, marginTop: 3 },
  priceRow: { flexDirection: 'row', alignItems: 'baseline', flexWrap: 'wrap', columnGap: 7, marginTop: 5 },
  price: { color: theme.colors.accent, fontFamily: theme.fonts.display, fontSize: 18, fontWeight: '700' },
  original: { color: theme.colors.muted, fontFamily: theme.fonts.body, fontSize: 9, textDecorationLine: 'line-through' },
});
