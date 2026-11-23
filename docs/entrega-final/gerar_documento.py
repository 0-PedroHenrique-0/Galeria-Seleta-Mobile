# -*- coding: utf-8 -*-
"""Gera o PDF da entrega final do PI IV — Galeria Seleta Mobile.

Só diagramação: o texto está em conteudo.py.
Formatação exigida pelo roteiro e aplicada aqui:
    margens de 2 cm (superior, inferior e direita) e 3 cm à esquerda;
    Verdana 10 no texto e Verdana 12 em negrito nos títulos;
    espaçamento entre linhas de 1,5 (entrelinha de 15 pontos para corpo de 10);
    recuo de primeira linha de 2 cm nos parágrafos;
    numeração de página no rodapé, em todas as páginas menos a capa.

Rodar: cd docs/entrega-final && python -I gerar_documento.py
"""
import sys
from pathlib import Path
from xml.sax.saxutils import escape

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_JUSTIFY, TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.units import cm
from reportlab.lib.utils import ImageReader
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import (BaseDocTemplate, Frame, Image, KeepTogether, LongTable, NextPageTemplate,
                                PageBreak, PageTemplate, Paragraph, Preformatted, Spacer, TableStyle)
from reportlab.platypus.tableofcontents import TableOfContents

PASTA = Path(__file__).parent
# Em modo isolado (python -I) a pasta do script não entra no caminho de importação.
sys.path.insert(0, str(PASTA))

import conteudo  # noqa: E402  (precisa do caminho acima)

SAIDA = PASTA / "Entrega-Final-PI-IV-Galeria-Seleta.pdf"
FONTES_DO_SISTEMA = Path("C:/Windows/Fonts")

MARGEM_ESQUERDA = 3 * cm
MARGEM_DIREITA = 2 * cm
MARGEM_SUPERIOR = 2 * cm
MARGEM_INFERIOR = 2 * cm
RECUO_DE_PARAGRAFO = 2 * cm
ENTRELINHA = 15  # 1,5 para texto de 10 pontos

CINZA_DA_GRADE = colors.HexColor("#9A9A9A")
CINZA_DO_CABECALHO = colors.HexColor("#E6E6E6")
CINZA_DO_CODIGO = colors.HexColor("#F2F2F2")


def registrar_fontes():
    """Registra Verdana a partir das fontes do Windows."""
    pdfmetrics.registerFont(TTFont("Verdana", FONTES_DO_SISTEMA / "verdana.ttf"))
    pdfmetrics.registerFont(TTFont("Verdana-Bold", FONTES_DO_SISTEMA / "verdanab.ttf"))
    pdfmetrics.registerFont(TTFont("Verdana-Italic", FONTES_DO_SISTEMA / "verdanai.ttf"))
    pdfmetrics.registerFontFamily("Verdana", normal="Verdana", bold="Verdana-Bold",
                                  italic="Verdana-Italic", boldItalic="Verdana-Bold")


ESTILOS = {
    "texto": ParagraphStyle("texto", fontName="Verdana", fontSize=10, leading=ENTRELINHA,
                            alignment=TA_JUSTIFY, firstLineIndent=RECUO_DE_PARAGRAFO, spaceAfter=6),
    "texto_sem_recuo": ParagraphStyle("texto_sem_recuo", fontName="Verdana", fontSize=10,
                                      leading=ENTRELINHA, alignment=TA_JUSTIFY, spaceAfter=6),
    "nota": ParagraphStyle("nota", fontName="Verdana-Italic", fontSize=10, leading=ENTRELINHA,
                           alignment=TA_JUSTIFY, spaceAfter=8),
    "item": ParagraphStyle("item", fontName="Verdana", fontSize=10, leading=ENTRELINHA,
                           alignment=TA_JUSTIFY, leftIndent=0.9 * cm, bulletIndent=0.3 * cm,
                           bulletFontName="Verdana", bulletFontSize=10, spaceAfter=4),
    "referencia": ParagraphStyle("referencia", fontName="Verdana", fontSize=10, leading=ENTRELINHA,
                                 alignment=TA_LEFT, spaceAfter=10),
    "titulo1": ParagraphStyle("titulo1", fontName="Verdana-Bold", fontSize=12, leading=18,
                              spaceBefore=4, spaceAfter=12, keepWithNext=1),
    "titulo2": ParagraphStyle("titulo2", fontName="Verdana-Bold", fontSize=12, leading=18,
                              spaceBefore=16, spaceAfter=10, keepWithNext=1),
    "titulo_sem_indice": ParagraphStyle("titulo_sem_indice", fontName="Verdana-Bold", fontSize=12,
                                        leading=18, spaceBefore=4, spaceAfter=14),
    "legenda_de_tabela": ParagraphStyle("legenda_de_tabela", fontName="Verdana-Italic", fontSize=10,
                                        leading=13, alignment=TA_LEFT, spaceAfter=0),
    "legenda_de_figura": ParagraphStyle("legenda_de_figura", fontName="Verdana-Italic", fontSize=10,
                                        leading=13, alignment=TA_CENTER, spaceBefore=6,
                                        spaceAfter=16),
    "celula": ParagraphStyle("celula", fontName="Verdana", fontSize=10, leading=13),
    "celula_do_cabecalho": ParagraphStyle("celula_do_cabecalho", fontName="Verdana-Bold",
                                          fontSize=10, leading=13),
    "codigo": ParagraphStyle("codigo", fontName="Courier", fontSize=7.5, leading=10),
    # Capa: só os tamanhos previstos no roteiro, 12 em negrito e 10 no texto.
    "capa_destaque": ParagraphStyle("capa_destaque", fontName="Verdana-Bold", fontSize=12,
                                    leading=20, alignment=TA_CENTER),
    "capa_texto": ParagraphStyle("capa_texto", fontName="Verdana", fontSize=10, leading=ENTRELINHA,
                                 alignment=TA_CENTER),
}

