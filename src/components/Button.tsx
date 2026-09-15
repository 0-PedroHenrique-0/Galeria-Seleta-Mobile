import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native';
import { theme } from '../theme';

export function Button({ label, onPress, secondary = false, disabled = false, loading = false }: {
  label: string; onPress?: () => void; secondary?: boolean; disabled?: boolean; loading?: boolean;
}) {
  return (
    <Pressable
      disabled={disabled || loading}
      onPress={onPress}
      style={({ pressed }) => [styles.base, secondary ? styles.secondary : styles.primary, (disabled || loading) && styles.disabled, pressed && !disabled && styles.pressed]}
    >
      {loading ? <ActivityIndicator color={secondary ? theme.colors.text : theme.colors.bg} /> : (
        <Text style={[styles.label, { color: secondary ? theme.colors.text : theme.colors.bg }]}>{label}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: { minHeight: 48, borderRadius: theme.radius.sm, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 18 },
  primary: { backgroundColor: theme.colors.accent },
  secondary: { backgroundColor: theme.colors.surface2 },
  label: { fontFamily: theme.fonts.body, fontSize: 11, fontWeight: '800', letterSpacing: 0.8 },
  disabled: { opacity: 0.45 },
  pressed: { opacity: 0.78 },
});
