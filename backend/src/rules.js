export class HttpError extends Error { constructor(status, message) { super(message); this.status = status; } }
export const toCents = value => Number.isFinite(Number(value)) ? Math.round(Number(value) * 100) : NaN;

export function validateProduct(body) {
  const p = {
    name: String(body?.name ?? '').trim(), category: String(body?.category ?? '').trim(),
    description: String(body?.description ?? '').trim(), image: String(body?.image ?? '').trim(),
    categoryId: Number(body?.categoryId), stock: Number(body?.stock), price: toCents(body?.price),
    discount: body?.discountPrice == null || body.discountPrice === '' ? null : toCents(body.discountPrice),
  };
  if (!p.name || !p.category || !p.description || !p.image || !Number.isInteger(p.categoryId) || p.categoryId < 1 ||
      !Number.isInteger(p.stock) || p.stock < 0 || !Number.isInteger(p.price) || p.price < 0 ||
      (p.discount != null && (!Number.isInteger(p.discount) || p.discount < 0 || p.discount > p.price))) {
    throw new HttpError(400, 'Dados do produto inválidos.');
  }
  return p;
}

export function quote(body, findProduct) {
  if (!Array.isArray(body?.items) || body.items.length === 0 || body.items.length > 30) throw new HttpError(400, 'Carrinho inválido.');
  const shippingCode = body.shippingCode;
  const shippingCents = { standard: 2990, express: 5490 }[shippingCode];
  if (!shippingCents) throw new HttpError(400, 'Frete inválido.');
  const seen = new Set();
  let subtotalCents = 0;
  const items = body.items.map(input => {
    const id = Number(input.id), quantity = Number(input.quantity), size = String(input.size ?? '').trim();
    const key = `${id}:${size}`;
    if (!Number.isInteger(id) || !Number.isInteger(quantity) || quantity < 1 || quantity > 20 ||
        !['P', 'M', 'G', 'GG'].includes(size) || seen.has(key)) throw new HttpError(400, 'Item inválido no carrinho.');
    seen.add(key);
    const product = findProduct(id);
    if (!product || product.stock < quantity) throw new HttpError(409, 'Produto indisponível ou estoque insuficiente. Atualize o carrinho.');
    const unitPriceCents = product.discount_price_cents ?? product.price_cents;
    subtotalCents += unitPriceCents * quantity;
    return { product_id: id, name: product.name, size, quantity, unit_price_cents: unitPriceCents, image: product.image };
  });
  return { items, shippingCode, subtotalCents, shippingCents, totalCents: subtotalCents + shippingCents };
}

export function validateAddress(value) {
  const address = {
    street: String(value?.street ?? '').trim(), city: String(value?.city ?? '').trim(),
    state: String(value?.state ?? '').trim().toUpperCase(), zip: String(value?.zip ?? '').replace(/\D/g, ''),
    complement: String(value?.complement ?? '').trim(),
  };
  if (address.street.length < 5 || address.city.length < 2 || !/^[A-Z]{2}$/.test(address.state) || !/^\d{8}$/.test(address.zip) || address.zip === '00000000') {
    throw new HttpError(400, 'Preencha um endereço de entrega válido.');
  }
  return address;
}