# A legenda é a primeira linha da tabela, não um parágrafo solto: assim a tabela pode
# quebrar entre páginas sem deixar a legenda órfã, e a legenda se repete na continuação.
ESTILO_DE_TABELA = TableStyle([
    ("FONT", (0, 0), (-1, -1), "Verdana", 10),
    ("VALIGN", (0, 0), (-1, -1), "TOP"),
    ("SPAN", (0, 0), (-1, 0)),
    ("LEFTPADDING", (0, 0), (0, 0), 0),
    ("BOTTOMPADDING", (0, 0), (-1, 0), 5),
    ("GRID", (0, 1), (-1, -1), 0.4, CINZA_DA_GRADE),
    ("BACKGROUND", (0, 1), (-1, 1), CINZA_DO_CABECALHO),
    ("LEFTPADDING", (0, 1), (-1, -1), 5),
    ("RIGHTPADDING", (0, 1), (-1, -1), 5),
    ("TOPPADDING", (0, 1), (-1, -1), 4),
    ("BOTTOMPADDING", (0, 1), (-1, -1), 4),
])

ESTILO_DO_CODIGO = TableStyle([
    ("BACKGROUND", (0, 0), (-1, -1), CINZA_DO_CODIGO),
    ("BOX", (0, 0), (-1, -1), 0.4, CINZA_DA_GRADE),
    ("LEFTPADDING", (0, 0), (-1, -1), 6),
    ("RIGHTPADDING", (0, 0), (-1, -1), 6),
    ("TOPPADDING", (0, 0), (-1, -1), 6),
    ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
])


def largura_util():
    return A4[0] - MARGEM_ESQUERDA - MARGEM_DIREITA


def paragrafo(texto, estilo, **extras):
    # Uma quebra de linha no texto vira <br/>: serve para a referência bibliográfica
    # não partir a URL no meio do domínio.
    marcado = escape(texto).replace(chr(10), "<br/>")
    return Paragraph(marcado, ESTILOS[estilo], **extras)


class Documento(BaseDocTemplate):
    """Duas páginas-modelo: a capa, sem numeração, e o corpo, com numeração no rodapé."""

    def __init__(self, caminho):
        super().__init__(
            str(caminho), pagesize=A4,
            leftMargin=MARGEM_ESQUERDA, rightMargin=MARGEM_DIREITA,
            topMargin=MARGEM_SUPERIOR, bottomMargin=MARGEM_INFERIOR,
            title="Entrega final — PI IV — Galeria Seleta Mobile",
            author="Grupo 11 — Centro Universitário Senac",
            subject="Projeto Integrador IV — Desenvolvimento para Dispositivos Móveis",
        )
        moldura = Frame(MARGEM_ESQUERDA, MARGEM_INFERIOR, largura_util(),
                        A4[1] - MARGEM_SUPERIOR - MARGEM_INFERIOR, id="corpo",
                        leftPadding=0, rightPadding=0, topPadding=0, bottomPadding=0)
        self.addPageTemplates([
            PageTemplate(id="capa", frames=[moldura]),
            PageTemplate(id="corpo", frames=[moldura], onPage=self.numerar_pagina),
        ])

    @staticmethod
    def numerar_pagina(canvas, documento):
        canvas.saveState()
        canvas.setFont("Verdana", 10)
        canvas.drawCentredString(A4[0] / 2, 1.2 * cm, f"Página {canvas.getPageNumber()}")
        canvas.restoreState()

    def afterFlowable(self, flowable):
        """Alimenta o sumário com os títulos, conforme o nível."""
        if not isinstance(flowable, Paragraph):
            return
        nome = flowable.style.name
        if nome in ("titulo1", "titulo2"):
            nivel = 0 if nome == "titulo1" else 1
            self.notify("TOCEntry", (nivel, flowable.getPlainText(), self.page))


