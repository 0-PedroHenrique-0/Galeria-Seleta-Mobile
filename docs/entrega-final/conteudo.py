# -*- coding: utf-8 -*-
"""Texto do documento final da entrega do PI IV — Galeria Seleta Mobile.

Só conteúdo: quem for atualizar o documento mexe neste arquivo.
A diagramação (fonte, margens, espaçamento, tabelas e imagens) fica em gerar_documento.py.

Cada seção é um dicionário com título, nível (1 = seção, 2 = subseção) e blocos.
Tipos de bloco:
    ("p", texto)        parágrafo com recuo de primeira linha
    ("p0", texto)       parágrafo sem recuo (continuação, observação)
    ("nota", texto)     observação em itálico, sem recuo
    ("lista", [itens])  lista com marcadores
    ("numerada", [itens])
    ("tabela", {"titulo": str|None, "cabecalho": [...], "linhas": [[...]], "pesos": [...]})
    ("codigo", {"titulo": str, "linhas": [str, ...]})
    ("imagem", {"arquivo": str, "legenda": str, "altura_cm": float})
"""

CAPA = {
    "instituicao": "CENTRO UNIVERSITÁRIO SENAC",
    "curso": "TECNOLOGIA EM ANÁLISE E DESENVOLVIMENTO DE SISTEMAS",
    "disciplina": "PI IV — DESENVOLVIMENTO PARA DISPOSITIVOS MÓVEIS",
    "projeto": "PROJETO GALERIA SELETA MOBILE",
    "entrega": "DOCUMENTAÇÃO FINAL — SPRINT 1 E SPRINT 2",
    "grupo": "GRUPO 11",
    "integrantes": [
        ("EDUARDO CAMPOS MEDEIROS", "1143154427"),
        ("PEDRO HENRIQUE TEIXEIRA SILVA", "1143155053"),
        ("GUSTAVO OLIVEIRA FERNANDES DE ANDRADE", "1142439157"),
        ("JOAO PEDRO CAVANHAS COLOMBO", "1143032617"),
        ("LEANDRO SATO", "1142446679"),
        ("RYAN SILVA SANTOS", "1142463435"),
        ("VINICIUS SOARES INOCENCIO", "1142945398"),
        ("NICOLAS THOMAZ PINHEIRO", "1142440716"),
    ],
    "cidade_ano": "São Paulo — 2026",
}

TITULO_SUMARIO = "SUMÁRIO"

