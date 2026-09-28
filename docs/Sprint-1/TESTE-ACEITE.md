# Teste de aceite - Sprint 1

Este roteiro deve ser executado antes do merge/entrega para comprovar o item 1.4: o aplicativo deve compilar e iniciar corretamente.

## Preparação

```bash
npm install
npm run typecheck
npx expo start
```

## Cenários obrigatórios

| ID | Cenário | Resultado esperado | Status |
|---|---|---|---|
| T01 | Abrir o aplicativo | Home carrega sem erro | PENDENTE |
| T02 | Abrir Login | Tela de login é exibida | PENDENTE |
| T03 | Abrir Cadastro | Tela de cadastro é exibida | PENDENTE |
| T04 | Abrir Produtos | Produtos do SQLite são listados | PENDENTE |
| T05 | Inserir produto | Novo produto aparece na listagem | PENDENTE |
| T06 | Consultar produto | Produto pode ser aberto/visualizado | PENDENTE |
| T07 | Alterar produto | Alterações persistem no SQLite | PENDENTE |
| T08 | Excluir produto | Produto deixa de aparecer na listagem | PENDENTE |
| T09 | Adicionar item ao carrinho | Item aparece no carrinho | PENDENTE |
| T10 | Abrir Checkout | Formulário de entrega/pagamento é exibido | PENDENTE |
| T11 | Reiniciar o app | Produtos persistidos continuam disponíveis | PENDENTE |

## Evidência mínima

Após concluir os testes, anexar ao relatório pelo menos:

1. uma captura da Home/app iniciado;
2. uma captura da tela Gerenciar Produtos;
3. uma captura do produto inserido/listado;
4. opcionalmente, captura do terminal sem erros após `npm run typecheck`.

Substitua PENDENTE por APROVADO ou REPROVADO e registre qualquer erro encontrado.
