import React, { useEffect, useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { Screen } from '../components/Screen';
import { Button } from '../components/Button';
import { Field } from '../components/Field';
import { getUser, saveUser } from '../storage';
import { theme } from '../theme';
export function PersonalDataScreen(){const[name,setName]=useState('');const[email,setEmail]=useState('');const[phone,setPhone]=useState('');useEffect(()=>{getUser().then(u=>{if(u){setName(u.name||'');setEmail(u.email||'');setPhone(u.phone||'')}})},[]);async function save(){await saveUser({name:name||'Pedro Henrique',email:email||'pedro@email.com',phone});Alert.alert('Dados salvos','Suas informações foram atualizadas localmente.')}return <Screen><View style={styles.page}><Text style={styles.title}>Dados pessoais</Text><Text style={styles.sub}>Estas informações ficam salvas somente no dispositivo.</Text><View style={{marginTop:24}}><Field label="NOME" value={name} onChangeText={setName} placeholder="Seu nome"/><Field label="E-MAIL" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" placeholder="seu@email.com"/><Field label="TELEFONE" value={phone} onChangeText={setPhone} keyboardType="phone-pad" placeholder="(11) 90000-0000"/></View><Button label="SALVAR ALTERAÇÕES" onPress={save}/></View></Screen>}
const styles=StyleSheet.create({page:{padding:20},title:{color:theme.colors.text,fontFamily:theme.fonts.display,fontSize:39},sub:{color:theme.colors.muted,fontSize:12,marginTop:6}});