SECOES = [
    # ------------------------------------------------------------------ Introdução
    {
        "titulo": "INTRODUÇÃO (ESCOPO)",
        "nivel": 1,
        "blocos": [
            ("p", "O Galeria Seleta Mobile é um aplicativo de e-commerce de moda urbana e peças "
                  "selecionadas, desenvolvido em React Native com Expo e TypeScript. O cliente cria "
                  "uma conta, consulta o catálogo por categoria, abre o detalhe de um produto, monta "
                  "a sacola, informa o endereço de entrega, escolhe o frete e paga pelo Checkout Pro "
                  "do Mercado Pago. O administrador da loja mantém o catálogo pelo próprio aplicativo "
                  "— inserir, consultar, alterar e excluir — e exporta os dados de vendas em JSON "
                  "para o dashboard da disciplina de Análise de Dados e Estatística."),
            ("p", "O produto é sustentado por uma API própria em Node.js com Express e banco SQLite "
                  "(módulo nativo node:sqlite). É a API que guarda usuários, catálogo, pedidos e "
                  "pagamentos, calcula os valores da compra com os preços do banco e conversa com o "
                  "Mercado Pago. O aplicativo consome essa API; nada de dinheiro é calculado no "
                  "celular."),
            ("p", "Este documento reúne todo o conteúdo produzido no semestre, em ordem cronológica. "
                  "A primeira parte retoma os itens 1.1 a 1.6, entregues em setembro, com as "
                  "correções do que mudou desde então: o catálogo passou a vir da API em vez do "
                  "banco local do aplicativo, o pagamento pelo Mercado Pago saiu do papel e o modelo "
                  "de dados foi reescrito para as tabelas que o banco cria de verdade. A segunda "
                  "parte traz os itens 2.1 a 2.8 da Sprint 2: integração com a API, geração do JSON "
                  "de vendas, Sprint Review e relatório de status, encerramento e lições aprendidas, "
                  "dashboard em Python, testes automatizados, roteiro do pitch e os requisitos da "
                  "entrega."),
            ("p", "Dois compromissos valem para o documento inteiro. Primeiro, todo número "
                  "apresentado como medido foi obtido executando o projeto — contagem de testes, "
                  "cobertura, tempo de execução e histórico do repositório. Segundo, o que é "
                  "estimativa do grupo, ou o que depende de uma decisão que ainda não foi tomada, "
                  "está marcado como “a confirmar pelo grupo”, e o que não foi testado está dito "
                  "com todas as letras, na seção 2.6."),
        ],
    },

    # ------------------------------------------------------------- Desenvolvimento
    {
        "titulo": "DESENVOLVIMENTO DO PROJETO",
        "nivel": 1,
        "blocos": [
            ("p", "As seções a seguir seguem o roteiro do Projeto Integrador IV item por item, na "
                  "ordem em que o trabalho aconteceu: primeiro a Sprint 1 (itens 1.1 a 1.6), "
                  "revisada com o que mudou desde a entrega de setembro; depois a Sprint 2 (itens "
                  "2.1 a 2.8), que é o trabalho das semanas 8 a 16."),
            ("p", "Três correções atravessam a parte da Sprint 1 e vale anunciá-las antes: (a) o "
                  "catálogo deixou de ser mantido no SQLite dentro do aplicativo e passou a vir da "
                  "API, de modo que o CRUD do administrador altera o mesmo dado que o cliente "
                  "enxerga; (b) a integração com o Mercado Pago, que na Sprint 1 era um fluxo de "
                  "interface, virou Checkout Pro de verdade na API, com webhook assinado; (c) o DER "
                  "e o script SQL foram reescritos, porque descreviam tabelas de agendamento de "
                  "serviços que nunca existiram no banco do projeto."),
        ],
    },

    {
        "titulo": "Sprint 1 — primeira entrega (semanas 1 a 8), revisada",
        "nivel": 2,
        "blocos": [
            ("p", "A Sprint 1 concentrou a concepção do produto: escopo e requisitos, planejamento "
                  "ágil, pesquisa de mercado e wireframes, configuração do ambiente e telas "
                  "iniciais, modelagem de dados com API Node, e o monitoramento com riscos e Sprint "
                  "Review. O texto abaixo é o da entrega de setembro, corrigido onde o projeto "
                  "evoluiu; cada correção está sinalizada no próprio item."),
        ],
    },

    # 1.1
    {
        "titulo": "1.1. Definição do Escopo e Requisitos",
        "nivel": 2,
        "blocos": [
            ("p", "O documento de visão abaixo define o produto, o problema que ele resolve e a "
                  "tecnologia escolhida. A única linha alterada desde setembro é a da integração de "
                  "pagamento, que deixou de ser “prevista” e passou a estar implementada."),
            ("tabela", {
                "titulo": "Quadro 1 — Visão e escopo do produto",
                "cabecalho": ["Elemento", "Definição"],
                "pesos": [1.1, 3.1],
                "linhas": [
                    ["Produto", "Galeria Seleta Mobile — aplicativo móvel para compra de roupas, "
                                "calçados e peças de moda urbana."],
                    ["Problema", "O cliente precisa encontrar peças selecionadas, verificar preço e "
                                 "estoque, montar o carrinho e concluir a compra em um fluxo simples "
                                 "no celular."],
                    ["Público-alvo", "Consumidores de moda urbana e streetwear que valorizam "
                                     "curadoria de peças e compra pelo celular."],
                    ["Proposta de valor", "Centralizar catálogo, busca, detalhe, carrinho, checkout "
                                          "e acompanhamento de pedidos em uma experiência mobile "
                                          "consistente e direta."],
                    ["Objetivo principal", "Disponibilizar um e-commerce mobile funcional, da "
                                           "descoberta do produto até a confirmação da compra."],
                    ["Tecnologia", "React Native + Expo + TypeScript no aplicativo; Node.js + "
                                   "Express + SQLite (node:sqlite) na API."],
                    ["Pagamento", "Checkout Pro do Mercado Pago, integrado na API e no aplicativo na "
                                  "Sprint 2 (na Sprint 1 era apenas previsto)."],
                ],
            }),
            ("tabela", {
                "titulo": "Quadro 2 — Stakeholders",
                "cabecalho": ["Stakeholder", "Interesse ou necessidade"],
                "pesos": [1.4, 2.8],
                "linhas": [
                    ["Cliente comprador", "Encontrar produtos, comprar com segurança, acompanhar "
                                          "pedidos e gerenciar seus dados."],
                    ["Administrador da loja", "Cadastrar, consultar, alterar e excluir produtos; "
                                              "acompanhar catálogo, estoque e vendas."],
                    ["Equipe de desenvolvimento (Grupo 11)", "Construir o aplicativo, manter o "
                                                             "backlog, integrar os dados e entregar "
                                                             "as Sprints."],
                    ["Professor orientador", "Validar a aderência ao roteiro, a evolução técnica e a "
                                             "aplicação dos conceitos das disciplinas."],
                    ["Mercado Pago", "Processar os pagamentos e notificar a API sobre cada "
                                     "pagamento."],
                ],
            }),
            ("p0", "Escopo funcional do produto:"),
            ("lista", [
                "Cadastro e login. A recuperação de senha existe só como interface: as telas "
                "de pedir o código e redefinir a senha estão prontas, mas não há serviço por "
                "trás delas — nenhuma chama a API.",
                "Home, navegação por abas, listagem, busca e filtros de produtos.",
                "Detalhe do produto, com tamanho, estoque e preço promocional.",
                "Carrinho com alteração de quantidade e remoção de itens.",
                "Checkout com endereço, frete, resumo de valores e pagamento.",
                "Histórico e detalhe de pedidos.",
                "Perfil, endereços e dados pessoais.",
                "CRUD de produtos para o administrador e exportação dos dados de vendas.",
            ]),
            ("p0", "Fora do escopo do projeto:"),
            ("lista", [
                "Publicação do aplicativo na Google Play e na App Store.",
                "Ambiente de produção em nuvem com domínio e HTTPS próprios.",
                "Pagamento com credenciais reais de produção do Mercado Pago.",
                "Funcionalidades não solicitadas pelo roteiro.",
            ]),
            ("tabela", {
                "titulo": "Quadro 3 — Histórias de usuário",
                "cabecalho": ["ID", "História de usuário"],
                "pesos": [0.5, 3.7],
                "linhas": [
                    ["US01", "Como visitante, quero criar uma conta para poder realizar compras."],
                    ["US02", "Como usuário, quero entrar com e-mail e senha para acessar meus dados "
                             "e pedidos."],
                    ["US03", "Como cliente, quero visualizar os produtos disponíveis para escolher o "
                             "que comprar."],
                    ["US04", "Como cliente, quero pesquisar e filtrar produtos para encontrar peças "
                             "com mais rapidez."],
                    ["US05", "Como cliente, quero abrir o detalhe de um produto para consultar "
                             "descrição, preço, estoque e tamanho."],
                    ["US06", "Como cliente, quero adicionar produtos ao carrinho e alterar "
                             "quantidades para organizar minha compra."],
                    ["US07", "Como cliente, quero cadastrar um endereço para informar o local de "
                             "entrega."],
                    ["US08", "Como cliente, quero finalizar a compra informando a forma de "
                             "pagamento."],
                    ["US09", "Como cliente, quero visualizar meus pedidos para acompanhar compras "
                             "realizadas."],
                    ["US10", "Como administrador, quero inserir, consultar, alterar e excluir "
                             "produtos para manter o catálogo atualizado."],
                    ["US11", "Como administrador, quero controlar o estoque para evitar a venda de "
                             "item indisponível."],
                    ["US12", "Como usuário, quero recuperar minha senha para voltar a acessar minha "
                             "conta."],
                ],
            }),
            ("p0", "Critérios de aceite principais, definidos na Sprint 1:"),
            ("lista", [
                "Login: validar campos obrigatórios e permitir o acesso quando os dados forem "
                "válidos.",
                "Cadastro: exigir nome, e-mail e senha e registrar o usuário.",
                "Produtos: apresentar nome, categoria, preço, imagem e disponibilidade.",
                "Carrinho: permitir inclusão, alteração de quantidade e remoção.",
                "CRUD de produto: contemplar inserir, consultar, alterar e excluir.",
                "Checkout: apresentar entrega, frete, pagamento e confirmação.",
                "Persistência: as informações essenciais devem continuar disponíveis entre uma "
                "sessão e outra.",
            ]),
            ("p", "Os critérios acima foram detalhados na Sprint 2 em treze critérios verificáveis "
                  "(CA-01 a CA-13), cada um com o teste automatizado que o cobre. A tabela completa "
                  "está no item 2.6."),
        ],
    },

    # 1.2
    {
        "titulo": "1.2. Estruturação do Planejamento Ágil",
        "nivel": 2,
        "blocos": [
            ("p", "O grupo adotou SCRUM adaptado ao contexto acadêmico, com duas Sprints: a "
                  "primeira nas semanas 1 a 8 e a segunda nas semanas 8 a 16. O trabalho é "
                  "acompanhado por Product Backlog, Sprint Backlog e reuniões curtas de alinhamento. "
                  "Cada item tem responsável, prioridade e critério de aceite."),
            ("tabela", {
                "titulo": "Quadro 4 — Papéis no projeto",
                "cabecalho": ["Papel", "Responsabilidade"],
                "pesos": [1.2, 3.0],
                "linhas": [
                    ["Product Owner", "Priorizar o Product Backlog e validar se o produto atende ao "
                                      "escopo. Pedro Henrique Teixeira Silva."],
                    ["Scrum Master", "Facilitar as cerimônias, remover impedimentos e manter o "
                                     "processo organizado. Gustavo Oliveira Fernandes de Andrade."],
                    ["Time de desenvolvimento", "Todos os integrantes do Grupo 11, divididos entre "
                                                "interface, dados e back-end, documentação e "
                                                "testes."],
                    ["Stakeholders", "Professor orientador e usuários convidados para avaliar as "
                                     "interfaces."],
                ],
            }),
            ("nota", "Os papéis acima são a organização proposta na Sprint 1 e mantida na Sprint 2. "
                     "A distribuição real do trabalho de código está medida no item 2.4."),
            ("p0", "Artefatos e cerimônias:"),
            ("lista", [
                "Product Backlog: lista priorizada de requisitos e histórias de usuário.",
                "Sprint Backlog: itens selecionados para a Sprint em andamento.",
                "Incremento: versão executável do aplicativo e da API ao fim de cada Sprint.",
                "Definition of Done: item implementado, revisado, executável, documentado e com "
                "evidência de validação — na Sprint 2, teste automatizado.",
                "Sprint Planning, alinhamentos curtos pelo menos duas vezes por semana, Sprint "
                "Review e Sprint Retrospective.",
            ]),
            ("p", "A estimativa usou Planning Poker com a escala de Fibonacci (1, 2, 3, 5, 8, 13). "
                  "A pontuação representa esforço relativo, incerteza e complexidade, não horas."),
            ("tabela", {
                "titulo": "Quadro 5 — Product Backlog priorizado (Sprint 1)",
                "cabecalho": ["ID", "Item", "Prioridade", "Pontos", "Origem"],
                "pesos": [0.6, 2.0, 0.9, 0.6, 0.8],
                "linhas": [
                    ["PB01", "Login e sessão", "Alta", "3", "US02"],
                    ["PB02", "Cadastro de usuário", "Alta", "5", "US01"],
                    ["PB03", "Listagem de produtos", "Alta", "5", "US03"],
                    ["PB04", "Detalhe do produto", "Alta", "3", "US05"],
                    ["PB05", "Carrinho de compras", "Alta", "8", "US06"],
                    ["PB06", "Checkout e interface de pagamento", "Alta", "8", "US08"],
                    ["PB07", "CRUD de produtos", "Alta", "8", "US10 e US11"],
                    ["PB08", "Busca e filtros", "Média", "5", "US04"],
                    ["PB09", "Endereços", "Média", "5", "US07"],
                    ["PB10", "Pedidos", "Média", "5", "US09"],
                    ["PB11", "Recuperação de senha", "Média", "3", "US12"],
                    ["PB12", "DER e script SQL", "Alta", "5", "Item 1.5"],
                    ["PB13", "API Node inicial", "Alta", "8", "Item 1.5"],
                    ["PB14", "SQLite local", "Alta", "5", "Item 1.5"],
                    ["PB15", "Wireframes e fluxo", "Alta", "3", "Item 1.3"],
                    ["PB16", "Relatório de riscos e status", "Alta", "3", "Item 1.6"],
                    ["", "Total", "", "82", ""],
                ],
            }),
            ("nota", "Os pontos por item foram lidos do documento entregue em setembro e devem ser "
                     "conferidos pelo grupo; o total de 82 pontos não depende dessa leitura. Os "
                     "itens da Sprint 2 (2.1 a 2.8) não foram pontuados em Story Points."),
        ],
    },

    # 1.3
    {
        "titulo": "1.3. Pesquisa de Mercado e Design de Interface (Wireframing)",
        "nivel": 2,
        "blocos": [
            ("p", "A pesquisa considerou soluções próximas da proposta da Galeria Seleta: compra de "
                  "moda pelo celular, catálogo visual, categorias, promoção, checkout e curadoria de "
                  "peças. O objetivo foi identificar boas práticas aplicáveis ao projeto."),
            ("tabela", {
                "titulo": "Quadro 6 — Referências de mercado observadas",
                "cabecalho": ["Referência", "O que foi observado", "Aprendizado para o projeto"],
                "pesos": [1.0, 1.9, 1.6],
                "linhas": [
                    ["Enjoei", "Marketplace de itens novos e usados, com categorização por tamanho, "
                               "cor e preço, e fluxo de compra e venda.",
                     "Valorizar filtros simples, catálogo visual e clareza das informações do "
                     "produto."],
                    ["Asteric", "E-commerce de streetwear com coleções, produtos em destaque, "
                                "promoções e visual de identidade urbana.",
                     "Manter identidade visual forte, categorias rápidas e destaque de preço e "
                     "promoção."],
                    ["Galeria Seleta", "Curadoria de peças, higienização, suporte e navegação "
                                       "pensada para o celular.",
                     "Diferenciar pela curadoria e por um fluxo enxuto da descoberta ao checkout."],
                ],
            }),
            ("p0", "Requisitos de interface derivados da pesquisa:"),
            ("lista", [
                "Navegação simples e previsível por abas (Início, Produtos, Carrinho, Pedidos e "
                "Perfil).",
                "Busca e filtros acessíveis na listagem.",
                "Cards com imagem, nome e preço, com o preço cheio riscado quando há promoção.",
                "Detalhe com descrição, tamanho, quantidade e ação de adicionar ao carrinho.",
                "Carrinho com resumo de valores e chamada clara para o checkout.",
                "Identidade visual consistente: fundo escuro, superfícies neutras e destaque em "
                "laranja.",
            ]),
            ("p", "Os wireframes de baixa fidelidade das telas críticas — Login, Cadastro, listagem "
                  "de produtos e detalhe do produto — foram produzidos na Sprint 1 e apresentados "
                  "na primeira entrega. Eles cumpriram o papel de validar organização e fluxo antes "
                  "do refinamento visual. Como as telas já estão implementadas e funcionando, o "
                  "Anexo B deste documento apresenta as telas reais em execução, que substituem os "
                  "esboços como evidência de interface."),
            ("p", "O fluxo principal do usuário não mudou desde a Sprint 1: o visitante cria uma "
                  "conta ou entra, acessa a Home, navega pela listagem, abre um produto, adiciona ao "
                  "carrinho, cadastra o endereço, confere frete e total no checkout e é levado ao "
                  "ambiente do Mercado Pago para pagar."),
        ],
    },

    # 1.4
    {
        "titulo": "1.4. Configuração do Ambiente e Interface Inicial",
        "nivel": 2,
        "blocos": [
            ("tabela", {
                "titulo": "Quadro 7 — Ambiente de desenvolvimento",
                "cabecalho": ["Item", "Configuração"],
                "pesos": [1.2, 3.0],
                "linhas": [
                    ["Framework", "React Native"],
                    ["Ferramenta", "Expo (SDK 54)"],
                    ["Linguagem", "TypeScript"],
                    ["Navegação", "React Navigation — Stack e Bottom Tabs"],
                    ["API", "Node.js 22.13 ou superior, Express e node:sqlite"],
                    ["Persistência", "Catálogo, contas, pedidos e pagamentos na API; sacola, sessão "
                                     "e endereços no AsyncStorage do aparelho"],
                    ["Ícones", "@expo/vector-icons"],
                    ["Testes", "Jest e Testing Library, node:test, Playwright e unittest (Python)"],
                    ["Execução", "npm install; npm run typecheck; npx expo start (aplicativo) e "
                                 "node --env-file=.env src/server.js (API)"],
                ],
            }),
            ("p", "O aplicativo registra as telas Home, Produtos, Busca, Detalhe do Produto, Login, "
                  "Cadastro, Recuperação de Senha, Carrinho, Checkout, Sucesso, Pedidos, Detalhe do "
                  "Pedido, Perfil, Endereços, Dados Pessoais, Alteração de Senha, Gerenciar "
                  "Produtos, Sobre e Contato. A navegação principal usa abas inferiores para Início, "
                  "Produtos, Carrinho, Pedidos e Perfil, com Stack Navigator para as telas "
                  "auxiliares."),
            ("p", "Desde a Sprint 1, duas configurações foram acrescentadas: a variável "
                  "EXPO_PUBLIC_API_URL, que diz ao aplicativo onde a API está (o emulador Android "
                  "usa 10.0.2.2 e o navegador usa localhost), e o arquivo .env da API, com o segredo "
                  "de sessão, as credenciais do Mercado Pago e a conta administradora inicial. "
                  "Nenhum segredo real está no repositório."),
            ("p0", "Checklist de execução antes da entrega:"),
            ("lista", [
                "Instalar as dependências do aplicativo e da API com npm install.",
                "Subir a API e conferir a rota de saúde.",
                "Executar npx expo start e abrir no Android, no iOS ou no Expo Go.",
                "Validar que Home, Login, Cadastro, Produtos, Carrinho, Checkout e Gerenciar "
                "Produtos abrem sem erro.",
                "Rodar as quatro camadas de teste (item 2.6).",
            ]),
            ("p", "As telas em execução, capturadas automaticamente da build web em largura de "
                  "celular (390 pontos), estão no Anexo B."),
        ],
    },

    # 1.5
    {
        "titulo": "1.5. Modelagem, Estrutura do Banco de Dados e NODE",
        "nivel": 2,
        "blocos": [
            ("p", "Esta é a seção mais corrigida em relação à entrega de setembro. O DER apresentado "
                  "na Sprint 1 trazia as tabelas servicos e agendamentos, herdadas do enunciado "
                  "genérico do roteiro (que cita exemplos como pet shop e oficina), e não tinha "
                  "pedidos nem pagamentos. O banco real do projeto nunca teve essas tabelas. O "
                  "modelo foi reescrito a partir do código que cria o banco (backend/src/db.js), e "
                  "um teste automatizado compara o script database/schema.sql com o banco criado de "
                  "verdade, para que os dois não voltem a divergir."),
            ("tabela", {
                "titulo": "Quadro 8 — Tabelas do banco (modelo entidade-relacionamento)",
                "cabecalho": ["Tabela", "Conteúdo", "Chaves"],
                "pesos": [1.0, 2.3, 1.2],
                "linhas": [
                    ["users", "Contas: nome, e-mail, hash da senha, telefone e marca de "
                              "administrador.",
                     "PK id; e-mail único"],
                    ["products", "Catálogo: categoria, nome, descrição, preço, preço promocional, "
                                 "estoque e imagem.",
                     "PK id"],
                    ["orders", "Pedidos: endereço, frete, subtotal, total, estado do pagamento e do "
                               "atendimento, preferência do Mercado Pago e validade da reserva.",
                     "PK id; FK user_id; único por usuário e chave de idempotência"],
                    ["order_items", "Itens do pedido: nome, tamanho, quantidade e preço unitário "
                                    "copiados no momento da compra.",
                     "PK pedido + produto + tamanho; FK order_id"],
                    ["payments", "Pagamentos recebidos do Mercado Pago: estado e valor, atualizados "
                                 "a cada notificação.",
                     "PK id do pagamento; FK order_id"],
                    ["webhook_events", "Trilha de auditoria dos avisos recebidos do Mercado Pago: "
                                       "identificador e hora.",
                     "PK id"],
                ],
            }),
            ("p0", "Regras do modelo:"),
            ("lista", [
                "Um usuário faz zero ou vários pedidos; cada pedido pertence a um único usuário.",
                "Um pedido tem um ou mais itens; a chave do item é pedido, produto e tamanho.",
                "Um pedido recebe zero ou vários pagamentos, um por pagamento do Mercado Pago. A "
                "linha é atualizada a cada notificação, então aviso repetido não cria linha "
                "repetida.",
                "O item do pedido guarda o identificador do produto, mas sem chave estrangeira: ele "
                "copia nome, preço e imagem do momento da compra, de modo que alterar ou excluir um "
                "produto não reescreve o histórico de vendas.",
                "A tabela de eventos de webhook não se liga a nenhuma outra; serve como registro do "
                "que chegou do Mercado Pago.",
                "Todo valor em dinheiro é guardado em centavos, em número inteiro, para não acumular "
                "erro de arredondamento. As datas são texto em formato ISO 8601.",
            ]),
            ("codigo", {
                "titulo": "Trecho do script SQL (database/schema.sql)",
                "linhas": [
                    "CREATE TABLE IF NOT EXISTS users (",
                    "  id TEXT PRIMARY KEY,",
                    "  name TEXT NOT NULL,",
                    "  email TEXT NOT NULL UNIQUE,",
                    "  password_hash TEXT NOT NULL,",
                    "  phone TEXT,",
                    "  is_admin INTEGER NOT NULL DEFAULT 0,",
                    "  created_at TEXT NOT NULL",
                    ");",
                    "",
                    "CREATE TABLE IF NOT EXISTS products (",
                    "  id INTEGER PRIMARY KEY,",
                    "  category_id INTEGER NOT NULL,",
                    "  category TEXT NOT NULL,",
                    "  name TEXT NOT NULL,",
                    "  description TEXT NOT NULL,",
                    "  price_cents INTEGER NOT NULL,",
                    "  discount_price_cents INTEGER,",
                    "  stock INTEGER NOT NULL,",
                    "  image TEXT NOT NULL",
                    ");",
                    "",
                    "CREATE TABLE IF NOT EXISTS orders (",
                    "  id TEXT PRIMARY KEY,",
                    "  user_id TEXT NOT NULL REFERENCES users(id),",
                    "  idempotency_key TEXT NOT NULL,",
                    "  address_json TEXT NOT NULL,",
                    "  shipping_code TEXT NOT NULL,",
                    "  subtotal_cents INTEGER NOT NULL,",
                    "  shipping_cents INTEGER NOT NULL,",
                    "  total_cents INTEGER NOT NULL,",
                    "  payment_status TEXT NOT NULL,",
                    "  fulfillment_status TEXT NOT NULL,",
                    "  preference_id TEXT,",
                    "  checkout_url TEXT,",
                    "  reservation_expires_at TEXT NOT NULL,",
                    "  created_at TEXT NOT NULL,",
                    "  updated_at TEXT NOT NULL,",
                    "  UNIQUE(user_id, idempotency_key)",
                    ");",
                    "",
                    "CREATE TABLE IF NOT EXISTS order_items (",
                    "  order_id TEXT NOT NULL REFERENCES orders(id),",
                    "  product_id INTEGER NOT NULL,",
                    "  name TEXT NOT NULL,",
                    "  size TEXT NOT NULL,",
                    "  quantity INTEGER NOT NULL,",
                    "  unit_price_cents INTEGER NOT NULL,",
                    "  image TEXT NOT NULL,",
                    "  PRIMARY KEY (order_id, product_id, size)",
                    ");",
                ],
            }),
            ("nota", "As tabelas payments e webhook_events seguem o mesmo padrão e estão no arquivo "
                     "completo, em database/schema.sql."),
            ("p", "A API em Node.js com Express foi incorporada na Sprint 1 com a rota de saúde e o "
                  "CRUD de produtos, e cresceu na Sprint 2 com contas, pedidos, pagamento e "
                  "relatório de vendas. O banco usa o módulo node:sqlite, nativo do Node 22, sem "
                  "dependência externa de banco. O aplicativo, que na Sprint 1 mantinha o catálogo "
                  "em SQLite local com expo-sqlite, passou a consumir a API: é a mudança de "
                  "arquitetura registrada no item 2.4 como desvio em relação ao planejado."),
        ],
    },

    # 1.6
    {
        "titulo": "1.6. Monitoramento e Sprint Review",
        "nivel": 2,
        "blocos": [
            ("p", "Esta seção reproduz o monitoramento da Sprint 1 como ele foi entregue em "
                  "setembro. O acompanhamento da Sprint 2 está no item 2.3."),
            ("tabela", {
                "titulo": "Quadro 9 — Relatório de status da Sprint 1",
                "cabecalho": ["Item", "Status", "Evidência"],
                "pesos": [1.3, 1.1, 2.1],
                "linhas": [
                    ["1.1 Escopo e requisitos", "Concluído",
                     "Visão, stakeholders, histórias e critérios de aceite definidos."],
                    ["1.2 Planejamento ágil", "Concluído",
                     "Papéis, artefatos, cerimônias, backlog e Planning Poker definidos."],
                    ["1.3 Mercado e wireframes", "Concluído",
                     "Pesquisa exploratória, wireframes e fluxo principal criados."],
                    ["1.4 Ambiente e interface", "Validado por CI",
                     "GitHub Actions aprovou npm install, typecheck e a geração do bundle Android."],
                    ["1.5 DER, SQL, Node e SQLite", "Concluído",
                     "DER, schema.sql, API Node/Express, SQLite e CRUD de produtos no repositório."],
                    ["1.6 Review e riscos", "Concluído",
                     "Riscos e mitigação documentados; revisão técnica interna registrada com "
                     "feedback e ações de backlog."],
                ],
            }),
            ("tabela", {
                "titulo": "Quadro 10 — Riscos do projeto e plano de mitigação",
                "cabecalho": ["ID", "Risco", "Prob. / Impacto", "Mitigação"],
                "pesos": [0.5, 1.5, 1.0, 2.2],
                "linhas": [
                    ["R01", "Atraso na integração com a API do Mercado Pago", "Alta / Alto",
                     "Desenvolver o fluxo com camada de serviço e simulação; testar a integração "
                     "isoladamente."],
                    ["R02", "API Node não integrada ao aplicativo", "Alta / Alto",
                     "Priorizar os endpoints essenciais e validar o CRUD de produtos antes dos "
                     "demais módulos."],
                    ["R03", "Problemas de compatibilidade do Expo e do React Native", "Média / Alto",
                     "Fixar versões, usar instalação limpa, registrar o ambiente e testar em pelo "
                     "menos um Android."],
                    ["R04", "Conflitos de código entre integrantes", "Média / Médio",
                     "Usar branches por tarefa, commits pequenos e pull request com revisão antes do "
                     "merge."],
                    ["R05", "Perda de dados locais", "Média / Médio",
                     "Padronizar o schema, manter migrações simples e tratar erros de persistência."],
                    ["R06", "Atraso nas entregas acadêmicas", "Média / Alto",
                     "Dividir o backlog por responsável, revisar o progresso semanalmente e "
                     "antecipar a consolidação do documento."],
                    ["R07", "Interface divergente entre telas", "Média / Médio",
                     "Usar tokens de tema e componentes reutilizáveis, seguindo a especificação "
                     "visual já criada."],
                ],
            }),
            ("p", "Sprint Review da Sprint 1. Foi realizada uma Sprint Review técnica interna do "
                  "incremento, com revisão do código, das interfaces implementadas, do DER, do "
                  "SQLite, da API Node e dos requisitos do roteiro. A revisão foi assistida pelo "
                  "ChatGPT/OpenAI como revisor técnico e não é apresentada como feedback de um "
                  "stakeholder humano externo. Os principais pontos foram registrados e convertidos "
                  "em ações de backlog."),
            ("tabela", {
                "titulo": "Quadro 11 — Registro da Sprint Review da Sprint 1",
                "cabecalho": ["Item apresentado", "Feedback da revisão", "Ação no backlog"],
                "pesos": [1.2, 1.6, 1.4],
                "linhas": [
                    ["Login e cadastro", "Fluxos e telas implementados e coerentes com o escopo.",
                     "Reforçar a validação de campos na evolução seguinte."],
                    ["Listagem e detalhe de produto",
                     "Catálogo, busca e detalhe usam os produtos persistidos.",
                     "Melhorar o tratamento de estados vazios e de erro."],
                    ["Carrinho e checkout", "Fluxo existe e apresenta o formulário de pagamento.",
                     "Priorizar a integração com o Mercado Pago na etapa seguinte."],
                    ["Navegação e identidade visual", "Stack, abas e identidade visual consistentes.",
                     "Preservar o padrão visual nas telas novas."],
                    ["DER e arquitetura de dados", "DER, schema SQL, SQLite e Node alinhados ao item "
                                                   "1.5 como ele era entendido na Sprint 1.",
                     "Evoluir a integração entre aplicativo e API na Sprint seguinte. O modelo foi "
                     "reescrito na Sprint 2 (ver item 1.5)."],
                ],
            }),
            ("p0", "Lições aprendidas registradas ao fim da Sprint 1:"),
            ("lista", [
                "Validar os requisitos do roteiro antes de congelar a arquitetura técnica.",
                "Não manter apenas dados de exemplo quando o roteiro exige back-end e banco.",
                "Registrar evidências de execução e de teste durante o desenvolvimento, não no "
                "final.",
                "Manter o backlog atualizado depois de cada feedback do professor.",
            ]),
        ],
    },

    # ------------------------------------------------------------------- Sprint 2
    {
        "titulo": "Sprint 2 — funcionalidade principal, testes e entrega (semanas 8 a 16)",
        "nivel": 2,
        "blocos": [
            ("p", "A Sprint 2 é a fase de qualidade: integrar o aplicativo à API de verdade, gerar "
                  "os dados para o dashboard, acompanhar o projeto com Sprint Review e relatório de "
                  "status, encerrar formalmente o trabalho com as lições aprendidas, construir o "
                  "dashboard em Python, criar e executar os testes automatizados, preparar o pitch e "
                  "montar esta documentação."),
        ],
    },

    # 2.1
    {
        "titulo": "2.1. CRUD e Integração com API / Sincronização de Dados",
        "nivel": 2,
        "blocos": [
            ("p", "O aplicativo não guarda mais o catálogo dentro do aparelho: ele consome a API "
                  "REST em todas as operações de dados. O que fica no celular é apenas o que é do "
                  "celular — a sacola em andamento, a sessão do usuário e os endereços digitados —, "
                  "guardado no AsyncStorage. Catálogo, contas, pedidos e pagamentos vivem no "
                  "servidor, de modo que o produto que o administrador altera é o mesmo que o "
                  "cliente vê na listagem."),
            ("tabela", {
                "titulo": "Quadro 12 — Rotas da API consumidas pelo aplicativo",
                "cabecalho": ["Rota", "O que faz"],
                "pesos": [1.7, 2.5],
                "linhas": [
                    ["POST /api/auth/register", "Cria a conta do cliente e devolve o token de "
                                                "sessão."],
                    ["POST /api/auth/login", "Autentica e devolve o token de sessão."],
                    ["GET e PUT /api/me", "Consulta e altera os dados pessoais."],
                    ["GET /api/products", "Lista o catálogo, usado na Home, na listagem e na "
                                          "busca."],
                    ["GET /api/products/:id", "Detalhe do produto."],
                    ["POST, PUT e DELETE /api/products", "Inserir, alterar e excluir produto. "
                                                         "Somente administrador."],
                    ["POST /api/checkout/quote", "Calcula subtotal, frete e total com os preços do "
                                                 "banco."],
                    ["POST /api/checkout/sessions", "Cria o pedido e a preferência de pagamento do "
                                                    "Mercado Pago."],
                    ["GET /api/orders e /api/orders/:id", "Histórico e detalhe dos pedidos do "
                                                          "usuário."],
                    ["POST /api/orders/:id/reconcile", "Reconsulta o pagamento no Mercado Pago e "
                                                       "atualiza o pedido."],
                    ["POST /api/webhooks/mercado-pago", "Recebe as notificações de pagamento, com "
                                                        "assinatura verificada."],
                    ["GET /api/reports/sales", "Relatório de vendas em JSON. Somente administrador "
                                               "(item 2.2)."],
                ],
            }),
            ("p", "Sincronização e regras de consistência. O aplicativo recarrega o catálogo ao "
                  "abrir a listagem e depois de cada operação do CRUD, de modo que a tela sempre "
                  "mostra o estado do servidor. O preço nunca vem do cliente: a cotação e o pedido "
                  "são calculados com o preço gravado no banco, e um preço enviado pelo aplicativo é "
                  "ignorado. Cada tentativa de checkout carrega uma chave de idempotência, e a "
                  "restrição de unicidade no banco impede que a repetição de uma mesma tentativa "
                  "crie dois pedidos. O estoque fica reservado por 72 horas a partir da criação da "
                  "preferência de pagamento."),
            ("p", "Pagamento. A API cria a preferência do Checkout Pro, o aplicativo abre o ambiente "
                  "do Mercado Pago e o pedido só é aprovado quando a API confirma o pagamento: o "
                  "webhook tem a assinatura HMAC conferida, o pagamento é consultado na API do "
                  "Mercado Pago e referência, moeda e valor são comparados antes de qualquer "
                  "atualização. O retorno por deep link não aprova compra nenhuma por si só. Se uma "
                  "aprovação chegar depois de a reserva expirar e não houver estoque, o pedido vai "
                  "para revisão manual, que exige atendimento humano."),
            ("p", "Controle de acesso. As rotas de alteração do catálogo e o relatório de vendas "
                  "exigem sessão de administrador: um visitante recebe 401 e um cliente comum recebe "
                  "403, verificado por teste. No aplicativo, o atalho “Gerenciar produtos” só "
                  "aparece no perfil do administrador."),
            ("p", "Defeito encontrado e corrigido nesta Sprint. O botão de excluir produto não fazia "
                  "nada na versão web: o diálogo de confirmação usava Alert.alert, que no "
                  "react-native-web é uma função vazia; sem diálogo, não havia exclusão. Quem "
                  "descobriu foi o teste de ponta a ponta, ao tentar excluir pela interface. A "
                  "confirmação passou a ser por plataforma — Alert.alert no aparelho e window.confirm "
                  "no navegador — e ficou coberta por teste de unidade e por teste de ponta a ponta."),
        ],
    },

    # 2.2
    {
        "titulo": "2.2. Gerar dados em formato JSON",
        "nivel": 2,
        "blocos": [
            ("p", "O roteiro pede um botão no aplicativo que gere dados em JSON para alimentar o "
                  "dashboard da disciplina de Análise de Dados e Estatística. A solução tem duas "
                  "partes: uma rota na API que apura as vendas e um botão na tela Gerenciar "
                  "produtos que baixa o arquivo."),
            ("p", "A rota GET /api/reports/sales é restrita ao administrador e aceita um período "
                  "opcional (from e to, no formato AAAA-MM-DD, inclusivo). Ela devolve um resumo e "
                  "quatro séries, calculadas com consultas SQL sobre os pedidos. Só entra em "
                  "faturamento o pedido com pagamento aprovado; o agrupamento por dia e o filtro de "
                  "período usam o horário de Brasília, para que uma compra feita às 22h30 não caia "
                  "no dia seguinte."),
            ("tabela", {
                "titulo": "Quadro 13 — Campos do relatório de vendas em JSON",
                "cabecalho": ["Campo", "Conteúdo"],
                "pesos": [1.1, 3.1],
                "linhas": [
                    ["geradoEm", "Data e hora da geração, em formato ISO 8601."],
                    ["periodo", "Datas inicial e final do filtro, ou nulo quando não há filtro."],
                    ["resumo", "Pedidos, faturamento, ticket médio, itens vendidos e número de "
                               "clientes."],
                    ["porDia", "Uma linha por dia com venda: data, pedidos e faturamento."],
                    ["porCategoria", "Itens e faturamento por categoria do catálogo."],
                    ["porStatus", "Quantidade de pedidos em cada estado de pagamento."],
                    ["produtos", "Ranking de produtos por faturamento, com itens vendidos."],
                ],
            }),
            ("nota", "O faturamento total e o faturamento por dia incluem o frete, porque são o que "
                     "o cliente pagou. Os valores por categoria e por produto somam só as peças, sem "
                     "frete; por isso a soma deles é menor que o total. A regra está escrita no "
                     "painel e no documento do back-end."),
            ("p", "No aplicativo, o cartão “Dados de vendas” na tela Gerenciar produtos traz o botão "
                  "“Exportar dados (JSON)”. Ao tocar, o botão dá lugar à mensagem “Gerando "
                  "arquivo...”; em seguida aparece o nome do arquivo gerado ou a mensagem de erro, "
                  "com o botão de volta. O nome segue o padrão vendas-galeria-seleta-AAAA-MM-DD.json, "
                  "com a data de Brasília. No navegador o arquivo é baixado; no aparelho ele é "
                  "gravado na pasta de documentos do aplicativo e, se houver compartilhamento "
                  "disponível, a folha de compartilhamento é aberta."),
            ("p", "O código das duas partes está no Anexo A. A tela com o botão é a Figura B.8. O "
                  "caminho do navegador é exercitado por teste de ponta a ponta, que confere que o "
                  "arquivo baixado é um JSON com resumo; o caminho do aparelho só foi exercitado com "
                  "o módulo de arquivos simulado, conforme declarado no item 2.6."),
        ],
    },

    # 2.3
    {
        "titulo": "2.3. Plano de Comunicação e Relatório de Status",
        "nivel": 2,
        "blocos": [
            ("p", "Plano de comunicação. O grupo combinou, desde a Sprint 1, alinhamentos curtos "
                  "pelo menos duas vezes por semana, Sprint Planning no início de cada Sprint e "
                  "Sprint Review com retrospectiva no fim. O canal técnico é o repositório no "
                  "GitHub: toda mudança entra por pull request, que é onde o código é revisado e "
                  "onde a execução automatizada dos testes é conferida antes do merge. Os documentos "
                  "de cada Sprint ficam versionados junto do código, em docs/. Datas e participantes "
                  "de cada cerimônia: a confirmar pelo grupo, porque não foram registrados enquanto "
                  "aconteciam — é uma das lições aprendidas do item 2.4."),
            ("p", "Sprint Review da Sprint 2. Foi feita uma revisão técnica interna do incremento, "
                  "sobre o código do repositório e sobre a execução dos testes automatizados. Como "
                  "na Sprint 1, não é feedback de um stakeholder externo: é a avaliação do próprio "
                  "grupo sobre o que ficou pronto. O que mudou no produto nesta Sprint: relatório de "
                  "vendas em JSON na API, botão de exportar no aplicativo, dashboard em Python, "
                  "quatro camadas de teste automatizado, workflow de integração contínua, correção "
                  "do DER e do script SQL e correção do botão de excluir produto na web."),
            ("tabela", {
                "titulo": "Quadro 14 — Registro da Sprint Review da Sprint 2",
                "cabecalho": ["Item apresentado", "Avaliação e ação no backlog"],
                "pesos": [1.3, 2.9],
                "linhas": [
                    ["Relatório de vendas em JSON",
                     "Devolve resumo, séries por dia, por categoria e por status, e o ranking de "
                     "produtos. Só pedido com pagamento aprovado entra em faturamento; as datas "
                     "seguem o horário de Brasília. Cliente comum recebe 403 e anônimo recebe 401. "
                     "Ação (prioridade baixa): o ranking do painel mostra só os oito primeiros "
                     "produtos sem avisar no título; deixar isso explícito."],
                    ["Botão de exportar dados",
                     "Entrega o arquivo no navegador e no aparelho, e mostra os estados de geração, "
                     "confirmação e erro. Ação (prioridade alta): fazer um teste rápido em aparelho "
                     "físico ou no Expo Go antes de dar o caminho nativo como validado."],
                    ["Dashboard em Python",
                     "Roda com um comando sobre o JSON de exemplo versionado e gera PNG e HTML com "
                     "os quatro gráficos e os números do resumo. Ação (baixa): mensagem de erro mais "
                     "clara quando o JSON editado à mão perde campos internos."],
                    ["Testes de unidade do aplicativo",
                     "39 testes em 9 arquivos cobrem carrinho, formatação, armazenamento, cliente da "
                     "API, componentes e a tela de login. Ação (média): escrever testes de unidade "
                     "para as telas sem cobertura (Carrinho, Checkout, Pedidos, Perfil, Cadastro e "
                     "Endereços)."],
                    ["Testes da API",
                     "47 testes entre regras, assinatura do webhook, relatório e integração, com "
                     "cobertura por arquivo entre 87,4 % e 100 % de linhas. Ação (baixa): cobrir os "
                     "ramos do servidor ainda sem teste."],
                    ["Testes de ponta a ponta",
                     "6 testes em cerca de 31 segundos, na build web contra a API real em banco "
                     "temporário: compra até o checkout, administração de produtos, exportação e "
                     "acesso restrito. Ação (média): avaliar execução em emulador Android se houver "
                     "tempo."],
                    ["Integração contínua",
                     "Quatro jobs configurados, um por camada de teste. Ainda não executados no "
                     "GitHub. Ação (alta): conferir a primeira execução no pull request, em especial "
                     "a versão do Python usada pelo dashboard."],
                    ["DER e script SQL",
                     "Reescritos a partir do código que cria o banco: seis tabelas, valores em "
                     "centavos. Um teste compara o script com o banco criado de verdade. Ação "
                     "(média): manter o teste, para que tabela nova exija script atualizado."],
                    ["Checkout Pro do Mercado Pago",
                     "Cria pedido e preferência, reconcilia o pagamento e confirma só por pagamento "
                     "validado, testado com a API do Mercado Pago simulada. Nunca foi exercitado com "
                     "pagamento real. Ação (alta): rodar um pagamento de teste com credenciais de "
                     "sandbox, fora do repositório."],
                ],
            }),
            ("p0", "Retrospectiva da Sprint 2:"),
            ("lista", [
                "Funcionou: o teste de ponta a ponta tentar excluir um produto pela interface foi o "
                "que revelou o botão morto na web; separar as regras da API das rotas permitiu "
                "testá-las sem subir o servidor; e ter um comando por camada de teste, o mesmo usado "
                "na integração contínua.",
                "Não funcionou: o DER ficou desatualizado desde a Sprint 1 e ninguém percebeu até "
                "compará-lo com o banco; a cobertura do aplicativo ficou baixa, porque a maior parte "
                "das telas só é exercitada pelos testes de ponta a ponta, que não medem cobertura; e "
                "o trabalho de código ficou concentrado em poucos integrantes.",
                "A melhorar: conferir a documentação técnica contra o código a cada Sprint, medir "
                "cobertura na integração contínua e distribuir as tarefas de código entre todos os "
                "integrantes, registrando também o trabalho que não gera commit.",
            ]),
            ("p", "Relatório de status. A tabela a seguir mostra a situação de cada item da Sprint 2 "
                  "no fechamento desta entrega."),
            ("tabela", {
                "titulo": "Quadro 15 — Relatório de status da Sprint 2",
                "cabecalho": ["Item", "Status", "Evidência e próximo passo"],
                "pesos": [0.5, 1.3, 2.6],
                "linhas": [
                    ["2.1", "Concluído",
                     "O aplicativo consome a API em catálogo, CRUD, contas, pedidos e Checkout Pro. "
                     "Próximo passo: pagamento de teste com credenciais de sandbox."],
                    ["2.2", "Concluído",
                     "Rota do relatório e botão de exportar. Download no navegador testado de "
                     "verdade; caminho do aparelho em simulação. Próximo passo: teste em aparelho."],
                    ["2.3", "Concluído",
                     "Sprint Review e este relatório de status. Data e participantes da revisão: a "
                     "confirmar pelo grupo."],
                    ["2.4", "Concluído",
                     "Documento de encerramento, com entregas, estimado contra real, desempenho por "
                     "integrante e lições aprendidas. Esforço real: a confirmar pelo grupo."],
                    ["2.5", "Concluído",
                     "Dashboard em Python: lê o JSON e gera PNG e HTML com quatro gráficos e o "
                     "resumo. Quatro testes passam."],
                    ["2.6", "Concluído, com ressalvas",
                     "96 testes passam. Cobertura da API acima da meta; a do aplicativo, no escopo "
                     "definido, em 65,8 % de linhas. Integração contínua configurada, ainda não "
                     "executada no GitHub."],
                    ["2.7", "Pendente do grupo",
                     "Roteiro do pitch definido no item 2.7. A gravação com todos os integrantes "
                     "depende do grupo."],
                    ["2.8", "Concluído",
                     "Este documento, com capa, sumário, itens 1.1 a 2.8, código e telas do "
                     "aplicativo e do dashboard. Falta compactar o projeto e enviar pelo "
                     "Blackboard."],
                ],
            }),
            ("tabela", {
                "titulo": "Quadro 16 — Impedimentos e riscos no fechamento",
                "cabecalho": ["Impedimento", "Efeito", "Situação"],
                "pesos": [1.4, 1.6, 1.2],
                "linhas": [
                    ["Sem aparelho físico para teste", "Exportação do JSON no Android e no iOS "
                                                       "ficou só com teste simulado",
                     "Aberto. Fazer um teste rápido em aparelho ou no Expo Go."],
                    ["Mercado Pago só com API simulada", "Nunca houve pagamento real em teste",
                     "Aberto. Nenhuma credencial real entra no repositório."],
                    ["Integração contínua sem execução no GitHub", "Um erro de configuração só "
                                                                   "aparece no primeiro pull request",
                     "Aberto até o primeiro pull request."],
                    ["DER e script SQL desatualizados", "A documentação técnica não correspondia ao "
                                                        "banco",
                     "Resolvido, com teste automatizado."],
                    ["Botão de excluir morto na web", "Exclusão impossível pelo navegador",
                     "Resolvido, com teste de unidade e de ponta a ponta."],
                    ["Trabalho de código concentrado", "Risco de entrega e de avaliação desigual",
                     "Aberto. Quatro integrantes sem commits; o grupo deve registrar o trabalho "
                     "feito fora do código."],
                ],
            }),
            ("p", "Percentual do backlog concluído (estimativa, a confirmar pelo grupo). O backlog "
                  "da Sprint 1 tem 16 itens, PB01 a PB16, somando 82 Story Points. Quinze estão "
                  "entregues por inteiro: 79 de 82 pontos, ou 96,3 %. Os 3 pontos que faltam são o "
                  "PB11, a recuperação de senha, entregue em parte: as telas existem e navegam "
                  "entre si, mas nenhuma chama a API, de modo que não há envio de código por "
                  "e-mail, conferência do código nem gravação da nova senha. A mudança de "
                  "arquitetura da Sprint 2 alterou onde o catálogo vive, não o resultado entregue. "
                  "Os itens da Sprint 2 não receberam pontos; por contagem de itens, são 7 de 8 "
                  "concluídos no repositório — 2.1 a 2.6 e o 2.8, que é esta documentação — e 1 "
                  "pendente do grupo (2.7): 87,5 % por item, sem ponderar esforço. Os dois "
                  "percentuais dependem de o grupo concordar com o que conta como concluído."),
        ],
    },

    # 2.4
    {
        "titulo": "2.4. Documentação de Encerramento e Lições Aprendidas",
        "nivel": 2,
        "blocos": [
            ("p", "Este item fecha as duas Sprints: o que foi entregue, o esforço estimado contra o "
                  "real, o desempenho da equipe conforme o histórico do repositório e as lições "
                  "aprendidas. Onde o dado não foi registrado durante o projeto, está escrito “a "
                  "confirmar pelo grupo”; nenhum número de esforço foi inventado."),
            ("p0", "Entregas:"),
            ("lista", [
                "Sprint 1 (setembro): visão e escopo, planejamento ágil, pesquisa de mercado e "
                "wireframes, aplicativo React Native com Expo e TypeScript, CRUD de produtos, DER, "
                "script SQL, API Node/Express inicial, integração contínua e capturas de evidência.",
                "Entre as Sprints: pedidos e Checkout Pro do Mercado Pago, na API e no aplicativo, "
                "com o primeiro teste de integração.",
                "Sprint 2 (novembro): relatório de vendas em JSON, botão de exportar, dashboard em "
                "Python, 96 testes automatizados em quatro camadas, workflow de integração contínua "
                "com quatro jobs, DER e script SQL corrigidos, correção do botão de excluir na web e "
                "os documentos de plano de testes, Sprint Review, status, encerramento e esta "
                "documentação final.",
                "Fora do que o repositório mostra: o pitch (item 2.7), que é uma gravação do grupo.",
            ]),
            ("p", "Estimado contra real. O backlog da Sprint 1 foi estimado em Story Points por "
                  "Planning Poker, que medem esforço relativo e não horas. O esforço real não foi "
                  "registrado durante o projeto, então a coluna correspondente fica para o grupo "
                  "preencher."),
            ("tabela", {
                "titulo": "Quadro 17 — Estimado contra real, por item do backlog",
                "cabecalho": ["ID", "Item", "Pontos", "Entregue", "Esforço real"],
                "pesos": [0.5, 1.5, 0.6, 0.9, 1.1],
                "linhas": [
                    ["PB01", "Login e sessão", "3", "Sim", "a confirmar"],
                    ["PB02", "Cadastro de usuário", "5", "Sim", "a confirmar"],
                    ["PB03", "Listagem de produtos", "5", "Sim", "a confirmar"],
                    ["PB04", "Detalhe do produto", "3", "Sim", "a confirmar"],
                    ["PB05", "Carrinho de compras", "8", "Sim", "a confirmar"],
                    ["PB06", "Checkout e pagamento", "8", "Sim", "a confirmar"],
                    ["PB07", "CRUD de produtos", "8", "Sim", "a confirmar"],
                    ["PB08", "Busca e filtros", "5", "Sim", "a confirmar"],
                    ["PB09", "Endereços", "5", "Sim", "a confirmar"],
                    ["PB10", "Pedidos", "5", "Sim", "a confirmar"],
                    ["PB11", "Recuperação de senha", "3", "Parcial — fluxo de telas, sem "
                     "back-end", "a confirmar"],
                    ["PB12", "DER e script SQL", "5", "Sim, corrigido na Sprint 2", "a confirmar"],
                    ["PB13", "API Node inicial", "8", "Sim", "a confirmar"],
                    ["PB14", "SQLite local", "5", "Sim na Sprint 1; hoje o banco é o da API, "
                     "não há banco local no aplicativo", "a confirmar"],
                    ["PB15", "Wireframes e fluxo", "3", "Sim", "a confirmar"],
                    ["PB16", "Riscos e status", "3", "Sim", "a confirmar"],
                    ["", "Total", "82", "", ""],
                ],
            }),
            ("p", "Três desvios em relação ao planejado, todos medidos pelo repositório: o catálogo "
                  "saiu do SQLite dentro do aplicativo e passou a vir da API, o modelo de dados "
                  "teve de ser refeito porque descrevia tabelas que nunca existiram no banco real, "
                  "e o PB11 ficou nas telas, sem back-end."),
            ("p", "Desempenho da equipe. A contagem abaixo vem do histórico do repositório. Commit "
                  "mede apenas trabalho de código e documentação versionados: reunião, pesquisa e "
                  "escrita fora do repositório não aparecem aqui e devem ser acrescentadas pelo "
                  "grupo."),
            ("tabela", {
                "titulo": "Quadro 18 — Participação por integrante, conforme o repositório",
                "cabecalho": ["Integrante", "Commits (aprox.)", "Contribuição"],
                "pesos": [1.5, 0.9, 1.9],
                "linhas": [
                    ["Pedro Henrique Teixeira Silva", "5 de conteúdo, mais 2 merges",
                     "Criou o projeto e o aplicativo base; faz o merge dos pull requests. Os "
                     "commits de conteúdo estão em duas contas que o grupo atribui à mesma pessoa; "
                     "quem contar no GitHub vê sete, porque os dois merges também contam."],
                    ["Gustavo Oliveira Fernandes de Andrade", "cerca de 30",
                     "Sprint 1: catálogo vindo do banco, CRUD de produtos, DER, script SQL, API Node "
                     "inicial, integração contínua e captura de evidências."],
                    ["Vinicius Soares Inocencio", "cerca de 6",
                     "Pedidos e Checkout Pro do Mercado Pago, na API e no aplicativo, e o primeiro "
                     "teste de integração."],
                    ["Leandro Sato", "mais de 10, ainda crescendo",
                     "Sprint 2: testes das três camadas, relatório em JSON, dashboard e "
                     "documentação. É o único número que continua subindo, porque os commits que "
                     "geram e corrigem este documento também são dele."],
                    ["Eduardo Campos Medeiros", "0", "Sem commits no repositório."],
                    ["João Pedro Cavanhas Colombo", "0", "Sem commits no repositório."],
                    ["Ryan Silva Santos", "0", "Sem commits no repositório."],
                    ["Nicolas Thomaz Pinheiro", "0", "Sem commits no repositório."],
                ],
            }),
            ("nota", "A contagem foi feita no repositório durante a escrita desta documentação e é "
                     "aproximada de propósito: o número exato muda a cada commit. Commit de merge "
                     "não é trabalho de conteúdo, mas aparece no total que o GitHub mostra."),
            ("p", "Leitura honesta do quadro: o código foi escrito por quatro dos oito integrantes, "
                  "com a maior parte do histórico da Sprint 1 em um só. Qualquer contribuição dos "
                  "outros quatro integrantes fora do repositório precisa ser registrada pelo grupo "
                  "antes da entrega."),
            ("p0", "Lições aprendidas do projeto:"),
            ("numerada", [
                "Conferir a documentação contra o código. O DER e o script SQL descreviam tabelas de "
                "serviços e agendamentos enquanto o banco real era outro. O erro vinha da Sprint 1 e "
                "só apareceu quando o modelo foi comparado com o banco. Hoje um teste compara os "
                "dois.",
                "Testar na plataforma que o usuário usa. O botão de excluir não funcionava na web "
                "porque Alert.alert não existe no react-native-web. Quando um recurso depende da "
                "plataforma, o teste precisa cobrir cada uma.",
                "Separar regra de rota. Mover validação de produto, validação de endereço e cotação "
                "do carrinho para um módulo próprio permitiu testá-las sem subir o servidor.",
                "Simulação tem limite e precisa ser declarada. O Mercado Pago e o sistema de "
                "arquivos do aparelho foram simulados nos testes; o plano de testes diz com clareza "
                "o que isso deixa sem verificação.",
                "Cobertura mede o que se instrumenta. A cobertura do aplicativo no escopo da meta "
                "ficou em 65,8 % de linhas, e os testes de ponta a ponta, que exercitam a maioria "
                "das telas, não entram na medição. Número baixo não significa tela sem teste, mas "
                "também não prova que está coberta.",
                "Registrar o esforço enquanto acontece. Para esforço real e participação isso não "
                "foi feito, e hoje o estimado contra o real depende da memória do grupo.",
                "Distribuir o código. Quatro integrantes sem commits é risco de projeto e de "
                "avaliação. Cada integrante deveria ter pelo menos uma tarefa de código ou de teste "
                "desde o planejamento.",
                "Validar os requisitos do roteiro antes de congelar a arquitetura — lição da Sprint "
                "1 que continuou valendo: a mudança do catálogo local para a API é parte do mesmo "
                "problema.",
            ]),
        ],
    },

    # 2.5
    {
        "titulo": "2.5. Dashboard em Python",
        "nivel": 2,
        "blocos": [
            ("p", "O dashboard é um programa em Python que lê o JSON exportado pelo aplicativo e "
                  "gera o painel de vendas. Ele não acessa banco nem rede: recebe o arquivo e "
                  "produz dois resultados, um PNG com os quatro gráficos e um HTML autossuficiente "
                  "com o mesmo painel mais os números do resumo em texto. Usa matplotlib para os "
                  "gráficos e pandas para ordenar e converter as datas."),
            ("p0", "O painel traz, em um retângulo de dois por dois:"),
            ("lista", [
                "Faturamento por dia, em linha, com o aviso de que inclui o frete.",
                "Ranking de produtos, em barras horizontais, sem frete.",
                "Vendas por categoria, em barras, sem frete.",
                "Pedidos por estado de pagamento, em barras horizontais.",
            ]),
            ("p", "Todas as barras trazem o valor escrito ao lado, de modo que o painel continua "
                  "legível impresso em preto e branco. O cabeçalho mostra pedidos, faturamento, "
                  "ticket médio, itens vendidos e clientes. Quando o relatório não tem vendas no "
                  "período, cada gráfico mostra “Sem vendas no período” em vez de falhar."),
            ("p", "Como executar: instalar as dependências listadas em dashboard/requirements.txt e "
                  "rodar python -I gerar_dashboard.py --entrada vendas.json --saida saida/. O "
                  "repositório traz um arquivo de exemplo, dashboard/exemplo-vendas.json, com dados "
                  "fictícios no formato da rota real, para que o painel possa ser gerado e testado "
                  "sem um banco com vendas."),
            ("p", "O painel apresentado na Figura C.1 foi gerado a partir desse arquivo de exemplo. "
                  "Os valores ali são fictícios e servem para demonstrar o painel, não para "
                  "representar vendas reais do projeto. O código do gerador está no Anexo A e os "
                  "quatro testes do dashboard estão descritos no item 2.6."),
        ],
    },

    # 2.6
    {
        "titulo": "2.6. Testes",
        "nivel": 2,
        "blocos": [
            ("p", "Esta seção diz o que foi testado, com qual ferramenta, em qual camada e com que "
                  "resultado — e diz também o que não foi testado. Todos os números abaixo foram "
                  "medidos por execução na máquina de desenvolvimento."),
            ("tabela", {
                "titulo": "Quadro 19 — Camadas de teste",
                "cabecalho": ["Camada", "Ferramenta", "Onde está", "Testes", "Resultado"],
                "pesos": [1.3, 1.1, 1.1, 0.5, 0.6],
                "linhas": [
                    ["Unitária do aplicativo", "Jest e Testing Library", "tests/unit (9 arquivos)",
                     "39", "passam"],
                    ["Unitária e de integração da API", "node:test com SQLite temporário",
                     "backend/test (5 arquivos)", "47", "passam"],
                    ["Ponta a ponta", "Playwright na build web", "tests/e2e", "6", "passam"],
                    ["Dashboard em Python", "unittest", "dashboard/", "4", "passam"],
                    ["Total", "", "", "96", "passam"],
                ],
            }),
            ("p", "Os seis testes de ponta a ponta levam cerca de 31 segundos e rodam contra a API "
                  "real em banco temporário, nunca contra o banco de desenvolvimento. Como executar: "
                  "npm test (aplicativo), npm run test:api (API) e npm run test:e2e (ponta a ponta), "
                  "todos na raiz, e python -I -m unittest dentro de dashboard/. O workflow de "
                  "integração contínua roda as quatro camadas em pull request, cada uma em um job "
                  "separado."),
            ("tabela", {
                "titulo": "Quadro 20 — Critérios de aceite e testes que os cobrem",
                "cabecalho": ["Critério", "Teste que o cobre", "Resultado"],
                "pesos": [1.5, 1.9, 0.8],
                "linhas": [
                    ["CA-01 O subtotal usa o preço promocional",
                     "Unidade do carrinho e do card de produto; regra de cotação na API", "Passa"],
                    ["CA-02 O preço do banco prevalece sobre o enviado pelo cliente",
                     "Regra de cotação, integração da API e checkout", "Passa"],
                    ["CA-03 Cliente comum recebe 403 ao criar, alterar ou excluir produto",
                     "Integração da API, conferindo que o produto continua igual depois", "Passa"],
                    ["CA-04 CEP inválido: erro 400 e nenhum pedido gravado",
                     "Integração da API e validação de endereço", "Passa"],
                    ["CA-05 Webhook sem assinatura válida: 401 e pedido não aprovado",
                     "Integração do checkout e unidade da assinatura do Mercado Pago", "Passa"],
                    ["CA-06 Total do checkout igual ao da cotação da API",
                     "Ponta a ponta: visitante cria conta, monta a sacola e confere o total",
                     "Passa"],
                    ["CA-07 Administrador insere, altera, consulta e exclui pela tela",
                     "Ponta a ponta na tela, mais unidade da confirmação e do cliente do CRUD",
                     "Passa"],
                    ["CA-08 Relatório de vendas: JSON para admin, 403 para cliente, 401 para anônimo",
                     "Integração da API e unidade do relatório (faturamento, séries, fuso)", "Passa"],
                    ["CA-09 Botão de exportar entrega o JSON e mostra erro sem travar",
                     "Unidade da tela e da exportação; ponta a ponta confere o arquivo baixado",
                     "Passa no navegador; caminho de aparelho só simulado"],
                    ["CA-10 Dashboard gera PNG e HTML com os gráficos e o resumo",
                     "Testes do dashboard em Python, inclusive relatório vazio e JSON incompleto",
                     "Passa"],
                    ["CA-11 PDF final com a estrutura e a formatação do roteiro",
                     "docs/entrega-final/test_documento.py: capa, sumário, fontes, margens, seções e "
                     "integridade do texto, mais leitura visual",
                     "Passa"],
                    ["CA-12 Modelo de dados e banco real coincidem",
                     "Integração da API: cria o script em memória e compara tabelas, colunas, tipos "
                     "e chaves com o banco real", "Passa"],
                    ["CA-13 Integração contínua roda as camadas em pull request",
                     "Workflow com quatro jobs", "Configurado; ainda não executado no GitHub"],
                ],
            }),
            ("p", "Cobertura medida. A meta escrita antes da medição era de 70 % de linhas na API e "
                  "60 % nos módulos do aplicativo que não são telas."),
            ("tabela", {
                "titulo": "Quadro 21 — Cobertura de linhas",
                "cabecalho": ["Parte", "Linhas", "Observação"],
                "pesos": [1.2, 1.1, 1.9],
                "linhas": [
                    ["API", "87,4 % a 100 % por arquivo",
                     "Meta de 70 % atingida. Relatório e regras em 100 %; o servidor, com 87,4 % de "
                     "linhas, é o menor."],
                    ["Aplicativo, escopo da meta", "65,8 %",
                     "Meta de 60 % atingida. Módulos de carrinho, armazenamento, cliente da API, "
                     "exportação e componentes."],
                    ["Aplicativo, pasta src inteira", "32,1 %",
                     "Só informação: inclui as telas, que nunca estiveram no escopo da meta."],
                ],
            }),
            ("p", "Dentro do escopo da meta, o módulo do carrinho e o da exportação têm 100 %, assim "
                  "como os componentes de botão, campo, card de produto e moldura de tela. Ficaram "
                  "sem cobertura o cabeçalho e o rodapé e parte do módulo de armazenamento. As telas "
                  "(Carrinho, Checkout, Pedidos, Perfil, Cadastro, Endereços e outras) não têm teste "
                  "de unidade: elas são percorridas pelos fluxos de ponta a ponta, mas o Playwright "
                  "roda a build web sem instrumentação de cobertura, então esse esforço não aparece "
                  "em nenhum dos dois números."),
            ("p0", "O que não foi testado:"),
            ("lista", [
                "Pagamento real no Mercado Pago. Todos os testes usam a API do Mercado Pago "
                "simulada; nenhuma credencial real está no repositório, e o fluxo de compra para na "
                "tela de checkout.",
                "Gravação de arquivo em aparelho físico. A exportação do JSON no Android e no iOS só "
                "foi exercitada com o módulo de arquivos simulado. O download no navegador foi "
                "exercitado de verdade.",
                "Aplicativo nativo em emulador. Os testes de ponta a ponta rodam na build web, no "
                "Chromium; comportamento específico de Android e iOS não está coberto.",
                "Execução da integração contínua no GitHub. O workflow não rodou antes desta "
                "entrega; a versão do Python do job do dashboard é um ponto a conferir na primeira "
                "execução.",
            ]),
            ("p0", "O que não se aplica a esta entrega:"),
            ("lista", [
                "Teste de desempenho e de estresse com JMeter: a API é um protótipo acadêmico com "
                "banco local e não há carga esperada nem meta de tempo de resposta escrita. Um teste "
                "de carga sem meta não teria contra o que ser comparado, e o roteiro da Sprint 2 "
                "pede testes unitários, de integração e de ponta a ponta.",
                "Teste de usabilidade com pessoas: não houve recrutamento de usuários nem roteiro de "
                "observação, e o prazo da Sprint não comportava. Os fluxos de ponta a ponta "
                "verificam que o caminho principal funciona, o que não substitui observar pessoas "
                "usando o aplicativo.",
            ]),
            ("p0", "Defeitos encontrados pelos testes nesta Sprint:"),
            ("numerada", [
                "Botão de excluir produto não fazia nada na build web, porque a confirmação usava "
                "uma função que o react-native-web ignora. Corrigido com confirmação por plataforma "
                "e coberto por teste.",
                "DER e script SQL descreviam um modelo que não existe: falavam de serviços e "
                "agendamentos e não tinham pedidos nem pagamentos. Os dois foram reescritos a partir "
                "do banco real, e o teste do CA-12 impede que voltem a divergir.",
            ]),
        ],
    },

    # 2.7
    {
        "titulo": "2.7. Apresentação Final e Demonstração do Produto (Pitch)",
        "nivel": 2,
        "blocos": [
            ("p", "O roteiro pede um pitch de demonstração das funcionalidades — código, telas e "
                  "testes ao vivo — com a participação de todos os integrantes e o rosto de cada um "
                  "aparecendo, em no máximo dez minutos. A gravação é uma pendência do grupo; o que "
                  "está definido aqui é o roteiro combinado, com quem apresenta cada parte e o que "
                  "deve estar na tela em cada momento."),
            ("tabela", {
                "titulo": "Quadro 22 — Roteiro do pitch (10 minutos)",
                "cabecalho": ["Tempo", "Quem apresenta", "O que mostra ao vivo"],
                "pesos": [0.8, 1.5, 2.4],
                "linhas": [
                    ["0:00 a 1:00", "Pedro Henrique Teixeira Silva",
                     "Abertura: o problema, o produto e o escopo das duas Sprints."],
                    ["1:00 a 2:00", "Eduardo Campos Medeiros",
                     "Planejamento ágil: backlog, Story Points e o que foi entregue em cada Sprint."],
                    ["2:00 a 3:30", "Ryan Silva Santos",
                     "Telas do cliente no aplicativo: Home, Produtos, detalhe, sacola e checkout."],
                    ["3:30 a 5:00", "Vinicius Soares Inocencio",
                     "Pagamento: criação do pedido, Checkout Pro do Mercado Pago e confirmação só "
                     "por pagamento validado; código da reconciliação e do webhook."],
                    ["5:00 a 6:00", "Gustavo Oliveira Fernandes de Andrade",
                     "CRUD de produtos pela tela Gerenciar produtos: inserir, consultar, alterar e "
                     "excluir, com a API respondendo."],
                    ["6:00 a 7:00", "João Pedro Cavanhas Colombo",
                     "Banco de dados: as seis tabelas, o script SQL e o teste que compara o script "
                     "com o banco real."],
                    ["7:00 a 8:00", "Nicolas Thomaz Pinheiro",
                     "Geração do JSON: botão de exportar, arquivo baixado e os campos do relatório."],
                    ["8:00 a 9:00", "Leandro Sato",
                     "Testes rodando ao vivo nas quatro camadas e o painel do dashboard em Python."],
                    ["9:00 a 10:00", "Todos os integrantes",
                     "Fechamento: o que ficou pronto, o que não foi testado e as lições aprendidas."],
                ],
            }),
            ("nota", "A divisão acima é a proposta do grupo e pode ser ajustada; a exigência que não "
                     "muda é a participação de todos, com o rosto aparecendo, e o limite de dez "
                     "minutos."),
            ("p0", "Checklist antes de gravar:"),
            ("lista", [
                "Subir a API com o arquivo de variáveis de ambiente preenchido e o aplicativo pelo "
                "Expo.",
                "Deixar o aplicativo com catálogo semeado e uma conta de administrador pronta.",
                "Testar o áudio e o compartilhamento de tela de cada integrante antes da gravação.",
                "Mostrar o código em tela cheia, com fonte grande o bastante para ser lida no vídeo.",
                "Conferir que a gravação ficou abaixo de dez minutos antes de enviar.",
            ]),
        ],
    },

    # 2.8
    {
        "titulo": "2.8. Requisitos da Entrega",
        "nivel": 2,
        "blocos": [
            ("p", "O roteiro define o que a entrega final precisa conter e como ela é enviada: "
                  "somente pelo Blackboard, em arquivo único compactado."),
            ("p", "Antes de enviar, o grupo ainda precisa gravar o pitch conforme o roteiro do item "
                  "2.7, compactar o projeto inteiro em um único arquivo, com este PDF incluído, e "
                  "enviar pelo Blackboard dentro do prazo. O PDF e o programa que o gera estão "
                  "versionados no repositório, em docs/entrega-final/, para que o pacote seja um "
                  "só."),
            ("p", "O quadro abaixo relaciona cada exigência com o lugar em que ela está "
                  "atendida."),
            ("tabela", {
                "titulo": "Quadro 23 — Exigências da entrega e onde elas estão",
                "cabecalho": ["Exigência do roteiro", "Onde está", "Situação"],
                "pesos": [1.3, 1.9, 1.0],
                "linhas": [
                    ["Documentação em PDF", "Este documento", "Atendido"],
                    ["Capa", "Primeira página, com instituição, disciplina, projeto, integrantes com "
                             "RA e cidade e ano", "Atendido"],
                    ["Índice com todos os itens", "Sumário, com os itens 1.1 a 1.6 e 2.1 a 2.8",
                     "Atendido"],
                    ["Tudo o que já foi entregue", "Itens 1.1 a 1.6, revisados, e itens 2.1 a 2.8",
                     "Atendido"],
                    ["Código e telas do aplicativo", "Anexo A (código) e Anexo B (sete telas em "
                                                     "oito figuras)", "Atendido"],
                    ["Código e telas do dashboard", "Anexo A (código) e Anexo C (painel gerado)",
                     "Atendido"],
                    ["Mínimo de seis telas", "Anexo B: Home, Produtos, detalhe, sacola, login, "
                                             "checkout e Gerenciar produtos", "Atendido"],
                    ["Cadastro com inserir, alterar, excluir e consultar", "Item 2.1 e Figuras B.7 e "
                                                                           "B.8; coberto por teste",
                     "Atendido"],
                    ["Carrinho de compras", "Item 2.1 e Figura B.4", "Atendido"],
                    ["Pitch", "Item 2.7 traz o roteiro", "Pendente: gravação do grupo"],
                    ["Projeto zipado", "Repositório do grupo, com aplicativo, API, dashboard, testes "
                                       "e este PDF", "Pendente: compactar e enviar"],
                ],
            }),
        ],
    },

    # ------------------------------------------------------------------- Conclusão
    {
        "titulo": "CONCLUSÃO",
        "nivel": 1,
        "blocos": [
            ("p", "O Galeria Seleta Mobile chega ao fim do semestre como um e-commerce que funciona "
                  "de ponta a ponta: o cliente cria a conta, navega pelo catálogo que vem da API, "
                  "monta a sacola, informa o endereço, vê o total calculado no servidor e é levado "
                  "ao Checkout Pro do Mercado Pago; o administrador mantém o catálogo pelo próprio "
                  "aplicativo e exporta os dados de vendas em JSON, que o dashboard em Python "
                  "transforma em painel. As duas Sprints do roteiro foram percorridas até o fim, "
                  "com uma ressalva que o Quadro 17 registra: 79 dos 82 Story Points do backlog da "
                  "Sprint 1 estão entregues por inteiro, e os 3 restantes são a recuperação de "
                  "senha, que ficou no fluxo de telas, sem back-end. Os itens 1.1 a 1.6 foram "
                  "revisados nesta entrega, com as correções do que mudou desde setembro, e o item "
                  "2.7, o pitch, depende de gravação do grupo."),
            ("p", "O que sustenta essa leitura são 96 testes automatizados em quatro camadas, "
                  "todos passando: 39 de unidade no aplicativo, 47 na API, 6 de ponta a ponta na "
                  "build web contra a API real e 4 no dashboard. A cobertura de linhas ficou acima "
                  "da meta nas duas partes em que a meta foi escrita: a API entre 87,4 % e 100 % por "
                  "arquivo, e os módulos do aplicativo no escopo definido em 65,8 %. Dois defeitos "
                  "reais apareceram por causa dos testes e foram corrigidos: o botão de excluir "
                  "produto, que não fazia nada no navegador, e o modelo de dados, que descrevia "
                  "tabelas inexistentes."),
            ("p", "Também é honesto dizer o que não está provado. Nenhum pagamento real foi "
                  "processado: o Mercado Pago aparece nos testes como serviço simulado. A gravação "
                  "do arquivo exportado em aparelho físico não foi exercitada, só o download no "
                  "navegador. Os testes de ponta a ponta rodam na build web, não em emulador "
                  "Android, e o workflow de integração contínua ainda não teve sua primeira execução "
                  "no GitHub. O pitch depende de gravação do grupo. Esses quatro pontos são o que "
                  "falta para o projeto poder ser chamado de pronto para uso real."),
            ("p", "A lição que o grupo leva é menos sobre tecnologia e mais sobre registro. O erro "
                  "mais caro do semestre não foi de código: foi uma documentação técnica que ficou "
                  "desatualizada por duas Sprints sem que ninguém percebesse, e só apareceu quando "
                  "foi comparada com o banco por um teste. Do mesmo modo, o esforço real e o "
                  "trabalho feito fora do repositório ficaram sem registro no momento em que "
                  "aconteceram, e hoje dependem da memória do grupo. Escrever enquanto se faz custa "
                  "pouco; reconstruir depois custa caro."),
        ],
    },

    # ----------------------------------------------------------------- Bibliografia
    {
        "titulo": "BIBLIOGRAFIA",
        "nivel": 1,
        "blocos": [
            ("ref", "SENAC. PI IV — Desenvolvimento para Dispositivos Móveis: roteiro do projeto. "
                    "São Paulo: Centro Universitário Senac, 2026."),
            ("ref", "GRUPO 11. Galeria Seleta Mobile. Repositório GitHub. Disponível em: "
                    "https://github.com/0-PedroHenrique-0/Galeria-Seleta-Mobile. Acesso em: 23 nov. "
                    "2026."),
            ("ref", "ENJOEI. Sobre o que é o Enjoei. Disponível em: https://www.enjoei.com.br/ajuda/"
                    "sobre-o-enjoei/sobre-o-que-e-o-enjoei. Acesso em: 27 set. 2026."),
            ("ref", "ASTERIC. Loja oficial de streetwear. Disponível em: https://www.asteric.com.br/. "
                    "Acesso em: 27 set. 2026."),
            ("ref", "SCRUM GUIDES. The Scrum Guide. Disponível em: https://scrumguides.org/. Acesso "
                    "em: 27 set. 2026."),
            ("ref", "REACT NATIVE. Documentação oficial. Disponível em: https://reactnative.dev/. "
                    "Acesso em: 23 nov. 2026."),
            ("ref", "EXPO. Documentação oficial. Disponível em: https://docs.expo.dev/. Acesso em: "
                    "23 nov. 2026."),
            ("ref", "NODE.JS. SQLite API (node:sqlite). Disponível em: https://nodejs.org/api/"
                    "sqlite.html. Acesso em: 23 nov. 2026."),
            ("ref", "EXPRESS. Guia da API. Disponível em: https://expressjs.com/. Acesso em: 23 nov. "
                    "2026."),
            # A quebra de linha antes da URL evita que ela se parta no meio do domínio.
            ("ref", "MERCADO PAGO. Checkout Pro: criar preferência de pagamento. Disponível em:\n"
                    "https://www.mercadopago.com.br/developers/pt/docs/\n"
                    "checkout-pro-preferences/create-payment-preference.\n"
                    "Acesso em: 23 nov. 2026."),
            ("ref", "MERCADO PAGO. Notificações de pagamento (webhooks). Disponível em:\n"
                    "https://www.mercadopago.com.br/developers/pt/docs/\n"
                    "checkout-pro-preferences/payment-notifications.\n"
                    "Acesso em: 23 nov. 2026."),
            ("ref", "JEST. Documentação oficial. Disponível em: https://jestjs.io/. Acesso em: 23 "
                    "nov. 2026."),
            ("ref", "PLAYWRIGHT. Documentação oficial. Disponível em: https://playwright.dev/. "
                    "Acesso em: 23 nov. 2026."),
            ("ref", "MATPLOTLIB. Documentação oficial. Disponível em: https://matplotlib.org/. "
                    "Acesso em: 23 nov. 2026."),
            ("ref", "PANDAS. Documentação oficial. Disponível em: https://pandas.pydata.org/docs/. "
                    "Acesso em: 23 nov. 2026."),
        ],
    },

    # --------------------------------------------------------------------- Anexos
    {
        "titulo": "ANEXOS",
        "nivel": 1,
        "blocos": [
            ("p", "Os anexos trazem o código que sustenta os itens 2.1, 2.2, 2.5 e 2.6, as telas do "
                  "aplicativo em execução, o painel do dashboard e a auditoria do roteiro item por "
                  "item. Os trechos de código foram escolhidos pelo que importa para a avaliação; o "
                  "código completo está no repositório do grupo."),
        ],
    },

    {
        "titulo": "Anexo A — Código do aplicativo, da API e do dashboard",
        "nivel": 2,
        "blocos": [
            ("p0", "A.1 Relatório de vendas na API (backend/src/reports.js). Monta o JSON consumido "
                   "pelo dashboard. Só pedido aprovado entra no faturamento e o dia segue o horário "
                   "de Brasília."),
            ("codigo", {
                "titulo": None,
                "linhas": [
                    "export function salesReport(db, { from, to } = {}) {",
                    "  const de = parseDate(from, 'from');",
                    "  const ate = parseDate(to, 'to');",
                    "  if (de && ate && de > ate)",
                    "    throw new HttpError(400, 'Período inválido: a data inicial vem depois da final.');",
                    "  const range = `AND (? IS NULL OR date(o.created_at, '-03:00') >= ?)",
                    "                 AND (? IS NULL OR date(o.created_at, '-03:00') <= ?)`;",
                    "  const args = [de, de, ate, ate];",
                    "  const approved = `o.payment_status = 'APROVADO' ${range}`;",
                    "",
                    "  const total = db.prepare(`SELECT COUNT(*) AS pedidos,",
                    "    COALESCE(SUM(o.total_cents), 0) AS cents,",
                    "    COUNT(DISTINCT o.user_id) AS clientes",
                    "    FROM orders o WHERE ${approved}`).get(...args);",
                    "  const porDia = db.prepare(`SELECT date(o.created_at, '-03:00') AS data,",
                    "    COUNT(*) AS pedidos, SUM(o.total_cents) AS cents",
                    "    FROM orders o WHERE ${approved} GROUP BY data ORDER BY data ASC`).all(...args);",
                    "",
                    "  // ... as consultas de itens, de categorias, de status e de produtos seguem o",
                    "  // mesmo padrão e estão no arquivo completo.",
                    "  ...",
                    "",
                    "  return {",
                    "    geradoEm: new Date().toISOString(),",
                    "    periodo: { de, ate },",
                    "    resumo: {",
                    "      pedidos: total.pedidos, faturamento: reais(total.cents),",
                    "      ticketMedio: total.pedidos ? reais(total.cents / total.pedidos) : 0,",
                    "      itensVendidos: itens, clientes: total.clientes,",
                    "    },",
                    "    porDia: porDia.map(r => ({ data: r.data, pedidos: r.pedidos,",
                    "      faturamento: reais(r.cents) })),",
                    "    porCategoria: porCategoria.map(r => ({ categoria: r.categoria,",
                    "      itens: r.itens, faturamento: reais(r.cents) })),",
                    "    porStatus: porStatus.map(r => ({ status: r.status, pedidos: r.pedidos })),",
                    "    produtos: produtos.map(r => ({ id: r.id, nome: r.nome, itens: r.itens,",
                    "      faturamento: reais(r.cents) })),",
                    "  };",
                    "}",
                ],
            }),
            ("p0", "A.2 Botão de exportar dados. Na tela Gerenciar produtos "
                   "(src/screens/ProductAdminScreen.tsx), o botão pede o relatório à API e entrega o "
                   "arquivo, com os três estados visíveis ao usuário."),
            ("codigo", {
                "titulo": None,
                "linhas": [
                    "async function exportData() {",
                    "  setExporting(true);",
                    "  setExportError('');",
                    "  setExportedFile('');",
                    "  try {",
                    "    setExportedFile(await exportSalesReport(await getSalesReportApi()));",
                    "  } catch (e) {",
                    "    setExportError(e instanceof Error ? e.message : 'Não foi possível exportar os dados.');",
                    "  } finally {",
                    "    setExporting(false);",
                    "  }",
                    "}",
                    "",
                    "<View style={styles.exportCard}>",
                    "  <Text style={styles.sectionTitle}>DADOS DE VENDAS</Text>",
                    "  <Text style={styles.exportHint}>Gera um arquivo JSON com o resumo das vendas,",
                    "    para o dashboard.</Text>",
                    "  {exportError ? <Text style={styles.error}>{exportError}</Text> : null}",
                    "  {exportedFile ? <Text style={styles.exportDone}>Arquivo gerado: {exportedFile}</Text> : null}",
                    "  {exporting",
                    "    ? <Text style={styles.exportHint}>Gerando arquivo...</Text>",
                    "    : <Button label=\"EXPORTAR DADOS (JSON)\" secondary onPress={exportData} />}",
                    "</View>",
                ],
            }),
            ("p0", "A entrega do arquivo (src/reportExport.ts) muda conforme a plataforma: no "
                   "navegador é um download, no aparelho é gravação em disco com compartilhamento."),
            ("codigo", {
                "titulo": None,
                "linhas": [
                    "export async function exportSalesReport(report: SalesReport): Promise<string> {",
                    "  const fileName = reportFileName(report);",
                    "  const content = JSON.stringify(report, null, 2);",
                    "",
                    "  if (Platform.OS === 'web') {",
                    "    const url = URL.createObjectURL(new Blob([content], { type: MIME }));",
                    "    const link = document.createElement('a');",
                    "    link.href = url;",
                    "    link.download = fileName;",
                    "    document.body.appendChild(link);",
                    "    link.click();",
                    "    link.remove();",
                    "    URL.revokeObjectURL(url);",
                    "    return fileName;",
                    "  }",
                    "",
                    "  const file = new File(Paths.document, fileName);",
                    "  file.create({ overwrite: true });",
                    "  file.write(content);",
                    "  if (await Sharing.isAvailableAsync()) {",
                    "    await Sharing.shareAsync(file.uri, { mimeType: MIME,",
                    "      dialogTitle: 'Exportar dados de vendas', UTI: 'public.json' });",
                    "  }",
                    "  return fileName;",
                    "}",
                ],
            }),
            ("p0", "A.3 Um teste de cada camada. Unidade do aplicativo "
                   "(tests/unit/cart.test.ts): o subtotal usa o preço promocional e a quantidade "
                   "respeita o estoque."),
            ("codigo", {
                "titulo": None,
                "linhas": [
                    "const promo: CartItem = { ...base, id: 1, name: 'Camisa', price: 189.9,",
                    "  discountPrice: 149.9, stock: 10, size: 'M', quantity: 2 };",
                    "const regular: CartItem = { ...base, id: 2, name: 'Calça', price: 99.9,",
                    "  stock: 5, size: 'G', quantity: 1 };",
                    "",
                    "test('subtotal usa o preço promocional quando existe', () => {",
                    "  expect(cartSubtotal([promo, regular])).toBeCloseTo(399.7, 2);",
                    "});",
                    "",
                    "test('changeQuantity respeita o estoque como teto', () => {",
                    "  const full = { ...promo, quantity: 10 };",
                    "  expect(changeQuantity([full], 1, 'M', 1)[0].quantity).toBe(10);",
                    "});",
                ],
            }),
            ("p0", "Integração da API (backend/test/api.test.js): cliente comum não altera o "
                   "catálogo, e o produto continua igual depois da tentativa."),
            ("codigo", {
                "titulo": None,
                "linhas": [
                    "test('cliente comum não cria, não altera e não exclui produto', async () => {",
                    "  const { token } = await signup('comum@example.com');",
                    "  assert.equal((await call('/api/products', 'POST', productBody, token)).status, 403);",
                    "  assert.equal((await call('/api/products/1', 'PUT', productBody, token)).status, 403);",
                    "  assert.equal((await call('/api/products/1', 'DELETE', null, token)).status, 403);",
                    "  assert.equal((await call('/api/products/1')).body.name, 'Moletom Oversized');",
                    "});",
                ],
            }),
            ("p0", "Ponta a ponta (tests/e2e/compra.spec.ts): o total mostrado no checkout é o "
                   "mesmo que a API respondeu à própria página."),
            ("codigo", {
                "titulo": None,
                "linhas": [
                    "test('visitante cria conta, monta o carrinho e vê no checkout o total da API',",
                    "  async ({ page, request }) => {",
                    "  const produtos = await (await request.get(`${API_URL}/api/products`)).json();",
                    "  const produto = produtos.find(p => p.name === PRODUTO_DO_CATALOGO);",
                    "  const precoUnitario = produto.discountPrice ?? produto.price;",
                    "",
                    "  await abrirApp(page);",
                    "  await cadastrar(page, emailUnico('compra'));",
                    "  await adicionarProdutoNaSacola(page);",
                    "  await cadastrarEndereco(page);",
                    "  await irParaAba(page, 'Carrinho');",
                    "",
                    "  const cotacao = page.waitForResponse(r => r.url().endsWith('/api/checkout/quote'));",
                    "  await texto(page, 'FINALIZAR COMPRA').click();",
                    "  const { total, subtotal } = await (await cotacao).json();",
                    "  expect(subtotal).toBeCloseTo(precoUnitario, 2);",
                    "  await expect.poll(async () =>",
                    "    normalizar(await page.getByTestId('checkout-total').textContent())",
                    "  ).toBe(brl(total));",
                    "});",
                ],
            }),
            ("p0", "Dashboard em Python (dashboard/test_gerar_dashboard.py): o HTML gerado traz os "
                   "números do resumo formatados em reais e o aviso sobre o frete."),
            ("codigo", {
                "titulo": None,
                "linhas": [
                    "def test_html_traz_os_numeros_do_resumo(self):",
                    "    relatorio = gerar_dashboard.carregar(EXEMPLO)",
                    "    with tempfile.TemporaryDirectory() as pasta:",
                    "        arquivos = gerar_dashboard.gerar(relatorio, Path(pasta))",
                    "        html = arquivos[\"html\"].read_text(encoding=\"utf-8\")",
                    "    resumo = relatorio[\"resumo\"]",
                    "    faturamento = gerar_dashboard.moeda(resumo[\"faturamento\"])",
                    "    ticket = gerar_dashboard.moeda(resumo[\"ticketMedio\"])",
                    "    self.assertIn(faturamento, html)",
                    "    self.assertIn(ticket, html)",
                    "    self.assertRegex(faturamento, r\"^R\\$ \\d{1,3}(\\.\\d{3})*,\\d{2}$\")",
                    "    self.assertIn(\"incluem o frete\", html)",
                    "    self.assertIn(\"sem frete\", html)",
                ],
            }),
            ("p0", "A.4 Gerador do dashboard (dashboard/gerar_dashboard.py). Lê o JSON, confere os "
                   "campos obrigatórios, formata os valores em reais e monta o painel em PNG e HTML."),
            ("codigo", {
                "titulo": None,
                "linhas": [
                    "CAMPOS_OBRIGATORIOS = (\"resumo\", \"porDia\", \"porCategoria\", \"porStatus\", \"produtos\")",
                    "",
                    "def carregar(caminho):",
                    "    \"\"\"Lê o JSON do relatório e confere se os campos obrigatórios existem.\"\"\"",
                    "    with open(caminho, encoding=\"utf-8\") as arquivo:",
                    "        relatorio = json.load(arquivo)",
                    "    if not isinstance(relatorio, dict):",
                    "        raise ValueError(\"O arquivo não tem o formato do relatório de vendas.\")",
                    "    for campo in CAMPOS_OBRIGATORIOS:",
                    "        if campo not in relatorio:",
                    "            raise ValueError(f\"Campo obrigatório ausente no JSON: '{campo}'.\")",
                    "    return relatorio",
                    "",
                    "def moeda(valor):",
                    "    \"\"\"Formata em reais, no padrão brasileiro: R$ 1.234,50.\"\"\"",
                    "    texto = f\"{valor:,.2f}\"",
                    "    return \"R$ \" + texto.replace(\",\", \"@\").replace(\".\", \",\").replace(\"@\", \".\")",
                    "",
                    "def montar_figura(relatorio):",
                    "    # Figura pequena de propósito: impressa no documento final, cada ponto de fonte",
                    "    # daqui vale cerca de 0,6 ponto no papel, e nada pode sair abaixo de 6 pontos.",
                    "    figura, eixos = plt.subplots(2, 2, figsize=(10, 7.2), facecolor=FUNDO)",
                    "    figura.subplots_adjust(top=0.76, bottom=0.14, left=0.13, right=0.97,",
                    "                           hspace=0.55, wspace=0.42)",
                    "    desenhar_cabecalho(figura, relatorio)",
                    "    grafico_faturamento_por_dia(eixos[0][0], relatorio[\"porDia\"])",
                    "    grafico_ranking_de_produtos(eixos[0][1], relatorio[\"produtos\"])",
                    "    grafico_vendas_por_categoria(eixos[1][0], relatorio[\"porCategoria\"])",
                    "    grafico_pedidos_por_status(eixos[1][1], relatorio[\"porStatus\"])",
                    "    figura.text(0.03, 0.015, textwrap.fill(AVISO_FRETE, 95),",
                    "                color=TEXTO_SECUNDARIO, fontsize=10, va=\"bottom\", linespacing=1.4)",
                    "    return figura",
                    "",
                    "def gerar(relatorio, destino):",
                    "    \"\"\"Cria dashboard.png e dashboard.html em `destino` e devolve os caminhos.\"\"\"",
                    "    destino = Path(destino)",
                    "    destino.mkdir(parents=True, exist_ok=True)",
                    "    caminho_png = destino / \"dashboard.png\"",
                    "    caminho_html = destino / \"dashboard.html\"",
                    "",
                    "    figura = montar_figura(relatorio)",
                    "    figura.savefig(caminho_png, dpi=160, facecolor=FUNDO)",
                    "    plt.close(figura)",
                    "",
                    "    caminho_html.write_text(montar_html(relatorio, caminho_png), encoding=\"utf-8\")",
                    "    return {\"png\": caminho_png, \"html\": caminho_html}",
                ],
            }),
        ],
    },

    {
        "titulo": "Anexo B — Telas do aplicativo em execução",
        "nivel": 2,
        "blocos": [
            ("p", "As figuras abaixo foram capturadas automaticamente da build web do aplicativo, em "
                  "largura de celular (390 pontos), com a API respondendo em banco temporário. São "
                  "as telas reais em execução, não maquetes. São oito figuras de sete telas: a "
                  "tela Gerenciar produtos, por ser alta, aparece em duas, o formulário de cadastro "
                  "e a lista do catálogo com o botão de exportar. O programa que as captura está em "
                  "scripts/capturar-telas.mjs."),
            ("imagem", {"arquivo": "img/01-home.png", "altura_cm": 17.0,
                        "legenda": "Figura B.1 — Home: identidade visual, busca, navegação superior "
                                   "e abas inferiores."}),
            ("imagem", {"arquivo": "img/02-produtos.png", "altura_cm": 17.0,
                        "legenda": "Figura B.2 — Produtos: contagem de peças, ordenação, filtros por "
                                   "categoria e cards com preço promocional."}),
            ("imagem", {"arquivo": "img/03-detalhe-produto.png", "altura_cm": 17.0,
                        "legenda": "Figura B.3 — Detalhe do produto: descrição, tamanhos e ação de "
                                   "adicionar ao carrinho."}),
            ("imagem", {"arquivo": "img/04-carrinho.png", "altura_cm": 17.0,
                        "legenda": "Figura B.4 — Sacola de compras: item, tamanho, quantidade, "
                                   "subtotal e chamada para o checkout."}),
            ("imagem", {"arquivo": "img/05-login.png", "altura_cm": 17.0,
                        "legenda": "Figura B.5 — Login: campos de e-mail e senha e atalho para criar "
                                   "conta."}),
            ("imagem", {"arquivo": "img/06-checkout.png", "altura_cm": 17.0,
                        "legenda": "Figura B.6 — Checkout: endereço, opções de frete, resumo com "
                                   "total calculado pela API e pagamento pelo Mercado Pago."}),
            ("imagem", {"arquivo": "img/07-gerenciar-cadastro.png", "altura_cm": 17.0,
                        "legenda": "Figura B.7 — Gerenciar produtos, topo da tela: formulário de "
                                   "cadastro usado para inserir um produto e, ao tocar no lápis da "
                                   "lista, para alterar o produto escolhido."}),
            ("imagem", {"arquivo": "img/08-gerenciar-lista.png", "altura_cm": 17.0,
                        "legenda": "Figura B.8 — Gerenciar produtos, mesma tela mais abaixo: cartão "
                                   "de dados de vendas com o botão de exportar e a lista do "
                                   "catálogo, em que cada produto traz os botões de alterar e "
                                   "excluir."}),
        ],
    },

    {
        "titulo": "Anexo C — Painel do dashboard",
        "nivel": 2,
        "blocos": [
            ("p", "O painel abaixo foi gerado pelo programa em Python a partir do arquivo de exemplo "
                  "versionado no repositório, cujos dados são fictícios. O mesmo programa gera uma "
                  "versão em HTML, com os números do resumo em texto, útil para leitura na tela."),
            # 11,5 cm de altura dão 16 cm de largura, a mancha inteira: na figura o menor texto
            # tem 10 pontos e, nessa escala, chega ao papel com mais de 6.
            ("imagem", {"arquivo": "img/09-dashboard.png", "altura_cm": 11.5,
                        "legenda": "Figura C.1 — Painel de vendas: faturamento por dia, ranking de "
                                   "produtos, vendas por categoria e pedidos por estado de "
                                   "pagamento, com o resumo no cabeçalho."}),
        ],
    },

    {
        "titulo": "Anexo D — Auditoria do roteiro, item por item",
        "nivel": 2,
        "blocos": [
            ("p", "O quadro final compara cada exigência do roteiro com o lugar deste documento ou "
                  "do repositório em que ela é atendida."),
            ("tabela", {
                "titulo": "Quadro 24 — Auditoria final",
                "cabecalho": ["Exigência do roteiro", "Onde está", "Situação"],
                "pesos": [1.5, 1.6, 1.1],
                "linhas": [
                    ["1.1 Escopo, requisitos e histórias", "Item 1.1", "Atendido"],
                    ["1.2 Planejamento ágil e backlog", "Item 1.2", "Atendido"],
                    ["1.3 Pesquisa de mercado e wireframes", "Item 1.3 e Anexo B", "Atendido"],
                    ["1.4 Ambiente e interface inicial", "Item 1.4 e Anexo B", "Atendido"],
                    ["1.5 DER, script SQL, Node e banco", "Item 1.5 e Anexo A",
                     "Atendido, com o modelo corrigido"],
                    ["1.6 Status, riscos e Sprint Review", "Item 1.6", "Atendido"],
                    ["2.1 CRUD e integração com a API", "Item 2.1 e Anexo A", "Atendido"],
                    ["2.2 Gerar dados em JSON", "Item 2.2, Anexo A e Figura B.8", "Atendido"],
                    ["2.3 Sprint Review e relatório de status", "Item 2.3", "Atendido"],
                    ["2.4 Encerramento e lições aprendidas", "Item 2.4", "Atendido"],
                    ["2.5 Dashboard em Python", "Item 2.5, Anexo A e Anexo C", "Atendido"],
                    ["2.6 Testes unitários, de integração e E2E", "Item 2.6",
                     "Atendido: 96 testes passam"],
                    ["2.7 Pitch de demonstração", "Item 2.7",
                     "Roteiro pronto; gravação pendente do grupo"],
                    ["2.8 Requisitos da entrega", "Item 2.8",
                     "Atendido; falta compactar e enviar"],
                    ["Mínimo de seis telas", "Anexo B: sete telas em oito figuras", "Atendido"],
                    ["CRUD completo de cadastro", "Item 2.1, Figuras B.7 e B.8 e testes do CA-07",
                     "Atendido"],
                    ["Carrinho de compras", "Item 2.1 e Figura B.4", "Atendido"],
                    ["Integração com o Mercado Pago", "Item 2.1",
                     "Atendido com API simulada; sem pagamento real"],
                    ["Capa, sumário, introdução, desenvolvimento, conclusão, bibliografia e anexos",
                     "Estrutura deste documento", "Atendido"],
                    ["Margens 3 cm à esquerda e 2 cm nas demais", "Diagramação deste documento",
                     "Atendido, conferido por programa"],
                    ["Verdana, texto 10 e títulos 12 em negrito", "Diagramação deste documento",
                     "Atendido, conferido por programa"],
                    ["Espaçamento 1,5 e parágrafo com recuo de 2 cm", "Diagramação deste documento",
                     "Atendido"],
                    ["Todos os itens no sumário, em ordem cronológica", "Sumário",
                     "Atendido, conferido por programa"],
                ],
            }),
        ],
    },
]
