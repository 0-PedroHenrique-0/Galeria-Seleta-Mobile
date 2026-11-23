import { HttpError } from './rules.js';

const reais = cents => Math.round(cents) / 100;
const parseDate = (value, label) => {
  if (value == null || value === '') return null;
  const text = String(value);
  const date = new Date(`${text}T00:00:00.000Z`);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(text) || Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== text) {
    throw new HttpError(400, `Data "${label}" inválida. Use o formato AAAA-MM-DD.`);
  }
  return text;
};

export function salesReport(db, { from, to } = {}) {
  const de = parseDate(from, 'from');
  const ate = parseDate(to, 'to');
  if (de && ate && de > ate) throw new HttpError(400, 'Período inválido: a data inicial vem depois da final.');
  const range = `AND (? IS NULL OR date(o.created_at, '-03:00') >= ?) AND (? IS NULL OR date(o.created_at, '-03:00') <= ?)`;
  const args = [de, de, ate, ate];
  const approved = `o.payment_status = 'APROVADO' ${range}`;

  const total = db.prepare(`SELECT COUNT(*) AS pedidos, COALESCE(SUM(o.total_cents), 0) AS cents,
    COUNT(DISTINCT o.user_id) AS clientes FROM orders o WHERE ${approved}`).get(...args);
  const itens = db.prepare(`SELECT COALESCE(SUM(i.quantity), 0) AS itens FROM order_items i
    JOIN orders o ON o.id = i.order_id WHERE ${approved}`).get(...args).itens;
  const porDia = db.prepare(`SELECT date(o.created_at, '-03:00') AS data, COUNT(*) AS pedidos, SUM(o.total_cents) AS cents
    FROM orders o WHERE ${approved} GROUP BY data ORDER BY data ASC`).all(...args);
  const porCategoria = db.prepare(`SELECT COALESCE(p.category, 'Sem categoria') AS categoria, SUM(i.quantity) AS itens,
    SUM(i.quantity * i.unit_price_cents) AS cents FROM order_items i JOIN orders o ON o.id = i.order_id
    LEFT JOIN products p ON p.id = i.product_id WHERE ${approved}
    GROUP BY categoria ORDER BY cents DESC, categoria ASC`).all(...args);
  const porStatus = db.prepare(`SELECT o.payment_status AS status, COUNT(*) AS pedidos FROM orders o
    WHERE 1 = 1 ${range} GROUP BY o.payment_status ORDER BY pedidos DESC, status ASC`).all(...args);
  const produtos = db.prepare(`SELECT i.product_id AS id, MAX(i.name) AS nome, SUM(i.quantity) AS itens,
    SUM(i.quantity * i.unit_price_cents) AS cents FROM order_items i JOIN orders o ON o.id = i.order_id
    WHERE ${approved} GROUP BY i.product_id ORDER BY cents DESC, id ASC`).all(...args);

  return {
    geradoEm: new Date().toISOString(),
    periodo: { de, ate },
    resumo: {
      pedidos: total.pedidos, faturamento: reais(total.cents),
      ticketMedio: total.pedidos ? reais(total.cents / total.pedidos) : 0,
      itensVendidos: itens, clientes: total.clientes,
    },
    porDia: porDia.map(r => ({ data: r.data, pedidos: r.pedidos, faturamento: reais(r.cents) })),
    porCategoria: porCategoria.map(r => ({ categoria: r.categoria, itens: r.itens, faturamento: reais(r.cents) })),
    porStatus: porStatus.map(r => ({ status: r.status, pedidos: r.pedidos })),
    produtos: produtos.map(r => ({ id: r.id, nome: r.nome, itens: r.itens, faturamento: reais(r.cents) })),
  };
}
