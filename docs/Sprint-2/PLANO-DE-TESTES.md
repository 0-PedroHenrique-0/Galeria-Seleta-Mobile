# Plano de testes — Sprint 2

Este documento diz o que foi testado, com qual ferramenta, em qual camada e com que resultado, e deixa claro o que **não** foi testado. Os critérios de aceite (CA-01 a CA-13) vêm da Spec da entrega final.

## Camadas e números

Todos os números abaixo foram medidos por execução na máquina de desenvolvimento.

| Camada | Ferramenta | Onde está | Testes | Resultado |
|---|---|---|---|---|
| Unitária do aplicativo | Jest (`jest-expo`) e Testing Library | `tests/unit/` (9 arquivos) | 39 | passam |
| Unitária e de integração da API | `node --test` com SQLite temporário | `backend/test/` (5 arquivos) | 47 | passam |
| Ponta a ponta (E2E) | Playwright na build web, contra a API real em banco temporário | `tests/e2e/` | 6 (cerca de 31 s) | passam |
| Dashboard em Python | `unittest` | `dashboard/test_gerar_dashboard.py` | 4 | passam |
| **Total** | | | **96** | **todos passam** |

Os 47 testes da API incluem o teste que confere o `database/schema.sql` com as tabelas do banco real (CA-12), escrito junto com os documentos da Sprint 2. Antes dele eram 45 testes na API; o 47.º, escrito na revisão final, confere a sessão expirada. Outros 4 testes, em `tests/unit/productDatabase.test.ts`, foram acrescentados ao aplicativo para cobrir o cliente do CRUD de produtos, e mais 2 em `tests/unit/storage.test.ts`, na revisão final, para cobrir a leitura e a gravação de endereços.

Como rodar: `npm test` (aplicativo), `npm run test:api` (API) e `npm run test:e2e` (E2E), todos na raiz, e `python -I -m unittest` dentro de `dashboard/`. O workflow `.github/workflows/testes.yml` roda as quatro camadas em pull request, cada uma em um job separado.

## Critério de aceite, teste e resultado

