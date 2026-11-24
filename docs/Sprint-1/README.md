# Evidências técnicas — Sprint 1

Este diretório reúne as evidências técnicas do item 1.5 da Sprint 1 do PI IV.

## Onde ficam os dados

O catálogo vem da API (`/backend`), que guarda os dados em SQLite (`node:sqlite`). O aplicativo não tem banco local: o `AsyncStorage` guarda apenas carrinho, endereços e sessão.

> Registro histórico: na Sprint 1 o catálogo vivia em um SQLite dentro do aplicativo (`expo-sqlite`, banco `galeria-seleta.db`). Isso mudou na Sprint 2, quando o aplicativo passou a consumir a API.

## CRUD de produtos

A tela **Gerenciar produtos**, acessível pelo Perfil, permite:

- inserir produto;
- consultar/listar produtos;
- alterar produto;
- excluir produto.

Pelo aplicativo, as operações passam pela API; criar, alterar e excluir exigem conta de administrador.

## API Node

O diretório `/backend` contém a API Node/Express usada pelo aplicativo: catálogo e CRUD de produtos, contas, pedidos, Checkout Pro do Mercado Pago e o relatório de vendas (veja `backend/README.md`).

## Script SQL e DER

- `database/schema.sql`: as seis tabelas do banco da API (referência documental; o banco é criado por `backend/src/db.js`).
- `docs/Sprint-1/DER.md`: Diagrama Entidade-Relacionamento e descrição dos relacionamentos.
