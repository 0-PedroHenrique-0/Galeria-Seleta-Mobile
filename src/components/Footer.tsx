import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { theme } from '../theme';

export function Footer() {
  return <View style={styles.footer}>
    <View style={styles.orangeLine} />
    <View style={styles.columns}>
      <View style={styles.column}><Text style={styles.heading}>ENTRE EM CONTATO CONOSCO</Text><Text style={styles.text}>Precisa de ajuda com seu pedido? Tem dúvida sobre os tamanhos? Sinta-se à vontade para entrar em contato com nossa equipe.</Text><Text style={styles.text}><Text style={styles.strong}>E-mail: </Text>GaleriaSeleta@gmail.com</Text><Text style={styles.text}><Text style={styles.strong}>Telefone: </Text>11 9000-1111</Text></View>
      <View style={styles.column}><Text style={styles.heading}>VENHA NOS VISITAR</Text><Text style={styles.text}>SEGUNDA - SEXTA 10:00 - 18:00</Text><Text style={styles.text}>SÁBADO 10:00 - 17:00</Text><Text style={styles.text}>AV. RIO BONITO{`\n`}9021</Text></View>
    </View>
    <View style={styles.payment}><Text style={styles.paymentLabel}>FORMAS DE PAGAMENTO</Text><Text style={styles.paymentText}>Visa  ·  Mastercard  ·  Elo  ·  AmEx  ·  Pix  ·  Boleto</Text></View>
    <View style={styles.bottom}><Text style={styles.bottomText}>© GaleriaSeleta 2026 — Todos os direitos reservados</Text></View>
  </View>;
}
const styles = StyleSheet.create({
  footer: { marginTop: 34, backgroundColor: theme.colors.surface, paddingHorizontal: 20, paddingTop: 0, paddingBottom: 26 },
  orangeLine: { height: 2, backgroundColor: theme.colors.accent, marginHorizontal: -20 },
  columns: { gap: 28, paddingTop: 34 },
  column: { flex: 1 },
  heading: { color: theme.colors.text, fontSize: 9, fontWeight: '900', letterSpacing: 1.4, marginBottom: 11 },
  text: { color: theme.colors.muted, fontSize: 11, lineHeight: 18, marginBottom: 5 },
  strong: { color: theme.colors.text, fontWeight: '800' },
  payment: { borderTopWidth: 1, borderTopColor: theme.colors.line, marginTop: 26, paddingTop: 20 },
  paymentLabel: { color: theme.colors.muted, fontSize: 9, fontWeight: '800', letterSpacing: 1.4, marginBottom: 10 },
  paymentText: { color: theme.colors.text, fontSize: 10, lineHeight: 18 },
  bottom: { borderTopWidth: 1, borderTopColor: theme.colors.line, marginTop: 22, paddingTop: 18, alignItems: 'center' },
  bottomText: { color: theme.colors.muted, fontSize: 9, letterSpacing: 0.5, textAlign: 'center' },
});
