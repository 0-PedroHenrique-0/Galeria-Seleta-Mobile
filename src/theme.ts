import { Platform } from 'react-native';

export const theme = {
  colors: {
    bg: '#0F0F0F',
    surface: '#1E1E1E',
    surface2: '#3A3A3A',
    text: '#F2F2F0',
    muted: '#9A9895',
    accent: '#E8441A',
    error: '#C0392B',
    success: '#27AE60',
    white: '#FFFFFF',
    line: '#2B2B2B',
  },
  fonts: {
    display: Platform.select({ ios: 'Georgia', android: 'serif', default: 'Georgia' }) as string,
    body: Platform.select({ ios: 'System', android: 'sans-serif', default: 'System' }) as string,
  },
  spacing: { xs: 6, sm: 10, md: 16, lg: 24, xl: 32 },
  radius: { sm: 5, md: 8, lg: 12 },
};

export const shadow = {
  shadowColor: '#000', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.22, shadowRadius: 14,
  elevation: 6,
};
