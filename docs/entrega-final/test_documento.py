"""Conferência do documento final em PDF contra a formatação exigida pelo roteiro.

Lê o PDF gerado por `gerar_documento.py` e verifica capa, sumário, fontes, tamanhos,
margens, seções obrigatórias e integridade do texto acentuado e das tabelas longas.

Rodar: cd docs/entrega-final && python -I -m unittest -v
"""
import re
import unittest
from pathlib import Path

from pypdf import PdfReader
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont

PDF = Path(__file__).parent / "Entrega-Final-PI-IV-Galeria-Seleta.pdf"

CM = 28.3464567  # 1 cm em pontos
TOLERANCIA = 0.2 * CM  # 2 mm
MARGEM_ESQUERDA = 3 * CM
MARGEM_DEMAIS = 2 * CM

ITENS_DO_ROTEIRO = [
    "1.1.", "1.2.", "1.3.", "1.4.", "1.5.", "1.6.",
    "2.1.", "2.2.", "2.3.", "2.4.", "2.5.", "2.6.", "2.7.", "2.8.",
]

INTEGRANTES = [
    ("EDUARDO CAMPOS MEDEIROS", "1143154427"),
    ("PEDRO HENRIQUE TEIXEIRA SILVA", "1143155053"),
    ("GUSTAVO OLIVEIRA FERNANDES DE ANDRADE", "1142439157"),
    ("JOAO PEDRO CAVANHAS COLOMBO", "1143032617"),
    ("LEANDRO SATO", "1142446679"),
    ("RYAN SILVA SANTOS", "1142463435"),
    ("VINICIUS SOARES INOCENCIO", "1142945398"),
    ("NICOLAS THOMAZ PINHEIRO", "1142440716"),
]

FONTES_ACEITAS = {"Verdana", "Verdana-Bold", "Verdana-Italic", "Courier"}
RODAPE = re.compile(r"^Página \d+$")

_paginas = None


def registrar_verdana():
    """Registra Verdana para medir a largura do texto extraído."""
    if "Verdana" in pdfmetrics.getRegisteredFontNames():
        return
    fontes = Path("C:/Windows/Fonts")
    pdfmetrics.registerFont(TTFont("Verdana", fontes / "verdana.ttf"))
    pdfmetrics.registerFont(TTFont("Verdana-Bold", fontes / "verdanab.ttf"))


def ler_paginas():
    """Lê o PDF uma vez e devolve, por página, os pedaços de texto com fonte, tamanho e posição."""
    global _paginas
    if _paginas is not None:
        return _paginas
    if not PDF.exists():
        raise AssertionError(f"O PDF ainda não existe: {PDF}. Rode `python -I gerar_documento.py`.")
    registrar_verdana()
    leitor = PdfReader(str(PDF))
    paginas = []
    for pagina in leitor.pages:
        pedacos = []

        def visitar(texto, cm, tm, dicionario, tamanho, pedacos=pedacos):
            if not texto or not texto.strip():
                return
            nome = "?"
            if dicionario:
                base = dicionario.get("/BaseFont", "")
                nome = str(base).lstrip("/").split("+")[-1]
            # A posição na página é a soma da matriz do conteúdo com a do texto.
            escala = abs((cm[3] if cm else 1) * (tm[3] if tm else 1)) or 1
            pedacos.append({
                "texto": texto.strip(),
                "fonte": nome,
                "tamanho": round((tamanho or 0) * escala, 1),
                "x": round((cm[4] if cm else 0) + (tm[4] if tm else 0), 2),
                "y": round((cm[5] if cm else 0) + (tm[5] if tm else 0), 2),
            })

        pagina.extract_text(visitor_text=visitar)
        paginas.append({
            "pedacos": pedacos,
            "largura": float(pagina.mediabox.width),
            "altura": float(pagina.mediabox.height),
            "imagens": len(pagina.images),
        })
    _paginas = paginas
    return _paginas


def texto_da_pagina(pagina):
    return re.sub(r"\s+", " ", " ".join(p["texto"] for p in pagina["pedacos"]))


def texto_inteiro():
    return " ".join(texto_da_pagina(pagina) for pagina in ler_paginas())


