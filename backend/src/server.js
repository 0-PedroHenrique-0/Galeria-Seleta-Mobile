import express from 'express';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 3333;

app.use(cors());
app.use(express.json());

let nextProductId = 9;
let products = [
  { id: 1, categoryId: 4, category: 'Moletons', name: 'Moletom Oversized', description: 'Moletom oversized unissex em algodão pesado com capuz.', price: 189.9, discountPrice: 149.9, stock: 10, image: 'https://images.unsplash.com/photo-1499971442178-8c10fdf5f6ac?auto=format&fit=crop&w=600&q=80' },
  { id: 2, categoryId: 1, category: 'Calças', name: 'Calça Jeans Wide', description: 'Calça jeans baggy estilo skater, corte largo e confortável.', price: 99.9, discountPrice: null, stock: 15, image: 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?auto=format&fit=crop&w=600&q=80' },
];

app.get('/health', (_request, response) => {
  response.json({ status: 'ok', service: 'galeria-seleta-api' });
});

app.get('/api/products', (_request, response) => {
  response.json(products);
});

app.get('/api/products/:id', (request, response) => {
  const id = Number(request.params.id);
  const product = products.find(item => item.id === id);
  if (!product) return response.status(404).json({ message: 'Produto não encontrado.' });
  return response.json(product);
});

app.post('/api/products', (request, response) => {
  const validation = validateProduct(request.body);
  if (validation) return response.status(400).json({ message: validation });

  const product = {
    id: nextProductId++,
    categoryId: Number(request.body.categoryId),
    category: String(request.body.category).trim(),
    name: String(request.body.name).trim(),
    description: String(request.body.description).trim(),
    price: Number(request.body.price),
    discountPrice: request.body.discountPrice == null || request.body.discountPrice === '' ? null : Number(request.body.discountPrice),
    stock: Number(request.body.stock),
    image: String(request.body.image).trim(),
  };

  products.push(product);
  return response.status(201).json(product);
});

app.put('/api/products/:id', (request, response) => {
  const id = Number(request.params.id);
  const index = products.findIndex(item => item.id === id);
  if (index < 0) return response.status(404).json({ message: 'Produto não encontrado.' });

  const validation = validateProduct(request.body);
  if (validation) return response.status(400).json({ message: validation });

  products[index] = {
    id,
    categoryId: Number(request.body.categoryId),
    category: String(request.body.category).trim(),
    name: String(request.body.name).trim(),
    description: String(request.body.description).trim(),
    price: Number(request.body.price),
    discountPrice: request.body.discountPrice == null || request.body.discountPrice === '' ? null : Number(request.body.discountPrice),
    stock: Number(request.body.stock),
    image: String(request.body.image).trim(),
  };

  return response.json(products[index]);
});

app.delete('/api/products/:id', (request, response) => {
  const id = Number(request.params.id);
  const exists = products.some(item => item.id === id);
  if (!exists) return response.status(404).json({ message: 'Produto não encontrado.' });

  products = products.filter(item => item.id !== id);
  return response.status(204).send();
});

function validateProduct(body) {
  if (!body || !String(body.name ?? '').trim()) return 'Nome é obrigatório.';
  if (!String(body.category ?? '').trim()) return 'Categoria é obrigatória.';
  if (!String(body.description ?? '').trim()) return 'Descrição é obrigatória.';
  if (!String(body.image ?? '').trim()) return 'Imagem é obrigatória.';

  const price = Number(body.price);
  const stock = Number(body.stock);
  const categoryId = Number(body.categoryId);
  const discount = body.discountPrice == null || body.discountPrice === '' ? null : Number(body.discountPrice);

  if (!Number.isFinite(categoryId)) return 'Categoria inválida.';
  if (!Number.isFinite(price) || price < 0) return 'Preço inválido.';
  if (!Number.isInteger(stock) || stock < 0) return 'Estoque inválido.';
  if (discount != null && (!Number.isFinite(discount) || discount < 0 || discount > price)) return 'Preço promocional inválido.';
  return null;
}

app.listen(PORT, () => {
  console.log(`Galeria Seleta API executando em http://localhost:${PORT}`);
});
