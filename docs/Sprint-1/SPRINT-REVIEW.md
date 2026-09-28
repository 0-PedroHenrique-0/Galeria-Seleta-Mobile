# Sprint Review - Sprint 1

## Tipo de revisão

Revisão técnica interna realizada sobre o estado atual do projeto, utilizando o código do repositório, o documento da Sprint 1 e os requisitos do roteiro como base.

> Observação: esta revisão não substitui uma apresentação presencial ao professor ou a um stakeholder humano, caso isso seja exigido em sala. Ela registra uma avaliação técnica estruturada do incremento produzido.

## Data

27/09/2026

## Participantes

- Grupo 11
- Revisor técnico assistido por IA: ChatGPT / OpenAI

## Itens revisados

1. Login e Cadastro
2. Home e navegação
3. Listagem, busca e detalhe de produtos
4. CRUD de produtos
5. Carrinho de compras
6. Checkout e formulário de pagamento
7. DER
8. Banco local SQLite
9. API Backend em Node.js
10. Organização técnica da Sprint 1

## Registro da revisão

| Item apresentado | Feedback da revisão técnica | Ação no Product Backlog | Prioridade |
|---|---|---|---|
| Login e Cadastro | As telas estão implementadas e integradas ao fluxo de navegação. | Manter e realizar testes de validação de campos na próxima evolução. | Média |
| Listagem, busca e detalhe de produto | O catálogo passou a consultar os produtos persistidos no SQLite, mantendo busca e navegação para detalhes. | Manter integração com SQLite e evoluir tratamento de estados vazios/erros. | Média |
| CRUD de produtos | Foram implementadas as operações de inserir, consultar, alterar e excluir produtos, atendendo ao cadastro principal solicitado. | Validar todos os cenários no dispositivo e manter mensagens de erro claras. | Alta |
| Carrinho e checkout | O fluxo de carrinho e checkout já existe e apresenta formulário de pagamento. | Integrar Mercado Pago na etapa posterior prevista pelo projeto final. | Alta |
| Navegação e identidade visual | A navegação possui stack, tabs e acesso às principais áreas, preservando a identidade visual definida pelo grupo. | Manter consistência visual nas novas telas. | Baixa |
| DER / SQLite | As entidades Usuários, Agendamentos, Produtos e Serviços foram modeladas e o banco local é inicializado no aplicativo. | Evoluir relacionamentos conforme novas regras de negócio forem implementadas. | Média |
| API Node | A estrutura Node + Express e endpoints REST de produtos foram configurados. | Integrar a API ao aplicativo em etapa posterior, se solicitado. | Média |

## Decisões da Review

- **Itens aceitos nesta revisão técnica:** estrutura das telas, navegação, CRUD de produtos, SQLite, DER, script SQL e configuração inicial da API Node.
- **Itens que precisam de validação adicional:** execução completa do aplicativo em ambiente Expo/dispositivo e testes manuais do CRUD.
- **Novos itens adicionados ao backlog:** integração com Mercado Pago, evolução das validações de formulário e integração futura do app com a API Node.
- **Itens repriorizados:** validação do CRUD e estabilidade do aplicativo permanecem como prioridade antes das evoluções da Sprint seguinte.

## Lições aprendidas

- A implementação inicial já possuía boa parte das interfaces necessárias, mas foi necessário alinhar a arquitetura ao roteiro, principalmente quanto a SQLite, Node, DER e CRUD.
- Centralizar os produtos em uma base local evita divergência entre catálogo, busca e cadastro.
- A documentação técnica deve acompanhar as alterações do código para que relatório e implementação permaneçam coerentes.
- Antes da próxima Sprint, deve ser executado um teste completo do fluxo principal em um ambiente Expo.

## Resultado da revisão

O incremento da Sprint 1 foi considerado tecnicamente coerente com o escopo planejado e com os requisitos implementáveis nesta etapa. As evoluções identificadas foram registradas para a Sprint seguinte, especialmente integração de pagamento externo e maior integração do backend com o aplicativo.