def titulos(pagina):
    """Títulos da página: Verdana negrito em 12."""
    return [p["texto"] for p in pagina["pedacos"] if p["fonte"] == "Verdana-Bold" and p["tamanho"] == 12.0]


def paginas_do_sumario():
    """Páginas entre o título SUMÁRIO e o título da introdução."""
    paginas = ler_paginas()
    inicio = next(i for i, p in enumerate(paginas) if any("SUMÁRIO" in t for t in titulos(p)))
    fim = next(i for i, p in enumerate(paginas) if any(t.startswith("INTRODUÇÃO") for t in titulos(p)))
    return paginas[inicio:fim]


class CapaTest(unittest.TestCase):
    def test_capa_tem_instituicao_disciplina_integrantes_e_cidade(self):
        capa = ler_paginas()[0]
        texto = texto_da_pagina(capa)
        self.assertIn("CENTRO UNIVERSITÁRIO SENAC", texto)
        self.assertIn("PI IV", texto)
        self.assertIn("DESENVOLVIMENTO PARA DISPOSITIVOS MÓVEIS", texto)
        self.assertIn("GALERIA SELETA MOBILE", texto)
        for nome, ra in INTEGRANTES:
            self.assertIn(nome, texto, f"integrante ausente na capa: {nome}")
            self.assertIn(ra, texto, f"RA ausente na capa: {ra}")
        self.assertIn("São Paulo", texto)
        self.assertIn("2026", texto)
        # A capa é a única página sem numeração.
        self.assertFalse([p for p in capa["pedacos"] if RODAPE.match(p["texto"])])


class SumarioTest(unittest.TestCase):
    def test_sumario_lista_itens_1_1_a_2_8(self):
        texto = re.sub(r"\s+", " ", " ".join(texto_da_pagina(p) for p in paginas_do_sumario()))
        posicoes = []
        for item in ITENS_DO_ROTEIRO:
            posicao = texto.find(item)
            self.assertNotEqual(posicao, -1, f"item {item} ausente do sumário")
            posicoes.append(posicao)
        self.assertEqual(posicoes, sorted(posicoes), "itens fora da ordem cronológica no sumário")
        minusculo = texto.lower()
        for parte in ("introdução", "desenvolvimento do projeto", "conclusão", "bibliografia", "anexo"):
            self.assertIn(parte, minusculo, f"parte ausente do sumário: {parte}")

    def test_itens_do_roteiro_estao_no_corpo_e_em_ordem(self):
        encontrados = []
        for pagina in ler_paginas()[len(paginas_do_sumario()) + 1:]:
            for titulo in titulos(pagina):
                for item in ITENS_DO_ROTEIRO:
                    if titulo.startswith(item):
                        encontrados.append(item)
        self.assertEqual(encontrados, ITENS_DO_ROTEIRO)


