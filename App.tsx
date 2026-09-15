import React, { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { NavigationContainer, Theme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { theme } from './src/theme';
import { getSession } from './src/storage';

import { HomeScreen } from './src/screens/HomeScreen';
import { ProductsScreen } from './src/screens/ProductsScreen';
import { SearchScreen } from './src/screens/SearchScreen';
import { ProductDetailScreen } from './src/screens/ProductDetailScreen';
import { LoginScreen } from './src/screens/LoginScreen';
import { RegisterScreen } from './src/screens/RegisterScreen';
import { ForgotPasswordScreen } from './src/screens/ForgotPasswordScreen';
import { CartScreen } from './src/screens/CartScreen';
import { CheckoutScreen } from './src/screens/CheckoutScreen';
import { OrderSuccessScreen } from './src/screens/OrderSuccessScreen';
import { OrdersScreen } from './src/screens/OrdersScreen';
import { OrderDetailScreen } from './src/screens/OrderDetailScreen';
import { ProfileScreen } from './src/screens/ProfileScreen';
import { AddressesScreen } from './src/screens/AddressesScreen';
import { PersonalDataScreen } from './src/screens/PersonalDataScreen';
import { ChangePasswordScreen } from './src/screens/ChangePasswordScreen';
import { AboutScreen } from './src/screens/AboutScreen';
import { ContactScreen } from './src/screens/ContactScreen';

export type RootStackParamList = {
  Main: undefined;
  Search: undefined;
  ProductDetail: { id: number };
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
  Cart: undefined;
  Checkout: undefined;
  OrderSuccess: { orderId: string };
  OrderDetail: { orderId: string };
  Addresses: undefined;
  PersonalData: undefined;
  ChangePassword: undefined;
  About: undefined;
  Contact: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tabs = createBottomTabNavigator();

const navTheme: Theme = {
  dark: true,
  colors: { primary: theme.colors.accent, background: theme.colors.bg, card: theme.colors.bg, text: theme.colors.text, border: theme.colors.surface2, notification: theme.colors.accent },
  fonts: { regular: { fontFamily: 'System', fontWeight: '400' }, medium: { fontFamily: 'System', fontWeight: '500' }, bold: { fontFamily: 'System', fontWeight: '700' }, heavy: { fontFamily: 'System', fontWeight: '900' } }
};

function MainTabs() {
  return (
    <Tabs.Navigator screenOptions={({ route }) => ({
      headerShown: false,
      tabBarStyle: { backgroundColor: theme.colors.bg, borderTopColor: theme.colors.surface2, height: 62, paddingTop: 5 },
      tabBarActiveTintColor: theme.colors.accent,
      tabBarInactiveTintColor: theme.colors.muted,
      tabBarLabelStyle: { fontSize: 9, fontWeight: '700' },
      tabBarIcon: ({ color, size }) => {
        const icons: Record<string, keyof typeof Ionicons.glyphMap> = {
          Início: 'home-outline', Produtos: 'grid-outline', Carrinho: 'bag-outline', Pedidos: 'receipt-outline', Perfil: 'person-outline'
        };
        return <Ionicons name={icons[route.name] ?? 'ellipse-outline'} size={size - 1} color={color} />;
      }
    })}>
      <Tabs.Screen name="Início" component={HomeScreen} />
      <Tabs.Screen name="Produtos" component={ProductsScreen} />
      <Tabs.Screen name="Carrinho" component={CartScreen} />
      <Tabs.Screen name="Pedidos" component={OrdersScreen} />
      <Tabs.Screen name="Perfil" component={ProfileScreen} />
    </Tabs.Navigator>
  );
}

function AppNavigator() {
  return (
    <NavigationContainer theme={navTheme}>
      <Stack.Navigator screenOptions={{ headerShown: false, contentStyle: { backgroundColor: theme.colors.bg } }}>
        <Stack.Screen name="Main" component={MainTabs} />
        <Stack.Screen name="Search" component={SearchScreen} />
        <Stack.Screen name="ProductDetail" component={ProductDetailScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
        <Stack.Screen name="Cart" component={CartScreen} />
        <Stack.Screen name="Checkout" component={CheckoutScreen} />
        <Stack.Screen name="OrderSuccess" component={OrderSuccessScreen} />
        <Stack.Screen name="OrderDetail" component={OrderDetailScreen} />
        <Stack.Screen name="Addresses" component={AddressesScreen} />
        <Stack.Screen name="PersonalData" component={PersonalDataScreen} />
        <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} />
        <Stack.Screen name="About" component={AboutScreen} />
        <Stack.Screen name="Contact" component={ContactScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  const [ready, setReady] = useState(false);
  useEffect(() => { getSession().finally(() => setReady(true)); }, []);
  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      {!ready ? <View style={{ flex: 1, backgroundColor: theme.colors.bg, alignItems: 'center', justifyContent: 'center' }}><ActivityIndicator color={theme.colors.accent} /></View> : <AppNavigator />}
    </SafeAreaProvider>
  );
}