# API Galeria Seleta

API Node.js + Express + SQLite para catálogo, contas, pedidos e Checkout Pro do Mercado Pago. Requer Node.js 22.13 ou superior (o módulo `node:sqlite` ainda é experimental nessa versão).

## Configuração

1. Crie `backend/.env` com as variáveis da tabela abaixo e preencha os valores. O Node não carrega o arquivo automaticamente: execute com `node --env-file=.env src/server.js` ou configure as variáveis no serviço de hospedagem. Não envie `.env` ao Git.
2. Crie uma aplicação Checkout Pro no painel do Mercado Pago. Use o Access Token de teste durante a homologação.
3. Quando tiver uma URL pública HTTPS, configure o evento **Pagamentos** em Webhooks com `https://SEU-DOMINIO/api/webhooks/mercado-pago` e copie a assinatura secreta para `MP_WEBHOOK_SECRET`. O checkout pode ser iniciado antes dessa etapa; enquanto isso, a tela do pedido consulta o estado do pagamento pela API.
4. Defina `APP_RETURN_URL=galeriaseleta://checkout/return`. O app tem o esquema `galeriaseleta` em `app.json`. Teste o retorno em um build Android/iOS; `localhost` não serve como URL pública de webhook.
5. Instale com `npm install` e inicie com `node --env-file=.env src/server.js`. Se o ambiente já fornecer as variáveis, use `npm start`. A porta padrão é 3333.

O banco nasce em `backend/data/galeria.sqlite` e recebe os oito produtos iniciais de `src/catalog.json`. Depois disso o catálogo, inclusive as alterações de administrador, vive na API. Faça backup do arquivo de banco e use um volume persistente na hospedagem.

## Variáveis

| Nome | Uso |
| --- | --- |
| `AUTH_SECRET` | Segredo aleatório de pelo menos 32 caracteres para assinar tokens de sessão. |
| `MP_ACCESS_TOKEN` | Access Token privado do Mercado Pago, apenas no backend. |
| `MP_WEBHOOK_SECRET` | Chave secreta gerada ao configurar Webhooks. |
| `APP_RETURN_URL` | Base do deep link do aplicativo, sem ID do pedido. |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | Criam a conta administradora na primeira inicialização; a senha precisa ter ao menos 12 caracteres. O cadastro público desse e-mail fica bloqueado. |
| `APP_ORIGIN` | Origem web permitida pelo CORS, quando aplicável. |
| `DB_PATH` | Caminho opcional para o arquivo SQLite. |
| `PORT` | Porta HTTP local. |

No app, configure `EXPO_PUBLIC_API_URL` com o endereço da API alcançável pelo aparelho. O valor padrão é `http://10.0.2.2:3333` no emulador Android e `http://localhost:3333` nos demais ambientes. Um aparelho físico precisa do IP da máquina na mesma rede para desenvolvimento; produção precisa de HTTPS.

## Endpoints

- `POST /api/auth/register`, `POST /api/auth/login`, `GET/PUT /api/me`
- `GET /api/products`, `GET /api/products/:id`
- `POST/PUT/DELETE /api/products` (somente administrador)
- `POST /api/checkout/quote` e `POST /api/checkout/sessions`
- `GET /api/orders`, `GET /api/orders/:id`, `POST /api/orders/:id/reconcile`
- `POST /api/webhooks/mercado-pago`

Pedidos e cotações são calculados a partir dos preços no banco do servidor. A sessão de checkout usa `idempotencyKey` para reaproveitar a preferência em tentativas repetidas. O webhook verifica a assinatura HMAC, consulta o pagamento na API do Mercado Pago e compara referência, moeda e valor antes de atualizar o pedido. O retorno por deep link não aprova a compra por si só.

O estoque é reservado por 72 horas ao criar a preferência. Pedidos não pagos expiram quando a API é acessada novamente; se uma aprovação chegar depois da liberação e não houver estoque, o pedido passa a `REVISAO_MANUAL`. Esta situação exige atendimento humano. Pix, cartão e boleto são escolhidos no Mercado Pago; o desconto Pix demonstrativo foi removido para manter o valor do app igual ao valor cobrado.

## Testes

`npm test` executa um teste local com API do Mercado Pago simulada. Para homologação real, use credenciais e compradores de teste, confira cartões aprovados/recusados, Pix/boleto pendente, retorno por deep link e o simulador de Webhooks do painel. Segundo a documentação do Mercado Pago, pagamentos criados com credenciais de teste não enviam notificações reais.

Referências: [preferências](https://www.mercadopago.com.br/developers/pt/docs/checkout-pro-preferences/create-payment-preference), [Expo](https://www.mercadopago.com.br/developers/pt/docs/checkout-pro-preferences/mobile-integration/react-native-expo-go), [webhooks](https://www.mercadopago.com.br/developers/pt/docs/checkout-pro-preferences/payment-notifications).
