# Sprint Review — Sprint 2

## Tipo de revisão

Revisão técnica interna do incremento da Sprint 2, feita sobre o código do repositório e sobre a execução dos testes automatizados. Como na Sprint 1, não é feedback de um stakeholder externo: é a avaliação do próprio grupo sobre o que ficou pronto.

Data e participantes: a confirmar pelo grupo.

## O que mudou no produto

- Relatório de vendas em JSON na API (`GET /api/reports/sales`), restrito a administrador.
- Botão de exportar esse JSON na tela Gerenciar produtos.
- Dashboard em Python que lê o arquivo e gera o painel em PNG e HTML.
- Quatro camadas de teste automatizado: unitária do aplicativo, unitária e de integração da API, E2E na build web e testes do dashboard. São 96 testes, todos passando.
- Workflow de CI (`.github/workflows/testes.yml`) com quatro jobs, um por camada.
- Correção do DER e do `schema.sql`, que descreviam tabelas que não existem.
- Correção do botão de excluir produto, que não fazia nada na build web.

## Registro da revisão

| Item apresentado | Avaliação | Ação no Product Backlog | Prioridade |
|---|---|---|---|
| Relatório de vendas em JSON (API) | Devolve resumo, séries por dia, por categoria, por status e ranking de produtos. Só pedido com pagamento aprovado entra em faturamento; datas seguem o horário de Brasília. Cliente comum recebe 403 e anônimo 401, conforme os testes. | Manter. O ranking do dashboard mostra só os 8 primeiros produtos sem avisar no título: deixar isso explícito. | Baixa |
| Botão de exportar dados | Entrega o arquivo na web (download, exercitado no E2E) e no aparelho (gravar e compartilhar, só testado com módulo simulado). Mostra estado de geração, confirmação e erro. | Fazer um smoke test em aparelho físico ou Expo Go antes de dar o caminho nativo como validado. | Alta |
| Dashboard em Python | Roda com um comando sobre o JSON de exemplo versionado e gera PNG e HTML com os quatro gráficos e os números do resumo. Tem 4 testes. | Dar mensagem de erro mais clara quando o JSON editado à mão perde campos internos. | Baixa |
| Testes unitários do aplicativo | 39 testes em 9 arquivos cobrem carrinho, formatação, armazenamento, cliente da API, componentes e a tela de login. Nos módulos do escopo da meta a cobertura é 65,8 % de linhas, acima dos 60 % previstos (o `src/` inteiro, com as telas, fica em 32,1 %). | Escrever testes de unidade para as telas sem cobertura (Carrinho, Checkout, Pedidos, Perfil, Cadastro, Endereços). | Média |
| Testes da API | 47 testes (regras, assinatura do webhook, relatório e integração). Cobertura por arquivo entre 87,4 % e 100 % de linhas, acima da meta de 70 %. | Cobrir os ramos de `server.js` ainda sem teste (65,8 % de ramos). | Baixa |
| Testes E2E | 6 testes em cerca de 31 segundos, na build web contra a API real em banco temporário: compra até o checkout, administração de produtos, exportação, acesso restrito. Não chegam ao Mercado Pago. | Avaliar E2E em emulador Android se o grupo tiver tempo. | Média |
| CI | Quatro jobs configurados, um por camada. Ainda não rodou no GitHub. | Conferir a primeira execução no pull request, em especial o Python 3.12 do dashboard. | Alta |
| DER e `schema.sql` | Reescritos a partir de `backend/src/db.js` (seis tabelas, preços em centavos). Um teste compara o `schema.sql` com o banco criado de verdade. | Manter o teste: qualquer tabela nova no `db.js` exige atualizar o `schema.sql`. | Média |
| Checkout Pro do Mercado Pago | Cria pedido e preferência, reconcilia pagamento e confirma só por pagamento validado; testado com a API do Mercado Pago simulada. Nunca foi exercitado com pagamento real. | Rodar um pagamento de teste com credenciais de sandbox, fora do repositório. | Alta |

## Defeitos encontrados na revisão

1. **Excluir produto na web.** O botão não fazia nada porque `Alert.alert` não funciona no react-native-web. Corrigido com confirmação por plataforma e coberto por teste E2E e de unidade.
2. **Modelo de dados desatualizado.** O DER e o `schema.sql` descreviam `services` e `appointments`, herança do enunciado genérico do roteiro, e não tinham pedidos nem pagamentos. Corrigidos.

## Retrospectiva

**O que funcionou**
- O E2E tentar excluir um produto pela interface foi o que revelou o defeito do botão de excluir na web.
- Separar as regras da API (`rules.js`) das rotas permitiu testá-las sem subir o servidor.
- Um comando por camada de teste, com o mesmo comando no CI.

**O que não funcionou**
- O DER ficou desatualizado desde a Sprint 1 e ninguém percebeu até comparar com o banco.
- A cobertura do aplicativo ficou baixa: a maior parte das telas só é exercitada pelo E2E, que não mede cobertura.
- O trabalho ficou concentrado em poucas pessoas. Quatro integrantes não têm commits no repositório (ver `ENCERRAMENTO.md`).

**O que melhorar na próxima Sprint**
- Conferir a documentação técnica contra o código a cada Sprint, e manter o teste do schema.
- Medir cobertura no CI e registrar a evolução.
- Distribuir tarefas de código entre todos os integrantes e registrar também o trabalho que não gera commit.
