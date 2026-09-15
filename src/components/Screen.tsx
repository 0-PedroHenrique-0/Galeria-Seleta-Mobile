import React from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleProp, View, ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '../theme';

export function Screen({ children, style, scroll = true, contentStyle }: {
  children: React.ReactNode; style?: StyleProp<ViewStyle>; scroll?: boolean; contentStyle?: StyleProp<ViewStyle>;
}) {
  const content = scroll ? (
    <ScrollView
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={[{ paddingBottom: 42 }, contentStyle]}
    >{children}</ScrollView>
  ) : <View style={contentStyle}>{children}</View>;

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={[{ flex: 1, backgroundColor: theme.colors.bg }, style]}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        {content}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
