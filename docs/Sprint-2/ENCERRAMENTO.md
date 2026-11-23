# Documento de encerramento — Projeto Galeria Seleta Mobile

Fecha as duas Sprints do PI IV: o que foi entregue, o esforço estimado contra o real, o desempenho de cada integrante conforme o histórico do repositório e as lições aprendidas. Onde o dado não foi registrado durante o projeto, está escrito **a confirmar pelo grupo**; nenhum número de esforço foi inventado.

## Entregas

**Sprint 1 (setembro)**: visão e escopo, planejamento ágil, pesquisa de mercado e wireframes, aplicativo React Native com Expo e TypeScript (navegação, catálogo, carrinho, checkout, pedidos, perfil), CRUD de produtos, DER, script SQL, API Node/Express inicial, CI e capturas de evidência.

**Entre as Sprints**: pedidos e Checkout Pro do Mercado Pago, na API e no aplicativo, com o primeiro teste de integração (checkout e reconciliação de pagamento).

**Sprint 2 (novembro)**:
- relatório de vendas em JSON na API (`GET /api/reports/sales`, só administrador);
- botão de exportar esse JSON na tela Gerenciar produtos;
- dashboard em Python que lê o arquivo e gera o painel em PNG e HTML;
- 96 testes automatizados em quatro camadas (39 do aplicativo, 47 da API, 6 E2E e 4 do dashboard), todos passando;
- workflow de CI com quatro jobs;
- DER e `schema.sql` corrigidos para as seis tabelas reais;
- correção do botão de excluir produto na build web;
- documentos de plano de testes, Sprint Review, relatório de status e este encerramento.

**Fora do que o repositório mostra**: o pitch (item 2.7) é uma gravação do grupo e continua pendente.

## Estimado contra real

O backlog da Sprint 1 foi estimado em Story Points por Planning Poker (esforço relativo, não horas). **O esforço real não foi registrado durante o projeto**, então a coluna correspondente fica para o grupo preencher. Os pontos por item foram lidos do documento de setembro e devem ser conferidos; o total de 82 pontos não depende dessa leitura.

| ID | Item | Estimado (SP) | Entregue | Esforço real |
|---|---|---|---|---|
| PB01 | Login e sessão | 3 | Sim | a confirmar pelo grupo |
| PB02 | Cadastro de usuário | 5 | Sim | a confirmar pelo grupo |
| PB03 | Listagem de produtos | 5 | Sim | a confirmar pelo grupo |
| PB04 | Detalhe do produto | 3 | Sim | a confirmar pelo grupo |
| PB05 | Carrinho de compras | 8 | Sim | a confirmar pelo grupo |
| PB06 | Checkout e interface de pagamento | 8 | Sim | a confirmar pelo grupo |
| PB07 | CRUD de produtos | 8 | Sim | a confirmar pelo grupo |
| PB08 | Busca e filtros | 5 | Sim | a confirmar pelo grupo |
| PB09 | Endereços | 5 | Sim | a confirmar pelo grupo |
| PB10 | Pedidos | 5 | Sim | a confirmar pelo grupo |
| PB11 | Recuperação de senha | 3 | Parcial — fluxo de telas, sem back-end | a confirmar pelo grupo |
| PB12 | DER e script SQL | 5 | Sim, corrigido na Sprint 2 | a confirmar pelo grupo |
| PB13 | API Node inicial | 8 | Sim | a confirmar pelo grupo |
| PB14 | SQLite local | 5 | Sim na Sprint 1; hoje o aplicativo não tem banco local — o SQLite é o da API | a confirmar pelo grupo |
| PB15 | Wireframes e fluxo | 3 | Sim | a confirmar pelo grupo |
| PB16 | Relatório de riscos e status | 3 | Sim | a confirmar pelo grupo |
| | **Total** | **82** | | |

Itens da Sprint 2 (2.1 a 2.8): não foram pontuados em Story Points. Estimativa e esforço real: a confirmar pelo grupo.

Somando só o que está entregue por inteiro, são **79 de 82 pontos (96,3 %)**. Os 3 pontos restantes são o PB11: a recuperação de senha existe como interface — as três etapas de `ForgotPasswordScreen` avançam entre si, mas só a última confere alguma coisa, deixando o botão desabilitado enquanto a nova senha estiver vazia ou diferente da confirmação; o e-mail e o código de seis dígitos passam para a etapa seguinte sem nenhuma conferência —, e nenhuma tela chama a API. Não há envio de código por e-mail, conferência do código digitado nem gravação da nova senha; `ChangePasswordScreen` ainda avisa que a alteração "foi salva localmente", e nada é salvo. Entregar o PB11 por inteiro exige rota na API, token de redefinição com prazo e envio de e-mail; nada disso foi feito.