def montar_capa():
    """Instituição no topo, disciplina e projeto no centro, integrantes abaixo, cidade e ano no fim."""
    capa = conteudo.CAPA
    blocos = [
        paragrafo(capa["instituicao"], "capa_destaque"),
        paragrafo(capa["curso"], "capa_texto"),
        Spacer(1, 4.5 * cm),
        paragrafo(capa["disciplina"], "capa_destaque"),
        paragrafo(capa["projeto"], "capa_destaque"),
        paragrafo(capa["entrega"], "capa_texto"),
        paragrafo(capa["grupo"], "capa_texto"),
        Spacer(1, 4 * cm),
    ]
    for nome, ra in capa["integrantes"]:
        blocos.append(paragrafo(f"{nome} — RA: {ra}", "capa_texto"))
    blocos.append(Spacer(1, 6.5 * cm))
    blocos.append(paragrafo(capa["cidade_ano"], "capa_texto"))
    return blocos


def montar_sumario():
    sumario = TableOfContents()
    sumario.levelStyles = [
        ParagraphStyle("sumario1", fontName="Verdana", fontSize=10, leading=ENTRELINHA,
                       leftIndent=0, firstLineIndent=0, spaceAfter=2),
        ParagraphStyle("sumario2", fontName="Verdana", fontSize=10, leading=ENTRELINHA,
                       leftIndent=0.8 * cm, firstLineIndent=0, spaceAfter=2),
    ]
    return [paragrafo(conteudo.TITULO_SUMARIO, "titulo_sem_indice"), sumario]


def montar_tabela(dados):
    """Tabela que quebra entre páginas, repetindo a legenda e o cabeçalho."""
    colunas = len(dados["cabecalho"])
    legenda = dados.get("titulo") or ""
    linhas = [[paragrafo(legenda, "legenda_de_tabela")] + [""] * (colunas - 1)]
    linhas.append([paragrafo(celula, "celula_do_cabecalho") for celula in dados["cabecalho"]])
    for linha in dados["linhas"]:
        linhas.append([paragrafo(celula, "celula") for celula in linha])

    pesos = dados.get("pesos") or [1] * colunas
    total = sum(pesos)
    larguras = [largura_util() * peso / total for peso in pesos]

    tabela = LongTable(linhas, colWidths=larguras, repeatRows=2)
    tabela.setStyle(ESTILO_DE_TABELA)
    return [tabela, Spacer(1, 12)]


def montar_codigo(dados):
    blocos = []
    if dados.get("titulo"):
        blocos.append(paragrafo(dados["titulo"], "legenda_de_tabela"))
    texto = Preformatted("\n".join(dados["linhas"]), ESTILOS["codigo"])
    moldura = LongTable([[texto]], colWidths=[largura_util()])
    moldura.setStyle(ESTILO_DO_CODIGO)
    blocos.append(moldura)
    blocos.append(Spacer(1, 10))
    return blocos


def montar_imagem(dados):
    """Imagem com a altura pedida, sem distorcer e sem passar da largura útil."""
    caminho = PASTA / dados["arquivo"]
    largura_original, altura_original = ImageReader(str(caminho)).getSize()
    altura = dados["altura_cm"] * cm
    largura = altura * largura_original / altura_original
    if largura > largura_util():
        largura = largura_util()
        altura = largura * altura_original / largura_original
    figura = Image(str(caminho), width=largura, height=altura)
    figura.hAlign = "CENTER"
    return [KeepTogether([figura, paragrafo(dados["legenda"], "legenda_de_figura")])]


def montar_bloco(tipo, valor):
    if tipo == "p":
        return [paragrafo(valor, "texto")]
    if tipo == "p0":
        return [paragrafo(valor, "texto_sem_recuo")]
    if tipo == "nota":
        return [paragrafo(valor, "nota")]
    if tipo == "ref":
        return [paragrafo(valor, "referencia")]
    if tipo == "lista":
        return [paragrafo(item, "item", bulletText="•") for item in valor]
    if tipo == "numerada":
        return [paragrafo(item, "item", bulletText=f"{numero}.")
                for numero, item in enumerate(valor, start=1)]
    if tipo == "tabela":
        return montar_tabela(valor)
    if tipo == "codigo":
        return montar_codigo(valor)
    if tipo == "imagem":
        return montar_imagem(valor)
    raise ValueError(f"Tipo de bloco desconhecido: {tipo}")


def montar_corpo():
    historia = []
    for posicao, secao in enumerate(conteudo.SECOES):
        if secao["nivel"] == 1 and posicao > 0:
            historia.append(PageBreak())
        estilo = "titulo1" if secao["nivel"] == 1 else "titulo2"
        historia.append(paragrafo(secao["titulo"], estilo))
        for tipo, valor in secao["blocos"]:
            historia.extend(montar_bloco(tipo, valor))
    return historia


def gerar():
    registrar_fontes()
    historia = montar_capa()
    historia.append(NextPageTemplate("corpo"))
    historia.append(PageBreak())
    historia.extend(montar_sumario())
    historia.append(PageBreak())
    historia.extend(montar_corpo())

    documento = Documento(SAIDA)
    documento.multiBuild(historia)
    return SAIDA


if __name__ == "__main__":
    caminho = gerar()
    print(f"PDF gerado: {caminho}")
