# Relatório de status — Sprint 2

Situação de cada item da Sprint 2 do roteiro, com impedimentos e percentual do backlog concluído. Os números de testes e de cobertura foram medidos. Os percentuais e a classificação de "concluído" são estimativas feitas a partir do repositório e estão marcados como **a confirmar pelo grupo**.

## Situação item por item

| Item | Descrição | Status | Evidência / próximo passo |
|---|---|---|---|
| 2.1 | CRUD e sincronização com a API | Concluído | O aplicativo consome a API: catálogo, CRUD de produtos (só administrador), contas, pedidos e Checkout Pro. O defeito do botão de excluir na web foi corrigido e está coberto por teste. Próximo passo: pagamento de teste com credenciais de sandbox. |
| 2.2 | Geração de dados em JSON | Concluído | `GET /api/reports/sales` (só administrador) e botão de exportar na tela Gerenciar produtos. Download na web testado no E2E; caminho de aparelho só em mock. Próximo passo: smoke test em aparelho. |
| 2.3 | Sprint Review e relatório de status | Concluído no repositório | `docs/Sprint-2/SPRINT-REVIEW.md` e este documento. Data e participantes da revisão: a confirmar pelo grupo. |
| 2.4 | Documento de encerramento | Concluído no repositório | `docs/Sprint-2/ENCERRAMENTO.md`, com entregas, estimado e real, desempenho por integrante e lições aprendidas. Esforço real: a confirmar pelo grupo. |
| 2.5 | Dashboard em Python | Concluído | `dashboard/`: lê o JSON e gera PNG e HTML com quatro gráficos e o resumo. 4 testes passam. |
| 2.6 | Testes automatizados | Concluído, com ressalvas | 96 testes passam (39 do aplicativo, 47 da API, 6 E2E, 4 do dashboard). Cobertura da API acima da meta; a do aplicativo, no escopo da meta, é 65,8 % de linhas, acima dos 60 % previstos (32,1 % no `src/` inteiro, só informação). CI configurado, ainda não executado no GitHub. Detalhes em `PLANO-DE-TESTES.md`. |
| 2.7 | Pitch | **Pendente do grupo** | Gravação do grupo com todos os integrantes; fora do que foi feito no repositório. |
| 2.8 | Documento final em PDF | Concluído | `docs/entrega-final/`: PDF de 43 páginas gerado a partir destes documentos, com os itens 1.1 a 2.8, código, telas do aplicativo e painel do dashboard. Formatação conferida por `test_documento.py` e por leitura. Falta ao grupo compactar o projeto e enviar pelo Blackboard. |

## Impedimentos e riscos

| Impedimento | Efeito | Situação |
|---|---|---|
| Sem aparelho físico para testar | Exportação do JSON no Android e iOS ficou só com teste simulado | Aberto. Fazer um smoke test em aparelho ou Expo Go. |
| Mercado Pago só com API simulada | Nunca houve pagamento real em teste | Aberto. Nenhuma credencial real deve entrar no repositório. |
| CI sem execução no GitHub | Um erro de workflow só aparece no primeiro pull request. O dashboard foi testado em Python 3.14 aqui e o CI usa 3.12 | Aberto até o primeiro pull request |
| DER e `schema.sql` desatualizados desde a Sprint 1 | Documentação técnica não correspondia ao banco | Resolvido, com teste automatizado |
| Botão de excluir produto morto na web | Operação de exclusão impossível no navegador | Resolvido, com teste E2E e de unidade |
| Concentração do trabalho de código em poucos integrantes | Risco de entrega e de avaliação desigual | Aberto. Quatro integrantes sem commits no repositório; o grupo deve registrar o trabalho feito fora do código. |

## Percentual do backlog concluído (estimativa, a confirmar pelo grupo)

**Backlog da Sprint 1** (documento de setembro): 16 itens, PB01 a PB16, somando 82 Story Points. Quinze itens estão entregues por inteiro: **79 de 82 pontos (96,3 %)**. Os 3 pontos que faltam são o PB11, recuperação de senha, entregue em parte: as telas existem e navegam entre si, mas nenhuma chama a API — não há envio de código por e-mail, conferência do código nem gravação da nova senha. A conferência item por item está em `ENCERRAMENTO.md`. A mudança de arquitetura da Sprint 2 (catálogo vindo da API em vez do SQLite local) mudou onde o catálogo vive, mas não o resultado entregue.

**Itens da Sprint 2** (2.1 a 2.8, sem Story Points atribuídos): 7 de 8 concluídos no repositório — 2.1 a 2.6 e o 2.8, que é esta documentação final — e 1 pendente do grupo (2.7). Por contagem de itens, **87,5 % concluído**. Como os itens não foram pontuados, este percentual não pondera esforço.

Os dois percentuais dependem de o grupo concordar com o que conta como "concluído".
