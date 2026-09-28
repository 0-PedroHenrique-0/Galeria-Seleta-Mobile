import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '../components/Screen';
import { theme } from '../theme';
import { getUser, setSession } from '../storage';

export function ProfileScreen({navigation}:any){
 const[user,setUser]=useState<any>(null);
 const load=()=>getUser().then(setUser);
 useEffect(()=>{load();const u=navigation.addListener('focus',load);return u},[navigation]);
 const first=(user?.name||'Pedro Henrique').trim().split(' ')[0];
 const items=[
  ['Meus pedidos','receipt-outline',()=>navigation.navigate('Main',{screen:'Pedidos'})],
  ['Meus endereços','location-outline',()=>navigation.navigate('Addresses')],
  ['Dados pessoais','person-circle-outline',()=>navigation.navigate('PersonalData')],
  ['Gerenciar produtos','cube-outline',()=>navigation.navigate('ProductAdmin')],
  ['Alterar senha','lock-closed-outline',()=>navigation.navigate('ChangePassword')],
  ['Sobre nós','information-circle-outline',()=>navigation.navigate('About')],
  ['Fale conosco','chatbubble-ellipses-outline',()=>navigation.navigate('Contact')]
 ] as const;
 async function logout(){await setSession(false);navigation.navigate('Login')}
 return <Screen><View style={styles.page}><Text style={styles.title}>Meu perfil</Text><View style={styles.profile}><View style={styles.avatar}><Text style={styles.avatarText}>{first.slice(0,2).toUpperCase()}</Text></View><View style={{flex:1}}><Text style={styles.name}>{user?.name||'Pedro Henrique'}</Text><Text style={styles.email}>{user?.email||'pedro@email.com'}</Text></View></View><View style={styles.menu}>{items.map(([label,icon,onPress])=><Pressable key={label} onPress={onPress} style={styles.row}><View style={styles.rowLeft}><Ionicons name={icon as any} size={19} color={theme.colors.muted}/><Text style={styles.rowText}>{label}</Text></View><Ionicons name="chevron-forward" size={17} color={theme.colors.muted}/></Pressable>)}<Pressable onPress={logout} style={styles.logout}><Ionicons name="log-out-outline" size={19} color={theme.colors.error}/><Text style={styles.logoutText}>Sair da conta</Text></Pressable></View></View></Screen>
}
const styles=StyleSheet.create({page:{padding:20},title:{color:theme.colors.text,fontFamily:theme.fonts.display,fontSize:39},profile:{flexDirection:'row',alignItems:'center',marginTop:24,marginBottom:24,padding:16,backgroundColor:theme.colors.surface,borderRadius:9},avatar:{width:58,height:58,borderRadius:29,backgroundColor:theme.colors.surface2,alignItems:'center',justifyContent:'center'},avatarText:{color:theme.colors.accent,fontWeight:'900'},name:{color:theme.colors.text,fontFamily:theme.fonts.display,fontSize:23},email:{color:theme.colors.muted,fontSize:11,marginTop:3},menu:{borderTopWidth:1,borderTopColor:theme.colors.line},row:{minHeight:56,borderBottomWidth:1,borderBottomColor:theme.colors.line,flexDirection:'row',alignItems:'center',justifyContent:'space-between'},rowLeft:{flexDirection:'row',alignItems:'center',gap:12},rowText:{color:theme.colors.text,fontSize:13},logout:{minHeight:56,flexDirection:'row',alignItems:'center',gap:12},logoutText:{color:theme.colors.error,fontSize:13,fontWeight:'700'}});
