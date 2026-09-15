import React, { useMemo, useState } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '../components/Screen';
import { Header } from '../components/Header';
import { Button } from '../components/Button';
import { ProductCard } from '../components/ProductCard';
import { PRODUCTS } from '../data';
import { getCart, saveCart } from '../storage';
import { theme } from '../theme';
const money = (v:number) => v.toLocaleString('pt-BR', { style:'currency', currency:'BRL' });

export function ProductDetailScreen({ route, navigation }: any) {
  const product = useMemo(() => PRODUCTS.find(p => p.id === route.params.id) ?? PRODUCTS[0], [route.params.id]);
  const [size, setSize] = useState('M'); const [qty, setQty] = useState(1); const [added, setAdded] = useState(false); const [favorite, setFavorite] = useState(false);
  const finalPrice = product.discountPrice ?? product.price;
  async function addCart(go = false) {
    const cart = await getCart(); const index = cart.findIndex(i => i.id === product.id && i.size === size);
    if (index >= 0) cart[index].quantity += qty; else cart.push({ ...product, size, quantity: qty });
    await saveCart(cart); setAdded(true); if (go) navigation.navigate('Cart');
  }
  return <Screen>
    <Header navigation={navigation} onSearch={() => navigation.navigate('Search')} />
    <View style={styles.page}>
      <View style={styles.imageWrap}><Image source={{ uri: product.image }} style={styles.image}/><Pressable onPress={() => setFavorite(v=>!v)} style={styles.heart}><Ionicons name={favorite ? 'heart' : 'heart-outline'} size={23} color={favorite ? theme.colors.accent : theme.colors.text}/></Pressable></View>
      <Text style={styles.category}>{product.category.toUpperCase()}</Text>
      <Text style={styles.name}>{product.name}</Text>
      <View style={styles.priceRow}><Text style={styles.price}>{money(finalPrice)}</Text>{product.discountPrice && <><Text style={styles.original}>{money(product.price)}</Text><Text style={styles.badge}>-{Math.round((1-finalPrice/product.price)*100)}%</Text></>}</View>
      <Text style={styles.description}>{product.description}</Text>
      <View style={styles.rule}/>
      <Text style={styles.label}>TAMANHO</Text><View style={styles.options}>{['P','M','G','GG'].map(s => <Pressable key={s} onPress={() => setSize(s)} style={[styles.size, size===s && styles.sizeActive]}><Text style={[styles.sizeText, size===s && styles.sizeTextActive]}>{s}</Text></Pressable>)}</View>
      <View style={styles.qtyRow}><Text style={styles.label}>QUANTIDADE</Text><View style={styles.qty}><Pressable onPress={() => setQty(v=>Math.max(1,v-1))}><Ionicons name="remove" size={17} color={theme.colors.text}/></Pressable><Text style={styles.qtyValue}>{qty}</Text><Pressable onPress={() => setQty(v=>Math.min(product.stock,v+1))}><Ionicons name="add" size={17} color={theme.colors.text}/></Pressable></View></View>
      <View style={styles.actions}><Button label={added ? '✓ ADICIONADO AO CARRINHO' : 'ADICIONAR AO CARRINHO'} onPress={() => addCart()}/><Button label="COMPRAR AGORA  ›" secondary onPress={() => addCart(true)}/></View>
      <Text style={styles.relatedTitle}>VOCÊ TAMBÉM PODE GOSTAR</Text><View style={styles.related}>{PRODUCTS.filter(p=>p.id!==product.id).slice(0,2).map(p=><ProductCard key={p.id} product={p} onPress={()=>navigation.replace('ProductDetail',{id:p.id})}/>)}</View>
    </View>
  </Screen>;
}
const styles = StyleSheet.create({
  page:{padding:16}, imageWrap:{height:380,borderRadius:theme.radius.md,overflow:'hidden',backgroundColor:theme.colors.surface2,position:'relative'}, image:{width:'100%',height:'100%'}, heart:{position:'absolute',right:12,top:12,width:40,height:40,borderRadius:20,backgroundColor:'rgba(15,15,15,.62)',alignItems:'center',justifyContent:'center'}, category:{color:theme.colors.accent,fontSize:10,fontWeight:'900',letterSpacing:1.4,marginTop:20}, name:{color:theme.colors.text,fontFamily:theme.fonts.display,fontSize:38,lineHeight:42,marginTop:3}, priceRow:{flexDirection:'row',alignItems:'baseline',gap:9,marginTop:5,flexWrap:'wrap'}, price:{color:theme.colors.accent,fontFamily:theme.fonts.display,fontSize:28,fontWeight:'700'}, original:{color:theme.colors.muted,fontSize:12,textDecorationLine:'line-through'}, badge:{color:theme.colors.bg,backgroundColor:theme.colors.accent,fontSize:9,fontWeight:'900',paddingHorizontal:6,paddingVertical:4,borderRadius:3}, description:{color:theme.colors.muted,fontSize:13,lineHeight:20,marginTop:14}, rule:{height:1,backgroundColor:theme.colors.line,marginVertical:24}, label:{color:theme.colors.muted,fontSize:10,fontWeight:'900',letterSpacing:1}, options:{flexDirection:'row',gap:8,marginTop:10}, size:{width:50,height:42,borderRadius:4,backgroundColor:theme.colors.surface2,alignItems:'center',justifyContent:'center'}, sizeActive:{backgroundColor:theme.colors.accent}, sizeText:{color:theme.colors.text,fontWeight:'800'}, sizeTextActive:{color:theme.colors.bg}, qtyRow:{flexDirection:'row',alignItems:'center',justifyContent:'space-between',marginTop:22}, qty:{height:42,minWidth:116,paddingHorizontal:13,borderRadius:5,borderWidth:1,borderColor:theme.colors.surface2,flexDirection:'row',alignItems:'center',justifyContent:'space-between'}, qtyValue:{color:theme.colors.text,fontSize:13,fontWeight:'800'}, actions:{gap:9,marginTop:22}, relatedTitle:{color:theme.colors.text,fontSize:10,fontWeight:'900',letterSpacing:1.5,marginTop:34,marginBottom:16}, related:{flexDirection:'row',justifyContent:'space-between'},
});
