# Teste de aceite - Sprint 1

## Validação automatizada

Foi adicionada uma validação no GitHub Actions (`.github/workflows/sprint1-validation.yml`) e o fluxo foi executado com sucesso em 27/09/2026.

Resultados confirmados automaticamente:

- `npm install`: **APROVADO**
- `npm run typecheck`: **APROVADO**
- geração do bundle Expo para Android: **APROVADO**
- instalação das dependências do backend: **APROVADO**
- inicialização da API Node: **APROVADO**
- endpoint `GET /health`: **APROVADO**

Essa evidência confirma que o código instala, passa pela checagem TypeScript, gera o bundle Android e que o backend inicia e responde ao endpoint de saúde.

## Cenários funcionais

| ID | Cenário | Resultado esperado | Status |
|---|---|---|---|
| T01 | Compilar o aplicativo mobile | Bundle Android é gerado sem erro | APROVADO - CI |
| T02 | Verificar TypeScript | Projeto passa em `tsc --noEmit` | APROVADO - CI |
| T03 | Inicializar backend | API Node inicia sem erro | APROVADO - CI |
| T04 | Testar saúde da API | `GET /health` responde com sucesso | APROVADO - CI |
| T05 | Abrir Login | Tela de login é exibida | VALIDAR NO DISPOSITIVO |
| T06 | Abrir Cadastro | Tela de cadastro é exibida | VALIDAR NO DISPOSITIVO |
| T07 | Abrir Produtos | Produtos do SQLite são listados | VALIDAR NO DISPOSITIVO |
| T08 | Inserir produto | Novo produto aparece na listagem | VALIDAR NO DISPOSITIVO |
| T09 | Consultar produto | Produto pode ser aberto/visualizado | VALIDAR NO DISPOSITIVO |
| T10 | Alterar produto | Alterações persistem no SQLite | VALIDAR NO DISPOSITIVO |
| T11 | Excluir produto | Produto deixa de aparecer na listagem | VALIDAR NO DISPOSITIVO |
| T12 | Adicionar item ao carrinho | Item aparece no carrinho | VALIDAR NO DISPOSITIVO |
| T13 | Abrir Checkout | Formulário de entrega/pagamento é exibido | VALIDAR NO DISPOSITIVO |

## Evidência

A validação automatizada é executada a cada alteração no Pull Request da Sprint 1. O run de validação confirmou com sucesso o **Mobile typecheck and Expo Android bundle** e o **Backend install and health check**.

Os cenários que exigem interação visual/toque continuam classificados separadamente como validação em dispositivo, pois um pipeline de compilação não simula a interação real do usuário.
