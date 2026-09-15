import React, { useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { Screen } from '../components/Screen';
import { Button } from '../components/Button';
import { Field } from '../components/Field';
import { theme } from '../theme';
export function ChangePasswordScreen(){const[current,setCurrent]=useState('');const[next,setNext]=useState('');const[confirm,setConfirm]=useState('');function save(){if(next.length<8||next!==confirm){Alert.alert('Verifique os dados','A nova senha deve ter pelo menos 8 caracteres e coincidir com a confirmação.');return}Alert.alert('Senha atualizada','A alteração foi salva localmente.');setCurrent('');setNext('');setConfirm('')}return <Screen><View style={styles.page}><Text style={styles.title}>Alterar senha</Text><Text style={styles.sub}>Use uma senha pessoal e segura.</Text><View style={{marginTop:24}}><Field label="SENHA ATUAL" value={current} onChangeText={setCurrent} secureTextEntry placeholder="Sua senha atual"/><Field label="NOVA SENHA" value={next} onChangeText={setNext} secureTextEntry placeholder="Mínimo 8 caracteres"/><Field label="CONFIRMAR NOVA SENHA" value={confirm} onChangeText={setConfirm} secureTextEntry placeholder="Repita a senha"/></View><Button label="ATUALIZAR SENHA" onPress={save}/></View></Screen>}
const styles=StyleSheet.create({page:{padding:20},title:{color:theme.colors.text,fontFamily:theme.fonts.display,fontSize:39},sub:{color:theme.colors.muted,fontSize:12,marginTop:6}});
