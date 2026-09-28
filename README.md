# Galeria Seleta — Mobile

Aplicativo mobile em **React Native + Expo + TypeScript**, desenvolvido para o PI IV — Desenvolvimento para Dispositivos Móveis.

## Escopo atual

- **Frontend mobile:** React Native + Expo + TypeScript.
- **Banco mobile local:** SQLite com `expo-sqlite`.
- **Persistência complementar:** AsyncStorage para carrinho, sessão, endereços e pedidos.
- **Backend:** configuração inicial em Node.js + Express no diretório `/backend`.
- **Navegação:** React Navigation com stack + tabs inferiores.
- **Identidade visual:** Urban Dark, seguindo o frontend original.
- **Cadastro de produtos:** CRUD local com inserir, consultar, alterar e excluir.
- **Fluxos:** busca, catálogo, filtros/ordenação, detalhe do produto, carrinho, checkout, confirmação, pedidos, perfil, endereços, dados pessoais, alteração de senha, cadastro, login, recuperação de senha, sobre e contato.

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

Depois escolha Android ou iOS pelo Expo CLI. O banco `galeria-seleta.db` é criado automaticamente na primeira inicialização.

## Como executar a API Node

```bash
cd backend
npm install
npm run dev
```

A API inicia em `http://localhost:3333` e disponibiliza endpoint de saúde e CRUD REST de produtos.

## Estrutura

- `App.tsx` — navegação e inicialização do banco local.
- `src/database.ts` — criação e operações SQLite.
- `src/data.ts` — dados iniciais e conteúdo local.
- `src/storage.ts` — persistência AsyncStorage.
- `src/screens/ProductAdminScreen.tsx` — CRUD de produtos.
- `database/schema.sql` — script SQL das tabelas principais.
- `docs/Sprint-1/DER.md` — Diagrama Entidade-Relacionamento.
- `backend/` — configuração da API Node/Express.

## Banco local

O SQLite possui as tabelas principais solicitadas no roteiro:

- `users`
- `appointments`
- `products`
- `services`

Os produtos existentes em `src/data.ts` são usados como carga inicial. Após a inicialização, catálogo, busca, detalhes e CRUD consultam a tabela `products` do SQLite.

## Sprint 1

As evidências técnicas da primeira Sprint estão organizadas em `docs/Sprint-1/` e `database/`.

A integração de pagamento externo permanece como evolução para a etapa seguinte do projeto.
