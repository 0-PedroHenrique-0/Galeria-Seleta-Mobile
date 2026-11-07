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

export type OrderItem = { id: number; name: string; size: string; quantity: number; price: number; image: string };

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
  paymentStatus: 'AGUARDANDO_PAGAMENTO' | 'EM_ANALISE' | 'APROVADO' | 'RECUSADO' | 'CANCELADO' | 'EXPIRADO' | 'REEMBOLSADO' | 'REVISAO_MANUAL';
  fulfillmentStatus: 'NAO_INICIADO' | 'PROCESSANDO' | 'ENVIADO' | 'ENTREGUE';
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  discount: number;
  total: number;
  address: Address;
  checkoutUrl?: string | null;
};
