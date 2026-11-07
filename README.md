# Galeria Seleta — Mobile

Aplicativo mobile em **React Native + Expo + TypeScript**, desenvolvido para o PI IV — Desenvolvimento para Dispositivos Móveis.

## Escopo atual

- **Frontend mobile:** React Native + Expo + TypeScript.
- **Persistência:** SQLite no backend para catálogo, contas, pedidos e pagamentos; AsyncStorage no app para carrinho, endereços e sessão.
- **Backend:** Node.js + Express no diretório `/backend`.
- **Navegação:** React Navigation com stack + tabs inferiores.
- **Identidade visual:** Urban Dark, seguindo o frontend original.
- **Cadastro de produtos:** CRUD na API, restrito ao e-mail de administrador configurado.
- **Fluxos:** busca, catálogo, filtros/ordenação, detalhe do produto, carrinho, checkout, confirmação, pedidos, perfil, endereços, dados pessoais, cadastro, login, sobre e contato.

## Identidade visual

- Fundo: `#0F0F0F`
- Superfície: `#1E1E1E`
- Superfície 2: `#3A3A3A`
- Texto: `#F2F2F0`
- Texto secundário: `#9A9895`
- Acento: `#E8441A`
- Erro: `#C0392B`
- Sucesso: `#27AE60`

## Como executar o aplicativo

```bash
npm install
npx expo start
```

Depois escolha Android ou iOS pelo Expo CLI. Inicie também a API e defina `EXPO_PUBLIC_API_URL` quando o endereço padrão não for acessível pelo aparelho.

## Como executar a API Node

```bash
cd backend
npm install
node --env-file=.env src/server.js
```

A API inicia em `http://localhost:3333`. Configure `backend/.env` antes de executar; veja [backend/README.md](backend/README.md).

## Estrutura

- `App.tsx` — navegação e retorno por deep link.
- `src/database.ts` e `src/api.ts` — acesso à API.
- `src/data.ts` — dados iniciais e conteúdo local.
- `src/storage.ts` — persistência AsyncStorage.
- `src/screens/ProductAdminScreen.tsx` — CRUD de produtos.
- `database/schema.sql` — script SQL das tabelas principais.
- `docs/Sprint-1/DER.md` — Diagrama Entidade-Relacionamento.
- `backend/` — API, banco SQLite, autenticação e pagamentos.

## Persistência

O banco SQLite da API fica em `backend/data/galeria.sqlite` por padrão. O catálogo inicial é copiado de `backend/src/catalog.json`. O arquivo `database/schema.sql` e os documentos da Sprint 1 registram a estrutura anterior do projeto.

## Sprint 1

As evidências técnicas da primeira Sprint estão organizadas em `docs/Sprint-1/` e `database/`.

## Pagamento com Mercado Pago

O checkout usa Checkout Pro: a API cria o pedido e a preferência, o app abre o pagamento no Mercado Pago e acompanha a confirmação pela API. Configure a API e as credenciais conforme [backend/README.md](backend/README.md).

Para desenvolvimento local, defina `EXPO_PUBLIC_API_URL` para um endereço da API acessível pelo emulador ou aparelho. Em produção, use uma API pública HTTPS e configure o webhook no painel do Mercado Pago. Os pagamentos reais dependem das credenciais da conta da loja.
