# Documento final da entrega (PDF)

Gera `Entrega-Final-PI-IV-Galeria-Seleta.pdf`, o documento que o grupo envia pelo Blackboard.
O PDF está versionado aqui para que o projeto possa ser compactado em um arquivo único.

## Arquivos

| Arquivo | Para que serve |
| --- | --- |
| `conteudo.py` | O texto do documento, em estruturas Python. Quem for atualizar o documento mexe aqui. |
| `gerar_documento.py` | A diagramação: fontes, margens, espaçamento, tabelas, código e imagens. |
| `test_documento.py` | Confere o PDF gerado contra a formatação exigida pelo roteiro. |
| `requirements.txt` | `reportlab` (gera o PDF) e `pypdf` (lê o PDF nos testes). |
| `img/` | Telas do aplicativo e painel do dashboard usados nos anexos. |

## Como gerar

```bash
pip install -r requirements.txt
cd docs/entrega-final
python -I gerar_documento.py
python -I -m unittest -v
```

O gerador usa as fontes Verdana do Windows (`C:/Windows/Fonts/verdana.ttf`, `verdanab.ttf` e
`verdanai.ttf`). Em outro sistema operacional, aponte `FONTES_DO_SISTEMA`, em
`gerar_documento.py`, para a pasta onde os arquivos estiverem.

## Como refazer as imagens dos anexos

As telas do aplicativo são capturadas da build web, em largura de celular (390 pontos), com a API
rodando em banco temporário:

```bash
cd dashboard && python -I gerar_dashboard.py --entrada exemplo-vendas.json --saida saida/
cd ..
npm run capturar:telas
```

O primeiro comando gera o painel do dashboard (a pasta `dashboard/saida/` é ignorada pelo Git, por
isso o script copia o PNG para `img/`). O segundo sobe a API, gera a build web, serve o site,
fotografa as sete telas (a de Gerenciar produtos em duas fotos) e copia o painel. Depois disso, gere o PDF de novo.

## O que o teste confere

Capa (instituição, disciplina, projeto, os oito integrantes com RA e cidade e ano), sumário com os
itens 1.1 a 2.8 em ordem, os mesmos itens no corpo, Verdana 10 no texto e Verdana 12 em negrito nos
títulos, margens de 3 cm à esquerda e 2 cm nas demais (tolerância de 2 mm, medida pelas coordenadas
do texto extraído), numeração em todas as páginas menos a capa, as seções obrigatórias, as imagens
dos anexos e a integridade do texto acentuado e das tabelas que quebram entre páginas.
