import { Address, Product } from './types';

export const PRODUCTS: Product[] = [
  {
    id: 1,
    categoryId: 4,
    category: 'Moletons',
    name: 'Moletom Oversized',
    description: 'Moletom oversized unissex em algodão pesado com capuz.',
    price: 189.90,
    discountPrice: 149.90,
    stock: 10,
    image: 'https://images.unsplash.com/photo-1499971442178-8c10fdf5f6ac?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 2,
    categoryId: 1,
    category: 'Calças',
    name: 'Calça Jeans Wide',
    description: 'Calça jeans baggy estilo skater, corte largo e confortável.',
    price: 99.90,
    stock: 15,
    image: 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 3,
    categoryId: 6,
    category: 'Camisetas',
    name: 'Camiseta Oversized',
    description: 'Camiseta oversized com estampa, corte relaxado streetwear.',
    price: 259.90,
    discountPrice: 219.90,
    stock: 8,
    image: 'https://images.unsplash.com/photo-1745284505024-1ac4453a67b2?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 4,
    categoryId: 1,
    category: 'Calças',
    name: 'Calça Cargo',
    description: 'Calça cargo com bolsos laterais, estilo streetwear urbano.',
    price: 159.90,
    stock: 12,
    image: 'https://images.unsplash.com/photo-1576995853380-18ccf5c2acce?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 5,
    categoryId: 7,
    category: 'Calçados',
    name: 'Tênis Skate',
    description: 'Tênis de skate com solado reforçado e design urbano.',
    price: 179.90,
    discountPrice: 139.90,
    stock: 6,
    image: 'https://images.unsplash.com/photo-1525092029632-cb75fe5dd776?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 6,
    categoryId: 8,
    category: 'Shorts',
    name: 'Shorts Esportivo',
    description: 'Shorts leve e confortável para o dia a dia ou treino.',
    price: 299.90,
    stock: 20,
    image: 'https://images.unsplash.com/photo-1601393709771-3938c63d41a6?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 7,
    categoryId: 3,
    category: 'Jaquetas',
    name: 'Jaqueta Coach',
    description: 'Jaqueta estilo coach leve e versátil para o street.',
    price: 229.90,
    discountPrice: 199.90,
    stock: 5,
    image: 'https://images.unsplash.com/photo-1551232864-3f0890e580d9?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 8,
    categoryId: 1,
    category: 'Calças',
    name: 'Calça Jeans Clássica',
    description: 'Calça jeans com lavagem média e corte reto atemporal.',
    price: 139.90,
    stock: 18,
    image: 'https://images.unsplash.com/photo-1578939662863-5cd416d45a69?auto=format&fit=crop&w=600&q=80',
  },
];

export const CATEGORIES = [
  { id: 1, name: 'Calças' },
  { id: 2, name: 'Camisas' },
  { id: 3, name: 'Casacos' },
  { id: 4, name: 'Moletons' },
  { id: 5, name: 'Vestidos' },
  { id: 6, name: 'Camisetas' },
  { id: 7, name: 'Calçados' },
  { id: 8, name: 'Shorts' },
];

export const HERO_SLIDES = [
  {
    image: 'https://images.unsplash.com/photo-1595175131388-65cd0200facb?auto=format&fit=crop&w=800&q=80',
    alt: 'Coleção primavera',
  },
  {
    image: 'https://images.unsplash.com/photo-1590664325935-68aba5254108?auto=format&fit=crop&w=800&q=80',
    alt: 'Peças exclusivas',
  },
  {
    image: 'https://images.unsplash.com/photo-1577959806854-375d1bed6c93?auto=format&fit=crop&w=800&q=80',
    alt: 'Novidades da semana',
  },
];

export const DEFAULT_ADDRESS: Address = {
  id: 'addr-1',
  label: 'Principal',
  street: 'Av. Rio Bonito, 9021',
  city: 'São Paulo',
  state: 'SP',
  zip: '00000-000',
  complement: '',
  isDefault: true,
};

export const ABOUT_CARDS = [
  {
    title: 'Curadoria Exclusiva',
    text: 'Todas as peças passam por uma seleção manual, avaliando conservação, autenticidade e estética.',
    image: 'https://images.unsplash.com/photo-1521886243261-7fc82ca5cb60?q=80&w=1073&auto=format&fit=crop',
  },
  {
    title: 'Peças Únicas',
    text: 'Muitas peças possuem apenas uma unidade disponível, tornando cada compra exclusiva.',
    image: 'https://plus.unsplash.com/premium_photo-1761430331750-293630e52e9b?q=80&w=1170&auto=format&fit=crop',
  },
  {
    title: 'Higienização',
    text: 'Todos os produtos passam por processos de limpeza e preparação antes do envio.',
    image: 'https://plus.unsplash.com/premium_photo-1682129254917-6c5acb7532ab?q=80&w=1170&auto=format&fit=crop',
  },
  {
    title: 'Trocas e Suporte',
    text: 'Oferecemos suporte ao cliente para dúvidas, acompanhamento de pedidos e orientações.',
    image: 'https://plus.unsplash.com/premium_photo-1661578391277-fc640d8ea46c?q=80&w=1632&auto=format&fit=crop',
  },
];