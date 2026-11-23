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

## Como executar os testes

São quatro camadas, com 96 testes no total. Os três primeiros comandos rodam na raiz:

```bash
npm test          # 39 testes de unidade do aplicativo (Jest + Testing Library)
npm run test:api  # 47 testes da API (node --test, em banco SQLite temporário)
npm run test:e2e  # 6 testes de ponta a ponta (Playwright na build web do Expo)
```

O E2E sobe a API de verdade e gera a build web, então ele precisa das dependências dos **dois** projetos: num clone novo, rode `npm install` na raiz e também dentro de `backend/`, senão ele falha. Na primeira execução, instale o navegador: `npx playwright install chromium`.

O dashboard tem os próprios testes, em Python:

```bash
cd dashboard
python -m pip install -r requirements.txt
python -I -m unittest   # 4 testes
```

O documento final em PDF também é conferido por programa: em `docs/entrega-final/`, `python -I gerar_documento.py` gera o PDF e `python -I -m unittest` roda as 9 conferências de formatação.

O workflow `.github/workflows/testes.yml` roda as quatro camadas em pull request, cada uma em um job. O plano de testes completo, com o que ficou **fora** da verificação, está em [docs/Sprint-2/PLANO-DE-TESTES.md](docs/Sprint-2/PLANO-DE-TESTES.md).

## Estrutura

- `App.tsx` — navegação e retorno por deep link.
- `src/database.ts` e `src/api.ts` — acesso à API.
- `src/data.ts` — dados iniciais e conteúdo local.
- `src/storage.ts` — persistência AsyncStorage.
- `src/screens/ProductAdminScreen.tsx` — CRUD de produtos.
- `database/schema.sql` — script SQL das tabelas principais.
- `docs/Sprint-1/DER.md` — Diagrama Entidade-Relacionamento.
- `backend/` — API, banco SQLite, autenticação e pagamentos.

## Exportar dados de vendas

Em Perfil, Gerenciar produtos (só para administrador), o botão **EXPORTAR DADOS (JSON)** busca o relatório em `GET /api/reports/sales` e gera o arquivo `vendas-galeria-seleta-AAAA-MM-DD.json`. Na web ele é baixado pelo navegador; no celular é salvo e aberto no compartilhamento do sistema. Esse arquivo alimenta o dashboard em `dashboard/`.

## Persistência

O banco SQLite da API fica em `backend/data/galeria.sqlite` por padrão. O catálogo inicial é copiado de `backend/src/catalog.json`. O arquivo `database/schema.sql` e o DER em `docs/Sprint-1/DER.md` descrevem o banco atual, com as seis tabelas reais (`users`, `products`, `orders`, `order_items`, `payments` e `webhook_events`): foram corrigidos na Sprint 2 e um teste da API compara o `schema.sql` com o banco criado por `backend/src/db.js`, falhando se os dois divergirem.

## Sprint 1

As evidências técnicas da primeira Sprint estão organizadas em `docs/Sprint-1/` e `database/`.

## Pagamento com Mercado Pago

O checkout usa Checkout Pro: a API cria o pedido e a preferência, o app abre o pagamento no Mercado Pago e acompanha a confirmação pela API. Configure a API e as credenciais conforme [backend/README.md](backend/README.md).

Para desenvolvimento local, defina `EXPO_PUBLIC_API_URL` para um endereço da API acessível pelo emulador ou aparelho. Em produção, use uma API pública HTTPS e configure o webhook no painel do Mercado Pago. Os pagamentos reais dependem das credenciais da conta da loja.
