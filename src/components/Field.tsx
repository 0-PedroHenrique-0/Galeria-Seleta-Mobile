import React from 'react';
import { StyleSheet, Text, TextInput, TextInputProps, View } from 'react-native';
import { theme } from '../theme';

export function Field({ label, ...props }: TextInputProps & { label: string }) {
  return <View style={styles.wrap}>{label ? <Text style={styles.label}>{label}</Text> : null}<TextInput {...props} placeholderTextColor={theme.colors.muted} style={[styles.input, props.style]} /></View>;
}
const styles = StyleSheet.create({
  wrap: { marginBottom: 18 },
  label: { color: theme.colors.muted, fontFamily: theme.fonts.body, fontSize: 10, fontWeight: '800', letterSpacing: 0.7, marginBottom: 7 },
  input: { height: 46, borderBottomWidth: 1, borderBottomColor: theme.colors.surface2, color: theme.colors.text, fontFamily: theme.fonts.body, fontSize: 13, paddingHorizontal: 0, paddingVertical: 0 },
});