| Critério | Teste que o cobre | Camada | Resultado |
|---|---|---|---|
| CA-01 Subtotal usa o preço promocional | `cart.test.ts` (subtotal com promoção); `components.test.tsx` (ProductCard mostra o preço promocional e o cheio riscado); `rules.test.js` (quote aplica o preço promocional) | Unitária do app e da API | Passa |
| CA-02 Preço do banco prevalece sobre o enviado pelo cliente | `rules.test.js` (quote ignora o preço enviado); `api.test.js` (cotação sobre o preço do banco); `checkout.test.js` (checkout calcula no servidor) | Unitária e integração da API | Passa |
| CA-03 Cliente comum recebe 403 ao criar, alterar ou excluir produto, e nada muda | `api.test.js` (cliente comum não cria, não altera e não exclui; o produto continua igual depois) | Integração da API | Passa |
| CA-04 CEP inválido: 400 e nenhum pedido gravado | `api.test.js` (checkout recusa CEP inválido e confere que o número de pedidos não mudou); `rules.test.js` (validateAddress recusa CEP curto ou zerado) | Integração e unitária da API | Passa |
| CA-05 Webhook sem assinatura válida: 401 e pedido não aprovado | `checkout.test.js` (webhook sem assinatura e com assinatura inválida devolvem 401; pagamento com valor divergente não aprova o pedido); `mercado-pago.test.js` (assinatura correta, de outro segredo, campos faltando, formato errado, sem segredo configurado) | Integração e unitária da API | Passa |
| CA-06 Total do checkout na web igual ao da cotação da API | `compra.spec.ts` (visitante cria conta, monta o carrinho e vê no checkout o total da API) | E2E | Passa |
| CA-07 Admin insere, altera, consulta e exclui produto pela tela | `admin-produtos.spec.ts` (insere, consulta, altera e exclui pela interface); `confirmar.test.ts` (confirmação de exclusão: `window.confirm` na web, `Alert.alert` no aparelho); `productDatabase.test.ts` (método e URL de criar, alterar e excluir); `api.test.js` (CRUD do administrador) | E2E, unitária do app e integração | Passa |
| CA-08 Relatório de vendas: JSON para admin, 403 para cliente, 401 para anônimo | `api.test.js` (401 sem token, 403 para cliente comum, 200 com as chaves do relatório, 400 para datas inválidas); `reports.test.js` (faturamento, ticket médio, séries por dia, categoria e status, ranking, período, fuso de Brasília) | Integração e unitária da API | Passa |
| CA-09 Botão de exportar entrega o JSON e mostra erro sem travar | `ProductAdminScreen.test.tsx` (estado de geração, confirmação com o nome do arquivo, erro da API com o botão voltando); `reportExport.test.ts` (dispositivo com e sem compartilhamento, download na web, nome do arquivo); `api.test.ts` (falha de rede vira erro com mensagem); `admin-produtos.spec.ts` (o arquivo baixado é um JSON com resumo) | Unitária do app e E2E | Passa na web; caminho de aparelho só em mock (ver "O que não foi testado") |
| CA-10 Dashboard gera PNG e HTML com os quatro gráficos e o resumo | `test_gerar_dashboard.py` (gera PNG e HTML do exemplo, HTML traz os números do resumo, relatório vazio, JSON incompleto dá erro legível) | Dashboard em Python | Passa |
| CA-11 PDF final com a estrutura e a formatação do roteiro | `docs/entrega-final/test_documento.py` (9 testes: capa, sumário, itens no corpo, fontes e tamanhos, margens com tolerância de 2 mm, numeração de página, seções obrigatórias, imagens dos anexos e integridade do texto acentuado e das tabelas longas) | Conferência por programa e visual | Passa: 9/9 sobre o PDF de 43 páginas, mais leitura página a página |
| CA-12 DER e banco real coincidem | `api.test.js` (schema.sql cobre as tabelas do banco real: cria o `schema.sql` em memória e compara tabelas, colunas, tipos, chave primária e chaves estrangeiras com o banco criado pelo `db.js`). O DER em `docs/Sprint-1/DER.md` foi escrito a partir das mesmas tabelas e conferido por leitura contra o `schema.sql` | Integração da API | Passa para o `schema.sql`; DER conferido por leitura |
| CA-13 CI roda as camadas em pull request e falha se uma falhar | `.github/workflows/testes.yml`, com quatro jobs (aplicativo, API, E2E, dashboard) | CI | Configurado; **ainda não executado no GitHub**, só vai rodar no primeiro pull request |

## Cobertura medida

Medida com `npx jest --coverage` e `node --test --experimental-test-coverage`. A meta escrita na Spec era 70 % de linhas na API e 60 % nos módulos do aplicativo que não são telas; ela não derruba o CI nesta entrega.

| Parte | Linhas | Ramos | Observação |
|---|---|---|---|
| API (`backend/src`) | de 87,4 % a 100 % por arquivo: `reports.js` e `rules.js` 100 %, `auth.js` 97,5 %, `db.js` 95,5 %, `mercado-pago.js` 95,2 %, `server.js` 87,4 % | `server.js` 65,8 %; os demais de 75 % a 100 % | Meta atingida. O total "all files" da ferramenta (96,9 % de linhas) inclui os próprios arquivos de teste, então não serve como número da API |
| Aplicativo, no escopo da meta | **65,8 %** | 65,1 % | **Meta de 60 % atingida.** Módulos do escopo definido na Spec: `src/api.ts`, `src/storage.ts`, `src/productDatabase.ts`, `src/cart.ts`, `src/reportExport.ts` e `src/components/**` |
| Aplicativo, `src/` inteiro (só informação) | 32,1 % | 21,5 % | Inclui as telas, que nunca estiveram no escopo da meta |

