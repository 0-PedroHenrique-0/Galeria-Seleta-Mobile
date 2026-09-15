export type Product = {
  id: number;
  categoryId: number;
  category: string;
  name: string;
  description: string;
  price: number;
  discountPrice?: number | null;
  stock: number;
  image: string;
};

export type CartItem = Product & {
  size?: string;
  quantity: number;
};

export type Address = {
  id: string;
  label: string;
  street: string;
  city: string;
  state: string;
  zip: string;
  complement?: string;
  isDefault: boolean;
};

export type Order = {
  id: string;
  date: string;
  status: 'PROCESSANDO' | 'ENVIADO' | 'ENTREGUE';
  items: CartItem[];
  subtotal: number;
  shipping: number;
  discount: number;
  total: number;
  payment: string;
  address: Address;
};