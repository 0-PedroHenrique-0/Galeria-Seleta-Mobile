import React, { useCallback, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { Screen } from '../components/Screen';
import { Button } from '../components/Button';
import { Field } from '../components/Field';
import { CATEGORIES } from '../data';
import { createProduct, deleteProduct, getProducts, ProductInput, updateProduct } from '../database';
import { Product } from '../types';
import { theme } from '../theme';

const EMPTY_FORM = {
  name: '',
  description: '',
  price: '',
  discountPrice: '',
  stock: '',
  image: '',
  categoryId: CATEGORIES[0].id,
};

export function ProductAdminScreen({ navigation }: any) {
  const [products, setProducts] = useState<Product[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setProducts(await getProducts());
  }, []);

  useFocusEffect(useCallback(() => {
    load();
  }, [load]));

  function setField<K extends keyof typeof EMPTY_FORM>(key: K, value: (typeof EMPTY_FORM)[K]) {
    setForm(current => ({ ...current, [key]: value }));
  }

  function clearForm() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setError('');
  }

  function edit(product: Product) {
    setEditingId(product.id);
    setForm({
      name: product.name,
      description: product.description,
      price: String(product.price),
      discountPrice: product.discountPrice == null ? '' : String(product.discountPrice),
      stock: String(product.stock),
      image: product.image,
      categoryId: product.categoryId,
    });
    setError('');
  }

  function toNumber(value: string) {
    return Number(value.trim().replace(',', '.'));
  }

  async function save() {
    const category = CATEGORIES.find(item => item.id === form.categoryId) ?? CATEGORIES[0];
    const price = toNumber(form.price);
    const stock = Number.parseInt(form.stock, 10);
    const discount = form.discountPrice.trim() ? toNumber(form.discountPrice) : null;

    if (!form.name.trim() || !form.description.trim() || !form.image.trim()) {
      setError('Preencha nome, descrição e imagem.');
      return;
    }
    if (!Number.isFinite(price) || price < 0 || !Number.isInteger(stock) || stock < 0) {
      setError('Informe preço e estoque válidos.');
      return;
    }
    if (discount != null && (!Number.isFinite(discount) || discount < 0 || discount > price)) {
      setError('O preço promocional deve ser válido e menor ou igual ao preço original.');
      return;
    }

    const payload: ProductInput = {
      categoryId: category.id,
      category: category.name,
      name: form.name.trim(),
      description: form.description.trim(),
      price,
      discountPrice: discount,
      stock,
      image: form.image.trim(),
    };

    try {
      setSaving(true);
      setError('');
      if (editingId == null) {
        await createProduct(payload);
      } else {
        await updateProduct(editingId, payload);
      }
      clearForm();
      await load();
    } catch (e) {
      console.error(e);
      setError('Não foi possível salvar o produto.');
    } finally {
      setSaving(false);
    }
  }

  function remove(product: Product) {
    Alert.alert(
      'Excluir produto',
      `Deseja excluir “${product.name}”?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            await deleteProduct(product.id);
            if (editingId === product.id) clearForm();
            await load();
          },
        },
      ],
    );
  }

  return (
    <Screen>
      <View style={styles.page}>
        <View style={styles.header}>
          <Pressable onPress={() => navigation.goBack()} hitSlop={10}>
            <Ionicons name="chevron-back" size={26} color={theme.colors.text} />
          </Pressable>
          <View style={styles.headerText}>
            <Text style={styles.kicker}>CADASTRO DE PRODUTOS</Text>
            <Text style={styles.title}>Gerenciar produtos</Text>
          </View>
        </View>

        <View style={styles.formCard}>
          <Text style={styles.sectionTitle}>{editingId == null ? 'NOVO PRODUTO' : `EDITANDO PRODUTO #${editingId}`}</Text>
          <Field label="NOME" value={form.name} onChangeText={value => setField('name', value)} placeholder="Nome do produto" />
          <Field label="DESCRIÇÃO" value={form.description} onChangeText={value => setField('description', value)} placeholder="Descrição do produto" multiline />

          <Text style={styles.label}>CATEGORIA</Text>
          <View style={styles.categories}>
            {CATEGORIES.map(category => (
              <Pressable
                key={category.id}
                onPress={() => setField('categoryId', category.id)}
                style={[styles.category, form.categoryId === category.id && styles.categoryActive]}
              >
                <Text style={[styles.categoryText, form.categoryId === category.id && styles.categoryTextActive]}>{category.name}</Text>
              </Pressable>
            ))}
          </View>

          <View style={styles.twoColumns}>
            <View style={styles.column}>
              <Field label="PREÇO" value={form.price} onChangeText={value => setField('price', value)} placeholder="0,00" keyboardType="decimal-pad" />
            </View>
            <View style={styles.column}>
              <Field label="PREÇO PROMOCIONAL" value={form.discountPrice} onChangeText={value => setField('discountPrice', value)} placeholder="Opcional" keyboardType="decimal-pad" />
            </View>
          </View>

          <Field label="ESTOQUE" value={form.stock} onChangeText={value => setField('stock', value)} placeholder="0" keyboardType="number-pad" />
          <Field label="URL DA IMAGEM" value={form.image} onChangeText={value => setField('image', value)} placeholder="https://..." autoCapitalize="none" />

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <View style={styles.actions}>
            <Button label={editingId == null ? 'INSERIR PRODUTO' : 'SALVAR ALTERAÇÕES'} onPress={save} loading={saving} />
            {editingId != null ? <Button label="CANCELAR EDIÇÃO" secondary onPress={clearForm} /> : null}
          </View>
        </View>

        <View style={styles.listHeader}>
          <Text style={styles.sectionTitle}>PRODUTOS CADASTRADOS</Text>
          <Text style={styles.count}>{products.length} item{products.length === 1 ? '' : 's'}</Text>
        </View>

        <View style={styles.list}>
          {products.map(product => (
            <View key={product.id} style={styles.productRow}>
              <View style={styles.productInfo}>
                <Text style={styles.productName}>{product.name}</Text>
                <Text style={styles.productMeta}>{product.category} · estoque {product.stock}</Text>
                <Text style={styles.productPrice}>{product.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</Text>
              </View>
              <Pressable onPress={() => edit(product)} style={styles.iconButton} hitSlop={8}>
                <Ionicons name="create-outline" size={20} color={theme.colors.text} />
              </Pressable>
              <Pressable onPress={() => remove(product)} style={styles.iconButton} hitSlop={8}>
                <Ionicons name="trash-outline" size={20} color={theme.colors.error} />
              </Pressable>
            </View>
          ))}
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  page: { padding: 20 },
  header: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  headerText: { flex: 1 },
  kicker: { color: theme.colors.accent, fontSize: 10, fontWeight: '900', letterSpacing: 1.3 },
  title: { color: theme.colors.text, fontFamily: theme.fonts.display, fontSize: 34, marginTop: 4 },
  formCard: { backgroundColor: theme.colors.surface, borderRadius: 9, padding: 16, marginTop: 22 },
  sectionTitle: { color: theme.colors.text, fontSize: 10, fontWeight: '900', letterSpacing: 1.2 },
  label: { color: theme.colors.muted, fontSize: 10, fontWeight: '800', letterSpacing: 0.7, marginBottom: 8 },
  categories: { flexDirection: 'row', flexWrap: 'wrap', gap: 7, marginBottom: 18 },
  category: { backgroundColor: theme.colors.surface2, borderRadius: 4, paddingHorizontal: 9, paddingVertical: 7 },
  categoryActive: { backgroundColor: theme.colors.accent },
  categoryText: { color: theme.colors.text, fontSize: 9, fontWeight: '700' },
  categoryTextActive: { color: theme.colors.bg },
  twoColumns: { flexDirection: 'row', gap: 12 },
  column: { flex: 1 },
  actions: { gap: 8 },
  error: { color: theme.colors.error, fontSize: 11, marginBottom: 14 },
  listHeader: { marginTop: 28, marginBottom: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  count: { color: theme.colors.muted, fontSize: 10 },
  list: { gap: 9 },
  productRow: { minHeight: 78, backgroundColor: theme.colors.surface, borderRadius: 8, padding: 13, flexDirection: 'row', alignItems: 'center' },
  productInfo: { flex: 1 },
  productName: { color: theme.colors.text, fontSize: 13, fontWeight: '800' },
  productMeta: { color: theme.colors.muted, fontSize: 10, marginTop: 3 },
  productPrice: { color: theme.colors.accent, fontSize: 12, fontWeight: '800', marginTop: 6 },
  iconButton: { width: 38, height: 38, alignItems: 'center', justifyContent: 'center' },
});