class FormatacaoTest(unittest.TestCase):
    def test_texto_usa_verdana_em_10_e_titulos_em_12(self):
        contagem = {}
        for pagina in ler_paginas():
            for pedaco in pagina["pedacos"]:
                chave = (pedaco["fonte"], pedaco["tamanho"])
                contagem[chave] = contagem.get(chave, 0) + len(pedaco["texto"])

        fontes = {fonte for fonte, _ in contagem}
        self.assertTrue(fontes <= FONTES_ACEITAS, f"fontes inesperadas: {fontes - FONTES_ACEITAS}")

        mais_usada = max(contagem, key=contagem.get)
        self.assertEqual(mais_usada, ("Verdana", 10.0), "o corpo do texto deveria ser Verdana 10")

        titulos_12 = sum(1 for pagina in ler_paginas() for t in titulos(pagina))
        self.assertGreaterEqual(titulos_12, 20, "poucos títulos em Verdana negrito 12")

        tamanhos_verdana = {tamanho for fonte, tamanho in contagem if fonte.startswith("Verdana")}
        self.assertTrue(tamanhos_verdana <= {10.0, 12.0},
                        f"texto em Verdana fora de 10 e 12: {sorted(tamanhos_verdana)}")

    def test_margens_batem_com_o_roteiro(self):
        paginas = ler_paginas()
        esquerdas = []
        for numero, pagina in enumerate(paginas, start=1):
            direita_limite = pagina["largura"] - MARGEM_DEMAIS + TOLERANCIA
            topo_limite = pagina["altura"] - MARGEM_DEMAIS + TOLERANCIA
            for pedaco in pagina["pedacos"]:
                if RODAPE.match(pedaco["texto"]):
                    continue  # a numeração fica na área do rodapé, abaixo da margem inferior
                self.assertGreaterEqual(
                    pedaco["x"], MARGEM_ESQUERDA - TOLERANCIA,
                    f"página {numero}: texto começa antes da margem esquerda ({pedaco['texto'][:40]!r})")
                esquerdas.append(pedaco["x"])
                fonte = pedaco["fonte"] if pedaco["fonte"] in ("Verdana", "Verdana-Bold", "Courier") else "Verdana"
                largura = pdfmetrics.stringWidth(pedaco["texto"], fonte, pedaco["tamanho"])
                self.assertLessEqual(
                    pedaco["x"] + largura, direita_limite,
                    f"página {numero}: texto passa da margem direita ({pedaco['texto'][:40]!r})")
                self.assertGreaterEqual(
                    pedaco["y"], MARGEM_DEMAIS - TOLERANCIA,
                    f"página {numero}: texto abaixo da margem inferior ({pedaco['texto'][:40]!r})")
                self.assertLessEqual(
                    pedaco["y"] + pedaco["tamanho"], topo_limite,
                    f"página {numero}: texto acima da margem superior ({pedaco['texto'][:40]!r})")

        self.assertAlmostEqual(min(esquerdas), MARGEM_ESQUERDA, delta=TOLERANCIA,
                               msg="a margem esquerda deveria ser de 3 cm")

    def test_todas_as_paginas_menos_a_capa_tem_numero(self):
        paginas = ler_paginas()
        for numero, pagina in enumerate(paginas[1:], start=2):
            rodapes = [p["texto"] for p in pagina["pedacos"] if RODAPE.match(p["texto"])]
            self.assertEqual(rodapes, [f"Página {numero}"], f"numeração errada na página {numero}")


class EstruturaTest(unittest.TestCase):
    def test_secoes_obrigatorias_existem(self):
        todos = [t for pagina in ler_paginas() for t in titulos(pagina)]
        for secao in ("INTRODUÇÃO (ESCOPO)", "DESENVOLVIMENTO DO PROJETO", "CONCLUSÃO", "BIBLIOGRAFIA", "ANEXOS"):
            self.assertTrue(any(t.startswith(secao) for t in todos), f"seção ausente: {secao}")

    def test_anexos_trazem_as_telas_do_aplicativo_e_do_dashboard(self):
        paginas = ler_paginas()
        imagens = sum(pagina["imagens"] for pagina in paginas)
        self.assertGreaterEqual(imagens, 9, "faltam telas do aplicativo ou o painel do dashboard nos anexos")
        texto = texto_inteiro()
        for figura in ("Figura B.1", "Figura B.7", "Figura B.8", "Figura C.1"):
            self.assertIn(figura, texto, f"legenda ausente: {figura}")


class IntegridadeTest(unittest.TestCase):
    def test_nenhum_caractere_perdido_em_texto_acentuado_e_tabela_longa(self):
        texto = texto_inteiro()
        for palavra in ("São Paulo", "integração", "código", "Estatística", "Lições aprendidas",
                        "não foi testado", "Análise de Dados", "exclusão", "cobertura"):
            self.assertIn(palavra, texto, f"texto acentuado perdido ou alterado: {palavra}")
        self.assertNotIn("\ufffd", texto, "caractere de substituição no PDF")
        for mojibake in ("Ã£", "Ã§", "Ãµ", "Â "):
            self.assertNotIn(mojibake, texto, f"texto com codificação quebrada: {mojibake}")

        # Tabelas longas: a primeira e a última linha precisam sobreviver à quebra de página.
        for celula in ("PB01", "PB16", "CA-01", "CA-13", "R01", "R07", "2.8"):
            self.assertIn(celula, texto, f"linha de tabela perdida: {celula}")


if __name__ == "__main__":
    unittest.main()
