import React, { useCallback, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { Screen } from '../components/Screen';
import { Header } from '../components/Header';
import { ProductCard } from '../components/ProductCard';
import { CATEGORIES } from '../data';
import { getProducts } from '../database';
import { Product } from '../types';
import { theme } from '../theme';

export function ProductsScreen({ navigation }: any) {
 const [allProducts,setAllProducts]=useState<Product[]>([]);
 const [category,setCategory]=useState<number|null>(null);
 const [sort,setSort]=useState<'default'|'new'|'low'|'high'>('default');
 useFocusEffect(useCallback(()=>{getProducts().then(setAllProducts).catch(console.error)},[]));
 const products=useMemo(()=>{const list=category?allProducts.filter(p=>p.categoryId===category):[...allProducts];if(sort==='low')list.sort((a,b)=>(a.discountPrice??a.price)-(b.discountPrice??b.price));if(sort==='high')list.sort((a,b)=>(b.discountPrice??b.price)-(a.discountPrice??a.price));if(sort==='new')list.sort((a,b)=>b.id-a.id);return list},[allProducts,category,sort]);
 return <Screen><Header navigation={navigation} onSearch={()=>navigation.navigate('Search')}/><View style={styles.page}><View style={styles.titleRow}><Text style={styles.title}>Produtos</Text><Text style={styles.count}>{products.length} peças</Text></View><View style={styles.controls}><Pressable onPress={()=>setSort(v=>v==='low'?'high':v==='high'?'new':'low')} style={styles.control}><Ionicons name="swap-vertical-outline" size={15} color={theme.colors.muted}/><Text style={styles.controlText}>Organizar por</Text></Pressable><Pressable onPress={()=>setCategory(category?null:CATEGORIES[0].id)} style={styles.control}><Ionicons name="options-outline" size={15} color={theme.colors.muted}/><Text style={styles.controlText}>Filtrar por</Text></Pressable></View><View style={styles.chips}><Pressable onPress={()=>setCategory(null)} style={[styles.chip,category===null&&styles.chipActive]}><Text style={[styles.chipText,category===null&&styles.chipTextActive]}>Todos</Text></Pressable>{CATEGORIES.map(c=><Pressable key={c.id} onPress={()=>setCategory(c.id)} style={[styles.chip,category===c.id&&styles.chipActive]}><Text style={[styles.chipText,category===c.id&&styles.chipTextActive]}>{c.name}</Text></Pressable>)}</View><Text style={styles.sortHint}>{sort==='low'?'Menor preço':sort==='high'?'Maior preço':sort==='new'?'Novidades':'Seleção da Galeria'}</Text>{products.length===0?<Text style={styles.empty}>Nenhum produto cadastrado.</Text>:<View style={styles.grid}>{products.map(p=><ProductCard key={p.id} product={p} onPress={()=>navigation.navigate('ProductDetail',{id:p.id})}/>)}</View>}</View></Screen>
}
const styles=StyleSheet.create({page:{paddingHorizontal:16,paddingTop:18},titleRow:{flexDirection:'row',alignItems:'baseline',justifyContent:'space-between'},title:{color:theme.colors.text,fontFamily:theme.fonts.display,fontSize:39},count:{color:theme.colors.muted,fontSize:10,letterSpacing:.6},controls:{flexDirection:'row',gap:8,marginTop:18},control:{flex:1,minHeight:42,borderWidth:1,borderColor:theme.colors.surface2,borderRadius:5,flexDirection:'row',alignItems:'center',justifyContent:'center',gap:7},controlText:{color:theme.colors.text,fontSize:10,fontWeight:'800',letterSpacing:.4},chips:{flexDirection:'row',flexWrap:'wrap',gap:7,marginTop:14},chip:{paddingHorizontal:10,paddingVertical:7,borderRadius:4,backgroundColor:theme.colors.surface2},chipActive:{backgroundColor:theme.colors.accent},chipText:{color:theme.colors.text,fontSize:9,fontWeight:'700'},chipTextActive:{color:theme.colors.bg},sortHint:{color:theme.colors.muted,fontSize:10,marginTop:18,marginBottom:12},grid:{flexDirection:'row',flexWrap:'wrap',justifyContent:'space-between'},empty:{color:theme.colors.muted,fontSize:12,textAlign:'center',marginTop:50}});