Comando do escopo da meta: `npx jest --coverage` com `--collectCoverageFrom` limitado aos caminhos acima. A meta não foi alterada depois da medição.

Dentro do escopo, `cart.ts` e `reportExport.ts` têm 100 %; `Button`, `Field`, `ProductCard` e `Screen` têm 100 % de linhas; `storage.ts` 92,9 %; `productDatabase.ts` 85,7 %; `api.ts` 84 %. Na primeira medição, antes dos testes de `productDatabase.ts`, o escopo estava em 58,3 % de linhas, 1,7 ponto abaixo da meta, porque esse módulo, que é o cliente do CRUD de produtos, não tinha nenhum teste. Os 4 testes novos cobrem o método e a URL de cada operação. Na revisão final, os 2 testes de endereços levaram `storage.ts` de 71,4 % para 92,9 % de linhas; a medição acima é a feita depois de todos eles.

**Ainda sem cobertura no escopo:** `Header.tsx` e `Footer.tsx` (0 %) e a linha 31 de `storage.ts`. Ficam como pendência para a próxima evolução.

As telas (Carrinho, Checkout, Pedidos, Perfil, Cadastro, Endereços e outras) não têm teste de unidade. Elas são percorridas pelos fluxos E2E, mas o Playwright roda a build web sem instrumentação de cobertura, então esse esforço não aparece em nenhum dos dois números.

## O que não foi testado

- **Pagamento real no Mercado Pago.** Todos os testes usam a API do Mercado Pago simulada. Nenhuma credencial real está no repositório, e o E2E de compra para na tela de checkout, sem chegar à página do Mercado Pago.
- **Caminho de arquivo em aparelho físico.** A exportação do JSON no Android e no iOS (gravar o arquivo e abrir o compartilhamento) só foi exercitada com o módulo de arquivos simulado em teste de unidade. O download na web foi exercitado de verdade pelo E2E. Falta um smoke test em aparelho ou no Expo Go.
- **Aplicativo nativo em emulador.** O E2E roda na build web do Expo, no Chromium. Comportamento específico de Android e iOS (navegação nativa, teclado, `Alert.alert` no aparelho) não foi coberto por E2E.
- **Execução no GitHub Actions.** O workflow não foi executado no GitHub antes desta entrega. Um ponto a confirmar na primeira execução: o dashboard foi testado aqui em Python 3.14 e o CI usa 3.12.

## O que não se aplica a esta entrega

- **JMeter (desempenho e estresse).** Não se aplica porque a API é um protótipo acadêmico com banco SQLite local, e a Spec não define carga esperada nem meta de tempo de resposta. Um teste de carga sem meta escrita não teria contra o que ser comparado, e o roteiro da Sprint 2 pede testes unitários, de integração e E2E.
- **Teste de usabilidade com pessoas.** Não se aplica porque a Spec não prevê recrutar usuários nem um roteiro de observação, e o prazo da Sprint não comporta. Os fluxos E2E (cadastro, compra, administração) verificam que o caminho principal funciona, mas isso não substitui observar pessoas usando o aplicativo.

## Defeitos encontrados durante os testes

1. **Botão de excluir produto não fazia nada na build web.** `Alert.alert` não faz nada no react-native-web, então a confirmação nunca aparecia e a exclusão nunca acontecia. Foi corrigido com confirmação por plataforma (`Alert.alert` no aparelho, `window.confirm` na web) e ficou coberto por teste E2E e de unidade.
2. **DER e `schema.sql` descreviam um modelo que não existe.** Falavam de `services` e `appointments`, herança do enunciado genérico do roteiro, e não tinham pedidos nem pagamentos, enquanto o banco real tem `users`, `products`, `orders`, `order_items`, `payments` e `webhook_events`. Os dois foram reescritos a partir de `backend/src/db.js`, e o teste do CA-12 impede que voltem a divergir.