Três desvios em relação ao planejado, todos medidos pelo repositório: o catálogo saiu do SQLite dentro do aplicativo e passou a vir da API, o modelo de dados do DER tinha de ser refeito porque descrevia tabelas que nunca existiram no banco real, e o PB11 ficou nas telas.

## Desempenho da equipe

Baseado no histórico do repositório (`git log`) até o início da Sprint 2, mais os commits desta Sprint. Commit mede só trabalho de código e documentação versionados: reuniões, pesquisa e escrita fora do repositório não aparecem aqui e devem ser acrescentadas pelo grupo.

| Integrante | Commits | Contribuição |
|---|---|---|
| Pedro Henrique Teixeira Silva | 5 (3 como "Pedro Henrique" e 2 como "0-PedroHenrique-0", contas que atribuímos à mesma pessoa; mais 2 merges de pull request) | Criou o projeto e o aplicativo base; faz o merge dos pull requests |
| Gustavo Oliveira Fernandes de Andrade | 29 | Sprint 1: catálogo vindo do banco, CRUD de produtos, DER, script SQL, API Node inicial, CI e captura de evidências |
| Vinicius Soares Inocencio | 6 | Pedidos e Checkout Pro do Mercado Pago, na API e no aplicativo, e o primeiro teste de integração |
| Leandro Sato | 11, contando o commit destes documentos | Sprint 2: testes das três camadas, relatório JSON, dashboard e documentação |
| Eduardo Campos Medeiros | 0 | Sem commits no repositório |
| João Pedro Cavanhas Colombo | 0 | Sem commits no repositório |
| Ryan Silva Santos | 0 | Sem commits no repositório |
| Nicolas Thomaz Pinheiro | 0 | Sem commits no repositório |

Leitura: o código foi escrito por quatro dos oito integrantes, com a maior parte do histórico da Sprint 1 em um só. Os commits da Sprint 2 estão em um fork e entram no repositório do grupo por pull request, a ser mergeado por Pedro Henrique. Qualquer contribuição dos outros quatro integrantes fora do repositório deve ser registrada pelo grupo antes da entrega.

## Lições aprendidas

1. **Conferir a documentação contra o código.** O DER e o `schema.sql` da Sprint 1 descreviam `services` e `appointments`, que o roteiro genérico pedia, enquanto o banco real era outro. O erro vinha desde a Sprint 1 e só apareceu quando o DER foi comparado com o banco. Agora um teste compara o `schema.sql` com o banco criado pelo `db.js`.
2. **Teste na plataforma que o usuário usa.** O botão de excluir produto não fazia nada na web porque `Alert.alert` não funciona no react-native-web. Só apareceu quando o E2E tentou excluir pela interface. Quando um recurso depende da plataforma, o teste precisa cobrir cada uma.
3. **Separar regra de rota.** Mover validação de produto, validação de endereço e cotação do carrinho para um módulo próprio na API permitiu testá-las sem servidor, de forma rápida e precisa.
4. **Simulação tem limite e precisa ser declarada.** O Mercado Pago e o sistema de arquivos do aparelho foram simulados nos testes. É um bom compromisso para o prazo, mas o plano de testes diz com clareza o que isso deixa sem verificação.
5. **Cobertura mede o que se instrumenta.** A cobertura do aplicativo no escopo da meta ficou em 65,8 % de linhas (32,1 % no `src/` inteiro, que inclui as telas) e o E2E, que exercita a maioria das telas, não entra na medição. Número baixo não significa tela sem teste, mas também não prova que está coberta.
6. **Registrar o esforço enquanto acontece.** A Sprint 1 pediu evidências durante o desenvolvimento, e para esforço real e participação isso não aconteceu: hoje o estimado contra o real e o trabalho fora do código dependem da memória do grupo.
7. **Distribuir o código.** Quatro integrantes sem commits é um risco de projeto e de avaliação. Em uma próxima Sprint, cada integrante deve ter pelo menos uma tarefa de código ou de teste atribuída desde o planejamento.
8. **Validar os requisitos do roteiro antes de congelar a arquitetura**, lição da Sprint 1 que continuou valendo: a mudança do catálogo local para a API é parte do mesmo problema.
